import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { TOOLS, SUPERADMIN_EMAIL, type ToolId } from '@/lib/auth/grades'

// ── SSO 설정 ────────────────────────────────────────────────────
// same_project: quality-hub와 같은 Supabase 프로젝트 → adminClient 재사용
// own_project: 별개 Supabase → 해당 프로젝트 service key 필요

interface SsoTarget {
  type: 'same_project' | 'own_project'
  callbackUrl: string            // 로그인 후 Supabase가 리다이렉트할 URL
  supabaseUrl?: string           // own_project 전용
  serviceRoleKeyEnv?: string     // own_project 전용 — env var 이름
}

const SSO_CONFIG: Partial<Record<ToolId, SsoTarget>> = {
  'auditsay': {
    type: 'same_project',
    callbackUrl: 'https://auditsay.com/auth/callback',
  },
  'gauge-manager': {
    type: 'own_project',
    callbackUrl: 'https://gaugemanager.com/auth/callback',
    supabaseUrl: process.env.GAUGE_SUPABASE_URL,
    serviceRoleKeyEnv: 'GAUGE_SUPABASE_SERVICE_ROLE_KEY',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params
  const toolId = tool as ToolId

  // 1. 유효한 도구 ID인지 확인
  if (!TOOLS[toolId]) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. 로그인 상태 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', '/dashboard')
    return NextResponse.redirect(loginUrl)
  }

  // 3. 슈퍼관리자는 항상 허용
  const isSuperadmin = user.email === SUPERADMIN_EMAIL
  if (!isSuperadmin) {
    const { data: membership } = await supabase.rpc('get_my_membership')
    const m = membership?.[0]

    if (!m || m.org_status !== 'active') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    const planId: string = m.plan_id ?? 'free'
    const hasAccess = await checkToolAccess(supabase, m.org_id, planId, toolId)

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // 4. SSO 매직 링크 생성
  const ssoConfig = SSO_CONFIG[toolId]

  if (!ssoConfig) {
    // SSO 미지원 → 직접 이동
    return NextResponse.redirect(TOOLS[toolId].href)
  }

  try {
    let actionLink: string

    if (ssoConfig.type === 'same_project') {
      // ── 같은 Supabase 프로젝트 ──────────────────────────────
      const adminClient = createAdminClient()
      const { data, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: { redirectTo: ssoConfig.callbackUrl },
      })

      if (error || !data?.properties?.action_link) {
        console.error(`[SSO:${toolId}] magic link 생성 실패:`, error?.message)
        return NextResponse.redirect(TOOLS[toolId].href)
      }

      actionLink = data.properties.action_link

    } else {
      // ── 별개 Supabase 프로젝트 (gauge 등) ───────────────────
      const gaugeUrl = ssoConfig.supabaseUrl
      const gaugeKey = process.env[ssoConfig.serviceRoleKeyEnv!]

      if (!gaugeUrl || !gaugeKey) {
        console.error(`[SSO:${toolId}] 환경변수 미설정: ${ssoConfig.serviceRoleKeyEnv}`)
        return NextResponse.redirect(TOOLS[toolId].href)
      }

      const gaugeAdmin = createSupabaseClient(gaugeUrl, gaugeKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      // 유저가 없으면 생성
      const { data: existingUser } = await gaugeAdmin.auth.admin.listUsers()
      const found = existingUser?.users?.find(u => u.email === user.email)

      if (!found) {
        await gaugeAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: { sso_from: 'quality-hub' },
        })
      }

      const { data, error } = await gaugeAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: { redirectTo: ssoConfig.callbackUrl },
      })

      if (error || !data?.properties?.action_link) {
        console.error(`[SSO:${toolId}] magic link 생성 실패:`, error?.message)
        return NextResponse.redirect(TOOLS[toolId].href)
      }

      actionLink = data.properties.action_link
    }

    return NextResponse.redirect(actionLink)

  } catch (err) {
    console.error(`[SSO:${toolId}] 오류:`, err)
    return NextResponse.redirect(TOOLS[toolId].href)
  }
}

/** 플랜 + 선택 도구 기반 접근 권한 확인 */
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
