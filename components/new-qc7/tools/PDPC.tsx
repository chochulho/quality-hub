"use client";

import { useState } from "react";
import { Plus, Trash2, Download, ChevronRight, AlertTriangle, Shield } from "lucide-react";
import ToolShell from "../ToolShell";
import { exportPDPC, type PDPCStep } from "@/lib/qc7/excelExporter";

let stepSeq = 1;
let riskSeq = 1;

interface Risk { id: number; risk: string; countermeasure: string }
interface Step { id: number; step: string; risks: Risk[] }

const mkRisk = (): Risk => ({ id: riskSeq++, risk: "", countermeasure: "" });
const mkStep = (stepName = ""): Step => ({ id: stepSeq++, step: stepName, risks: [mkRisk()] });

export default function PDPC() {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: stepSeq++,
      step: "신제품 개발 착수",
      risks: [
        { id: riskSeq++, risk: "요구사항 불명확", countermeasure: "킥오프 미팅 진행 및 요구사항 문서화" },
      ],
    },
    {
      id: stepSeq++,
      step: "시제품 제작",
      risks: [
        { id: riskSeq++, risk: "원자재 납기 지연", countermeasure: "2개 이상 공급업체 사전 확보" },
        { id: riskSeq++, risk: "설계 오류 발견", countermeasure: "설계 검토(DR) 조기 실시" },
      ],
    },
    {
      id: stepSeq++,
      step: "시험 검증",
      risks: [
        { id: riskSeq++, risk: "성능 미달", countermeasure: "단계별 검증 항목 기준 수립" },
      ],
    },
  ]);
  const [downloading, setDownloading] = useState(false);

  const addStep = () => setSteps((prev) => [...prev, mkStep(`단계 ${prev.length + 1}`)]);
  const removeStep = (id: number) => setSteps((prev) => prev.filter((s) => s.id !== id));
  const updateStep = (id: number, step: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, step } : s)));

  const addRisk = (stepId: number) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, risks: [...s.risks, mkRisk()] } : s))
    );
  const removeRisk = (stepId: number, riskId: number) =>
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, risks: s.risks.filter((r) => r.id !== riskId) } : s
      )
    );
  const updateRisk = (stepId: number, riskId: number, field: "risk" | "countermeasure", value: string) =>
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, risks: s.risks.map((r) => (r.id === riskId ? { ...r, [field]: value } : r)) }
          : s
      )
    );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const data: PDPCStep[] = steps.map((s) => ({
        step: s.step,
        risks: s.risks.map((r) => ({ risk: r.risk, countermeasure: r.countermeasure })),
      }));
      await exportPDPC(data);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="PDPC (Process Decision Program Chart)"
      badge="신 QC 7가지 도구 ⑥"
      description="계획 실행 중 발생할 수 있는 위험 요소와 대책을 사전에 수립합니다. 각 단계별 위험을 예측하여 대응 방안을 준비합니다."
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
          {/* Flowchart visual */}
          <div className="space-y-3">
            {steps.map((step, si) => (
              <div key={step.id} className="flex flex-col md:flex-row gap-3">
                {/* Step box */}
                <div className="md:w-44 shrink-0">
                  <div className="bg-brand-navy rounded-xl p-3 text-center relative">
                    <input
                      className="w-full text-sm font-bold text-white bg-transparent text-center focus:outline-none placeholder-white/50"
                      value={step.step}
                      onChange={(e) => updateStep(step.id, e.target.value)}
                      placeholder={`단계 ${si + 1}`}
                    />
                    <button
                      onClick={() => removeStep(step.id)}
                      className="absolute top-1.5 right-1.5 text-white/50 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {si < steps.length - 1 && (
                    <div className="flex justify-center mt-1">
                      <ChevronRight className="h-4 w-4 text-brand-navy rotate-90" />
                    </div>
                  )}
                </div>

                {/* Risks */}
                <div className="flex-1 space-y-2">
                  {step.risks.map((risk) => (
                    <div key={risk.id} className="flex gap-2">
                      <div className="flex-1 border border-orange-200 bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                          <input
                            className="flex-1 text-xs font-semibold bg-transparent focus:outline-none text-brand-orange placeholder-brand-orange/50"
                            placeholder="위험 요소"
                            value={risk.risk}
                            onChange={(e) => updateRisk(step.id, risk.id, "risk", e.target.value)}
                          />
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-green-700 shrink-0 mt-0.5" />
                          <input
                            className="flex-1 text-xs bg-transparent focus:outline-none text-green-800 placeholder-green-600/60"
                            placeholder="대책"
                            value={risk.countermeasure}
                            onChange={(e) => updateRisk(step.id, risk.id, "countermeasure", e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeRisk(step.id, risk.id)}
                        className="self-start text-muted-foreground hover:text-destructive mt-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addRisk(step.id)}
                    className="text-xs text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> 위험 추가
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addStep}
            className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all"
          >
            <Plus className="h-4 w-4" /> 단계 추가
          </button>
        </div>
      }
    />
  );
}
