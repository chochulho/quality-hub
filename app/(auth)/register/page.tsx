import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ExternalLink } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { SOURCE_DOMAIN_CONFIG } from '@/lib/auth/source-domains'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: '회원가입' }

interface PageProps {
  searchParams: Promise<{ source?: string; tool?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (session) redirect('/dashboard')

  const { source, tool } = await searchParams

  // Validate source against known domains
  const sourceDomain = source && SOURCE_DOMAIN_CONFIG[source] ? source : 'quality-hub'
  const domainCfg = SOURCE_DOMAIN_CONFIG[sourceDomain]
  const isExternal = sourceDomain !== 'quality-hub'

  return (
    <div className="w-full max-w-lg">
      {/* 로고 */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-navy font-bold mb-6"
        >
          <BookOpen className="h-5 w-5 text-brand-orange" />
          <span>QMintel</span>
        </Link>

        {/* 외부 도메인 유입 배너 */}
        {isExternal ? (
          <>
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              <ExternalLink className="h-3.5 w-3.5" />
              {domainCfg.label}에서 오셨군요!
            </div>
            <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
              {domainCfg.label} 계정 만들기
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              QMintel 통합 계정으로 가입하면<br />
              <span className="font-semibold text-foreground">{domainCfg.label}</span>을 바로 이용할 수 있습니다.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-brand-orange mb-2 tracking-wide uppercase">
              회원가입
            </p>
            <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
              품질 도구 번들 시작하기
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              등급에 따라 최대 5개의 자매 SaaS 도구를 사용할 수 있습니다.
            </p>
          </>
        )}
      </div>

      <RegisterForm sourceDomain={sourceDomain} toolKey={tool} />

      <p className="text-center text-sm text-muted-foreground mt-6">
        이미 회원이신가요?{' '}
        <Link href="/login" className="font-semibold text-brand-orange hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
