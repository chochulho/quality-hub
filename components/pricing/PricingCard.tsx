import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { ALL_TOOL_IDS, TOOLS, type ToolId } from '@/lib/auth/grades'

export interface PlanTier {
  id: string
  name: string
  label: string
  monthlyKRW: number | null
  annualKRW: number | null
  toolCount: number
  includedTools: ToolId[]
  highlight: boolean
  badge?: string
  features: string[]
  ctaLabel: string
}

interface PricingCardProps {
  tier: PlanTier
}

export default function PricingCard({ tier }: PricingCardProps) {
  const isHighlight = tier.highlight
  const isFree = tier.id === 'free'
  const isBusiness = tier.id === 'business'

  const toolSectionLabel =
    tier.toolCount === 1
      ? '5개 도구 중 1개 선택'
      : tier.toolCount === 3
      ? '5개 도구 중 3개 선택'
      : `포함 도구 (${tier.includedTools.length}/5)`

  const toolSelectionHint =
    tier.id === 'starter' ? '가입 시 5개 도구 중 1개를 선택합니다. 언제든지 변경 가능.'
    : tier.id === 'team'    ? '가입 시 5개 도구 중 3개를 선택합니다. 언제든지 변경 가능.'
    : tier.id === 'business' ? '5개 도구 모두 자동 활성화.'
    : null

  return (
    <div
      className={`relative rounded-3xl border flex flex-col ${
        isHighlight
          ? 'bg-brand-navy border-brand-navy text-white shadow-xl scale-[1.02]'
          : 'bg-white border-border'
      }`}
    >
      {/* Team 추천 배지 */}
      {isHighlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
            추천
          </span>
        </div>
      )}
      {/* Business FMEA 챗봇 무제한 배지 */}
      {tier.badge && !isHighlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-brand-navy text-white text-xs font-bold px-4 py-1.5 rounded-full shadow whitespace-nowrap">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="p-7 flex-1">
        {/* 플랜명 */}
        <div className="mb-5">
          <p className={`text-sm font-semibold mb-1 ${isHighlight ? 'text-white/70' : 'text-brand-orange'}`}>
            {tier.label}
          </p>
          <h3 className={`text-2xl font-extrabold ${isHighlight ? 'text-white' : 'text-brand-navy'}`}>
            {tier.name}
          </h3>
        </div>

        {/* 가격 */}
        <div className="mb-6">
          {isFree ? (
            <div className={`text-4xl font-extrabold whitespace-nowrap ${isHighlight ? 'text-white' : 'text-brand-navy'}`}>
              무료
            </div>
          ) : (
            <div>
              {/* 월간 가격 */}
              <div data-monthly="">
                <div className={`text-4xl font-extrabold whitespace-nowrap ${isHighlight ? 'text-white' : 'text-brand-navy'}`}>
                  ₩{(tier.monthlyKRW ?? 0).toLocaleString()}
                  <span className={`text-base font-normal ml-1 ${isHighlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                    /월
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isHighlight ? 'text-white/50' : 'text-muted-foreground'}`}>
                  VAT 별도
                </p>
              </div>
              {/* 연간 가격 (초기 hidden) */}
              <div data-annual="" style={{ display: 'none' }}>
                <div className={`text-4xl font-extrabold whitespace-nowrap ${isHighlight ? 'text-white' : 'text-brand-navy'}`}>
                  ₩{(tier.annualKRW ?? 0).toLocaleString()}
                  <span className={`text-base font-normal ml-1 ${isHighlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                    /년
                  </span>
                </div>
                {tier.annualKRW && (
                  <p className={`text-xs mt-1 ${isHighlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                    월 ₩{Math.round(tier.annualKRW / 12).toLocaleString()} 효과 · 2개월 무료
                  </p>
                )}
                <p className={`text-xs mt-0.5 ${isHighlight ? 'text-white/50' : 'text-muted-foreground'}`}>
                  VAT 별도
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 포함 도구 현황 */}
        {!isFree && (
          <div className={`mb-5 rounded-xl p-3 ${isHighlight ? 'bg-white/10' : 'bg-muted'}`}>
            <p className={`text-xs font-semibold mb-2 ${isHighlight ? 'text-white/70' : 'text-muted-foreground'}`}>
              {toolSectionLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TOOL_IDS.map((id) => {
                const tool = TOOLS[id]
                return (
                  <span
                    key={id}
                    className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${tool.color} text-white`}
                  >
                    {tool.name}
                  </span>
                )
              })}
            </div>
            {toolSelectionHint && (
              <p className={`text-[11px] mt-2 ${isHighlight ? 'text-white/50' : 'text-muted-foreground/60'}`}>
                {toolSelectionHint}
              </p>
            )}
          </div>
        )}

        {/* 기능 목록 */}
        <ul className="space-y-2.5">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isBusiness ? 'text-brand-orange' : 'text-brand-orange'}`} />
              <span className={isHighlight ? 'text-white/80' : 'text-foreground'}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-7 pb-7">
        <Link
          href={isFree ? '/learn' : '/register'}
          className={`flex items-center justify-center gap-2 w-full rounded-full px-6 py-3.5 font-semibold text-sm transition-all hover:-translate-y-0.5 duration-200 ${
            isHighlight
              ? 'bg-brand-orange text-white hover:bg-brand-orange-hover'
              : isFree
              ? 'bg-muted text-foreground hover:bg-border'
              : 'border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
          }`}
        >
          {tier.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
