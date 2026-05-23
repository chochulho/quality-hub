import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin 클라이언트 (서버 전용, service_role key 사용)
 * 절대 클라이언트 컴포넌트에서 import 금지
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
