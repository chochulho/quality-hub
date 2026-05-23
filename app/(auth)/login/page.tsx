import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: '로그인' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const session = await getSession()
  if (session) redirect('/dashboard')

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
          <span>Quality Hub</span>
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
