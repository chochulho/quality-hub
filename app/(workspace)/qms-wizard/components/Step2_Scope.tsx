"use client"

import type { WizardState } from "@/types/qmsWizard"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { recommendProcesses } from "@/lib/qms/processRecommender"

interface Props {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

const SCOPE_ITEMS: {
  key: keyof WizardState['scope']
  label: string
  sub: string
  addedDocs: string
}[] = [
  { key: 'productDesign',  label: '제품 설계',    sub: 'IATF 8.3 설계개발',       addedDocs: '+QP-D01, QP-D02(APQP), DFMEA 절차' },
  { key: 'processDesign',  label: '공정 설계',    sub: 'PFMEA, 공정 흐름도',       addedDocs: '+QP-D03' },
  { key: 'manufacturing',  label: '생산·제조',    sub: '생산관리 프로세스',         addedDocs: '기본 포함' },
  { key: 'assembly',       label: '조립',         sub: '조립작업지침서 추가',       addedDocs: '+지침서 최소화' },
  { key: 'outsourcing',    label: '외주 공정',    sub: '협력사 관리 IATF 8.4',     addedDocs: '+QP-S01, QP-S02' },
  { key: 'afterSales',     label: 'A/S·고객지원', sub: '고객만족 절차',             addedDocs: '+QP-CS01' },
]

export default function Step2_Scope({ state, onUpdate, onNext, onPrev }: Props) {
  const toggle = (key: keyof WizardState['scope']) =>
    onUpdate({ scope: { ...state.scope, [key]: !state.scope[key] } })

  const preview = recommendProcesses(state)

  return (
    <div className="space-y-8">

      {/* 범위 선택 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">
          업무 범위 선택
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          선택에 따라 생성 문서 목록이 실시간으로 바뀝니다.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SCOPE_ITEMS.map(item => {
            const checked = state.scope[item.key]
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggle(item.key)}
                className={[
                  'rounded-xl border p-4 text-left transition-all',
                  checked
                    ? 'border-brand-navy bg-brand-navy/5'
                    : 'border-border hover:border-brand-navy/40',
                ].join(' ')}
              >
                <div className="flex items-start gap-2">
                  <div className={[
                    'w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0',
                    checked ? 'bg-brand-navy border-brand-navy text-white' : 'border-border',
                  ].join(' ')}>
                    {checked && <span className="text-[10px]">✓</span>}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                    <div className="text-[10px] text-brand-orange mt-1">{item.addedDocs}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 실시간 문서 개수 미리보기 */}
      <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">생성 예정 문서</p>
        <p className="text-2xl font-extrabold text-brand-navy">{preview.length}<span className="text-base font-normal text-muted-foreground ml-1">개</span></p>
        <p className="text-xs text-muted-foreground mt-1">매뉴얼 · 프로세스 · 터틀 · KPI · 매트릭스 포함</p>
      </div>

      {/* 내비게이션 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border rounded-full px-6 py-3 text-sm font-semibold hover:border-brand-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-colors"
        >
          다음
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
