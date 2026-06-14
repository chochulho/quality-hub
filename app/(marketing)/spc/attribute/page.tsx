import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import AttributeControlChart from "@/components/control-chart/AttributeControlChart";

export const metadata: Metadata = {
  title: "계수치 관리도 — p / np / c / u | QMintel",
  description: "p, np, c, u 관리도를 직접 그려보세요. 불량 수·결점 수 데이터를 입력하면 관리한계를 자동 계산하고 Excel로 내보낼 수 있습니다.",
};

export default function AttributeChartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Back */}
      <Link
        href="/spc"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        SPC 도구 목록으로
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2">
          계수치 관리도
        </p>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
          p / np / c / u 관리도
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          불량률·불량 수·결점 수 등 이산형(계수형) 데이터의 공정 이상을 탐지합니다.
          데이터를 입력하면 UCL/CL/LCL을 자동 계산하고 관리도를 그립니다.
        </p>
      </div>

      {/* Chart type guide */}
      <div className="bg-muted rounded-2xl p-5 mb-8 text-sm">
        <p className="font-semibold text-foreground mb-3">관리도 선택 기준</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { type: "p",  desc: "불량률 (%) · 샘플 크기 변동 가능" },
            { type: "np", desc: "불량 수 · 샘플 크기 고정" },
            { type: "c",  desc: "결점 수 · 검사 단위 고정" },
            { type: "u",  desc: "단위당 결점 수 · 검사 단위 변동 가능" },
          ].map(({ type, desc }) => (
            <div key={type} className="flex gap-2 items-start">
              <span className="font-mono font-bold text-brand-orange w-6 shrink-0">{type}</span>
              <span className="text-muted-foreground text-xs leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tool */}
      <AttributeControlChart />

      {/* Learn link */}
      <div className="mt-10 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <Link href="/learn/spc/control-chart" className="hover:text-brand-navy transition-colors">
          관리도 이론 학습하기 — 관리한계 계산 공식·Nelson 규칙·Western Electric 규칙
        </Link>
      </div>
    </div>
  );
}
