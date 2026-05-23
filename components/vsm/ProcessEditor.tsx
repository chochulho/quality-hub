"use client";

import { Plus, Trash2 } from "lucide-react";
import type { VSMState, VSMProcess, VSMInventory } from "@/lib/vsm/types";

interface Props {
  state: VSMState;
  onChange: (state: VSMState) => void;
}

function numInput(
  value: number,
  onChange: (n: number) => void,
  { min = 0, step = 1, className = "" }: { min?: number; step?: number; className?: string } = {}
) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full rounded-lg border border-border bg-white px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-orange/40 ${className}`}
    />
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function ProcessEditor({ state, onChange }: Props) {
  function updateHeader(key: keyof typeof state.header, value: string | number) {
    onChange({ ...state, header: { ...state.header, [key]: value } });
  }

  function updateProcess(id: string, key: keyof VSMProcess, value: string | number) {
    onChange({
      ...state,
      processes: state.processes.map((p) => p.id === id ? { ...p, [key]: value } : p),
    });
  }

  function updateInventory(id: string, key: keyof VSMInventory, value: number) {
    onChange({
      ...state,
      inventories: state.inventories.map((inv) => inv.id === id ? { ...inv, [key]: value } : inv),
    });
  }

  function addProcess() {
    const newId = `p${Date.now()}`;
    const invId = `i${Date.now() + 1}`;
    onChange({
      ...state,
      processes: [...state.processes, {
        id: newId, name: `공정 ${state.processes.length + 1}`,
        cycleTime: 60, changeoverTime: 10, uptime: 90, operators: 1, shifts: 1,
      }],
      inventories: [...state.inventories, { id: invId, quantity: 480 }],
    });
  }

  function removeProcess(id: string) {
    const idx = state.processes.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const newProcesses = state.processes.filter((p) => p.id !== id);
    // Remove the inventory AFTER this process (idx+1), keep others
    const newInventories = state.inventories.filter((_, i) => i !== idx + 1);
    onChange({ ...state, processes: newProcesses, inventories: newInventories });
  }

  const isFuture = state.mode === "future";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">기본 정보</h3>
        <div className="grid grid-cols-2 gap-3">
          <LabeledField label="공급자">
            <input
              type="text"
              value={state.header.supplierName}
              onChange={(e) => updateHeader("supplierName", e.target.value)}
              className="rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </LabeledField>
          <LabeledField label="고객">
            <input
              type="text"
              value={state.header.customerName}
              onChange={(e) => updateHeader("customerName", e.target.value)}
              className="rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </LabeledField>
          <LabeledField label="일 수요 (pcs)">
            {numInput(state.header.dailyDemand, (n) => updateHeader("dailyDemand", n), { min: 1 })}
          </LabeledField>
          <LabeledField label="가용 근무시간 (초)">
            {numInput(state.header.workingSeconds, (n) => updateHeader("workingSeconds", n), { min: 1 })}
          </LabeledField>
        </div>
      </section>

      {/* Processes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">공정 목록</h3>
          <button
            onClick={addProcess}
            disabled={state.processes.length >= 6}
            className="flex items-center gap-1 text-xs text-brand-orange hover:text-brand-navy disabled:opacity-40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            공정 추가
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {state.processes.map((p, i) => (
            <div key={p.id} className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => updateProcess(p.id, "name", e.target.value)}
                  className="text-sm font-semibold text-brand-navy bg-transparent border-b border-transparent hover:border-border focus:border-brand-orange focus:outline-none w-full"
                />
                {state.processes.length > 1 && (
                  <button onClick={() => removeProcess(p.id)} className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Inventory before this process */}
              <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[10px] text-amber-700 font-medium mb-1">
                  전 재공 (공정 {i + 1} 앞)
                </p>
                <div className="flex gap-2">
                  <LabeledField label="현재 재공 (pcs)">
                    {numInput(state.inventories[i].quantity, (n) => updateInventory(state.inventories[i].id, "quantity", n), { min: 0 })}
                  </LabeledField>
                  {isFuture && (
                    <LabeledField label="목표 재공 (pcs)">
                      {numInput(state.inventories[i].targetQuantity ?? 0, (n) => updateInventory(state.inventories[i].id, "targetQuantity", n), { min: 0 })}
                    </LabeledField>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <LabeledField label="CT (초)">
                  {numInput(p.cycleTime, (n) => updateProcess(p.id, "cycleTime", n), { min: 1 })}
                </LabeledField>
                <LabeledField label="C/O (분)">
                  {numInput(p.changeoverTime, (n) => updateProcess(p.id, "changeoverTime", n), { min: 0 })}
                </LabeledField>
                <LabeledField label="가동률 (%)">
                  {numInput(p.uptime, (n) => updateProcess(p.id, "uptime", n), { min: 1, step: 5 })}
                </LabeledField>
                <LabeledField label="작업자">
                  {numInput(p.operators, (n) => updateProcess(p.id, "operators", n), { min: 1 })}
                </LabeledField>
                <LabeledField label="교대">
                  {numInput(p.shifts, (n) => updateProcess(p.id, "shifts", n), { min: 1 })}
                </LabeledField>
                {isFuture && (
                  <LabeledField label="목표 CT (초)">
                    {numInput(p.targetCycleTime ?? p.cycleTime, (n) => updateProcess(p.id, "targetCycleTime", n), { min: 1 })}
                  </LabeledField>
                )}
              </div>
            </div>
          ))}

          {/* Final inventory (after last process) */}
          {state.processes.length > 0 && (() => {
            const lastInv = state.inventories[state.processes.length];
            return (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[10px] text-amber-700 font-medium mb-2">완제품 재고 (FG)</p>
                <div className="flex gap-2">
                  <LabeledField label="현재 재고 (pcs)">
                    {numInput(lastInv.quantity, (n) => updateInventory(lastInv.id, "quantity", n), { min: 0 })}
                  </LabeledField>
                  {isFuture && (
                    <LabeledField label="목표 재고 (pcs)">
                      {numInput(lastInv.targetQuantity ?? 0, (n) => updateInventory(lastInv.id, "targetQuantity", n), { min: 0 })}
                    </LabeledField>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
