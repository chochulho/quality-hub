import { redirect } from "next/navigation";

// VSM 시뮬레이터는 시험 학습 코너로 이동되었습니다 (베타 기간 준비 중).
// 구현 파일: components/vsm/, lib/vsm/ — 완성도 개선 후 재공개 예정.
export default function VsmRedirect() {
  redirect("/learn/exam/pqe/lean/vsm");
}
