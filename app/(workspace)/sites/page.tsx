import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import SitesClient, { type SiteRow } from './SitesClient'

export const metadata = { title: '사업장 관리' }

export default async function SitesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.orgId) redirect('/dashboard')

  const canManage = ['owner', 'admin', 'superadmin'].includes(session.role)
  const supabase = createAdminClient()

  // 사업장 목록 조회
  const { data: rawSites } = await supabase
    .from('org_sites')
    .select('id, name, country, timezone, is_primary, created_at')
    .eq('org_id', session.orgId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  const sites: SiteRow[] = (rawSites ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    country: s.country,
    timezone: s.timezone,
    isPrimary: s.is_primary,
    createdAt: s.created_at,
  }))

  // 플랜 사업장 한도 조회
  const { data: plan } = await supabase
    .from('plans')
    .select('max_sites')
    .eq('id', session.planId)
    .single()

  const maxSites = plan?.max_sites ?? 1

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-brand-navy/5 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-brand-navy" />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">사업장 관리</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8 ml-12">
        제조 공장·지사·창고 등 사업장을 등록하고 멤버별로 배정하세요.
        {maxSites > 0 && (
          <> 현재 플랜({session.planId}): 최대 <strong>{maxSites}개</strong> · {' '}
            <Link href="/billing/upgrade" className="text-brand-orange hover:underline">업그레이드</Link>
          </>
        )}
      </p>

      <SitesClient
        sites={sites}
        canManage={canManage}
        maxSites={maxSites}
      />
    </div>
  )
}
