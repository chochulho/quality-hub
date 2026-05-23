import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import type { PricingTier } from '@/lib/auth/grades'
import { ALL_TOOL_IDS, TOOLS, GRADE_TOOLS } from '@/lib/auth/grades'

interface PricingCardProps {
  tier: PricingTier
  annual: boolean
}

export default function PricingCard({ tier, annual }: PricingCardProps) {
  const price = annual ? tier.annualKRW : tier.monthlyKRW
  const unlockedIds = GRADE_TOOLS[tier.id]

  const isHighlight = tier.highlight

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
        {/* 등급명 + 라벨 */}
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
          {price === null ? (
            <div className={`text-4xl font-extrabold ${isHighlight ? 'text-white' : 'text-brand-navy'}`}>
              무료
            </div>
          ) : (
            <div>
              <div className={`text-4xl font-extrabold ${isHighlight ? 'text-white' : 'text-brand-navy'}`}>
                ₩{price.toLocaleString()}
                <span className={`text-base font-normal ml-1 ${isHighlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                  /월
                </span>
              </div>
              {annual && tier.monthlyKRW && (
                <p className={`text-sm mt-1 ${isHighlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                  연간 결제 시 (월 ₩{tier.monthlyKRW?.toLocaleString()} 대비 약 10% 절약)
                </p>
              )}
            </div>
          )}
        </div>

        {/* 도구 접근 현황 */}
        {tier.id !== 'free' && (
          <div className={`mb-5 rounded-xl p-4 ${isHighlight ? 'bg-white/10' : 'bg-muted'}`}>
            <p className={`text-xs font-semibold mb-2 ${isHighlight ? 'text-white/70' : 'text-muted-foreground'}`}>
              포함 도구 ({unlockedIds.length}/5)
            </p>
            <div className="space-y-1">
              {ALL_TOOL_IDS.map((id) => {
                const included = unlockedIds.includes(id)
                return (
                  <div key={id} className="flex items-center gap-2">
                    <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                      included
                        ? isHighlight ? 'bg-brand-orange' : 'bg-brand-orange'
                        : isHighlight ? 'bg-white/20' : 'bg-border'
                    }`}>
                      {included && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    <span className={`text-xs ${
                      included
                        ? isHighlight ? 'text-white' : 'text-foreground'
                        : isHighlight ? 'text-white/40' : 'text-muted-foreground line-through'
                    }`}>
                      {TOOLS[id].name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 기능 목록 */}
        <ul className="space-y-2.5">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isHighlight ? 'text-brand-orange' : 'text-brand-orange'}`} />
              <span className={isHighlight ? 'text-white/80' : 'text-foreground'}>
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-7 pb-7">
        <Link
          href={tier.id === 'free' ? '/learn' : `/register?grade=${tier.id}`}
          className={`flex items-center justify-center gap-2 w-full rounded-full px-6 py-3.5 font-semibold text-sm transition-all hover:-translate-y-0.5 duration-200 ${
            isHighlight
              ? 'bg-brand-orange text-white hover:bg-brand-orange-hover'
              : tier.id === 'free'
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
