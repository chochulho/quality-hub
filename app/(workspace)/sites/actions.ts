'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult = { error?: string }

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.orgId) return { error: '조직 정보가 없습니다.' }
  if (!['owner', 'admin', 'superadmin'].includes(session.role)) {
    return { error: '관리자만 이 작업을 수행할 수 있습니다.' }
  }
  return { session }
}

/** 사업장 추가 */
export async function addSite(
  name: string,
  country: string,
  timezone: string
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }
  const { session } = auth

  if (!name.trim()) return { error: '사업장명을 입력해 주세요.' }

  const supabase = createAdminClient()

  // 플랜 사업장 수 확인
  const { data: plan } = await supabase
    .from('plans')
    .select('max_sites')
    .eq('id', session.planId)
    .single()

  const { count: currentCount } = await supabase
    .from('org_sites')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', session.orgId!)

  if (plan && plan.max_sites > 0 && (currentCount ?? 0) >= plan.max_sites) {
    return { error: `플랜 한도(${plan.max_sites}개)에 도달했습니다. 업그레이드 후 추가하세요.` }
  }

  const { error } = await supabase.from('org_sites').insert({
    org_id: session.orgId!,
    name: name.trim(),
    country: country || 'KR',
    timezone: timezone || 'Asia/Seoul',
    is_primary: false,
  })

  if (error) return { error: '추가 실패: ' + error.message }

  revalidatePath('/sites')
  return {}
}

/** 사업장 수정 */
export async function updateSite(
  siteId: string,
  name: string,
  country: string,
  timezone: string
): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }

  if (!name.trim()) return { error: '사업장명을 입력해 주세요.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('org_sites')
    .update({ name: name.trim(), country, timezone })
    .eq('id', siteId)
    .eq('org_id', auth.session.orgId!)

  if (error) return { error: '수정 실패: ' + error.message }

  revalidatePath('/sites')
  return {}
}

/** 기본 사업장 변경 */
export async function setPrimarySite(siteId: string): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }

  const supabase = createAdminClient()

  // 기존 기본 해제
  await supabase
    .from('org_sites')
    .update({ is_primary: false })
    .eq('org_id', auth.session.orgId!)

  // 새 기본 설정
  const { error } = await supabase
    .from('org_sites')
    .update({ is_primary: true })
    .eq('id', siteId)
    .eq('org_id', auth.session.orgId!)

  if (error) return { error: '변경 실패: ' + error.message }

  revalidatePath('/sites')
  return {}
}

/** 사업장 삭제 (기본 사업장은 삭제 불가) */
export async function deleteSite(siteId: string): Promise<ActionResult> {
  const auth = await requireAdminSession()
  if (auth.error || !auth.session) return { error: auth.error }

  const supabase = createAdminClient()

  const { data: site } = await supabase
    .from('org_sites')
    .select('is_primary')
    .eq('id', siteId)
    .eq('org_id', auth.session.orgId!)
    .single()

  if (!site) return { error: '사업장을 찾을 수 없습니다.' }
  if (site.is_primary) return { error: '기본 사업장은 삭제할 수 없습니다.' }

  const { error } = await supabase
    .from('org_sites')
    .delete()
    .eq('id', siteId)
    .eq('org_id', auth.session.orgId!)

  if (error) return { error: '삭제 실패: ' + error.message }

  revalidatePath('/sites')
  return {}
}
