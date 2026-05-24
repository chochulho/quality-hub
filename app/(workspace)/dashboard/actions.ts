'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

const PLAN_MAX_TOOLS: Record<string, number> = {
  starter: 1,
  team: 3,
}

/**
 * Starter / Team 플랜 사용자의 org_selected_tools 업데이트.
 * 기존 선택을 모두 교체.
 */
export async function updateSelectedTools(toolKeys: string[]): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session?.orgId) return { error: '조직 정보가 없습니다.' }

  const maxTools = PLAN_MAX_TOOLS[session.planId]
  if (!maxTools) return { error: '해당 플랜은 도구 선택이 지원되지 않습니다.' }
  if (toolKeys.length > maxTools) return { error: `최대 ${maxTools}개까지 선택 가능합니다.` }

  const supabase = createAdminClient()

  // 기존 선택 전체 삭제
  const { error: delErr } = await supabase
    .from('org_selected_tools')
    .delete()
    .eq('org_id', session.orgId)
  if (delErr) return { error: '저장 실패: ' + delErr.message }

  // 새 선택 삽입
  if (toolKeys.length > 0) {
    const { error: insErr } = await supabase
      .from('org_selected_tools')
      .insert(toolKeys.map((key) => ({ org_id: session.orgId!, tool_key: key })))
    if (insErr) return { error: '저장 실패: ' + insErr.message }
  }

  revalidatePath('/dashboard')
  return {}
}
