// 터틀 다이어그램 MD 파싱 → 비주얼 렌더링
// 마크다운 테이블 6행에서 Input/Output/Who/WithWhat/How/Measure 추출

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

  // 제목에서 프로세스명 추출
  const titleMatch = content.match(/^## 프로세스: (.+)$/m)
  const processName = titleMatch ? titleMatch[1].trim() : ''

  // 테이블 행 파싱
  const tableRows = content.match(/^\|(?![-\s|]+\|).+\|$/gm) ?? []
  const data = { ...blank, processName }

  for (const row of tableRows) {
    const cells = row.replace(/^\||\|$/g, '').split('|').map(c =>
      c.replace(/\*\*/g, '').trim()
    )
    if (cells.length < 2) continue
    const label = cells[0].toLowerCase()
    const value = cells[1]
    if (label.includes('input') || label.includes('입력'))       data.input    = value
    else if (label.includes('output') || label.includes('출력')) data.output   = value
    else if (label.includes('who') || label.includes('인원'))    data.who      = value
    else if (label.includes('with') || label.includes('설비'))   data.withWhat = value
    else if (label.includes('how') || label.includes('방법'))    data.how      = value
    else if (label.includes('measure') || label.includes('측정')) data.measure = value
  }
  return data
}

function Cell({ label, eng, value, color }: { label: string; eng: string; value: string; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 flex-1 min-w-0`}>
      <p className="text-[10px] font-bold opacity-70 mb-1">{label} <span className="font-normal">({eng})</span></p>
      <p className="text-xs leading-snug" style={{ wordBreak: 'keep-all' }}>{value || '—'}</p>
    </div>
  )
}

export default function TurtlePreview({ content }: { content: string }) {
  const d = parseTurtle(content)

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4 space-y-2 not-prose">
      {/* Row 1: WHO + WITH WHAT */}
      <div className="flex gap-2">
        <div className="w-[calc(50%-theme(spacing.1))]" />
        <Cell label="인원" eng="Who"       value={d.who}      color="bg-blue-50 border border-blue-200 text-blue-900" />
        <Cell label="설비·자원" eng="With What" value={d.withWhat} color="bg-blue-50 border border-blue-200 text-blue-900" />
        <div className="w-[calc(50%-theme(spacing.1))]" />
      </div>

      {/* Row 2: INPUT → PROCESS → OUTPUT */}
      <div className="flex items-stretch gap-2">
        {/* Input */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Cell label="입력" eng="Input" value={d.input} color="bg-green-50 border border-green-200 text-green-900" />
        </div>
        {/* Arrow */}
        <div className="flex items-center text-brand-orange font-bold text-lg shrink-0">→</div>
        {/* Process center */}
        <div className="flex-[1.4] min-w-0 bg-brand-navy text-white rounded-xl flex flex-col items-center justify-center text-center p-4 gap-1">
          <p className="text-[9px] opacity-50 uppercase tracking-widest">Process</p>
          <p className="text-sm font-extrabold leading-tight" style={{ wordBreak: 'keep-all' }}>
            {d.processName || '프로세스'}
          </p>
          {d.measure && (
            <div className="mt-2 pt-2 border-t border-white/20 w-full text-center">
              <p className="text-[9px] opacity-50 uppercase tracking-widest mb-0.5">Measure / KPI</p>
              <p className="text-[11px] leading-snug opacity-90">{d.measure}</p>
            </div>
          )}
        </div>
        {/* Arrow */}
        <div className="flex items-center text-brand-orange font-bold text-lg shrink-0">→</div>
        {/* Output */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Cell label="출력" eng="Output" value={d.output} color="bg-green-50 border border-green-200 text-green-900" />
        </div>
      </div>

      {/* Row 3: HOW */}
      <div className="flex gap-2">
        <div className="w-[calc(50%-theme(spacing.1))]" />
        <Cell label="방법" eng="How" value={d.how} color="bg-orange-50 border border-orange-200 text-orange-900" />
        <div className="w-[calc(50%-theme(spacing.1))]" />
      </div>
    </div>
  )
}
