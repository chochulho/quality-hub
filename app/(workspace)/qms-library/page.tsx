"use client"

// QMS 문서 라이브러리 — 생성된 문서 목록 관리
// spec: QMS_WIZARD_SPEC_FINAL.md §11

import { useEffect, useState } from "react"
import Link from "next/link"
import type { GeneratedDoc, DocType } from "@/types/qmsWizard"
import { loadLibrary } from "@/lib/qms/docStorage"
import { ArrowLeft, PenLine, Eye, Download } from "lucide-react"

const STATUS_BADGE: Record<GeneratedDoc['status'], string> = {
  draft:    'bg-amber-50 text-amber-800 border border-amber-200',
  issued:   'bg-green-50 text-green-800 border border-green-200',
  obsolete: 'bg-gray-100 text-gray-500 line-through',
}

const STATUS_LABEL: Record<GeneratedDoc['status'], string> = {
  draft: '초안', issued: '발행', obsolete: '폐기',
}

const TYPE_FILTER_OPTIONS: { value: DocType | 'all'; label: string }[] = [
  { value: 'all',         label: '전체' },
  { value: 'manual',      label: '매뉴얼' },
  { value: 'process',     label: '프로세스' },
  { value: 'turtle',      label: '터틀' },
  { value: 'kpi',         label: 'KPI' },
  { value: 'matrix',      label: '매트릭스' },
  { value: 'procedure',   label: '절차서' },
  { value: 'instruction', label: '지침서' },
]

export default function QmsLibraryPage() {
  const [docs, setDocs] = useState<GeneratedDoc[]>([])
  const [statusFilter, setStatusFilter] = useState<GeneratedDoc['status'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all')

  useEffect(() => { loadLibrary().then(setDocs).catch(() => setDocs([])) }, [])

  const filtered = docs.filter(d =>
    (statusFilter === 'all' || d.status === statusFilter) &&
    (typeFilter   === 'all' || d.type   === typeFilter)
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/qms-wizard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="h-4 w-4" />마법사로 돌아가기
          </Link>
          <h1 className="text-2xl font-extrabold text-brand-navy">문서 라이브러리</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {docs.length}개 문서</p>
        </div>
        <Link href="/qms-wizard"
          className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover transition-all">
          + 새 문서 생성
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'draft', 'issued', 'obsolete'] as const).map(s => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={[
              'text-xs rounded-full px-3 py-1.5 border font-medium transition-all',
              statusFilter === s ? 'bg-brand-navy text-white border-brand-navy' : 'border-border text-muted-foreground hover:border-brand-navy/40',
            ].join(' ')}>
            {s === 'all' ? '전체 상태' : STATUS_LABEL[s]}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {TYPE_FILTER_OPTIONS.map(opt => (
          <button key={opt.value} type="button" onClick={() => setTypeFilter(opt.value)}
            className={[
              'text-xs rounded-full px-3 py-1.5 border font-medium transition-all',
              typeFilter === opt.value ? 'bg-brand-navy text-white border-brand-navy' : 'border-border text-muted-foreground hover:border-brand-navy/40',
            ].join(' ')}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 문서 그리드 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">
            {docs.length === 0
              ? '아직 생성된 문서가 없습니다. 마법사로 문서를 생성하세요.'
              : '해당 조건에 맞는 문서가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc.docNo} className="rounded-2xl border border-border p-5 hover:border-brand-navy/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">{doc.docNo}</span>
                <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${STATUS_BADGE[doc.status]}`}>
                  {STATUS_LABEL[doc.status]}
                </span>
              </div>
              <p className="font-semibold text-sm text-foreground mb-1 line-clamp-2" style={{ wordBreak: 'keep-all' }}>
                {doc.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {doc.version} · {doc.revisedAt || doc.createdAt}
              </p>
              <div className="flex gap-2 mt-4">
                <Link href={`/qms-library/${doc.docNo}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs border border-border rounded-full py-2 hover:border-brand-navy/50 transition-colors">
                  <Eye className="h-3 w-3" />보기
                </Link>
                <Link href={`/qms-library/${doc.docNo}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs border border-border rounded-full py-2 hover:border-brand-navy/50 transition-colors">
                  <PenLine className="h-3 w-3" />편집
                </Link>
                <button type="button"
                  className="flex-1 inline-flex items-center justify-center gap-1 text-xs border border-border rounded-full py-2 hover:border-brand-navy/50 transition-colors">
                  <Download className="h-3 w-3" />다운
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
