import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = { title: "리스크분석" };

export default function RiskAnalysisPage() {
  return (
    <ComingSoonPage
      feature="리스크분석"
      description="이해관계자를 파악하고 리스크 분석 템플릿으로 평가한 뒤, 조직의 방향성·조치내용·일정·담당을 기록하고 재평가하는 기능을 준비하고 있습니다."
      backHref="/management"
      backLabel="경영관리 개요로"
    />
  );
}
