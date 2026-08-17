import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = { title: "TFT활동" };

export default function TftActivityPage() {
  return (
    <ComingSoonPage
      feature="TFT활동"
      description="부서 간 TFT 활동을 기록하고 추적하는 기능을 준비하고 있습니다."
      backHref="/management"
      backLabel="경영관리 개요로"
    />
  );
}
