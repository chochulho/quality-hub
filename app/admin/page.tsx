import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import SuperAdminPanel from '@/components/admin/SuperAdminPanel'

export const metadata = { title: '슈퍼관리자 패널' }

export default async function AdminPage() {
  const session = await getSession()

  if (!session) redirect('/login?next=/admin')
  if (session.role !== 'superadmin') redirect('/dashboard')

  return <SuperAdminPanel />
}
