"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import ToolShell from "../ToolShell";
import { exportStratification } from "@/lib/qc7/excelExporter";

const GROUP_COLORS = ["#2B4B8C", "#F26B3A", "#16A34A", "#CA8A04", "#9333EA"];

interface Group {
  id: number;
  name: string;
  text: string;
}
let nextId = 1;

function parseNumbers(text: string): number[] {
  return text.split(/[\s,;\t\n]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
}

export default function Stratification() {
  const [groups, setGroups] = useState<Group[]>([
    { id: nextId++, name: "A 공급업체", text: "30.1 29.8 30.3 30.0 29.9" },
    { id: nextId++, name: "B 공급업체", text: "30.5 30.7 30.4 30.8 30.6" },
  ]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const addGroup = () => {
    if (groups.length >= 5) return;
    setGroups((prev) => [...prev, { id: nextId++, name: `그룹 ${prev.length + 1}`, text: "" }]);
  };
  const removeGroup = (id: number) => setGroups((prev) => prev.filter((g) => g.id !== id));
  const updateGroup = (id: number, field: keyof Group, value: string) =>
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));

  const parsed = groups.map((g) => ({ name: g.name, data: parseNumbers(g.text) }));

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let chartBase64: string | undefined;
      if (chartRef.current) {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        chartBase64 = canvas.toDataURL("image/png").split(",")[1];
      }
      await exportStratification(parsed, chartBase64);
    } finally {
      setDownloading(false);
    }
  };

  const hasData = parsed.some((g) => g.data.length > 0);

  return (
    <ToolShell
      title="층별 (Stratification)"
      badge="QC 7가지 도구 ⑥"
      description="데이터를 공급업체, 설비, 작업자 등 층(층별 인자)으로 나누어 차이를 비교합니다. 문제의 원인 층을 파악하는 데 활용합니다."
      iatfClause="9.1.3 분석 및 평가"
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || !hasData}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          <div className="space-y-3">
            {groups.map((group, gi) => (
              <div key={group.id} className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: GROUP_COLORS[gi % GROUP_COLORS.length] }}
                  />
                  <input
                    className="border border-border rounded-lg px-2.5 py-1.5 text-sm font-semibold focus:outline-none focus:border-brand-navy w-40"
                    value={group.name}
                    onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                    placeholder="그룹명"
                  />
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  className="w-full h-20 border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy resize-none"
                  placeholder="데이터 입력 (공백/쉼표로 구분, Excel 붙여넣기 가능)"
                  value={group.text}
                  onChange={(e) => updateGroup(group.id, "text", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">{parseNumbers(group.text).length}개 인식</p>
              </div>
            ))}
          </div>

          {groups.length < 5 && (
            <button
              onClick={addGroup}
              className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all"
            >
              <Plus className="h-4 w-4" /> 그룹 추가 (최대 5개)
            </button>
          )}

          {hasData && (
            <div ref={chartRef} className="bg-white border border-border rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                  <XAxis dataKey="index" type="number" name="순서" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="value" type="number" name="값" domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  {parsed.map((g, gi) => (
                    <Scatter
                      key={gi}
                      name={g.name}
                      data={g.data.map((value, index) => ({ index, value }))}
                      fill={GROUP_COLORS[gi % GROUP_COLORS.length]}
                      fillOpacity={0.7}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      }
    />
  );
}
