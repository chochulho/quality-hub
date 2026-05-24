import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Kanban 시뮬레이터 — 준비 중",
  description:
    "BOM 기반 칸반 발행 시뮬레이터. 품질기술사 시험 대비 Lean 학습 도구. 준비 중입니다.",
};

export default function KanbanComingSoonPage() {
  return (
    <ComingSoonPage
      feature="Kanban 시뮬레이터"
      description="BOM 기반 칸반 발행 흐름과 일별 재고 변화를 시뮬레이션하는 학습 도구를 가다듬고 있습니다. 생산 칸반·인출 칸반·부품주문 칸반의 발행 원리를 직접 체험할 수 있도록 개선 중입니다."
      expectedDate="2026년 Q3 공개 예정"
      notifyEmail={true}
      backHref="/learn/exam/pqe"
      backLabel="품질기술사 학습으로"
    />
  );
}
