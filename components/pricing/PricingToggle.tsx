'use client'

import { useState } from 'react'

/**
 * 월간/연간 토글 — Client Component.
 * 선택 상태를 data-annual 속성으로 #pricing-cards에 전달.
 * PricingCard는 서버 컴포넌트이므로, 가격 전환은 CSS로 처리.
 */
export default function PricingToggle() {
  const [isAnnual, setIsAnnual] = useState(false)

  function toggle(annual: boolean) {
    setIsAnnual(annual)
    // 카드 내 가격 표시 전환
    document.querySelectorAll('[data-monthly]').forEach((el) => {
      ;(el as HTMLElement).style.display = annual ? 'none' : ''
    })
    document.querySelectorAll('[data-annual]').forEach((el) => {
      ;(el as HTMLElement).style.display = annual ? '' : 'none'
    })
  }

  return (
    <div className="inline-flex items-center gap-1 mt-8 bg-muted rounded-full px-2 py-1.5">
      <button
        onClick={() => toggle(false)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !isAnnual ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        월간 결제
      </button>
      <button
        onClick={() => toggle(true)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isAnnual ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        연간 결제
        <span className="ml-1.5 text-[10px] font-bold bg-brand-orange text-white rounded-full px-1.5 py-0.5">
          2개월 무료
        </span>
      </button>
    </div>
  )
}
