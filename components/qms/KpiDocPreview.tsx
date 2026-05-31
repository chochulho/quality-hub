// KPI-001 Markdown → 프로세스별 효과성/효율성 매트릭스 렌더링

interface KpiRow {
  name: string
  type: string
  formula: string
  target: string
  frequency: string
  owner: string
}

interface KpiSection {
  title: string
  kpis: KpiRow[]
}

function parseKpiSections(content: string): KpiSection[] {
  const sections: KpiSection[] = []
  let current: KpiSection | null = null

  for (const line of content.split('\n')) {
    // ### 3.x 제목
    if (/^#{2,3} /.test(line)) {
      if (current) sections.push(current)
      current = { title: line.replace(/^#{2,3} /, '').trim(), kpis: [] }
      continue
    }
    // 테이블 행
    if (line.startsWith('|') && !/^\|[-\s|:]+\|$/.test(line) && current) {
      const cells = line.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      // 헤더 행 스킵 (첫 번째 셀이 "지표" 등)
      if (cells[0] === '지표' || cells[0] === '항목') continue
      if (cells.length >= 4) {
        // 프로세스 레벨: | 지표 | 유형 | 산식 | 목표 | 주기 | 담당 |
        // 경영/운영 레벨: | 지표 | 산식 | 목표 | 주기 | 담당 |
        const hasType = cells[1] === '효과성' || cells[1] === '효율성'
        current.kpis.push({
          name:      cells[0],
          type:      hasType ? cells[1] : '',
          formula:   hasType ? cells[2] : cells[1],
          target:    hasType ? cells[3] : cells[2],
          frequency: hasType ? cells[4] ?? '' : cells[3] ?? '',
          owner:     hasType ? cells[5] ?? '' : cells[4] ?? '',
        })
      }
    }
  }
  if (current) sections.push(current)
  return sections.filter(s => s.kpis.length > 0)
}

const TYPE_BADGE: Record<string, string> = {
  '효과성': 'bg-blue-50 text-blue-700 border border-blue-200',
  '효율성': 'bg-orange-50 text-orange-700 border border-orange-200',
  '':       'bg-muted text-muted-foreground',
}

export default function KpiDocPreview({ content }: { content: string }) {
  const sections = parseKpiSections(content)
  if (sections.length === 0) return <p className="text-sm text-muted-foreground">KPI 데이터가 없습니다.</p>

  return (
    <div className="not-prose space-y-5">
      {sections.map((sec, si) => (
        <div key={si}>
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-bold text-brand-navy" style={{ wordBreak: 'keep-all' }}>
              {sec.title}
            </h3>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* KPI 테이블 */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs border-collapse table-fixed">
              <colgroup>
                <col />
                <col className="w-[62px]" />
                <col className="w-[168px]" />
                <col className="w-[52px]" />
                <col className="w-[64px]" />
              </colgroup>
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left px-3 py-2 border-b border-r border-border font-semibold text-muted-foreground">지표</th>
                  <th className="text-center px-2 py-2 border-b border-r border-border font-semibold text-muted-foreground">유형</th>
                  <th className="text-left px-3 py-2 border-b border-r border-border font-semibold text-muted-foreground">목표</th>
                  <th className="text-center px-2 py-2 border-b border-r border-border font-semibold text-muted-foreground">주기</th>
                  <th className="text-left px-3 py-2 border-b border-border font-semibold text-muted-foreground">담당</th>
                </tr>
              </thead>
              <tbody>
                {sec.kpis.map((kpi, ki) => (
                  <tr key={ki} className="hover:bg-muted/10 transition-colors">
                    <td className="px-3 py-2 border-b border-r border-border font-medium text-foreground" style={{ wordBreak: 'keep-all' }}>
                      {kpi.name}
                    </td>
                    <td className="px-2 py-2 border-b border-r border-border text-center">
                      {kpi.type ? (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[kpi.type] ?? ''}`}>
                          {kpi.type}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 border-b border-r border-border text-brand-orange font-semibold" style={{ wordBreak: 'keep-all' }}>
                      {kpi.target}
                    </td>
                    <td className="px-2 py-2 border-b border-r border-border text-center text-muted-foreground">
                      {kpi.frequency}
                    </td>
                    <td className="px-3 py-2 border-b border-border text-muted-foreground" style={{ wordBreak: 'keep-all' }}>
                      {kpi.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
