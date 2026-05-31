"use client"

// 문서 편집 페이지 (fullpage DocumentEditor)
// spec: QMS_WIZARD_SPEC_FINAL.md §11, §8-2

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { GeneratedDoc } from "@/types/qmsWizard"
import { loadDoc, saveDoc } from "@/lib/qms/docStorage"
import DocumentEditor from "@/app/(workspace)/qms-wizard/components/DocumentEditor"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DocEditPage() {
  const { docNo } = useParams<{ docNo: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<GeneratedDoc | null>(null)

  useEffect(() => {
    loadDoc(decodeURIComponent(docNo)).then(setDoc).catch(() => setDoc(null))
  }, [docNo])

  if (!doc) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground text-sm">
      문서를 찾을 수 없습니다.
    </div>
  )

  async function handleSave(updated: GeneratedDoc) {
    await saveDoc(updated)
    router.push(`/qms-library/${encodeURIComponent(updated.docNo)}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href={`/qms-library/${docNo}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />문서 보기로
      </Link>
      <DocumentEditor doc={doc} mode="fullpage" onSave={handleSave} />
    </div>
  )
}
