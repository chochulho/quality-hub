/**
 * 자매 사이트 도메인 → tool/plan 매핑 설정
 * `/api/signup`의 `source_domain` 파라미터 기준.
 */

export interface SourceDomainConfig {
  label: string
  /** 가입 즉시 자동 선택되는 도구 key */
  toolKey: string | null
  /** 가입 즉시 부여할 plan */
  defaultPlan: 'free' | 'starter'
  /** true = 이메일 인증 건너뜀 (즉시 이용 가능) */
  skipEmailConfirm: boolean
  /** CORS 허용 Origin 목록 */
  allowedOrigins: string[]
}

export const SOURCE_DOMAIN_CONFIG: Record<string, SourceDomainConfig> = {
  'quality-hub': {
    label: 'QMintel',
    toolKey: null,
    defaultPlan: 'free',
    skipEmailConfirm: false,
    allowedOrigins: [],  // 자체 도메인 — CORS 불필요
  },
  'auditsay': {
    label: 'AuditSay',
    toolKey: 'auditsay',
    defaultPlan: 'starter',
    skipEmailConfirm: true,
    allowedOrigins: ['https://auditsay.com', 'https://www.auditsay.com'],
  },
  'apqp': {
    label: 'APQP Manager',
    toolKey: 'apqp-manager',
    defaultPlan: 'starter',
    skipEmailConfirm: true,
    allowedOrigins: ['https://apqpmanager.com', 'https://www.apqpmanager.com'],
  },
  'gauge': {
    label: 'Gauge Manager',
    toolKey: 'gauge-manager',
    defaultPlan: 'starter',
    skipEmailConfirm: true,
    allowedOrigins: ['https://gaugemanager.com', 'https://www.gaugemanager.com'],
  },
  'nc': {
    label: 'NC Manager',
    toolKey: 'nc-manager',
    defaultPlan: 'starter',
    skipEmailConfirm: true,
    allowedOrigins: ['https://nc-manager-chi.vercel.app'],
  },
  '4m': {
    label: '4M Change Manager',
    toolKey: '4m-change-manager',
    defaultPlan: 'starter',
    skipEmailConfirm: true,
    allowedOrigins: ['https://change-manager-self.vercel.app'],
  },
}

/** 모든 허용된 외부 Origin 목록 */
export const ALL_ALLOWED_ORIGINS = Object.values(SOURCE_DOMAIN_CONFIG)
  .flatMap((c) => c.allowedOrigins)
