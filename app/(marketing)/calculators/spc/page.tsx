import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Activity, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "SPC 분석기 — 공정능력 분석 · 관리도 무료 계산기",
  description:
    "SPC 통계적 공정관리 도구 모음. 공정능력 분석(Cp/Cpk), X̄-R 관리도, I-MR 관리도, p 관리도. 데이터 붙여넣기로 즉시 분석. 회원가입 불필요.",
};

const tools = [
  {
    href:         "/calculators/spc/cpk",
    Icon:         BarChart3,
    label:        "공정능력 분석기",
    sublabel:     "Cp / Cpk / Pp / Ppk",
    desc:         "규격값(LSL/USL)과 측정 데이터를 입력하면 미니텝 스타일의 공정능력 분석 결과를 즉시 확인. Cp, Cpk, Pp, Ppk, PPM, Cpm.",
    seoKeyword:   "Cp Cpk 계산기",
    available:    true,
  },
  {
    href:         "/calculators/spc/xbar-r",
    Icon:         Activity,
    label:        "X̄-R / X̄-S 관리도",
    sublabel:     "소그룹 계량형 관리도",
    desc:         "소그룹 데이터를 붙여넣으면 UCL/CL/LCL 자동 계산. X̄-R, X̄-S 선택 가능. Nelson 규칙 이상 원인 자동 표시.",
    seoKeyword:   "X-bar R 관리도",
    available:    true,
  },
  {
    href:         "/calculators/spc/i-mr",
    Icon:         Activity,
    label:        "I-MR 관리도",
    sublabel:     "개별값 계량형 관리도",
    desc:         "개별 측정값(n=1) 데이터로 관리도를 그립니다. 소로트·연속공정 데이터에 적합. UCL/CL/LCL 자동 계산.",
    seoKeyword:   "I-MR 관리도",
    available:    true,
  },
  {
    href:         "/calculators/spc/p-chart",
    Icon:         Activity,
    label:        "계수치 관리도",
    sublabel:     "p / np / c / u",
    desc:         "불량률·불량 수·결점 수 이산형 데이터의 공정 이상을 탐지합니다. p, np, c, u 관리도 선택.",
    seoKeyword:   "p 관리도 부적합품률",
    available:    true,
  },
  {
    href:         "#",
    Icon:         TrendingUp,
    label:        "샘플링 검사",
    sublabel:     "KS Q ISO 2859 / AQL",
    desc:         "수입검사·공정검사 샘플 수 및 합격 판정 개수(Ac/Re) 자동 산출.",
    seoKeyword:   "AQL 샘플링 검사",
    available:    false,
  },
];

const learnLinks = [
  { href: "/learn/spc/control-chart", label: "관리도 완전 가이드 (X̄-R · I-MR · Nelson 규칙)" },
  { href: "/learn/capability/cp-cpk", label: "공정능력지수 Cp/Cpk 완전 정리" },
];

export default function SpcCalculatorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      {/* 헤더 */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-brand-orange/10 rounded-xl p-2">
            <BarChart3 className="h-6 w-6 text-brand-orange" />
          </div>
          <Link
            href="/calculators"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            무료 계산 도구
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4">
          SPC 분석기
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          통계적 공정관리(SPC) 도구 모음. 공정능력 분석부터 관리도까지 — 미니텝(Minitab) 없이도 됩니다.
          데이터를 Excel에서 붙여넣으면 즉시 분석 결과를 확인할 수 있습니다.
        </p>
      </div>

      {/* 도구 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-16">
        {tools.map((tool) => {
          const Icon = tool.Icon;
          const isAvailable = tool.available;

          const card = (
            <div className={`border rounded-2xl p-5 h-full flex flex-col transition-all duration-200 ${
              isAvailable
                ? "border-border hover:border-brand-navy hover:shadow-sm bg-white cursor-pointer"
                : "border-border bg-background-soft cursor-default opacity-70"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="bg-brand-orange/10 rounded-xl p-2.5">
                  <Icon className="h-5 w-5 text-brand-orange" />
                </div>
                <span className={`text-[10px] font-semibold rounded-full px-2.5 py-1 ${
                  isAvailable ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                }`}>
                  {isAvailable ? "사용 가능" : "개발 예정"}
                </span>
              </div>
              <h2 className="font-bold text-foreground mb-0.5">{tool.label}</h2>
              <p className="text-xs font-mono text-brand-orange mb-2">{tool.sublabel}</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.desc}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-2 italic">#{tool.seoKeyword}</p>
              {isAvailable && (
                <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-brand-navy">
                  바로 사용하기 <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );

          return isAvailable && tool.href !== "#" ? (
            <Link key={tool.label} href={tool.href}>{card}</Link>
          ) : (
            <div key={tool.label}>{card}</div>
          );
        })}
      </div>

      {/* 학습 링크 */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-bold text-brand-navy mb-4">SPC 학습 노트</h2>
        <div className="flex flex-wrap gap-3">
          {learnLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:border-brand-navy hover:bg-muted transition-all"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
