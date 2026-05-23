"use client";

import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import ToolShell from "../ToolShell";
import { exportRelations } from "@/lib/qc7/excelExporter";

export default function RelationsDiagram() {
  const [factors, setFactors] = useState(["납기 지연", "재작업 발생", "검사 누락", "원자재 불량"]);
  const [matrix, setMatrix] = useState<boolean[][]>(() =>
    Array(4).fill(null).map(() => Array(4).fill(false))
  );
  const [newFactor, setNewFactor] = useState("");
  const [downloading, setDownloading] = useState(false);

  const addFactor = () => {
    const name = newFactor.trim();
    if (!name || factors.length >= 8) return;
    setFactors((prev) => [...prev, name]);
    setMatrix((prev) => {
      const n = prev.length;
      const updated = prev.map((row) => [...row, false]);
      updated.push(Array(n + 1).fill(false));
      return updated;
    });
    setNewFactor("");
  };

  const removeFactor = (idx: number) => {
    setFactors((prev) => prev.filter((_, i) => i !== idx));
    setMatrix((prev) =>
      prev.filter((_, i) => i !== idx).map((row) => row.filter((_, j) => j !== idx))
    );
  };

  const toggleCell = (i: number, j: number) => {
    if (i === j) return;
    setMatrix((prev) =>
      prev.map((row, ri) => row.map((cell, ci) => (ri === i && ci === j ? !cell : cell)))
    );
  };

  const outCounts = factors.map((_, i) => matrix[i]?.reduce((s, v) => s + (v ? 1 : 0), 0) ?? 0);
  const inCounts = factors.map((_, j) => matrix.reduce((s, row) => s + (row[j] ? 1 : 0), 0));
  const scores = outCounts.map((o, i) => o - inCounts[i]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportRelations(factors, matrix, outCounts);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="연관도 (Relations Diagram)"
      badge="신 QC 7가지 도구 ②"
      description="요인 간의 원인-결과 관계를 행렬로 분석합니다. 출력 화살표가 많은 요인이 핵심 원인(Key Driver)입니다."
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || factors.length < 2}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          {/* Add factor */}
          <div className="flex gap-2">
            <input
              className="flex-1 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              placeholder="요인 추가 (최대 8개)"
              value={newFactor}
              onChange={(e) => setNewFactor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFactor()}
            />
            <button
              onClick={addFactor}
              disabled={factors.length >= 8}
              className="inline-flex items-center gap-1 bg-brand-orange text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-orange-hover disabled:opacity-40 transition-all"
            >
              <Plus className="h-4 w-4" /> 추가
            </button>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-32 text-left px-2 py-1.5 text-xs text-muted-foreground font-medium">원인 →결과</th>
                  {factors.map((f, j) => (
                    <th key={j} className="px-2 py-1.5 text-center text-xs font-medium max-w-[72px]">
                      <div className="truncate" title={f}>{f}</div>
                      <button onClick={() => removeFactor(j)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3 mx-auto" />
                      </button>
                    </th>
                  ))}
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-brand-navy">출력</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-brand-orange">점수</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1.5 text-xs font-medium truncate max-w-[128px]" title={f}>{f}</td>
                    {factors.map((_, j) => (
                      <td key={j} className="px-2 py-1.5 text-center">
                        {i === j ? (
                          <span className="text-muted-foreground">─</span>
                        ) : (
                          <button
                            onClick={() => toggleCell(i, j)}
                            className={`w-7 h-7 rounded-lg border text-xs font-bold transition-all ${
                              matrix[i]?.[j]
                                ? "bg-brand-navy text-white border-brand-navy"
                                : "border-border text-muted-foreground hover:border-brand-navy"
                            }`}
                            title={`${f} → ${factors[j]}`}
                          >
                            {matrix[i]?.[j] ? "→" : ""}
                          </button>
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-bold text-brand-navy">{outCounts[i]}</td>
                    <td className={`px-2 py-1.5 text-center font-bold ${scores[i] > 0 ? "text-brand-orange" : scores[i] < 0 ? "text-blue-600" : "text-muted-foreground"}`}>
                      {scores[i] > 0 ? `+${scores[i]}` : scores[i]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            점수(출력−입력)가 양수(+)일수록 원인, 음수(−)일수록 결과에 해당합니다.
          </p>
        </div>
      }
    />
  );
}
