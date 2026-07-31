import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SOURCE_DOMAIN_CONFIG, ALL_ALLOWED_ORIGINS } from '@/lib/auth/source-domains'
import { getValidInvite } from '@/lib/auth/invite'

type AdminClient = ReturnType<typeof createAdminClient>

/** 이메일로 기존 auth.users 계정 조회 (admin API는 email 필터를 직접 지원하지 않아 페이지 순회) */
async function findUserByEmail(admin: AdminClient, email: string) {
  const target = email.toLowerCase()
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data) return null
    const found = data.users.find(u => u.email?.toLowerCase() === target)
    if (found) return found
    if (data.users.length < 1000) return null
    page++
  }
}

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
  inviteToken?: string   // org_members.invite_token — 팀원 초대 수락 가입
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

  const { email, password, name, orgName, orgType = 'individual', sourceDomain = 'quality-hub', toolKey: bodyToolKey, inviteToken } = body

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

  // 0. 팀원 초대 토큰 검증 (있는 경우) — 유효하면 register_org를 건너뛰고 기존 조직에 합류
  let invite: { id: string; org_id: string } | null = null

  if (inviteToken) {
    const result = await getValidInvite(supabase, inviteToken)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400, headers: corsHeaders })
    }
    if (result.row.invited_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: '이 초대는 다른 이메일 주소로 발송되었습니다.' },
        { status: 400, headers: corsHeaders },
      )
    }
    invite = { id: result.row.id, org_id: result.row.org_id }
  }

  // 1. Create auth user
  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: invite ? true : domainCfg.skipEmailConfirm,
    user_metadata: { full_name: name },
  })

  let userId: string
  let isNewAuthUser = false

  if (createError || !authData.user) {
    const msg = createError?.message ?? '계정 생성 중 오류가 발생했습니다.'
    const isDupe = msg.toLowerCase().includes('already') || msg.includes('already registered')

    if (!isDupe) {
      return NextResponse.json({ error: msg }, { status: 500, headers: corsHeaders })
    }

    // 초대 수락 중 이메일 중복 — 이전에 개인적으로 가입해뒀거나(미인증) 이미 정식 계정이 있는 경우
    if (invite) {
      const existing = await findUserByEmail(supabase, email)
      if (!existing) {
        return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409, headers: corsHeaders })
      }

      if (existing.confirmed_at) {
        // 이미 사용 중인(인증된) 계정 — 계정 탈취 방지를 위해 자동 연결하지 않고 로그인으로 안내
        return NextResponse.json(
          {
            error: '이미 가입된 이메일입니다. 로그인 후 참여해주세요.',
            code: 'ALREADY_REGISTERED_CONFIRMED',
          },
          { status: 409, headers: corsHeaders },
        )
      }

      // 미인증 상태로 방치된 계정 — 같은 사람이 초대 수락을 위해 다시 시도하는 것으로 보고
      // 새 비밀번호로 갱신 + 인증 처리한 뒤 이번 초대에 연결한다.
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      })
      if (updateErr) {
        return NextResponse.json(
          { error: '계정 갱신 중 오류가 발생했습니다: ' + updateErr.message },
          { status: 500, headers: corsHeaders },
        )
      }

      // 방치됐던 계정에 남아있던 이전 조직 소속(예: 실수로 생성된 개인 계정)은 정리 —
      // 그대로 두면 로그인 시 어느 조직에 속할지 모호해진다.
      await supabase.from('org_members').delete().eq('user_id', existing.id)

      userId = existing.id
    } else {
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409, headers: corsHeaders })
    }
  } else {
    userId = authData.user.id
    isNewAuthUser = true
  }

  // 1-B. 초대 수락 — 새 조직 생성 없이 기존 초대 행에 연결
  if (invite) {
    const { data: linked, error: linkError } = await supabase
      .from('org_members')
      .update({ user_id: userId, status: 'active' })
      .eq('id', invite.id)
      .is('user_id', null)
      .select('id')
      .maybeSingle()

    if (linkError || !linked) {
      // 새로 만든 auth 계정이면 고아 계정으로 남지 않도록 정리 (기존 계정을 재사용한 경우는 그대로 둔다)
      if (isNewAuthUser) await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: '초대 연결 중 오류가 발생했습니다. 관리자에게 재전송을 요청해주세요.' },
        { status: 500, headers: corsHeaders },
      )
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('plan_id')
      .eq('id', invite.org_id)
      .single()

    return NextResponse.json(
      {
        success: true,
        userId,
        orgId: invite.org_id,
        planId: org?.plan_id ?? 'free',
        requiresApproval: false,
        requiresEmailConfirm: false,
        skipEmailConfirm: true,
      },
      { status: 201, headers: corsHeaders },
    )
  }

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
