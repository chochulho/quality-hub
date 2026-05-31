"use client"

import { useState } from "react"
import type { GeneratedDoc } from "@/types/qmsWizard"
import Link from "next/link"

// ─────────────────────────────────────────────
// 문서 체계 + 연계성 뷰 (3탭)
// Tab 1: 프로세스 체계 흐름 (레이어별 연계)
// Tab 2: 문서 계층도 (QM → QP+TT → QI/KPI/MTX)
// Tab 3: 문서 피라미드 (L1~L5 추상→구체)
// ─────────────────────────────────────────────

// ── 타입 ────────────────────────────────────────────────────────

interface ProcessItem {
  docNos: string[]      // 해당 박스와 연결되는 문서번호들
  label: string
  sub?: string
  isCustomer?: boolean  // 고객 I/O 박스
}

// ── 프로세스 체계 데이터 ─────────────────────────────────────────

const MANAGEMENT_LAYER: ProcessItem[] = [
  { docNos: ['QP-MR01'], label: '경영검토', sub: '방침·목표·자원 결정' },
  { docNos: [],          label: '리스크·기회 관리', sub: 'IATF 6.1 리스크 기반 사고' },
]

const SUPPORT_LAYER: ProcessItem[] = [
  { docNos: ['QP-HR01'],                        label: '인적자원',     sub: 'QP-HR01' },
  { docNos: ['QP-DC01'],                        label: '문서·기록',    sub: 'QP-DC01' },
  { docNos: ['QP-EQ01','QP-MS01','QP-PM01'],   label: '설비·계측기',  sub: 'QP-EQ/MS' },
  { docNos: ['QP-PU01','QP-PO01','QP-S01'],    label: '구매·협력사',  sub: 'QP-PU/S01' },
]

const REALIZATION_FLOW: ProcessItem[] = [
  { docNos: [], label: '고객\n요구사항\nVOC', isCustomer: true },
  { docNos: ['QP-CS01','QP-C01'],         label: '영업\n수주',          sub: 'QP-SA' },
  { docNos: ['QP-D01','QP-D02','QP-D03'], label: '설계\n개발\nAPQP',    sub: 'QP-D01' },
  { docNos: ['QP-PR01'],                  label: '생산\n공정관리\nSPC',  sub: 'QP-PR' },
  { docNos: ['QP-S02'],                   label: '검사\n수입·공정\n출하', sub: 'QP-QC' },
  { docNos: ['QP-WH01'],                  label: '출하\n납품',           sub: 'QP-DL' },
  { docNos: [], label: '고객\n만족도\n피드백', isCustomer: true },
]

const IMPROVE_LAYER: ProcessItem[] = [
  { docNos: ['QP-A01'],  label: '내부심사',   sub: 'QP-A01' },
  { docNos: ['KPI-001'], label: 'KPI 모니터링', sub: 'KPI-001' },
  { docNos: ['QP-C01'],  label: '고객불만',   sub: 'QP-C01' },
  { docNos: ['QP-CA01'], label: '시정조치',   sub: 'QP-CA01' },
]

// ── 문서 피라미드 데이터 ─────────────────────────────────────────

const PYRAMID = [
  { level: 'L1', label: '경영방침', eng: 'Quality Policy', leftNote: '1~2페이지\n대표이사 서명', rightNote: '무엇을 위해?\n어떤 방향으로?', pct: 25, color: 'bg-purple-100 border-purple-300 text-purple-900' },
  { level: 'L2', label: '품질매뉴얼', eng: 'QM-001', leftNote: '20~40페이지\nIATF 조항 매핑', rightNote: '무엇을 할 것인가?\nQMS 전체 구조 선언', pct: 45, color: 'bg-blue-100 border-blue-300 text-blue-900' },
  { level: 'L3', label: '프로세스 / 절차서', eng: 'QP-XXX', leftNote: '5~15페이지\n부서 간 흐름', rightNote: '어떻게 할 것인가?\n누가·언제·무엇을', pct: 65, color: 'bg-rose-100 border-rose-300 text-rose-900' },
  { level: 'L4', label: '지침서 / 작업표준서', eng: 'QI-XXX', leftNote: '1~5페이지\n공정별 세분화', rightNote: '어떻게 실행하는가?\n현장 작업자 수행', pct: 82, color: 'bg-green-100 border-green-300 text-green-900' },
  { level: 'L5', label: '양식 / 기록', eng: 'QF-XXX', leftNote: '체크시트·대장\n개정 없이 축적', rightNote: '증거 보존\n실행했음을 증명', pct: 100, color: 'bg-gray-100 border-gray-300 text-gray-700' },
]

