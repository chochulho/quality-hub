import { Building2, Layers, Users, Zap } from 'lucide-react'
import { PLAN_LABELS, PLAN_COLORS, type PlanId } from '@/lib/auth/grades'

interface Props {
  orgName: string | null
  planId: string
  unlockedCount: number
  totalTools: number
  /** Starter/Team: 선택된 도구 수 */
  selectedCount?: number
  /** Starter/Team: 선택 가능한 최대 수 */
  maxSelectable?: number
  memberCount?: number
  isPending?: boolean
}

export default function DashboardStats({
  orgName,
  planId,
  unlockedCount,
  totalTools,
  selectedCount,
  maxSelectable,
  memberCount,
  isPending,
}: Props) {
  const planLabel = PLAN_LABELS[planId as PlanId] ?? planId
  const planColor = PLAN_COLORS[planId as PlanId] ?? 'bg-muted text-muted-foreground'

  const isSelectable = planId === 'starter' || planId === 'team'
  const needsSelection = isSelectable && (selectedCount ?? 0) === 0 && !isPending

  const stats = [
    {
      icon: Building2,
      label: '조직',
      value: orgName ?? '—',
      sub: isPending ? '승인 대기' : '활성',
    },
    {
      icon: Zap,
      label: '플랜',
      value: planLabel,
      sub: isPending ? '잠금 해제 대기' : '현재 플랜',
      badge: planColor,
    },
    {
      icon: Layers,
      label: '이용 도구',
      value: isSelectable
        ? `${selectedCount ?? 0} / ${maxSelectable ?? 0}개 선택됨`
        : `${unlockedCount} / ${totalTools}개`,
      sub: isSelectable ? '플랜 할당량' : '전체 도구',
      warn: needsSelection,
    },
    ...(memberCount !== undefined
      ? [{ icon: Users, label: '팀원', value: `${memberCount}명`, sub: '활성 멤버' }]
      : []),
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.label}
            className={`rounded-2xl border p-4 bg-white ${
              'warn' in s && s.warn
                ? 'border-amber-300 bg-amber-50'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${'warn' in s && s.warn ? 'text-amber-600' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${'warn' in s && s.warn ? 'text-amber-700' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {'badge' in s && s.badge ? (
              <span className={`inline-block text-sm font-bold rounded-full px-2.5 py-0.5 ${s.badge}`}>
                {s.value}
              </span>
            ) : (
              <p className={`text-base font-extrabold ${
                'warn' in s && s.warn ? 'text-amber-800' : 'text-brand-navy'
              }`}>
                {s.value}
              </p>
            )}
            <p className={`text-xs mt-0.5 ${'warn' in s && s.warn ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {s.sub}
            </p>
          </div>
        )
      })}
    </div>
  )
}
