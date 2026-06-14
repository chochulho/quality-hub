import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { PLAN_LABELS } from '@/lib/auth/grades'

export const metadata = { title: '결제 완료' }

// Toss가 리디렉션 시 쿼리 파라미터로 전달하는 값
interface SearchParams {
  paymentKey?: string
  orderId?:    string
  amount?:     string
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { paymentKey, orderId, amount } = await searchParams

  if (!paymentKey || !orderId || !amount) {
    redirect('/billing/upgrade')
  }

  // 서버에서 결제 확인 호출
  let receiptUrl: string | null = null
  let newPlanId: string | null = null
  let confirmError: string | null = null

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/payments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Server Component에서 호출 시 쿠키 수동 전달 불필요 (같은 서버)
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: parseInt(amount, 10),
      }),
    })
    const data = await res.json()

    if (res.ok) {
      newPlanId   = data.planId
      receiptUrl  = data.receiptUrl
    } else {
      confirmError = data.error ?? '결제 확인에 실패했습니다.'
    }
  } catch {
    confirmError = '결제 확인 중 오류가 발생했습니다.'
  }

  if (confirmError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-destructive font-semibold mb-4">{confirmError}</p>
        <p className="text-sm text-muted-foreground mb-6">
          결제는 완료됐을 수 있습니다. 서비스 요청으로 문의해 주세요.
        </p>
        <Link
          href="/support/request"
          className="inline-flex items-center gap-2 text-brand-orange font-medium hover:underline"
        >
          문의하기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const planLabel = newPlanId
    ? (PLAN_LABELS[newPlanId as keyof typeof PLAN_LABELS] ?? newPlanId)
    : '업그레이드'

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-50 rounded-full p-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
        결제가 완료됐습니다!
      </h1>
      <p className="text-muted-foreground mb-2">
        <strong className="text-foreground">{planLabel}</strong> 플랜이 활성화됐습니다.
      </p>
      <p className="text-sm text-muted-foreground mb-10">
        이제 새로운 도구와 기능을 이용하실 수 있습니다.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-8 py-3.5 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          대시보드로 이동
          <ArrowRight className="h-4 w-4" />
        </Link>
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground rounded-full px-8 py-3.5 font-semibold hover:border-brand-navy transition-all"
          >
            영수증 보기
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}
