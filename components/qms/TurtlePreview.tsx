// 터틀 다이어그램 MD 파싱 → 비주얼 렌더링
// 3열 그리드: [Input | Process | Output], 상단 [Who+WithWhat], 하단 [How]

interface TurtleData {
  input: string
  output: string
  who: string
  withWhat: string
  how: string
  measure: string
  processName: string
}

function parseTurtle(content: string): TurtleData {
  const blank = { input: '', output: '', who: '', withWhat: '', how: '', measure: '', processName: '' }
  if (!content) return blank

  const titleMatch = content.match(/^## 프로세스: (.+)$/m)
  const processName = titleMatch ? titleMatch[1].trim() : ''

  const tableRows = content.match(/^\|(?![-\s|]+\|).+\|$/gm) ?? []
  const data = { ...blank, processName }

  for (const row of tableRows) {
    const cells = row.replace(/^\||\|$/g, '').split('|').map(c =>
      c.replace(/\*\*/g, '').trim()
    )
    if (cells.length < 2) continue
    const label = cells[0].toLowerCase()
    const value = cells[1]
    if (label.includes('input') || label.includes('입력'))        data.input    = value
    else if (label.includes('output') || label.includes('출력'))  data.output   = value
    else if (label.includes('who') || label.includes('인원'))     data.who      = value
    else if (label.includes('with') || label.includes('설비'))    data.withWhat = value
    else if (label.includes('how') || label.includes('방법'))     data.how      = value
    else if (label.includes('measure') || label.includes('측정')) data.measure  = value
  }
  return data
}

interface CellProps { label: string; eng: string; value: string; color: string; className?: string }

function SupportCell({ label, eng, value, color, className = '' }: CellProps) {
  return (
    <div className={`${color} rounded-xl p-3 ${className}`}>
      <p className="text-[10px] font-bold mb-1 opacity-70">
        {label} <span className="font-normal">({eng})</span>
      </p>
      <p className="text-xs leading-relaxed" style={{ wordBreak: 'keep-all' }}>
        {value || '—'}
      </p>
    </div>
  )
}

function IOCell({ label, eng, value, color }: CellProps) {
  return (
    <div className={`${color} rounded-xl p-3 h-full`}>
      <p className="text-[10px] font-bold mb-1 opacity-70">
        {label} <span className="font-normal">({eng})</span>
      </p>
      <p className="text-xs leading-relaxed" style={{ wordBreak: 'keep-all' }}>
        {value || '—'}
      </p>
    </div>
  )
}

export default function TurtlePreview({ content }: { content: string }) {
  const d = parseTurtle(content)

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4 not-prose">
      {/* 3열 그리드: [1fr] [1.6fr] [1fr] — TurtleDiagram 컴포넌트와 동일한 비율 */}
      <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1.6fr 1fr' }}>

        {/* ── Row 1: 위쪽 지원 셀 ─────────────────────────── */}
        <div /> {/* left spacer */}
        <div className="flex gap-2">
          <SupportCell
            label="인원" eng="Who" value={d.who}
            color="bg-blue-50 border border-blue-200 text-blue-900"
            className="flex-1 min-w-0"
          />
          <SupportCell
            label="설비·자원" eng="With What" value={d.withWhat}
            color="bg-blue-50 border border-blue-200 text-blue-900"
            className="flex-1 min-w-0"
          />
        </div>
        <div /> {/* right spacer */}

        {/* ── Row 2: Input → Process → Output ──────────────── */}
        <div className="flex items-center gap-1.5">
          <IOCell
            label="입력" eng="Input" value={d.input}
            color="bg-green-50 border border-green-200 text-green-900"
          />
          <span className="shrink-0 text-brand-orange font-bold text-xl">→</span>
        </div>

        {/* 가운데: 프로세스 이름 + KPI */}
        <div className="bg-brand-navy text-white rounded-xl flex flex-col items-center justify-center text-center p-4 min-h-[80px]">
          <p className="text-[9px] opacity-50 uppercase tracking-widest mb-1">Process</p>
          <p className="text-sm font-extrabold leading-snug" style={{ wordBreak: 'keep-all' }}>
            {d.processName || '프로세스'}
          </p>
          {d.measure && (
            <div className="mt-3 pt-2 border-t border-white/20 w-full">
              <p className="text-[9px] opacity-50 uppercase tracking-widest mb-0.5">Measure / KPI</p>
              <p className="text-[11px] leading-snug opacity-90" style={{ wordBreak: 'keep-all' }}>
                {d.measure}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-brand-orange font-bold text-xl">→</span>
          <IOCell
            label="출력" eng="Output" value={d.output}
            color="bg-green-50 border border-green-200 text-green-900"
          />
        </div>

        {/* ── Row 3: 아래쪽 지원 셀 ────────────────────────── */}
        <div /> {/* left spacer */}
        <SupportCell
          label="방법" eng="How" value={d.how}
          color="bg-orange-50 border border-orange-200 text-orange-900"
        />
        <div /> {/* right spacer */}

      </div>
    </div>
  )
}
