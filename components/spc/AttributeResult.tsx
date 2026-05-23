"use client";

import type { AttributeCapabilityResult } from "@/lib/spc/statistics";
import { cpkGrade, GRADE_COLORS, GRADE_BG } from "@/lib/spc/statistics";

interface Props {
  result: AttributeCapabilityResult;
  characteristicName: string;
}

function MetricCard({
  label,
  value,
  sub,
  colorClass,
}: {
  label: string;
  value: string;
  sub?: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-background-soft border border-border rounded-xl p-4 flex flex-col gap-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-2xl font-extrabold font-mono leading-none ${colorClass ?? "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AttributeResult({ result, characteristicName }: Props) {
  const grade = cpkGrade(result.cpkEquivalent);
  const cpkColorClass = GRADE_COLORS[grade];
  const gradeBg = GRADE_BG[grade];

  const gradeLabel: Record<string, string> = {
    excellent: "우수 (≥ 1.67)",
    good: "합격 (≥ 1.33)",
    warning: "주의 (≥ 1.00)",
    fail: "불합격 (< 1.00)",
    none: "계산 불가",
  };

  return (
    <div id="capability-result" className="space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-3 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-brand-navy">
            공정능력 분석 (계수형): {characteristicName || "결과"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            이항분포 기반 · Sigma Level = Φ⁻¹(1 − p̄)
          </p>
        </div>
        <span className={`text-xs font-semibold rounded-full px-3 py-1 ${gradeBg}`}>
          {gradeLabel[grade]}
        </span>
      </div>

      {/* Input summary */}
      <div className="bg-background-soft border border-border rounded-xl p-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          검사 요약
        </p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">총 검사 수</span>
            <span className="font-mono text-xs font-semibold">{result.n.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">불량 수</span>
            <span className="font-mono text-xs font-semibold">{result.defects.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">양품 수</span>
            <span className="font-mono text-xs font-semibold">{(result.n - result.defects).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="불량률 (p̄)"
          value={result.defectRatePct.toFixed(4) + " %"}
          sub={`${result.defects} / ${result.n}`}
        />
        <MetricCard
          label="DPMO"
          value={result.dpmo.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          sub="백만 개당 불량"
        />
        <MetricCard
          label="Sigma Level"
          value={result.sigmaLevel.toFixed(2) + " σ"}
          sub="Z = Φ⁻¹(1 − p̄)"
          colorClass="text-brand-navy"
        />
        <MetricCard
          label="Cpk 등가"
          value={result.cpkEquivalent.toFixed(4)}
          sub="Sigma Level ÷ 3"
          colorClass={cpkColorClass}
        />
      </div>

      {/* Visual bar */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Sigma Level 위치</p>
        <div className="relative h-5 rounded-full overflow-hidden bg-gradient-to-r from-red-300 via-yellow-200 via-blue-200 to-green-300">
          {/* marker */}
          {(() => {
            const pct = Math.min(100, Math.max(0, (result.sigmaLevel / 6) * 100));
            return (
              <div
                className="absolute top-0 h-full w-1 bg-brand-navy rounded-full shadow"
                style={{ left: `calc(${pct}% - 2px)` }}
              />
            );
          })()}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0 σ</span>
          <span>2 σ</span>
          <span>3 σ</span>
          <span>4 σ</span>
          <span>6 σ</span>
        </div>
      </div>
    </div>
  );
}
