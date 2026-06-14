import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Toss 웹훅 이벤트 타입 (주요 항목)
type TossWebhookEvent =
  | 'PAYMENT_STATUS_CHANGED'
  | 'DEPOSIT_CALLBACK'

interface TossWebhookBody {
  eventType: TossWebhookEvent
  createdAt: string
  data: {
    paymentKey: string
    orderId:    string
    status:     string  // 'DONE' | 'CANCELED' | 'ABORTED' | 'PARTIAL_CANCELED'
    totalAmount?: number
    cancelAmount?: number
    cancels?: Array<{ cancelReason: string; canceledAt: string; cancelAmount: number }>
  }
}

// Toss IP 화이트리스트 (프로덕션 웹훅 발송 IP)
// https://docs.tosspayments.com/reference/using-api/webhook
const TOSS_IPS = new Set([
  '211.249.226.161',
  '211.249.226.162',
  '211.249.226.163',
  '211.249.226.164',
  '211.249.226.165',
])

export async function POST(req: NextRequest) {
  // IP 검증 (프로덕션) — 개발 환경에서는 건너뜀
  if (process.env.NODE_ENV === 'production') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      ''
    if (!TOSS_IPS.has(ip)) {
      console.warn('[payments/webhook] 허용되지 않은 IP:', ip)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => null) as TossWebhookBody | null
  if (!body?.eventType || !body?.data?.orderId) {
    return NextResponse.json({ error: '잘못된 웹훅 데이터' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { orderId, paymentKey, status } = body.data

  if (body.eventType === 'PAYMENT_STATUS_CHANGED') {
    if (status === 'DONE') {
      // 결제 완료 (confirm API에서 이미 처리. 웹훅은 이중 안전망)
      const { data: payment } = await admin
        .from('payments')
        .select('id, org_id, plan_id, billing_type, status')
        .eq('order_id', orderId)
        .single()

      if (payment && payment.status !== 'paid') {
        const expiresAt =
          payment.billing_type === 'yearly'
            ? new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() +  31 * 24 * 60 * 60 * 1000).toISOString()

        await admin.from('payments').update({
          status:      'paid',
          payment_key: paymentKey,
          paid_at:     new Date().toISOString(),
        }).eq('order_id', orderId)

        await admin.from('organizations').update({
          plan_id:         payment.plan_id,
          plan_expires_at: expiresAt,
        }).eq('id', payment.org_id)
      }
    }

    if (status === 'CANCELED' || status === 'PARTIAL_CANCELED') {
      await admin.from('payments').update({
        status: 'cancelled',
      }).eq('order_id', orderId)
    }

    if (status === 'ABORTED') {
      await admin.from('payments').update({
        status:    'failed',
        failed_at: new Date().toISOString(),
      }).eq('order_id', orderId)
    }
  }

  return NextResponse.json({ received: true })
}
