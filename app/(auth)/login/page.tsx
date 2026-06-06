import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: '로그인' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const session = await getSession()
  if (session) redirect('/dashboard')

  // 세션은 없지만 Supabase auth 쿠키가 남아 있는 경우 (기업 승인 대기 / 고아 계정)
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const hasStaleAuth = !!authUser && !session

  const { next } = await searchParams

  return (
    <div className="w-full max-w-md">
      {/* 로고 */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-navy font-bold mb-6"
        >
          <BookOpen className="h-5 w-5 text-brand-orange" />
          <span>QMintel</span>
        </Link>
        <p className="text-xs font-medium text-brand-orange mb-2 tracking-wide uppercase">
          회원 로그인
        </p>
        <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
          다시 오셨군요!
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          로그인하여 품질 도구 대시보드로 이동하세요.
        </p>
      </div>

      {/* 다른 계정으로 로그인되어 있을 때 안내 배너 */}
      {hasStaleAuth && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 mb-0.5">
            {authUser.email} 으로 로그인된 상태입니다
          </p>
          <p className="text-xs text-amber-700 mb-3">
            다른 계정으로 로그인하려면 먼저 로그아웃하세요.
          </p>
          <a
            href="/api/auth/signout"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 border border-amber-300 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃 후 다른 계정으로
          </a>
        </div>
      )}

      <LoginForm next={next} />

      <p className="text-center text-sm text-muted-foreground mt-6">
        아직 회원이 아니신가요?{' '}
        <Link href="/register" className="font-semibold text-brand-orange hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
