'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, ChevronDown, RefreshCw, Building2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GRADE_LABELS, PRICING_TIERS, type Grade } from '@/lib/auth/grades'

type CompanyRow = {
  id: string
  name: string
  type: string
  grade: string
  status: string
  created_at: string
  admin_name: string | null
  admin_email: string | null
}

const GRADES: Grade[] = ['free', 'silver', 'gold', 'platinum']
const PAID_GRADES = PRICING_TIERS.filter((t) => t.id !== 'free').map((t) => t.id as Grade)

export default function SuperAdminPanel() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const pending = companies.filter((c) => c.status === 'pending')
  const active = companies.filter((c) => c.status === 'active')

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('qh_get_all_companies')
    if (!error && data) setCompanies(data as CompanyRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  async function approveCompany(id: string, grade: Grade) {
    setActionLoading(id + '-approve')
    const supabase = createClient()
    await supabase.rpc('qh_approve_company', { p_company_id: id, p_grade: grade })
    await fetchCompanies()
    setActionLoading(null)
  }

  async function rejectCompany(id: string) {
    if (!confirm('이 기업을 거절하고 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setActionLoading(id + '-reject')
    const supabase = createClient()
    await supabase.rpc('qh_reject_company', { p_company_id: id })
    await fetchCompanies()
    setActionLoading(null)
  }

  async function setGrade(id: string, grade: Grade) {
    setActionLoading(id + '-grade')
    const supabase = createClient()
    await supabase.rpc('qh_set_company_grade', { p_company_id: id, p_grade: grade })
    await fetchCompanies()
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
          onClick={fetchCompanies}
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
          { key: 'all', label: '전체 기업', icon: Users, count: companies.length },
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
              {pending.map((company) => (
                <PendingCard
                  key={company.id}
                  company={company}
                  actionLoading={actionLoading}
                  onApprove={approveCompany}
                  onReject={rejectCompany}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 전체 기업 탭 */}
      {!loading && tab === 'all' && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-foreground">기업명</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">관리자</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">유형</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">상태</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">등급</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">가입일</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, i) => (
                <tr key={company.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                  <td className="px-5 py-3.5 font-medium text-foreground">{company.name}</td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-foreground">{company.admin_name ?? '—'}</p>
                      <p className="text-muted-foreground text-xs">{company.admin_email ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {company.type === 'corporate' ? '기업' : '개인'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      company.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {company.status === 'active' ? '활성' : '대기'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <GradeSelect
                      value={company.grade as Grade}
                      loading={actionLoading === company.id + '-grade'}
                      onChange={(g) => setGrade(company.id, g)}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {new Date(company.created_at).toLocaleDateString('ko-KR')}
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
  company,
  actionLoading,
  onApprove,
  onReject,
}: {
  company: CompanyRow
  actionLoading: string | null
  onApprove: (id: string, grade: Grade) => void
  onReject: (id: string) => void
}) {
  const [selectedGrade, setSelectedGrade] = useState<Grade>('silver')

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-lg">{company.name}</h3>
            <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-medium">
              기업 · 승인 대기
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            담당자: {company.admin_name ?? '—'} ({company.admin_email ?? '—'})
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            신청일: {new Date(company.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 등급 선택 */}
          <GradeSelect
            value={selectedGrade}
            loading={false}
            onChange={setSelectedGrade}
            options={['silver', 'gold', 'platinum'] as Grade[]}
          />

          {/* 승인 */}
          <button
            onClick={() => onApprove(company.id, selectedGrade)}
            disabled={actionLoading === company.id + '-approve'}
            className="flex items-center gap-1.5 bg-brand-navy text-white text-sm font-semibold rounded-full px-4 py-2 hover:bg-brand-navy-dark transition-colors disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {actionLoading === company.id + '-approve' ? '처리 중...' : '승인'}
          </button>

          {/* 거절 */}
          <button
            onClick={() => onReject(company.id)}
            disabled={actionLoading === company.id + '-reject'}
            className="flex items-center gap-1.5 border border-red-300 text-red-600 text-sm font-medium rounded-full px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            {actionLoading === company.id + '-reject' ? '처리 중...' : '거절'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 등급 선택 드롭다운 ─────────────────────────────────────────
function GradeSelect({
  value,
  loading,
  onChange,
  options = ['free', 'silver', 'gold', 'platinum'] as Grade[],
}: {
  value: Grade
  loading: boolean
  onChange: (g: Grade) => void
  options?: Grade[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Grade)}
        disabled={loading}
        className="appearance-none bg-muted border border-border rounded-full px-3 py-1.5 pr-7 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/30 disabled:opacity-60 cursor-pointer"
      >
        {options.map((g) => (
          <option key={g} value={g}>
            {GRADE_LABELS[g]}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  )
}
