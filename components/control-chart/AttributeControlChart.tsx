"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Download, Play, AlertCircle, RotateCcw } from "lucide-react";
import {
  calcP, calcNP, calcC, calcU,
  type AttributeResult,
} from "@/lib/control-chart/calculations";
import { exportAttributeToExcel } from "@/lib/control-chart/excelExport";
import { SpreadsheetGrid } from "./SpreadsheetGrid";

type ChartType = "p" | "np" | "c" | "u";

const CHART_INFO: {
  id: ChartType; label: string; desc: string;
  colHeaders: string[]; fixedN: boolean;
}[] = [
  { id: "p",  label: "p 관리도",  desc: "불량률, 샘플 크기 가변",        colHeaders: ["불량 수", "샘플 수"],  fixedN: false },
  { id: "np", label: "np 관리도", desc: "불량 수, 고정 샘플 크기(n)",     colHeaders: ["불량 수"],             fixedN: true  },
  { id: "c",  label: "c 관리도",  desc: "결점 수, 고정 검사 단위",        colHeaders: ["결점 수"],             fixedN: false },
  { id: "u",  label: "u 관리도",  desc: "단위당 결점 수, 검사 단위 가변", colHeaders: ["결점 수", "검사 단위"], fixedN: false },
];

// Example data for each chart type (pre-loaded)
const EXAMPLE: Record<ChartType, string[][]> = {
  p: [
    ["3","100"],["2","100"],["5","100"],["1","100"],["4","100"],
    ["2","100"],["6","100"],["3","100"],["1","100"],["4","100"],
    ["5","100"],["2","100"],["3","100"],["4","120"],["1","80"],
    ["6","100"],["2","100"],["3","100"],["4","100"],["2","100"],
  ],
  np: [
    ["3"],["2"],["5"],["1"],["4"],["2"],["6"],["3"],["1"],["4"],
    ["5"],["2"],["3"],["4"],["1"],["6"],["2"],["3"],["4"],["2"],
  ],
  c: [
    ["5"],["3"],["7"],["2"],["4"],["6"],["3"],["5"],["4"],["2"],
    ["6"],["3"],["8"],["4"],["3"],["5"],["2"],["6"],["4"],["3"],
  ],
  u: [
    ["5","10"],["3","10"],["7","10"],["2","10"],["4","10"],
    ["6","10"],["3","10"],["5","10"],["4","10"],["2","10"],
    ["6","12"],["3","8"],["8","10"],["4","10"],["3","10"],
    ["5","10"],["2","10"],["6","10"],["4","10"],["3","10"],
  ],
};

const Y_LABEL: Record<ChartType, string> = {
  p: "불량률 (p)", np: "불량 수 (np)", c: "결점 수 (c)", u: "단위당 결점 (u)",
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
      fill={isOOC ? "#DC2626" : "#F26B3A"}
      stroke={isOOC ? "#fff" : "none"}
      strokeWidth={isOOC ? 2 : 0}
    />
  );
}

