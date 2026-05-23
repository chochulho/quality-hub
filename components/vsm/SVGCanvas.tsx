"use client";

import React, { useRef, useState } from "react";
import type { VSMState, VSMMetrics, VSMIconType, DroppedIcon, VSMProcess } from "@/lib/vsm/types";
import { ICON_COMPONENTS } from "./vsmIcons";
import {
  W, H,
  INFO_ZONE_Y, INFO_ZONE_H,
  MATERIAL_ZONE_Y,
  TIMELINE_Y, TIMELINE_H,
  SUPPLIER_X, SUPPLIER_Y, CUSTOMER_X, CUSTOMER_Y,
  ENDPOINT_W, ENDPOINT_H,
  PROC_W, PROC_H,
  LANE_0_Y, LANE_1_Y, LANE_SEPARATOR_Y,
  INV_SIZE,
  USABLE_X_START, USABLE_W,
} from "./vsmCanvasLayout";

interface Props {
  state: VSMState;
  metrics: VSMMetrics;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  onIconDrop?: (type: VSMIconType, contentX: number, contentY: number) => void;
  onProcessDrop?: (contentX: number, contentY: number) => void;
  onIconMove?: (id: string, x: number, y: number) => void;
  onProcessReorder?: (processId: string, newGlobalIdx: number, newLane: 0 | 1) => void;
  selectedProcessId: string | null;
  onProcessSelect: (id: string | null) => void;
}

const C = {
  navy: "#2B4B8C",
  orange: "#F26B3A",
  muted: "#F5F4F0",
  border: "#E8E4DC",
  text: "#1A1F2E",
  textMuted: "#6B7280",
  invOrange: "#FDE68A",
  vaBlue: "#BFDBFE",
  bottleneckRed: "#FCA5A5",
  arrowGray: "#94A3B8",
};

const DRAG_THRESHOLD = 6; // px to distinguish click vs drag

// ── Layout helpers ────────────────────────────────────────────────────────────

function laneProcesses(processes: VSMProcess[], lane: 0 | 1) {
  return processes
    .map((p, i) => ({ p, origIdx: i }))
    .filter(({ p }) => (p.lane ?? 0) === lane);
}

function laneProcX(entries: { p: VSMProcess; origIdx: number }[]) {
  const n = entries.length;
  if (n === 0) return { procX: [], procCenters: [], invX: [] };
  const slotW = USABLE_W / n;
  const centers = entries.map((_, i) => USABLE_X_START + i * slotW + slotW / 2);
  const procX = centers.map((cx) => cx - PROC_W / 2);
  const invX: number[] = [
    USABLE_X_START + slotW / 4,
    ...Array.from({ length: n - 1 }, (_, i) =>
      (centers[i] + PROC_W / 2 + centers[i + 1] - PROC_W / 2) / 2
    ),
    CUSTOMER_X - 30,
  ];
  return { procX, procCenters: centers, invX };
}

/** Compute drop target from content coords */
function getDropTarget(
  contentX: number, contentY: number,
  processes: VSMProcess[], draggingId?: string
) {
  const targetLane: 0 | 1 = contentY > LANE_SEPARATOR_Y ? 1 : 0;
  // Exclude the dragging process from lane calc
  const laneProcs = processes
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => (p.lane ?? 0) === targetLane && p.id !== draggingId);

  const n = laneProcs.length;
  const slotW = n > 0 ? USABLE_W / (n + 1) : USABLE_W; // +1 for the incoming process

  let slotIdx = n;
  for (let i = 0; i <= n; i++) {
    const boundary = USABLE_X_START + i * USABLE_W / (n + 1);
    if (contentX < boundary + USABLE_W / (n + 1) / 2) {
      slotIdx = i;
      break;
    }
  }

  // X position of drop indicator line
  const indicatorX = USABLE_X_START + slotIdx * USABLE_W / (n + 1);

  // Global index to insert at
  let globalIdx: number;
  if (slotIdx >= laneProcs.length) {
    globalIdx = laneProcs.length > 0
      ? laneProcs[laneProcs.length - 1].i + 1
      : processes.length;
  } else {
    globalIdx = laneProcs[slotIdx].i;
  }

  void slotW; // suppress unused
  return { targetLane, indicatorX, globalIdx };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PushArrow({ x1, y, x2, label = "push" }: {
  x1: number; y: number; x2: number; label?: string;
}) {
  if (x2 - x1 < 6) return null;
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 7} y2={y} stroke={C.navy} strokeWidth={1.5} />
      <polygon points={`${x2},${y} ${x2 - 7},${y - 4.5} ${x2 - 7},${y + 4.5}`} fill={C.navy} />
      {label && (
        <text x={mid} y={y - 6} textAnchor="middle" fontSize={7.5} fill={C.arrowGray}>{label}</text>
      )}
    </g>
  );
}

