'use client'

import Link from 'next/link'
import { ExternalLink, Lock, ArrowRight } from 'lucide-react'
import { type ToolDef, type Grade, GRADE_LABELS, getRequiredGrade } from '@/lib/auth/grades'

interface ToolAccessCardProps {
  tool: ToolDef
  unlocked: boolean
  currentGrade: Grade
}

export default function ToolAccessCard({ tool, unlocked, currentGrade }: ToolAccessCardProps) {
  const requiredGrade = getRequiredGrade(tool.id)

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
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-orange text-white rounded-full px-4 py-2 hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
          >
            이용하기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    )
  }

  // 잠금 상태
  return (
    <div className="bg-white border border-border rounded-3xl overflow-hidden opacity-70 relative">
      {/* 잠금 뱃지 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-border shadow-sm">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">
            {GRADE_LABELS[requiredGrade]}
          </span>
        </div>
      </div>

      {/* 헤더 (흑백 처리) */}
      <div className={`${tool.color} px-6 py-5 grayscale`}>
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
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-orange transition-colors"
        >
          {GRADE_LABELS[requiredGrade]} 구독으로 이용
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
