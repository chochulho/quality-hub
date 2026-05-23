"use client";

import type { VSMMetrics } from "@/lib/vsm/types";

interface Props {
  metrics: VSMMetrics;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  warn?: boolean;
}

function StatCard({ label, value, sub, highlight, warn }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${warn ? "border-destructive/40 bg-destructive/5" : highlight ? "border-brand-orange/30 bg-brand-orange/5" : "border-border bg-white"}`}>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-extrabold ${warn ? "text-destructive" : highlight ? "text-brand-orange" : "text-brand-navy"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function MetricsSummary({ metrics }: Props) {
  const { taktTime, totalLTDays, vatSeconds, nvaRatio, bottleneckProcess, bottleneckRatio } = metrics;

  const vatMin = vatSeconds >= 60 ? `${Math.floor(vatSeconds / 60)}분 ${vatSeconds % 60}초` : `${vatSeconds}초`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="택트타임"
        value={`${Math.round(taktTime * 10) / 10}초`}
        sub="workingSeconds ÷ 수요"
        highlight
      />
      <StatCard
        label="총 리드타임"
        value={`${Math.round(totalLTDays * 10) / 10}일`}
        sub="재고 대기 포함"
      />
      <StatCard
        label="부가가치 시간"
        value={vatMin}
        sub="Σ 공정 CT"
      />
      <StatCard
        label="NVA 비율"
        value={`${Math.round(nvaRatio * 10) / 10}%`}
        sub="낭비 비율 (낮을수록 좋음)"
        warn={nvaRatio > 90}
      />
      <StatCard
        label="병목 공정"
        value={bottleneckProcess}
        sub={`유효CT / TT = ${Math.round(bottleneckRatio * 100) / 100}`}
        warn={bottleneckRatio > 1}
      />
      <StatCard
        label="VA 효율"
        value={`${Math.round((100 - nvaRatio) * 10) / 10}%`}
        sub="VA시간 / 리드타임"
      />
    </div>
  );
}
