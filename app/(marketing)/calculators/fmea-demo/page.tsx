'use client'

import { useState, useMemo } from 'react'
import { Bot, Zap, RefreshCw } from 'lucide-react'
import FmeaDemoChat from '@/components/demo/FmeaDemoChat'
import FmeaWorksheet from '@/components/demo/FmeaWorksheet'
import { type FmeaRow, rowKey } from '@/components/demo/FmeaDemoTable'

export default function FmeaDemoPage() {
  const [fmeaRows, setFmeaRows] = useState<FmeaRow[]>([])

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">

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

      {/* 핵심 기능 */}
      <p className="text-center text-xs font-semibold text-brand-orange mb-3">
        APQP Manager 핵심 기능
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-brand-orange/10 rounded-xl mb-3">
            <Bot className="h-4 w-4 text-brand-orange" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy mb-1">AI 대화형 FMEA 챗봇</h3>
          <p className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: 'keep-all' }}>
            공정을 설명하면 AI가 불량 유형·원인·조치우선순위를 자동 제안합니다. 지금 아래에서 바로 체험할 수 있습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-brand-navy/5 rounded-xl mb-3">
            <RefreshCw className="h-4 w-4 text-brand-navy" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy mb-1">구형 양식 → AIAG-VDA 신양식 자동 변환</h3>
          <p className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: 'keep-all' }}>
            기존에 만들어 둔 구형 Excel·PDF FMEA를 AI가 자동 파싱해 신양식으로 가져옵니다. 기존 자산을 버리지 않아도 됩니다.
            <span className="text-brand-orange"> APQP Manager 전용 기능</span>입니다.
          </p>
        </div>
      </div>

      {/* 안내 */}
      <div className="rounded-2xl bg-muted/60 border border-border p-5 text-sm text-muted-foreground text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2 font-semibold text-foreground">
          <Zap className="h-4 w-4 text-brand-orange" />
          이런 순서로 진행됩니다
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <span>① 예시 선택 또는 공정 설명</span>
          <span className="text-border">→</span>
          <span>② AI가 공정별 불량 유형 제안</span>
          <span className="text-border">→</span>
          <span>③ S·O·D·RPN·AP 자동 산출</span>
          <span className="text-border">→</span>
          <span>④ APQP Manager에서 저장</span>
        </div>
      </div>

      {/* 챗봇 (좌) + 워크시트 (우) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 items-start">
        <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
          <FmeaDemoChat onAddRow={handleAddRow} addedKeys={addedKeys} onReset={() => setFmeaRows([])} />
        </div>
        <FmeaWorksheet rows={fmeaRows} />
      </div>
    </div>
  )
}