export default function AttributeControlChart() {
  const [chartType, setChartType] = useState<ChartType>("p");
  const [fixedN, setFixedN] = useState(100);
  const [gridData, setGridData] = useState<string[][]>(EXAMPLE.p);
  const [result, setResult] = useState<AttributeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const ctInfo = CHART_INFO.find((c) => c.id === chartType)!;

  // Load example data when chart type changes
  useEffect(() => {
    setGridData(EXAMPLE[chartType]);
    setResult(null);
    setError(null);
  }, [chartType]);

  const handleAnalyze = useCallback(() => {
    setError(null);
    setResult(null);
    try {
      const validRows = gridData
        .filter((row) => row.some((c) => c.trim() !== ""))
        .map((row) => row.map((c) => parseFloat(c.trim())));

      if (validRows.length < 3) throw new Error("최소 3행 이상의 데이터를 입력하세요.");
      if (validRows.some((r) => r.some((v) => isNaN(v))))
        throw new Error("숫자가 아닌 값이 포함되어 있습니다. 셀을 확인하세요.");

      let res: AttributeResult;
      if (chartType === "p") {
        if (validRows.some((r) => r.length < 2)) throw new Error("p 관리도: 각 행에 [불량 수, 샘플 수]를 입력하세요.");
        res = calcP(validRows.map((r) => r[0]), validRows.map((r) => r[1]));
      } else if (chartType === "np") {
        res = calcNP(validRows.map((r) => r[0]), fixedN);
      } else if (chartType === "c") {
        res = calcC(validRows.map((r) => r[0]));
      } else {
        if (validRows.some((r) => r.length < 2)) throw new Error("u 관리도: 각 행에 [결점 수, 검사 단위]를 입력하세요.");
        res = calcU(validRows.map((r) => r[0]), validRows.map((r) => r[1]));
      }
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
    }
  }, [chartType, gridData, fixedN]);

  const handleExport = useCallback(async () => {
    if (!result) return;
    setExporting(true);
    try { await exportAttributeToExcel(result, `${result.type} 관리도`); }
    finally { setExporting(false); }
  }, [result]);

  const ucl = result?.chart[0]?.ucl ?? 0;
  const cl  = result?.centerLine ?? 0;
  const lcl = result?.chart[0]?.lcl ?? 0;
  const oocCount = result?.chart.filter((p) => p.ooc).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Chart type selector */}
      <div>
        <p className="text-sm font-semibold mb-3">관리도 종류 선택</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHART_INFO.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setChartType(ct.id)}
              className={`text-left border rounded-xl px-4 py-3 transition-all duration-150 ${
                chartType === ct.id
                  ? "border-brand-orange bg-brand-orange/5 shadow-sm"
                  : "border-border hover:border-brand-orange/40"
              }`}
            >
              <p className="font-bold text-sm">{ct.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ct.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed n for np chart */}
      {ctInfo.fixedN && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold w-36">고정 샘플 크기 (n)</label>
          <input
            type="number" min={1}
            value={fixedN}
            onChange={(e) => setFixedN(parseInt(e.target.value) || 100)}
            className="w-28 border border-border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-brand-orange"
          />
        </div>
      )}

      {/* Grid input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">
            데이터 입력
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              — Excel에서 복사(Ctrl+C)하여 셀 클릭 후 붙여넣기(Ctrl+V)
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
          colHeaders={ctInfo.colHeaders}
          rowLabel="관측"
          minRows={20}
          placeholder="0"
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        className="flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover transition-colors"
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

      {/* Result */}
      {result && (
        <div className="border border-border rounded-2xl p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">
                {result.type.toUpperCase()} 관리도
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">관측 {result.chart.length}개</p>
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

          <div className="flex gap-4 text-xs text-muted-foreground mb-3">
            <span>UCL = <strong className="text-red-600">{ucl}</strong></span>
            <span>CL = <strong className="text-brand-orange">{cl}</strong></span>
            <span>LCL = <strong className="text-red-600">{lcl}</strong></span>
            {oocCount > 0 && (
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <AlertCircle className="h-3 w-3" />이상 {oocCount}건
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={result.chart} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={64}
                label={{ value: Y_LABEL[chartType], angle: -90, position: "insideLeft", fontSize: 10, dx: -4 }} />
              <Tooltip formatter={(v) => [v, Y_LABEL[chartType]]} contentStyle={{ fontSize: 12 }} />
              <ReferenceLine y={ucl} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: "UCL", position: "right", fontSize: 10, fill: "#DC2626" }} />
              <ReferenceLine y={cl}  stroke="#F26B3A" strokeDasharray="0"   strokeWidth={1.5}
                label={{ value: "CL",  position: "right", fontSize: 10, fill: "#F26B3A" }} />
              <ReferenceLine y={lcl} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: "LCL", position: "right", fontSize: 10, fill: "#DC2626" }} />
              <Line dataKey="value" stroke="#F26B3A" strokeWidth={1.5}
                dot={<CustomDot />} activeDot={{ r: 6 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
            {[
              { label: "중심선 (CL)", value: result.centerLine, highlight: false },
              { label: "관측 수", value: result.chart.length, highlight: false },
              { label: "이상 포인트", value: `${oocCount}건`, highlight: oocCount > 0 },
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
