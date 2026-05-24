import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "파레토 차트 만들기 — 무료 온라인 파레토 분석기",
  description:
    "파레토 차트(Pareto Chart)를 무료로 만들어보세요. 불량 항목·발생 빈도를 입력하면 80/20 법칙으로 핵심 원인을 시각화합니다. Excel 다운로드 지원.",
};

export default function ParetoPage() {
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
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">파레토 차트</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          80/20 법칙에 따라 전체 문제의 80%를 유발하는 20%의 원인을 찾는 도구입니다.
          불량 항목과 발생 빈도를 입력하면 누적 비율 곡선과 막대그래프로 시각화합니다.
        </p>
      </div>

      <QC7Viewer />

      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-sm font-semibold text-brand-navy mb-3">다른 QC 도구도 사용해보세요</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/calculators/qc7/fishbone",       label: "특성요인도" },
            { href: "/calculators/qc7/histogram",       label: "히스토그램" },
            { href: "/calculators/qc7/check-sheet",     label: "체크시트" },
            { href: "/calculators/qc7/scatter",         label: "산점도" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 text-sm border border-border rounded-full px-4 py-2 text-foreground hover:border-brand-navy transition-all"
            >
              {link.label} <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
