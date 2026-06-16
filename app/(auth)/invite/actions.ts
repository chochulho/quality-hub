'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getValidInvite } from '@/lib/auth/invite'

/** 이미 로그인된 사용자가 초대를 수락 — 기존 org_members 행에 user_id 연결 */
export async function acceptInviteForCurrentUser(token: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const admin = createAdminClient()
  const result = await getValidInvite(admin, token)
  if ('error' in result) return { error: result.error }

  if (result.row.invited_email?.toLowerCase() !== user.email?.toLowerCase()) {
    return { error: '이 초대는 다른 이메일로 발송되었습니다.' }
  }

  const { error } = await admin
    .from('org_members')
    .update({ user_id: user.id, status: 'active' })
    .eq('id', result.row.id)
    .is('user_id', null)

  if (error) return { error: '참여 처리 중 오류가 발생했습니다: ' + error.message }

  redirect('/dashboard')
}
