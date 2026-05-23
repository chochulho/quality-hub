"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Download, Play, AlertCircle, RotateCcw } from "lucide-react";
import {
  calcXbarR, calcXbarS, calcIMR,
  type VariableResult,
} from "@/lib/control-chart/calculations";
import { exportVariableToExcel } from "@/lib/control-chart/excelExport";
import { SpreadsheetGrid } from "./SpreadsheetGrid";

type ChartType = "xbar-r" | "xbar-s" | "imr";

const CHART_TYPES: { id: ChartType; label: string; desc: string; needsN: boolean }[] = [
  { id: "xbar-r", label: "X̄-R 관리도", desc: "소그룹 n = 2~10, 범위(R) 기반", needsN: true },
  { id: "xbar-s", label: "X̄-S 관리도", desc: "소그룹 n = 2~10, 표준편차(S) 기반", needsN: true },
  { id: "imr",    label: "I-MR 관리도", desc: "개별값 n = 1, 소량 생산·연속 공정", needsN: false },
];

// Example data (displayed on first load)
const EXAMPLE: Record<ChartType, string[][]> = {
  "xbar-r": [
    ["12.1","11.9","12.3","12.0","11.8"],
    ["12.4","12.2","11.7","12.5","12.1"],
    ["11.9","12.0","12.2","11.8","12.3"],
    ["12.6","12.1","12.4","12.0","11.9"],
    ["12.0","11.8","12.1","12.3","12.2"],
    ["12.3","12.5","12.0","11.9","12.4"],
    ["11.8","12.2","12.1","12.0","11.9"],
    ["12.5","12.3","11.8","12.2","12.1"],
    ["12.1","12.0","12.4","11.9","12.3"],
    ["12.7","12.4","12.1","12.0","12.2"],
  ],
  "xbar-s": [
    ["15.2","14.8","15.1","15.3","14.9"],
    ["15.0","15.4","14.7","15.2","15.1"],
    ["14.9","15.1","15.3","14.8","15.2"],
    ["15.3","15.0","14.9","15.4","15.1"],
    ["15.1","15.2","14.8","15.0","15.3"],
    ["14.8","15.3","15.1","15.2","14.9"],
    ["15.0","14.9","15.2","15.1","15.0"],
    ["15.4","15.1","14.9","15.0","15.2"],
  ],
  imr: [
    ["25.1"],["24.9"],["25.3"],["24.8"],["25.2"],
    ["25.0"],["24.7"],["25.4"],["25.1"],["24.9"],
    ["25.3"],["25.0"],["24.8"],["25.2"],["25.5"],
    ["24.9"],["25.1"],["25.0"],["24.8"],["25.3"],
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  const isOOC = payload?.ooc;
  return (
    <circle
      cx={cx} cy={cy}
      r={isOOC ? 6 : 4}
      fill={isOOC ? "#DC2626" : "#2B4B8C"}
      stroke={isOOC ? "#fff" : "none"}
      strokeWidth={isOOC ? 2 : 0}
    />
  );
}

interface SingleChartProps {
  data: VariableResult["upperChart"];
  title: string;
  color?: string;
}

function SingleChart({ data, title, color = "#2B4B8C" }: SingleChartProps) {
  const ucl = data[0]?.ucl ?? 0;
  const cl  = data[0]?.cl  ?? 0;
  const lcl = data[0]?.lcl ?? 0;
  const oocCount = data.filter((p) => p.ooc).length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-brand-navy">{title}</h3>
        {oocCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
            <AlertCircle className="h-3 w-3" />
            이상 {oocCount}건
          </span>
        )}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground mb-1">
        <span>UCL = <strong className="text-red-600">{ucl}</strong></span>
        <span>CL = <strong className="text-brand-navy">{cl}</strong></span>
        <span>LCL = <strong className="text-red-600">{lcl}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={60} />
          <Tooltip formatter={(v) => [v, "측정값"]} contentStyle={{ fontSize: 12 }} />
          <ReferenceLine y={ucl} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1.5}
            label={{ value: "UCL", position: "right", fontSize: 10, fill: "#DC2626" }} />
          <ReferenceLine y={cl}  stroke={color}   strokeDasharray="0"   strokeWidth={1.5}
            label={{ value: "CL",  position: "right", fontSize: 10, fill: color }} />
          <ReferenceLine y={lcl} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1.5}
            label={{ value: "LCL", position: "right", fontSize: 10, fill: "#DC2626" }} />
          <Line dataKey="value" stroke={color} strokeWidth={1.5}
            dot={<CustomDot />} activeDot={{ r: 6 }} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function makeEmptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

