"use client";

import { useState, useRef } from "react";
import { Download } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import ToolShell from "../ToolShell";
import { pearsonCorrelation, linearRegression } from "@/lib/qc7/statistics";
import { exportScatter } from "@/lib/qc7/excelExporter";

function parseColumn(text: string): number[] {
  return text.split(/[\s,;\t\n]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
}

function interpretR(r: number): string {
  const abs = Math.abs(r);
  const dir = r >= 0 ? "양의" : "음의";
  if (abs >= 0.9) return `강한 ${dir} 상관관계`;
  if (abs >= 0.7) return `높은 ${dir} 상관관계`;
  if (abs >= 0.4) return `중간 ${dir} 상관관계`;
  if (abs >= 0.2) return `약한 ${dir} 상관관계`;
  return "상관관계 없음";
}

export default function ScatterPlot() {
  const [xLabel, setXLabel] = useState("X 변수");
  const [yLabel, setYLabel] = useState("Y 변수");
  const [xText, setXText] = useState("");
  const [yText, setYText] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const xs = parseColumn(xText);
  const ys = parseColumn(yText);
  const n = Math.min(xs.length, ys.length);
  const pairXs = xs.slice(0, n);
  const pairYs = ys.slice(0, n);

  const r = n >= 2 ? pearsonCorrelation(pairXs, pairYs) : 0;
  const reg = n >= 2 ? linearRegression(pairXs, pairYs) : { slope: 0, intercept: 0 };

  const scatterData = pairXs.map((x, i) => ({ x, y: pairYs[i] }));

  const minX = n ? Math.min(...pairXs) : 0;
  const maxX = n ? Math.max(...pairXs) : 1;
  const lineData = [
    { x: minX, y: reg.slope * minX + reg.intercept },
    { x: maxX, y: reg.slope * maxX + reg.intercept },
  ];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let chartBase64: string | undefined;
      if (chartRef.current) {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        chartBase64 = canvas.toDataURL("image/png").split(",")[1];
      }
      await exportScatter(xLabel, yLabel, pairXs, pairYs, r, reg.slope, reg.intercept, chartBase64);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="산포도 (Scatter Diagram)"
      badge="QC 7가지 도구 ⑤"
      description="두 변수 간의 관계를 점으로 표시합니다. Pearson 상관계수(r)와 회귀선으로 상관 강도를 정량화합니다."
      iatfClause="9.1.3 분석 및 평가"
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || n < 2}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex gap-2 mb-1.5">
                <label className="text-sm font-semibold text-foreground">X 변수</label>
                <input
                  className="border border-border rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-brand-navy w-28"
                  placeholder="변수명"
                  value={xLabel}
                  onChange={(e) => setXLabel(e.target.value)}
                />
              </div>
              <textarea
                className="w-full h-32 border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy resize-none"
                placeholder="X 데이터 (한 행에 하나씩 또는 붙여넣기)"
                value={xText}
                onChange={(e) => setXText(e.target.value)}
              />
            </div>
            <div>
              <div className="flex gap-2 mb-1.5">
                <label className="text-sm font-semibold text-foreground">Y 변수</label>
                <input
                  className="border border-border rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-brand-navy w-28"
                  placeholder="변수명"
                  value={yLabel}
                  onChange={(e) => setYLabel(e.target.value)}
                />
              </div>
              <textarea
                className="w-full h-32 border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy resize-none"
                placeholder="Y 데이터 (X와 같은 순서로)"
                value={yText}
                onChange={(e) => setYText(e.target.value)}
              />
            </div>
          </div>

          {n >= 2 && (
            <>
              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground">Pearson r</p>
                  <p className="text-xl font-extrabold text-brand-navy">{r.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">{interpretR(r)}</p>
                </div>
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground">회귀식</p>
                  <p className="text-sm font-semibold text-foreground">
                    y = {reg.slope.toFixed(3)}x {reg.intercept >= 0 ? "+" : "−"} {Math.abs(reg.intercept).toFixed(3)}
                  </p>
                </div>
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground">데이터 쌍</p>
                  <p className="text-xl font-extrabold text-brand-navy">{n}</p>
                </div>
              </div>

              {/* Chart */}
              <div ref={chartRef} className="bg-white border border-border rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                    <XAxis dataKey="x" type="number" name={xLabel} domain={["auto", "auto"]} tick={{ fontSize: 10 }} label={{ value: xLabel, position: "insideBottom", offset: -4, fontSize: 11 }} />
                    <YAxis dataKey="y" type="number" name={yLabel} domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={scatterData} fill="#2B4B8C" fillOpacity={0.7} />
                    <Line data={lineData} dataKey="y" stroke="#F26B3A" strokeWidth={2} dot={false} legendType="none" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      }
    />
  );
}
