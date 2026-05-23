"use client";

import { useState, useCallback } from "react";
import { Upload, Download, ChevronDown, ChevronUp, FileSpreadsheet } from "lucide-react";
import { parseCapabilityExcel, downloadTemplate } from "@/lib/spc/excelParser";
import { exportBatchResults } from "@/lib/spc/excelExporter";
import { computeCapability, cpkGrade, GRADE_BG } from "@/lib/spc/statistics";
import type { CapabilityResult } from "@/lib/spc/statistics";
import CapabilityResultView from "./CapabilityResult";

interface CharResult {
  name: string;
  data: number[];
  result: CapabilityResult;
}

export default function BatchAnalysis() {
  const [results, setResults] = useState<CharResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError("");
      setIsLoading(true);
      setResults([]);
      setSelectedIndex(null);

      try {
        const buffer = await file.arrayBuffer();
        const characteristics = parseCapabilityExcel(buffer);
        const computed = characteristics.map((c) => ({
          name: c.name,
          data: c.data,
          result: computeCapability(c.data, c.spec),
        }));
        setResults(computed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "파일 파싱 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
        // reset input
        e.target.value = "";
      }
    },
    []
  );

  const handleExportAll = async () => {
    const { drawCapabilityChartToBase64 } = await import("@/lib/spc/canvasChart");
    const withCharts = results.map(({ name, data, result }) => ({
      name,
      data,
      result,
      chartBase64: drawCapabilityChartToBase64(
        data, result.mean, result.stdDev, result.lsl, result.usl, result.target
      ),
    }));
    await exportBatchResults(withCharts);
  };

  const gradeLabel: Record<string, string> = {
    excellent: "우수 (≥1.67)",
    good: "합격 (≥1.33)",
    warning: "주의 (≥1.00)",
    fail: "불합격 (<1.00)",
    none: "계산 불가",
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-4">
        <h2 className="font-bold text-brand-navy">일괄 분석 (Excel 업로드)</h2>

        <div className="bg-background-soft border-2 border-dashed border-border rounded-xl p-6 text-center">
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Excel 파일을 업로드하세요
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            행1: 특성명 | 행2: LSL | 행3: Target(선택) | 행4: USL | 행5+: 데이터
          </p>
          <label className="inline-flex items-center gap-2 bg-brand-navy text-white rounded-full px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-brand-navy-dark transition-colors">
            <Upload className="h-4 w-4" />
            파일 선택
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">또는</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-sm text-brand-navy hover:text-brand-orange transition-colors mx-auto"
        >
          <Download className="h-4 w-4" />
          Excel 템플릿 다운로드 (예시 형식)
        </button>

        {isLoading && (
          <p className="text-sm text-center text-muted-foreground">분석 중...</p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Summary grid */}
      {results.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-navy">
              분석 결과 ({results.length}개 특성)
            </h2>
            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-sm font-medium hover:border-brand-navy hover:bg-muted transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-700" />
              전체 Excel 내보내기
            </button>
          </div>

          {/* Summary table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["특성명", "N", "평균", "StDev", "LSL", "USL", "Cp", "Cpk", "상태"].map(
                    (h) => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    )
                  )}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const grade = cpkGrade(r.result.cpk);
                  const isOpen = selectedIndex === i;
                  return (
                    <>
                      <tr
                        key={r.name}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedIndex(isOpen ? null : i)}
                      >
                        <td className="py-2.5 px-2 font-medium">{r.name}</td>
                        <td className="py-2.5 px-2 font-mono text-xs">{r.result.n}</td>
                        <td className="py-2.5 px-2 font-mono text-xs">
                          {r.result.mean.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-xs">
                          {r.result.stdDev.toFixed(5)}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-xs">
                          {r.result.lsl ?? "—"}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-xs">
                          {r.result.usl ?? "—"}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-xs">
                          {r.result.cp?.toFixed(4) ?? "—"}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-xs font-bold">
                          {r.result.cpk?.toFixed(4) ?? "—"}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${GRADE_BG[grade]}`}
                          >
                            {gradeLabel[grade]}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-muted-foreground">
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${r.name}-detail`}>
                          <td colSpan={10} className="bg-background-soft px-4 py-5 border-b border-border">
                            <CapabilityResultView
                              result={r.result}
                              data={r.data}
                              characteristicName={r.name}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
