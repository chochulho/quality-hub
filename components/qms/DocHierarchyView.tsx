"use client"

import type { GeneratedDoc } from "@/types/qmsWizard"
import Link from "next/link"

// ─────────────────────────────────────────────
// 문서 체계 피라미드 + 프로세스 간 연계 뷰
// Level 1: 매뉴얼  Level 2: 프로세스  Level 3: 터틀·지침서·KPI·매트릭스
// ─────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  manual:      '#2B4B8C',
  process:     '#378ADD',
  turtle:      '#1D9E75',
  kpi:         '#F26B3A',
  matrix:      '#534AB7',
  instruction: '#888780',
  procedure:   '#639922',
  form:        '#9B9B9B',
}
const TYPE_LABEL: Record<string, string> = {
  manual: '매뉴얼', process: '프로세스', turtle: '터틀',
  kpi: 'KPI', matrix: '매트릭스', instruction: '지침서',
  procedure: '절차서', form: '양식',
}

function DocChip({ doc }: { doc: GeneratedDoc }) {
  return (
    <Link href={`/qms-library/${encodeURIComponent(doc.docNo)}`}
      className="group flex flex-col items-start gap-0.5 rounded-xl border border-border bg-white px-3 py-2 text-[11px] hover:border-brand-navy/40 hover:shadow-sm transition-all min-w-[100px] max-w-[130px]">
      <div className="flex items-center gap-1 w-full">
        <span className="rounded text-[8px] font-bold px-1 py-0.5 text-white shrink-0"
          style={{ backgroundColor: TYPE_COLOR[doc.type] ?? '#888' }}>
          {TYPE_LABEL[doc.type] ?? doc.type}
        </span>
        <span className="font-semibold text-muted-foreground truncate text-[9px]">{doc.docNo}</span>
      </div>
      <span className="text-foreground leading-tight group-hover:text-brand-navy transition-colors"
        style={{ wordBreak: 'keep-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {doc.title}
      </span>
    </Link>
  )
}

// 화살표 SVG
function Arrow({ direction = 'down' }: { direction?: 'down' | 'right' }) {
  if (direction === 'right') return (
    <span className="text-border font-light text-lg self-center">→</span>
  )
  return (
    <div className="flex justify-center">
      <div className="w-px h-5 bg-border relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-border" />
      </div>
    </div>
  )
}

// 연관 문서 쌍 (프로세스 ↔ 터틀)
function ProcessWithTurtle({ process, turtle }: { process: GeneratedDoc; turtle?: GeneratedDoc }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <DocChip doc={process} />
      {turtle && (
        <>
          <Arrow direction="down" />
          <DocChip doc={turtle} />
        </>
      )}
    </div>
  )
}

export default function DocHierarchyView({ docs }: { docs: GeneratedDoc[] }) {
  const manual      = docs.find(d => d.type === 'manual')
  const processes   = docs.filter(d => d.type === 'process')
  const turtles     = docs.filter(d => d.type === 'turtle')
  const kpi         = docs.find(d => d.type === 'kpi')
  const matrix      = docs.find(d => d.type === 'matrix')
  const instructions = docs.filter(d => d.type === 'instruction')

  // 터틀을 프로세스 docNo로 매핑 (TT-MR01 → QP-MR01)
  const turtleByProcess: Record<string, GeneratedDoc> = {}
  for (const t of turtles) {
    const srcNo = 'QP-' + t.docNo.replace('TT-', '')
    turtleByProcess[srcNo] = t
  }

  return (
    <div className="space-y-8 py-4">

      {/* ── 피라미드 범례 ── */}
      <div className="rounded-2xl border border-border bg-muted/10 p-5">
        <h2 className="text-sm font-bold text-brand-navy mb-4">문서 체계 계층도</h2>

        {/* Level 1: 매뉴얼 */}
        <div className="text-center mb-2">
          <div className="inline-block text-[10px] font-semibold text-muted-foreground mb-1">Level 1 — 품질경영 매뉴얼</div>
          {manual && (
            <div className="flex justify-center">
              <DocChip doc={manual} />
            </div>
          )}
        </div>

        <Arrow direction="down" />

        {/* Level 2: 프로세스 */}
        <div className="mb-2">
          <div className="text-center text-[10px] font-semibold text-muted-foreground mb-2">Level 2 — 프로세스 절차서</div>
          <div className="flex flex-wrap gap-3 justify-center">
            {processes.map(p => (
              <ProcessWithTurtle key={p.docNo} process={p} turtle={turtleByProcess[p.docNo]} />
            ))}
          </div>
        </div>

        <Arrow direction="down" />

        {/* Level 3: 지침서 + KPI + 매트릭스 */}
        <div>
          <div className="text-center text-[10px] font-semibold text-muted-foreground mb-2">Level 3 — 지침서 · 성과 도구</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {instructions.map(d => <DocChip key={d.docNo} doc={d} />)}
            {kpi    && <DocChip doc={kpi} />}
            {matrix && <DocChip doc={matrix} />}
          </div>
        </div>
      </div>

      {/* ── 프로세스 연계 흐름 ── */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-sm font-bold text-brand-navy mb-1">핵심 프로세스 연계 흐름</h2>
        <p className="text-[11px] text-muted-foreground mb-4">품질경영시스템 주요 프로세스 간 입출력 연결</p>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-start gap-2 min-w-max">
            {/* 고객 불만 → 시정조치 → 경영검토 흐름 */}
            {['QP-C01','QP-CA01','QP-MR01'].map((no, idx) => {
              const doc = docs.find(d => d.docNo === no)
              if (!doc) return null
              return (
                <div key={no} className="flex items-center gap-2">
                  {idx > 0 && <Arrow direction="right" />}
                  <DocChip doc={doc} />
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex items-start gap-2 min-w-max">
            {/* 구매 → 수입검사 → 내부심사 */}
            {['QP-PU01','QP-PO01','QP-S02'].filter(no => docs.find(d => d.docNo === no)).map((no, idx) => {
              const doc = docs.find(d => d.docNo === no)!
              return (
                <div key={no} className="flex items-center gap-2">
                  {idx > 0 && <Arrow direction="right" />}
                  <DocChip doc={doc} />
                </div>
              )
            })}
            {docs.find(d => d.docNo === 'QP-A01') && (
              <>
                <Arrow direction="right" />
                <DocChip doc={docs.find(d => d.docNo === 'QP-A01')!} />
              </>
            )}
          </div>

          {/* 설계 관련 흐름 (IATF 선택 시) */}
          {docs.some(d => d.docNo === 'QP-D01') && (
            <div className="mt-3 flex items-start gap-2 min-w-max">
              {['QP-D01','QP-D02','QP-D03'].map((no, idx) => {
                const doc = docs.find(d => d.docNo === no)
                if (!doc) return null
                return (
                  <div key={no} className="flex items-center gap-2">
                    {idx > 0 && <Arrow direction="right" />}
                    <DocChip doc={doc} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
