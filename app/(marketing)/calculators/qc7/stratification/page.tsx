import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "층별 (층화) — 데이터 층별 분석 무료 도구",
  description:
    "층별(층화, Stratification) 분석을 무료로 해보세요. 전체 데이터를 작업자·기계·시간대·재료별로 나누어 품질 차이의 원인을 특정합니다.",
};

export default function StratificationPage() {
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
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">층별 (층화)</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          전체 데이터를 특정 기준(작업자·기계·재료·시간대 등)으로 나누어 각 그룹 간의 차이를
          비교합니다. 데이터 내에 숨겨진 원인 요인을 찾는 데 강력한 도구입니다.
        </p>
      </div>

      <QC7Viewer />
    </div>
  );
}
