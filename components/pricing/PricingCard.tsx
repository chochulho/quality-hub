import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { ALL_TOOL_IDS, TOOLS, PREMIUM_TOOL_IDS, type ToolId } from '@/lib/auth/grades'

export interface PlanTier {
  id: string
  name: string
  label: string
  monthlyKRW: number | null
  annualKRW: number | null
  toolCount: number
  includedTools: ToolId[]
  highlight: boolean
  features: string[]
  ctaLabel: string
}

interface PricingCardProps {
  tier: PlanTier
}

export default function PricingCard({ tier }: PricingCardProps) {
  const isHighlight = tier.highlight
  const isFree = tier.id === 'free'

  return (
    <div
      className={`relative rounded-3xl border flex flex-col ${
        isHighlight
          ? 'bg-brand-navy border-brand-navy text-white shadow-xl scale-[1.02]'
          : 'bg-white border-border'
      }`}
    >
      {isHighlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
            추천
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
              </div>
            </div>
          )}
        </div>

        {/* 포함 도구 현황 */}
        {!isFree && (
          <div className={`mb-5 rounded-xl p-3 ${isHighlight ? 'bg-white/10' : 'bg-muted'}`}>
            <p className={`text-xs font-semibold mb-2 ${isHighlight ? 'text-white/70' : 'text-muted-foreground'}`}>
              {tier.toolCount === 1
                ? '기본 3개 도구 중 1개 선택'
                : tier.id === 'team'
                ? '기본 3개 도구 전체'
                : `포함 도구 (${tier.includedTools.length}/5)`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TOOL_IDS.map((id) => {
                const included = tier.includedTools.includes(id)
                const isPremium = PREMIUM_TOOL_IDS.includes(id)
                const tool = TOOLS[id]
                const isBusinessOnly = isPremium && tier.id !== 'business' && tier.id !== 'enterprise'
                return (
                  <span
                    key={id}
                    className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      included
                        ? `${tool.color} text-white`
                        : isBusinessOnly
                        ? isHighlight
                          ? 'bg-white/5 text-white/20 line-through'
                          : 'bg-muted text-muted-foreground/40 line-through'
                        : isHighlight
                        ? 'bg-white/10 text-white/30 line-through'
                        : 'bg-border text-muted-foreground/60 line-through'
                    }`}
                  >
                    {tool.name}
                    {isBusinessOnly && (
                      <span className="ml-1 text-[10px] opacity-60">★</span>
                    )}
                  </span>
                )
              })}
            </div>
            {(tier.id === 'starter' || tier.id === 'team') && (
              <p className={`text-[11px] mt-2 ${isHighlight ? 'text-white/50' : 'text-muted-foreground/60'}`}>
                ★ APQP Manager · Gauge Manager는 Business 전용
              </p>
            )}
          </div>
        )}

        {/* 기능 목록 */}
        <ul className="space-y-2.5">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-brand-orange" />
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
