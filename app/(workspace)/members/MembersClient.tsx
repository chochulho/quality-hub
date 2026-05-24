'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Trash2, ShieldCheck, Shield, Loader2, X } from 'lucide-react'
import { inviteMember, updateMemberRole, removeMember } from './actions'

export interface MemberRow {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'invited' | 'suspended'
  createdAt: string
}

interface Props {
  members: MemberRow[]
  canManage: boolean   // owner or admin
  currentUserId: string
  maxMembers: number
}

const ROLE_LABEL: Record<string, string> = {
  owner: '오너',
  admin: '관리자',
  member: '멤버',
}
const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  invited:   'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<string, string> = {
  active: '활성', invited: '초대 대기', suspended: '정지',
}

// ── 초대 모달 ───────────────────────────────────────────────────

function InviteModal({ onClose, currentCount, maxMembers }: {
  onClose: () => void
  currentCount: number
  maxMembers: number
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const atLimit = maxMembers > 0 && currentCount >= maxMembers

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      const result = await inviteMember(email, role)
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
        <h2 className="text-xl font-extrabold text-brand-navy mb-1">팀원 초대</h2>
        <p className="text-sm text-muted-foreground mb-5">
          초대된 사람이 가입하면 자동으로 조직에 연결됩니다.
        </p>

        {atLimit && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-4">
            플랜 한도({maxMembers}명)에 도달했습니다. 업그레이드 후 초대하세요.
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              disabled={atLimit}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">역할</label>
            <div className="flex gap-2">
              {(['member', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    role === r
                      ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                      : 'border-border text-muted-foreground hover:border-brand-navy/40'
                  }`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !email.trim() || atLimit}
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

// ── 메인 컴포넌트 ───────────────────────────────────────────────

export default function MembersClient({ members, canManage, currentUserId, maxMembers }: Props) {
  const [showInvite, setShowInvite] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove(id: string) {
    if (!confirm('이 멤버를 제거하시겠습니까?')) return
    setPendingId(id)
    startTransition(async () => {
      await removeMember(id)
      setPendingId(null)
    })
  }

  function handleRoleToggle(id: string, currentRole: 'admin' | 'member') {
    const next = currentRole === 'admin' ? 'member' : 'admin'
    setPendingId(id)
    startTransition(async () => {
      await updateMemberRole(id, next)
      setPendingId(null)
    })
  }

  const activeCount = members.filter(m => m.status !== 'suspended').length

  return (
    <>
      {/* 초대 버튼 */}
      {canManage && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{activeCount}</span>
            {maxMembers > 0 ? ` / ${maxMembers}명` : '명'} 이용 중
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
          >
            <UserPlus className="h-4 w-4" />
            팀원 초대
          </button>
        </div>
      )}

      {/* 테이블 */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-5 py-3 font-semibold">이메일</th>
              <th className="text-left px-4 py-3 font-semibold">역할</th>
              <th className="text-left px-4 py-3 font-semibold">상태</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">추가일</th>
              {canManage && <th className="px-4 py-3 font-semibold" />}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3.5 font-medium text-foreground">{m.email}</td>
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
                <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                  {new Date(m.createdAt).toLocaleDateString('ko-KR')}
                </td>
                {canManage && (
                  <td className="px-4 py-3.5 text-right">
                    {m.role !== 'owner' && (
                      <div className="flex items-center justify-end gap-2">
                        {/* 역할 전환 (admin ↔ member) */}
                        {m.status === 'active' && (
                          <button
                            onClick={() => handleRoleToggle(m.id, m.role as 'admin' | 'member')}
                            disabled={isPending && pendingId === m.id}
                            className="text-xs text-muted-foreground hover:text-brand-navy transition-colors border border-border rounded-full px-2.5 py-1 hover:border-brand-navy"
                            title={m.role === 'admin' ? '멤버로 변경' : '관리자로 변경'}
                          >
                            {isPending && pendingId === m.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : m.role === 'admin' ? '↓ 멤버' : '↑ 관리자'
                            }
                          </button>
                        )}
                        {/* 제거 */}
                        <button
                          onClick={() => handleRemove(m.id)}
                          disabled={isPending && pendingId === m.id}
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
          <div className="py-12 text-center text-sm text-muted-foreground">
            팀원이 없습니다. 초대로 시작하세요.
          </div>
        )}
      </div>

      {/* 초대 모달 */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          currentCount={activeCount}
          maxMembers={maxMembers}
        />
      )}
    </>
  )
}
