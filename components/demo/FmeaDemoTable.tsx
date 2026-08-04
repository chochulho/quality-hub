'use client'

import { Fragment, useState } from 'react'
import { AlertTriangle, ChevronDown, Plus, Check } from 'lucide-react'

export interface FmeaRow {
  processStepName: string
  failureMode: string
  failureEffectEndUser: string
  severity: number
  failureCause: string
  occurrence: number
  preventionControls: string
  detectionControls: string
  detection: number
  actionPriority: 'HIGH' | 'MEDIUM' | 'LOW'
  isSafetyCritical?: boolean
}

export function rowKey(row: FmeaRow) {
  return `${row.processStepName}|${row.failureMode}`
}

const AP_STYLE: Record<string, string> = {
  HIGH:   'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW:    'bg-gray-100 text-gray-600 border border-gray-200',
}

const SEV_COLOR = (n: number) =>
  n >= 9 ? 'text-red-600 font-bold' : n >= 7 ? 'text-amber-600 font-semibold' : 'text-foreground'

interface Props {
  rows: FmeaRow[]
  onAddRow?: (row: FmeaRow) => void
  addedKeys?: Set<string>
}

export default function FmeaDemoTable({ rows, onAddRow, addedKeys }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  if (rows.length === 0) return null

  const colSpan = (onAddRow ? 1 : 0) + 9

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="mt-3 rounded-xl border border-border overflow-hidden text-xs">
      <div className="bg-brand-navy/5 border-b border-border px-3 py-2 flex items-center gap-2">
        <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wide">
          PFMEA 제안 행
        </span>
        <span className="text-[10px] text-muted-foreground">
          {onAddRow ? '— 아래 버튼으로 워크시트에 추가하세요' : '— 확인 후 APQP Manager에서 저장 가능'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-muted/50 text-[10px] text-muted-foreground">
              {onAddRow && <th className="text-center px-3 py-2 font-semibold text-brand-orange w-16">추가</th>}
              <th className="text-left px-3 py-2 font-semibold">공정</th>
              <th className="text-left px-3 py-2 font-semibold">불량 유형</th>
              <th className="text-left px-3 py-2 font-semibold">영향</th>
              <th className="text-center px-2 py-2 font-semibold">S</th>
              <th className="text-center px-2 py-2 font-semibold">O</th>
              <th className="text-center px-2 py-2 font-semibold">D</th>
              <th className="text-center px-2 py-2 font-semibold">RPN</th>
              <th className="text-center px-2 py-2 font-semibold">AP</th>
              <th className="text-center px-2 py-2 font-semibold w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const rpn = (row.severity ?? 1) * (row.occurrence ?? 1) * (row.detection ?? 1)
              const key = rowKey(row)
              const isAdded = addedKeys?.has(key) ?? false
              const isExpanded = expanded.has(i)
              return (
                <Fragment key={i}>
                  <tr
                    onClick={() => toggleExpand(i)}
                    className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    {onAddRow && (
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isAdded) onAddRow(row)
                          }}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                            isAdded
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white cursor-pointer'
                          }`}
                        >
                          {isAdded ? (
                            <><Check className="h-2.5 w-2.5" />추가됨</>
                          ) : (
                            <><Plus className="h-2.5 w-2.5" />추가</>
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-3 py-2 text-foreground font-medium whitespace-nowrap max-w-[120px] truncate">
                      {row.processStepName}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      <div className="flex items-center gap-1">
                        {row.isSafetyCritical && (
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                        {row.failureMode}
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[10px] leading-snug">
                        원인: {row.failureCause}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[160px]">
                      {row.failureEffectEndUser}
                    </td>
                    <td className={`px-2 py-2 text-center ${SEV_COLOR(row.severity)}`}>
                      {row.severity}
                    </td>
                    <td className="px-2 py-2 text-center text-foreground">{row.occurrence}</td>
                    <td className="px-2 py-2 text-center text-foreground">{row.detection}</td>
                    <td className={`px-2 py-2 text-center font-bold ${SEV_COLOR(rpn / 10)}`}>
                      {rpn}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${AP_STYLE[row.actionPriority] ?? AP_STYLE.LOW}`}>
                        {row.actionPriority}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground mx-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={colSpan} className="px-4 py-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold text-brand-navy uppercase tracking-wide mb-1">
                              예방 관리 (Prevention)
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                              {row.preventionControls || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-brand-navy uppercase tracking-wide mb-1">
                              검출 관리 (Detection)
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                              {row.detectionControls || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
