import { createAdminClient } from '@/lib/supabase/admin'

export const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

type AdminClient = ReturnType<typeof createAdminClient>

/** invite_token으로 org_members 행을 조회하고 사용 가능 여부(상태/만료)를 검증 */
export async function getValidInvite(admin: AdminClient, token: string) {
  const { data: row } = await admin
    .from('org_members')
    .select('id, org_id, role, invited_email, invited_at, status, user_id, organizations(name)')
    .eq('invite_token', token)
    .maybeSingle()

  if (!row || row.status !== 'invited' || row.user_id) {
    return { error: '유효하지 않거나 이미 사용된 초대 링크입니다.' as const }
  }
  if (Date.now() - new Date(row.invited_at).getTime() > INVITE_TOKEN_TTL_MS) {
    return { error: '초대 링크가 만료되었습니다. 관리자에게 재전송을 요청해주세요.' as const }
  }
  return { row }
}
