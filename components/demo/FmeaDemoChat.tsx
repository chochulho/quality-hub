'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2, Car, Battery } from 'lucide-react'
import FmeaDemoTable, { type FmeaRow } from './FmeaDemoTable'
import FmeaUpsellModal from './FmeaUpsellModal'

// ── Types ──────────────────────────────────────────────────────

export type DemoScenario = 'brake_pedal' | 'bms_battery' | 'custom'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedRows?: FmeaRow[]
}

interface Props {
  onAddRow?: (row: FmeaRow) => void
  addedKeys?: Set<string>
  onReset?: () => void
}

// ── Constants ──────────────────────────────────────────────────

const MAX_TURNS = 2   // user 메시지 기준
const MAX_INPUT_LENGTH = 300

const SCENARIO_META: Record<
  Exclude<DemoScenario, 'custom'>,
  { title: string; icon: typeof Car; initPrompt: string }
> = {
  brake_pedal: {
    title: '브레이크 페달 사출 성형',
    icon: Car,
    initPrompt:
      '브레이크 페달 사출 성형 공정 PFMEA 분석을 시작해줘. 첫 번째 공정 단계의 주요 불량 유형부터 분석해줘.',
  },
  bms_battery: {
    title: 'BMS 배터리 팩 조립',
    icon: Battery,
    initPrompt: 'BMS 배터리 팩 조립 공정 DFMEA 분석을 시작해줘. 가장 위험도가 높은 공정부터 분석해줘.',
  },
}

const QUICK_PROMPTS: Record<DemoScenario, string[]> = {
  brake_pedal: [
    '사출 성형 공정의 주요 불량 유형을 분석해줘',
    '게이트 제거 공정에서 발생할 수 있는 불량은?',
    '치수 검사에서 놓칠 수 있는 불량 원인을 알려줘',
  ],
  bms_battery: [
    '배터리 셀 모듈 조립에서 가장 위험한 불량 유형을 분석해줘',
    'IP67 실링 불량의 원인과 검출 방법은?',
    '최종 전기 검사에서 검출해야 할 핵심 항목은?',
  ],
  custom: [
    '공정 단계를 더 자세히 설명해줘',
    '이 공정에서 가장 위험한 불량은?',
    '검출 방법을 제안해줘',
  ],
}

// ── XML 파싱 ───────────────────────────────────────────────────

function parseFmeaRows(text: string): FmeaRow[] {
  const match = text.match(/<pfmea_rows>([\s\S]*?)<\/pfmea_rows>/)
  if (!match) return []
  try {
    return JSON.parse(match[1].trim())
  } catch {
    return []
  }
}

function stripXml(text: string): string {
  // 완전한 태그 제거
  let result = text.replace(/<pfmea_rows>[\s\S]*?<\/pfmea_rows>/g, '')
  // 스트리밍 중 열린 태그만 있는 경우 — 이후 내용 전부 숨김
  result = result.replace(/<pfmea_rows>[\s\S]*/g, '')
  return result.trim()
}

// ── Component ──────────────────────────────────────────────────

