import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = { title: "KPI/BSC" };

export default function KpiPage() {
  return (
    <ComingSoonPage
      feature="KPI/BSC"
      description="조직 목표·실적·조치내용을 월별로 주관부문이 기록하고 경영자에게 보고하는 기능을 준비하고 있습니다."
      backHref="/management"
      backLabel="경영관리 개요로"
    />
  );
}
