// ============================================================
// Plan → Tool access mapping + Tool definitions
// Single source of truth — imported by dashboard, ToolGrid, pricing page
// v2: Grade(free/silver/gold/platinum) → PlanId(free/starter/team/business/enterprise)
// ============================================================

export const SUPERADMIN_EMAIL = 'chulhocho@daum.net'

// ── Plan ─────────────────────────────────────────────────────
export type PlanId = 'free' | 'starter' | 'team' | 'business' | 'enterprise'

export const PLAN_LABELS: Record<PlanId, string> = {
  free:       '무료',
  starter:    'Starter',
  team:       'Team',
  business:   'Business',
  enterprise: 'Enterprise',
}

export const PLAN_COLORS: Record<PlanId, string> = {
  free:       'bg-muted text-muted-foreground',
  starter:    'bg-slate-100 text-slate-700',
  team:       'bg-amber-100 text-amber-800',
  business:   'bg-brand-navy/10 text-brand-navy',
  enterprise: 'bg-purple-100 text-purple-800',
}

// ── Tools ─────────────────────────────────────────────────────
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
    href: 'https://auditsay.com?from=qmintel',
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
    href: '/api/sso/nc-manager',
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
    href: '/api/sso/apqp-manager',
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
    href: '/api/sso/4m-change-manager',
    color: 'bg-purple-700',
  },
}

// 모든 플랜에서 선택 가능한 5개 도구 (표시 순서)
export const ALL_TOOL_IDS: ToolId[] = [
  'auditsay',
  'apqp-manager',
  'nc-manager',
  'gauge-manager',
  '4m-change-manager',
]

// v2: 모든 도구 선택 가능 (Business 전용 폐지) — SSO 라우트 fallthrough용으로 빈 배열 유지
export const PREMIUM_TOOL_IDS: ToolId[] = []

// ── Plan → Tool access ────────────────────────────────────────
// 'all'     = business/enterprise: 모든 도구 포함
// 'selectable' = starter/team: org_selected_tools 에서 확인
// []        = free: SaaS 도구 없음
export const PLAN_ACCESS: Record<PlanId, ToolId[] | 'selectable' | 'all'> = {
  free:       [],
  starter:    'selectable',
  team:       'selectable',
  business:   'all',
  enterprise: 'all',
}

/** 플랜 + 선택된 도구 목록으로 도구 잠금 여부 확인 */
export function isToolUnlocked(
  planId: string,
  toolId: ToolId,
  selectedTools: ToolId[] = []
): boolean {
  const access = PLAN_ACCESS[planId as PlanId]
  if (!access) return false
  if (access === 'all') return true
  if (access === 'selectable') return selectedTools.includes(toolId)
  return false
}

/** 이 도구를 사용하려면 최소 어떤 플랜이 필요한가 */
export function getRequiredPlan(toolId: ToolId): PlanId {
  // business 이상이면 모두 포함 → starter부터 selectable로 가능
  return 'starter'
}