export default function FmeaDemoChat({ onAddRow, addedKeys, onReset }: Props) {
  const [scenario, setScenario] = useState<DemoScenario | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [showUpsell, setShowUpsell] = useState(false)
  const [upsellReason, setUpsellReason] = useState<'turns' | 'daily'>('turns')
  const [dailyLimitReached, setDailyLimitReached] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (content: string, opts: { isAuto?: boolean; scenarioKey?: DemoScenario } = {}) => {
      const { isAuto = false, scenarioKey } = opts
      if (!content.trim() || loading) return
      if (dailyLimitReached) {
        setUpsellReason('daily')
        setShowUpsell(true)
        return
      }
      if (!isAuto && turnCount >= MAX_TURNS) {
        setUpsellReason('turns')
        setShowUpsell(true)
        return
      }

      const activeScenario = scenarioKey ?? scenario
      if (!activeScenario) return
      if (scenarioKey && scenarioKey !== scenario) setScenario(scenarioKey)

      const userMsg: ChatMessage = { role: 'user', content }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      if (!isAuto) setTurnCount((c) => c + 1)
      setLoading(true)

      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.role === 'assistant' ? stripXml(m.content) : m.content,
      }))

      try {
        const res = await fetch('/api/demo/fmea-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, scenario: activeScenario, isAuto }),
        })

        if (res.status === 429) {
          setDailyLimitReached(true)
          setTurnCount(MAX_TURNS)
          setUpsellReason('daily')
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content:
                '오늘 체험 가능한 횟수를 모두 사용했습니다. 내일 다시 시도하거나 APQP Manager에서 전체 기능을 사용해 보세요.',
            },
          ])
          setShowUpsell(true)
          return
        }

        if (!res.ok || !res.body) throw new Error('응답 오류')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let text = ''

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          text += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: text }
            return updated
          })
        }

        const rows = parseFmeaRows(text)
        if (rows.length > 0) {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: text,
              suggestedRows: rows,
            }
            return updated
          })
        }
      } catch {
        // 사용자 메시지는 유지하고 에러 메시지를 assistant 말풍선으로 표시
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          // 이미 빈 assistant 버블이 추가된 경우 교체, 아니면 추가
          if (last?.role === 'assistant' && last.content === '') {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: 'AI 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            }
            return updated
          }
          return [...prev, {
            role: 'assistant',
            content: 'AI 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          }]
        })
        if (!isAuto) setTurnCount((c) => Math.max(0, c - 1)) // 실패 시 턴 카운트 복원
      } finally {
        setLoading(false)
        setTimeout(() => textareaRef.current?.focus(), 100)
      }

      // 마지막 턴 직후 업셀
      if (!isAuto && turnCount + 1 >= MAX_TURNS) {
        setUpsellReason('turns')
        setTimeout(() => setShowUpsell(true), 1500)
      }
    },
    [messages, loading, turnCount, scenario, dailyLimitReached]
  )

  function handleSubmitInput() {
    if (!input.trim()) return
    if (!scenario) {
      sendMessage(input, { scenarioKey: 'custom' })
    } else {
      sendMessage(input)
    }
  }

  function resetChat() {
    setMessages([])
    setScenario(null)
    setTurnCount(0)
    setShowUpsell(false)
    onReset?.()
  }

  const prompts = scenario ? QUICK_PROMPTS[scenario] : []
  const turnsLeft = MAX_TURNS - turnCount
  const headerTitle =
    scenario === 'custom' ? '직접 입력한 공정' : scenario ? SCENARIO_META[scenario].title : 'FMEA AI 어시스턴트'

  return (
    <div className="flex flex-col h-full min-h-[560px]">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/40 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="h-4 w-4 text-brand-orange shrink-0" />
          <span className="text-sm font-semibold text-brand-navy truncate">{headerTitle}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {scenario && (
            <button
              onClick={resetChat}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              새로 시작
            </button>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            turnsLeft <= 0
              ? 'bg-red-100 text-red-600'
              : turnsLeft <= 1
              ? 'bg-amber-100 text-amber-700'
              : 'bg-muted text-muted-foreground'
          }`}>
            남은 질문 {Math.max(0, turnsLeft)}회
          </span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 시나리오 미선택 시 안내 + 말풍선 버튼 */}
        {!scenario && messages.length === 0 && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-brand-orange/10 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-brand-orange" />
            </div>
            <div className="max-w-[85%] flex flex-col gap-3">
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-white border border-border text-foreground"
                style={{ wordBreak: 'keep-all' }}
              >
                어떤 공정을 함께 분석해볼까요? 아래 예시를 선택하거나, 직접 공정을 설명해 주세요.
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SCENARIO_META) as (keyof typeof SCENARIO_META)[]).map((key) => {
                  const meta = SCENARIO_META[key]
                  const Icon = meta.icon
                  return (
                    <button
                      key={key}
                      onClick={() => sendMessage(meta.initPrompt, { isAuto: true, scenarioKey: key })}
                      className="inline-flex items-center gap-2 text-xs font-medium bg-muted hover:bg-border text-foreground rounded-full pl-2.5 pr-3.5 py-2 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-brand-orange" />
                      {meta.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* 아바타 */}
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-brand-navy text-white'
                : 'bg-brand-orange/10 text-brand-orange'
            }`}>
              {msg.role === 'user'
                ? <User className="h-3.5 w-3.5" />
                : <Bot className="h-3.5 w-3.5" />
              }
            </div>

            {/* 버블 */}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-navy text-white rounded-tr-sm'
                  : 'bg-white border border-border text-foreground rounded-tl-sm'
              }`} style={{ wordBreak: 'keep-all' }}>
                {stripXml(msg.content) || (loading && i === messages.length - 1 && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ))}
              </div>
              {/* FMEA 행 테이블 */}
              {msg.suggestedRows && msg.suggestedRows.length > 0 && (
                <div className="w-full max-w-none">
                  <FmeaDemoTable
                    rows={msg.suggestedRows}
                    onAddRow={onAddRow}
                    addedKeys={addedKeys}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-brand-orange/10 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-brand-orange" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 빠른 질문 */}
      {scenario && messages.length <= 2 && !loading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs bg-muted hover:bg-border text-foreground rounded-full px-3 py-1.5 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex gap-2 bg-white border border-border rounded-2xl px-4 py-2 focus-within:border-brand-navy transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmitInput()
              }
            }}
            placeholder={
              turnCount >= MAX_TURNS
                ? '데모 체험이 완료됐습니다.'
                : scenario
                ? 'FMEA 분석 질문을 입력하세요...'
                : '예: SMT 스크린프린트 공정에서 발생하는 불량을 분석해줘'
            }
            disabled={loading || turnCount >= MAX_TURNS}
            maxLength={MAX_INPUT_LENGTH}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            onClick={handleSubmitInput}
            disabled={loading || !input.trim() || turnCount >= MAX_TURNS}
            className="shrink-0 bg-brand-orange text-white rounded-xl px-3 py-1.5 disabled:opacity-40 hover:bg-brand-orange-hover transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-1.5">
          데모 버전 · 전체 기능은{' '}
          <a href="https://apqpmanager.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">
            APQP Manager
          </a>
          에서
        </p>
      </div>

      {/* 업셀 모달 */}
      {showUpsell && <FmeaUpsellModal onClose={() => setShowUpsell(false)} reason={upsellReason} />}
    </div>
  )
}
