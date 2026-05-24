'use client'

import Link from 'next/link'
import { ExternalLink, Lock, ArrowRight } from 'lucide-react'
import { type ToolDef } from '@/lib/auth/grades'

interface ToolAccessCardProps {
  tool: ToolDef
  unlocked: boolean
  planId?: string
}

export default function ToolAccessCard({ tool, unlocked }: ToolAccessCardProps) {
  if (unlocked) {
    return (
      <div className="bg-white border border-border rounded-3xl overflow-hidden hover:border-brand-navy transition-colors duration-200 group">
        {/* 헤더 */}
        <div className={`${tool.color} px-6 py-5`}>
          <p className="text-xs font-medium text-white/70 mb-1">{tool.tagline}</p>
          <h3 className="text-xl font-bold text-white">{tool.name}</h3>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {tool.description}
          </p>
          <ul className="space-y-1.5 mb-6">
            {tool.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={`/api/sso/${tool.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-orange text-white rounded-full px-4 py-2 hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
          >
            이용하기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    )
  }

  // ── 잠금 상태 ──────────────────────────────────────────────
  return (
    <div className="bg-white border border-dashed border-border rounded-3xl overflow-hidden relative">
      {/* 잠금 뱃지 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-border shadow-sm">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-medium">Starter+</span>
        </div>
      </div>

      {/* 헤더 — 흑백 */}
      <div className={`${tool.color} px-6 py-5 grayscale opacity-50`}>
        <p className="text-xs font-medium text-white/70 mb-1">{tool.tagline}</p>
        <h3 className="text-xl font-bold text-white">{tool.name}</h3>
      </div>

      {/* 본문 */}
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {tool.description}
        </p>
        <ul className="space-y-1.5 mb-6">
          {tool.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground/60">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* 업셀 CTA — 해당 도구 컨텍스트로 연결 */}
        <Link
          href={`/billing/upgrade?tool=${tool.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-navy text-white rounded-full px-4 py-2 hover:bg-brand-navy-dark transition-all hover:-translate-y-0.5 duration-200"
        >
          {tool.name} 이용하기
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
