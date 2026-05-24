import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import VariableControlChart from "@/components/control-chart/VariableControlChart";

export const metadata: Metadata = {
  title: "I-MR 관리도 — 개별값 관리도 무료 계산기",
  description:
    "I-MR 관리도를 무료로 그려보세요. 개별 측정값(n=1) 데이터로 UCL/CL/LCL 자동 계산. 소로트·연속공정에 적합. Excel 데이터 붙여넣기.",
};

export default function IMRPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <Link
        href="/calculators/spc"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        SPC 분석기
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2">계량형 관리도</p>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
          I-MR 관리도 (개별값-이동범위)
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          개별 측정값(n=1) 데이터로 공정을 관리합니다. 소로트 생산, 화학·연속 공정, 측정 비용이
          높은 경우에 적합합니다. I 차트와 MR 차트를 함께 사용합니다.
        </p>
      </div>

      <div className="bg-muted rounded-2xl p-5 mb-8 text-sm">
        <p className="font-semibold text-foreground mb-2">I-MR 관리도를 사용하는 경우</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>측정 주기가 길어 소그룹 구성이 어려울 때</li>
          <li>공정이 연속적이어서 동일 시점 반복 측정이 불가할 때</li>
          <li>파괴 검사 등 측정 비용이 높아 n=1만 가능할 때</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          * 아래 도구에서 <strong className="text-brand-navy">I-MR</strong>을 선택하세요.
        </p>
      </div>

      <VariableControlChart />

      <div className="mt-10 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <Link href="/learn/spc/control-chart" className="hover:text-brand-navy transition-colors">
          관리도 이론 학습하기 — 관리한계 계산 공식·Nelson 규칙·Western Electric 규칙
        </Link>
      </div>
    </div>
  );
}
