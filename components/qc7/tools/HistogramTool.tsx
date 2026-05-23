"use client";

import { useState, useRef } from "react";
import { Download } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import ToolShell from "../ToolShell";
import { computeHistogram } from "@/lib/spc/histogram";
import { exportHistogram } from "@/lib/qc7/excelExporter";

function parseData(text: string): number[] {
  return text
    .split(/[\s,;\t]+/)
    .map((s) => parseFloat(s.replace(/,/g, ".")))
    .filter((n) => !isNaN(n));
}

function normalPDF(x: number, mean: number, std: number) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

export default function HistogramTool() {
  const [rawText, setRawText] = useState("");
  const [data, setData] = useState<number[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    const nums = parseData(text);
    if (nums.length > 0) {
      setData(nums);
      setRawText(text);
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    setData(parseData(e.target.value));
  };

  const bins = data.length >= 4 ? computeHistogram(data) : [];
  const mean = data.length ? data.reduce((a, b) => a + b) / data.length : 0;
  const std = data.length > 1
    ? Math.sqrt(data.reduce((s, v) => s + (v - mean) ** 2, 0) / (data.length - 1))
    : 0;

  const binWidth = bins.length > 1 ? bins[1].xMid - bins[0].xMid : 1;
  const chartData = bins.map((b) => ({
    x: b.xMid.toFixed(3),
    count: b.count,
    curve: std > 0 ? +(normalPDF(b.xMid, mean, std) * data.length * binWidth).toFixed(3) : 0,
  }));

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let chartBase64: string | undefined;
      if (chartRef.current) {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        chartBase64 = canvas.toDataURL("image/png").split(",")[1];
      }
      await exportHistogram(data, bins.map((b) => ({ x: b.xMid, count: b.count })), chartBase64);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="히스토그램 (Histogram)"
      badge="QC 7가지 도구 ②"
      description="측정 데이터의 분포 형태를 시각화합니다. 공정 산포와 이상 분포를 파악하는 데 사용합니다."
      iatfClause="9.1.1 모니터링, 측정, 분석 및 평가"
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || data.length < 4}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              데이터 입력 (Excel에서 복사·붙여넣기)
            </label>
            <textarea
              className="w-full h-28 border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy resize-none"
              placeholder="숫자를 입력하거나 Excel 열을 붙여넣으세요&#10;예: 30.1  29.8  30.3  30.0 ..."
              value={rawText}
              onChange={handleChange}
              onPaste={handlePaste}
            />
            {data.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {data.length}개 인식 · 평균 {mean.toFixed(3)} · StDev {std.toFixed(3)}
              </p>
            )}
          </div>

          {chartData.length > 0 && (
            <div ref={chartRef} className="bg-white border border-border rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                  <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="빈도" fill="#2B4B8C" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                  <Line dataKey="curve" name="정규곡선" type="monotone" stroke="#F26B3A" strokeWidth={2} dot={false} />
                  <ReferenceLine x={mean.toFixed(3)} stroke="#F26B3A" strokeDasharray="4 2" label={{ value: "평균", position: "top", fontSize: 10 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.length > 0 && data.length < 4 && (
            <p className="text-sm text-muted-foreground">히스토그램을 그리려면 최소 4개 이상의 데이터가 필요합니다.</p>
          )}
        </div>
      }
    />
  );
}
