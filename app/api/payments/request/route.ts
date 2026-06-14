import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

// VAT 계산 (부가세 10%, 원 단위)
function calcAmounts(supplyPrice: number) {
  const vat = Math.round(supplyPrice * 0.1)
  return {
    amount_supply: supplyPrice,
    amount_vat: vat,
    amount: supplyPrice + vat,
  }
}

// 구독 기간 계산
function calcPeriod(billingType: 'monthly' | 'yearly') {
  const start = new Date()
  const end = new Date(start)
  if (billingType === 'yearly') {
    end.setFullYear(end.getFullYear() + 1)
  } else {
    end.setMonth(end.getMonth() + 1)
  }
  return {
    period_start: start.toISOString().slice(0, 10),
    period_end:   end.toISOString().slice(0, 10),
  }
}

// 주문 ID 생성 (Toss 규격: 6-64자, 영문·숫자·-_)
function generateOrderId(orgId: string) {
  const shortOrg = orgId.replace(/-/g, '').slice(0, 8)
  const ts = Date.now().toString(36)
  return `qmi-${shortOrg}-${ts}`
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.orgId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { planId, billingType } = body as { planId?: string; billingType?: string }

  if (!planId || !['monthly', 'yearly'].includes(billingType ?? '')) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  // 업그레이드만 허용 (현재 플랜 ≥ 요청 플랜 방지)
  const planOrder = ['free', 'starter', 'team', 'business', 'enterprise']
  const currentIdx = planOrder.indexOf(session.planId)
  const targetIdx  = planOrder.indexOf(planId)
  if (targetIdx <= currentIdx) {
    return NextResponse.json({ error: '이미 해당 플랜 이상을 사용 중입니다.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // plans 테이블에서 가격 조회
  const { data: plan, error: planErr } = await admin
    .from('plans')
    .select('id, name, price_krw_monthly, price_krw_yearly')
    .eq('id', planId)
    .single()

  if (planErr || !plan) {
    return NextResponse.json({ error: '플랜 정보를 찾을 수 없습니다.' }, { status: 404 })
  }

  const supplyPrice =
    billingType === 'yearly'
      ? (plan.price_krw_yearly ?? 0)
      : (plan.price_krw_monthly ?? 0)

  if (supplyPrice <= 0) {
    return NextResponse.json({ error: '유효하지 않은 가격입니다.' }, { status: 400 })
  }

  const { amount, amount_supply, amount_vat } = calcAmounts(supplyPrice)
  const { period_start, period_end } = calcPeriod(billingType as 'monthly' | 'yearly')
  const orderId = generateOrderId(session.orgId)
  const orderName = `QMintel ${plan.name} ${billingType === 'yearly' ? '연간' : '월간'} 구독`

  // pending 결제 레코드 생성
  const { error: insertErr } = await admin.from('payments').insert({
    org_id:       session.orgId,
    user_id:      session.id,
    plan_id:      planId,
    billing_type: billingType,
    amount,
    amount_supply,
    amount_vat,
    status:       'pending',
    order_id:     orderId,
    period_start,
    period_end,
  })

  if (insertErr) {
    console.error('[payments/request] insert error:', insertErr)
    return NextResponse.json({ error: '결제 요청 초기화에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ orderId, amount, orderName })
}
