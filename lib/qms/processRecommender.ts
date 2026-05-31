import type { WizardState, DocEntry, DocType } from '@/types/qmsWizard'

// ─────────────────────────────────────────────
// 규모·범위·표준별 문서 목록 추천
// spec: QMS_WIZARD_SPEC_FINAL.md §4, §7
// ─────────────────────────────────────────────

// HLS 공통: 모든 표준(ISO 9001, IATF, 향후 14001/45001)에서 필수
const HLS_PROCESSES: DocEntry[] = [
  { docNo: 'QP-MR01', title: '경영검토 프로세스',    type: 'process', layer: 'hls' },
  { docNo: 'QP-A01',  title: '내부심사 프로세스',    type: 'process', layer: 'hls' },
  { docNo: 'QP-CA01', title: '시정조치 프로세스',    type: 'process', layer: 'hls' },
  { docNo: 'QP-DC01', title: '문서·기록 관리',       type: 'process', layer: 'hls' },
]

// ISO 9001 기반 (ISO 9001 + IATF 공통)
const ISO9001_BASE: DocEntry[] = [
  { docNo: 'QP-C01',  title: '고객불만 및 시정조치', type: 'process', layer: 'iso9001' },
  { docNo: 'QP-HR01', title: '인적자원 관리',        type: 'process', layer: 'iso9001' },
]

const MEDIUM_PROCESSES: DocEntry[] = [
  { docNo: 'QP-PU01', title: '구매 관리',    type: 'process', layer: 'iso9001' },
  { docNo: 'QP-OUT1', title: '외주 관리',    type: 'process', layer: 'iso9001' },
  { docNo: 'QP-EQ01', title: '설비 관리',    type: 'process', layer: 'iso9001' },
  { docNo: 'QP-MS01', title: '계측기 관리',  type: 'process', layer: 'iso9001' },
]

const BY_SIZE: Record<WizardState['employeeCount'], DocEntry[]> = {
  small: [
    { docNo: 'QP-PO01', title: '구매 및 외주 관리 (통합)',   type: 'process', layer: 'iso9001' },
    { docNo: 'QP-PM01', title: '설비·계측기 관리 (통합)',    type: 'process', layer: 'iso9001' },
  ],
  medium: MEDIUM_PROCESSES,
  large: [
    ...MEDIUM_PROCESSES,
    { docNo: 'QP-PR01', title: '생산계획 관리',   type: 'process', layer: 'iso9001' },
    { docNo: 'QP-WH01', title: '창고·물류 관리',  type: 'process', layer: 'iso9001' },
  ],
}

function scopeDocs(state: WizardState): DocEntry[] {
  const isIATF = state.certTarget.includes('IATF16949')

  return [
    // 설계개발: ISO 9001 8.3 기반, APQP/PFMEA는 IATF 추가요구사항
    ...(state.scope.productDesign ? [
      { docNo: 'QP-D01', title: '설계개발 프로세스', type: 'process' as DocType, layer: 'iso9001' as const },
      ...(isIATF ? [
        { docNo: 'QP-D02', title: 'APQP 프로세스',  type: 'process' as DocType, layer: 'iatf_addon' as const },
        { docNo: 'QP-D03', title: 'PFMEA 관리',     type: 'process' as DocType, layer: 'iatf_addon' as const },
      ] : []),
    ] : []),
    // 공정설계: PFMEA는 IATF 추가요구사항
    ...(state.scope.processDesign ? [
      ...(isIATF ? [
        { docNo: 'QP-D04', title: '공정설계·PFMEA', type: 'process' as DocType, layer: 'iatf_addon' as const },
      ] : []),
    ] : []),
    // 외주: ISO 9001 8.4 기반
    ...(state.scope.outsourcing ? [
      { docNo: 'QP-S01', title: '협력사 평가·관리', type: 'process' as DocType, layer: 'iso9001' as const },
      { docNo: 'QP-S02', title: '외주품 수입검사',  type: 'process' as DocType, layer: 'iso9001' as const },
    ] : []),
    // A/S: ISO 9001 9.1.2 기반
    ...(state.scope.afterSales ? [
      { docNo: 'QP-CS01', title: '고객만족·A/S 관리', type: 'process' as DocType, layer: 'iso9001' as const },
    ] : []),
  ]
}

function generateTurtles(processes: DocEntry[]): DocEntry[] {
  return processes
    .filter(p => p.type === 'process')
    .map(p => ({
      docNo: `TT-${p.docNo.replace('QP-', '')}`,
      title: `${p.title} — 터틀 다이어그램`,
      type: 'turtle' as DocType,
      layer: p.layer,
    }))
}

export function recommendInstructions(state: WizardState): DocEntry[] {
  const option = getInstructionOption(state)

  if (option === 'A') return []

  if (option === 'B') {
    return [
      { docNo: 'QI-P01', title: '수입검사 지침',    type: 'instruction', layer: 'iso9001' },
      { docNo: 'QI-P02', title: '공정검사 지침',    type: 'instruction', layer: 'iso9001' },
      { docNo: 'QI-P03', title: '출하검사 지침',    type: 'instruction', layer: 'iso9001' },
      { docNo: 'QI-E01', title: '설비점검 지침',    type: 'instruction', layer: 'iso9001' },
      { docNo: 'QI-M01', title: '계측기 교정 지침', type: 'instruction', layer: 'iso9001' },
      ...(state.scope.productDesign ? [
        { docNo: 'QI-D01', title: '도면 관리 지침', type: 'instruction' as DocType, layer: 'iso9001' as const },
      ] : []),
    ]
  }

  // option === 'C': 빈 양식 템플릿만 제공
  return [
    { docNo: 'QI-TMPL', title: '지침서 표준 양식 (작성 가이드 포함)', type: 'instruction', layer: 'iso9001' },
  ]
}

function getInstructionOption(state: WizardState): 'A' | 'B' | 'C' {
  if (state.employeeCount === 'small' && !state.scope.productDesign) return 'A'
  if (state.employeeCount === 'large') return 'C'
  return 'B'
}

export function recommendProcesses(state: WizardState): DocEntry[] {
  const allProcesses: DocEntry[] = [
    ...HLS_PROCESSES,
    ...ISO9001_BASE,
    ...(BY_SIZE[state.employeeCount] ?? []),
    ...scopeDocs(state),
  ]

  const matrixTitle = state.certTarget.includes('IATF16949')
    ? 'ISO 9001/IATF 16949 조항-문서 매트릭스'
    : 'ISO 9001:2015 조항-문서 매트릭스'

  return [
    { docNo: 'QM-001',  title: '품질경영 매뉴얼',  type: 'manual',  layer: 'iso9001' },
    ...allProcesses,
    ...generateTurtles(allProcesses),
    { docNo: 'KPI-001', title: 'KPI 성과표',       type: 'kpi',     layer: 'iso9001' },
    { docNo: 'MTX-001', title: matrixTitle,         type: 'matrix',  layer: 'iso9001' },
    ...recommendInstructions(state),
  ]
}
