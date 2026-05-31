import type { GeneratedDoc, RevisionEntry } from '@/types/qmsWizard'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────
// Supabase 기반 QMS 문서 저장소
// spec: QMS_WIZARD_SPEC_FINAL.md §8-4
// 테이블: qms_documents (20260531_qms_documents.sql)
// ─────────────────────────────────────────────

// DB 행 타입 (snake_case → camelCase 매핑용)
interface DbRow {
  doc_no:           string
  type:             string
  title:            string
  content:          string
  version:          string
  status:           string
  standard_clauses: string[]
  layer:            string
  revision_history: RevisionEntry[]
  revised_at:       string
  revised_by:       string
  approved_by:      string
  created_at:       string
}

function rowToDoc(row: DbRow): GeneratedDoc {
  return {
    docNo:           row.doc_no,
    type:            row.type            as GeneratedDoc['type'],
    title:           row.title,
    content:         row.content,
    version:         row.version,
    status:          row.status          as GeneratedDoc['status'],
    standardClauses: row.standard_clauses ?? [],
    layer:           row.layer           as GeneratedDoc['layer'],
    revisionHistory: row.revision_history ?? [],
    revisedAt:       row.revised_at  ?? '',
    revisedBy:       row.revised_by  ?? '',
    approvedBy:      row.approved_by ?? '',
    // DB의 timestamptz → 날짜 문자열(YYYY-MM-DD)
    createdAt:       (row.created_at ?? '').slice(0, 10),
  }
}

// auth_org_id() RPC로 현재 사용자의 org_id 조회
async function getOrgId(): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('auth_org_id')
  if (error || !data) return null
  return data as string
}

// ── 공개 API ────────────────────────────────────────────────────────────────

export async function saveDoc(doc: GeneratedDoc): Promise<void> {
  const supabase = createClient()
  const orgId = await getOrgId()
  if (!orgId) return

  await supabase
    .from('qms_documents')
    .upsert(
      {
        org_id:           orgId,
        doc_no:           doc.docNo,
        type:             doc.type,
        title:            doc.title,
        content:          doc.content,
        version:          doc.version,
        status:           doc.status,
        standard_clauses: doc.standardClauses,
        layer:            doc.layer,
        revision_history: doc.revisionHistory,
        revised_at:       doc.revisedAt,
        revised_by:       doc.revisedBy,
        approved_by:      doc.approvedBy,
      },
      { onConflict: 'org_id,doc_no' }
    )
}

export async function loadLibrary(): Promise<GeneratedDoc[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('qms_documents')
    .select('*')
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return (data as DbRow[]).map(rowToDoc)
}

export async function loadDoc(docNo: string): Promise<GeneratedDoc | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('qms_documents')
    .select('*')
    .eq('doc_no', docNo)
    .maybeSingle()
  if (error || !data) return null
  return rowToDoc(data as DbRow)
}

export async function deleteDoc(docNo: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('qms_documents')
    .delete()
    .eq('doc_no', docNo)
}

export async function saveLibrary(docs: GeneratedDoc[]): Promise<void> {
  await Promise.all(docs.map(saveDoc))
}

// 'Rev.00' → 'Rev.01' (순수 함수 — 동기 유지)
export function incrementVersion(current: string): string {
  const num = parseInt(current.replace('Rev.', ''), 10)
  return `Rev.${String(num + 1).padStart(2, '0')}`
}