function FlowArrow({ x1, y, x2 }: { x1: number; y: number; x2: number }) {
  if (x2 - x1 < 4) return null;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 6} y2={y} stroke={C.navy} strokeWidth={1.2} />
      <polygon points={`${x2},${y} ${x2 - 6},${y - 3.5} ${x2 - 6},${y + 3.5}`} fill={C.navy} />
    </g>
  );
}

function DashedLine({ x1, y, x2 }: { x1: number; y: number; x2: number }) {
  return (
    <line x1={x1} y1={y} x2={x2} y2={y}
      stroke={C.arrowGray} strokeWidth={1.2} strokeDasharray="5 3" />
  );
}

/**
 * Connector from a sub-process (lane 1) upward to a main process (lane 0).
 * Draws an L-shaped path if X coords differ, straight if same.
 * Arrowhead points UP at the main process bottom edge.
 */
function SubProcessConnector({ subCX, mainCX, mainLabel }: {
  subCX: number; mainCX: number; mainLabel: string;
}) {
  const fromY = LANE_1_Y;                 // top of sub-process box
  const toY   = LANE_0_Y + PROC_H;       // bottom of main process box
  const elbowY = LANE_SEPARATOR_Y;        // horizontal elbow at lane separator (315)
  const headLen = 8;
  const arrowTipY = toY;
  const lineEndY  = toY + headLen;

  const sameX = Math.abs(subCX - mainCX) < 2;

  const d = sameX
    ? `M ${subCX} ${fromY} L ${mainCX} ${lineEndY}`
    : `M ${subCX} ${fromY} L ${subCX} ${elbowY} L ${mainCX} ${elbowY} L ${mainCX} ${lineEndY}`;

  // Midpoint for label
  const labelX = sameX ? subCX + 6 : mainCX + 6;
  const labelY = sameX ? (fromY + toY) / 2 : elbowY - 4;

  return (
    <g>
      <path d={d} fill="none" stroke={C.navy} strokeWidth={1.5}
        strokeLinejoin="round" markerEnd="none" />
      {/* Arrowhead pointing up */}
      <polygon
        points={`${mainCX},${arrowTipY} ${mainCX - 5},${lineEndY} ${mainCX + 5},${lineEndY}`}
        fill={C.navy}
      />
      {/* Small "공급" label */}
      <text x={labelX} y={labelY} fontSize={7.5} fill={C.arrowGray} textAnchor="start">
        → {mainLabel}
      </text>
    </g>
  );
}

function ProcessBox({
  x, y, name, ct, co, uptime, operators,
  isBottleneck, isSelected, isDragging,
}: {
  x: number; y: number; name: string; ct: number; co: number;
  uptime: number; operators: number; isBottleneck: boolean;
  isSelected: boolean; isDragging?: boolean;
}) {
  const fill = isBottleneck ? C.bottleneckRed : C.muted;
  const stroke = isSelected ? C.navy : isBottleneck ? "#DC2626" : C.border;
  const sw = isSelected ? 2.5 : isBottleneck ? 2 : 1;
  const opacity = isDragging ? 0.25 : 1;

  return (
    <g opacity={opacity}>
      {isSelected && !isDragging && (
        <rect x={x - 4} y={y - 4} width={PROC_W + 8} height={PROC_H + 8}
          rx={10} fill="none" stroke={C.navy}
          strokeWidth={1.5} opacity={0.35} strokeDasharray="4 2" />
      )}
      <rect x={x} y={y} width={PROC_W} height={PROC_H} rx={6}
        fill={fill} stroke={stroke} strokeWidth={sw} />
      <text x={x + PROC_W / 2} y={y + 17} textAnchor="middle"
        fontSize={11} fontWeight="700" fill={C.navy}>{name}</text>
      <line x1={x} y1={y + 23} x2={x + PROC_W} y2={y + 23} stroke={C.border} strokeWidth={0.8} />
      <text x={x + PROC_W / 2} y={y + 36} textAnchor="middle" fontSize={9} fill={C.textMuted}>CT {ct}초</text>
      <text x={x + PROC_W / 2} y={y + 48} textAnchor="middle" fontSize={9} fill={C.textMuted}>C/O {co}분</text>
      <text x={x + PROC_W / 2} y={y + 60} textAnchor="middle" fontSize={9} fill={C.textMuted}>가동 {uptime}%</text>
      <text x={x + PROC_W / 2} y={y + 72} textAnchor="middle" fontSize={9} fill={C.textMuted}>작업자 {operators}명</text>
    </g>
  );
}

