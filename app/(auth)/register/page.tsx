import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: '회원가입' }

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="w-full max-w-lg">
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
          회원가입
        </p>
        <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
          품질 도구 번들 시작하기
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          등급에 따라 최대 5개의 자매 SaaS 도구를 사용할 수 있습니다.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground mt-6">
        이미 회원이신가요?{' '}
        <Link href="/login" className="font-semibold text-brand-orange hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