// ── 헬퍼 컴포넌트 ────────────────────────────────────────────────

function hasAnyDoc(items: string[], docs: GeneratedDoc[]): boolean {
  return items.some(no => docs.find(d => d.docNo === no))
}

function firstDocLink(items: string[], docs: GeneratedDoc[]): string | null {
  const found = items.find(no => docs.find(d => d.docNo === no))
  return found ?? null
}

function ProcessBox({ item, docs, compact = false }: { item: ProcessItem; docs: GeneratedDoc[]; compact?: boolean }) {
  if (item.isCustomer) {
    return (
      <div className="rounded-xl bg-teal-50 border border-teal-300 px-3 py-3 text-center text-xs text-teal-900 font-semibold min-w-[60px]" style={{ whiteSpace: 'pre-line' }}>
        {item.label}
      </div>
    )
  }
  const exists = hasAnyDoc(item.docNos, docs)
  const linkNo = firstDocLink(item.docNos, docs)

  const inner = (
    <div className={`rounded-xl border px-2.5 py-2 text-center text-xs transition-all h-full flex flex-col items-center justify-center gap-0.5 ${
      exists
        ? 'border-brand-navy/40 bg-white hover:border-brand-navy hover:shadow-sm cursor-pointer'
        : 'border-border/60 bg-white/60 opacity-50'
    } ${compact ? 'min-w-[70px]' : 'min-w-[80px]'}`}>
      <div className="font-bold leading-snug" style={{ wordBreak: 'keep-all', whiteSpace: 'pre-line', fontSize: compact ? 10 : 11 }}>
        {item.label}
      </div>
      {item.sub && <div className="text-[9px] text-muted-foreground">{item.sub}</div>}
    </div>
  )

  if (exists && linkNo) return <Link href={`/qms-library/${encodeURIComponent(linkNo)}`} className="h-full">{inner}</Link>
  return inner
}

// ── Tab 1: 프로세스 체계 ─────────────────────────────────────────

