'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult = { error?: string }

/** 권한 확인 헬퍼 */
async function requireAdminSession() {
  const session = await getSession()
  if (!session?.orgId) return { error: '조직 정보가 없습니다.' }
  if (!['owner', 'admin', 'superadmin'].includes(session.role)) {
    return { error: '관리자만 이 작업을 수행할 수 있습니다.' }
  }
  return { session }
}

/** 멤버 초대 (invited_email + status='invited') */
export async function inviteMember(
  email: string,
  role: 'admin' | 'member'
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  if (!email.trim()) return { error: '이메일을 입력해 주세요.' }

  const supabase = createAdminClient()

  // 플랜 시트 수 확인
  const { data: plan } = await supabase
    .from('plans')
    .select('max_members')
    .eq('id', session.planId)
    .single()

  const { count: currentCount } = await supabase
    .from('org_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', session.orgId)
    .neq('status', 'suspended')

  if (plan && plan.max_members > 0 && (currentCount ?? 0) >= plan.max_members) {
    return { error: `플랜 한도(${plan.max_members}명)에 도달했습니다. 업그레이드 후 초대하세요.` }
  }

  // 이미 있는지 확인
  const { data: existing } = await supabase
    .from('org_members')
    .select('id')
    .eq('org_id', session.orgId)
    .eq('invited_email', email.toLowerCase())
    .maybeSingle()

  if (existing) return { error: '이미 초대된 이메일입니다.' }

  const { error } = await supabase.from('org_members').insert({
    org_id: session.orgId,
    invited_email: email.toLowerCase(),
    role,
    status: 'invited',
  })

  if (error) return { error: '초대 실패: ' + error.message }

  revalidatePath('/members')
  return {}
}

/** 멤버 역할 변경 */
export async function updateMemberRole(
  memberId: string,
  newRole: 'admin' | 'member'
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }

  // owner 역할은 변경 불가
  const supabase = createAdminClient()
  const { data: target } = await supabase
    .from('org_members')
    .select('role')
    .eq('id', memberId)
    .eq('org_id', auth.session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.role === 'owner') return { error: 'Owner 역할은 변경할 수 없습니다.' }

  const { error } = await supabase
    .from('org_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('org_id', auth.session.orgId!)

  if (error) return { error: '역할 변경 실패: ' + error.message }

  revalidatePath('/members')
  return {}
}

/** 멤버 사업장 배정 업데이트 */
export async function updateMemberSites(
  memberId: string,
  siteIds: string[]
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }

  const supabase = createAdminClient()
  const { error } = await supabase.rpc('set_member_sites', {
    p_member_id: memberId,
    p_site_ids: siteIds,
  })

  if (error) return { error: '사업장 배정 실패: ' + error.message }

  revalidatePath('/members')
  return {}
}

/** 멤버 제거 (자기 자신 제거 불가) */
export async function removeMember(memberId: string): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  const supabase = createAdminClient()

  // owner는 제거 불가
  const { data: target } = await supabase
    .from('org_members')
    .select('role, user_id')
    .eq('id', memberId)
    .eq('org_id', session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.role === 'owner') return { error: 'Owner는 제거할 수 없습니다.' }
  if (target.user_id === session.id) return { error: '자기 자신은 제거할 수 없습니다.' }

  const { error } = await supabase
    .from('org_members')
    .delete()
    .eq('id', memberId)
    .eq('org_id', session.orgId!)

  if (error) return { error: '제거 실패: ' + error.message }

  revalidatePath('/members')
  return {}
}
