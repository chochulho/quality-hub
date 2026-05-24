import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
    const { messages, scenario } = await req.json()

    const scenarioDef = SCENARIOS[scenario as string]
    if (!scenarioDef) {
      return new Response(JSON.stringify({ error: '잘못된 시나리오' }), { status: 400 })
    }

    // 비스트리밍 호출 — try-catch 안에서 완전히 처리
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
