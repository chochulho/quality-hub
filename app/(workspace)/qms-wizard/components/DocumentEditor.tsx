"use client"

// [TODO: DocumentEditor — MDX 소스 직접 편집 + 미리보기 토글]
// spec: QMS_WIZARD_SPEC_FINAL.md §8-2
// 재사용처: Step5 미리보기 인라인 편집 + /qms-library/[docNo]/edit

import { useState } from "react"
import type { GeneratedDoc } from "@/types/qmsWizard"
import { incrementVersion } from "@/lib/qms/docStorage"
import { Eye, Code } from "lucide-react"

export interface DocumentEditorProps {
  doc: GeneratedDoc
  mode: 'inline' | 'fullpage'
  onSave: (updated: GeneratedDoc) => void
}

export default function DocumentEditor({ doc, mode, onSave }: DocumentEditorProps) {
  const [content, setContent]   = useState(doc.content)
  const [preview, setPreview]   = useState(false)
  const [showRevDialog, setShowRevDialog] = useState(false)
  const [revDesc, setRevDesc]   = useState('')
  const [revAuthor, setRevAuthor] = useState('')

  function handleSave() {
    if (content === doc.content) return
    setShowRevDialog(true)
  }

  function confirmSave() {
    const newVersion = incrementVersion(doc.version)
    const updated: GeneratedDoc = {
      ...doc,
      content,
      version: newVersion,
      revisedAt: new Date().toISOString().split('T')[0],
      revisedBy: revAuthor,
      status: 'issued',
      revisionHistory: [
        {
          version: newVersion,
          date: new Date().toISOString().split('T')[0],
          description: revDesc,
          author: revAuthor,
          approver: '',
        },
        ...doc.revisionHistory,
      ],
    }
    onSave(updated)
    setShowRevDialog(false)
    setRevDesc('')
    setRevAuthor('')
  }

  const containerClass = mode === 'fullpage'
    ? 'max-w-3xl mx-auto py-8 px-4'
    : 'rounded-2xl border border-border p-4'

  return (
    <div className={containerClass}>
      {/* 도구 모음 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground">
          {doc.docNo} — {doc.version}
        </span>
        <button
          type="button"
          onClick={() => setPreview(p => !p)}
          className="inline-flex items-center gap-1.5 text-xs text-brand-navy font-medium"
        >
          {preview ? <><Code className="h-3.5 w-3.5" />편집</> : <><Eye className="h-3.5 w-3.5" />미리보기</>}
        </button>
      </div>

      {preview ? (
        // [TODO: MDXRemote 미리보기]
        <div className="prose max-w-none text-sm whitespace-pre-wrap border border-border rounded-xl p-4 min-h-[200px]">
          {content}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:border-brand-navy transition-colors"
        />
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={content === doc.content}
          className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-brand-orange-hover transition-all"
        >
          저장 및 개정
        </button>
      </div>

      {/* 개정 사유 다이얼로그 */}
      {showRevDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-extrabold text-brand-navy mb-4">개정 정보 입력</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={revDesc}
                onChange={e => setRevDesc(e.target.value)}
                placeholder="개정 사유 (예: 내부심사 지적 반영)"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy"
              />
              <input
                type="text"
                value={revAuthor}
                onChange={e => setRevAuthor(e.target.value)}
                placeholder="작성자"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy"
              />
              <p className="text-xs text-muted-foreground">
                ※ 저장 시 {doc.version} → {incrementVersion(doc.version)} 자동 증가
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowRevDialog(false)}
                className="flex-1 border border-border rounded-full py-2.5 text-sm font-semibold">취소</button>
              <button type="button" onClick={confirmSave} disabled={!revDesc.trim() || !revAuthor.trim()}
                className="flex-1 bg-brand-orange text-white rounded-full py-2.5 text-sm font-semibold disabled:opacity-40">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
