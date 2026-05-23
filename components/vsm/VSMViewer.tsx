"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Download, RefreshCw, BarChart3, ChevronDown, RotateCcw, ImageDown, Minus, Plus } from "lucide-react";
import type { VSMState, VSMIconType, VSMProcess, VSMInventory } from "@/lib/vsm/types";
import { calcVSMMetrics, makeSampleState } from "@/lib/vsm/vsmMetrics";
import { exportVSM } from "@/lib/vsm/vsmExporter";
import { exportVSMMap } from "@/lib/vsm/vsmSvgExporter";
import { getInsertionIndex } from "./vsmCanvasLayout";
import { SVGCanvas } from "./SVGCanvas";
import { MetricsSummary } from "./MetricsSummary";
import { VSMSidebar } from "./VSMSidebar";
import { ProcessNodePanel } from "./ProcessNodePanel";
import type { VSMSidebarItemType } from "@/lib/vsm/types";

// Header-only editor extracted from ProcessEditor
function HeaderEditor({ state, onChange }: { state: VSMState; onChange: (s: VSMState) => void }) {
  function updateHeader(key: keyof typeof state.header, value: string | number) {
    onChange({ ...state, header: { ...state.header, [key]: value } });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "공급자명", key: "supplierName" as const, type: "text" },
        { label: "고객명", key: "customerName" as const, type: "text" },
        { label: "일 수요 (개)", key: "dailyDemand" as const, type: "number" },
        { label: "가용 근무시간 (초)", key: "workingSeconds" as const, type: "number" },
      ].map(({ label, key, type }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground font-medium">{label}</label>
          <input
            type={type}
            value={state.header[key]}
            min={type === "number" ? 1 : undefined}
            onChange={(e) =>
              updateHeader(key, type === "number" ? Number(e.target.value) : e.target.value)
            }
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy/20"
          />
        </div>
      ))}
    </div>
  );
}

