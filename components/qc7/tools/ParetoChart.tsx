"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import ToolShell from "../ToolShell";
import { exportPareto } from "@/lib/qc7/excelExporter";

interface Row {
  id: number;
  name: string;
  count: string;
}
let nextId = 1;

export default function ParetoChart() {
  const [rows, setRows] = useState<Row[]>([
    { id: nextId++, name: "치수 불량", count: "45" },
    { id: nextId++, name: "외관 스크래치", count: "30" },
    { id: nextId++, name: "도장 불량", count: "15" },
    { id: nextId++, name: "기타", count: "10" },
  ]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const addRow = () => setRows((prev) => [...prev, { id: nextId++, name: "", count: "" }]);
  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id: number, field: keyof Row, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const validRows = rows
    .filter((r) => r.name.trim() && parseFloat(r.count) > 0)
    .map((r) => ({ name: r.name.trim(), count: parseFloat(r.count) }))
    .sort((a, b) => b.count - a.count);

  const total = validRows.reduce((s, r) => s + r.count, 0);
  let cumulative = 0;
  const chartData = validRows.map((r) => {
    cumulative += r.count;
    return { name: r.name, count: r.count, cumPct: +((cumulative / total) * 100).toFixed(1) };
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let chartBase64: string | undefined;
      if (chartRef.current) {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        chartBase64 = canvas.toDataURL("image/png").split(",")[1];
      }
      await exportPareto(chartData, chartBase64);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="파레토 차트 (Pareto Chart)"
      badge="QC 7가지 도구 ③"
      description="불량 유형별 빈도를 내림차순으로 표시하고 누적 비율을 함께 보여줍니다. '80:20 법칙'으로 중요한 소수 문제를 파악합니다."
      iatfClause="10.2.1 부적합 및 시정 조치"
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || chartData.length === 0}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          {/* Input table */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="text-left px-4 py-3">항목명</th>
                  <th className="text-left px-4 py-3 w-32">빈도 수</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-2">
                      <input
                        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-navy"
                        placeholder="항목명"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, "name", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-navy"
                        placeholder="0"
                        value={row.count}
                        onChange={(e) => updateRow(row.id, "count", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => removeRow(row.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addRow}
            className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all"
          >
            <Plus className="h-4 w-4" /> 항목 추가
          </button>

          {chartData.length >= 2 && (
            <div ref={chartRef} className="bg-white border border-border rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 40, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value, name) => name === "누적 %" ? `${value}%` : value} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="빈도" fill="#2B4B8C" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" dataKey="cumPct" name="누적 %" type="monotone" stroke="#F26B3A" strokeWidth={2} dot={{ r: 3 }} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#F26B3A" strokeDasharray="4 2" label={{ value: "80%", position: "right", fontSize: 10 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      }
    />
  );
}
