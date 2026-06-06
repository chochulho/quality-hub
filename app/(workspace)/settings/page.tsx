import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import LogoUploader from '@/components/settings/LogoUploader'

export const metadata = { title: '조직 설정' }

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['owner', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">조직 설정</p>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
          {session.orgName ?? '조직'} 설정
        </h1>
      </div>

      {/* 로고 */}
      <section className="bg-white border border-border rounded-2xl p-6 mb-5">
        <h2 className="text-base font-bold text-foreground mb-1">회사 로고</h2>
        <p className="text-sm text-muted-foreground mb-5">
          워크스페이스 헤더와 대시보드에 표시됩니다.
        </p>
        <LogoUploader
          currentLogoUrl={session.logoUrl}
          orgName={session.orgName}
        />
      </section>

      {/* 조직 정보 (읽기 전용) */}
      <section className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-foreground mb-4">조직 정보</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">조직명</dt>
            <dd className="font-medium">{session.orgName ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">플랜</dt>
            <dd className="font-medium capitalize">{session.planId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">역할</dt>
            <dd className="font-medium">{session.role}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
