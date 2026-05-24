import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, ListChecks, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "무료 계산 도구 — 회원가입 없이 즉시 사용",
  description:
    "SPC 공정능력 분석기, QC 7가지 도구, FMEA 체험 데모. 품질 실무에 바로 쓰는 무료 계산 도구 모음. 데이터 붙여넣기만 하면 됩니다.",
};

const tools = [
  {
    href:  "/calculators/spc",
    Icon:  BarChart3,
    label: "SPC 분석기",
    sublabel: "공정능력 분석 (Cp/Cpk)",
    desc:  "엑셀 없이 1분 만에. 데이터 붙여넣기만 하세요. Cp/Cpk/Pp/Ppk + X̄-R/I-MR/p 관리도.",
    keywords: ["공정능력지수 계산", "Cp Cpk 계산기", "관리도 작성", "SPC 엑셀 대체"],
    available: true,
  },
  {
    href:  "/calculators/qc7",
    Icon:  ListChecks,
    label: "QC 7가지 도구",
    sublabel: "파레토 · 히스토그램 · 특성요인도",
    desc:  "파레토·히스토그램·피쉬본·산점도·층별·체크시트 인터랙티브 작성. 결과 Excel 다운로드.",
    keywords: ["파레토 차트", "특성요인도", "히스토그램 만들기", "QC7 도구"],
    available: true,
  },
  {
    href:  null,
    Icon:  FlaskConical,
    label: "FMEA 체험 데모",
    sublabel: "AI 대화형 AIAG-VDA",
    desc:  "AI와 대화하면서 FMEA 자동 작성. 3분 체험. APQP Manager의 핵심 기능 미리보기.",
    keywords: ["FMEA 작성법", "AIAG VDA FMEA", "AI FMEA"],
    available: false,
  },
];

export default function CalculatorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-brand-orange mb-3">무료 계산 도구</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-4">
          회원가입 없이 즉시 사용
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          품질 실무에서 매일 쓰는 도구들. 데이터를 붙여넣으면 바로 분석 결과가 나옵니다.
          미니텝·엑셀 매크로 없이도 됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((tool) => {
          const Icon = tool.Icon;
          const card = (
            <div
              className={`border rounded-2xl p-6 h-full flex flex-col transition-all duration-200 ${
                tool.available
                  ? "border-border bg-white hover:border-brand-navy hover:shadow-sm cursor-pointer"
                  : "border-border bg-background-soft cursor-default opacity-70"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-brand-orange/10 rounded-xl p-3">
                  <Icon className="h-6 w-6 text-brand-orange" />
                </div>
                {!tool.available && (
                  <span className="text-[10px] font-semibold bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                    준비 중
                  </span>
                )}
              </div>

              <h2 className="font-extrabold text-foreground text-lg mb-0.5">{tool.label}</h2>
              <p className="text-xs font-mono text-brand-orange mb-3">{tool.sublabel}</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.desc}</p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {tool.keywords.slice(0, 2).map((kw) => (
                  <span key={kw} className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {kw}
                  </span>
                ))}
              </div>

              {tool.available && (
                <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-brand-navy">
                  바로 사용하기
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );

          return tool.available && tool.href ? (
            <Link key={tool.label} href={tool.href}>{card}</Link>
          ) : (
            <div key={tool.label}>{card}</div>
          );
        })}
      </div>

      {/* 학습 위키 연결 */}
      <div className="mt-12 p-6 rounded-3xl bg-background-soft border border-border flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-bold text-brand-navy mb-1">이론도 함께 공부하고 싶다면?</p>
          <p className="text-sm text-muted-foreground">SPC·FMEA·IATF 16949 핵심 개념을 학습 위키에서 정리했습니다.</p>
        </div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy border border-brand-navy rounded-full px-5 py-2.5 hover:bg-brand-navy hover:text-white transition-all duration-200 shrink-0"
        >
          학습 위키 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
