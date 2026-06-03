"use client"

import type { FlowDef, FlowNode, FlowEdge, FlowColor } from '@/types/flowchart'

// ─── Layout constants ─────────────────────────────────────────
const L = {
  loopX:  10,    // x-position for left-loop arrows (outside lane area)
  laneW:  80,    // lane label column width
  mainW:  510,   // main flow area width
  noteW:  138,   // right annotation area width
  totalW: 80 + 510 + 138 + 20, // = 748

  cellH:  94,    // height per row
  padTop: 24,
  padBot: 24,

  nodeW:  204,   // process/terminator label box width
  nodeH:  52,    // process box height
  termH:  36,    // start/end terminator height
  termRx: 18,    // terminator corner radius
  diaW:   82,    // decision diamond half-width
  diaH:   41,    // decision diamond half-height
  noteW2: 126,   // note box width
  noteH:  48,    // note box height

  arrowSize: 8,  // arrowhead size
}

// Node center coordinates
function NCX(col: number): number {
  return col === 0
    ? L.laneW + L.mainW / 2          // 335
    : L.laneW + L.mainW + L.noteW / 2 // 638
}

function NCY(row: number): number {
  return L.padTop + row * L.cellH + L.cellH / 2
}

// ─── Color palette ────────────────────────────────────────────
const PALETTE: Record<FlowColor, { fill: string; stroke: string; text: string }> = {
  orange: { fill: '#F26B3A', stroke: '#E55A28', text: '#FFFFFF' },
  teal:   { fill: '#0D9488', stroke: '#0B7C71', text: '#FFFFFF' },
  navy:   { fill: '#2B4B8C', stroke: '#1E3666', text: '#FFFFFF' },
  blue:   { fill: '#3B82F6', stroke: '#2563EB', text: '#FFFFFF' },
  green:  { fill: '#16A34A', stroke: '#15803D', text: '#FFFFFF' },
  amber:  { fill: '#FEF3C7', stroke: '#D97706', text: '#1A1F2E' },
  white:  { fill: '#FFFFFF', stroke: '#D1D5DB', text: '#1A1F2E' },
  gray:   { fill: '#F5F4F0', stroke: '#D1D5DB', text: '#374151' },
}

function palette(color?: FlowColor) {
  return PALETTE[color ?? 'white']
}

// ─── Text wrapping helper ─────────────────────────────────────
// Returns array of lines (split on \n)
function splitLines(label: string): string[] {
  return label.split('\n')
}

// ─── Edge path builder ────────────────────────────────────────
interface Point { x: number; y: number }

function srcPoint(from: FlowNode, to: FlowNode, edge: FlowEdge): Point {
  const cx = NCX(from.col)
  const cy = NCY(from.row)
  if (from.type === 'decision') {
    if (edge.route === 'left-loop')    return { x: cx - L.diaW, y: cy }
    if (NCX(to.col) > cx)              return { x: cx + L.diaW, y: cy }  // right
    if (NCY(to.row) < cy)              return { x: cx, y: cy - L.diaH }  // up
    return { x: cx, y: cy + L.diaH }                                       // down
  }
  if (from.type === 'note') {
    if (NCX(to.col) < cx)             return { x: cx - L.noteW2 / 2, y: cy }
    return { x: cx, y: cy + L.noteH / 2 }
  }
  const hH = from.type === 'start' || from.type === 'end' ? L.termH / 2 : L.nodeH / 2
  const hW = L.nodeW / 2
  if (NCX(to.col) > cx)              return { x: cx + hW, y: cy }
  if (NCX(to.col) < cx)             return { x: cx - hW, y: cy }
  if (NCY(to.row) < cy)             return { x: cx, y: cy - hH }
  return { x: cx, y: cy + hH }
}

function dstPoint(to: FlowNode, from: FlowNode, edge: FlowEdge): Point {
  const cx = NCX(to.col)
  const cy = NCY(to.row)
  if (to.type === 'decision') {
    if (edge.route === 'left-loop')   return { x: cx - L.diaW, y: cy }
    if (NCX(from.col) > cx)          return { x: cx + L.diaW, y: cy }
    if (NCY(from.row) < cy)          return { x: cx, y: cy - L.diaH }
    return { x: cx, y: cy + L.diaH }
  }
  if (to.type === 'note') {
    if (NCX(from.col) < cx)         return { x: cx - L.noteW2 / 2, y: cy }
    return { x: cx, y: cy - L.noteH / 2 }
  }
  const hH = to.type === 'start' || to.type === 'end' ? L.termH / 2 : L.nodeH / 2
  const hW = L.nodeW / 2
  if (NCX(from.col) > cx)          return { x: cx + hW, y: cy }
  if (NCX(from.col) < cx)         return { x: cx - hW, y: cy }
  if (NCY(from.row) > cy)         return { x: cx, y: cy - hH }
  return { x: cx, y: cy + hH }
}

