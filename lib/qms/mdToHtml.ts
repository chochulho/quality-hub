// ─────────────────────────────────────────────
// QMS 문서 Markdown → HTML 변환기 (인쇄 전용)
// 외부 라이브러리 없이 순수 구현
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

export function mdToHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []

  let inTable    = false
  let tableHead  = true   // 구분선 이전은 헤더
  let inList     = false
  let inCode     = false
  let codeLines: string[] = []

  function closeList() {
    if (inList) { out.push('</ul>'); inList = false }
  }
  function closeTable() {
    if (inTable) { out.push('</tbody></table>'); inTable = false; tableHead = true }
  }
  function flushCode() {
    if (inCode) {
      out.push(`<pre class="md-code"><code>${codeLines.join('\n')}</code></pre>`)
      inCode = false
      codeLines = []
    }
  }

  for (const raw of lines) {
    const line = raw

    // ── 코드 블록 ─────────────────────────────
    if (line.startsWith('```')) {
      if (!inCode) {
        closeList(); closeTable()
        inCode = true
      } else {
        flushCode()
      }
      continue
    }
    if (inCode) {
      codeLines.push(escapeHtml(line))
      continue
    }

    // ── 테이블 행 ──────────────────────────────
    if (line.startsWith('|')) {
      closeList()

      // 구분선 (|---|---|)
      if (/^\|[\s\-\|:]+\|$/.test(line)) {
        if (inTable && tableHead) {
          out.push('</thead><tbody>')
          tableHead = false
        }
        continue
      }

      if (!inTable) {
        out.push('<table class="md-table"><thead>')
        inTable  = true
        tableHead = true
      }

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
    if (line.trim() === '') {
      closeList()
      out.push('<br />')
      continue
    }

    // ── 일반 단락 ──────────────────────────────
    closeList()
    out.push(`<p>${renderInline(line)}</p>`)
  }

  closeList()
  closeTable()
  flushCode()
  return out.join('\n')
}
