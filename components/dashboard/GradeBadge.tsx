import { PLAN_LABELS, PLAN_COLORS, type PlanId } from '@/lib/auth/grades'

interface PlanBadgeProps {
  planId: string
  size?: 'sm' | 'md'
}

/** v2: Grade → Plan 기반 배지. 컴포넌트명은 하위호환을 위해 GradeBadge 유지. */
export default function GradeBadge({ planId, size = 'md' }: PlanBadgeProps) {
  const id = (planId as PlanId) in PLAN_LABELS ? (planId as PlanId) : 'free'
  const label = PLAN_LABELS[id]
  const colorClass = PLAN_COLORS[id]
  const sizeClass = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1 font-semibold'

  return (
    <span className={`inline-flex items-center rounded-full ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  )
}
