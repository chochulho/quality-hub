import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 비로그인 IP당(또는 로그인 계정당) 1일 1세션, 세션당 사용자 턴 2회로 제한 (SPEC-WORKSPACE.md §7.3)
const MAX_TURNS = 2

function getIpHash(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') ?? 'unknown'
  return createHash('sha256').update(ip).digest('hex')
}

function getStartOfTodayKstIso(): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000
  const kstNow = new Date(Date.now() + KST_OFFSET_MS)
  const startOfDayKstUtcMs =
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - KST_OFFSET_MS
  return new Date(startOfDayKstUtcMs).toISOString()
}

type DemoLimitResult = { allowed: true; turnsLeft: number } | { allowed: false }

async function checkAndRecordTurn(params: {
  userId: string | null
  ipHash: string
  scenario: string
  isAuto: boolean
}): Promise<DemoLimitResult> {
  const supabase = createAdminClient()
  const sinceIso = getStartOfTodayKstIso()

  const baseQuery = supabase
    .from('fmea_demo_sessions')
    .select('id, turn_count, completed')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(1)

  const { data: existing } = await (params.userId
    ? baseQuery.eq('user_id', params.userId)
    : baseQuery.eq('ip_hash', params.ipHash).is('user_id', null)
  ).maybeSingle()

  if (existing?.completed) {
    return { allowed: false }
  }

  if (!existing) {
    const initialTurnCount = params.isAuto ? 0 : 1
    await supabase.from('fmea_demo_sessions').insert({
      user_id: params.userId,
      scenario_key: params.scenario,
      ip_hash: params.ipHash,
      turn_count: initialTurnCount,
      completed: initialTurnCount >= MAX_TURNS,
    })
    return { allowed: true, turnsLeft: MAX_TURNS - initialTurnCount }
  }

  const nextTurnCount = params.isAuto ? existing.turn_count : existing.turn_count + 1
  const completed = nextTurnCount >= MAX_TURNS
  await supabase
    .from('fmea_demo_sessions')
    .update({ turn_count: nextTurnCount, completed })
    .eq('id', existing.id)

  return { allowed: true, turnsLeft: Math.max(0, MAX_TURNS - nextTurnCount) }
}

const SCENARIOS: Record<string, { title: string; systemPrompt: string }> = {
  brake_pedal: {
    title: '브레이크 페달 사출 성형 공정',
    systemPrompt: `당신은 AIAG-VDA FMEA 전문가입니다. 자동차 브레이크 페달 사출 성형 공정의 PFMEA 분석을 도와줍니다.

공정 단계:
1. 원재료 입고 검사 (PA66 GF30)
2. 사출 성형 (클램핑력 800ton, 사이클 45초)
3. 게이트 제거 및 버 제거
4. 치수 검사 (CMM 측정)
5. 표면 검사 및 포장

분석 시 AIAG-VDA 7단계 접근법을 따르세요.
응답은 반드시 한국어로 작성하세요.
불량 유형을 분석할 때는 다음 JSON 형식으로 <pfmea_rows> 태그 안에 포함하세요 (2~3개씩):

<pfmea_rows>
[
  {
    "processStepName": "공정명",
    "failureMode": "불량 유형",
    "failureEffectEndUser": "최종 사용자 영향",
    "severity": 8,
    "failureCause": "불량 원인",
    "occurrence": 4,
    "preventionControls": "예방 관리",
    "detectionControls": "검출 관리",
    "detection": 5,
    "actionPriority": "HIGH",
    "isSafetyCritical": true
  }
]
</pfmea_rows>

actionPriority는 RPN 기준: HIGH(>200), MEDIUM(100-200), LOW(<100).
isSafetyCritical은 안전·법규 관련 불량 시 true.
응답은 간결하게 — 분석 설명 3~4줄 + 제안 행 2~3개.`,
  },
  bms_battery: {
    title: 'BMS 배터리 팩 조립 공정',
    systemPrompt: `당신은 AIAG-VDA FMEA 전문가입니다. 전기차용 BMS(Battery Management System) 배터리 팩 조립 공정의 DFMEA 분석을 도와줍니다.

주요 서브시스템:
1. 셀 모듈 조립 (21700 원통형 셀 × 800ea)
2. BMS PCB 장착 및 배선
3. 냉각 시스템 조립 (수냉식)
4. 팩 케이스 조립 및 IP67 실링
5. 최종 전기 검사 (SOC, 절연 저항)

분석 시 AIAG-VDA 7단계 접근법을 따르세요.
응답은 반드시 한국어로 작성하세요.
불량 유형을 분석할 때는 다음 JSON 형식으로 <pfmea_rows> 태그 안에 포함하세요 (2~3개씩):

<pfmea_rows>
[
  {
    "processStepName": "공정명",
    "failureMode": "불량 유형",
    "failureEffectEndUser": "최종 사용자 영향",
    "severity": 9,
    "failureCause": "불량 원인",
    "occurrence": 3,
    "preventionControls": "예방 관리",
    "detectionControls": "검출 관리",
    "detection": 4,
    "actionPriority": "HIGH",
    "isSafetyCritical": true
  }
]
</pfmea_rows>

actionPriority는 RPN 기준: HIGH(>200), MEDIUM(100-200), LOW(<100).
isSafetyCritical은 안전·법규 관련 불량 시 true.
응답은 간결하게 — 분석 설명 3~4줄 + 제안 행 2~3개.`,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { messages, scenario, isAuto } = await req.json()

    const scenarioDef = SCENARIOS[scenario as string]
    if (!scenarioDef) {
      return new Response(JSON.stringify({ error: '잘못된 시나리오' }), { status: 400 })
    }

    const session = await getSession()
    const ipHash = getIpHash(req)

    let limit: DemoLimitResult
    try {
      limit = await checkAndRecordTurn({
        userId: session?.id ?? null,
        ipHash,
        scenario,
        isAuto: !!isAuto,
      })
    } catch (err) {
      // 제한 체크 자체가 실패해도 데모 이용은 막지 않는다 (fail-open)
      console.error('FMEA demo rate-limit check failed:', err)
      limit = { allowed: true, turnsLeft: MAX_TURNS }
    }

    if (!limit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'DAILY_LIMIT_REACHED',
          message:
            '오늘 체험 가능한 횟수를 모두 사용했습니다. 내일 다시 시도하거나 APQP Manager에서 전체 기능을 사용해 보세요.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 비스트리밍 호출 — try-catch 안에서 완전히 처리
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: scenarioDef.systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const text =
      message.content[0]?.type === 'text' ? message.content[0].text : ''

    // 텍스트를 한 번에 반환 (클라이언트 스트림 리더와 호환됨)
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Demo-Turns-Left': String(limit.turnsLeft),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('FMEA demo chat error:', msg)
    return new Response(JSON.stringify({ error: 'AI 응답 실패', detail: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
