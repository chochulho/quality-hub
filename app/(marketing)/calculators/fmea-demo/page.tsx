'use client'

import { useState, useMemo } from 'react'
import { Bot, Zap, Car, Battery } from 'lucide-react'
import FmeaDemoChat, { type DemoScenario } from '@/components/demo/FmeaDemoChat'
import FmeaWorksheet from '@/components/demo/FmeaWorksheet'
import { type FmeaRow, rowKey } from '@/components/demo/FmeaDemoTable'

const SCENARIOS: {
  id: DemoScenario
  title: string
  subtitle: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  tags: string[]
}[] = [
  {
    id: 'brake_pedal',
    title: '브레이크 페달 사출 성형',
    subtitle: '자동차 안전 부품 제조사 · PFMEA',
    icon: Car,
    iconBg: 'bg-brand-navy/5',
    iconColor: 'text-brand-navy',
    tags: ['PA66 GF30', '사출 성형', 'IATF 16949', '안전 특성'],
  },
  {
    id: 'bms_battery',
    title: 'BMS 배터리 팩 조립',
    subtitle: '전기차 배터리 제조사 · DFMEA',
    icon: Battery,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-700',
    tags: ['21700 셀', '수냉식 냉각', 'IP67', 'EV'],
  },
]

export default function FmeaDemoPage() {
  const [selected, setSelected] = useState<DemoScenario | null>(null)
  const [fmeaRows, setFmeaRows] = useState<FmeaRow[]>([])

  const selectedScenario = SCENARIOS.find((s) => s.id === selected)

  const addedKeys = useMemo(
    () => new Set(fmeaRows.map(rowKey)),
    [fmeaRows]
  )

  function handleAddRow(row: FmeaRow) {
    const key = rowKey(row)
    setFmeaRows((prev) => {
      if (prev.some((r) => rowKey(r) === key)) return prev
      return [...prev, row]
    })
  }

  function handleScenarioChange() {
    setSelected(null)
    setFmeaRows([])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange rounded-full px-4 py-2 text-sm font-semibold mb-4">
          <Bot className="h-4 w-4" />
          AI 대화형 FMEA 체험
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
          AI와 대화하면서{' '}
          <span className="text-brand-orange">FMEA를 완성</span>해 보세요
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm" style={{ wordBreak: 'keep-all' }}>
          AIAG-VDA 규격 기반. 공정을 설명하면 AI가 불량 유형·원인·조치우선순위를 자동 제안합니다.
          <br />
          회원가입 불필요 · 3분 체험
        </p>
      </div>

      {!selected ? (
        /* 시나리오 선택 */
        <>
          <p className="text-center text-sm font-semibold text-muted-foreground mb-5">
            분석할 시나리오를 선택하세요
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {SCENARIOS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className="text-left rounded-2xl border border-border bg-white p-6 hover:border-brand-orange hover:shadow-sm transition-all duration-200 group"
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 ${s.iconBg} rounded-xl mb-4`}>
                    <Icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                  <h3 className="text-base font-extrabold text-brand-navy mb-1 group-hover:text-brand-orange transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">{s.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 안내 */}
          <div className="rounded-2xl bg-muted/60 border border-border p-5 text-sm text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-2 mb-2 font-semibold text-foreground">
              <Zap className="h-4 w-4 text-brand-orange" />
              이런 순서로 진행됩니다
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
              <span>① 시나리오 선택</span>
              <span className="text-border">→</span>
              <span>② AI가 공정별 불량 유형 제안</span>
              <span className="text-border">→</span>
              <span>③ S·O·D·RPN·AP 자동 산출</span>
              <span className="text-border">→</span>
              <span>④ APQP Manager에서 저장</span>
            </div>
          </div>
        </>
      ) : (
        /* 챗봇 화면 */
        <>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleScenarioChange}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 시나리오 변경
            </button>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <FmeaDemoChat
              scenario={selected}
              scenarioTitle={selectedScenario?.title ?? ''}
              onAddRow={handleAddRow}
              addedKeys={addedKeys}
            />
          </div>
          <FmeaWorksheet rows={fmeaRows} />
        </>
      )}
    </div>
  )
}
