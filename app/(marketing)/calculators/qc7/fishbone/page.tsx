import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "특성요인도 (피쉬본 다이어그램) — 무료 온라인 작성 도구",
  description:
    "특성요인도(이시카와/피쉬본 다이어그램)를 무료로 작성합니다. 4M(Man/Machine/Material/Method) 또는 6M 원인을 인터랙티브하게 입력. SVG/Excel 다운로드.",
};

export default function FishbonePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <Link
        href="/calculators/qc7"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        QC 7가지 도구
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2">QC 7가지 도구</p>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
          특성요인도 (피쉬본 다이어그램)
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          품질 문제(결과)와 원인 요소들의 관계를 시각화합니다. 4M(사람·기계·재료·방법) 또는
          6M 골격으로 원인을 구조화하고 근본 원인을 체계적으로 분석하세요.
        </p>
      </div>

      <QC7Viewer />
    </div>
  );
}
