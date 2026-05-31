import { ArrowUpRight } from "lucide-react"
import type { RelatedTool } from "@/lib/qms/relatedTools"

// ─────────────────────────────────────────────
// 자매 사이트 연결 CTA 카드
// 광고 톤 금지 — 학습·실무 맥락의 자연스러운 다음 단계
// CLAUDE.md §6 "관련 도구" 패턴 준수
// ─────────────────────────────────────────────

const TOOL_ACCENT: Record<string, string> = {
  'AuditSay':     'border-l-[#2B4B8C]',
  'APQP Manager': 'border-l-[#1D9E75]',
  'Gauge Manager': 'border-l-[#534AB7]',
}

interface Props {
  tool: RelatedTool
  size?: 'compact' | 'full'
}

export default function RelatedToolCTA({ tool, size = 'full' }: Props) {
  const accent = TOOL_ACCENT[tool.name] ?? 'border-l-brand-orange'

  if (size === 'compact') {
    return (
      <div className={`rounded-xl border border-border border-l-4 ${accent} bg-muted/30 px-4 py-3 flex items-center justify-between gap-4`}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-brand-orange uppercase tracking-wider mb-0.5">관련 도구</p>
          <p className="text-xs font-semibold text-foreground">{tool.name} — {tool.tagline}</p>
        </div>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors whitespace-nowrap"
        >
          바로가기
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-border border-l-4 ${accent} bg-muted/20 p-6`}>

      {/* 아이덴티티 */}
      <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-4">
        다음 단계로
      </p>

      {/* 도구 이름 + 태그라인 */}
      <div className="mb-3">
        <span className="text-base font-extrabold text-foreground">{tool.name}</span>
        <span className="text-sm text-muted-foreground ml-2">— {tool.tagline}</span>
      </div>

      {/* 설명 */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-5" style={{ wordBreak: 'keep-all' }}>
        {tool.description}
      </p>

      {/* CTA 버튼 */}
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
      >
        {tool.ctaText}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  )
}
