'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult = { error?: string; logoUrl?: string }

export async function uploadLogo(formData: FormData): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.orgId) return { error: '조직 정보가 없습니다.' }
  if (!['owner', 'admin', 'superadmin'].includes(session.role)) {
    return { error: '관리자만 로고를 변경할 수 있습니다.' }
  }

  const file = formData.get('logo') as File
  if (!file || file.size === 0) return { error: '파일을 선택해 주세요.' }
  if (!file.type.startsWith('image/')) return { error: '이미지 파일만 업로드 가능합니다.' }
  if (file.size > 2 * 1024 * 1024) return { error: '파일 크기는 2MB 이하여야 합니다.' }

  const supabase = createAdminClient()

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${session.orgId}/logo.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('org-logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return { error: '업로드 실패: ' + uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('org-logos')
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('organizations')
    .update({ logo_url: publicUrl })
    .eq('id', session.orgId)

  if (updateError) return { error: '저장 실패: ' + updateError.message }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return { logoUrl: publicUrl }
}

export async function removeLogo(): Promise<ActionResult> {
  const session = await getSession()
  if (!session?.orgId) return { error: '조직 정보가 없습니다.' }
  if (!['owner', 'admin', 'superadmin'].includes(session.role)) {
    return { error: '관리자만 로고를 변경할 수 있습니다.' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('organizations')
    .update({ logo_url: null })
    .eq('id', session.orgId)

  if (error) return { error: '삭제 실패: ' + error.message }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return {}
}
