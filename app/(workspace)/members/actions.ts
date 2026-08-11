'use server'

import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { pushProvision, TOOL_TO_SLUG } from '@/lib/sso/provisioning'
import { ALL_TOOL_IDS, isToolUnlocked, type ToolId } from '@/lib/auth/grades'

type ActionResult = { error?: string; warning?: string }

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * org 플랜에서 잠금 해제된 제품 슬러그 목록.
 * members/page.tsx의 productOptions와 동일 규칙 — owner/admin의 "전체" 실효 권한 근거.
 */
async function getOrgUnlockedSlugs(
  supabase: AdminClient,
  orgId: string,
  planId: string,
): Promise<string[]> {
  const { data: selected } = await supabase
    .from('org_selected_tools')
    .select('tool_key')
    .eq('org_id', orgId)
  const selectedTools = (selected ?? []).map((r: { tool_key: string }) => r.tool_key) as ToolId[]
  return ALL_TOOL_IDS
    .filter((toolId) => isToolUnlocked(planId, toolId, selectedTools))
    .map((toolId) => TOOL_TO_SLUG[toolId])
}

/**
 * 멤버의 실효 제품 권한.
 * - owner/admin: org 전권 → 잠금 해제된 전체 제품(=UI "전체" 표시). member_products 행 없음.
 * - member: org_member_products에 명시 grant된 제품만.
 */
function effectiveSlugs(role: string, grantedSlugs: string[], allUnlockedSlugs: string[]): string[] {
  return role === 'member' ? grantedSlugs : allUnlockedSlugs
}

/** 멤버 이메일 해석 (user_id 있으면 auth에서, 없으면 invited_email) */
async function resolveMemberEmail(
  supabase: AdminClient,
  member: { user_id: string | null; invited_email: string | null },
): Promise<string> {
  if (member.user_id) {
    const { data: { user } } = await supabase.auth.admin.getUserById(member.user_id)
    return user?.email ?? member.invited_email ?? ''
  }
  return member.invited_email ?? ''
}

/** 동시 실행 수를 제한해 배치로 실행 (수신 측 과부하·소켓 고갈 방지) */
async function runBatched(tasks: (() => Promise<unknown>)[], size = 8): Promise<void> {
  for (let i = 0; i < tasks.length; i += size) {
    await Promise.all(tasks.slice(i, i + size).map((t) => t()))
  }
}

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

/** 헷갈리기 쉬운 문자(0/O, 1/l/I 등)를 제외한 임시 비밀번호 생성 */
function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (const b of bytes) out += chars[b % chars.length]
  return out + '!'
}

/** 비밀번호 재설정 안내 메일 발송. 실패 시 경고 메시지를 반환 (성공이면 undefined) */
async function sendPasswordResetEmail(email: string, tempPassword: string, orgName: string): Promise<string | undefined> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qmintel.com'
  const loginUrl = `${baseUrl}/login`

  try {
    await resend.emails.send({
      from: 'QMintel <noreply@qmintel.com>',
      to: email,
      subject: `[QMintel] ${orgName} 계정 비밀번호가 재설정되었습니다`,
      html: `
        <h2 style="color:#2B4B8C">비밀번호 재설정 안내</h2>
        <p style="font-size:15px;color:#444">안녕하세요,<br>
        <b>${orgName}</b> 관리자의 요청으로 계정 비밀번호가 재설정되었습니다.</p>
        <p style="font-size:15px;color:#444;margin:20px 0">임시 비밀번호: <b style="font-size:18px;letter-spacing:1px">${tempPassword}</b></p>
        <p style="margin:24px 0">
          <a href="${loginUrl}" style="display:inline-block;background:#F26B3A;color:#fff;padding:12px 28px;border-radius:9999px;font-weight:600;text-decoration:none">로그인하기</a>
        </p>
        <p style="font-size:13px;color:#888">로그인 후 보안을 위해 비밀번호를 변경해주세요.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="font-size:12px;color:#999">본인이 요청하지 않은 변경이라면 관리자에게 문의해주세요.</p>
      `,
    })
    return undefined
  } catch (err) {
    console.error('[members] password reset email send failed', err)
    return '비밀번호는 재설정되었지만 이메일 발송에 실패했습니다. 다시 시도해주세요.'
  }
}

/** 관리자에 의한 멤버 비밀번호 재설정 — 새 임시 비밀번호를 생성해 본인 이메일로만 발송 (관리자에게는 노출하지 않음) */
export async function resetMemberPassword(memberId: string): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  const supabase = createAdminClient()

  const { data: target } = await supabase
    .from('org_members')
    .select('role, status, user_id')
    .eq('id', memberId)
    .eq('org_id', session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.role === 'owner') return { error: 'Owner 계정은 이 기능으로 재설정할 수 없습니다.' }
  if (target.status !== 'active' || !target.user_id) {
    return { error: '아직 가입을 완료하지 않은 멤버입니다. 초대 재전송을 이용해주세요.' }
  }

  const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(target.user_id)
  if (getUserError || !userData.user?.email) return { error: '계정 정보를 확인할 수 없습니다.' }

  const tempPassword = generateTempPassword()
  const { error: updateError } = await supabase.auth.admin.updateUserById(target.user_id, {
    password: tempPassword,
  })
  if (updateError) return { error: '비밀번호 재설정 실패: ' + updateError.message }

  const warning = await sendPasswordResetEmail(userData.user.email, tempPassword, session.orgName ?? '조직')
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

