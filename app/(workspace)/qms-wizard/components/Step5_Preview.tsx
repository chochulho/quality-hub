"use client"

import { useEffect, useState } from "react"
import type { WizardState, GeneratedDoc, DocEntry } from "@/types/qmsWizard"
import { recommendProcesses } from "@/lib/qms/processRecommender"
import { saveDoc } from "@/lib/qms/docStorage"
import { getRelatedTool } from "@/lib/qms/relatedTools"
import RelatedToolCTA from "@/components/qms/RelatedToolCTA"
import TurtlePreview from "@/components/qms/TurtlePreview"
import MatrixDocPreview from "@/components/qms/MatrixDocPreview"
import KpiDocPreview from "@/components/qms/KpiDocPreview"
import { mdToHtml } from "@/lib/qms/mdToHtml"
import { ArrowLeft, Download, Library, FileText } from "lucide-react"
import Link from "next/link"

interface Props {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onPrev: () => void
}

const TYPE_COLOR: Record<string, string> = {
  manual:      'bg-[#2B4B8C] text-white',
  turtle:      'bg-[#1D9E75] text-white',
  process:     'bg-[#378ADD] text-white',
  kpi:         'bg-brand-orange text-white',
  procedure:   'bg-[#639922] text-white',
  instruction: 'bg-[#888780] text-white',
  matrix:      'bg-[#534AB7] text-white',
  form:        'bg-gray-400 text-white',
}

const TYPE_LABEL: Record<string, string> = {
  manual: '매뉴얼', turtle: '터틀', process: '프로세스',
  kpi: 'KPI', procedure: '절차서', instruction: '지침서',
  matrix: '매트릭스', form: '양식',
}


export default function Step5_Preview({ state, onUpdate, onPrev }: Props) {
  const docList = recommendProcesses(state)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(!!state.generatedDocs)
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDoc | null>(null)

  useEffect(() => {
    setDone(!!state.generatedDocs)
    // 생성 완료 시 첫 번째 문서 자동 선택
    if (state.generatedDocs && state.generatedDocs.length > 0 && !selectedDoc) {
      setSelectedDoc(state.generatedDocs[0])
    }
  }, [state.generatedDocs])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/qms-wizard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { docs } = await res.json() as { docs: GeneratedDoc[] }
      await Promise.all(docs.map(d => saveDoc(d)))
      onUpdate({ generatedDocs: docs })
      setDone(true)
      if (docs.length > 0) setSelectedDoc(docs[0])
    } catch (err) {
      console.error('[generate]', err)
      alert('문서 생성 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setGenerating(false)
    }
  }

  function handleDownloadAll() {
    const docs = state.generatedDocs ?? []
    docs.forEach(doc => {
      const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${doc.docNo}_${doc.title.replace(/[^가-힣a-zA-Z0-9]/g, '_')}.md`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  // 생성된 문서 찾기 (클릭용)
  function findGenerated(docNo: string): GeneratedDoc | null {
    return state.generatedDocs?.find(d => d.docNo === docNo) ?? null
  }

  return (
    <div className="space-y-5">

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">

        {/* 좌: 문서 목록 */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="px-3 py-2.5 bg-muted/40 border-b border-border">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {done ? '생성 완료' : '생성 예정'} — {docList.length}개
            </p>
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {docList.map((entry: DocEntry) => {
              const gen = findGenerated(entry.docNo)
              const isSelected = selectedDoc?.docNo === entry.docNo
              return (
                <button
                  key={entry.docNo}
                  type="button"
                  disabled={!gen}
                  onClick={() => gen && setSelectedDoc(gen)}
                  className={[
                    'w-full text-left px-3 py-2 flex items-center gap-2 border-b border-border/50 transition-colors text-sm',
                    isSelected ? 'bg-brand-navy/5' : 'hover:bg-muted/40',
                    !gen ? 'opacity-50 cursor-default' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <span className={`shrink-0 text-[9px] font-bold rounded px-1 py-0.5 leading-none ${TYPE_COLOR[entry.type] ?? 'bg-gray-400 text-white'}`}>
                    {TYPE_LABEL[entry.type] ?? entry.type}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">{entry.docNo}</div>
                    <div className="text-xs text-foreground truncate">{entry.title}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 우: 미리보기 */}
        <div className="rounded-2xl border border-border overflow-hidden">
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              {/* 문서 헤더 */}
              <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">{selectedDoc.docNo} · {selectedDoc.version}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{selectedDoc.title}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <a
                    href={`/print/${encodeURIComponent(selectedDoc.docNo)}`}
                    target="_blank" rel="noopener"
                    className="text-[11px] text-muted-foreground font-medium hover:text-foreground transition-colors"
                  >
                    PDF ↗
                  </a>
                  <a
                    href={`/qms-library/${encodeURIComponent(selectedDoc.docNo)}/edit`}
                    className="text-[11px] text-brand-orange font-medium hover:text-brand-orange-hover transition-colors"
                  >
                    편집 →
                  </a>
                </div>
              </div>
              {/* 문서 내용 — 타입별 전용 렌더러 */}
              <div className="flex-1 overflow-y-auto px-4 py-4 text-sm max-h-[420px]">
                {selectedDoc.type === 'turtle' ? (
                  <TurtlePreview content={selectedDoc.content} />
                ) : selectedDoc.type === 'matrix' ? (
                  <MatrixDocPreview content={selectedDoc.content} />
                ) : selectedDoc.type === 'kpi' ? (
                  <KpiDocPreview content={selectedDoc.content} />
                ) : (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: mdToHtml(selectedDoc.content) }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center px-6 text-muted-foreground">
              <FileText className="h-8 w-8 mb-3 opacity-30" />
              {done
                ? <p className="text-sm">왼쪽 문서를 클릭하면 여기서 미리볼 수 있습니다.</p>
                : <p className="text-sm">생성 버튼을 누르면 여기서 문서 내용을 미리볼 수 있습니다.</p>
              }
            </div>
          )}
        </div>
      </div>

      {/* 관련 도구 CTA — 선택 문서가 자매 사이트와 연결될 때만 표시 */}
      {selectedDoc && (() => {
        const tool = getRelatedTool(selectedDoc.docNo)
        return tool ? <RelatedToolCTA tool={tool} size="compact" /> : null
      })()}

      {/* 생성 / 다운로드 버튼 */}
      {!done ? (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold disabled:opacity-60 hover:bg-brand-orange-hover transition-all"
        >
          {generating
            ? <><span className="animate-spin">⏳</span> 문서 생성 중…</>
            : `전체 문서 패키지 생성하기 (${docList.length}개)`}
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-border rounded-full px-5 py-3 text-sm font-semibold hover:border-brand-navy transition-colors"
          >
            <Download className="h-4 w-4" />
            전체 다운로드 (.md)
          </button>
          <Link
            href="/qms-library"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-navy text-white rounded-full px-5 py-3 text-sm font-semibold hover:bg-brand-navy-dark transition-colors"
          >
            <Library className="h-4 w-4" />
            문서 라이브러리로
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={onPrev}
        className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />이전 단계로
      </button>
    </div>
  )
}
