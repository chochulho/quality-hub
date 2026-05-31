// ─────────────────────────────────────────────
// QMS 문서 Markdown → HTML 변환기
// flow / flow3 블록은 CSS 다이어그램으로 렌더링
// ─────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>')
}

// 수직 플로우 다이어그램: --- 구분자로 박스 분리, 첫째/마지막 박스는 io 스타일
function renderFlow(raw: string): string {
  const sections = raw.split(/^---\s*$/m).map(s => s.trim()).filter(Boolean)
  const total = sections.length
  let html = '<div class="pf">'
  sections.forEach((section, i) => {
    const rows = section.split('\n').filter(Boolean)
    const title = escapeHtml(rows[0] ?? '')
    const subs = rows.slice(1)
      .map(r => `<span class="pf-sub">${escapeHtml(r)}</span>`)
      .join('')
    const isIO = i === 0 || i === total - 1
    html += `<div class="pf-box${isIO ? ' pf-box--io' : ''}"><strong>${title}</strong>${subs}</div>`
    if (i < total - 1) html += '<div class="pf-arrow">▼</div>'
  })
  return html + '</div>'
}

// 3열 플로우 다이어그램: === 구분자, 각 열은 LABEL: 로 제목
function renderFlow3(raw: string): string {
  const cols = raw.split(/^===\s*$/m).map(s => s.trim()).filter(Boolean)
  if (cols.length !== 3) return `<pre class="md-code"><code>${escapeHtml(raw)}</code></pre>`
  const modifiers = ['left', 'center', 'right']
  const colHtml = cols.map((col, ci) => {
    const rows = col.split('\n').filter(Boolean)
    const m = rows[0]?.match(/^LABEL:\s*(.+)/)
    const label = m ? escapeHtml(m[1]) : ''
    const content = rows.slice(m ? 1 : 0)
      .map(r => `<div class="pf3-line">${escapeHtml(r)}</div>`)
      .join('')
    return `<div class="pf3-col pf3-col--${modifiers[ci]}">${
      label ? `<div class="pf3-label">${label}</div>` : ''
    }<div class="pf3-body">${content}</div></div>`
  })
  return `<div class="pf3">${colHtml.join('')}</div>`
}

export function mdToHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []

  let inTable   = false
  let tableHead = true
  let inList    = false
  let inCode    = false
  let codeLang  = ''
  let codeLines: string[] = []

  function closeList()  { if (inList)  { out.push('</ul>'); inList = false } }
  function closeTable() { if (inTable) { out.push('</tbody></table>'); inTable = false; tableHead = true } }
  function flushCode()  {
    if (!inCode) return
    const content = codeLines.join('\n')
    if      (codeLang === 'flow')  out.push(renderFlow(content))
    else if (codeLang === 'flow3') out.push(renderFlow3(content))
    else                           out.push(`<pre class="md-code"><code>${content}</code></pre>`)
    inCode = false; codeLang = ''; codeLines = []
  }

  for (const raw of lines) {
    const line = raw

    // ── 코드 블록 ─────────────────────────────
    if (line.startsWith('```')) {
      if (!inCode) {
        closeList(); closeTable()
        inCode = true
        codeLang = line.slice(3).trim().toLowerCase()
      } else {
        flushCode()
      }
      continue
    }
    if (inCode) {
      // flow/flow3는 raw 저장 (escapeHtml은 렌더러 내부에서 처리)
      codeLines.push(codeLang === 'flow' || codeLang === 'flow3' ? line : escapeHtml(line))
      continue
    }

    // ── 테이블 행 ──────────────────────────────
    if (line.startsWith('|')) {
      closeList()
      if (/^\|[\s\-\|:]+\|$/.test(line)) {
        if (inTable && tableHead) { out.push('</thead><tbody>'); tableHead = false }
        continue
      }
      if (!inTable) { out.push('<table class="md-table"><thead>'); inTable = true; tableHead = true }
      const cells = line.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      const tag = tableHead ? 'th' : 'td'
      out.push(`<tr>${cells.map(c => `<${tag}>${renderInline(c)}</${tag}>`).join('')}</tr>`)
      continue
    } else {
      closeTable()
    }

    // ── 제목 ───────────────────────────────────
    if (line.startsWith('#### ')) { closeList(); out.push(`<h4>${renderInline(line.slice(5))}</h4>`); continue }
    if (line.startsWith('### '))  { closeList(); out.push(`<h3>${renderInline(line.slice(4))}</h3>`); continue }
    if (line.startsWith('## '))   { closeList(); out.push(`<h2>${renderInline(line.slice(3))}</h2>`); continue }
    if (line.startsWith('# '))    { closeList(); out.push(`<h1>${renderInline(line.slice(2))}</h1>`); continue }

    // ── 인용 ───────────────────────────────────
    if (line.startsWith('> '))   { closeList(); out.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`); continue }

    // ── 수평선 ─────────────────────────────────
    if (line.trim() === '---')   { closeList(); out.push('<hr />'); continue }

    // ── 리스트 ─────────────────────────────────
    const ulMatch = line.match(/^[-*] (.+)/)
    const olMatch = line.match(/^(\d+)\. (.+)/)
    if (ulMatch) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${renderInline(ulMatch[1])}</li>`)
      continue
    }
    if (olMatch) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${renderInline(olMatch[2])}</li>`)
      continue
    }

    // ── 빈 줄 ──────────────────────────────────
    if (line.trim() === '') { closeList(); out.push('<br />'); continue }

    // ── 일반 단락 ──────────────────────────────
    closeList()
    out.push(`<p>${renderInline(line)}</p>`)
  }

  closeList(); closeTable(); flushCode()
  return out.join('\n')
}
