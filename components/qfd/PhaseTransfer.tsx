"use client";

import { ArrowDown } from "lucide-react";
import type { QFDPhase } from "./HOQMatrix";

interface PhaseTransferProps {
  fromPhase: QFDPhase;
  fromLabel: string;
  toLabel: string;
  onTransfer: (newWhats: QFDPhase["whats"]) => void;
}

export function PhaseTransfer({ fromPhase, fromLabel, toLabel, onTransfer }: PhaseTransferProps) {
  const hows = fromPhase.hows.filter((h) => h.label.trim());

  if (hows.length === 0) return null;

  function handleTransfer() {
    onTransfer(
      hows.map((h) => ({
        id: Math.random().toString(36).slice(2, 9),
        label: h.label,
        importance: 3,
      }))
    );
  }

  return (
    <div className="my-6 flex flex-col items-center gap-3">
      <div className="w-full max-w-md bg-background-soft border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {fromLabel} HOWs → {toLabel} WHATs 이전
        </p>
        <ul className="space-y-1 mb-4">
          {hows.map((h) => (
            <li key={h.id} className="text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
              {h.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleTransfer}
          className="w-full flex items-center justify-center gap-2 bg-brand-navy text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-brand-navy-dark transition-colors"
        >
          <ArrowDown className="h-4 w-4" />
          {fromLabel} 특성을 {toLabel} 요구사항으로 가져오기
        </button>
      </div>
      <ArrowDown className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
