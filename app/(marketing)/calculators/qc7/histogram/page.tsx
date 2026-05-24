import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "히스토그램 만들기 — 무료 온라인 히스토그램 계산기",
  description:
    "히스토그램(Histogram)을 무료로 만들어보세요. 측정 데이터를 입력하면 급간 자동 설정, 정규분포 곡선 오버레이, 규격선 표시. Excel 다운로드 지원.",
};

export default function HistogramPage() {
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
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">히스토그램</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          측정 데이터의 분포 모양을 시각화하여 공정의 집중 경향과 산포를 파악합니다.
          데이터를 입력하면 급간을 자동으로 설정하고 정규분포 곡선을 함께 표시합니다.
        </p>
      </div>

      <QC7Viewer />
    </div>
  );
}
