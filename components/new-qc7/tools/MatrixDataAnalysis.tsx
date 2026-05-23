"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import ToolShell from "../ToolShell";
import { computeCorrelationMatrix } from "@/lib/qc7/statistics";
import { exportMatrixData } from "@/lib/qc7/excelExporter";

function parseTable(text: string): { labels: string[]; cols: number[][] } {
  const lines = text.trim().split(/\n/);
  if (lines.length < 2) return { labels: [], cols: [] };
  const headers = lines[0].split(/\t|,/).map((s) => s.trim());
  const cols: number[][] = headers.map(() => []);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\t|,/).map((s) => parseFloat(s.trim()));
    parts.forEach((v, j) => {
      if (!isNaN(v)) cols[j].push(v);
    });
  }
  return { labels: headers, cols };
}

function heatColor(r: number): string {
  if (r >= 0.9) return "bg-red-700 text-white";
  if (r >= 0.7) return "bg-red-400 text-white";
  if (r >= 0.4) return "bg-red-200 text-red-900";
  if (r >= 0.1) return "bg-red-50 text-red-700";
  if (r <= -0.9) return "bg-blue-700 text-white";
  if (r <= -0.7) return "bg-blue-400 text-white";
  if (r <= -0.4) return "bg-blue-200 text-blue-900";
  if (r <= -0.1) return "bg-blue-50 text-blue-700";
  return "bg-muted text-muted-foreground";
}

const EXAMPLE = `변수A\t변수B\t변수C
10.2\t5.1\t3.3
9.8\t4.9\t3.5
10.5\t5.3\t3.1
10.0\t5.0\t3.4
9.6\t4.8\t3.7
10.3\t5.2\t3.2`;

export default function MatrixDataAnalysis() {
  const [rawText, setRawText] = useState(EXAMPLE);
  const [downloading, setDownloading] = useState(false);

  const { labels, cols } = parseTable(rawText);
  const n = labels.length;
  const minRows = n > 0 ? Math.min(...cols.map((c) => c.length)) : 0;
  const validCols = cols.map((col) => col.slice(0, minRows));
  const corrMatrix = n >= 2 && minRows >= 2 ? computeCorrelationMatrix(validCols) : [];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportMatrixData(labels, validCols, corrMatrix);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="매트릭스 데이터 해석 (Matrix Data Analysis)"
      badge="신 QC 7가지 도구 ⑤"
      description="여러 변수 간의 Pearson 상관계수를 히트맵으로 표시합니다. 첫 번째 행에 변수명, 이하 행에 데이터를 입력하세요 (탭 또는 쉼표 구분)."
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || corrMatrix.length === 0}
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
              데이터 입력 (첫 행: 변수명, 이후: 숫자 / Excel에서 범위 복사·붙여넣기)
            </label>
            <textarea
              className="w-full h-36 border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy resize-none"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="변수A&#9;변수B&#9;변수C&#10;10.2&#9;5.1&#9;3.3&#10;..."
            />
            {n > 0 && <p className="text-xs text-muted-foreground mt-1">{n}개 변수 · {minRows}개 행 인식</p>}
          </div>

          {corrMatrix.length >= 2 && (
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border px-3 py-2 bg-muted text-xs" />
                    {labels.map((label, j) => (
                      <th key={j} className="border border-border px-3 py-2 bg-muted text-xs font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((label, i) => (
                    <tr key={i}>
                      <td className="border border-border px-3 py-2 bg-muted text-xs font-semibold">{label}</td>
                      {corrMatrix[i].map((r, j) => (
                        <td key={j} className={`border border-border px-3 py-2 text-center text-xs font-bold w-20 ${heatColor(r)}`}>
                          {i === j ? "1.000" : r.toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            빨강: 양의 상관 (r &gt; 0) · 파랑: 음의 상관 (r &lt; 0) · 진할수록 강한 상관관계
          </p>
        </div>
      }
    />
  );
}
