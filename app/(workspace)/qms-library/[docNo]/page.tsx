"use client"

// 문서 상세 보기 (읽기 전용)
// spec: QMS_WIZARD_SPEC_FINAL.md §11

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { GeneratedDoc } from "@/types/qmsWizard"
import { loadDoc } from "@/lib/qms/docStorage"
import { getRelatedTool } from "@/lib/qms/relatedTools"
import RelatedToolCTA from "@/components/qms/RelatedToolCTA"
import TurtlePreview from "@/components/qms/TurtlePreview"
import MatrixDocPreview from "@/components/qms/MatrixDocPreview"
import KpiDocPreview from "@/components/qms/KpiDocPreview"
import { mdToHtml } from "@/lib/qms/mdToHtml"
import { ArrowLeft, PenLine, Printer } from "lucide-react"

const STATUS_BADGE: Record<GeneratedDoc['status'], string> = {
  draft:    'bg-amber-50 text-amber-800',
  issued:   'bg-green-50 text-green-800',
  obsolete: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL: Record<GeneratedDoc['status'], string> = {
  draft: '초안', issued: '발행', obsolete: '폐기',
}

export default function DocDetailPage() {
  const { docNo } = useParams<{ docNo: string }>()
  const [doc, setDoc] = useState<GeneratedDoc | null>(null)

  useEffect(() => {
    loadDoc(decodeURIComponent(docNo)).then(setDoc).catch(() => setDoc(null))
  }, [docNo])

  if (!doc) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground text-sm">
      문서를 찾을 수 없습니다.
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* 뒤로가기 */}
      <Link href="/qms-library"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />라이브러리로
      </Link>

      {/* 헤더 */}
      <div className="border-b border-border pb-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{doc.docNo} · {doc.version}</p>
            <h1 className="text-2xl font-extrabold text-brand-navy" style={{ wordBreak: 'keep-all' }}>
              {doc.title}
            </h1>
          </div>
          <span className={`shrink-0 text-xs font-medium rounded-full px-3 py-1 ${STATUS_BADGE[doc.status]}`}>
            {STATUS_LABEL[doc.status]}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>작성일: {doc.createdAt}</span>
          {doc.revisedAt && <span>수정일: {doc.revisedAt}</span>}
          {doc.revisedBy  && <span>수정자: {doc.revisedBy}</span>}
          {doc.standardClauses.length > 0 && (
            <span>조항: {doc.standardClauses.join(', ')}</span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Link href={`/qms-library/${docNo}/edit`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors">
            <PenLine className="h-4 w-4" />편집하기
          </Link>
          <Link href={`/print/${encodeURIComponent(doc.docNo)}`} target="_blank" rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <Printer className="h-4 w-4" />PDF 저장
          </Link>
        </div>
      </div>

      {/* 본문 — 타입별 렌더링 */}
      <div className="text-sm text-foreground">
        {doc.type === 'turtle' ? (
          <TurtlePreview content={doc.content} />
        ) : doc.type === 'matrix' ? (
          <MatrixDocPreview content={doc.content} />
        ) : doc.type === 'kpi' ? (
          <KpiDocPreview content={doc.content} />
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: mdToHtml(doc.content) }}
          />
        )}
      </div>

      {/* 관련 도구 CTA */}
      {(() => {
        const tool = getRelatedTool(doc.docNo)
        return tool ? (
          <div className="mt-12">
            <RelatedToolCTA tool={tool} size="full" />
          </div>
        ) : null
      })()}

      {/* 개정 이력 */}
      {doc.revisionHistory.length > 0 && (
        <div className="mt-12 border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">개정 이력</h2>
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold">Rev.</th>
                <th className="text-left py-2 font-semibold">날짜</th>
                <th className="text-left py-2 font-semibold">내용</th>
                <th className="text-left py-2 font-semibold">작성</th>
                <th className="text-left py-2 font-semibold">승인</th>
              </tr>
            </thead>
            <tbody>
              {doc.revisionHistory.map(r => (
                <tr key={r.version} className="border-b border-border/50">
                  <td className="py-2">{r.version}</td>
                  <td className="py-2">{r.date}</td>
                  <td className="py-2">{r.description}</td>
                  <td className="py-2">{r.author}</td>
                  <td className="py-2">{r.approver || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
