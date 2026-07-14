import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SignJWT } from 'jose'
import { TOOLS, PREMIUM_TOOL_IDS, SUPERADMIN_EMAIL, type ToolId } from '@/lib/auth/grades'

// ── SSO 설정 ────────────────────────────────────────────────────

interface SsoTarget {
  type: 'same_project' | 'jwt_bridge'
  /** 최종 리다이렉트 URL */
  redirectTo: string
  /** same_project: profiles 레코드 자동 생성 여부 */
  autoProvision?: boolean
  /** jwt_bridge: 공유 시크릿 환경변수 이름 */
  secretEnv?: string
}

const SSO_CONFIG: Partial<Record<ToolId, SsoTarget>> = {
  'auditsay': {
    type: 'same_project',
    redirectTo: 'https://auditsay.com?from=qmintel',   // Vite SPA — hash token 자동 감지
    autoProvision: true,                   // profiles + company 자동 생성
  },
  'nc-manager': {
    type: 'same_project',
    // Next.js SSR: /ko/sso 클라이언트 페이지가 hash token 처리 (기본 로케일: ko)
    redirectTo: 'https://nc-manager-chi.vercel.app/ko/sso',
  },
  'gauge-manager': {
    type: 'jwt_bridge',
    redirectTo: 'https://gaugemanager.com/api/auth/sso',
    secretEnv: 'SSO_GAUGE_SECRET',
  },
  'apqp-manager': {
    type: 'jwt_bridge',
    redirectTo: 'https://apqpmanager.com/api/auth/sso',
    secretEnv: 'SSO_FMEA_SECRET',
  },
  '4m-change-manager': {
    type: 'jwt_bridge',
    // Next.js SSR: /ko/sso 페이지가 JWT token 처리 (기본 로케일: ko)
    redirectTo: 'https://change-manager-self.vercel.app/ko/sso',
    secretEnv: 'SSO_4M_SECRET',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params
  const toolId = tool as ToolId

  if (!TOOLS[toolId]) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 1. quality-hub 로그인 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', '/dashboard')
    return NextResponse.redirect(loginUrl)
  }

  // 2. 플랜 접근 권한 확인 (superadmin 제외)
  const isSuperadmin = user.email === SUPERADMIN_EMAIL
  let memberPlanId = 'free'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let membershipRow: any = null

  if (!isSuperadmin) {
    const { data: membership } = await supabase.rpc('get_my_membership')
    membershipRow = membership?.[0]

    if (!membershipRow || membershipRow.org_status !== 'active') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    memberPlanId = membershipRow.plan_id ?? 'free'
    const hasAccess = await checkToolAccess(supabase, membershipRow.org_id, memberPlanId, toolId)
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // 3. SSO 설정 확인
  const ssoConfig = SSO_CONFIG[toolId]
  if (!ssoConfig) {
    // SSO 미지원 도구 → 직접 이동
    return NextResponse.redirect(TOOLS[toolId].href)
  }

  try {
    // ── jwt_bridge (gauge-manager 등 별도 인증 시스템) ─────────────
    if (ssoConfig.type === 'jwt_bridge') {
      const sharedSecret = process.env[ssoConfig.secretEnv!]
      if (!sharedSecret) throw new Error(`환경변수 미설정: ${ssoConfig.secretEnv}`)

      const displayName = user.user_metadata?.full_name
        ?? user.email!.split('@')[0]

      // org 식별자: superadmin은 이메일 도메인, 일반 멤버는 org_id — auditsay와 동일 패턴
      const orgId   = membershipRow?.org_id ?? user.email!.split('@')[1]
      const orgName = membershipRow?.org_name ?? user.email!.split('@')[1]

      const token = await new SignJWT({
        email: user.email,
        name: displayName,
        plan: 'platinum',
        org_id: orgId,
        org_name: orgName,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(new TextEncoder().encode(sharedSecret))

      const dest = new URL(ssoConfig.redirectTo)
      dest.searchParams.set('token', token)
      return NextResponse.redirect(dest.toString())
    }

    // ── same_project (auditsay — Supabase 매직 링크) ───────────────
    const adminClient = createAdminClient()

    // 4. auditsay: org 단위 company 공유 프로비저닝
    //    같은 QMintel org 멤버 → 동일 AuditSay company_id 공유
    //    profile 유무와 무관하게 항상 company_id를 교정
    if (ssoConfig.autoProvision) {
      const displayName = user.user_metadata?.full_name
        ?? user.email!.split('@')[0]

      // org 식별자: superadmin은 이메일 도메인, 일반 멤버는 org_id
      const orgId      = membershipRow?.org_id ?? user.email!.split('@')[1]
      const orgName    = membershipRow?.org_name ?? user.email!.split('@')[1]
      const orgKey     = `qmintel:${orgId}`

      const { error: rpcErr } = await adminClient.rpc('provision_sso_user', {
        p_user_id:         user.id,
        p_name:            displayName,
        p_email:           user.email!,
        p_org_external_id: orgKey,
        p_org_name:        orgName,
        p_grade:           'enterprise',
      })

      if (rpcErr) {
        console.error('[SSO:auditsay] provision_sso_user 실패:', rpcErr.message)
        // 실패해도 로그인 시도는 계속
      }
    }

    // 5. 매직 링크 생성 → 리다이렉트
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: { redirectTo: ssoConfig.redirectTo },
    })

    if (error || !data?.properties?.action_link) {
      console.error(`[SSO:${toolId}] magic link 생성 실패:`, error?.message)
      return NextResponse.redirect(TOOLS[toolId].href)
    }

    return NextResponse.redirect(data.properties.action_link)

  } catch (err) {
    console.error(`[SSO:${toolId}] 오류:`, err)
    return NextResponse.redirect(TOOLS[toolId].href)
  }
}

async function checkToolAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  planId: string,
  toolId: ToolId
): Promise<boolean> {
  if (planId === 'business' || planId === 'enterprise') return true
  if (planId === 'free') return false
  // APQP Manager·Gauge Manager는 Business 전용
  if (PREMIUM_TOOL_IDS.includes(toolId)) return false

  const { data } = await supabase
    .from('org_selected_tools')
    .select('tool_key')
    .eq('org_id', orgId)
    .eq('tool_key', toolId)
    .maybeSingle()

  return !!data
}
