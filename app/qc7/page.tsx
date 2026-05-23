import type { Metadata } from "next";
import QC7Viewer from "@/components/qc7/QC7Viewer";

export const metadata: Metadata = {
  title: "QC 7가지 도구",
  description:
    "체크시트, 히스토그램, 파레토 차트, 특성요인도, 산포도, 층별, 관리도 — QC 7가지 도구를 설명하고 직접 실습합니다.",
};

export default function QC7Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-10">
        <p className="text-sm font-medium text-brand-orange mb-3">품질 도구</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-3">QC 7가지 도구</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          품질 문제 해결의 기본 7가지 통계적 도구입니다. 각 도구의 개념을 이해하고 실제 데이터를 입력해 바로 실습하세요. 결과는 Excel로 다운로드할 수 있습니다.
        </p>
      </div>
      <QC7Viewer />
    </div>
  );
}
