"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface AttributeInputProps {
  onResult: (n: number, defects: number) => void;
}

export default function AttributeInput({ onResult }: AttributeInputProps) {
  const [inputMode, setInputMode] = useState<"count" | "rate">("count");
  const [nStr, setNStr] = useState("");
  const [defectsStr, setDefectsStr] = useState("");
  const [rateStr, setRateStr] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    setError("");
    const n = parseFloat(nStr);

    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
      setError("총 검사 수량은 1 이상의 정수로 입력하세요.");
      return;
    }

    let defects: number;
    if (inputMode === "count") {
      defects = parseFloat(defectsStr);
      if (isNaN(defects) || defects < 0 || !Number.isInteger(defects)) {
        setError("불량 수는 0 이상의 정수로 입력하세요.");
        return;
      }
      if (defects > n) {
        setError("불량 수는 총 검사 수량보다 클 수 없습니다.");
        return;
      }
    } else {
      const rate = parseFloat(rateStr);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        setError("불량률은 0 ~ 100 (%) 범위로 입력하세요.");
        return;
      }
      defects = Math.round((rate / 100) * n);
    }

    onResult(n, defects);
  };

  const canAnalyze =
    nStr !== "" &&
    (inputMode === "count" ? defectsStr !== "" : rateStr !== "");

  return (
    <div className="space-y-4">
      {/* 입력 방식 토글 */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">불량 입력 방식</p>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs w-fit">
          <button
            onClick={() => setInputMode("count")}
            className={`px-4 py-2 font-medium transition-colors ${
              inputMode === "count"
                ? "bg-brand-navy text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            불량 수 입력
          </button>
          <button
            onClick={() => setInputMode("rate")}
            className={`px-4 py-2 font-medium transition-colors ${
              inputMode === "rate"
                ? "bg-brand-navy text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            불량률 (%) 입력
          </button>
        </div>
      </div>

      {/* 입력 필드 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            총 검사 수량 (N) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={nStr}
            onChange={(e) => setNStr(e.target.value)}
            placeholder="예: 1000"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white"
          />
        </div>

        {inputMode === "count" ? (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              불량 수 (D) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={defectsStr}
              onChange={(e) => setDefectsStr(e.target.value)}
              placeholder="예: 12"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              불량률 (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              placeholder="예: 1.2"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end pt-1">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Play className="h-4 w-4" />
          분석 실행
        </button>
      </div>
    </div>
  );
}