export function VSMViewer() {
  const [state, setState] = useState<VSMState>(() => ({ ...makeSampleState(), droppedIcons: [] }));
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const metrics = useMemo(() => calcVSMMetrics(state), [state]);

  // Non-passive wheel listener for zoom
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(3, Math.max(0.3, z * (e.deltaY < 0 ? 1.1 : 1 / 1.1))));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // ── Exports ─────────────────────────────────────────────────────────────────

  async function handleExcelExport() {
    setExporting(true);
    try {
      await exportVSM(state);
    } finally {
      setExporting(false);
    }
  }

  function handleSvgExport() {
    if (!svgRef.current) return;
    const mode = state.mode === "current" ? "현재상태" : "미래상태";
    exportVSMMap(svgRef.current, `VSM_${mode}_${new Date().toISOString().slice(0, 10)}.svg`);
  }

  // ── Mode & view ──────────────────────────────────────────────────────────────

  function toggleMode() {
    setState((s) => ({ ...s, mode: s.mode === "current" ? "future" : "current" }));
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  // ── Drag & drop handlers ─────────────────────────────────────────────────────

  // Called when sidebar dragStart fires — we just let the dataTransfer handle it inside VSMSidebar
  const handleSidebarDragStart = useCallback(
    (_type: VSMSidebarItemType, _e: React.DragEvent<HTMLDivElement>) => {
      // dataTransfer already set inside VSMSidebar; nothing more needed here
    },
    []
  );

  // Icon (annotation) drop onto canvas
  const handleIconDrop = useCallback(
    (iconType: VSMIconType, contentX: number, contentY: number) => {
      setState((s) => ({
        ...s,
        droppedIcons: [
          ...(s.droppedIcons ?? []),
          { id: `icon-${Date.now()}`, type: iconType, x: contentX, y: contentY },
        ],
      }));
    },
    []
  );

  // Process box drop → insert new process at correct position
  const handleProcessDrop = useCallback(
    (contentX: number, _contentY: number) => {
      setState((s) => {
        const insertIdx = getInsertionIndex(contentX, s.processes.length);
        const newProcess: VSMProcess = {
          id: `p${Date.now()}`,
          name: `공정 ${s.processes.length + 1}`,
          cycleTime: 60,
          changeoverTime: 10,
          uptime: 90,
          operators: 1,
          shifts: 1,
        };
        const newInventory: VSMInventory = {
          id: `i${Date.now() + 1}`,
          quantity: 480,
        };
        const newProcesses = [...s.processes];
        newProcesses.splice(insertIdx, 0, newProcess);
        const newInventories = [...s.inventories];
        newInventories.splice(insertIdx + 1, 0, newInventory);

        // Open right panel immediately
        setTimeout(() => setSelectedProcessId(newProcess.id), 0);

        return { ...s, processes: newProcesses, inventories: newInventories };
      });
    },
    []
  );

  // Mobile "add process" button
  function handleAddProcess() {
    setState((s) => {
      const newProcess: VSMProcess = {
        id: `p${Date.now()}`,
        name: `공정 ${s.processes.length + 1}`,
        cycleTime: 60,
        changeoverTime: 10,
        uptime: 90,
        operators: 1,
        shifts: 1,
      };
      const newInventory: VSMInventory = {
        id: `i${Date.now() + 1}`,
        quantity: 480,
      };
      setTimeout(() => setSelectedProcessId(newProcess.id), 0);
      return {
        ...s,
        processes: [...s.processes, newProcess],
        inventories: [...s.inventories, newInventory],
      };
    });
    setMobilePaletteOpen(false);
  }

  function handleIconMove(id: string, x: number, y: number) {
    setState((s) => ({
      ...s,
      droppedIcons: (s.droppedIcons ?? []).map((icon) =>
        icon.id === id ? { ...icon, x, y } : icon
      ),
    }));
  }

  // ── Selected process derived data ────────────────────────────────────────────

  const selectedProcessIdx = useMemo(
    () => state.processes.findIndex((p) => p.id === selectedProcessId),
    [state.processes, selectedProcessId]
  );
  const selectedProcess = selectedProcessIdx >= 0 ? state.processes[selectedProcessIdx] : null;
  const selectedInventory = selectedProcessIdx >= 0 ? state.inventories[selectedProcessIdx] : null;
  const selectedProcessMetrics =
    selectedProcessIdx >= 0 ? metrics.processMetrics[selectedProcessIdx] : null;

  function handleProcessChange(updated: VSMProcess) {
    setState((s) => ({
      ...s,
      processes: s.processes.map((p) => (p.id === updated.id ? updated : p)),
    }));
  }

  function handleInventoryChange(updated: VSMInventory) {
    setState((s) => ({
      ...s,
      inventories: s.inventories.map((inv) => (inv.id === updated.id ? updated : inv)),
    }));
  }

  function handleDeleteProcess() {
    if (!selectedProcessId) return;
    const idx = state.processes.findIndex((p) => p.id === selectedProcessId);
    if (idx < 0) return;
    setState((s) => ({
      ...s,
      processes: s.processes.filter((p) => p.id !== selectedProcessId),
      inventories: s.inventories.filter((_, i) => i !== idx + 1),
    }));
    setSelectedProcessId(null);
  }

  // Drag-to-reorder process boxes on the canvas
  const handleProcessReorder = useCallback(
    (processId: string, newGlobalIdx: number, newLane: 0 | 1) => {
      setState((s) => {
        const oldIdx = s.processes.findIndex((p) => p.id === processId);
        if (oldIdx < 0) return s;

        const newProcesses = [...s.processes];
        const newInventories = [...s.inventories];

        // Update lane on the process being moved
        newProcesses[oldIdx] = { ...newProcesses[oldIdx], lane: newLane };

        // If position also changes, splice it into the new slot
        if (oldIdx !== newGlobalIdx) {
          const [proc] = newProcesses.splice(oldIdx, 1);
          // Inventory index mirrors process index (inventories[i] sits before processes[i])
          const [inv] = newInventories.splice(oldIdx, 1);
          // Adjust target index for the removed element
          const insertAt = oldIdx < newGlobalIdx ? newGlobalIdx - 1 : newGlobalIdx;
          newProcesses.splice(insertAt, 0, proc);
          newInventories.splice(insertAt, 0, inv);
        }

        return { ...s, processes: newProcesses, inventories: newInventories };
      });
    },
    []
  );

  return (
    <div className="flex flex-col gap-0">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-200 ${
            state.mode === "current"
              ? "border-brand-navy text-brand-navy bg-brand-navy/5 hover:bg-brand-navy/10"
              : "border-brand-orange text-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          {state.mode === "current" ? "현재상태" : "미래상태"}
          <span className="text-xs opacity-60">(전환)</span>
        </button>

        {/* Sample reset */}
        <button
          onClick={() => {
            setState({ ...makeSampleState(), droppedIcons: [] });
            setSelectedProcessId(null);
          }}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-brand-navy/40 transition-all duration-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          예시 불러오기
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 rounded-full border border-border px-1 py-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z / 1.2))}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetView}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="뷰 초기화"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleSvgExport}
            className="flex items-center gap-1.5 rounded-full border border-brand-navy text-brand-navy px-4 py-2 text-sm font-semibold hover:bg-brand-navy/5 transition-all duration-200"
          >
            <ImageDown className="h-4 w-4" />
            맵 내보내기 (SVG)
          </button>
          <button
            onClick={handleExcelExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-semibold hover:bg-brand-orange/90 disabled:opacity-50 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            {exporting ? "내보내는 중..." : "데이터 (Excel)"}
          </button>
        </div>
      </div>

      {/* ── Metrics ──────────────────────────────────────────────────────────── */}
      <MetricsSummary metrics={metrics} />

      {/* ── Main 3-column: Sidebar + Canvas + Panel ──────────────────────────── */}
      <div className="flex mt-3 rounded-2xl border border-border overflow-hidden bg-white" style={{ minHeight: 420 }}>
        {/* Left sidebar — desktop only */}
        <VSMSidebar
          className="hidden lg:flex"
          onDragStart={handleSidebarDragStart}
        />

        {/* Canvas — flex-1 */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <SVGCanvas
            ref={svgRef}
            state={state}
            metrics={metrics}
            zoom={zoom}
            pan={pan}
            onPanChange={setPan}
            onIconDrop={handleIconDrop}
            onProcessDrop={handleProcessDrop}
            onIconMove={handleIconMove}
            onProcessReorder={handleProcessReorder}
            selectedProcessId={selectedProcessId}
            onProcessSelect={setSelectedProcessId}
          />
        </div>

        {/* Right panel — slides in when process selected */}
        <ProcessNodePanel
          process={selectedProcess}
          inventoryBefore={selectedInventory}
          processMetrics={selectedProcessMetrics}
          taktTime={metrics.taktTime}
          isFutureMode={state.mode === "future"}
          mainProcesses={state.processes.filter((p) => (p.lane ?? 0) === 0)}
          onProcessChange={handleProcessChange}
          onInventoryChange={handleInventoryChange}
          onClose={() => setSelectedProcessId(null)}
          onDelete={handleDeleteProcess}
        />
      </div>

      {/* ── Mobile sidebar ────────────────────────────────────────────────────── */}
      <VSMSidebar
        className="lg:hidden"
        isMobile
        mobileOpen={mobilePaletteOpen}
        onMobileToggle={() => setMobilePaletteOpen((o) => !o)}
        onDragStart={handleSidebarDragStart}
        onAddProcess={handleAddProcess}
      />

      {/* ── Reference line ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3">
        <span>
          택트타임 <strong className="text-brand-navy">{Math.round(metrics.taktTime * 10) / 10}초</strong>
        </span>
        <span>
          병목:{" "}
          <strong className={metrics.bottleneckRatio > 1 ? "text-destructive" : "text-brand-navy"}>
            {metrics.bottleneckProcess}
          </strong>
          {" "}(유효CT / TT = {Math.round(metrics.bottleneckRatio * 100) / 100})
        </span>
        {state.mode === "future" && (
          <span className="text-brand-orange font-medium">
            미래상태 — 목표 CT·재고 입력 시 개선 효과가 자동 계산됩니다
          </span>
        )}
        <span className="text-muted-foreground/60 ml-auto hidden lg:block">
          공정 박스를 클릭하면 상세 편집 패널이 열립니다
        </span>
      </div>

      {/* ── Collapsible: 기본 정보 (header editor) ────────────────────────────── */}
      <details className="rounded-2xl border border-border bg-muted/20 overflow-hidden mt-3">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-muted/40 transition-colors list-none">
          <span className="text-sm font-semibold text-brand-navy">기본 정보 (공급자·고객·수요)</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </summary>
        <div className="p-4 border-t border-border">
          <HeaderEditor state={state} onChange={setState} />
        </div>
      </details>
    </div>
  );
}