export default function VariableControlChart() {
  const [chartType, setChartType] = useState<ChartType>("xbar-r");
  const [n, setN] = useState(5);
  const [gridData, setGridData] = useState<string[][]>(EXAMPLE["xbar-r"]);
  const [result, setResult] = useState<VariableResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const needsN = CHART_TYPES.find((c) => c.id === chartType)?.needsN ?? false;
  const cols = chartType === "imr" ? 1 : n;

  // Column headers
  const colHeaders =
    chartType === "imr"
      ? ["측정값"]
      : Array.from({ length: cols }, (_, i) => `측정 ${i + 1}`);

  // When chart type changes, load matching example
  useEffect(() => {
    if (chartType === "xbar-r" || chartType === "xbar-s") {
      const exampleCols = EXAMPLE[chartType][0].length;
      if (exampleCols !== n) {
        // Adjust example columns to match n
        setGridData(EXAMPLE[chartType].map((row) => {
          if (row.length === n) return row;
          if (row.length > n) return row.slice(0, n);
          return [...row, ...Array(n - row.length).fill("")];
        }));
      } else {
        setGridData(EXAMPLE[chartType]);
      }
    } else {
      setGridData(EXAMPLE[chartType]);
    }
    setResult(null);
    setError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType]);

  // When n changes, reset grid
  const handleNChange = (newN: number) => {
    setN(newN);
    setGridData(makeEmptyGrid(15, newN));
    setResult(null);
    setError(null);
  };

  const handleAnalyze = useCallback(() => {
    setError(null);
    setResult(null);
    try {
      // Parse non-empty rows
      const rows = gridData
        .map((row) => row.map((c) => parseFloat(c.trim())))
        .filter((row) => row.every((v) => !isNaN(v)) && row.some((v) => v !== 0 || true) && row.join("") !== Array(row.length).fill("NaN").join("NaN"));

      const validRows = gridData
        .filter((row) => row.some((c) => c.trim() !== ""))
        .map((row) => row.map((c) => parseFloat(c.trim())));

      if (validRows.length < 3) throw new Error("최소 3행 이상의 데이터를 입력하세요.");
      if (validRows.some((r) => r.some((v) => isNaN(v))))
        throw new Error("숫자가 아닌 값이 포함되어 있습니다. 셀을 확인하세요.");

      let res: VariableResult;
      if (chartType === "xbar-r") res = calcXbarR(validRows);
      else if (chartType === "xbar-s") res = calcXbarS(validRows);
      else res = calcIMR(validRows.map((r) => r[0]));

      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
    }
  }, [chartType, gridData]);

  const handleExport = useCallback(async () => {
    if (!result) return;
    setExporting(true);
    try { await exportVariableToExcel(result); }
    finally { setExporting(false); }
  }, [result]);

  const totalOoc =
    (result?.upperChart.filter((p) => p.ooc).length ?? 0) +
    (result?.lowerChart.filter((p) => p.ooc).length ?? 0);

  return (
    <div className="space-y-6">
      {/* Chart type selector */}
      <div>
        <p className="text-sm font-semibold mb-3">관리도 종류 선택</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => { setChartType(ct.id); }}
              className={`text-left border rounded-xl px-4 py-3 transition-all duration-150 ${
                chartType === ct.id
                  ? "border-brand-navy bg-brand-navy/5 shadow-sm"
                  : "border-border hover:border-brand-navy/40"
              }`}
            >
              <p className="font-bold text-sm text-brand-navy">{ct.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ct.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Subgroup size */}
      {needsN && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold w-36">소그룹 크기 (n)</label>
          <div className="flex items-center gap-1">
            {[2,3,4,5,6,7,8,9,10].map((v) => (
              <button
                key={v}
                onClick={() => handleNChange(v)}
                className={`w-8 h-8 rounded-lg text-sm font-mono font-semibold transition-all ${
                  n === v
                    ? "bg-brand-navy text-white"
                    : "border border-border hover:border-brand-navy text-muted-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">
            데이터 입력
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              — Excel에서 범위 선택 후 복사(Ctrl+C)하여 셀을 클릭한 뒤 붙여넣기(Ctrl+V)
            </span>
          </p>
          <button
            onClick={() => { setGridData(EXAMPLE[chartType]); setResult(null); setError(null); }}
            className="flex items-center gap-1 text-xs text-brand-orange hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            예제 데이터
          </button>
        </div>
        <SpreadsheetGrid
          data={gridData}
          onChange={setGridData}
          colHeaders={colHeaders}
          rowLabel="소그룹"
          minRows={15}
          placeholder="0.00"
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        className="flex items-center gap-2 bg-brand-navy text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-brand-navy-dark transition-colors"
      >
        <Play className="h-4 w-4" />
        관리도 분석
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="border border-border rounded-2xl p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">분석 결과</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {result.type.toUpperCase()} | n = {result.n} | 소그룹 {result.upperChart.length}개
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              {exporting ? "내보내는 중..." : "Excel 다운로드"}
            </button>
          </div>

          <SingleChart data={result.upperChart} title={result.upperLabel} color="#2B4B8C" />
          <SingleChart data={result.lowerChart} title={result.lowerLabel} color="#16A34A" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 pt-4 border-t border-border">
            {[
              { label: "전체 평균 (X̄ ̄)", value: result.xbarbar },
              ...(result.rbar  != null ? [{ label: "평균 범위 (R̄)",      value: result.rbar }]  : []),
              ...(result.sbar  != null ? [{ label: "평균 표준편차 (S̄)",   value: result.sbar }]  : []),
              ...(result.mRbar != null ? [{ label: "평균 이동범위 (MR̄)",  value: result.mRbar }] : []),
              { label: "이상 포인트", value: `${totalOoc}건`, highlight: totalOoc > 0 },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-lg font-bold ${highlight ? "text-red-600" : "text-brand-navy"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
