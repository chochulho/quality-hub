import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SignJWT } from 'jose'
import { TOOLS, SUPERADMIN_EMAIL, type ToolId } from '@/lib/auth/grades'

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
    redirectTo: 'https://auditsay.com',   // Vite SPA — hash token 자동 감지
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

  if (!isSuperadmin) {
    const { data: membership } = await supabase.rpc('get_my_membership')
    const m = membership?.[0]

    if (!m || m.org_status !== 'active') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    memberPlanId = m.plan_id ?? 'free'
    const hasAccess = await checkToolAccess(supabase, m.org_id, memberPlanId, toolId)
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

      const token = await new SignJWT({ email: user.email, name: displayName, plan: 'platinum' })
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

    // 4. auditsay: profiles 레코드 없으면 자동 생성 (register_user RPC)
    if (ssoConfig.autoProvision) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile) {
        const displayName = user.user_metadata?.full_name
          ?? user.email!.split('@')[0]

        // QH 구독 통과 = auditsay 최고 등급 (enterprise)
        const auditsayGrade = 'enterprise'

        const { error: rpcErr } = await adminClient.rpc('register_user', {
          p_user_id:      user.id,
          p_name:         displayName,
          p_company_name: displayName,   // 추후 대시보드에서 수정 가능
          p_type:         'individual',
          p_grade:        auditsayGrade,
          p_department:   '',
        })

        if (rpcErr) {
          console.error('[SSO:auditsay] register_user 실패:', rpcErr.message)
          // profile 생성 실패해도 로그인 시도는 계속
        }
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

  const { data } = await supabase
    .from('org_selected_tools')
    .select('tool_key')
    .eq('org_id', orgId)
    .eq('tool_key', toolId)
    .maybeSingle()

  return !!data
}
