// ============================================================
// Grade → Tool access mapping + Pricing config
// Single source of truth — imported by dashboard, ToolGrid, pricing page
// ============================================================

export type Grade = 'free' | 'silver' | 'gold' | 'platinum'

export type ToolId =
  | 'auditsay'
  | 'nc-manager'
  | 'apqp-manager'
  | 'gauge-manager'
  | '4m-change-manager'

export interface ToolDef {
  id: ToolId
  name: string
  tagline: string
  description: string
  features: string[]
  href: string
  color: string  // Tailwind bg class
}

// Canonical tool definitions (replaces inline array in ToolGrid.tsx)
export const TOOLS: Record<ToolId, ToolDef> = {
  'auditsay': {
    id: 'auditsay',
    name: 'AuditSay',
    tagline: '심사 통합 SaaS',
    description:
      'IATF 16949·VDA 6.3·ISO 9001/14001/45001 등 10가지 심사 프로그램을 하나에서 관리합니다. LPA·협력사 심사·EHS 안전점검까지 통합하고, AI가 부적합 보고서 초안을 자동 생성합니다.',
    features: [
      'IATF 16949 · VDA 6.3 · ISO 9001/14001/45001',
      'LPA · 협력사 심사 · 5S 체크리스트',
      'AI 부적합 보고서 초안 자동 생성',
      '연간 심사 계획 · 심사원 관리 · EHS 안전관리',
    ],
    href: 'https://auditsay.com',
    color: 'bg-brand-navy',
  },
  'nc-manager': {
    id: 'nc-manager',
    name: 'NC Manager',
    tagline: '부적합·클레임·CAPA',
    description:
      '내부 부적합과 고객 클레임을 8D 방법론으로 관리합니다. SLA 기한 추적, PPM·COPQ 비용 분석, 5Why·Fishbone 원인분석을 지원하며 8D 보고서를 PDF로 즉시 출력합니다.',
    features: [
      '내부 부적합 · 고객 클레임 8D 관리',
      'SLA 추적 · PPM · COPQ 비용 분석',
      '5Why · Fishbone · Is/IsNot 원인분석',
      '8D 보고서 PDF 자동 출력',
    ],
    href: 'https://nc-manager-chi.vercel.app',
    color: 'bg-red-700',
  },
  'apqp-manager': {
    id: 'apqp-manager',
    name: 'APQP Manager',
    tagline: 'APQP 문서 관리',
    description:
      'PFD → PFMEA → CP → WI → Check Sheet 5문서를 자동 연동합니다. Claude AI로 문서 초안을 생성하고, 기존 Excel·PDF FMEA를 AI가 파싱해 PPAP 18개 요소를 자동 완성합니다.',
    features: [
      'PFD·PFMEA·CP·WI·Check Sheet 5문서 자동 연동',
      'Claude AI 문서 초안 생성 + Excel/PDF 파싱',
      'PPAP 18개 요소 자동화 · Gate Review',
      'AI 다국어 번역 (영어·중국어·베트남어)',
    ],
    href: 'https://apqpmanager.com',
    color: 'bg-brand-orange',
  },
  'gauge-manager': {
    id: 'gauge-manager',
    name: 'Gauge Manager',
    tagline: '측정기기 관리',
    description:
      'AI가 PDF 교정 성적서를 자동 파싱하고 만료 30일·7일 전 자동 알림을 발송합니다. GR&R·측정 불확도 분석을 원클릭으로 실행하고, QR코드 스캔으로 현장에서 교정 이력을 즉시 조회합니다.',
    features: [
      'AI PDF 성적서 자동 파싱 (정확도 95%+)',
      '만료 30일 · 7일 전 자동 알림',
      'GR&R · 측정 불확도 원클릭 보고서',
      'QR코드 스캔 현장 실시간 조회',
    ],
    href: 'https://gaugemanager.com',
    color: 'bg-green-700',
  },
  '4m-change-manager': {
    id: '4m-change-manager',
    name: '4M Change Manager',
    tagline: '변경관리 (IATF 8.5.6)',
    description:
      '4M 변경을 Minor/Standard/Major로 자동 분류하고, 6개 부서가 병렬 검토합니다. AI가 AIAG-VDA 형식 고객 통보 문서를 영문 번역까지 자동 생성해 IATF 8.5.6을 완전 이행합니다.',
    features: [
      '위험도 자동 분류 · 6개 부서 병렬 검토',
      'AI 고객 통보 문서 초안 + 자동 영문 번역',
      'EO 번호 연동 · LOT 역추적',
      '초기 유동 1 · 3 · 6개월 모니터링',
    ],
    href: 'https://change-manager-self.vercel.app',
    color: 'bg-purple-700',
  },
}

