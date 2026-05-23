"use client";

import type { DayResult, InventorySnapshot } from "@/lib/kanban/types";

interface KanbanFlowDiagramProps {
  dayResult: DayResult | null;
  initialInventory: InventorySnapshot;
}

// Design tokens (matches globals.css)
const C = {
  navy:        "#2B4B8C",
  orange:      "#F26B3A",
  muted:       "#F5F4F0",
  border:      "#E8E4DC",
  text:        "#1A1F2E",
  textMuted:   "#6B7280",
  green:       "#16A34A",
  amber:       "#CA8A04",
  red:         "#DC2626",
  // Active fills
  blueLight:   "#EFF6FF",
  greenLight:  "#F0FDF4",
  amberLight:  "#FFFBEB",
  orangeLight: "#FFF7ED",
};

// Arrow head marker IDs
const MARKERS = {
  navy:   "arrow-navy",
  orange: "arrow-orange",
  green:  "arrow-green",
  amber:  "arrow-amber",
  red:    "arrow-red",
};

// ── SVG arrow head defs ────────────────────────────────────────────────────────
function Defs() {
  return (
    <defs>
      {[
        { id: MARKERS.navy,   color: C.navy   },
        { id: MARKERS.orange, color: C.orange },
        { id: MARKERS.green,  color: C.green  },
        { id: MARKERS.amber,  color: C.amber  },
        { id: MARKERS.red,    color: C.red    },
      ].map(({ id, color }) => (
        <marker key={id} id={id} markerWidth="8" markerHeight="8"
          refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

// ── Node component ─────────────────────────────────────────────────────────────
function Node({
  x, y, w, h, rx = 6,
  label, sublabel, inventory,
  active, activeFill,
  activeStroke,
  dashed = false,
}: {
  x: number; y: number; w: number; h: number; rx?: number;
  label: string; sublabel?: string; inventory?: string[];
  active?: boolean; activeFill?: string; activeStroke?: string;
  dashed?: boolean;
}) {
  const fill   = active ? (activeFill ?? "#EFF6FF") : C.muted;
  const stroke = active ? (activeStroke ?? C.navy)  : C.border;
  const sw     = active ? 2.5 : 1;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx}
        fill={fill} stroke={stroke} strokeWidth={sw}
        strokeDasharray={dashed ? "5 3" : undefined} />
      <text x={x + w / 2} y={y + 18} textAnchor="middle"
        fontSize={12} fontWeight="700" fill={C.navy}>{label}</text>
      {sublabel && (
        <text x={x + w / 2} y={y + 32} textAnchor="middle"
          fontSize={9.5} fill={C.textMuted}>{sublabel}</text>
      )}
      {inventory && inventory.map((line, i) => (
        <text key={i} x={x + w / 2} y={y + (sublabel ? 44 : 34) + i * 13}
          textAnchor="middle" fontSize={10} fill={C.orange} fontWeight="600">
          {line}
        </text>
      ))}
    </g>
  );
}

// ── Arrow with label ───────────────────────────────────────────────────────────
function Arrow({
  d, color, dashed = false, marker, label, labelX, labelY,
}: {
  d: string; color: string; dashed?: boolean;
  marker: string; label?: string; labelX?: number; labelY?: number;
}) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.6}
        strokeDasharray={dashed ? "5 3" : undefined}
        markerEnd={`url(#${marker})`} />
      {label && labelX !== undefined && labelY !== undefined && (
        <text x={labelX} y={labelY} textAnchor="middle"
          fontSize={8.5} fill={color} fontWeight="600">{label}</text>
      )}
    </g>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { color: C.navy,   dash: false, label: "재료/완제품 흐름" },
    { color: C.orange, dash: false, label: "인출(Pull) 흐름"  },
    { color: C.red,    dash: true,  label: "생산 칸반 신호"    },
    { color: C.amber,  dash: true,  label: "부품주문 칸반 신호"},
  ];
  return (
    <g>
      {items.map(({ color, dash, label }, i) => (
        <g key={i} transform={`translate(${20 + i * 210}, 340)`}>
          <line x1={0} y1={5} x2={28} y2={5} stroke={color} strokeWidth={1.6}
            strokeDasharray={dash ? "4 2" : undefined} />
          {!dash && (
            <polygon points="28,5 22,2 22,8" fill={color} />
          )}
          <text x={34} y={9} fontSize={8.5} fill={C.textMuted}>{label}</text>
        </g>
      ))}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function KanbanFlowDiagram({ dayResult, initialInventory }: KanbanFlowDiagramProps) {
  // Determine which event types fired today
  const hasWithdrawal = (dayResult?.kanbans.some(k => k.type === "withdrawal")) ?? false;
  const hasProduction = (dayResult?.kanbans.some(k => k.type === "production")) ?? false;
  const hasPartsOrder = (dayResult?.kanbans.some(k => k.type === "partsOrder")) ?? false;

  const inv = dayResult?.inventoryAfter ?? initialInventory;

  // FG inventory lines
  const fgLines = (["가", "나", "다"] as const).map(
    p => `완제품 ${p}: ${inv.fg[p]}박스`
  );

  // Parts inventory lines (compressed)
  const partLines = (["A", "B", "C", "D", "E"] as const).map(
    p => `${p}: ${inv.parts[p]}박스`
  );
  // Show 2 per line to save space
  const partDisplay = [
    `A:${inv.parts["A"]} B:${inv.parts["B"]} C:${inv.parts["C"]}`,
    `D:${inv.parts["D"]} E:${inv.parts["E"]}`,
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 900 360" width="100%" style={{ minWidth: 600, display: "block" }}>
        <Defs />

        {/* ── Node: 공급자 ── */}
        <Node x={20} y={135} w={90} h={60}
          label="공급자" sublabel="Supplier" />

        {/* ── Node: 부품재고 ── */}
        <Node x={160} y={118} w={130} h={90} rx={8}
          label="부품재고" sublabel="Parts WH"
          inventory={partDisplay}
          active={hasPartsOrder}
          activeFill={C.amberLight}
          activeStroke={C.amber}
        />

        {/* ── Node: 조립공정 ── */}
        <Node x={368} y={110} w={150} h={95} rx={8}
          label="조립공정" sublabel="Assembly"
          active={hasProduction}
          activeFill={C.blueLight}
          activeStroke={C.navy}
        />

        {/* CT label inside assembly node */}
        <text x={443} y={188} textAnchor="middle" fontSize={9} fill={C.textMuted}>
          CT: 가30분 나20분 다10분
        </text>

        {/* ── Node: FG슈퍼마켓 ── */}
        <Node x={588} y={110} w={130} h={95} rx={8}
          label="FG슈퍼마켓" sublabel="Supermarket"
          inventory={fgLines}
          active={hasProduction || hasWithdrawal}
          activeFill={C.greenLight}
          activeStroke={C.green}
        />

        {/* ── Node: 고객 ── */}
        <Node x={790} y={135} w={90} h={60}
          label="고객" sublabel="Customer"
          active={hasWithdrawal}
          activeFill={C.orangeLight}
          activeStroke={C.orange}
        />

        {/* ── Node: 칸반 게시판 ── */}
        <Node x={398} y={265} w={110} h={50} rx={6}
          label="칸반 게시판" sublabel="Kanban Board"
          dashed active={hasProduction}
          activeFill="#FEF2F2"
          activeStroke={C.red}
        />

        {/* ════ ARROWS ════ */}

        {/* 공급자 → 부품재고 (physical flow) */}
        <Arrow d="M110,165 H160"
          color={C.navy} marker={MARKERS.navy}
          label="납품" labelX={135} labelY={158} />

        {/* 부품재고 → 조립공정 (physical flow) */}
        <Arrow d="M290,163 H368"
          color={C.navy} marker={MARKERS.navy}
          label="부품 공급" labelX={329} labelY={155} />

        {/* 조립공정 → FG슈퍼마켓 (physical flow) */}
        <Arrow d="M518,157 H588"
          color={C.navy} marker={MARKERS.navy}
          label="FG 입고" labelX={553} labelY={149} />

        {/* FG슈퍼마켓 → 고객 (pull / withdrawal) */}
        <Arrow d="M718,165 H790"
          color={hasWithdrawal ? C.orange : C.textMuted}
          marker={hasWithdrawal ? MARKERS.orange : MARKERS.navy}
          label="인출" labelX={754} labelY={157} />

        {/* 고객 → FG슈퍼마켓 (withdrawal signal, curved above) */}
        <Arrow
          d="M835,135 Q860,65 660,100"
          color={hasWithdrawal ? C.orange : C.textMuted}
          dashed marker={hasWithdrawal ? MARKERS.orange : MARKERS.navy}
          label="인출 칸반" labelX={780} labelY={73} />

        {/* FG슈퍼마켓 → 조립공정 (production kanban, curved below) */}
        <Arrow
          d="M640,205 Q590,255 510,265"
          color={hasProduction ? C.red : C.textMuted}
          dashed marker={hasProduction ? MARKERS.red : MARKERS.navy}
          label="생산 칸반" labelX={590} labelY={252} />

        {/* 조립공정 → 칸반 게시판 (vertical) */}
        <Arrow d="M443,205 V265"
          color={hasProduction ? C.red : C.textMuted}
          dashed marker={hasProduction ? MARKERS.red : MARKERS.navy} />

        {/* 칸반 게시판 → 부품재고 (parts order kanban, curved below) */}
        <Arrow
          d="M398,295 Q290,330 270,208"
          color={hasPartsOrder ? C.amber : C.textMuted}
          dashed marker={hasPartsOrder ? MARKERS.amber : MARKERS.navy}
          label="부품주문 칸반" labelX={310} labelY={318} />

        {/* ── Zone label ── */}
        <text x={450} y={14} textAnchor="middle" fontSize={12}
          fontWeight="700" fill={C.navy}>
          칸반 흐름 시뮬레이션
        </text>
        {dayResult && (
          <text x={450} y={30} textAnchor="middle" fontSize={10} fill={C.textMuted}>
            {["월","화","수","목","금"][dayResult.day]}요일 흐름
          </text>
        )}

        <Legend />
      </svg>
    </div>
  );
}
