'use client'

import { AlertTriangle, ClipboardList, ExternalLink } from 'lucide-react'
import { type FmeaRow } from './FmeaDemoTable'

const AP_STYLE: Record<string, string> = {
  HIGH:   'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW:    'bg-gray-100 text-gray-600 border border-gray-200',
}

interface Props {
  rows: FmeaRow[]
}

export default function FmeaWorksheet({ rows }: Props) {
  const highCount = rows.filter((r) => r.actionPriority === 'HIGH').length
  const safetyCriticalCount = rows.filter((r) => r.isSafetyCritical).length

  return (
    <div className="mt-6 rounded-2xl border-2 border-brand-navy/20 overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="bg-brand-navy px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">FMEA 워크시트</span>
        </div>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
          rows.length > 0 ? 'bg-brand-orange text-white' : 'bg-white/20 text-white/80'
        }`}>
          {rows.length}행 추가됨
        </span>
      </div>

      {rows.length === 0 ? (
        /* 빈 상태 */
        <div className="bg-muted/30 px-6 py-10 text-center">
          <ClipboardList className="h-9 w-9 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground mb-1.5">워크시트가 비어 있습니다</p>
          <p className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: 'keep-all' }}>
            위 AI 제안 행의 <span className="text-brand-orange font-semibold">추가</span> 버튼을 클릭하면<br />
            이곳에 실시간으로 반영됩니다
          </p>
        </div>
      ) : (
        <>
          {/* 테이블 */}
          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[720px] text-xs">
              <thead>
                <tr className="bg-brand-navy/5 text-[10px] text-muted-foreground border-b border-border">
                  <th className="text-center px-2 py-2.5 font-semibold text-brand-navy w-8">#</th>
                  <th className="text-left px-3 py-2.5 font-semibold">공정</th>
                  <th className="text-left px-3 py-2.5 font-semibold">불량 유형 / 원인</th>
                  <th className="text-left px-3 py-2.5 font-semibold">영향</th>
                  <th className="text-center px-2 py-2.5 font-semibold">S</th>
                  <th className="text-center px-2 py-2.5 font-semibold">O</th>
                  <th className="text-center px-2 py-2.5 font-semibold">D</th>
                  <th className="text-center px-2 py-2.5 font-semibold">RPN</th>
                  <th className="text-center px-2 py-2.5 font-semibold">AP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const rpn = (row.severity ?? 1) * (row.occurrence ?? 1) * (row.detection ?? 1)
                  return (
                    <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-2 py-2.5 text-center text-muted-foreground font-medium">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                        {row.processStepName}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 text-foreground font-medium">
                          {row.isSafetyCritical && (
                            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                          )}
                          {row.failureMode}
                        </div>
                        <p className="text-muted-foreground text-[10px] mt-0.5 leading-snug">
                          원인: {row.failureCause}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground max-w-[160px] leading-snug">
                        {row.failureEffectEndUser}
                      </td>
                      <td className={`px-2 py-2.5 text-center font-semibold ${
                        row.severity >= 9 ? 'text-red-600' : row.severity >= 7 ? 'text-amber-600' : 'text-foreground'
                      }`}>
                        {row.severity}
                      </td>
                      <td className="px-2 py-2.5 text-center text-foreground">{row.occurrence}</td>
                      <td className="px-2 py-2.5 text-center text-foreground">{row.detection}</td>
                      <td className={`px-2 py-2.5 text-center font-bold ${
                        rpn >= 200 ? 'text-red-600' : rpn >= 100 ? 'text-amber-600' : 'text-foreground'
                      }`}>
                        {rpn}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${AP_STYLE[row.actionPriority] ?? AP_STYLE.LOW}`}>
                          {row.actionPriority}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 하단 바 */}
          <div className="bg-muted/30 border-t border-border px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 text-xs">
              {safetyCriticalCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  안전 특성 {safetyCriticalCount}건
                </span>
              )}
              {highCount > 0 && (
                <span className="text-amber-700 font-semibold">
                  HIGH AP {highCount}건
                </span>
              )}
              <span className="text-muted-foreground">총 {rows.length}행</span>
            </div>
            <a
              href="https://apqpmanager.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-brand-orange text-white rounded-full px-3.5 py-1.5 font-semibold hover:bg-brand-orange-hover transition-colors"
            >
              APQP Manager에서 저장
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      )}
    </div>
  )
}
