import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "체크시트 만들기 — 무료 온라인 체크시트 양식",
  description:
    "체크시트(Check Sheet)를 무료로 만들어보세요. 불량 유형·발생 위치를 정의하고 데이터를 집계합니다. 파레토 차트 연동, Excel 양식 다운로드.",
};

export default function CheckSheetPage() {
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
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">체크시트</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          데이터를 수집하고 집계하기 위한 가장 기본적인 도구입니다. 불량 유형이나 발생 위치를
          사전에 정의하고 일정 기간 데이터를 체크(√)하면서 현황을 파악합니다.
        </p>
      </div>

      <QC7Viewer />
    </div>
  );
}