/**
 * 멤버 역할 변경.
 * 역할이 실효 제품 권한을 바꾸므로(admin=전권, member=명시 grant) 변경을 대상 SaaS로 전파한다.
 * - 새 권한집합 전체를 grant(멱등) → 유지되는 제품도 새 role로 재전송해 수신 측 관리자 승격 반영.
 * - 잃은 제품은 revoke(soft-delete).
 * 한계: 수신 측 grant는 승격만 하고 강등은 안 함(계약 §5·조직 생성자 보호) — admin→member 강등 시
 *       "유지되는 제품"의 관리자 표시는 SaaS에 남을 수 있다.
 */
export async function updateMemberRole(
  memberId: string,
  newRole: 'admin' | 'member'
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  // owner 역할은 변경 불가
  const supabase = createAdminClient()
  const { data: target } = await supabase
    .from('org_members')
    .select('role, user_id, invited_email')
    .eq('id', memberId)
    .eq('org_id', session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.role === 'owner') return { error: 'Owner 역할은 변경할 수 없습니다.' }

  const { error } = await supabase
    .from('org_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('org_id', session.orgId!)

  if (error) return { error: '역할 변경 실패: ' + error.message }

  revalidatePath('/members')

  // 역할 변경 → 실효 제품 권한 diff를 대상 SaaS로 push (계약 §9)
  const allUnlockedSlugs = await getOrgUnlockedSlugs(supabase, session.orgId!, session.planId)
  const { data: prevRows } = await supabase.rpc('get_org_member_products', { p_org_id: session.orgId })
  const grantedSlugs: string[] =
    (prevRows as { member_id: string; slugs: string[] }[] | null)
      ?.find((r) => r.member_id === memberId)?.slugs ?? []

  const oldEntitled = effectiveSlugs(target.role, grantedSlugs, allUnlockedSlugs)
  const newEntitled = effectiveSlugs(newRole, grantedSlugs, allUnlockedSlugs)
  const newSet = new Set(newEntitled)
  const toRevoke = oldEntitled.filter((s) => !newSet.has(s))

  const email = await resolveMemberEmail(supabase, target)
  if (email) {
    const orgInfo = { external_org_id: session.orgId ?? undefined, name: session.orgName ?? undefined }
    const memberInfo = {
      email,
      external_user_id: target.user_id ?? undefined,
      role: newRole as 'member' | 'admin',
    }
    await Promise.all([
      ...newEntitled.map((product) =>
        pushProvision({ product, action: 'grant', org: orgInfo, member: memberInfo })
      ),
      ...toRevoke.map((product) =>
        pushProvision({ product, action: 'revoke', org: orgInfo, member: memberInfo })
      ),
    ])
  }

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

/**
 * 멤버 제품 사용권한(멤버×제품 매트릭스) 업데이트.
 * DB에 grant 상태를 저장한 뒤, 이전 상태와 diff 하여 대상 SaaS로 grant/revoke를 push 한다.
 * (계약: docs/sso-provisioning-contract.md §9 — qmintel이 source of truth)
 * push 실패는 DB 반영을 막지 않는다(pushProvision은 throw 하지 않고 sso_provision_log에 기록).
 */
export async function updateMemberProducts(
  memberId: string,
  slugs: string[]
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  const supabase = createAdminClient()

  // 대상 멤버 확인 (이메일/user_id/role)
  const { data: target } = await supabase
    .from('org_members')
    .select('user_id, role, invited_email, status')
    .eq('id', memberId)
    .eq('org_id', session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }

  // 이메일 해석 (사업장 배정과 동일: user_id 있으면 auth에서, 없으면 invited_email)
  let email = target.invited_email ?? ''
  if (target.user_id) {
    const { data: { user } } = await supabase.auth.admin.getUserById(target.user_id)
    email = user?.email ?? target.invited_email ?? ''
  }
  if (!email) return { error: '멤버 이메일을 확인할 수 없습니다.' }

  // 이전 grant 상태 조회 (diff 계산용)
  const { data: prevRows } = await supabase.rpc('get_org_member_products', {
    p_org_id: session.orgId,
  })
  const prevSlugs: string[] =
    (prevRows as { member_id: string; slugs: string[] }[] | null)
      ?.find((r) => r.member_id === memberId)?.slugs ?? []

  // DB 반영
  const { error } = await supabase.rpc('set_member_products', {
    p_member_id: memberId,
    p_slugs: slugs,
  })
  if (error) return { error: '제품 권한 저장 실패: ' + error.message }

  revalidatePath('/members')

  // diff → SaaS push
  const nextSet = new Set(slugs)
  const prevSet = new Set(prevSlugs)
  const added = slugs.filter((s) => !prevSet.has(s))
  const removed = prevSlugs.filter((s) => !nextSet.has(s))

  const orgInfo = { external_org_id: session.orgId ?? undefined, name: session.orgName ?? undefined }
  const memberInfo = {
    email,
    external_user_id: target.user_id ?? undefined,
    role: (target.role === 'member' ? 'member' : 'admin') as 'member' | 'admin',
  }

  await Promise.all([
    ...added.map((product) =>
      pushProvision({ product, action: 'grant', org: orgInfo, member: memberInfo })
    ),
    ...removed.map((product) =>
      pushProvision({ product, action: 'revoke', org: orgInfo, member: memberInfo })
    ),
  ])

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
    .select('role, user_id, invited_email')
    .eq('id', memberId)
    .eq('org_id', session.orgId!)
    .single()

  if (!target) return { error: '멤버를 찾을 수 없습니다.' }
  if (target.role === 'owner') return { error: 'Owner는 제거할 수 없습니다.' }
  if (target.user_id === session.id) return { error: '자기 자신은 제거할 수 없습니다.' }

  // 탈퇴 push(계약 §9)를 위해 제거 전 제품 grant + 이메일 확보
  const { data: prevRows } = await supabase.rpc('get_org_member_products', {
    p_org_id: session.orgId,
  })
  const grantedSlugs: string[] =
    (prevRows as { member_id: string; slugs: string[] }[] | null)
      ?.find((r) => r.member_id === memberId)?.slugs ?? []

  let email = target.invited_email ?? ''
  if (target.user_id) {
    const { data: { user } } = await supabase.auth.admin.getUserById(target.user_id)
    email = user?.email ?? target.invited_email ?? ''
  }

  const { error } = await supabase
    .from('org_members')
    .delete()
    .eq('id', memberId)
    .eq('org_id', session.orgId!)

  if (error) return { error: '제거 실패: ' + error.message }

  revalidatePath('/members')

  // 대상 SaaS에서 이 멤버의 모든 제품 회수 (soft-delete)
  if (email && grantedSlugs.length > 0) {
    const orgInfo = { external_org_id: session.orgId!, name: session.orgName ?? undefined }
    const memberInfo = {
      email,
      external_user_id: target.user_id ?? undefined,
      role: (target.role === 'member' ? 'member' : 'admin') as 'member' | 'admin',
    }
    await Promise.all(
      grantedSlugs.map((product) =>
        pushProvision({ product, action: 'revoke', org: orgInfo, member: memberInfo })
      )
    )
  }

  return {}
}

/**
 * 전량 재동기화 — 조직의 모든 멤버를 현재 제품 권한 상태 그대로 대상 SaaS로 다시 grant push 한다.
 * 평소 프로비저닝은 "변경분(diff)"에만 발신되므로, 수신부가 나중에 붙은 SaaS나 과거에 skip된
 * grant(수신부 미준비/시크릿 미설정 시점)를 한 번에 메꾸기 위한 관리자용 배치.
 * - owner/admin: org에서 잠금 해제된 전체 제품 기준 grant (member_products 행이 없어 diff로는 안 나감).
 * - member: org_member_products에 명시된 제품만 grant.
 * - suspended 멤버는 제외. grant는 멱등이라 이미 반영된 멤버는 그대로 유지된다.
 * pushProvision은 throw 하지 않으므로(수신부 없음/실패는 sso_provision_log에 기록) 부분 실패해도 계속 진행.
 */
export async function resyncProvisioning(): Promise<ActionResult & { members?: number; grants?: number }> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  const supabase = createAdminClient()

  const allUnlockedSlugs = await getOrgUnlockedSlugs(supabase, session.orgId!, session.planId)

  const { data: rawMembers } = await supabase
    .from('org_members')
    .select('id, user_id, role, invited_email, status')
    .eq('org_id', session.orgId!)

  const { data: prodRows } = await supabase.rpc('get_org_member_products', { p_org_id: session.orgId })
  const grantMap = new Map<string, string[]>(
    (prodRows as { member_id: string; slugs: string[] }[] | null)
      ?.map((r) => [r.member_id, r.slugs ?? []]) ?? []
  )

  const orgInfo = { external_org_id: session.orgId ?? undefined, name: session.orgName ?? undefined }

  const tasks: (() => Promise<unknown>)[] = []
  let memberCount = 0

  for (const m of rawMembers ?? []) {
    if (m.status === 'suspended') continue

    const slugs = effectiveSlugs(m.role, grantMap.get(m.id) ?? [], allUnlockedSlugs)
    if (slugs.length === 0) continue

    const email = await resolveMemberEmail(supabase, m)
    if (!email) continue

    memberCount++
    const memberInfo = {
      email,
      external_user_id: m.user_id ?? undefined,
      role: (m.role === 'member' ? 'member' : 'admin') as 'member' | 'admin',
    }
    for (const product of slugs) {
      tasks.push(() => pushProvision({ product, action: 'grant', org: orgInfo, member: memberInfo }))
    }
  }

  await runBatched(tasks)
  revalidatePath('/members')
  return { members: memberCount, grants: tasks.length }
}
