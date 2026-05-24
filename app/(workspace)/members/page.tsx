import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import MembersClient, { type MemberRow } from './MembersClient'

export const metadata = { title: '인원 관리' }

export default async function MembersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.orgId) redirect('/dashboard')

  const canManage = ['owner', 'admin', 'superadmin'].includes(session.role)
  const supabase = createAdminClient()

  // 멤버 목록 조회
  const { data: rawMembers } = await supabase
    .from('org_members')
    .select('id, user_id, role, invited_email, status, created_at')
    .eq('org_id', session.orgId)
    .order('created_at', { ascending: true })

  // 각 멤버의 auth.users 이메일 보강
  const members: MemberRow[] = await Promise.all(
    (rawMembers ?? []).map(async (m) => {
      let email = m.invited_email ?? '—'
      if (m.user_id) {
        const { data: { user } } = await supabase.auth.admin.getUserById(m.user_id)
        email = user?.email ?? m.invited_email ?? '—'
      }
      return {
        id: m.id,
        email,
        role: m.role as MemberRow['role'],
        status: m.status as MemberRow['status'],
        createdAt: m.created_at,
      }
    })
  )

  // 플랜 시트 한도 조회
  const { data: plan } = await supabase
    .from('plans')
    .select('max_members')
    .eq('id', session.planId)
    .single()

  const maxMembers = plan?.max_members ?? 10

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-brand-navy/5 flex items-center justify-center">
          <Users className="h-5 w-5 text-brand-navy" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">인원 관리</h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-8 ml-12">
        팀원을 초대하고 역할을 관리하세요.
        {maxMembers > 0 && (
          <> 현재 플랜({session.planId}): 최대 <strong>{maxMembers}명</strong> · {' '}
            <Link href="/billing/upgrade" className="text-brand-orange hover:underline">업그레이드</Link>
          </>
        )}
      </p>

      <MembersClient
        members={members}
        canManage={canManage}
        currentUserId={session.id}
        maxMembers={maxMembers}
      />
    </div>
  )
}
