import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, LogOut, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getValidInvite } from '@/lib/auth/invite'
import InviteAcceptForm from '@/components/auth/InviteAcceptForm'
import AcceptInviteButton from '@/components/auth/AcceptInviteButton'

export const metadata: Metadata = { title: '팀 초대' }

const ROLE_LABEL: Record<string, string> = { owner: '오너', admin: '관리자', member: '멤버' }

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-navy font-bold mb-6">
          <BookOpen className="h-5 w-5 text-brand-orange" />
          <span>QMintel</span>
        </Link>
        <p className="text-xs font-medium text-brand-orange mb-2 tracking-wide uppercase">팀 초대</p>
      </div>
      {children}
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function InvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <Shell>
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm text-center">
          <ShieldAlert className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <h1 className="text-lg font-extrabold text-brand-navy mb-2">초대 링크가 올바르지 않습니다</h1>
          <p className="text-sm text-muted-foreground mb-6">전달받은 초대 메일의 링크를 다시 확인해주세요.</p>
          <Link href="/login" className="text-sm font-semibold text-brand-orange hover:underline">로그인 페이지로</Link>
        </div>
      </Shell>
    )
  }

  const admin = createAdminClient()
  const result = await getValidInvite(admin, token)

  if ('error' in result) {
    return (
      <Shell>
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm text-center">
          <ShieldAlert className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <h1 className="text-lg font-extrabold text-brand-navy mb-2">초대를 사용할 수 없습니다</h1>
          <p className="text-sm text-muted-foreground mb-6">{result.error}</p>
          <Link href="/login" className="text-sm font-semibold text-brand-orange hover:underline">로그인 페이지로</Link>
        </div>
      </Shell>
    )
  }

  const invite = result.row
  const orgName = invite.organizations?.[0]?.name ?? '조직'

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const isMatchingSession = !!authUser && authUser.email?.toLowerCase() === invite.invited_email?.toLowerCase()

  return (
    <Shell>
      <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight text-center mb-2">
        <span className="text-brand-orange">{orgName}</span>에서 초대했습니다
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {invite.invited_email} · {ROLE_LABEL[invite.role] ?? invite.role}로 합류합니다
      </p>

      {authUser && !isMatchingSession && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 mb-0.5">{authUser.email}으로 로그인된 상태입니다</p>
          <p className="text-xs text-amber-700 mb-3">이 초대는 {invite.invited_email}로 발송되었습니다. 먼저 로그아웃해주세요.</p>
          <a
            href={`/api/auth/signout?next=${encodeURIComponent(`/invite?token=${token}`)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 border border-amber-300 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </a>
        </div>
      )}

      {isMatchingSession && (
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
          <p className="text-sm text-muted-foreground mb-5">
            <span className="font-medium text-foreground">{authUser!.email}</span> 계정으로 참여합니다.
          </p>
          <AcceptInviteButton token={token} />
        </div>
      )}

      {!authUser && (
        <>
          <InviteAcceptForm token={token} email={invite.invited_email} />
          <p className="text-center text-sm text-muted-foreground mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href={`/login?next=${encodeURIComponent(`/invite?token=${token}`)}`} className="font-semibold text-brand-orange hover:underline">
              로그인 후 참여하기
            </Link>
          </p>
        </>
      )}
    </Shell>
  )
}
