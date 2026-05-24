import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { TOOLS, type ToolId } from '@/lib/auth/grades'

interface Props {
  tool: ToolId
  /** 커스텀 설명 (없으면 TOOLS 정의에서 자동 사용) */
  message?: string
  /** 직접 외부 사이트로 이동할 때 true (기본: 내부 /tools 소개 페이지) */
  external?: boolean
}

/**
 * MDX 콘텐츠 내 자매 사이트 자연 연결 컴포넌트.
 * 광고 톤 금지 — 학습 맥락의 "다음 단계" 안내.
 *
 * 사용:
 * <RelatedToolCTA tool="apqp-manager" />
 * <RelatedToolCTA tool="auditsay" message="심사 체크리스트를 시스템으로 관리하려면" />
 */
export default function RelatedToolCTA({ tool, message, external = false }: Props) {
  const def = TOOLS[tool]
  if (!def) return null

  const defaultMessage: Record<ToolId, string> = {
    'auditsay':         '심사 계획·실행·부적합 관리를 한 곳에서 하려면',
    'apqp-manager':     'PFMEA를 AI와 함께 AIAG-VDA 규격으로 작성하려면',
    'gauge-manager':    '측정기기 교정 이력과 GR&R을 자동 관리하려면',
    'nc-manager':       '부적합·클레임을 8D 방법론으로 추적·관리하려면',
    '4m-change-manager':'4M 변경을 IATF 8.5.6 기준으로 승인·통보하려면',
  }

  const desc = message ?? defaultMessage[tool]

  // 내부 링크: /tools/apqp, /tools/auditsay 등
  const internalHref = `/tools/${tool.replace('-manager', '').replace('apqp', 'apqp')}`
  const href = external ? def.href : internalHref

  return (
    <div className={`not-prose my-6 rounded-2xl border border-border p-5 flex items-start gap-4`}>
      {/* 색상 도트 */}
      <div className={`shrink-0 w-2 h-2 rounded-full mt-2 ${def.color}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-2" style={{ wordBreak: 'keep-all' }}>
          {desc}
        </p>
        <div className="flex items-center gap-2">
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors"
            >
              {def.name} 살펴보기
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors"
            >
              {def.name} 소개 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <span className="text-xs text-muted-foreground">— {def.tagline}</span>
        </div>
      </div>
    </div>
  )
}
