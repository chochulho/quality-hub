import crypto from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ToolId } from '@/lib/auth/grades'

// ============================================================
// SSO 프로비저닝 발신 (qmintel → 하위 SaaS)
// 계약: docs/sso-provisioning-contract.md §3
// 수신 레퍼런스: change-manager/src/app/api/sso/provision/route.ts
// ============================================================

// ── 슬러그 매핑 ────────────────────────────────────────────────
// qmintel 내부 ToolId ↔ 계약 §1 canonical 슬러그.
// 양쪽 값이 정확히 일치해야 수신 측이 자기 슬러그로 오배송을 차단할 수 있다.
export const TOOL_TO_SLUG: Record<ToolId, string> = {
  '4m-change-manager': 'change-manager',
  'gauge-manager':     'gauge-manager',
  'apqp-manager':      'apqp-manager',
  'auditsay':          'auditsay',
  'nc-manager':        'nc-manager',
}

export const SLUG_TO_TOOL: Record<string, ToolId> = Object.fromEntries(
  Object.entries(TOOL_TO_SLUG).map(([tool, slug]) => [slug, tool as ToolId])
) as Record<string, ToolId>

// ── 프로비저닝 대상 (수신부가 준비된 SaaS만) ───────────────────
// url: 각 SaaS의 POST /api/sso/provision 엔드포인트
// secretEnv: HMAC 서명에 쓸 공유 비밀키 환경변수 — 수신 측 SSO_QUALITY_HUB_SECRET 값과 동일해야 함.
interface ProvisionTarget {
  url: string
  secretEnv: string
}

export const PROVISION_TARGETS: Record<string, ProvisionTarget | undefined> = {
  // ✅ 수신부 구현 완료 — 지금 활성
  'change-manager': {
    url: 'https://change-manager-self.vercel.app/api/sso/provision',
    secretEnv: 'SSO_4M_SECRET',
  },
  // ⏳ 각 SaaS 수신부(/api/sso/provision) 이식 후 주석 해제
  // 'gauge-manager': { url: 'https://gaugemanager.com/api/sso/provision', secretEnv: 'SSO_GAUGE_SECRET' },
  // 'apqp-manager':  { url: 'https://apqpmanager.com/api/sso/provision',  secretEnv: 'SSO_FMEA_SECRET'  },
  // 'auditsay':      { url: 'https://auditsay.com/api/sso/provision',     secretEnv: 'SSO_AUDITSAY_SECRET' },
}

// 재시도 없이 즉시 실패로 판단할 상태코드 (계약 §3: 4xx는 재시도 금지)
const NO_RETRY_STATUS = new Set([400, 401, 409, 422])
const MAX_ATTEMPTS = 3
const BACKOFF_MS = [500, 2000, 5000] // 시도 실패 후 대기 (마지막 시도 뒤엔 대기 안 함)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface ProvisionInput {
  product: string // canonical 슬러그
  action: 'grant' | 'revoke'
  org: { external_org_id?: string; name?: string }
  member: {
    email: string
    external_user_id?: string
    name?: string
    role?: 'member' | 'admin'
  }
}

export interface ProvisionResult {
  ok: boolean
  skipped?: boolean
  httpStatus?: number
  attempts: number
  error?: string
}

/**
 * 멤버 제품 grant/revoke를 대상 SaaS로 push 한다.
 * - HMAC-SHA256(`${timestamp}.${rawBody}`) 서명 (계약 §3).
 * - 5xx/네트워크 오류만 인라인 백오프 재시도, 4xx는 즉시 중단.
 * - 모든 시도 결과를 sso_provision_log 에 기록.
 * - 수신부 미준비(PROVISION_TARGETS 없음)/시크릿 미설정이면 skip(로그만 남기고 성공 취급).
 *
 * 이 함수는 절대 throw 하지 않는다 — push 실패가 qmintel DB 반영을 막지 않도록.
 */
export async function pushProvision(input: ProvisionInput): Promise<ProvisionResult> {
  const eventId = `evt_${crypto.randomUUID()}`
  const target = PROVISION_TARGETS[input.product]
  const secret = target ? process.env[target.secretEnv] : undefined

  // 로그 기록 헬퍼 (실패해도 무시)
  const log = async (fields: {
    ok: boolean
    httpStatus?: number
    attempts: number
    error?: string
  }) => {
    try {
      const admin = createAdminClient()
      await admin.from('sso_provision_log').insert({
        event_id: eventId,
        product_slug: input.product,
        action: input.action,
        member_email: input.member.email,
        org_id: input.org.external_org_id ?? null,
        http_status: fields.httpStatus ?? null,
        ok: fields.ok,
        attempts: fields.attempts,
        error: fields.error ?? null,
      })
    } catch (e) {
      console.error('[provision] sso_provision_log 기록 실패:', e)
    }
  }

  // 수신부 미준비 / 시크릿 미설정 → skip
  if (!target || !secret) {
    const reason = !target ? 'no receiver configured' : `secret ${target.secretEnv} not set`
    console.warn(`[provision] skip ${input.action} ${input.product} → ${reason}`)
    await log({ ok: false, attempts: 0, error: `skipped: ${reason}` })
    return { ok: true, skipped: true, attempts: 0, error: reason }
  }

  const timestamp = new Date().toISOString()
  // 서명 대상과 전송 바디는 반드시 동일 문자열이어야 한다 (재직렬화 금지).
  const rawBody = JSON.stringify({
    event_id: eventId,
    product: input.product,
    action: input.action,
    org: {
      external_org_id: input.org.external_org_id,
      name: input.org.name,
    },
    member: {
      email: input.member.email,
      external_user_id: input.member.external_user_id,
      name: input.member.name,
      role: input.member.role,
    },
  })
  const signature =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')

  let attempts = 0
  let lastStatus: number | undefined
  let lastError: string | undefined

  while (attempts < MAX_ATTEMPTS) {
    attempts++
    try {
      const res = await fetch(target.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-QH-Timestamp': timestamp,
          'X-QH-Signature': signature,
        },
        body: rawBody,
      })
      lastStatus = res.status

      if (res.ok || res.status === 202) {
        await log({ ok: true, httpStatus: res.status, attempts })
        return { ok: true, httpStatus: res.status, attempts }
      }

      // 4xx → 재시도 금지
      if (NO_RETRY_STATUS.has(res.status) || (res.status >= 400 && res.status < 500)) {
        lastError = await res.text().catch(() => '')
        await log({ ok: false, httpStatus: res.status, attempts, error: lastError })
        return { ok: false, httpStatus: res.status, attempts, error: lastError }
      }

      // 5xx → 재시도
      lastError = `HTTP ${res.status}`
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
    }

    if (attempts < MAX_ATTEMPTS) await sleep(BACKOFF_MS[attempts - 1] ?? 5000)
  }

  await log({ ok: false, httpStatus: lastStatus, attempts, error: lastError })
  return { ok: false, httpStatus: lastStatus, attempts, error: lastError }
}
