import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export const metadata = { title: '결제 실패' }

interface SearchParams {
  code?:    string
  message?: string
  orderId?: string
}

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { code, message } = await searchParams

  const errorMessage = message ?? '결제가 취소되거나 실패했습니다.'
  const isUserCancel = code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL'

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-red-50 rounded-full p-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
        {isUserCancel ? '결제가 취소됐습니다' : '결제에 실패했습니다'}
      </h1>
      <p className="text-sm text-muted-foreground mb-2">{errorMessage}</p>
      {code && !isUserCancel && (
        <p className="text-xs text-muted-foreground/60 mb-10">오류 코드: {code}</p>
      )}
      {isUserCancel && <div className="mb-10" />}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/billing/upgrade"
          className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-8 py-3.5 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도하기
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 border border-border text-foreground rounded-full px-8 py-3.5 font-semibold hover:border-brand-navy transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로
        </Link>
      </div>

      {!isUserCancel && (
        <p className="mt-8 text-xs text-muted-foreground">
          문제가 반복되면{' '}
          <Link href="/support/request" className="text-brand-orange hover:underline">
            서비스 요청
          </Link>
          으로 문의해 주세요.
        </p>
      )}
    </div>
  )
}
