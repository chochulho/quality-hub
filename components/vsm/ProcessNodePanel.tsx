"use client";

import { X, Trash2, AlertTriangle, CheckCircle2, Link2, Unlink } from "lucide-react";
import type { VSMProcess, VSMInventory, ProcessMetrics } from "@/lib/vsm/types";

interface ProcessNodePanelProps {
  process: VSMProcess | null;
  inventoryBefore: VSMInventory | null;
  processMetrics: ProcessMetrics | null;
  taktTime: number;
  isFutureMode: boolean;
  /** All lane-0 processes — used for sub-process connection selector */
  mainProcesses: VSMProcess[];
  onProcessChange: (updated: VSMProcess) => void;
  onInventoryChange: (updated: VSMInventory) => void;
  onClose: () => void;
  onDelete: () => void;
}

function Field({
  label,
  unit,
  value,
  min = 0,
  step = 1,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 rounded-lg border border-border bg-white px-2 py-1 text-right text-sm tabular-nums focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy/20"
        />
        <span className="text-xs text-muted-foreground w-8">{unit}</span>
      </div>
    </div>
  );
}

export function ProcessNodePanel({
  process,
  inventoryBefore,
  processMetrics,
  taktTime,
  isFutureMode,
  mainProcesses,
  onProcessChange,
  onInventoryChange,
  onClose,
  onDelete,
}: ProcessNodePanelProps) {
  const isOpen = process !== null;

  function update(fields: Partial<VSMProcess>) {
    if (!process) return;
    onProcessChange({ ...process, ...fields });
  }

  function updateInventory(fields: Partial<VSMInventory>) {
    if (!inventoryBefore) return;
    onInventoryChange({ ...inventoryBefore, ...fields });
  }

  const isBottleneck = processMetrics?.isBottleneck ?? false;
  const effCT = processMetrics ? Math.round(processMetrics.effectiveCT * 10) / 10 : null;
  const ratio = processMetrics ? Math.round(processMetrics.bottleneckRatio * 100) / 100 : null;

  return (
    <div
      className={`border-l border-border bg-white flex flex-col overflow-hidden transition-all duration-200 ease-in-out ${
        isOpen ? "w-[280px] min-w-[280px] opacity-100" : "w-0 min-w-0 opacity-0 pointer-events-none"
      }`}
    >
      {isOpen && process && (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
            <input
              type="text"
              value={process.name}
              onChange={(e) => update({ name: e.target.value })}
              className="flex-1 min-w-0 text-sm font-semibold text-brand-navy bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-navy/20 rounded px-1 -mx-1"
              placeholder="공정명"
            />
            <button
              onClick={onDelete}
              title="공정 삭제"
              className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              title="닫기"
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Metrics badges */}
          {processMetrics && (
            <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
              {isBottleneck ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  병목 공정
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  정상
                </span>
              )}
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                isBottleneck
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-brand-navy/5 border-brand-navy/20 text-brand-navy"
              }`}>
                효과CT {effCT}s
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                ratio !== null && ratio > 1
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-muted border-border text-muted-foreground"
              }`}>
                CT/TT = {ratio}
              </span>
            </div>
          )}

          {/* Lane toggle */}
          <div className="px-3 pt-2 pb-2 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">흐름 위치</p>
            <div className="flex gap-1.5">
              {([
                { value: 0, label: "주공정 흐름", desc: "상단 직렬 연결" },
                { value: 1, label: "서브 공정", desc: "하단 별도 행" },
              ] as const).map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => update({ lane: value })}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                    (process.lane ?? 0) === value
                      ? value === 0
                        ? "border-brand-navy bg-brand-navy/5 text-brand-navy"
                        : "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-border text-muted-foreground hover:border-brand-navy/30"
                  }`}
                >
                  <div className="text-[10px] font-semibold">{label}</div>
                  <div className="text-[9px] opacity-70">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-process connection (lane 1 only) */}
          {(process.lane ?? 0) === 1 && (
            <div className="px-3 pt-2 pb-2 border-b border-border bg-blue-50/40">
              <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Link2 className="h-2.5 w-2.5" />
                연결 주공정
              </p>
              {mainProcesses.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">
                  주공정(Lane 0)이 없습니다. 먼저 주공정을 추가하세요.
                </p>
              ) : (
                <>
                  <select
                    value={process.connectsToProcessId ?? ""}
                    onChange={(e) =>
                      update({ connectsToProcessId: e.target.value || undefined })
                    }
                    className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy/20"
                  >
                    <option value="">-- 연결 공정 선택 --</option>
                    {mainProcesses.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name}
                      </option>
                    ))}
                  </select>
                  {!process.connectsToProcessId ? (
                    <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-0.5">
                      <Unlink className="h-2.5 w-2.5" />
                      공정을 선택하면 연결 화살표가 표시됩니다
                    </p>
                  ) : (
                    <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-0.5">
                      <Link2 className="h-2.5 w-2.5" />
                      &ldquo;{mainProcesses.find((m) => m.id === process.connectsToProcessId)?.name}&rdquo; 공정으로 공급
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Process fields */}
          <div className="px-3 pt-1 pb-2 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">공정 정보</p>
            <Field
              label="사이클 타임 (CT)"
              unit="초"
              value={process.cycleTime}
              min={1}
              onChange={(v) => update({ cycleTime: v })}
            />
            <Field
              label="교체 준비 (C/O)"
              unit="분"
              value={process.changeoverTime}
              min={0}
              onChange={(v) => update({ changeoverTime: v })}
            />
            <Field
              label="가동률"
              unit="%"
              value={process.uptime}
              min={1}
              step={5}
              onChange={(v) => update({ uptime: Math.min(100, v) })}
            />
            <Field
              label="작업자"
              unit="명"
              value={process.operators}
              min={1}
              onChange={(v) => update({ operators: v })}
            />
            <Field
              label="교대"
              unit="회"
              value={process.shifts}
              min={1}
              onChange={(v) => update({ shifts: v })}
            />
          </div>

          {/* Inventory before this process */}
          {inventoryBefore && (
            <div className="px-3 pt-2 pb-2 border-b border-border bg-amber-50/40">
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">
                ▲ 이전 재공 재고
              </p>
              <Field
                label="재공 수량"
                unit="개"
                value={inventoryBefore.quantity}
                min={0}
                step={100}
                onChange={(v) => updateInventory({ quantity: v })}
              />
              {isFutureMode && (
                <Field
                  label="목표 수량"
                  unit="개"
                  value={inventoryBefore.targetQuantity ?? inventoryBefore.quantity}
                  min={0}
                  step={100}
                  onChange={(v) => updateInventory({ targetQuantity: v })}
                />
              )}
            </div>
          )}

          {/* Future mode targets */}
          {isFutureMode && (
            <div className="px-3 pt-2 pb-2 border-b border-border bg-brand-orange/5">
              <p className="text-[10px] font-semibold text-brand-orange uppercase tracking-wide mb-1">
                ✦ 미래상태 목표
              </p>
              <Field
                label="목표 CT"
                unit="초"
                value={process.targetCycleTime ?? process.cycleTime}
                min={1}
                onChange={(v) => update({ targetCycleTime: v })}
              />
              <Field
                label="목표 가동률"
                unit="%"
                value={process.targetUptime ?? process.uptime}
                min={1}
                step={5}
                onChange={(v) => update({ targetUptime: Math.min(100, v) })}
              />
            </div>
          )}

          {/* Help text */}
          <div className="px-3 pt-2 mt-auto">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              캔버스의 다른 곳을 클릭하면 패널이 닫힙니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
