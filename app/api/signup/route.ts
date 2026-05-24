import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SOURCE_DOMAIN_CONFIG, ALL_ALLOWED_ORIGINS } from '@/lib/auth/source-domains'

// ── CORS helpers ────────────────────────────────────────────────

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALL_ALLOWED_ORIGINS.includes(origin) ? origin : null
  if (!allowed) return {}
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) })
}

// ── POST /api/signup ─────────────────────────────────────────────

interface SignupBody {
  email: string
  password: string
  name: string
  orgName?: string
  orgType?: 'individual' | 'corporate'
  sourceDomain?: string  // key from SOURCE_DOMAIN_CONFIG (e.g. 'auditsay')
  toolKey?: string       // override; falls back to config.toolKey
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  let body: SignupBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400, headers: corsHeaders })
  }

  const { email, password, name, orgName, orgType = 'individual', sourceDomain = 'quality-hub', toolKey: bodyToolKey } = body

  if (!email || !password || !name) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400, headers: corsHeaders })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400, headers: corsHeaders })
  }

  // Resolve source domain config
  const domainCfg = SOURCE_DOMAIN_CONFIG[sourceDomain] ?? SOURCE_DOMAIN_CONFIG['quality-hub']
  const effectiveToolKey = bodyToolKey ?? domainCfg.toolKey
  const isExternal = sourceDomain !== 'quality-hub'

  const supabase = createAdminClient()

  // 1. Create auth user
  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: domainCfg.skipEmailConfirm,
    user_metadata: { full_name: name },
  })

  if (createError || !authData.user) {
    const msg = createError?.message ?? '계정 생성 중 오류가 발생했습니다.'
    const isDupe = msg.toLowerCase().includes('already') || msg.includes('already registered')
    return NextResponse.json(
      { error: isDupe ? '이미 가입된 이메일입니다.' : msg },
      { status: isDupe ? 409 : 500, headers: corsHeaders },
    )
  }

  const userId = authData.user.id
  const finalOrgName = orgType === 'corporate' && orgName ? orgName : `${name}의 계정`

  // 2. register_org RPC — creates org (plan=free), primary site, owner member atomically
  const { data: rpcData, error: rpcError } = await supabase.rpc('register_org', {
    p_user_id:  userId,
    p_org_name: finalOrgName,
    p_org_type: orgType,
  })

  if (rpcError) {
    // Clean up orphan auth user on RPC failure
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json(
      { error: '계정 설정 중 오류가 발생했습니다.' },
      { status: 500, headers: corsHeaders },
    )
  }

  const orgId: string = rpcData

  // 3. For external domains — upgrade plan + set source_domain
  const planId = isExternal ? domainCfg.defaultPlan : 'free'

  if (isExternal) {
    await supabase
      .from('organizations')
      .update({ plan_id: planId, source_domain: sourceDomain })
      .eq('id', orgId)
  }

  // 4. Auto-select tool if provided
  if (effectiveToolKey && orgId) {
    await supabase
      .from('org_selected_tools')
      .upsert(
        { org_id: orgId, tool_key: effectiveToolKey },
        { onConflict: 'org_id,tool_key', ignoreDuplicates: true },
      )
  }

  // 5. Respond
  const requiresApproval = orgType === 'corporate' && !domainCfg.skipEmailConfirm
  const requiresEmailConfirm = !domainCfg.skipEmailConfirm && orgType !== 'corporate'

  return NextResponse.json(
    {
      success: true,
      userId,
      orgId,
      planId,
      requiresApproval,
      requiresEmailConfirm,
      skipEmailConfirm: domainCfg.skipEmailConfirm,
    },
    { status: 201, headers: corsHeaders },
  )
}
