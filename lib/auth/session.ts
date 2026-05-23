import { createClient } from '@/lib/supabase/server'
import { SUPERADMIN_EMAIL, type Grade } from '@/lib/auth/grades'

export type UserSession = {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'company_admin' | 'member'
  companyId: string | null
  companyName: string | null
  grade: Grade
  companyStatus: 'pending' | 'active'
  companyType: 'individual' | 'corporate'
} | null

/**
 * Server Component용 현재 사용자 세션 조회.
 * Supabase auth.getUser() + qh_get_my_profile() RPC 호출.
 * 비로그인 시 null 반환.
 */
export async function getSession(): Promise<UserSession> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const isSuperadmin = user.email === SUPERADMIN_EMAIL

  // 슈퍼관리자는 qh_profiles 레코드가 없어도 세션 반환
  const { data } = await supabase.rpc('qh_get_my_profile')
  const profile = data?.[0]

  if (!profile && !isSuperadmin) return null

  return {
    id: user.id,
    email: user.email!,
    name: profile?.prof_name ?? '관리자',
    role: isSuperadmin ? 'superadmin' : (profile?.role ?? 'member'),
    companyId: profile?.company_id ?? null,
    companyName: profile?.company_name ?? null,
    grade: isSuperadmin ? 'platinum' : ((profile?.company_grade as Grade) ?? 'free'),
    companyStatus: (profile?.company_status as 'pending' | 'active') ?? 'active',
    companyType: (profile?.company_type as 'individual' | 'corporate') ?? 'individual',
  }
}