function ProcessLandscapeTab({ docs }: { docs: GeneratedDoc[] }) {
  const legendItems = [
    { color: 'bg-purple-100 border-purple-300', label: 'L1 경영 방향 — 방침·목표·리스크' },
    { color: 'bg-blue-100 border-blue-300',     label: 'L2 지원 — 모든 실현 프로세스의 기반 인프라' },
    { color: 'bg-rose-100 border-rose-300',     label: 'L3 실현 — 고객 요구사항 → 제품 변환 핵심 흐름' },
    { color: 'bg-amber-100 border-amber-300',   label: 'L4 측정·개선 — 데이터 기반 피드백 루프 (경영검토로 상향)' },
  ]

  return (
    <div className="space-y-3">
      {/* ── L1 경영 방향 ────────────────────────────── */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50 overflow-hidden">
        <div className="bg-purple-100 px-4 py-2">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">L1 경영 방향 설정 프로세스</span>
        </div>
        <div className="flex flex-wrap gap-3 px-4 py-3">
          {MANAGEMENT_LAYER.map((item, i) => (
            <ProcessBox key={i} item={item} docs={docs} />
          ))}
        </div>
      </div>

      {/* ↓ */}
      <div className="flex justify-center"><div className="w-px h-4 bg-border" /></div>

      {/* ── L2 지원 ─────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
        <div className="bg-blue-100 px-4 py-2">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">L2 지원 프로세스 (Support)</span>
        </div>
        <div className="flex flex-wrap gap-3 px-4 py-3">
          {SUPPORT_LAYER.map((item, i) => (
            <ProcessBox key={i} item={item} docs={docs} />
          ))}
        </div>
      </div>

      {/* ↓ */}
      <div className="flex justify-center"><div className="w-px h-4 bg-border" /></div>

      {/* ── L3 실현 ─────────────────────────────────── */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50 overflow-hidden">
        <div className="bg-rose-100 px-4 py-2">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">L3 실현 프로세스 — 제조 핵심 (Realization)</span>
        </div>
        <div className="flex items-stretch gap-2 px-4 py-3 overflow-x-auto">
          {REALIZATION_FLOW.map((item, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              {i > 0 && !item.isCustomer && (
                <span className="text-rose-400 font-bold text-base shrink-0">→</span>
              )}
              <ProcessBox item={item} docs={docs} compact />
            </div>
          ))}
        </div>
      </div>

      {/* ↓ */}
      <div className="flex justify-center"><div className="w-px h-4 bg-border" /></div>

      {/* ── L4 측정·개선 ─────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
        <div className="bg-amber-100 px-4 py-2">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">L4 측정·분석·개선 프로세스 (Monitor &amp; Improve)</span>
        </div>
        <div className="flex flex-wrap gap-3 px-4 py-3">
          {IMPROVE_LAYER.map((item, i) => (
            <ProcessBox key={i} item={item} docs={docs} />
          ))}
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-700">
            <svg width="32" height="10" viewBox="0 0 32 10"><path d="M0 5 Q8 5 16 2 Q24 -1 32 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2"/></svg>
            개선 피드백 → 경영검토(L1) 상향
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="rounded-xl border border-border bg-muted/10 p-4">
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">프로세스 계층 범례</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {legendItems.map((l, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-foreground">
              <span className={`w-4 h-4 rounded border shrink-0 ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab 2: 문서 계층도 ──────────────────────────────────────────

function DocChip({ doc, size = 'md' }: { doc: GeneratedDoc; size?: 'sm' | 'md' }) {
  const TYPE_COLOR: Record<string, string> = {
    manual: '#2B4B8C', process: '#378ADD', turtle: '#1D9E75',
    kpi: '#F26B3A', matrix: '#534AB7', instruction: '#888780',
  }
  const TYPE_LABEL: Record<string, string> = {
    manual: '매뉴얼', process: '프로세스', turtle: '터틀',
    kpi: 'KPI', matrix: '매트릭스', instruction: '지침서',
  }

  return (
    <Link href={`/qms-library/${encodeURIComponent(doc.docNo)}`}
      className={`group rounded-xl border border-border bg-white hover:border-brand-navy/40 hover:shadow-sm transition-all flex flex-col gap-0.5 ${
        size === 'sm' ? 'px-2 py-1.5 min-w-[90px] max-w-[110px]' : 'px-3 py-2 min-w-[110px] max-w-[140px]'
      }`}>
      <div className="flex items-center gap-1">
        <span className="rounded px-1 py-0.5 text-[8px] font-bold text-white shrink-0"
          style={{ backgroundColor: TYPE_COLOR[doc.type] ?? '#888' }}>
          {TYPE_LABEL[doc.type] ?? doc.type}
        </span>
        <span className={`text-muted-foreground truncate ${size === 'sm' ? 'text-[8px]' : 'text-[9px]'}`}>
          {doc.docNo}
        </span>
      </div>
      <span className={`text-foreground group-hover:text-brand-navy transition-colors leading-tight ${
        size === 'sm' ? 'text-[10px]' : 'text-[11px]'
      }`} style={{
        wordBreak: 'keep-all',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {doc.title}
      </span>
    </Link>
  )
}

function DocTreeTab({ docs }: { docs: GeneratedDoc[] }) {
  const manual      = docs.find(d => d.type === 'manual')
  const processes   = docs.filter(d => d.type === 'process')
  const turtleMap   = Object.fromEntries(
    docs.filter(d => d.type === 'turtle').map(t => ['QP-' + t.docNo.replace('TT-',''), t])
  )
  const instructions = docs.filter(d => d.type === 'instruction')
  const kpi          = docs.find(d => d.type === 'kpi')
  const matrix       = docs.find(d => d.type === 'matrix')

  const ConnectorV = () => (
    <div className="flex justify-center my-1">
      <div className="flex flex-col items-center gap-0">
        <div className="w-px h-4 bg-border" />
        <div className="w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-border" />
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Level 1 */}
      <div className="text-center">
        <div className="inline-block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
          Level 1 — 품질경영 매뉴얼
        </div>
        {manual && (
          <div className="flex justify-center">
            <DocChip doc={manual} />
          </div>
        )}
      </div>

      <ConnectorV />

      {/* Level 2 */}
      <div>
        <div className="text-center text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          Level 2 — 프로세스 절차서
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {processes.map(p => (
            <div key={p.docNo} className="flex flex-col items-center gap-1">
              <DocChip doc={p} />
              {turtleMap[p.docNo] && (
                <>
                  <div className="w-px h-3 bg-border" />
                  <DocChip doc={turtleMap[p.docNo]} size="sm" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConnectorV />

      {/* Level 3 */}
      <div>
        <div className="text-center text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          Level 3 — 지침서 · 성과 도구
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {instructions.map(d => <DocChip key={d.docNo} doc={d} size="sm" />)}
          {kpi    && <DocChip doc={kpi}    size="sm" />}
          {matrix && <DocChip doc={matrix} size="sm" />}
        </div>
      </div>
    </div>
  )
}

// ── Tab 3: 문서 피라미드 ─────────────────────────────────────────

function DocPyramidTab({ docs }: { docs: GeneratedDoc[] }) {
  return (
    <div className="flex items-center gap-0 max-w-2xl mx-auto">
      {/* 왼쪽 주석 */}
      <div className="flex flex-col gap-0 shrink-0 w-28 text-right pr-3">
        {PYRAMID.map((p, i) => (
          <div key={i} className="flex flex-col justify-center" style={{ height: `${(i + 1) * 14 + 36}px` }}>
            <p className="text-[9px] text-muted-foreground leading-snug" style={{ whiteSpace: 'pre-line' }}>
              {p.leftNote}
            </p>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-[9px] text-muted-foreground">추상</span>
          <div className="w-px h-12 bg-border" />
        </div>
      </div>

      {/* 피라미드 */}
      <div className="flex flex-col items-center gap-0 flex-1">
        {PYRAMID.map((p, i) => (
          <div key={i} className={`rounded-none border-x border-b ${i === 0 ? 'rounded-t-xl border-t' : ''} ${i === PYRAMID.length-1 ? 'rounded-b-xl' : ''} ${p.color} flex items-center justify-center text-center py-2.5`}
            style={{ width: `${p.pct}%`, minWidth: 80 }}>
            <div>
              <div className="text-[10px] font-bold">{p.level}</div>
              <div className="text-xs font-semibold" style={{ wordBreak: 'keep-all' }}>{p.label}</div>
              <div className="text-[9px] opacity-70">{p.eng}</div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-2">
          <div className="w-px h-12 bg-border" />
          <span className="text-[9px] text-muted-foreground">구체</span>
        </div>
      </div>

      {/* 오른쪽 주석 */}
      <div className="flex flex-col gap-0 shrink-0 w-32 text-left pl-3">
        {PYRAMID.map((p, i) => (
          <div key={i} className="flex flex-col justify-center" style={{ height: `${(i + 1) * 14 + 36}px` }}>
            <p className="text-[9px] text-muted-foreground leading-snug" style={{ whiteSpace: 'pre-line' }}>
              {p.rightNote}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────

type TabType = 'process' | 'tree' | 'pyramid'

const TABS: { key: TabType; label: string }[] = [
  { key: 'process',  label: '프로세스 체계' },
  { key: 'tree',     label: '문서 계층도' },
  { key: 'pyramid',  label: '문서 피라미드' },
]

export default function DocHierarchyView({ docs }: { docs: GeneratedDoc[] }) {
  const [tab, setTab] = useState<TabType>('process')

  return (
    <div className="space-y-4">
      {/* 탭 바 */}
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-brand-navy text-white' : 'text-muted-foreground hover:bg-muted/40'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="rounded-2xl border border-border bg-white p-5">
        {tab === 'process'  && <ProcessLandscapeTab docs={docs} />}
        {tab === 'tree'     && <DocTreeTab docs={docs} />}
        {tab === 'pyramid'  && <DocPyramidTab docs={docs} />}
      </div>
    </div>
  )
}
