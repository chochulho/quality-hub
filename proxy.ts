import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPERADMIN_EMAIL } from '@/lib/auth/grades'

/**
 * Vercel Proxy (= Next.js middleware) — 인증 + 라우트 보호
 *
 * 보호 규칙:
 * - /admin/*               : superadmin 전용
 * - /dashboard, /members,
 *   /sites, /billing/*     : 로그인 필수
 * - /login, /register      : 로그인 상태면 대시보드로
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신 (반드시 호출)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── /admin/* : superadmin 전용 ─────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) return redirectToLogin(request, pathname)
    if (user.email !== SUPERADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // ── 로그인 필수 경로 ────────────────────────────────────────
  const protectedPaths = ['/dashboard', '/members', '/sites', '/billing']
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!user) return redirectToLogin(request, pathname)
    return supabaseResponse
  }

  // ── /login, /register : 이미 로그인 시 대시보드로 ──────────
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
}

function redirectToLogin(request: NextRequest, from: string) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', from)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