/** Ghost process box shown during drag */
function GhostProcessBox({ x, y, name }: { x: number; y: number; name: string }) {
  return (
    <g opacity={0.75} pointerEvents="none">
      <rect x={x} y={y} width={PROC_W} height={PROC_H} rx={6}
        fill={C.muted} stroke={C.orange} strokeWidth={2} strokeDasharray="4 2" />
      <text x={x + PROC_W / 2} y={y + 17} textAnchor="middle"
        fontSize={11} fontWeight="700" fill={C.navy}>{name}</text>
      <text x={x + PROC_W / 2} y={y + 35} textAnchor="middle" fontSize={9} fill={C.textMuted}>
        ↕ 이동 중
      </text>
    </g>
  );
}

/** Drop position indicator: vertical orange line */
function DropIndicator({ x, laneY }: { x: number; laneY: number }) {
  return (
    <g pointerEvents="none">
      <line x1={x} y1={laneY - 8} x2={x} y2={laneY + PROC_H + 8}
        stroke={C.orange} strokeWidth={2.5} strokeDasharray="4 3" opacity={0.8} />
      <polygon points={`${x},${laneY - 8} ${x - 5},${laneY - 16} ${x + 5},${laneY - 16}`}
        fill={C.orange} opacity={0.8} />
    </g>
  );
}

function InventoryTriangle({ x, y, qty, days }: {
  x: number; y: number; qty: number; days: number;
}) {
  const s = INV_SIZE;
  const pts = `${x},${y - s} ${x - s},${y + s * 0.55} ${x + s},${y + s * 0.55}`;
  return (
    <g>
      <polygon points={pts} fill={C.invOrange} stroke="#F59E0B" strokeWidth={1.5} />
      <text x={x} y={y + s * 0.55 + 13} textAnchor="middle" fontSize={9} fill={C.text}>
        {qty.toLocaleString()}개
      </text>
      <text x={x} y={y + s * 0.55 + 24} textAnchor="middle" fontSize={9} fill={C.textMuted}>
        {Math.round(days * 10) / 10}일
      </text>
    </g>
  );
}

function SupplierBox({ name }: { name: string }) {
  return (
    <g>
      <rect x={SUPPLIER_X} y={SUPPLIER_Y} width={ENDPOINT_W} height={ENDPOINT_H}
        rx={4} fill={C.muted} stroke={C.border} strokeWidth={1} />
      <text x={SUPPLIER_X + ENDPOINT_W / 2} y={SUPPLIER_Y + 20}
        textAnchor="middle" fontSize={10} fontWeight="700" fill={C.navy}>
        {name || "공급자"}
      </text>
      <text x={SUPPLIER_X + ENDPOINT_W / 2} y={SUPPLIER_Y + 34}
        textAnchor="middle" fontSize={8.5} fill={C.textMuted}>Supplier</text>
    </g>
  );
}

function CustomerBox({ name, dailyDemand }: { name: string; dailyDemand: number }) {
  return (
    <g>
      <rect x={CUSTOMER_X} y={CUSTOMER_Y} width={ENDPOINT_W} height={ENDPOINT_H}
        rx={4} fill={C.muted} stroke={C.border} strokeWidth={1} />
      <text x={CUSTOMER_X + ENDPOINT_W / 2} y={CUSTOMER_Y + 20}
        textAnchor="middle" fontSize={10} fontWeight="700" fill={C.navy}>
        {name || "고객"}
      </text>
      <text x={CUSTOMER_X + ENDPOINT_W / 2} y={CUSTOMER_Y + 34}
        textAnchor="middle" fontSize={8.5} fill={C.textMuted}>Customer</text>
      <text x={CUSTOMER_X + ENDPOINT_W / 2} y={CUSTOMER_Y + ENDPOINT_H + 14}
        textAnchor="middle" fontSize={8.5} fill={C.textMuted}>일 {dailyDemand}개</text>
    </g>
  );
}

