import type { DocEntry, DocType } from '@/types/qmsWizard'

// ─────────────────────────────────────────────
// 문서 번호 체계 및 선택 유틸리티
// spec: QMS_WIZARD_SPEC_FINAL.md §1 (파일 구조)
// ─────────────────────────────────────────────

// 문서 번호 prefix → 설명
export const DOC_PREFIX_MAP: Record<string, string> = {
  'QM':  '품질매뉴얼',
  'QP':  '프로세스',
  'TT':  '터틀 다이어그램',
  'KPI': 'KPI 성과표',
  'MTX': '조항-문서 매트릭스',
  'QI':  '작업지침서',
  'QF':  '양식',
}

export function getDocTypeFromNo(docNo: string): DocType {
  const prefix = docNo.split('-')[0]
  const map: Record<string, DocType> = {
    QM:  'manual',
    QP:  'process',
    TT:  'turtle',
    KPI: 'kpi',
    MTX: 'matrix',
    QI:  'instruction',
    QF:  'form',
  }
  return map[prefix] ?? 'procedure'
}

export function sortDocEntries(docs: DocEntry[]): DocEntry[] {
  const order: DocType[] = ['manual', 'process', 'turtle', 'kpi', 'matrix', 'procedure', 'instruction', 'form']
  return [...docs].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
}

// [TODO: 템플릿 파일 경로 리졸버 — content/qms-templates/{type}/{docNo}.mdx]
export function resolveTemplatePath(docNo: string, type: DocType): string {
  return `content/qms-templates/${type}/${docNo}.mdx`
}
