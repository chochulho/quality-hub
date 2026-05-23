import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GRADE_TOOLS, TOOLS, SUPERADMIN_EMAIL, type ToolId } from '@/lib/auth/grades'

/**
 * SSO 지원 도구 → 로그인 후 이동할 URL
 * Supabase 공유 프로젝트 도구: magic link 방식
 * 미지원 도구: tool.href 로 직접 리다이렉트
 */
const SSO_REDIRECT: Partial<Record<ToolId, string>> = {
  'auditsay': 'https://auditsay.com',
  // 'gauge-manager': 'https://gaugemanager.com/dashboard', // 추후 별도 Supabase 연동
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

  // 3. 등급 확인 (슈퍼관리자는 항상 허용)
  const isSuperadmin = user.email === SUPERADMIN_EMAIL

  if (!isSuperadmin) {
    const { data: profileData } = await supabase.rpc('qh_get_my_profile')
    const profile = profileData?.[0]
    const grade = (profile?.company_grade ?? 'free') as keyof typeof GRADE_TOOLS
    const allowedTools = GRADE_TOOLS[grade] ?? []

    if (!allowedTools.includes(toolId)) {
      // 접근 권한 없음 → 요금제 페이지로
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // 4. SSO 매직 링크 생성 (같은 Supabase 프로젝트 도구)
  const ssoRedirectUrl = SSO_REDIRECT[toolId]

  if (ssoRedirectUrl) {
    try {
      const adminClient = createAdminClient()
      const { data, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: {
          redirectTo: ssoRedirectUrl,
        },
      })

      if (error || !data?.properties?.action_link) {
        console.error('[SSO] magic link 생성 실패:', error?.message)
        // 폴백: 직접 링크
        return NextResponse.redirect(TOOLS[toolId].href)
      }

      return NextResponse.redirect(data.properties.action_link)
    } catch (err) {
      console.error('[SSO] admin client 오류:', err)
      return NextResponse.redirect(TOOLS[toolId].href)
    }
  }

  // 5. SSO 미지원 도구 → 직접 이동
  return NextResponse.redirect(TOOLS[toolId].href)
}
