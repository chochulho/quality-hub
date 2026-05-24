import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { TOOLS, SUPERADMIN_EMAIL, type ToolId } from '@/lib/auth/grades'

// ── SSO 설정 ────────────────────────────────────────────────────

interface SsoTarget {
  type: 'same_project' | 'own_project'
  /** Supabase가 매직 링크 처리 후 리다이렉트할 URL */
  redirectTo: string
  /** own_project 전용 */
  supabaseUrlEnv?: string
  serviceRoleKeyEnv?: string
  /** 해당 SaaS에 profiles 레코드 자동 생성 여부 */
  autoProvision?: boolean
}

const SSO_CONFIG: Partial<Record<ToolId, SsoTarget>> = {
  'auditsay': {
    type: 'same_project',
    redirectTo: 'https://auditsay.com',   // Vite SPA — hash token 자동 감지
    autoProvision: true,                   // profiles + company 자동 생성
  },
  'gauge-manager': {
    type: 'own_project',
    redirectTo: 'https://gaugemanager.com',
    supabaseUrlEnv: 'GAUGE_SUPABASE_URL',
    serviceRoleKeyEnv: 'GAUGE_SUPABASE_SERVICE_ROLE_KEY',
    autoProvision: false,
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
    const adminClient = ssoConfig.type === 'same_project'
      ? createAdminClient()
      : (() => {
          const url = process.env[ssoConfig.supabaseUrlEnv!]
          const key = process.env[ssoConfig.serviceRoleKeyEnv!]
          if (!url || !key) throw new Error(`환경변수 미설정: ${ssoConfig.serviceRoleKeyEnv}`)
          return createSupabaseClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        })()

    // 4. own_project: 유저가 없으면 생성
    if (ssoConfig.type === 'own_project') {
      const { data: list } = await adminClient.auth.admin.listUsers()
      const found = list?.users?.find(u => u.email === user.email)
      if (!found) {
        await adminClient.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: { sso_from: 'quality-hub' },
        })
      }
    }

    // 5. auditsay: profiles 레코드 없으면 자동 생성 (register_user RPC)
    if (ssoConfig.autoProvision) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile) {
        const displayName = user.user_metadata?.full_name
          ?? user.email.split('@')[0]

        // quality-hub 플랜 → auditsay grade 매핑
        const auditsayGrade =
          isSuperadmin ? 'enterprise' :
          ['business', 'enterprise'].includes(memberPlanId) ? 'enterprise' :
          'pro'  // starter/team = auditsay pro (이미 결제됨)

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

    // 6. 매직 링크 생성 → 리다이렉트
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
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
