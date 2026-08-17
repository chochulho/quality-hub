import type { UserSession } from '@/lib/auth/session'

function normalize(dept: string | null | undefined): string {
  return (dept ?? '').trim().toLowerCase()
}

/**
 * 경영관리(KPI/BSC·경영검토·리스크분석·비상계획 등) 하위 항목의 편집 권한 판단.
 * owner/admin/superadmin은 전체 편집 가능, 그 외 member는 자기 부서와
 * 일치하는 항목만 편집 가능(그 외는 조회만). 부서는 부서 마스터 없이
 * org_members.department 자유 텍스트를 정규화 비교한다.
 */
export function canEditManagementItem(
  session: NonNullable<UserSession>,
  itemDepartment: string | null | undefined
): boolean {
  if (['owner', 'admin', 'superadmin'].includes(session.role)) return true
  if (!session.department || !itemDepartment) return false
  return normalize(session.department) === normalize(itemDepartment)
}
