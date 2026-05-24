import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "VSM 시뮬레이터 — 준비 중",
  description:
    "가치흐름지도(VSM) 학습 시뮬레이터. 품질기술사 시험 대비 Lean 학습 도구. 준비 중입니다.",
};

export default function VsmComingSoonPage() {
  return (
    <ComingSoonPage
      feature="VSM 시뮬레이터"
      description="가치흐름지도 학습 시뮬레이터를 가다듬고 있습니다. 공급자→고객 전체 흐름의 리드타임·NVA 비율을 직접 계산해 볼 수 있는 인터랙티브 도구로 개선 중입니다."
      expectedDate="2026년 Q3 공개 예정"
      notifyEmail={true}
      backHref="/learn/exam/pqe"
      backLabel="품질기술사 학습으로"
    />
  );
}
