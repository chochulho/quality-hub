import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "QC 7가지 도구 — 파레토 · 히스토그램 · 특성요인도 무료 계산기",
  description:
    "체크시트, 히스토그램, 파레토 차트, 특성요인도(피쉬본), 산포도, 층별, 관리도 — QC 7가지 도구를 무료로 직접 실습합니다. 결과 Excel 다운로드.",
};

export default function Qc7CalculatorsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link href="/calculators" className="hover:text-foreground transition-colors">무료 계산 도구</Link>
        </div>
        <p className="text-sm font-medium text-brand-orange mb-2">QC 7가지 도구</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-3">
          QC 7가지 도구
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          품질 문제 해결의 기본 7가지 통계적 도구입니다. 각 도구의 개념을 이해하고
          실제 데이터를 입력해 바로 실습하세요. 결과는 Excel로 다운로드할 수 있습니다.
        </p>
        {/* 개별 도구 SEO 링크 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { href: "/calculators/qc7/pareto",          label: "파레토 차트" },
            { href: "/calculators/qc7/histogram",        label: "히스토그램" },
            { href: "/calculators/qc7/fishbone",         label: "특성요인도 (피쉬본)" },
            { href: "/calculators/qc7/check-sheet",      label: "체크시트" },
            { href: "/calculators/qc7/scatter",          label: "산점도" },
            { href: "/calculators/qc7/stratification",   label: "층별" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 text-xs border border-border rounded-full px-3 py-1 text-muted-foreground hover:border-brand-navy hover:text-brand-navy transition-all"
            >
              {link.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>

      <QC7Viewer />
    </div>
  );
}
