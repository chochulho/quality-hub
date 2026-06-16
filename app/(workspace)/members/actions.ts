'use server'

import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult = { error?: string; warning?: string }

const resend = new Resend(process.env.RESEND_API_KEY)

/** 권한 확인 헬퍼 */
async function requireAdminSession() {
  const session = await getSession()
  if (!session?.orgId) return { error: '조직 정보가 없습니다.' }
  if (!['owner', 'admin', 'superadmin'].includes(session.role)) {
    return { error: '관리자만 이 작업을 수행할 수 있습니다.' }
  }
  return { session }
}

/** 초대 이메일 발송. 실패 시 사용자에게 보여줄 경고 메시지를 반환 (성공이면 undefined) */
async function sendInviteEmail(email: string, token: string, orgName: string): Promise<string | undefined> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qmintel.com'
  const inviteUrl = `${baseUrl}/invite?token=${token}`

  try {
    await resend.emails.send({
      from: 'QMintel <noreply@qmintel.com>',
      to: email,
      subject: `[QMintel] ${orgName}에서 팀원으로 초대했습니다`,
      html: `
        <h2 style="color:#2B4B8C">${orgName} 팀 초대</h2>
        <p style="font-size:15px;color:#444">안녕하세요,<br>
        <b>${orgName}</b>에서 QMintel 워크스페이스에 팀원으로 초대했습니다.</p>
        <p style="margin:24px 0">
          <a href="${inviteUrl}" style="display:inline-block;background:#F26B3A;color:#fff;padding:12px 28px;border-radius:9999px;font-weight:600;text-decoration:none">초대 수락하기</a>
        </p>
        <p style="font-size:13px;color:#888">이 링크는 7일간 유효합니다. 버튼이 동작하지 않으면 아래 주소를 브라우저에 붙여넣어 주세요:<br>
        <a href="${inviteUrl}" style="color:#2B4B8C">${inviteUrl}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="font-size:12px;color:#999">본인이 요청하지 않은 초대라면 이 메일을 무시하셔도 됩니다.</p>
      `,
    })
    return undefined
  } catch (err) {
    console.error('[members] invite email send failed', err)
    return '초대는 저장되었지만 이메일 발송에 실패했습니다. 잠시 후 재전송을 시도해주세요.'
  }
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

  const { data: inserted, error } = await supabase
    .from('org_members')
    .insert({
      org_id: session.orgId,
      invited_email: email.toLowerCase(),
      role,
      status: 'invited',
    })
    .select('invite_token')
    .single()

  if (error) return { error: '초대 실패: ' + error.message }

  const warning = await sendInviteEmail(email.toLowerCase(), inserted.invite_token, session.orgName ?? '조직')

  revalidatePath('/members')
  return warning ? { warning } : {}
}

/** 초대 메일 재전송 (토큰 재발급 포함) */
export async function resendInvite(memberId: string): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  const supabase = createAdminClient()

  const { data: target } = await supabase
    .from('org_members')
    .select('invited_email, status')
    .eq('id', memberId)
    .eq('org_id', session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.status !== 'invited' || !target.invited_email) {
    return { error: '초대 대기 상태인 멤버만 재전송할 수 있습니다.' }
  }

  const { data: updated, error } = await supabase
    .from('org_members')
    .update({ invite_token: crypto.randomUUID(), invited_at: new Date().toISOString() })
    .eq('id', memberId)
    .select('invite_token')
    .single()

  if (error || !updated) return { error: '재전송 실패: ' + (error?.message ?? '알 수 없는 오류') }

  const warning = await sendInviteEmail(target.invited_email, updated.invite_token, session.orgName ?? '조직')
  return warning ? { warning } : {}
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
