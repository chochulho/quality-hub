import PillHeader from "@/components/layout/PillHeader";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";

/**
 * 마케팅 레이아웃 — 비로그인·둘러보기 사용자 (§6)
 *
 * 포함: PillHeader (떠 있는 알약 네비) + Footer
 * 대상: 랜딩, 블로그, 학습, 계산 도구, 도구 소개, 요금제, 지원 등 모든 공개 페이지
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <>
      <PillHeader />
      <main className="flex-1 pt-20">{children}</main>
      <Footer hideBlog={!!session} />
    </>
  );
}