// All tool IDs in display order
export const ALL_TOOL_IDS: ToolId[] = [
  'auditsay',
  'nc-manager',
  'apqp-manager',
  'gauge-manager',
  '4m-change-manager',
]

// Grade → unlocked tools
export const GRADE_TOOLS: Record<Grade, ToolId[]> = {
  free:     [],
  silver:   ['auditsay', 'nc-manager'],
  gold:     ['auditsay', 'nc-manager', 'apqp-manager'],
  platinum: ['auditsay', 'nc-manager', 'apqp-manager', 'gauge-manager', '4m-change-manager'],
}

export function getUnlockedTools(grade: Grade): ToolDef[] {
  return GRADE_TOOLS[grade].map((id) => TOOLS[id])
}

export function isToolUnlocked(grade: Grade, toolId: ToolId): boolean {
  return GRADE_TOOLS[grade].includes(toolId)
}

/** 해당 도구를 최초로 해금하는 등급 반환 */
export function getRequiredGrade(toolId: ToolId): Grade {
  const order: Grade[] = ['silver', 'gold', 'platinum']
  for (const grade of order) {
    if (GRADE_TOOLS[grade].includes(toolId)) return grade
  }
  return 'platinum'
}

// ── Pricing ──────────────────────────────────────────────────

export interface PricingTier {
  id: Grade
  name: string
  label: string       // 타겟 고객 한 줄 설명
  monthlyKRW: number | null
  annualKRW: number | null   // 연간 결제 시 월 환산액
  toolCount: number
  highlight: boolean   // "추천" 배지
  features: string[]
  ctaLabel: string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: '무료',
    label: '학습 + 내장 품질 도구 체험',
    monthlyKRW: null,
    annualKRW: null,
    toolCount: 0,
    highlight: false,
    features: [
      '품질 학습 위키 전체 무료',
      'SPC · QC7 · QFD · VSM · Kanban 도구',
      '자매 도구 미리보기',
      '회원 가입 필요 없음',
    ],
    ctaLabel: '무료로 시작',
  },
  {
    id: 'silver',
    name: 'Silver',
    label: '중소 제조업 기본 구성',
    monthlyKRW: 49000,
    annualKRW: 44000,
    toolCount: 2,
    highlight: false,
    features: [
      'AuditSay — IATF·ISO 심사 체크리스트',
      'NC Manager — 부적합·CAPA 관리',
      '이메일 지원',
      '개인/기업 모두 가입 가능',
    ],
    ctaLabel: 'Silver 시작하기',
  },
  {
    id: 'gold',
    name: 'Gold',
    label: '자동차 부품사 표준 구성',
    monthlyKRW: 99000,
    annualKRW: 89000,
    toolCount: 3,
    highlight: true,
    features: [
      'Silver 전체 포함',
      'APQP Manager — PFMEA·PPAP 5문서',
      '이메일·채팅 지원',
      '기업 팀원 초대 (출시 예정)',
    ],
    ctaLabel: 'Gold 시작하기',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    label: '전체 품질시스템 통합',
    monthlyKRW: 199000,
    annualKRW: 179000,
    toolCount: 5,
    highlight: false,
    features: [
      'Gold 전체 포함',
      'Gauge Manager — 검교정·MSA',
      '4M Change Manager — 변경관리',
      '5가지 도구 완전 접근 + SSO 예약',
    ],
    ctaLabel: 'Platinum 시작하기',
  },
]

export const GRADE_LABELS: Record<Grade, string> = {
  free:     '무료',
  silver:   'Silver',
  gold:     'Gold',
  platinum: 'Platinum',
}

export const GRADE_COLORS: Record<Grade, string> = {
  free:     'bg-muted text-muted-foreground',
  silver:   'bg-slate-100 text-slate-700',
  gold:     'bg-amber-100 text-amber-800',
  platinum: 'bg-brand-navy/10 text-brand-navy',
}

export const SUPERADMIN_EMAIL = 'chulhocho@daum.net'
