import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = { title: "비상계획" };

export default function ContingencyPlanPage() {
  return (
    <ComingSoonPage
      feature="비상계획"
      description="자연재해·사이버공격 등 비상상황별 리스크를 평가하고, 시나리오 입력·업로드와 훈련 계획·실적을 관리하는 기능을 준비하고 있습니다."
      backHref="/management"
      backLabel="경영관리 개요로"
    />
  );
}
