'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Star, Loader2, X, MapPin } from 'lucide-react'
import { addSite, updateSite, deleteSite, setPrimarySite } from './actions'

export interface SiteRow {
  id: string
  name: string
  country: string
  timezone: string
  isPrimary: boolean
  createdAt: string
}

interface Props {
  sites: SiteRow[]
  canManage: boolean
  maxSites: number
}

const TIMEZONES = [
  { value: 'Asia/Seoul',     label: '한국 (KST, UTC+9)' },
  { value: 'Asia/Tokyo',     label: '일본 (JST, UTC+9)' },
  { value: 'Asia/Shanghai',  label: '중국 (CST, UTC+8)' },
  { value: 'Asia/Ho_Chi_Minh', label: '베트남 (ICT, UTC+7)' },
  { value: 'Europe/Berlin',  label: '독일 (CET, UTC+1)' },
  { value: 'America/New_York', label: '미국 동부 (ET)' },
  { value: 'UTC',            label: 'UTC' },
]

const COUNTRIES = [
  { value: 'KR', label: '🇰🇷 대한민국' },
  { value: 'JP', label: '🇯🇵 일본' },
  { value: 'CN', label: '🇨🇳 중국' },
  { value: 'VN', label: '🇻🇳 베트남' },
  { value: 'DE', label: '🇩🇪 독일' },
  { value: 'US', label: '🇺🇸 미국' },
  { value: 'OTHER', label: '기타' },
]

// ── 사업장 추가/수정 모달 ──────────────────────────────────────

function SiteModal({
  onClose,
  editTarget,
}: {
  onClose: () => void
  editTarget?: SiteRow
}) {
  const [name, setName] = useState(editTarget?.name ?? '')
  const [country, setCountry] = useState(editTarget?.country ?? 'KR')
  const [timezone, setTimezone] = useState(editTarget?.timezone ?? 'Asia/Seoul')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const isEdit = !!editTarget

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      const result = isEdit
        ? await updateSite(editTarget.id, name, country, timezone)
        : await addSite(name, country, timezone)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-7">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-extrabold text-brand-navy mb-1">
          {isEdit ? '사업장 수정' : '사업장 추가'}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          제조 공장, 지사, 창고 등 별도 사업장을 등록하세요.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">사업장명</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 구미 1공장, 베트남 하노이 법인"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">국가</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-navy bg-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">시간대</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-navy bg-white"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-orange text-white px-4 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEdit ? '저장' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────

export default function SitesClient({ sites, canManage, maxSites }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<SiteRow | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const atLimit = maxSites > 0 && sites.length >= maxSites

  function handleDelete(site: SiteRow) {
    if (site.isPrimary) return alert('기본 사업장은 삭제할 수 없습니다.')
    if (!confirm(`"${site.name}" 사업장을 삭제하시겠습니까?`)) return
    setPendingId(site.id)
    startTransition(async () => {
      await deleteSite(site.id)
      setPendingId(null)
    })
  }

  function handleSetPrimary(siteId: string) {
    setPendingId(siteId)
    startTransition(async () => {
      await setPrimarySite(siteId)
      setPendingId(null)
    })
  }

  return (
    <>
      {/* 추가 버튼 */}
      {canManage && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{sites.length}</span>
            {maxSites > 0 ? ` / ${maxSites}개` : '개'} 등록됨
          </p>
          <button
            onClick={() => setShowAdd(true)}
            disabled={atLimit}
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={atLimit ? `플랜 한도(${maxSites}개)에 도달했습니다.` : undefined}
          >
            <Plus className="h-4 w-4" />
            사업장 추가
          </button>
        </div>
      )}
      {atLimit && canManage && (
        <p className="text-xs text-amber-700 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          플랜 한도({maxSites}개)에 도달했습니다.{' '}
          <a href="/billing/upgrade" className="font-semibold underline">업그레이드</a>하면 더 추가할 수 있습니다.
        </p>
      )}

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sites.map((site) => (
          <div
            key={site.id}
            className={`rounded-2xl border p-5 bg-white transition-colors ${
              site.isPrimary ? 'border-brand-orange' : 'border-border'
            }`}
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`h-4 w-4 shrink-0 ${site.isPrimary ? 'text-brand-orange' : 'text-muted-foreground'}`} />
                <h3 className="font-extrabold text-brand-navy truncate">{site.name}</h3>
              </div>
              {site.isPrimary && (
                <span className="shrink-0 text-[10px] font-bold bg-brand-orange text-white rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Star className="h-2.5 w-2.5" />
                  기본
                </span>
              )}
            </div>

            {/* 상세 */}
            <div className="space-y-1 mb-4 text-xs text-muted-foreground">
              <p>{COUNTRIES.find(c => c.value === site.country)?.label ?? site.country}</p>
              <p>{TIMEZONES.find(t => t.value === site.timezone)?.label ?? site.timezone}</p>
              <p>등록일: {new Date(site.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>

            {/* 액션 */}
            {canManage && (
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                {!site.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(site.id)}
                    disabled={isPending && pendingId === site.id}
                    className="text-xs text-muted-foreground hover:text-brand-orange transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-orange"
                  >
                    {isPending && pendingId === site.id
                      ? <Loader2 className="h-3 w-3 animate-spin inline" />
                      : '기본으로 설정'
                    }
                  </button>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => setEditTarget(site)}
                    className="p-1.5 text-muted-foreground hover:text-brand-navy transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {!site.isPrimary && (
                    <button
                      onClick={() => handleDelete(site)}
                      disabled={isPending && pendingId === site.id}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {sites.length === 0 && (
          <div className="col-span-3 py-12 text-center text-sm text-muted-foreground">
            등록된 사업장이 없습니다.
          </div>
        )}
      </div>

      {/* 모달 */}
      {(showAdd || editTarget) && (
        <SiteModal
          onClose={() => { setShowAdd(false); setEditTarget(null) }}
          editTarget={editTarget ?? undefined}
        />
      )}
    </>
  )
}
