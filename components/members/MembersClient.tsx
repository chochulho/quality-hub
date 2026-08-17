'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Trash2, ShieldCheck, Shield, Loader2, X, MapPin, Check, Send, KeyRound, Package, RefreshCw, Briefcase, Pencil } from 'lucide-react'
import { inviteMember, updateMemberRole, removeMember, updateMemberSites, updateMemberProducts, updateMemberDepartment, resendInvite, resetMemberPassword, resyncProvisioning } from '@/app/(workspace)/members/actions'

export interface MemberRow {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'invited' | 'suspended'
  createdAt: string
  department: string | null
  siteIds: string[]
  productSlugs: string[]
}

interface SiteOption { id: string; name: string }
export interface ProductOption { slug: string; name: string }

interface Props {
  members: MemberRow[]
  sites: SiteOption[]
  productOptions: ProductOption[]
  canManage: boolean
  currentUserId: string
  maxMembers: number
}

const ROLE_LABEL: Record<string, string> = { owner: '오너', admin: '관리자', member: '멤버' }
const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  invited:   'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<string, string> = {
  active: '활성', invited: '초대 대기', suspended: '정지',
}

// ── 초대 모달 ────────────────────────────────────────────────────

function InviteModal({ onClose, currentCount, maxMembers }: {
  onClose: () => void
  currentCount: number
  maxMembers: number
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [isPending, startTransition] = useTransition()
  const atLimit = maxMembers > 0 && currentCount >= maxMembers

  function handleSubmit() {
    setError('')
    setWarning('')
    startTransition(async () => {
      const result = await inviteMember(email, role)
      if (result.error) setError(result.error)
      else if (result.warning) setWarning(result.warning)
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
        <h2 className="text-xl font-extrabold text-brand-navy mb-1">팀원 초대</h2>
        <p className="text-sm text-muted-foreground mb-5">초대된 사람이 가입하면 자동으로 조직에 연결됩니다.</p>

        {atLimit && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-4">
            플랜 한도({maxMembers}명)에 도달했습니다.
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">이메일</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com" disabled={atLimit}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">역할</label>
            <div className="flex gap-2">
              {(['member', 'admin'] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    role === r ? 'border-brand-orange bg-brand-orange/5 text-brand-orange' : 'border-border text-muted-foreground hover:border-brand-navy/40'
                  }`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}
        {warning && <p className="text-xs text-amber-700 mb-3">{warning} (멤버 목록에서 재전송할 수 있습니다)</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">{warning ? '닫기' : '취소'}</button>
          <button onClick={handleSubmit} disabled={isPending || !email.trim() || atLimit}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-orange text-white px-4 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            초대 보내기
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 부서 편집 모달 ───────────────────────────────────────────────

function DepartmentModal({ member, departmentOptions, onClose }: {
  member: MemberRow
  departmentOptions: string[]
  onClose: () => void
}) {
  const [value, setValue] = useState(member.department ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError('')
    startTransition(async () => {
      const result = await updateMemberDepartment(member.id, value)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-4 w-4 text-brand-orange" />
          <h2 className="text-lg font-extrabold text-brand-navy">부서</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          <span className="font-medium text-foreground">{member.email}</span>님의 소속 부서를 입력하세요.
          경영관리 모듈에서 부서별 항목 편집 권한 판단에 사용됩니다.
        </p>

        <input
          type="text"
          list="department-options"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="예: 품질팀"
          className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors mb-6"
        />
        <datalist id="department-options">
          {departmentOptions.map((d) => <option key={d} value={d} />)}
        </datalist>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">취소</button>
          <button onClick={handleSave} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-navy text-white px-4 py-3 text-sm font-semibold hover:bg-brand-navy-dark transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 사업장 배정 모달 ─────────────────────────────────────────────

function SiteAssignModal({ member, sites, onClose }: {
  member: MemberRow
  sites: SiteOption[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(member.siteIds))
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle(siteId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(siteId)) next.delete(siteId)
      else next.add(siteId)
      return next
    })
  }

  function handleSave() {
    setError('')
    startTransition(async () => {
      const result = await updateMemberSites(member.id, Array.from(selected))
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-brand-orange" />
          <h2 className="text-lg font-extrabold text-brand-navy">사업장 배정</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          <span className="font-medium text-foreground">{member.email}</span>님이 접근할 사업장을 선택하세요.
        </p>

        {sites.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">등록된 사업장이 없습니다.</p>
        ) : (
          <div className="space-y-2 mb-6">
            {sites.map((site) => {
              const checked = selected.has(site.id)
              return (
                <button
                  key={site.id}
                  onClick={() => toggle(site.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    checked ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:border-brand-navy/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked ? 'bg-brand-orange border-brand-orange' : 'border-border'
                  }`}>
                    {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-medium ${checked ? 'text-brand-orange' : 'text-foreground'}`}>
                    {site.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">취소</button>
          <button onClick={handleSave} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-navy text-white px-4 py-3 text-sm font-semibold hover:bg-brand-navy-dark transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 제품 접근 배정 모달 ──────────────────────────────────────────

function ProductAssignModal({ member, productOptions, onClose }: {
  member: MemberRow
  productOptions: ProductOption[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(member.productSlugs))
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function handleSave() {
    setError('')
    startTransition(async () => {
      const result = await updateMemberProducts(member.id, Array.from(selected))
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Package className="h-4 w-4 text-brand-orange" />
          <h2 className="text-lg font-extrabold text-brand-navy">제품 접근</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          <span className="font-medium text-foreground">{member.email}</span>님이 사용할 제품을 선택하세요.
          저장 시 각 제품에 즉시 반영됩니다.
        </p>

        {productOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            현재 플랜에서 사용 가능한 제품이 없습니다.
          </p>
        ) : (
          <div className="space-y-2 mb-6">
            {productOptions.map((product) => {
              const checked = selected.has(product.slug)
              return (
                <button
                  key={product.slug}
                  onClick={() => toggle(product.slug)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    checked ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:border-brand-navy/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked ? 'bg-brand-orange border-brand-orange' : 'border-border'
                  }`}>
                    {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-medium ${checked ? 'text-brand-orange' : 'text-foreground'}`}>
                    {product.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">취소</button>
          <button onClick={handleSave} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-navy text-white px-4 py-3 text-sm font-semibold hover:bg-brand-navy-dark transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────

export default function MembersClient({ members, sites, productOptions, canManage, currentUserId, maxMembers }: Props) {
  const [showInvite, setShowInvite] = useState(false)
  const [siteTarget, setSiteTarget] = useState<MemberRow | null>(null)
  const [productTarget, setProductTarget] = useState<MemberRow | null>(null)
  const [departmentTarget, setDepartmentTarget] = useState<MemberRow | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [resendMsg, setResendMsg] = useState<{ id: string; text: string } | null>(null)
  const [resetMsg, setResetMsg] = useState<{ id: string; text: string } | null>(null)
  const [syncMsg, setSyncMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSyncing, startSync] = useTransition()

  const siteNameMap = new Map(sites.map((s) => [s.id, s.name]))
  const productNameMap = new Map(productOptions.map((p) => [p.slug, p.name]))
  const departmentOptions = Array.from(
    new Set(members.map((m) => m.department).filter((d): d is string => !!d))
  ).sort()

  function handleRemove(id: string) {
    if (!confirm('이 멤버를 제거하시겠습니까?')) return
    setPendingId(id)
    startTransition(async () => { await removeMember(id); setPendingId(null) })
  }

  function handleResend(id: string) {
    setPendingId(id)
    setResendMsg(null)
    startTransition(async () => {
      const result = await resendInvite(id)
      setPendingId(null)
      setResendMsg({ id, text: result.error ?? result.warning ?? '초대 메일을 재전송했습니다.' })
    })
  }

  function handleRoleToggle(id: string, currentRole: 'admin' | 'member') {
    const next = currentRole === 'admin' ? 'member' : 'admin'
    setPendingId(id)
    startTransition(async () => { await updateMemberRole(id, next); setPendingId(null) })
  }

  function handleResync() {
    if (!confirm('현재 제품 권한 상태를 모든 연동 제품(4M · Gauge · APQP)의 멤버 명단에 다시 반영합니다.\n\n평소엔 권한을 켜고 끌 때만 반영되므로, 이미 권한이 있으나 명단에서 누락된 멤버(특히 관리자)를 한 번에 메꾸는 작업입니다. 계속할까요?')) return
    setSyncMsg('')
    startSync(async () => {
      const result = await resyncProvisioning()
      setSyncMsg(result.error ?? `재동기화 완료 — 멤버 ${result.members ?? 0}명 · grant ${result.grants ?? 0}건 전송`)
    })
  }

  function handleResetPassword(id: string, email: string) {
    if (!confirm(`${email}의 비밀번호를 재설정하시겠습니까?\n새 임시 비밀번호가 본인 이메일로 발송되며, 기존 비밀번호는 더 이상 사용할 수 없습니다.`)) return
    setPendingId(id)
    setResetMsg(null)
    startTransition(async () => {
      const result = await resetMemberPassword(id)
      setPendingId(null)
      setResetMsg({ id, text: result.error ?? result.warning ?? '새 임시 비밀번호를 이메일로 발송했습니다.' })
    })
  }

  const activeCount = members.filter(m => m.status !== 'suspended').length

  return (
    <>
      {canManage && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{activeCount}</span>
              {maxMembers > 0 ? ` / ${maxMembers}명` : '명'} 이용 중
            </p>
            <div className="flex items-center gap-2">
              <button onClick={handleResync} disabled={isSyncing}
                className="inline-flex items-center gap-2 border border-border text-muted-foreground rounded-full px-4 py-2.5 text-sm font-semibold hover:border-brand-navy hover:text-brand-navy transition-all disabled:opacity-50"
                title="현재 제품 권한을 연동 제품 명단에 다시 반영"
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                재동기화
              </button>
              <button onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
              >
                <UserPlus className="h-4 w-4" />팀원 초대
              </button>
            </div>
          </div>
          {syncMsg && <p className="text-xs text-brand-navy mb-4">{syncMsg}</p>}
          {!syncMsg && <div className="mb-4" />}
        </>
      )}

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-5 py-3 font-semibold">이메일</th>
              <th className="text-left px-4 py-3 font-semibold">역할</th>
              <th className="text-left px-4 py-3 font-semibold">상태</th>
              <th className="text-left px-4 py-3 font-semibold">부서</th>
              <th className="text-left px-4 py-3 font-semibold">사업장 접근</th>
              <th className="text-left px-4 py-3 font-semibold">제품 접근</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">추가일</th>
              {canManage && <th className="px-4 py-3 font-semibold" />}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3.5 font-medium text-foreground">
                  {m.email}
                  {resendMsg?.id === m.id && (
                    <p className="text-[11px] font-normal text-muted-foreground mt-0.5">{resendMsg.text}</p>
                  )}
                  {resetMsg?.id === m.id && (
                    <p className="text-[11px] font-normal text-muted-foreground mt-0.5">{resetMsg.text}</p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    {m.role === 'owner' && <ShieldCheck className="h-3.5 w-3.5 text-brand-orange" />}
                    {m.role === 'admin' && <Shield className="h-3.5 w-3.5 text-brand-navy" />}
                    {ROLE_LABEL[m.role]}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${STATUS_STYLE[m.status]}`}>
                    {STATUS_LABEL[m.status]}
                  </span>
                </td>

                {/* 부서 */}
                <td className="px-4 py-3.5">
                  {canManage ? (
                    <button
                      onClick={() => setDepartmentTarget(m)}
                      className="inline-flex items-center gap-1 text-xs text-foreground hover:text-brand-orange transition-colors"
                      title="부서 편집"
                    >
                      {m.department ?? <span className="text-muted-foreground">미지정</span>}
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ) : (
                    <span className="text-xs text-foreground">{m.department ?? '—'}</span>
                  )}
                </td>

                {/* 사업장 접근 */}
                <td className="px-4 py-3.5">
                  {m.role === 'owner' || m.role === 'admin' ? (
                    <span className="text-xs font-medium text-brand-navy bg-brand-navy/5 rounded-full px-2.5 py-0.5">
                      전체 ({sites.length}개)
                    </span>
                  ) : m.siteIds.length === 0 ? (
                    <span className="text-xs text-muted-foreground">미배정</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {m.siteIds.map((sid) => (
                        <span key={sid} className="text-[11px] font-medium bg-muted text-foreground rounded-full px-2 py-0.5">
                          {siteNameMap.get(sid) ?? sid.slice(0, 6)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* 제품 접근 */}
                <td className="px-4 py-3.5">
                  {m.role === 'owner' || m.role === 'admin' ? (
                    <span className="text-xs font-medium text-brand-navy bg-brand-navy/5 rounded-full px-2.5 py-0.5">
                      전체 ({productOptions.length}개)
                    </span>
                  ) : m.productSlugs.length === 0 ? (
                    <span className="text-xs text-muted-foreground">미배정</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {m.productSlugs.map((slug) => (
                        <span key={slug} className="text-[11px] font-medium bg-muted text-foreground rounded-full px-2 py-0.5">
                          {productNameMap.get(slug) ?? slug}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                  {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                </td>
                {canManage && (
                  <td className="px-4 py-3.5 text-right">
                    {m.role !== 'owner' && (
                      <div className="flex items-center justify-end gap-1">
                        {/* 초대 재전송 */}
                        {m.status === 'invited' && (
                          <button
                            onClick={() => handleResend(m.id)}
                            disabled={isPending && pendingId === m.id}
                            className="text-xs text-muted-foreground hover:text-brand-orange transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-orange"
                            title="초대 메일 재전송"
                          >
                            {isPending && pendingId === m.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Send className="h-3 w-3 inline mr-0.5" />}
                            재전송
                          </button>
                        )}
                        {/* 사업장 배정 (member만) */}
                        {m.role === 'member' && sites.length > 0 && (
                          <button
                            onClick={() => setSiteTarget(m)}
                            className="text-xs text-muted-foreground hover:text-brand-orange transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-orange"
                            title="사업장 배정"
                          >
                            <MapPin className="h-3 w-3 inline mr-0.5" />
                            배정
                          </button>
                        )}
                        {/* 제품 접근 배정 (member만) */}
                        {m.role === 'member' && productOptions.length > 0 && (
                          <button
                            onClick={() => setProductTarget(m)}
                            className="text-xs text-muted-foreground hover:text-brand-orange transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-orange"
                            title="제품 접근 배정"
                          >
                            <Package className="h-3 w-3 inline mr-0.5" />
                            제품
                          </button>
                        )}
                        {/* 비밀번호 재설정 */}
                        {m.status === 'active' && (
                          <button
                            onClick={() => handleResetPassword(m.id, m.email)}
                            disabled={isPending && pendingId === m.id}
                            className="text-xs text-muted-foreground hover:text-brand-orange transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-orange"
                            title="비밀번호 재설정"
                          >
                            {isPending && pendingId === m.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <KeyRound className="h-3 w-3 inline mr-0.5" />}
                            비밀번호
                          </button>
                        )}
                        {/* 역할 전환 */}
                        {m.status === 'active' && (
                          <button
                            onClick={() => handleRoleToggle(m.id, m.role as 'admin' | 'member')}
                            disabled={isPending && pendingId === m.id}
                            className="text-xs text-muted-foreground hover:text-brand-navy transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-navy"
                          >
                            {isPending && pendingId === m.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : m.role === 'admin' ? '↓멤버' : '↑관리자'
                            }
                          </button>
                        )}
                        {/* 제거 */}
                        <button onClick={() => handleRemove(m.id)} disabled={isPending && pendingId === m.id}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="제거"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">팀원이 없습니다. 초대로 시작하세요.</div>
        )}
      </div>

      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} currentCount={activeCount} maxMembers={maxMembers} />
      )}
      {siteTarget && (
        <SiteAssignModal member={siteTarget} sites={sites} onClose={() => setSiteTarget(null)} />
      )}
      {productTarget && (
        <ProductAssignModal member={productTarget} productOptions={productOptions} onClose={() => setProductTarget(null)} />
      )}
      {departmentTarget && (
        <DepartmentModal member={departmentTarget} departmentOptions={departmentOptions} onClose={() => setDepartmentTarget(null)} />
      )}
    </>
  )
}
