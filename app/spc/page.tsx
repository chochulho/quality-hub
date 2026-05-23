import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, TrendingUp, Activity, ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "SPC — 통계적 공정관리",
  description:
    "통계적 공정관리(SPC) 도구 모음. 공정능력 분석(Cp/Cpk), 관리도, 샘플링 검사 등을 지원합니다.",
};

const tools = [
  {
    href: "/capability",
    icon: BarChart3,
    label: "공정능력 분석",
    sublabel: "Cp / Cpk / Pp / Ppk",
    desc: "규격값(LSL/USL)과 측정 데이터를 입력하면 미니텝 스타일의 공정능력 분석 결과를 즉시 확인. Excel 붙여넣기·일괄 분석·PDF 내보내기 지원.",
    status: "사용 가능",
    statusColor: "bg-green-100 text-green-800",
    internal: true,
  },
  {
    href: "/spc/variable",
    icon: Activity,
    label: "계량치 관리도",
    sublabel: "X̄-R / X̄-S / I-MR",
    desc: "연속형 데이터로 공정 이상을 탐지합니다. 소그룹 데이터 붙여넣기 → UCL/CL/LCL 자동 계산 → Excel 내보내기.",
    status: "사용 가능",
    statusColor: "bg-green-100 text-green-800",
    internal: true,
  },
  {
    href: "/spc/attribute",
    icon: Activity,
    label: "계수치 관리도",
    sublabel: "p / np / c / u",
    desc: "불량 수·결점 수 등 이산형 데이터로 공정을 관리합니다. 관리도 종류 선택 → 데이터 입력 → Excel 내보내기.",
    status: "사용 가능",
    statusColor: "bg-green-100 text-green-800",
    internal: true,
  },
  {
    href: "#",
    icon: TrendingUp,
    label: "샘플링 검사",
    sublabel: "KS Q ISO 2859 / AQL",
    desc: "수입검사·공정검사 샘플 수 및 합격 판정 개수(Ac/Re) 자동 산출. AQL 테이블 내장.",
    status: "개발 예정",
    statusColor: "bg-muted text-muted-foreground",
    internal: true,
  },
];

const learnLinks = [
  { href: "/learn/spc/control-chart", label: "관리도 완전 가이드 (X̄-R / I-MR / Nelson 규칙)" },
  { href: "/learn/capability/cp-cpk", label: "공정능력지수 Cp/Cpk" },
  { href: "/learn", label: "학습 위키 전체 보기" },
];

export default function SpcIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-medium text-brand-orange mb-3">SPC 도구 모음</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4">
          통계적 공정관리 (SPC)
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Statistical Process Control — 데이터 기반으로 공정을 분석하고 품질을 유지하는 방법론입니다.
          IATF 16949의 코어 도구 중 하나로, 공정능력 분석부터 관리도까지 다양한 도구를 제공합니다.
        </p>
      </div>

      {/* Tool grid */}
      <div className="space-y-4 mb-16">
        <h2 className="text-lg font-bold text-brand-navy">SPC 도구</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isAvailable = tool.status === "사용 가능";

            const CardContent = (
              <div
                className={`border rounded-2xl p-5 h-full flex flex-col transition-all duration-200 ${
                  isAvailable
                    ? "border-border hover:border-brand-navy hover:shadow-sm bg-white cursor-pointer"
                    : "border-border bg-background-soft cursor-default opacity-70"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-brand-orange/10 rounded-xl p-2.5">
                    <Icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <span className={`text-[10px] font-semibold rounded-full px-2.5 py-1 ${tool.statusColor}`}>
                    {tool.status}
                  </span>
                </div>
                <h3 className="font-bold text-foreground mb-0.5">{tool.label}</h3>
                <p className="text-xs font-mono text-brand-orange mb-2">{tool.sublabel}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {tool.desc}
                </p>
                {isAvailable && (
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-brand-navy">
                    바로 사용하기
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );

            return isAvailable ? (
              <Link key={tool.label} href={tool.href}>
                {CardContent}
              </Link>
            ) : (
              <div key={tool.label}>{CardContent}</div>
            );
          })}
        </div>
      </div>

      {/* Learn links */}
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
