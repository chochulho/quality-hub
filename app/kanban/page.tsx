import type { Metadata } from "next";
import { KanbanSimulator } from "@/components/kanban/KanbanSimulator";

export const metadata: Metadata = {
  title: "칸반 시뮬레이션 | Quality Hub",
  description:
    "BOM 기반 주간 칸반 흐름 시뮬레이션. 생산 칸반·인출 칸반·부품주문 칸반의 발행 흐름과 일별 재고 변화를 추적합니다.",
};

export default function KanbanPage() {
  return (
    <div className="min-h-screen bg-background">
      <KanbanSimulator />
    </div>
  );
}
