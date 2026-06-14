import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.orgId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { paymentKey, orderId, amount } = body as {
    paymentKey?: string
    orderId?: string
    amount?: number
  }

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: '필수 파라미터가 없습니다.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. pending 결제 레코드 조회 (orderId + orgId 일치 검증)
  const { data: payment, error: fetchErr } = await admin
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .eq('org_id', session.orgId)
    .eq('status', 'pending')
    .single()

  if (fetchErr || !payment) {
    return NextResponse.json({ error: '결제 요청 정보를 찾을 수 없습니다.' }, { status: 404 })
  }

  // 2. 금액 위변조 방지 (서버 계산 금액과 일치 확인)
  if (payment.amount !== amount) {
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 })
  }

  // 3. Toss Payments 결제 확인 API 호출
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: '결제 시스템 설정 오류입니다.' }, { status: 500 })
  }

  const tossRes = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  const tossData = await tossRes.json()

  if (!tossRes.ok) {
    console.error('[payments/confirm] Toss error:', tossData)
    // 결제 실패 상태로 업데이트
    await admin.from('payments').update({
      status:    'failed',
      failed_at: new Date().toISOString(),
    }).eq('order_id', orderId)

    return NextResponse.json(
      { error: tossData.message ?? '결제 확인에 실패했습니다.' },
      { status: 400 }
    )
  }

  // 4. 구독 만료일 계산
  const expiresAt =
    payment.billing_type === 'yearly'
      ? new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() +  31 * 24 * 60 * 60 * 1000).toISOString()

  // 5. payments 레코드 업데이트 (paid)
  await admin.from('payments').update({
    status:         'paid',
    payment_key:    paymentKey,
    payment_method: tossData.method,
    receipt_url:    tossData.receipt?.url ?? null,
    paid_at:        new Date().toISOString(),
  }).eq('order_id', orderId)

  // 6. organizations.plan_id + plan_expires_at 업데이트
  await admin.from('organizations').update({
    plan_id:         payment.plan_id,
    plan_expires_at: expiresAt,
  }).eq('id', session.orgId)

  return NextResponse.json({
    success: true,
    planId:  payment.plan_id,
    receiptUrl: tossData.receipt?.url ?? null,
  })
}
