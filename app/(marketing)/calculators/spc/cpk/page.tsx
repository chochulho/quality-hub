import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import SpcAnalyzer from "@/components/spc/SpcAnalyzer";

export const metadata: Metadata = {
  title: "Cp Cpk 계산기 — 공정능력지수 무료 분석",
  description:
    "Cp, Cpk, Pp, Ppk 공정능력 지수를 무료로 계산합니다. LSL/USL 입력, Excel 데이터 붙여넣기, 히스토그램 + 정규곡선. 미니텝 없이 공정능력 분석.",
};

export default function CpkCalculatorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      {/* 브레드크럼 */}
      <Link
        href="/calculators/spc"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        SPC 분석기
      </Link>

      {/* 헤더 */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-brand-orange/10 rounded-xl p-2">
            <BarChart3 className="h-6 w-6 text-brand-orange" />
          </div>
          <span className="text-sm font-medium text-brand-orange">공정능력 분석기</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
          Cp / Cpk 계산기
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          규격값(LSL/Target/USL)과 측정 데이터를 입력하면 미니텝(Minitab) 스타일의
          공정능력 분석 결과를 즉시 확인할 수 있습니다.
          <br />
          비싼 미니텝 구독 없이도 Cp, Cpk, PPM 분석과 Excel·PDF 내보내기를 무료로 사용하세요.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Excel 붙여넣기", "히스토그램 + 정규곡선", "Cp/Cpk/Pp/Ppk", "PPM 분석", "Excel 내보내기", "PDF 저장"].map((f) => (
            <span key={f} className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1">{f}</span>
          ))}
        </div>
      </div>

      {/* 도구 */}
      <SpcAnalyzer />

      {/* 해석 기준 */}
      <div className="mt-16 pt-8 border-t border-border">
        <h2 className="text-lg font-bold text-brand-navy mb-4">공정능력 지수 해석 기준</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { range: "Cpk ≥ 1.67", label: "우수",   desc: "IATF 신규 공정 기준 충족",  color: "border-green-300 bg-green-50 text-green-800" },
            { range: "Cpk ≥ 1.33", label: "합격",   desc: "일반 양산 기준 충족",       color: "border-blue-300 bg-blue-50 text-blue-800" },
            { range: "Cpk ≥ 1.00", label: "주의",   desc: "조건부 합격 — 개선 필요",  color: "border-yellow-300 bg-yellow-50 text-yellow-800" },
            { range: "Cpk < 1.00", label: "불합격", desc: "즉시 공정 개선 필요",       color: "border-red-300 bg-red-50 text-red-800" },
          ].map((item) => (
            <div key={item.range} className={`border rounded-xl p-3 ${item.color}`}>
              <p className="text-sm font-bold font-mono">{item.range}</p>
              <p className="text-base font-extrabold mt-1">{item.label}</p>
              <p className="text-xs mt-1 opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
