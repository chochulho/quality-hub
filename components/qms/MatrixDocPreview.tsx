// MTX-001 Markdown → 스크롤 가능한 스타일드 테이블 렌더링

function parseTable(content: string): { header: string[]; rows: string[][] } {
  const lines = content.split('\n')
  const tableLines = lines.filter(l => /^\|/.test(l) && !/^\|[-\s|:]+\|$/.test(l))
  if (tableLines.length === 0) return { header: [], rows: [] }
  const split = (l: string) => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  return { header: split(tableLines[0]), rows: tableLines.slice(1).map(split) }
}

const COVERAGE_STYLE: Record<string, string> = {
  '✓': 'bg-brand-navy text-white font-bold text-xs',
  '△': 'bg-brand-navy/20 text-brand-navy font-semibold text-xs',
  '':  '',
}

export default function MatrixDocPreview({ content }: { content: string }) {
  const { header, rows } = parseTable(content)
  if (header.length === 0) return <p className="text-sm text-muted-foreground">매트릭스 데이터가 없습니다.</p>

  const [clauseCol, ...docCols] = header

  return (
    <div className="not-prose">
      {/* 범례 */}
      <div className="flex gap-4 mb-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-brand-navy text-white flex items-center justify-center text-[10px] font-bold">✓</span>
          주요 반영
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-brand-navy/20 text-brand-navy flex items-center justify-center text-[10px] font-semibold">△</span>
          부분 반영
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="border-collapse text-xs min-w-max">
          <thead>
            <tr className="bg-muted/40">
              <th className="sticky left-0 z-10 bg-muted/60 text-left px-3 py-2 font-semibold text-brand-navy border-b border-r border-border min-w-[60px] whitespace-nowrap">
                조항
              </th>
              {docCols.map((col, i) => (
                <th key={i} className="px-2 py-2 border-b border-r border-border last:border-r-0 text-center font-semibold text-[10px] text-muted-foreground whitespace-nowrap max-w-[60px]">
                  <div className="writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', height: 56, whiteSpace: 'nowrap' }}>
                    {col}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const [clause, ...cells] = row
              return (
                <tr key={ri} className="hover:bg-muted/10 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-border px-3 py-1.5 font-bold text-brand-navy whitespace-nowrap">
                    {clause}
                  </td>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="border-b border-r border-border last:border-r-0 text-center p-0">
                      <div className={`w-full h-7 flex items-center justify-center rounded-none ${COVERAGE_STYLE[cell] ?? ''}`}>
                        {cell}
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
