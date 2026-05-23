"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { computeHistogram, computeNormalCurve } from "@/lib/spc/histogram";
import { useMemo } from "react";

interface CapabilityChartProps {
  data: number[];
  mean: number;
  stdDev: number;
  lsl?: number;
  target?: number;
  usl?: number;
}

interface ChartDatum {
  x: number;
  count?: number;
  within?: number;
}

export default function CapabilityChart({
  data,
  mean,
  stdDev,
  lsl,
  target,
  usl,
}: CapabilityChartProps) {
  const { merged, domain, yMax } = useMemo(() => {
    const bins = computeHistogram(data);
    const curve = computeNormalCurve(mean, stdDev, bins, data.length);

    // 히스토그램 빈 → 맵
    const binMap = new Map<number, number>();
    for (const bin of bins) {
      binMap.set(parseFloat(bin.xMid.toFixed(6)), bin.count);
    }

    // 정규곡선 포인트 → 맵
    const curveMap = new Map<number, number>();
    for (const pt of curve) {
      curveMap.set(parseFloat(pt.x.toFixed(6)), pt.within ?? 0);
    }

    // 모든 x 포인트 합치기
    const allX = Array.from(
      new Set([...binMap.keys(), ...curveMap.keys()])
    ).sort((a, b) => a - b);

    const merged: ChartDatum[] = allX.map((x) => ({
      x,
      count: binMap.get(x),
      within: curveMap.get(x),
    }));

    // x 범위
    const xValues = allX;
    if (lsl != null) xValues.push(lsl);
    if (usl != null) xValues.push(usl);
    if (target != null) xValues.push(target);
    const pad = stdDev * 0.5;
    const xMin = Math.min(...xValues) - pad;
    const xMax = Math.max(...xValues) + pad;

    const maxCount = Math.max(0, ...bins.map((b) => b.count));
    const maxCurve = Math.max(0, ...curve.map((c) => c.within ?? 0));
    const yMax = Math.max(maxCount, maxCurve) * 1.2;

    return { merged, domain: [xMin, xMax] as [number, number], yMax };
  }, [data, mean, stdDev, lsl, target, usl]);

  if (data.length < 2) return null;

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={merged} margin={{ top: 16, right: 24, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
          <XAxis
            dataKey="x"
            type="number"
            domain={domain}
            tickCount={8}
            tickFormatter={(v: number) => v.toFixed(3)}
            tick={{ fontSize: 11 }}
            scale="linear"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            domain={[0, yMax]}
            label={{
              value: "빈도",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fontSize: 11,
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = typeof value === "number" ? value : Number(value);
              if (name === "빈도") return [v, "개수"];
              if (name === "정규곡선") return [v.toFixed(3), "정규곡선"];
              return [value, name];
            }}
            labelFormatter={(label) => `x = ${Number(label).toFixed(4)}`}
          />
          <Legend />

          {/* 히스토그램 */}
          <Bar dataKey="count" name="빈도" fill="#2B4B8C" fillOpacity={0.65} />

          {/* 정규곡선 */}
          <Line
            dataKey="within"
            name="정규곡선"
            stroke="#F26B3A"
            strokeWidth={2.5}
            dot={false}
            type="monotone"
            connectNulls
            legendType="line"
          />

          {/* LSL */}
          {lsl != null && (
            <ReferenceLine
              x={lsl}
              stroke="#DC2626"
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{ value: "LSL", position: "insideTopLeft", fill: "#DC2626", fontSize: 11 }}
            />
          )}

          {/* Target */}
          {target != null && (
            <ReferenceLine
              x={target}
              stroke="#16A34A"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{ value: "Target", position: "insideTopLeft", fill: "#16A34A", fontSize: 11 }}
            />
          )}

          {/* USL */}
          {usl != null && (
            <ReferenceLine
              x={usl}
              stroke="#DC2626"
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{ value: "USL", position: "insideTopRight", fill: "#DC2626", fontSize: 11 }}
            />
          )}

          {/* 평균선 */}
          <ReferenceLine
            x={mean}
            stroke="#2B4B8C"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            label={{ value: "X̄", position: "insideTopRight", fill: "#2B4B8C", fontSize: 11 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