function DroppedIconEl({
  icon, onPointerDown,
}: {
  icon: DroppedIcon;
  onPointerDown: (e: React.PointerEvent<SVGGElement>) => void;
}) {
  const IconComp = ICON_COMPONENTS[icon.type];
  const SIZE = 36;
  if (!IconComp) return null;
  return (
    <g transform={`translate(${icon.x - SIZE / 2},${icon.y - SIZE / 2})`}
      data-draggable="true" style={{ cursor: "move" }} onPointerDown={onPointerDown}>
      <svg viewBox="0 0 32 32" width={SIZE} height={SIZE} overflow="visible">
        <IconComp />
      </svg>
      {icon.label && (
        <text x={SIZE / 2} y={SIZE + 12} textAnchor="middle" fontSize={9} fill={C.textMuted}>
          {icon.label}
        </text>
      )}
    </g>
  );
}

function EmptyCanvas({ onDragOver, onDrop }: {
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border text-center px-8 bg-muted/20"
      onDragOver={onDragOver} onDrop={onDrop}>
      <div className="text-3xl mb-3">📦</div>
      <p className="text-sm font-medium text-foreground mb-1">
        좌측 사이드바에서 <span className="text-brand-orange font-semibold">공정 박스</span>를 드래그하세요
      </p>
      <p className="text-xs text-muted-foreground">캔버스에 드롭하면 새 공정이 추가됩니다</p>
    </div>
  );
}

// ── Main canvas ───────────────────────────────────────────────────────────────

