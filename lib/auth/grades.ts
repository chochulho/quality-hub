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
    tagline: '심사 SaaS',
    description:
      'AI가 IATF·ISO·VDA 기준 심사 체크리스트를 즉시 생성합니다. PDF 파싱으로 문서를 자동 분석하고, AI 챗봇이 현장 질의에 답하며 심사보고서까지 자동 작성합니다.',
    features: [
      'AI 심사보고서 자동 작성',
      'PDF 업로드 · 문서 즉시 분석',
      'AI 챗봇 현장 질의응답',
      '모바일 최적화 · 실시간 알림',
    ],
    href: 'https://auditsay.com',
    color: 'bg-brand-navy',
  },
  'nc-manager': {
    id: 'nc-manager',
    name: 'NC Manager',
    tagline: '부적합·클레임·CAPA',
    description:
      '부적합 접수부터 CAPA 종결까지 AI가 원인 분석과 조치를 제안합니다. 모바일 현장 즉시 접수, 고객 클레임 실시간 추적, 자동 보고서 생성까지 한 흐름으로 처리합니다.',
    features: [
      'AI 원인분석 · CAPA 조치 제안',
      '모바일 현장 즉시 접수',
      '고객 클레임 실시간 추적',
      '통계 대시보드 · 자동 보고서',
    ],
    href: 'https://nc-manager-chi.vercel.app',
    color: 'bg-red-700',
  },
  'apqp-manager': {
    id: 'apqp-manager',
    name: 'APQP Manager',
    tagline: 'APQP 문서 관리',
    description:
      'PFMEA에서 PPAP까지 5문서를 자동 연동합니다. AI가 위험도를 분석하고 Control Plan을 자동 생성, 승인 워크플로우까지 자동화해 APQP 전 과정을 한 플랫폼에서 완결합니다.',
    features: [
      'AI PFMEA 위험도 분석',
      '5문서 자동 연동 · PPAP 패키지',
      '승인 워크플로우 자동화',
      '모바일 진행 현황 실시간 확인',
    ],
    href: 'https://apqpmanager.com',
    color: 'bg-brand-orange',
  },
  'gauge-manager': {
    id: 'gauge-manager',
    name: 'Gauge Manager',
    tagline: '게이지 관리',
    description:
      '검교정 만료 전 AI가 자동 알림을 발송하고 MSA 분석 결과를 즉시 리포트로 제공합니다. 측정기 전체 이력을 디지털로 관리해 IATF 감사에 바로 대응합니다.',
    features: [
      '검교정 만료 전 자동 알림',
      'MSA 분석 · 즉시 리포트',
      '측정기 이력 디지털 관리',
      '모바일 조회 · IATF 8.4 대응',
    ],
    href: 'https://gaugemanager.com',
    color: 'bg-green-700',
  },
  '4m-change-manager': {
    id: '4m-change-manager',
    name: '4M Change Manager',
    tagline: '변경관리 (IATF 8.5.6)',
    description:
      'AI가 4M 변경의 위험도를 자동 분류하고 담당자에게 즉시 알림을 발송합니다. IATF 8.5.6 고객 통보 프로세스를 완전 자동화해 누락 없는 변경관리를 실현합니다.',
    features: [
      'AI 변경 위험도 자동 분류',
      '담당자 실시간 알림 · 모바일',
      'IATF 8.5.6 고객 통보 자동화',
      'EO 번호 연계 · 변경 이력 관리',
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
