import type { Metadata } from "next";
import { QFDViewer } from "@/components/qfd/QFDViewer";

export const metadata: Metadata = {
  title: "QFD 매트릭스 | QMintel",
  description:
    "품질기능전개(QFD) 매트릭스를 직접 입력하고 Excel로 다운로드. VOC부터 공정 매개변수까지 3단계 폭포 구조 지원.",
};

export default function QFDPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-orange mb-2">분석 도구</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-2">
          QFD 매트릭스
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          고객 요구사항(VOC)을 제품 특성 → 부품 특성 → 공정 매개변수로 단계별 전개합니다.
          관계 강도와 지붕 상관을 입력하면 가중 점수와 우선순위가 자동 계산됩니다.
        </p>
      </div>

      {/* Tool */}
      <QFDViewer />
    </div>
  );
}
