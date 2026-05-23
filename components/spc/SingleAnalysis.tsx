"use client";

import { useState, useCallback } from "react";
import { Play } from "lucide-react";
import SpecForm from "./SpecForm";
import DataPasteArea from "./DataPasteArea";
import AttributeInput from "./AttributeInput";
import CapabilityResultView from "./CapabilityResult";
import AttributeResult from "./AttributeResult";
import ExportButtons from "./ExportButtons";
import { computeCapability, computeAttributeCapability } from "@/lib/spc/statistics";
import type { CapabilityResult, AttributeCapabilityResult } from "@/lib/spc/statistics";

type DataType = "variable" | "attribute";

export default function SingleAnalysis() {
  const [dataType, setDataType] = useState<DataType>("variable");

  // 계량형 상태
  const [characteristicName, setCharacteristicName] = useState("");
  const [lsl, setLsl] = useState("");
  const [target, setTarget] = useState("");
  const [usl, setUsl] = useState("");
  const [data, setData] = useState<number[]>([]);
  const [result, setResult] = useState<CapabilityResult | null>(null);
  const [error, setError] = useState("");

  // 계수형 상태
  const [attrResult, setAttrResult] = useState<AttributeCapabilityResult | null>(null);
  const [attrName, setAttrName] = useState("");

  const handleDataTypeChange = (type: DataType) => {
    setDataType(type);
    setResult(null);
    setAttrResult(null);
    setError("");
  };

  const handleAnalyze = useCallback(() => {
    setError("");

    if (data.length < 2) {
      setError("데이터를 2개 이상 입력하세요.");
      return;
    }

    const lslNum = lsl !== "" ? parseFloat(lsl) : undefined;
    const targetNum = target !== "" ? parseFloat(target) : undefined;
    const uslNum = usl !== "" ? parseFloat(usl) : undefined;

    if (lslNum == null && uslNum == null) {
      setError("LSL 또는 USL 중 하나 이상 입력하세요.");
      return;
    }

    if (lslNum != null && uslNum != null && lslNum >= uslNum) {
      setError("LSL은 USL보다 작아야 합니다.");
      return;
    }

    const computed = computeCapability(data, { lsl: lslNum, target: targetNum, usl: uslNum });
    setResult(computed);

    setTimeout(() => {
      document.getElementById("single-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [data, lsl, target, usl]);

  const handleAttributeResult = useCallback((n: number, defects: number) => {
    const computed = computeAttributeCapability(n, defects);
    setAttrResult(computed);
    setTimeout(() => {
      document.getElementById("single-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const canAnalyze = data.length >= 2 && (lsl !== "" || usl !== "");

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div id="spc-input-card" className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-brand-navy">규격 및 데이터 입력</h2>

          {/* 계량형 / 계수형 토글 */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            <button
              onClick={() => handleDataTypeChange("variable")}
              className={`px-4 py-2 font-medium transition-colors ${
                dataType === "variable"
                  ? "bg-brand-navy text-white"
                  : "bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              계량형 (연속 데이터)
            </button>
            <button
              onClick={() => handleDataTypeChange("attribute")}
              className={`px-4 py-2 font-medium transition-colors ${
                dataType === "attribute"
                  ? "bg-brand-navy text-white"
                  : "bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              계수형 (불량률)
            </button>
          </div>
        </div>

        {dataType === "variable" ? (
          <>
            {/* 특성명 + 규격 입력 (계량형) */}
            <SpecForm
              characteristicName={characteristicName}
              lsl={lsl}
              target={target}
              usl={usl}
              onChangeName={setCharacteristicName}
              onChangeLsl={setLsl}
              onChangeTarget={setTarget}
              onChangeUsl={setUsl}
            />

            <DataPasteArea data={data} onDataChange={setData} />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {data.length > 0 ? `${data.length}개 데이터 준비됨` : "데이터를 입력하세요"}
              </p>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Play className="h-4 w-4" />
                분석 실행
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 특성명 (계수형) */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                특성명
              </label>
              <input
                type="text"
                value={attrName}
                onChange={(e) => setAttrName(e.target.value)}
                placeholder="예: 납땜 불량"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white"
              />
            </div>

            <AttributeInput onResult={handleAttributeResult} />
          </>
        )}
      </div>

      {/* 계량형 결과 */}
      {dataType === "variable" && result && (
        <div id="single-result" className="bg-white border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-bold text-brand-navy">분석 결과</h2>
            <ExportButtons
              result={result}
              data={data}
              characteristicName={characteristicName || "특성"}
            />
          </div>
          <CapabilityResultView
            result={result}
            data={data}
            characteristicName={characteristicName || "특성"}
          />
        </div>
      )}

      {/* 계수형 결과 */}
      {dataType === "attribute" && attrResult && (
        <div id="single-result" className="bg-white border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-bold text-brand-navy">분석 결과</h2>
          </div>
          <AttributeResult
            result={attrResult}
            characteristicName={attrName || "특성"}
          />
        </div>
      )}
    </div>
  );
}
