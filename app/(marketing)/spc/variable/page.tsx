import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import VariableControlChart from "@/components/control-chart/VariableControlChart";

export const metadata: Metadata = {
  title: "계량치 관리도 — X̄-R / X̄-S / I-MR | QMintel",
  description: "X̄-R, X̄-S, I-MR 관리도를 직접 그려보세요. 데이터를 붙여넣으면 UCL/CL/LCL을 자동 계산하고 Excel로 내보낼 수 있습니다.",
};

export default function VariableChartPage() {
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
          계량치 관리도
        </p>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
          X̄-R / X̄-S / I-MR 관리도
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          연속형(계량형) 데이터의 공정 이상을 탐지합니다. Excel에서 데이터를 복사·붙여넣기하면
          UCL/CL/LCL을 자동으로 계산하고 관리도를 그립니다.
        </p>
      </div>

      {/* How to use */}
      <div className="bg-muted rounded-2xl p-5 mb-8 text-sm leading-relaxed">
        <p className="font-semibold text-foreground mb-2">사용 방법</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>관리도 종류를 선택합니다 (X̄-R 권장).</li>
          <li>
            Excel에서 데이터를 복사(Ctrl+C)하여 입력란에 붙여넣기(Ctrl+V)합니다.
            <br />
            <span className="text-xs ml-4">
              X̄-R / X̄-S: 행 = 소그룹, 열 = 측정값 | I-MR: 행 당 측정값 1개
            </span>
          </li>
          <li>
            <strong className="text-brand-navy">관리도 분석</strong> 버튼을 클릭합니다.
          </li>
          <li>결과를 확인하고 Excel로 다운로드합니다.</li>
        </ol>
      </div>

      {/* Tool */}
      <VariableControlChart />

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
