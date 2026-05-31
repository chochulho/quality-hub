import type { WizardState, DeptRole } from '@/types/qmsWizard'

// ─────────────────────────────────────────────
// 단순 치환 + 조건부 섹션 템플릿 엔진
// spec: QMS_WIZARD_SPEC_FINAL.md §9
// ─────────────────────────────────────────────
// 조건부 구문:
//   {{#if scope.productDesign}} … {{/if}}   — WizardState 필드 경로
//   {{#if cert.iatf}}           … {{/if}}   — IATF 16949 선택 시
//   {{#if cert.iso9001}}        … {{/if}}   — ISO 9001 선택 시 (IATF 포함)
//   {{#if cert.iso14001}}       … {{/if}}   — ISO 14001 선택 시 (향후)
//   {{#if cert.iso45001}}       … {{/if}}   — ISO 45001 선택 시 (향후)
// ─────────────────────────────────────────────

export function renderTemplate(raw: string, state: WizardState): string {
  let result = raw

  // 1. 단순 플레이스홀더 치환
  const vars: Record<string, string> = {
    company_name:       state.companyName,
    created_at:         new Date().toISOString().split('T')[0],
    cert_target:        state.certTarget.join(', '),
    cert_target_iatf:   state.certTarget.includes('IATF16949') ? 'IATF 16949:2016' : '',
    cert_target_iso:    state.certTarget.includes('ISO9001')   ? 'ISO 9001:2015'   : '',
    quality_policy:     state.qualityPolicy || '[품질방침을 입력하세요]',
    employee_count:     { small: '50명 이하', medium: '51~200명', large: '200명 초과' }[state.employeeCount],
    industry:           { automotive: '자동차 부품', electronics: '전자 부품', machinery: '기계 부품', other: '제조업' }[state.industry],
    rev_no:             'Rev.00',
    dept_management:    getDept(state, 'management',  '경영진'),
    dept_quality:       getDept(state, 'quality',     '품질팀'),
    dept_production:    getDept(state, 'production',  '생산팀'),
    dept_sales:         getDept(state, 'sales',       '영업팀'),
    dept_engineering:   getDept(state, 'engineering', '개발팀'),
    dept_purchasing:    getDept(state, 'purchasing',  '구매팀'),
    dept_hr:            getDept(state, 'hr',          '인사팀'),
  }

  for (const [k, v] of Object.entries(vars)) {
    result = result.replaceAll(`{{${k}}}`, v)
  }

  // 2. 조건부 섹션 {{#if …}}…{{/if}}
  const condRegex = /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g
  result = result.replace(condRegex, (_, cond, content) =>
    evalCond(cond.trim(), state) ? content : ''
  )

  return result
}

function getDept(state: WizardState, role: DeptRole, fallback: string): string {
  return state.departments.find(d => d.roles.includes(role))?.name ?? fallback
}

function evalCond(cond: string, state: WizardState): boolean {
  // cert.* 조건: certTarget 배열 검사
  // cert.iatf    → IATF16949 선택 여부
  // cert.iso9001 → ISO9001 선택 여부 (IATF 선택 시에도 true — IATF ⊃ ISO9001)
  // cert.iso14001 / cert.iso45001 → 향후 확장
  if (cond.startsWith('cert.')) {
    const key = cond.slice(5) // 'iatf' | 'iso9001' | 'iso14001' | 'iso45001'
    switch (key) {
      case 'iatf':    return state.certTarget.includes('IATF16949')
      case 'iso9001': return state.certTarget.includes('ISO9001') || state.certTarget.includes('IATF16949')
      case 'iso14001': return state.certTarget.includes('ISO14001')
      case 'iso45001': return state.certTarget.includes('ISO45001')
      default: return false
    }
  }

  // size.* 조건
  if (cond.startsWith('size.')) {
    const key = cond.slice(5)
    return state.employeeCount === key
  }

  // WizardState 필드 경로 탐색 (scope.productDesign 등)
  const parts = cond.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let val: any = state
  for (const p of parts) {
    val = val?.[p]
  }
  return Boolean(val)
}
