import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = { title: "경영검토" };

export default function ManagementReviewPage() {
  return (
    <ComingSoonPage
      feature="경영검토"
      description="IATF 16949 요구사항에 맞는 입력사항을 기록해 경영검토 회의 자료로 쓰는 기능을 준비하고 있습니다."
      backHref="/management"
      backLabel="경영관리 개요로"
    />
  );
}
