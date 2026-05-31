// 인쇄 전용 문서 페이지 — 표지 + 본문 + 개정 이력
// URL: /print/[docNo]  (새 탭으로 열림)
// 인쇄 다이얼로그에서 "PDF로 저장" 선택

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AutoPrint } from './AutoPrint'
import { mdToHtml } from '@/lib/qms/mdToHtml'
import type { RevisionEntry } from '@/types/qmsWizard'

const STATUS_LABEL: Record<string, string> = {
  draft: '초안', issued: '발행', obsolete: '폐기',
}

type DbDoc = {
  doc_no:           string
  type:             string
  title:            string
  version:          string
  status:           string
  content:          string
  layer:            string
  standard_clauses: string[]
  revision_history: RevisionEntry[]
  created_at:       string
  revised_at:       string
  revised_by:       string
  approved_by:      string
}

export async function generateMetadata({ params }: { params: Promise<{ docNo: string }> }) {
  const { docNo } = await params
  return { title: `${decodeURIComponent(docNo)} — 인쇄` }
}

export default async function PrintPage({ params }: { params: Promise<{ docNo: string }> }) {
  const { docNo: rawDocNo } = await params
  const docNo = decodeURIComponent(rawDocNo)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('qms_documents')
    .select('*')
    .eq('doc_no', docNo)
    .maybeSingle()

  if (error || !data) notFound()
  const doc = data as DbDoc

  const certLabel = doc.layer === 'iatf_addon'
    ? 'IATF 16949:2016'
    : doc.standard_clauses.length > 0
      ? 'ISO 9001:2015'
      : ''

  const issueDate = (doc.created_at ?? '').slice(0, 10)

  return (
    <>
      {/* 인쇄 전용 CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          @page { size: A4; margin: 20mm 18mm; }
          body { font-size: 10pt; }
          .cover { page-break-after: always; }
        }
        .md-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; }
        .md-table th { background: #F5F4F0; font-weight: 700; text-align: left; padding: 7px 10px; border: 1px solid #D1CEC7; }
        .md-table td { padding: 6px 10px; border: 1px solid #D1CEC7; vertical-align: top; }
        .md-table tr:nth-child(even) td { background: #FAFAF8; }
      `}</style>

      <AutoPrint />

      {/* 화면 전용 액션 바 */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-navy">
          {doc.doc_no} — {doc.title}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-brand-orange-hover transition-all"
          >
            PDF 저장 (Ctrl+P)
          </button>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 bg-white border border-border text-foreground rounded-full px-5 py-2 text-sm font-semibold hover:border-brand-navy/40 transition-all"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 화면 상단 여백 (액션바 높이 보상) */}
      <div className="no-print h-16" />

      {/* ── 표지 ─────────────────────────────────────── */}
      <div className="cover min-h-screen flex flex-col items-center justify-center px-16 py-24 text-center">

        {/* 아이덴티티 */}
        <p className="text-xs font-semibold tracking-widest text-brand-orange uppercase mb-10">
          품질경영시스템 문서
        </p>

        {/* 문서 번호 */}
        <p className="text-sm font-bold text-muted-foreground mb-3">
          {doc.doc_no}
        </p>

        {/* 제목 */}
        <h1
          className="text-4xl font-extrabold text-brand-navy leading-tight mb-16"
          style={{ wordBreak: 'keep-all', letterSpacing: '-0.02em', maxWidth: 560 }}
        >
          {doc.title}
        </h1>

        {/* 메타 정보 박스 */}
        <div className="w-full max-w-sm border-t-2 border-border pt-8 text-left space-y-0">
          {[
            ['버전',     doc.version],
            ['상태',     STATUS_LABEL[doc.status] ?? doc.status],
            ['발행일',   issueDate],
            ...(doc.revised_at ? [['최근 개정일', doc.revised_at]] : []),
            ...(doc.approved_by ? [['승인자', doc.approved_by]] : []),
            ...(certLabel ? [['적용 표준', certLabel]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-border text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {/* 조항 태그 */}
        {doc.standard_clauses.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-1.5">
            {doc.standard_clauses.map(c => (
              <span key={c} className="text-xs bg-brand-navy/5 text-brand-navy rounded-full px-2.5 py-0.5 font-medium">
                §{c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 본문 ─────────────────────────────────────── */}
      <article
        className="max-w-3xl mx-auto px-12 py-10 text-sm leading-relaxed text-foreground print-content"
        dangerouslySetInnerHTML={{ __html: mdToHtml(doc.content) }}
        style={{ wordBreak: 'keep-all' }}
      />

      {/* ── 개정 이력 ────────────────────────────────── */}
      {doc.revision_history.length > 0 && (
        <div className="max-w-3xl mx-auto px-12 pb-16">
          <div className="border-t-2 border-border pt-8">
            <h2 className="text-base font-extrabold text-brand-navy mb-4">개정 이력</h2>
            <table className="md-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Rev.</th>
                  <th style={{ width: 100 }}>날짜</th>
                  <th>개정 내용</th>
                  <th style={{ width: 80 }}>작성</th>
                  <th style={{ width: 80 }}>승인</th>
                </tr>
              </thead>
              <tbody>
                {doc.revision_history.map(r => (
                  <tr key={r.version}>
                    <td>{r.version}</td>
                    <td>{r.date}</td>
                    <td>{r.description}</td>
                    <td>{r.author}</td>
                    <td>{r.approver || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 본문 콘텐츠 스타일 (Tailwind prose 대신 인라인 처리) */}
      <style>{`
        .print-content h1 { font-size: 1.25rem; font-weight: 800; color: #2B4B8C; margin: 1.5rem 0 0.75rem; }
        .print-content h2 { font-size: 1rem; font-weight: 700; color: #2B4B8C; margin: 1.25rem 0 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid #E8E4DC; }
        .print-content h3 { font-size: 0.9rem; font-weight: 700; color: #1A1F2E; margin: 1rem 0 0.4rem; }
        .print-content p  { margin-bottom: 0.5rem; line-height: 1.75; }
        .print-content ul { margin: 0.5rem 0 0.5rem 1.25rem; list-style: disc; }
        .print-content li { margin-bottom: 0.25rem; line-height: 1.7; }
        .print-content hr { border: none; border-top: 1px solid #E8E4DC; margin: 1rem 0; }
        .print-content blockquote { border-left: 3px solid #F26B3A; padding-left: 0.75rem; color: #6B7280; font-style: italic; margin: 0.75rem 0; }
        .print-content code { font-family: monospace; font-size: 0.85em; background: #F5F4F0; padding: 0.1em 0.3em; border-radius: 3px; }
        .print-content strong { font-weight: 700; }
      `}</style>
    </>
  )
}
