"use client"

import type { WizardState, StandardKey } from "@/types/qmsWizard"
import { ArrowRight } from "lucide-react"

interface Props {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
}

const INDUSTRIES: { value: WizardState['industry']; label: string }[] = [
  { value: 'automotive',   label: '자동차 부품' },
  { value: 'electronics',  label: '전자 부품' },
  { value: 'machinery',    label: '기계 부품' },
  { value: 'other',        label: '기타' },
]

const SIZES: { value: WizardState['employeeCount']; label: string; sub: string }[] = [
  { value: 'small',  label: '소규모',  sub: '50명 이하' },
  { value: 'medium', label: '중규모',  sub: '51~200명' },
  { value: 'large',  label: '대규모',  sub: '200명 초과' },
]

export default function Step1_BasicInfo({ state, onUpdate, onNext }: Props) {
  const canNext = state.companyName.trim().length > 0 && state.certTarget.length > 0

  function toggleCert(cert: StandardKey) {
    const next = state.certTarget.includes(cert)
      ? state.certTarget.filter(c => c !== cert)
      : [...state.certTarget, cert]
    onUpdate({ certTarget: next })
  }

  return (
    <div className="space-y-8">

      {/* 회사명 */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          회사명 <span className="text-brand-orange">*</span>
        </label>
        <input
          type="text"
          value={state.companyName}
          onChange={e => onUpdate({ companyName: e.target.value })}
          placeholder="예: (주)한국품질산업"
          className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-navy transition-colors"
        />
      </div>

      {/* 업종 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          업종 <span className="text-brand-orange">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map(ind => (
            <button
              key={ind.value}
              type="button"
              onClick={() => onUpdate({ industry: ind.value })}
              className={[
                'rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all',
                state.industry === ind.value
                  ? 'border-brand-navy bg-brand-navy/5 text-brand-navy'
                  : 'border-border text-foreground hover:border-brand-navy/50',
              ].join(' ')}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* 인원 규모 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          인원 규모 <span className="text-brand-orange">*</span>
        </p>
        <div className="flex gap-2">
          {SIZES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onUpdate({ employeeCount: s.value })}
              className={[
                'flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                state.employeeCount === s.value
                  ? 'border-brand-navy bg-brand-navy/5 text-brand-navy'
                  : 'border-border text-foreground hover:border-brand-navy/50',
              ].join(' ')}
            >
              <div className="font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 인증 목표 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          인증 목표 (복수 선택) <span className="text-brand-orange">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {/* 현재 지원: ISO 9001 / IATF 16949 */}
          {(['ISO9001', 'IATF16949'] as const).map(cert => (
            <button
              key={cert}
              type="button"
              onClick={() => toggleCert(cert)}
              className={[
                'rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                state.certTarget.includes(cert)
                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                  : 'border-border text-foreground hover:border-brand-orange/50',
              ].join(' ')}
            >
              <div>{cert === 'ISO9001' ? 'ISO 9001:2015' : 'IATF 16949:2016'}</div>
              <div className="text-xs font-normal mt-0.5 opacity-70">
                {cert === 'ISO9001' ? '일반 품질경영' : '자동차 부품 추가요건'}
              </div>
            </button>
          ))}
          {/* 향후 지원 예정 */}
          {(['ISO14001', 'ISO45001'] as const).map(cert => (
            <button
              key={cert}
              type="button"
              disabled
              className="rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold opacity-40 cursor-not-allowed text-left"
            >
              <div>{cert === 'ISO14001' ? 'ISO 14001:2015' : 'ISO 45001:2018'}</div>
              <div className="text-xs font-normal mt-0.5">
                {cert === 'ISO14001' ? '환경경영 — 준비 중' : '안전보건경영 — 준비 중'}
              </div>
            </button>
          ))}
        </div>
        {state.certTarget.includes('IATF16949') && (
          <p className="mt-2 text-xs text-muted-foreground">
            ※ IATF 16949 선택 시 ISO 9001 요건이 포함됩니다. APQP, PFMEA 등 자동차 특화 문서가 추가됩니다.
          </p>
        )}
      </div>

      {/* 다음 */}
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold disabled:opacity-40 hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
      >
        다음 단계
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
