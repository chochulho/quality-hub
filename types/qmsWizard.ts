// ─────────────────────────────────────────────
// QMS Wizard 전역 타입 정의
// spec: QMS_WIZARD_SPEC_FINAL.md §2
// ─────────────────────────────────────────────

// 지원 표준 — 향후 ISO14001/45001 확장 대비
export type StandardKey = 'ISO9001' | 'IATF16949' | 'ISO14001' | 'ISO45001'

// 문서 계층 — 어느 표준 레이어에 속하는지
// hls        : HLS 공통 (문서관리·내부심사·경영검토·시정조치) — 모든 표준에서 필수
// iso9001    : ISO 9001 기반 (+ IATF 포함)
// iatf_addon : IATF 16949 추가요구사항 전용 (APQP, PFMEA 등)
// iso14001   : ISO 14001 전용 (환경경영) — 향후
// iso45001   : ISO 45001 전용 (안전보건경영) — 향후
export type DocLayer = 'hls' | 'iso9001' | 'iatf_addon' | 'iso14001' | 'iso45001'

export type DocType =
  | 'manual' | 'turtle' | 'process' | 'kpi'
  | 'procedure' | 'instruction' | 'matrix' | 'form'

export type DeptRole =
  | 'management' | 'quality' | 'production'
  | 'sales' | 'engineering' | 'purchasing' | 'hr'

export interface Department {
  id: string
  name: string
  roles: DeptRole[]
}

export interface RevisionEntry {
  version: string
  date: string
  description: string
  author: string
  approver: string
}

export interface GeneratedDoc {
  docNo: string
  type: DocType
  title: string
  content: string           // Markdown 텍스트 (치환 완료)
  version: string           // 'Rev.00'
  createdAt: string         // ISO date
  revisedAt: string
  revisedBy: string
  approvedBy: string
  status: 'draft' | 'issued' | 'obsolete'
  revisionHistory: RevisionEntry[]
  standardClauses: string[] // 커버하는 표준 조항 번호 (ISO 9001/IATF 공통 체계 4.x~10.x)
  layer: DocLayer
}

export interface WizardState {
  // Step 1
  companyName: string
  industry: 'automotive' | 'electronics' | 'machinery' | 'other'
  employeeCount: 'small' | 'medium' | 'large'  // ≤50 / 51~200 / 200+
  certTarget: StandardKey[]

  // Step 2
  scope: {
    productDesign: boolean
    processDesign: boolean
    manufacturing: boolean
    assembly: boolean
    outsourcing: boolean
    afterSales: boolean
  }

  // Step 3
  departments: Department[]
  // orgMatrix: functionId → deptId → '●' | '○' | ''  (Step3 매트릭스 저장)
  orgMatrix: Record<string, Record<string, '●' | '○' | ''>>

  // Step 4
  qualityPolicy: string

  // 생성 결과
  generatedDocs: GeneratedDoc[] | null
}

// ─────────────────────────────────────────────
// 라이브러리 / 추천 관련 보조 타입
// ─────────────────────────────────────────────

export interface DocEntry {
  docNo: string
  title: string
  type: DocType
  layer: DocLayer
}

export interface KpiItem {
  processDocNo: string
  name: string
  type: 'effectiveness' | 'efficiency'
  formula: string
  target: string
  frequency: 'monthly' | 'quarterly' | 'annual'
  owner: string  // {{dept_xxx}} placeholder 또는 실제 부서명
}

export interface MatrixCell {
  clauseNo: string
  docNo: string
  coverage: '✓' | '△' | ''
}

// ─────────────────────────────────────────────
// 초기값 헬퍼
// ─────────────────────────────────────────────

export const INITIAL_WIZARD_STATE: WizardState = {
  companyName: '',
  industry: 'automotive',
  employeeCount: 'small',
  certTarget: ['IATF16949'],
  scope: {
    productDesign: false,
    processDesign: false,
    manufacturing: true,
    assembly: false,
    outsourcing: false,
    afterSales: false,
  },
  departments: [],
  orgMatrix: {},
  qualityPolicy: '',
  generatedDocs: null,
}

// ─────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────

export function hasIATF(state: WizardState): boolean {
  return state.certTarget.includes('IATF16949')
}

export function getMatrixTitle(certTarget: StandardKey[]): string {
  if (certTarget.includes('IATF16949')) return 'ISO 9001/IATF 16949 조항-문서 매트릭스'
  if (certTarget.includes('ISO9001'))   return 'ISO 9001:2015 조항-문서 매트릭스'
  return '조항-문서 매트릭스'
}
