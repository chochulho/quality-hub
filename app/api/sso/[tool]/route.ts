import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TOOLS, SUPERADMIN_EMAIL, type ToolId } from '@/lib/auth/grades'

/**
 * SSO 지원 도구 → 로그인 후 이동할 URL
 * 같은 Supabase 프로젝트를 공유하는 도구: magic link 방식
 */
const SSO_REDIRECT: Partial<Record<ToolId, string>> = {
  'auditsay': 'https://auditsay.com',
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
    // 4. 멤버십 + 플랜 확인
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

  // 5. SSO 매직 링크 생성
  const ssoRedirectUrl = SSO_REDIRECT[toolId]

  if (ssoRedirectUrl) {
    try {
      const adminClient = createAdminClient()
      const { data, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: { redirectTo: ssoRedirectUrl },
      })

      if (error || !data?.properties?.action_link) {
        console.error('[SSO] magic link 생성 실패:', error?.message)
        return NextResponse.redirect(TOOLS[toolId].href)
      }

      return NextResponse.redirect(data.properties.action_link)
    } catch (err) {
      console.error('[SSO] admin client 오류:', err)
      return NextResponse.redirect(TOOLS[toolId].href)
    }
  }

  // 6. SSO 미지원 도구 → 직접 이동
  return NextResponse.redirect(TOOLS[toolId].href)
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

  // starter / team: org_selected_tools 확인
  const { data } = await supabase
    .from('org_selected_tools')
    .select('tool_key')
    .eq('org_id', orgId)
    .eq('tool_key', toolId)
    .maybeSingle()

  return !!data
}
