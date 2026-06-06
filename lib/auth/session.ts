import { createClient } from '@/lib/supabase/server'
import { SUPERADMIN_EMAIL } from '@/lib/auth/grades'

export type UserSession = {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'owner' | 'admin' | 'member'
  orgId: string | null
  orgName: string | null
  logoUrl: string | null
  planId: string                                      // 'free' | 'starter' | 'team' | 'business' | 'enterprise'
  orgStatus: 'pending' | 'active' | 'suspended'
  orgType: 'individual' | 'corporate'
  memberStatus: 'active' | 'invited' | 'suspended'
} | null

/**
 * Server Component용 현재 사용자 세션 조회.
 * Supabase auth.getUser() + get_my_membership() RPC 호출.
 * 비로그인 시 null 반환.
 */
export async function getSession(): Promise<UserSession> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const isSuperadmin = user.email === SUPERADMIN_EMAIL

  // 슈퍼관리자는 org 없이도 세션 반환
  if (isSuperadmin) {
    return {
      id: user.id,
      email: user.email!,
      name: '관리자',
      role: 'superadmin',
      orgId: null,
      orgName: null,
      logoUrl: null,
      planId: 'enterprise',
      orgStatus: 'active',
      orgType: 'individual',
      memberStatus: 'active',
    }
  }

  const { data } = await supabase.rpc('get_my_membership')
  const m = data?.[0]

  if (!m) return null

  return {
    id: user.id,
    email: user.email!,
    name: user.email!.split('@')[0],   // TODO: org_members에 name 컬럼 추가 후 교체
    role: m.member_role as 'owner' | 'admin' | 'member',
    orgId: m.org_id,
    orgName: m.org_name,
    logoUrl: m.logo_url ?? null,
    planId: m.plan_id ?? 'free',
    orgStatus: m.org_status as 'pending' | 'active' | 'suspended',
    orgType: m.org_type as 'individual' | 'corporate',
    memberStatus: m.member_status as 'active' | 'invited' | 'suspended',
  }
}
