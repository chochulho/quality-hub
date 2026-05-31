import type { WizardState, DeptRole } from '@/types/qmsWizard'

// ─────────────────────────────────────────────
// 업무 기능 정의 + 기본 책임 매트릭스
// ISO 9001 / IATF 16949 HLS 조항 기반 21개 업무 기능
// ─────────────────────────────────────────────

export interface BizFunction {
  id: string
  label: string
  clause: string
  primaryRole: DeptRole        // ● 기본 주관 역할 (template 치환 대상)
  condition?: 'productDesign' | 'processDesign' | 'iatf'
}

export const BIZ_FUNCTIONS: BizFunction[] = [
  // ── 경영·전략 ─────────────────────────────
  { id: 'fn-policy',       label: '품질방침·목표 수립 및 검토', clause: '5.2, 6.2',    primaryRole: 'management' },
  { id: 'fn-mgmt-review',  label: '경영검토',                   clause: '9.3',         primaryRole: 'management' },
  { id: 'fn-risk',         label: '리스크·기회 관리',           clause: '6.1',         primaryRole: 'quality' },
  // ── 지원 프로세스 ─────────────────────────
  { id: 'fn-hr',           label: '인적자원·역량·교육',         clause: '7.1~7.3',     primaryRole: 'hr' },
  { id: 'fn-doc',          label: '문서·기록 관리',             clause: '7.5',         primaryRole: 'quality' },
  { id: 'fn-equip',        label: '설비 관리',                  clause: '7.1.3',       primaryRole: 'production' },
  { id: 'fn-meas',         label: '계측기 관리',                clause: '7.1.5',       primaryRole: 'quality' },
  // ── 운영 프로세스 ─────────────────────────
  { id: 'fn-customer-req', label: '고객 요구사항 검토·계약',    clause: '8.2',         primaryRole: 'sales' },
  { id: 'fn-design',       label: '설계·개발',                  clause: '8.3',         primaryRole: 'engineering', condition: 'productDesign' },
  { id: 'fn-apqp',         label: 'APQP·PFMEA',                clause: '8.3.3',        primaryRole: 'engineering', condition: 'iatf' },
  { id: 'fn-purchase',     label: '구매·공급자 관리',           clause: '8.4',         primaryRole: 'purchasing' },
  { id: 'fn-prod-plan',    label: '생산계획·일정 관리',         clause: '8.5.1',       primaryRole: 'production' },
  { id: 'fn-proc-ctrl',    label: '공정관리·작업표준',          clause: '8.5.1.2',     primaryRole: 'production' },
  { id: 'fn-logistics',    label: '출하·물류',                  clause: '8.5.4',       primaryRole: 'production' },
  // ── 품질 보증 ─────────────────────────────
  { id: 'fn-incoming',     label: '수입검사',                   clause: '8.4.3',       primaryRole: 'quality' },
  { id: 'fn-in-process',   label: '공정검사',                   clause: '8.5',         primaryRole: 'quality' },
  { id: 'fn-outgoing',     label: '출하검사',                   clause: '8.6',         primaryRole: 'quality' },
  { id: 'fn-nonconform',   label: '부적합품 관리',              clause: '8.7',         primaryRole: 'quality' },
  // ── 개선 ──────────────────────────────────
  { id: 'fn-audit',        label: '내부심사',                   clause: '9.2',         primaryRole: 'quality' },
  { id: 'fn-complaint',    label: '고객불만·시정조치',          clause: '8.2.2, 10.2', primaryRole: 'quality' },
  { id: 'fn-improve',      label: '지속적 개선',               clause: '10.3',        primaryRole: 'quality' },
]

export const FUNCTION_GROUPS = [
  { label: '경영·전략',    fnIds: ['fn-policy', 'fn-mgmt-review', 'fn-risk'] },
  { label: '지원',          fnIds: ['fn-hr', 'fn-doc', 'fn-equip', 'fn-meas'] },
  { label: '운영',          fnIds: ['fn-customer-req', 'fn-design', 'fn-apqp', 'fn-purchase', 'fn-prod-plan', 'fn-proc-ctrl', 'fn-logistics'] },
  { label: '품질보증',      fnIds: ['fn-incoming', 'fn-in-process', 'fn-outgoing', 'fn-nonconform'] },
  { label: '개선',          fnIds: ['fn-audit', 'fn-complaint', 'fn-improve'] },
]

// 기본 부서 목록
export const DEFAULT_DEPT_NAMES = ['경영진', '품질팀', '생산팀', '개발팀', '구매팀', '영업팀']

// 기본 책임 매트릭스 (deptName 기반, 초기화 시 deptId로 변환)
export const DEFAULT_MATRIX_BY_NAME: Record<string, Record<string, '●' | '○' | ''>> = {
  'fn-policy':       { '경영진': '●', '품질팀': '○' },
  'fn-mgmt-review':  { '경영진': '●', '품질팀': '○', '생산팀': '○', '개발팀': '○', '구매팀': '○', '영업팀': '○' },
  'fn-risk':         { '경영진': '○', '품질팀': '●', '생산팀': '○', '개발팀': '○', '구매팀': '○' },
  'fn-hr':           { '경영진': '○', '품질팀': '○' },
  'fn-doc':          { '품질팀': '●' },
  'fn-equip':        { '생산팀': '●', '품질팀': '○' },
  'fn-meas':         { '품질팀': '●', '생산팀': '○' },
  'fn-customer-req': { '영업팀': '●', '품질팀': '○' },
  'fn-design':       { '개발팀': '●', '품질팀': '○' },
  'fn-apqp':         { '개발팀': '●', '품질팀': '●', '생산팀': '○' },
  'fn-purchase':     { '구매팀': '●', '품질팀': '○' },
  'fn-prod-plan':    { '생산팀': '●', '영업팀': '○', '품질팀': '○' },
  'fn-proc-ctrl':    { '생산팀': '●', '품질팀': '○', '개발팀': '○' },
  'fn-logistics':    { '생산팀': '●', '영업팀': '○', '품질팀': '○' },
  'fn-incoming':     { '품질팀': '●', '구매팀': '○' },
  'fn-in-process':   { '품질팀': '●', '생산팀': '○' },
  'fn-outgoing':     { '품질팀': '●', '생산팀': '○' },
  'fn-nonconform':   { '품질팀': '●', '생산팀': '○' },
  'fn-audit':        { '품질팀': '●' },
  'fn-complaint':    { '품질팀': '●', '영업팀': '○' },
  'fn-improve':      { '경영진': '○', '품질팀': '●', '생산팀': '○', '개발팀': '○', '구매팀': '○', '영업팀': '○' },
}

// WizardState(scope + certTarget) 기반 활성 함수 목록
export function getActiveFunctions(state: WizardState): BizFunction[] {
  return BIZ_FUNCTIONS.filter(fn => {
    if (!fn.condition) return true
    if (fn.condition === 'productDesign') return state.scope.productDesign
    if (fn.condition === 'processDesign') return state.scope.processDesign
    if (fn.condition === 'iatf')          return state.certTarget.includes('IATF16949')
    return true
  })
}

// 매트릭스 ●/○ 셀 클릭 시 순환
export function cycleCell(cur: '' | '●' | '○'): '' | '●' | '○' {
  if (cur === '')  return '●'
  if (cur === '●') return '○'
  return ''
}
