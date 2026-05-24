import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "산점도 만들기 — 무료 온라인 산포도 (상관관계 분석)",
  description:
    "산점도(산포도, Scatter Plot)를 무료로 만들어보세요. 두 변수 간의 상관관계를 시각화하고 상관계수(r)를 자동 계산합니다. Excel 데이터 붙여넣기 지원.",
};

export default function ScatterPage() {
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
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">산점도 (상관 분석)</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          두 변수 간의 관계를 점으로 표현합니다. 원인과 결과가 상관 관계가 있는지 시각적으로
          확인하고, 상관계수(r) 값으로 관계의 강도를 수치화합니다.
        </p>
      </div>

      <QC7Viewer />
    </div>
  );
}
