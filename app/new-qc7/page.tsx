import type { Metadata } from "next";
import NewQC7Viewer from "@/components/new-qc7/NewQC7Viewer";

export const metadata: Metadata = {
  title: "신 QC 7가지 도구",
  description:
    "친화도, 연관도, 계통도, 매트릭스도, 매트릭스 데이터 해석, PDPC, 애로우 다이어그램 — 신 QC 7가지 도구를 설명하고 직접 실습합니다.",
};

export default function NewQC7Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-10">
        <p className="text-sm font-medium text-brand-orange mb-3">품질 도구</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-3">신 QC 7가지 도구</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          기획·관리 단계에서 활용하는 7가지 도구입니다. 언어 데이터와 관계 분석에 강점이 있으며, 복잡한 문제 구조를 시각화합니다. 실습 후 Excel로 다운로드하여 실무에 바로 활용하세요.
        </p>
      </div>
      <NewQC7Viewer />
    </div>
  );
}
