"use client";

import type { CapabilityResult } from "@/lib/spc/statistics";
import { cpkGrade, GRADE_COLORS } from "@/lib/spc/statistics";
import CapabilityChart from "./CapabilityChart";

interface Props {
  result: CapabilityResult;
  data: number[];
  characteristicName: string;
}

function fmt(v: number | undefined, digits = 4): string {
  if (v == null) return "—";
  return v.toFixed(digits);
}

function fmtPPM(v: number | undefined): string {
  if (v == null) return "—";
  return v.toFixed(2);
}

function IndexRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex justify-between py-0.5 ${highlight ? "font-bold" : ""}`}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-xs font-mono ${highlight ? "text-brand-navy font-bold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function CpkValue({ value }: { value: number | undefined }) {
  const grade = cpkGrade(value);
  const colorClass = GRADE_COLORS[grade];
  return (
    <span className={`font-bold font-mono text-lg ${colorClass}`}>
      {value != null ? value.toFixed(4) : "—"}
    </span>
  );
}

function PPMSection({
  title,
  below,
  above,
  total,
  hasLsl,
  hasUsl,
}: {
  title: string;
  below?: number;
  above?: number;
  total?: number;
  hasLsl: boolean;
  hasUsl: boolean;
}) {
  return (
    <div className="border border-border rounded-lg p-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="space-y-1">
        {hasLsl && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">PPM {"<"} LSL</span>
            <span className="font-mono">{fmtPPM(below)}</span>
          </div>
        )}
        {hasUsl && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">PPM {">"} USL</span>
            <span className="font-mono">{fmtPPM(above)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-semibold border-t border-border pt-1 mt-1">
          <span className="text-muted-foreground">PPM Total</span>
          <span className="font-mono">{fmtPPM(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CapabilityResultView({ result, data, characteristicName }: Props) {
  return (
    <div id="capability-result" className="space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-extrabold text-brand-navy">
          공정능력 분석: {characteristicName || "결과"}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Minitab 호환 공정능력 분석
        </p>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_180px] gap-4">
        {/* Left: Process Data */}
        <div className="bg-background-soft border border-border rounded-xl p-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Process Data
          </p>
          {result.lsl != null && <IndexRow label="LSL" value={String(result.lsl)} />}
          {result.target != null && <IndexRow label="Target" value={String(result.target)} />}
          {result.usl != null && <IndexRow label="USL" value={String(result.usl)} />}
          {result.lsl == null && result.usl != null && (
            <p className="text-[10px] text-muted-foreground italic mt-1">단측 규격 (상한만)</p>
          )}
          {result.usl == null && result.lsl != null && (
            <p className="text-[10px] text-muted-foreground italic mt-1">단측 규격 (하한만)</p>
          )}
          <div className="border-t border-border my-2" />
          <IndexRow label="Sample Mean" value={fmt(result.mean, 5)} />
          <IndexRow label="Sample N" value={String(result.n)} />
          <IndexRow label="StDev(Within)" value={fmt(result.stdDev, 6)} />
          <IndexRow label="StDev(Overall)" value={fmt(result.stdDev, 6)} />
          {result.sigmaLevel != null && (
            <>
              <div className="border-t border-border my-2" />
              <IndexRow label="Sigma Level" value={fmt(result.sigmaLevel, 2)} highlight />
            </>
          )}
        </div>

        {/* Center: Chart */}
        <div id="capability-chart" className="border border-border rounded-xl p-4">
          <CapabilityChart
            data={data}
            mean={result.mean}
            stdDev={result.stdDev}
            lsl={result.lsl}
            target={result.target}
            usl={result.usl}
          />
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-4 h-0.5 bg-brand-orange" />
              Within
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-4 h-0.5 bg-foreground opacity-50" style={{ borderTop: "2px dashed" }} />
              Overall
            </div>
          </div>
        </div>

        {/* Right: Capability Indices */}
        <div className="space-y-3">
          {/* Within */}
          <div className="bg-background-soft border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              잠재 능력 (Within)
            </p>
            <div className="space-y-0.5">
              {result.lsl != null && result.usl != null && (
                <IndexRow label="Cp" value={fmt(result.cp)} />
              )}
              {result.lsl != null && <IndexRow label="CPL" value={fmt(result.cpl)} />}
              {result.usl != null && <IndexRow label="CPU" value={fmt(result.cpu)} />}
              <div className="border-t border-border my-1" />
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-semibold">Cpk</span>
                <CpkValue value={result.cpk} />
              </div>
            </div>
          </div>

          {/* Overall */}
          <div className="bg-background-soft border border-border rounded-xl p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              전체 능력 (Overall)
            </p>
            <div className="space-y-0.5">
              {result.lsl != null && result.usl != null && (
                <IndexRow label="Pp" value={fmt(result.pp)} />
              )}
              {result.lsl != null && <IndexRow label="PPL" value={fmt(result.ppl)} />}
              {result.usl != null && <IndexRow label="PPU" value={fmt(result.ppu)} />}
              <div className="border-t border-border my-1" />
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-semibold">Ppk</span>
                <CpkValue value={result.ppk} />
              </div>
              {result.cpm != null && (
                <IndexRow label="Cpm" value={fmt(result.cpm)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PPM section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PPMSection
          title="관측 성과"
          below={result.obs_ppm_below}
          above={result.obs_ppm_above}
          total={result.obs_ppm_total}
          hasLsl={result.lsl != null}
          hasUsl={result.usl != null}
        />
        <PPMSection
          title="예상 성과 (Within)"
          below={result.exp_within_ppm_below}
          above={result.exp_within_ppm_above}
          total={result.exp_within_ppm_total}
          hasLsl={result.lsl != null}
          hasUsl={result.usl != null}
        />
        <PPMSection
          title="예상 성과 (Overall)"
          below={result.exp_overall_ppm_below}
          above={result.exp_overall_ppm_above}
          hasLsl={result.lsl != null}
          hasUsl={result.usl != null}
          total={result.exp_overall_ppm_total}
        />
      </div>
    </div>
  );
}
