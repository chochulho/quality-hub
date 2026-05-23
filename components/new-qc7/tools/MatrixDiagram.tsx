"use client";

import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import ToolShell from "../ToolShell";
import { exportMatrix } from "@/lib/qc7/excelExporter";

const SYMBOLS = ["", "△", "○", "◎"] as const;
const SCORES: Record<string, number> = { "◎": 9, "○": 3, "△": 1, "": 0 };
const SYMBOL_COLORS: Record<string, string> = {
  "◎": "bg-brand-navy text-white",
  "○": "bg-blue-100 text-blue-800",
  "△": "bg-yellow-100 text-yellow-800",
  "": "bg-muted text-muted-foreground",
};

let rowSeq = 1;
let colSeq = 1;

interface Row { id: number; name: string }
interface Col { id: number; name: string }

export default function MatrixDiagram() {
  const [rows, setRows] = useState<Row[]>([
    { id: rowSeq++, name: "고객 불만 감소" },
    { id: rowSeq++, name: "불량률 1% 이하" },
    { id: rowSeq++, name: "납기 준수율 향상" },
  ]);
  const [cols, setCols] = useState<Col[]>([
    { id: colSeq++, name: "공정 개선" },
    { id: colSeq++, name: "작업자 교육" },
    { id: colSeq++, name: "설비 보전" },
  ]);
  const [cells, setCells] = useState<string[][]>(() => [
    ["◎", "○", "△"],
    ["○", "◎", "○"],
    ["△", "△", "◎"],
  ]);
  const [downloading, setDownloading] = useState(false);

  const addRow = () => {
    setRows((prev) => [...prev, { id: rowSeq++, name: `목표 ${prev.length + 1}` }]);
    setCells((prev) => [...prev, Array(cols.length).fill("")]);
  };

  const addCol = () => {
    setCols((prev) => [...prev, { id: colSeq++, name: `수단 ${prev.length + 1}` }]);
    setCells((prev) => prev.map((row) => [...row, ""]));
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setCells((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeCol = (idx: number) => {
    setCols((prev) => prev.filter((_, i) => i !== idx));
    setCells((prev) => prev.map((row) => row.filter((_, i) => i !== idx)));
  };

  const updateRowName = (idx: number, name: string) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, name } : r)));

  const updateColName = (idx: number, name: string) =>
    setCols((prev) => prev.map((c, i) => (i === idx ? { ...c, name } : c)));

  const cycleCell = (ri: number, ci: number) => {
    const current = cells[ri]?.[ci] ?? "";
    const nextIdx = (SYMBOLS.indexOf(current as typeof SYMBOLS[number]) + 1) % SYMBOLS.length;
    setCells((prev) =>
      prev.map((row, r) => row.map((cell, c) => (r === ri && c === ci ? SYMBOLS[nextIdx] : cell)))
    );
  };

  const colTotals = cols.map((_, j) =>
    rows.reduce((s, _, i) => s + (SCORES[cells[i]?.[j] ?? ""] ?? 0), 0)
  );

  const rowTotals = rows.map((_, i) =>
    cols.reduce((s, _, j) => s + (SCORES[cells[i]?.[j] ?? ""] ?? 0), 0)
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportMatrix(rows.map((r) => r.name), cols.map((c) => c.name), cells);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="매트릭스도 (Matrix Diagram)"
      badge="신 QC 7가지 도구 ④"
      description="목표(행)와 수단(열)의 관계 강도를 ◎·○·△로 평가합니다. 셀을 클릭하면 평점이 순환됩니다. 열 합산으로 수단의 우선순위를 결정합니다."
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">◎=9점, ○=3점, △=1점, 빈칸=0점 · 셀을 클릭하여 평점 변경</p>

          <div className="overflow-x-auto">
            <table className="text-sm border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="border border-border px-3 py-2 bg-muted text-xs text-left">목표 ↓ / 수단 →</th>
                  {cols.map((col, j) => (
                    <th key={col.id} className="border border-border px-2 py-1 bg-muted min-w-[90px]">
                      <input
                        className="w-full text-xs text-center font-semibold bg-transparent focus:outline-none focus:border-b border-brand-navy"
                        value={col.name}
                        onChange={(e) => updateColName(j, e.target.value)}
                      />
                      <button onClick={() => removeCol(j)} className="block mx-auto text-muted-foreground hover:text-destructive mt-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </th>
                  ))}
                  <th className="border border-border px-3 py-2 bg-muted text-xs text-brand-navy">행 합계</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}>
                    <td className="border border-border px-2 py-1">
                      <div className="flex items-center gap-1">
                        <input
                          className="text-xs font-medium bg-transparent focus:outline-none flex-1"
                          value={row.name}
                          onChange={(e) => updateRowName(i, e.target.value)}
                        />
                        <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    {cols.map((_, j) => (
                      <td key={j} className="border border-border px-2 py-1 text-center">
                        <button
                          onClick={() => cycleCell(i, j)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all hover:scale-110 ${SYMBOL_COLORS[cells[i]?.[j] ?? ""]}`}
                        >
                          {cells[i]?.[j] || "·"}
                        </button>
                      </td>
                    ))}
                    <td className="border border-border px-3 py-1 text-center font-bold text-brand-navy">{rowTotals[i]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted">
                  <td className="border border-border px-3 py-2 text-xs font-bold">열 합계 (우선순위)</td>
                  {colTotals.map((total, j) => (
                    <td key={j} className="border border-border px-2 py-2 text-center font-extrabold text-brand-orange text-base">{total}</td>
                  ))}
                  <td className="border border-border" />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-2">
            <button onClick={addRow} className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all">
              <Plus className="h-4 w-4" /> 목표 추가
            </button>
            <button onClick={addCol} className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all">
              <Plus className="h-4 w-4" /> 수단 추가
            </button>
          </div>
        </div>
      }
    />
  );
}
