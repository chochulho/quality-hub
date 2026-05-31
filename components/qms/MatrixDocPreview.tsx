// MTX-001 Markdown → 스크롤 가능한 스타일드 테이블 렌더링
// 조항(행) × 문서(열) 매트릭스 — sticky 첫 열, 세로 헤더에 문서번호+약식 제목

// 문서번호 → 약식 제목 매핑 (매트릭스 헤더 표시용)
const DOC_SHORT_TITLE: Record<string, string> = {
  'QM-001':  '품질매뉴얼',
  'QP-MR01': '경영검토',
  'QP-A01':  '내부심사',
  'QP-C01':  '고객불만',
  'QP-CA01': '시정조치',
  'QP-DC01': '문서관리',
  'QP-HR01': '인적자원',
  'QP-PO01': '구매·외주',
  'QP-PM01': '설비·계측',
  'QP-PU01': '구매관리',
  'QP-OUT1': '외주관리',
  'QP-EQ01': '설비관리',
  'QP-MS01': '계측기',
  'QP-PR01': '생산계획',
  'QP-WH01': '창고물류',
  'QP-D01':  '설계개발',
  'QP-D02':  'APQP',
  'QP-D03':  'PFMEA',
  'QP-D04':  '공정PFMEA',
  'QP-S01':  '협력사평가',
  'QP-S02':  '수입검사',
  'QP-CS01': '고객만족',
  'KPI-001': 'KPI표',
  'QI-P01':  '수입검사지침',
  'QI-P02':  '공정검사지침',
  'QI-P03':  '출하검사지침',
  'QI-E01':  '설비점검',
  'QI-M01':  '계측기교정',
  'QI-D01':  '도면관리',
  'QI-TMPL': '지침서양식',
}

function parseTable(content: string): { header: string[]; rows: string[][] } {
  const lines = content.split('\n')
  const tableLines = lines.filter(l => /^\|/.test(l) && !/^\|[-\s|:]+\|$/.test(l))
  if (tableLines.length === 0) return { header: [], rows: [] }
  const split = (l: string) => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  return { header: split(tableLines[0]), rows: tableLines.slice(1).map(split) }
}

const COVERAGE_STYLE: Record<string, string> = {
  '✓': 'bg-brand-navy text-white font-bold',
  '△': 'bg-brand-navy/15 text-brand-navy font-semibold',
  '':  '',
}

// 조항 번호에서 ** 제거
function cleanClause(raw: string): string {
  return raw.replace(/\*\*/g, '').trim()
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
          <span className="w-5 h-5 rounded bg-brand-navy/15 text-brand-navy flex items-center justify-center text-[10px] font-semibold">△</span>
          부분 반영
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="border-collapse text-xs min-w-max">
          <thead>
            <tr className="bg-muted/40">
              {/* 조항 고정 헤더 */}
              <th className="sticky left-0 z-20 bg-muted/60 text-left px-3 py-2 font-bold text-brand-navy border-b border-r border-border whitespace-nowrap min-w-[72px]">
                조항
              </th>
              {docCols.map((docNo, i) => {
                const short = DOC_SHORT_TITLE[docNo] ?? docNo
                return (
                  <th key={i} className="px-1 py-2 border-b border-r border-border last:border-r-0 text-center min-w-[52px] max-w-[64px]"
                    title={docNo}>
                    {/* 세로 헤더: 문서번호 + 약식 제목 */}
                    <div className="flex flex-col items-center gap-0.5"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', height: 72 }}>
                      <span className="font-bold text-brand-navy text-[10px] whitespace-nowrap">{docNo}</span>
                      <span className="font-normal text-muted-foreground text-[9px] whitespace-nowrap">{short}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const [clause, ...cells] = row
              const clean = cleanClause(clause)
              return (
                <tr key={ri} className="hover:bg-muted/10 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-border px-3 py-1.5 font-bold text-brand-navy whitespace-nowrap text-xs">
                    {clean}
                  </td>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="border-b border-r border-border last:border-r-0 text-center p-0">
                      <div className={`w-full h-7 flex items-center justify-center text-xs ${COVERAGE_STYLE[cell] ?? ''}`}>
                        {cell || ''}
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
