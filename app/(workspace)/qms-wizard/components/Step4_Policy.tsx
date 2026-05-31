"use client"

import { useState } from "react"
import type { WizardState } from "@/types/qmsWizard"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

interface Props {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

const MAX_CHARS = 500

// 샘플 방침 3가지 (AI 없이 즉시 제공)
function getSamplePolicies(state: WizardState): string[] {
  const cert = state.certTarget.join('·')
  const co = state.companyName || '당사'
  return [
    `${co}는 ${cert} 규격에 따라 고객 요구사항을 충족하는 제품과 서비스를 제공하며, 지속적 개선을 통해 고객 만족을 실현합니다.`,
    `${co}는 품질을 최우선 가치로 삼고, 전 임직원의 품질 의식 향상과 프로세스 개선을 통해 고객 신뢰를 확보합니다.`,
    `${co}는 ${cert} 기반의 품질경영시스템을 수립·유지하고, 납기·품질·비용의 균형을 통해 고객 기대를 초과 달성합니다.`,
  ]
}

export default function Step4_Policy({ state, onUpdate, onNext, onPrev }: Props) {
  const [showSamples, setShowSamples] = useState(false)
  const remaining = MAX_CHARS - state.qualityPolicy.length

  return (
    <div className="space-y-6">

      <div>
        <p className="text-sm font-semibold text-foreground mb-1">품질방침</p>
        <p className="text-xs text-muted-foreground mb-4" style={{ wordBreak: 'keep-all' }}>
          비워두면 기본 템플릿으로 생성됩니다. 직접 입력하거나 샘플을 선택하세요.
        </p>
        <textarea
          value={state.qualityPolicy}
          onChange={e => onUpdate({ qualityPolicy: e.target.value.slice(0, MAX_CHARS) })}
          rows={5}
          placeholder="예: 당사는 고객 요구사항을 충족하는 제품을 제공하며…"
          className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-navy transition-colors"
          style={{ wordBreak: 'keep-all' }}
        />
        <div className="flex justify-between mt-1">
          <button
            type="button"
            onClick={() => setShowSamples(s => !s)}
            className="inline-flex items-center gap-1.5 text-xs text-brand-orange font-medium hover:text-brand-orange-hover transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            샘플 방침 {showSamples ? '닫기' : '보기'}
          </button>
          <span className={`text-xs ${remaining < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {remaining}자 남음
          </span>
        </div>
      </div>

      {/* 샘플 방침 패널 */}
      {showSamples && (
        <div className="space-y-2">
          {getSamplePolicies(state).map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onUpdate({ qualityPolicy: sample }); setShowSamples(false) }}
              className="w-full text-left rounded-xl border border-border p-4 text-sm text-foreground hover:border-brand-navy/60 hover:bg-muted/40 transition-all"
              style={{ wordBreak: 'keep-all' }}
            >
              <span className="text-xs font-semibold text-brand-orange mr-2">샘플 {i + 1}</span>
              {sample}
            </button>
          ))}
          <p className="text-[11px] text-muted-foreground px-1">
            * AI 이용 방침 자동 작성은 이후 업데이트 예정입니다.
          </p>
        </div>
      )}

      {/* 내비게이션 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border rounded-full px-6 py-3 text-sm font-semibold hover:border-brand-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />이전
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-colors"
        >
          문서 생성하기<ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
