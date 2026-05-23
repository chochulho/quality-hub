import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import ToolShell from "../ToolShell";

const concepts = [
  {
    term: "I-MR 관리도",
    desc: "개별값(I) 차트와 이동범위(MR) 차트로 구성. 소량 데이터나 단일 측정값에 적합.",
  },
  {
    term: "UCL / LCL",
    desc: "관리 상한(Upper Control Limit)·하한(Lower Control Limit). X̄ ± 3σ 기준. 규격 한계(USL/LSL)와 다른 개념.",
  },
  {
    term: "Nelson 규칙",
    desc: "8가지 규칙으로 이상 원인(Special Cause)을 탐지. 예: 연속 9점 중심 한쪽, 6점 연속 단조 증가 등.",
  },
  {
    term: "공통 원인 vs 이상 원인",
    desc: "공통 원인(Common Cause)은 시스템 내재 변동. 이상 원인(Special Cause)은 외부 요인 — 관리도로 탐지.",
  },
];

export default function ControlChartLink() {
  return (
    <ToolShell
      title="관리도 (Control Chart)"
      badge="QC 7가지 도구 ⑦"
      description="공정 데이터를 시계열로 표시하고 관리 한계선을 이용해 이상 원인을 조기에 탐지합니다. 관리도 전용 실습 페이지에서 직접 분석하세요."
      iatfClause="9.1.1.1 통계적 도구 활용"
      practice={
        <div className="space-y-6">
          {/* Key concepts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map((c) => (
              <div key={c.term} className="border border-border rounded-xl p-4">
                <p className="text-sm font-bold text-brand-navy mb-1">{c.term}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-brand-navy/5 border border-brand-navy/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-brand-orange" />
                <p className="text-sm font-semibold text-brand-navy">관리도 전용 페이지에서 실습하기</p>
              </div>
              <p className="text-sm text-muted-foreground">
                X̄-R, X̄-S, I-MR 관리도를 직접 그리고 Nelson 규칙 위반을 자동 탐지하는 전용 분석 도구입니다.
                데이터를 붙여넣으면 UCL/LCL을 자동 계산합니다.
              </p>
            </div>
            <Link
              href="/control-chart"
              className="shrink-0 inline-flex items-center gap-2 bg-brand-navy text-white rounded-full px-5 py-3 text-sm font-semibold hover:bg-brand-navy-dark hover:-translate-y-0.5 transition-all duration-200"
            >
              관리도 분석기 열기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            * 관리도 분석기는 별도 페이지로 개발 예정입니다. 현재는 준비 중입니다.
          </p>
        </div>
      }
    />
  );
}
