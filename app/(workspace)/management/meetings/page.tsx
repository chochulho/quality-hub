import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = { title: "회의" };

export default function MeetingsPage() {
  return (
    <ComingSoonPage
      feature="회의"
      description="경영 관련 회의 안건과 결과를 기록하는 기능을 준비하고 있습니다."
      backHref="/management"
      backLabel="경영관리 개요로"
    />
  );
}
