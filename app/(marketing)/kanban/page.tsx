import { redirect } from "next/navigation";

// Kanban 시뮬레이터는 시험 학습 코너로 이동되었습니다 (베타 기간 준비 중).
// 구현 파일: components/kanban/, lib/kanban/ — 완성도 개선 후 재공개 예정.
export default function KanbanRedirect() {
  redirect("/learn/exam/pqe/lean/kanban");
}