export const SVGCanvas = React.forwardRef<SVGSVGElement, Props>(function SVGCanvas(
  {
    state, metrics, zoom, pan, onPanChange,
    onIconDrop, onProcessDrop, onIconMove, onProcessReorder,
    selectedProcessId, onProcessSelect,
  },
  ref
) {
  const { processes, inventories, header } = state;
  const n = processes.length;

  // ── Pointer event state refs ──
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  // Icon drag (annotation icons already on canvas)
  const draggingIconRef = useRef<{
    id: string; startClientX: number; startClientY: number;
    startX: number; startY: number;
  } | null>(null);

  // Process box drag-to-reorder
  const procDragRef = useRef<{
    id: string;
    startClientX: number; startClientY: number;
    isDragging: boolean;
  } | null>(null);

  // Visual state for ghost + drop indicator (triggers re-render)
  const [dragVisual, setDragVisual] = useState<{
    ghostX: number; ghostY: number;
    indicatorX: number; indicatorLaneY: number;
    targetLane: 0 | 1; globalIdx: number;
  } | null>(null);

  // ── Coordinate helpers ──
  function getSVGCoords(svgEl: SVGSVGElement, clientX: number, clientY: number) {
    const pt = svgEl.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const sc = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
    return { x: (sc.x - pan.x) / zoom, y: (sc.y - pan.y) / zoom };
  }

  // ── Pointer handlers ──
  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    const target = e.target as SVGElement;

    // Annotation icon drag
    if (target.closest("[data-draggable]")) return;

    // Process box: start drag tracking (don't pan yet)
    const pbEl = target.closest("[data-process-box]");
    if (pbEl) {
      const pid = pbEl.getAttribute("data-process-box")!;
      procDragRef.current = {
        id: pid,
        startClientX: e.clientX,
        startClientY: e.clientY,
        isDragging: false,
      };
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
      return;
    }

    // Pan
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    onProcessSelect(null);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    // Annotation icon drag
    if (draggingIconRef.current) {
      const ctm = e.currentTarget.getScreenCTM();
      if (!ctm) return;
      const d = draggingIconRef.current;
      onIconMove?.(d.id,
        d.startX + (e.clientX - d.startClientX) / (ctm.a * zoom),
        d.startY + (e.clientY - d.startClientY) / (ctm.d * zoom)
      );
      return;
    }

    // Process box drag
    if (procDragRef.current) {
      const dx = e.clientX - procDragRef.current.startClientX;
      const dy = e.clientY - procDragRef.current.startClientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!procDragRef.current.isDragging && dist > DRAG_THRESHOLD) {
        procDragRef.current.isDragging = true;
      }

      if (procDragRef.current.isDragging) {
        const svgEl = (ref as React.RefObject<SVGSVGElement>).current;
        if (!svgEl) return;
        const { x: cx, y: cy } = getSVGCoords(svgEl, e.clientX, e.clientY);
        const { targetLane, indicatorX, globalIdx } = getDropTarget(cx, cy, processes, procDragRef.current.id);
        const laneY = targetLane === 1 ? LANE_1_Y : LANE_0_Y;
        setDragVisual({
          ghostX: cx - PROC_W / 2,
          ghostY: laneY,
          indicatorX,
          indicatorLaneY: laneY,
          targetLane,
          globalIdx,
        });
      }
      return;
    }

    // Pan
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    onPanChange({ x: panStartRef.current.px + dx, y: panStartRef.current.py + dy });
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    // Process box: reorder or select
    if (procDragRef.current) {
      if (procDragRef.current.isDragging && dragVisual) {
        onProcessReorder?.(procDragRef.current.id, dragVisual.globalIdx, dragVisual.targetLane);
      } else if (!procDragRef.current.isDragging) {
        // Was a click — select/deselect
        const pid = procDragRef.current.id;
        onProcessSelect(selectedProcessId === pid ? null : pid);
      }
      procDragRef.current = null;
      setDragVisual(null);
      return;
    }
    isPanningRef.current = false;
    draggingIconRef.current = null;
    void e;
  }

  function handleIconPointerDown(e: React.PointerEvent<SVGGElement>, iconId: string) {
    e.stopPropagation();
    const icon = (state.droppedIcons ?? []).find((i) => i.id === iconId);
    if (!icon) return;
    draggingIconRef.current = {
      id: iconId, startClientX: e.clientX, startClientY: e.clientY,
      startX: icon.x, startY: icon.y,
    };
    (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
  }

  function handleSVGDrop(e: React.DragEvent<SVGSVGElement>) {
    e.preventDefault();
    const svgEl = (ref as React.RefObject<SVGSVGElement>)?.current;
    if (!svgEl) return;
    const itemType = e.dataTransfer.getData("vsm-item-type") || e.dataTransfer.getData("text/plain");
    if (!itemType) return;
    const coords = getSVGCoords(svgEl, e.clientX, e.clientY);
    if (itemType === "process-box") {
      onProcessDrop?.(coords.x, coords.y);
    } else {
      onIconDrop?.(itemType as VSMIconType, coords.x, coords.y);
    }
  }

  // Empty state
  if (n === 0) {
    return (
      <EmptyCanvas
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.getData("vsm-item-type") === "process-box")
            onProcessDrop?.(W / 2, LANE_0_Y + PROC_H / 2);
        }}
      />
    );
  }

  // ── Lane layouts ──
  const lane0 = laneProcesses(processes, 0);
  const lane1 = laneProcesses(processes, 1);
  const { procX: l0X, procCenters: l0C, invX: l0InvX } = laneProcX(lane0);

  // Build a map: lane-0 processId → center X
  const mainCenterByProcId = new Map<string, number>();
  lane0.forEach(({ p }, i) => mainCenterByProcId.set(p.id, l0C[i]));

  // Sub-process layouts: determine each sub-process X based on its connection target.
  // Multiple subs pointing to the same main → spread them horizontally around that X.
  interface SubLayout {
    p: VSMProcess;
    origIdx: number;
    subCX: number;    // center X of the sub-process box
    mainCX: number | null; // connected main process center X (null if unconnected)
    mainName: string;
  }

  // Group sub-processes by their target processId
  const groupByTarget = new Map<string, typeof lane1>();
  for (const entry of lane1) {
    const key = entry.p.connectsToProcessId ?? "__none__";
    if (!groupByTarget.has(key)) groupByTarget.set(key, []);
    groupByTarget.get(key)!.push(entry);
  }

  // Compute final positions
  const subLayouts: SubLayout[] = [];
  let freeSlot = 0; // for unconnected subs
  for (const [targetId, group] of groupByTarget) {
    const mainCX = targetId !== "__none__" ? (mainCenterByProcId.get(targetId) ?? null) : null;
    const mainName = targetId !== "__none__"
      ? (lane0.find(({ p }) => p.id === targetId)?.p.name ?? "")
      : "";
    const count = group.length;
    group.forEach(({ p, origIdx }, i) => {
      let subCX: number;
      if (mainCX !== null) {
        // Spread around main process center (gap = PROC_W + 12)
        const totalWidth = (count - 1) * (PROC_W + 12);
        subCX = mainCX - totalWidth / 2 + i * (PROC_W + 12);
      } else {
        // No connection — place in available free slots across the canvas
        const freeCount = groupByTarget.get("__none__")?.length ?? 1;
        const gap = USABLE_W / (freeCount + 1);
        subCX = USABLE_X_START + gap * (freeSlot + 1);
        freeSlot++;
      }
      subLayouts.push({ p, origIdx, subCX, mainCX, mainName });
    });
    if (targetId === "__none__") freeSlot = 0; // reset (already iterated)
  }

  const flowY0 = LANE_0_Y + PROC_H / 2;

  // Timeline
  const totalVAT = metrics.vatSeconds;
  const totalLTSeconds = metrics.totalLTDays * header.workingSeconds;
  const timelineW = CUSTOMER_X - SUPPLIER_X - ENDPOINT_W;
  const timelineX = SUPPLIER_X + ENDPOINT_W;

  // Dragging process id for ghost
  const draggingProcId = dragVisual ? procDragRef.current?.id : null;
  const draggingProc = draggingProcId ? processes.find(p => p.id === draggingProcId) : null;

  return (
    <div className="overflow-hidden bg-white flex-1">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ minWidth: 700, cursor: dragVisual ? "grabbing" : "grab", touchAction: "none", display: "block" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleSVGDrop}
      >
        <rect width={W} height={H} fill="white" />

        <g id="vsm-content" transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

          {/* ── Zone backgrounds ─────────────────────────────── */}
          <rect x={0} y={INFO_ZONE_Y} width={W} height={INFO_ZONE_H} fill="#EFF6FF" opacity={0.55} />
          <text x={8} y={INFO_ZONE_Y + 14} fontSize={9} fill="#94A3B8">▸ 정보 흐름 구역</text>
          <text x={8} y={MATERIAL_ZONE_Y + 14} fontSize={9} fill="#94A3B8">▸ 물류 흐름 구역</text>

          {lane1.length > 0 && (
            <>
              <line x1={0} y1={LANE_SEPARATOR_Y} x2={W} y2={LANE_SEPARATOR_Y}
                stroke={C.border} strokeWidth={1} strokeDasharray="8 4" />
              <rect x={0} y={LANE_SEPARATOR_Y} width={W}
                height={TIMELINE_Y - LANE_SEPARATOR_Y - 10} fill="#FFF7ED" opacity={0.45} />
              <text x={8} y={LANE_SEPARATOR_Y + 14} fontSize={9} fill="#D97706" fontWeight="600">
                ↳ 서브 공정 흐름
              </text>
            </>
          )}

          <rect x={0} y={TIMELINE_Y - 10} width={W} height={TIMELINE_H + 10} fill="#FFFBEB" opacity={0.65} />

          {/* Zone dividers */}
          <line x1={0} y1={MATERIAL_ZONE_Y} x2={W} y2={MATERIAL_ZONE_Y}
            stroke={C.border} strokeWidth={0.5} strokeDasharray="6 4" />
          <line x1={0} y1={TIMELINE_Y - 10} x2={W} y2={TIMELINE_Y - 10}
            stroke={C.border} strokeWidth={0.5} strokeDasharray="6 4" />

          {/* ── Title ─────────────────────────────────────────── */}
          <text x={W / 2} y={INFO_ZONE_Y - 10} textAnchor="middle"
            fontSize={12} fontWeight="700" fill={C.navy}>
            {state.mode === "current" ? "현재상태 (Current State)" : "미래상태 (Future State)"} VSM
          </text>

          {/* ── Supplier / Customer ──────────────────────────── */}
          <SupplierBox name={header.supplierName} />
          <CustomerBox name={header.customerName} dailyDemand={header.dailyDemand} />
          <PushArrow x1={CUSTOMER_X - 44} y={CUSTOMER_Y + 22} x2={CUSTOMER_X - 2} label="납품" />

          {/* ── Lane 0: Main flow ───────────────────────────── */}
          {lane0.length > 0 && (() => {
            const n0 = lane0.length;
            return (
              <>
                {/* Supplier → first inventory */}
                <DashedLine x1={SUPPLIER_X + ENDPOINT_W} y={flowY0} x2={l0InvX[0] - INV_SIZE - 4} />

                {/* Process boxes */}
                {lane0.map(({ p, origIdx }, i) => (
                  <g key={p.id} data-process-box={p.id}
                    style={{ cursor: draggingProcId ? "grabbing" : "grab" }}>
                    <ProcessBox
                      x={l0X[i]} y={LANE_0_Y}
                      name={p.name} ct={p.cycleTime} co={p.changeoverTime}
                      uptime={p.uptime} operators={p.operators}
                      isBottleneck={metrics.processMetrics[origIdx].isBottleneck}
                      isSelected={selectedProcessId === p.id}
                      isDragging={p.id === draggingProcId}
                    />
                    {/* Invisible larger hit area for easier grabbing */}
                    <rect x={l0X[i] - 4} y={LANE_0_Y - 4}
                      width={PROC_W + 8} height={PROC_H + 8}
                      fill="transparent" rx={8} />
                  </g>
                ))}

                {/* Inventory triangles */}
                {l0InvX.map((ix, i) => {
                  const invEntry = lane0[i];
                  const invIdx = invEntry?.origIdx ?? i;
                  return (
                    <InventoryTriangle key={`inv0-${i}`}
                      x={ix} y={flowY0}
                      qty={inventories[invIdx]?.quantity ?? 0}
                      days={metrics.inventoryDays[invIdx] ?? 0}
                    />
                  );
                })}

                {/* Arrows: inventory → process (left side) */}
                {lane0.map((_, i) => (
                  <FlowArrow key={`i2p-${i}`}
                    x1={l0InvX[i] + INV_SIZE + 4} y={flowY0} x2={l0X[i]} />
                ))}

                {/* Arrows: process → next inventory (right side) */}
                {lane0.map((_, i) => (
                  <PushArrow key={`p2i-${i}`}
                    x1={l0X[i] + PROC_W} y={flowY0}
                    x2={l0InvX[i + 1] - INV_SIZE - 4} />
                ))}

                {/* Last inventory → customer */}
                <FlowArrow x1={l0InvX[n0] + INV_SIZE + 4} y={flowY0} x2={CUSTOMER_X} />
              </>
            );
          })()}

          {/* ── Lane 1: Sub-processes (each connected to a specific main process) ── */}
          {lane1.length > 0 && (
            <>
              {subLayouts.map(({ p, origIdx, subCX, mainCX, mainName }) => {
                const subX = subCX - PROC_W / 2;
                return (
                  <g key={p.id}>
                    {/* Connector arrow to main process */}
                    {mainCX !== null ? (
                      <SubProcessConnector subCX={subCX} mainCX={mainCX} mainLabel={mainName} />
                    ) : (
                      /* Unconnected indicator */
                      <text x={subCX} y={LANE_1_Y - 8} textAnchor="middle"
                        fontSize={8} fill="#D97706">
                        ⚠ 연결 없음
                      </text>
                    )}
                    {/* Process box (draggable) */}
                    <g data-process-box={p.id}
                      style={{ cursor: draggingProcId ? "grabbing" : "grab" }}>
                      <ProcessBox
                        x={subX} y={LANE_1_Y}
                        name={p.name} ct={p.cycleTime} co={p.changeoverTime}
                        uptime={p.uptime} operators={p.operators}
                        isBottleneck={metrics.processMetrics[origIdx].isBottleneck}
                        isSelected={selectedProcessId === p.id}
                        isDragging={p.id === draggingProcId}
                      />
                      {/* Invisible hit area */}
                      <rect x={subX - 4} y={LANE_1_Y - 4}
                        width={PROC_W + 8} height={PROC_H + 8}
                        fill="transparent" rx={8} />
                    </g>
                  </g>
                );
              })}
            </>
          )}

          {/* ── Drop indicator & ghost (during process drag) ─── */}
          {dragVisual && draggingProc && (
            <>
              <DropIndicator
                x={dragVisual.indicatorX}
                laneY={dragVisual.indicatorLaneY}
              />
              <GhostProcessBox
                x={dragVisual.ghostX}
                y={dragVisual.ghostY}
                name={draggingProc.name}
              />
              {/* Lane hint badge */}
              <rect x={dragVisual.ghostX} y={dragVisual.ghostY + PROC_H + 6}
                width={PROC_W} height={16} rx={4}
                fill={dragVisual.targetLane === 0 ? C.navy : "#D97706"} opacity={0.85} />
              <text x={dragVisual.ghostX + PROC_W / 2}
                y={dragVisual.ghostY + PROC_H + 17}
                textAnchor="middle" fontSize={8} fill="white" fontWeight="600">
                {dragVisual.targetLane === 0 ? "→ 주공정 흐름" : "→ 서브 공정"}
              </text>
            </>
          )}

          {/* ── Timeline (lane 0) ────────────────────────────── */}
          {lane0.length > 0 && (
            <>
              <line x1={timelineX} y1={TIMELINE_Y}
                x2={timelineX + timelineW} y2={TIMELINE_Y} stroke={C.border} strokeWidth={1} />
              {(() => {
                let curX = timelineX;
                return lane0.map(({ origIdx }, i) => {
                  const segDays = metrics.inventoryDays[origIdx] ?? 0;
                  const segW = totalLTSeconds > 0
                    ? (segDays * header.workingSeconds / totalLTSeconds) * timelineW : 0;
                  const invRect = (
                    <g key={`tl-inv-${i}`}>
                      <rect x={curX} y={TIMELINE_Y - 20} width={Math.max(segW, 2)} height={20}
                        fill={C.invOrange} opacity={0.7} />
                      <text x={curX + segW / 2} y={TIMELINE_Y - 7}
                        textAnchor="middle" fontSize={8} fill={C.text}>
                        {Math.round(segDays * 10) / 10}d
                      </text>
                    </g>
                  );
                  curX += segW;
                  const va = processes[origIdx].cycleTime;
                  const vaW = totalLTSeconds > 0 ? (va / totalLTSeconds) * timelineW : 0;
                  const vaRect = (
                    <g key={`tl-va-${i}`}>
                      <rect x={curX} y={TIMELINE_Y - 20} width={Math.max(vaW, 2)} height={20}
                        fill={C.vaBlue} opacity={0.8} />
                      <text x={curX + vaW / 2} y={TIMELINE_Y - 7}
                        textAnchor="middle" fontSize={8} fill={C.navy}>
                        {processes[origIdx].cycleTime}s
                      </text>
                    </g>
                  );
                  curX += vaW;
                  return [invRect, vaRect];
                });
              })()}
              {/* Last inventory */}
              {(() => {
                const lastLane0 = lane0[lane0.length - 1];
                const lastInvIdx = lastLane0.origIdx + 1;
                const lastDays = metrics.inventoryDays[lastInvIdx] ?? 0;
                return (
                  <g>
                    <rect
                      x={(() => {
                        let cx = timelineX;
                        for (const { origIdx } of lane0) {
                          cx += totalLTSeconds > 0
                            ? ((metrics.inventoryDays[origIdx] ?? 0) * header.workingSeconds / totalLTSeconds) * timelineW
                            : 0;
                          cx += totalLTSeconds > 0
                            ? (processes[origIdx].cycleTime / totalLTSeconds) * timelineW
                            : 0;
                        }
                        return cx;
                      })()}
                      y={TIMELINE_Y - 20}
                      width={Math.max(
                        totalLTSeconds > 0
                          ? (lastDays * header.workingSeconds / totalLTSeconds) * timelineW
                          : 0,
                        2
                      )}
                      height={20}
                      fill={C.invOrange} opacity={0.7}
                    />
                  </g>
                );
              })()}
              <text x={timelineX} y={TIMELINE_Y + 18} fontSize={9} fontWeight="700" fill={C.text}>
                LT = {Math.round(metrics.totalLTDays * 10) / 10}일
              </text>
              <text x={timelineX + timelineW} y={TIMELINE_Y + 18} fontSize={9}
                textAnchor="end" fill={C.navy}>VAT = {totalVAT}초</text>
            </>
          )}

          {/* ── Dropped annotation icons ─────────────────────── */}
          {(state.droppedIcons ?? []).map((icon) => (
            <DroppedIconEl key={icon.id} icon={icon}
              onPointerDown={(e) => handleIconPointerDown(e, icon.id)} />
          ))}
        </g>

        {/* ── Legend (fixed) ──────────────────────────────────── */}
        <rect x={W - 220} y={H - 56} width={12} height={12} fill={C.invOrange} opacity={0.7} />
        <text x={W - 204} y={H - 47} fontSize={8} fill={C.textMuted}>재공 대기</text>
        <rect x={W - 160} y={H - 56} width={12} height={12} fill={C.vaBlue} opacity={0.8} />
        <text x={W - 144} y={H - 47} fontSize={8} fill={C.textMuted}>부가가치 시간</text>
        <rect x={W - 220} y={H - 36} width={12} height={12} fill={C.bottleneckRed} />
        <text x={W - 204} y={H - 27} fontSize={8} fill={C.textMuted}>병목 공정</text>
        <text x={W - 100} y={H - 27} fontSize={8} fill={C.textMuted}>드래그: 이동/재배치</text>
      </svg>
    </div>
  );
});
