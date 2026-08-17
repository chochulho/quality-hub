import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { ALL_TOOL_IDS, TOOLS, isToolUnlocked, type ToolId } from '@/lib/auth/grades'
import { TOOL_TO_SLUG } from '@/lib/sso/provisioning'
import MembersClient, { type MemberRow, type ProductOption } from '@/components/members/MembersClient'

export const metadata = { title: '인원 관리' }

export default async function MembersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.orgId) redirect('/dashboard')

  const canManage = ['owner', 'admin', 'superadmin'].includes(session.role)
  const supabase = createAdminClient()

  // 병렬 조회
  const [rawMembersRes, sitesRes, memberSitesRes, memberProductsRes, selectedToolsRes, planRes] = await Promise.all([
    supabase
      .from('org_members')
      .select('id, user_id, role, invited_email, status, created_at, department')
      .eq('org_id', session.orgId)
      .order('created_at', { ascending: true }),
    supabase
      .from('org_sites')
      .select('id, name')
      .eq('org_id', session.orgId)
      .order('is_primary', { ascending: false }),
    supabase.rpc('get_org_member_sites', { p_org_id: session.orgId }),
    supabase.rpc('get_org_member_products', { p_org_id: session.orgId }),
    supabase.from('org_selected_tools').select('tool_key').eq('org_id', session.orgId),
    supabase.from('plans').select('max_members').eq('id', session.planId).single(),
  ])

  // 멤버별 사업장 매핑
  const siteMap = new Map<string, string[]>(
    (memberSitesRes.data ?? []).map((r: { member_id: string; site_ids: string[] }) => [
      r.member_id,
      r.site_ids ?? [],
    ])
  )

  // 멤버별 제품 grant 매핑
  const productMap = new Map<string, string[]>(
    (memberProductsRes.data ?? []).map((r: { member_id: string; slugs: string[] }) => [
      r.member_id,
      r.slugs ?? [],
    ])
  )

  // org 플랜에서 사용 가능한 도구 → 제품 매트릭스 컬럼
  const selectedTools = (selectedToolsRes.data ?? []).map(
    (r: { tool_key: string }) => r.tool_key
  ) as ToolId[]
  const productOptions: ProductOption[] = ALL_TOOL_IDS
    .filter((toolId) => isToolUnlocked(session.planId, toolId, selectedTools))
    .map((toolId) => ({ slug: TOOL_TO_SLUG[toolId], name: TOOLS[toolId].name }))

  // 각 멤버의 이메일 보강
  const members: MemberRow[] = await Promise.all(
    (rawMembersRes.data ?? []).map(async (m) => {
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
        department: m.department ?? null,
        siteIds: siteMap.get(m.id) ?? [],
        productSlugs: productMap.get(m.id) ?? [],
      }
    })
  )

  const sites = (sitesRes.data ?? []) as { id: string; name: string }[]
  const maxMembers = planRes.data?.max_members ?? 10

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

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
        팀원을 초대하고 역할 및 사업장 접근 권한을 관리하세요.
        {maxMembers > 0 && (
          <> 현재 플랜({session.planId}): 최대 <strong>{maxMembers}명</strong> · {' '}
            <Link href="/billing/upgrade" className="text-brand-orange hover:underline">업그레이드</Link>
          </>
        )}
      </p>

      <MembersClient
        members={members}
        sites={sites}
        productOptions={productOptions}
        canManage={canManage}
        currentUserId={session.id}
        maxMembers={maxMembers}
      />
    </div>
  )
}
