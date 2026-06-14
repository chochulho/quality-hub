'use client'

import { useState } from 'react'
import Script from 'next/script'
import { ArrowRight, Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  planId: string
  planName: string
  billingType: 'monthly' | 'yearly'
  orgName: string
  isRecommended?: boolean
  label?: string
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TossPayments: (clientKey: string) => any
  }
}

export default function PaymentButton({
  planId,
  planName,
  billingType,
  orgName,
  isRecommended,
  label,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePayment() {
    setError(null)
    setLoading(true)

    try {
      // 1. 서버에 결제 요청 초기화 (orderId, amount 발급)
      const res = await fetch('/api/payments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingType }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '결제 요청에 실패했습니다.')
        setLoading(false)
        return
      }

      const { orderId, amount, orderName } = data as {
        orderId: string
        amount: number
        orderName: string
      }

      // 2. Toss 결제창 호출
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey || !window.TossPayments) {
        setError('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.')
        setLoading(false)
        return
      }

      const toss = window.TossPayments(clientKey)
      await toss.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName: orgName,
        successUrl: `${window.location.origin}/billing/success`,
        failUrl:    `${window.location.origin}/billing/fail`,
      })
    } catch (err: unknown) {
      // Toss SDK가 결제창 이탈 시 에러를 던지는 케이스 — 조용히 처리
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('PAY_PROCESS_CANCELED')) {
        setError('결제 중 오류가 발생했습니다. 다시 시도해 주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toss Payments JS SDK (CDN — npm 설치 불필요) */}
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="lazyOnload"
      />

      <div className="space-y-2">
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition-all ${
            loading
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:-translate-y-0.5 duration-200'
          } ${
            isRecommended
              ? 'bg-brand-orange text-white hover:bg-brand-orange-hover'
              : 'border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              {label ?? `${planName} 업그레이드`}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}
      </div>
    </>
  )
}