function buildPath(edge: FlowEdge, from: FlowNode, to: FlowNode): string {
  const s = srcPoint(from, to, edge)
  const d = dstPoint(to, from, edge)

  if (edge.route === 'left-loop') {
    // Go left → up → right into target
    return `M ${s.x} ${s.y} L ${L.loopX} ${s.y} L ${L.loopX} ${d.y} L ${d.x} ${d.y}`
  }

  // Straight vertical (same col, going down)
  if (Math.abs(s.x - d.x) < 2) {
    return `M ${s.x} ${s.y} L ${d.x} ${d.y}`
  }

  // Straight horizontal (same row)
  if (Math.abs(s.y - d.y) < 2) {
    return `M ${s.x} ${s.y} L ${d.x} ${d.y}`
  }

  // L-shaped: horizontal first (to right annotation), then vertical
  if (to.col === 1 || from.col === 1) {
    return `M ${s.x} ${s.y} L ${d.x} ${s.y} L ${d.x} ${d.y}`
  }

  // Default L-shape: vertical first
  return `M ${s.x} ${s.y} L ${s.x} ${d.y} L ${d.x} ${d.y}`
}

// ─── Node renderers ───────────────────────────────────────────

function ProcessNode({ node }: { node: FlowNode }) {
  const cx = NCX(node.col)
  const cy = NCY(node.row)
  const pal = palette(node.color)
  const lines = splitLines(node.label)
  const mainLine = lines[0]
  const subLine  = lines[1]

  return (
    <g>
      <rect
        x={cx - L.nodeW / 2} y={cy - L.nodeH / 2}
        width={L.nodeW} height={L.nodeH}
        rx={6} ry={6}
        fill={pal.fill} stroke={pal.stroke} strokeWidth={1.2}
      />
      <text
        x={cx} y={cy - (subLine ? 7 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={11.5} fontWeight={600} fill={pal.text}
        fontFamily="Pretendard, sans-serif"
      >
        {mainLine}
      </text>
      {subLine && (
        <text
          x={cx} y={cy + 10}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9.5} fontWeight={400} fill={pal.text}
          opacity={0.85} fontFamily="Pretendard, sans-serif"
        >
          {subLine}
        </text>
      )}
    </g>
  )
}

function TerminatorNode({ node }: { node: FlowNode }) {
  const cx = NCX(node.col)
  const cy = NCY(node.row)
  const pal = palette(node.color)
  const lines = splitLines(node.label)

  return (
    <g>
      <rect
        x={cx - L.nodeW / 2 + 26} y={cy - L.termH / 2}
        width={L.nodeW - 52} height={L.termH}
        rx={L.termRx} ry={L.termRx}
        fill={pal.fill} stroke={pal.stroke} strokeWidth={1.2}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx} y={cy + (lines.length === 1 ? 0 : i === 0 ? -6 : 6)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={10.5} fontWeight={600} fill={pal.text}
          fontFamily="Pretendard, sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function DecisionNode({ node }: { node: FlowNode }) {
  const cx = NCX(node.col)
  const cy = NCY(node.row)
  const pal = palette(node.color)
  const lines = splitLines(node.label)

  const pts = [
    `${cx},${cy - L.diaH}`,
    `${cx + L.diaW},${cy}`,
    `${cx},${cy + L.diaH}`,
    `${cx - L.diaW},${cy}`,
  ].join(' ')

  return (
    <g>
      <polygon
        points={pts}
        fill={pal.fill} stroke={pal.stroke} strokeWidth={1.2}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx} y={cy + (lines.length === 1 ? 0 : i === 0 ? -7 : 7)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={600} fill={pal.text}
          fontFamily="Pretendard, sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function NoteNode({ node }: { node: FlowNode }) {
  const cx = NCX(node.col)
  const cy = NCY(node.row)
  const pal = palette(node.color)
  const lines = splitLines(node.label)

  return (
    <g>
      <rect
        x={cx - L.noteW2 / 2} y={cy - L.noteH / 2}
        width={L.noteW2} height={L.noteH}
        rx={4} ry={4}
        fill={pal.fill} stroke={pal.stroke} strokeWidth={1}
        strokeDasharray="4 2"
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx} y={cy + (lines.length === 1 ? 0 : i === 0 ? -7 : 7)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9.5} fontWeight={500} fill={pal.text}
          fontFamily="Pretendard, sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function FlowNodeRenderer({ node }: { node: FlowNode }) {
  switch (node.type) {
    case 'start':
    case 'end':
      return <TerminatorNode node={node} />
    case 'process':
      return <ProcessNode node={node} />
    case 'decision':
      return <DecisionNode node={node} />
    case 'note':
      return <NoteNode node={node} />
    default:
      return null
  }
}

// ─── Edge renderer ────────────────────────────────────────────
function EdgeRenderer({
  edge, fromNode, toNode,
}: {
  edge: FlowEdge
  fromNode: FlowNode
  toNode: FlowNode
}) {
  const d = buildPath(edge, fromNode, toNode)
  const isDashed = edge.style === 'dashed'

  // Label midpoint: roughly center of path
  const dst = dstPoint(toNode, fromNode, edge)

  let labelX = dst.x
  let labelY = dst.y
  // Place label near the target, offset slightly
  if (edge.route === 'left-loop') {
    labelX = L.loopX + 30
    const srcPt = srcPoint(fromNode, toNode, edge)
    labelY = (srcPt.y + dst.y) / 2
  } else if (fromNode.col !== toNode.col) {
    const srcPt = srcPoint(fromNode, toNode, edge)
    labelX = (srcPt.x + dst.x) / 2
    labelY = srcPt.y - 6
  } else {
    const srcPt = srcPoint(fromNode, toNode, edge)
    labelX = srcPt.x + 8
    labelY = (srcPt.y + dst.y) / 2
  }

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="#9CA3AF"
        strokeWidth={1.4}
        strokeDasharray={isDashed ? '5 3' : undefined}
        markerEnd="url(#arrowhead)"
      />
      {edge.label && (
        <text
          x={labelX} y={labelY}
          textAnchor="start" dominantBaseline="middle"
          fontSize={9} fill="#6B7280"
          fontFamily="Pretendard, sans-serif"
        >
          {edge.label}
        </text>
      )}
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────
interface Props {
  flow: FlowDef
  className?: string
}

export default function ProcessFlowChart({ flow, className }: Props) {
  const maxRow = Math.max(...flow.nodes.map(n => n.row))
  const totalH = L.padTop + (maxRow + 1) * L.cellH + L.padBot

  // Build node map for edge lookups
  const nodeMap: Record<string, FlowNode> = {}
  for (const n of flow.nodes) nodeMap[n.id] = n

  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <svg
        viewBox={`0 0 ${L.totalW} ${totalH}`}
        width={L.totalW}
        height={totalH}
        style={{ minWidth: L.totalW, display: 'block' }}
        aria-label="프로세스 흐름도"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth={L.arrowSize} markerHeight={L.arrowSize}
            refX={L.arrowSize - 1} refY={L.arrowSize / 2}
            orient="auto"
          >
            <polygon
              points={`0 0, ${L.arrowSize} ${L.arrowSize / 2}, 0 ${L.arrowSize}`}
              fill="#9CA3AF"
            />
          </marker>
        </defs>

        {/* ── Swim lane backgrounds ──────────────────────────── */}
        {flow.lanes?.map(lane => {
          const y1 = L.padTop + lane.rowStart * L.cellH
          const y2 = L.padTop + (lane.rowEnd + 1) * L.cellH
          return (
            <g key={lane.id}>
              <rect
                x={L.laneW} y={y1}
                width={L.mainW + L.noteW + 20}
                height={y2 - y1}
                fill={lane.bgColor}
              />
              {/* lane label background */}
              <rect x={0} y={y1} width={L.laneW} height={y2 - y1}
                fill={lane.bgColor} opacity={0.6}
              />
              {/* horizontal divider line */}
              <line
                x1={0} y1={y1} x2={L.totalW} y2={y1}
                stroke="#E8E4DC" strokeWidth={0.8}
              />
              {/* lane label (centered in lane) */}
              <text
                x={L.laneW / 2}
                y={(y1 + y2) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9.5}
                fontWeight={600}
                fill="#6B7280"
                fontFamily="Pretendard, sans-serif"
                transform={`rotate(-90, ${L.laneW / 2}, ${(y1 + y2) / 2})`}
              >
                {lane.label}
              </text>
            </g>
          )
        })}

        {/* Outer border */}
        <rect
          x={0} y={0}
          width={L.totalW} height={totalH}
          fill="none" stroke="#E8E4DC" strokeWidth={1}
          rx={6}
        />

        {/* Lane label column divider */}
        <line
          x1={L.laneW} y1={0} x2={L.laneW} y2={totalH}
          stroke="#E8E4DC" strokeWidth={1}
        />

        {/* ── Edges (drawn below nodes so nodes are on top) ─── */}
        {flow.edges.map((edge, i) => {
          const fromNode = nodeMap[edge.from]
          const toNode   = nodeMap[edge.to]
          if (!fromNode || !toNode) return null
          return (
            <EdgeRenderer key={i} edge={edge} fromNode={fromNode} toNode={toNode} />
          )
        })}

        {/* ── Nodes ─────────────────────────────────────────── */}
        {flow.nodes.map(node => (
          <FlowNodeRenderer key={node.id} node={node} />
        ))}

        {/* Legend */}
        {(() => {
          const legendY = totalH - 18
          const legendItems = [
            { color: '#F26B3A', label: '품질팀 주도' },
            { color: '#0D9488', label: '생산/담당부서' },
            { color: '#2B4B8C', label: '경영진 주도' },
            { color: '#3B82F6', label: '영업팀' },
          ]
          return (
            <g>
              {legendItems.map((item, i) => (
                <g key={i} transform={`translate(${L.laneW + 12 + i * 120}, ${legendY})`}>
                  <rect x={0} y={-6} width={10} height={10} rx={2} fill={item.color} />
                  <text x={14} y={2} fontSize={8.5} fill="#9CA3AF"
                    fontFamily="Pretendard, sans-serif">
                    {item.label}
                  </text>
                </g>
              ))}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
