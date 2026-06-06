'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, ChevronDown, RefreshCw, Building2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLAN_LABELS, type PlanId } from '@/lib/auth/grades'

type OrgRow = {
  id: string
  name: string
  plan_id: string
  org_type: string
  status: string
  created_at: string
  owner_email: string | null
}

const ALL_PLANS: PlanId[] = ['free', 'starter', 'team', 'business', 'enterprise']
const PAID_PLANS: PlanId[] = ['starter', 'team', 'business', 'enterprise']

export default function SuperAdminPanel() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const pending = orgs.filter((o) => o.status === 'pending')
  const active  = orgs.filter((o) => o.status === 'active')

  const fetchOrgs = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_all_organizations')
    if (error) setFetchError(error.message)
    else if (data) setOrgs(data as OrgRow[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrgs() }, [fetchOrgs])

  async function approveOrg(id: string, planId: PlanId) {
    setActionLoading(id + '-approve')
    const supabase = createClient()
    await supabase.rpc('approve_org', { p_org_id: id, p_plan_id: planId })
    await fetchOrgs()
    setActionLoading(null)
  }

  async function rejectOrg(id: string) {
    if (!confirm('이 기업을 거절하고 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setActionLoading(id + '-reject')
    const supabase = createClient()
    await supabase.rpc('reject_org', { p_org_id: id })
    await fetchOrgs()
    setActionLoading(null)
  }

  async function setPlan(id: string, planId: PlanId) {
    setActionLoading(id + '-plan')
    const supabase = createClient()
    await supabase.rpc('set_org_plan', { p_org_id: id, p_plan_id: planId })
    await fetchOrgs()
    setActionLoading(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">슈퍼관리자</p>
          <h1 className="text-3xl font-extrabold text-brand-navy">관리자 패널</h1>
        </div>
        <button
          onClick={fetchOrgs}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-2 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-muted rounded-full p-1 w-fit mb-8">
        {([
          { key: 'pending', label: '승인 대기', icon: Building2, count: pending.length },
          { key: 'all',     label: '전체 조직', icon: Users,     count: orgs.length },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === key ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                key === 'pending' && count > 0
                  ? 'bg-brand-orange text-white'
                  : 'bg-border text-muted-foreground'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 에러 */}
      {fetchError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold mb-0.5">데이터 로드 실패</p>
          <p className="font-mono text-xs">{fetchError}</p>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-16 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" />
          데이터 불러오는 중...
        </div>
      )}

      {/* 승인 대기 탭 */}
      {!loading && tab === 'pending' && (
        <>
          {pending.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Check className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="font-medium">대기 중인 기업이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((org) => (
                <PendingCard
                  key={org.id}
                  org={org}
                  actionLoading={actionLoading}
                  onApprove={approveOrg}
                  onReject={rejectOrg}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 전체 조직 탭 */}
      {!loading && tab === 'all' && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-foreground">조직명</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">오너</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">유형</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">상태</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">플랜</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">가입일</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org, i) => (
                <tr key={org.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                  <td className="px-5 py-3.5 font-medium text-foreground">{org.name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{org.owner_email ?? '—'}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {org.org_type === 'corporate' ? '기업' : '개인'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      org.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {org.status === 'active' ? '활성' : '대기'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <PlanSelect
                      value={org.plan_id as PlanId}
                      loading={actionLoading === org.id + '-plan'}
                      onChange={(p) => setPlan(org.id, p)}
                      options={ALL_PLANS}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {new Date(org.created_at).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── 대기 중 카드 ──────────────────────────────────────────────
function PendingCard({
  org,
  actionLoading,
  onApprove,
  onReject,
}: {
  org: OrgRow
  actionLoading: string | null
  onApprove: (id: string, plan: PlanId) => void
  onReject: (id: string) => void
}) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('starter')

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-lg">{org.name}</h3>
            <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-medium">
              기업 · 승인 대기
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            오너: {org.owner_email ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            신청일: {new Date(org.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PlanSelect
            value={selectedPlan}
            loading={false}
            onChange={setSelectedPlan}
            options={PAID_PLANS}
          />

          <button
            onClick={() => onApprove(org.id, selectedPlan)}
            disabled={actionLoading === org.id + '-approve'}
            className="flex items-center gap-1.5 bg-brand-navy text-white text-sm font-semibold rounded-full px-4 py-2 hover:bg-brand-navy-dark transition-colors disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {actionLoading === org.id + '-approve' ? '처리 중...' : '승인'}
          </button>

          <button
            onClick={() => onReject(org.id)}
            disabled={actionLoading === org.id + '-reject'}
            className="flex items-center gap-1.5 border border-red-300 text-red-600 text-sm font-medium rounded-full px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            {actionLoading === org.id + '-reject' ? '처리 중...' : '거절'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 플랜 선택 드롭다운 ─────────────────────────────────────────
function PlanSelect({
  value,
  loading,
  onChange,
  options = ALL_PLANS,
}: {
  value: PlanId
  loading: boolean
  onChange: (p: PlanId) => void
  options?: PlanId[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PlanId)}
        disabled={loading}
        className="appearance-none bg-muted border border-border rounded-full px-3 py-1.5 pr-7 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/30 disabled:opacity-60 cursor-pointer"
      >
        {options.map((p) => (
          <option key={p} value={p}>{PLAN_LABELS[p]}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  )
}
