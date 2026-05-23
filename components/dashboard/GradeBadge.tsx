import { GRADE_LABELS, GRADE_COLORS, type Grade } from '@/lib/auth/grades'

interface GradeBadgeProps {
  grade: Grade
  size?: 'sm' | 'md'
}

export default function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const label = GRADE_LABELS[grade]
  const colorClass = GRADE_COLORS[grade]
  const sizeClass = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1 font-semibold'

  return (
    <span className={`inline-flex items-center rounded-full ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  )
}
