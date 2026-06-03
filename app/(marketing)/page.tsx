import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import TrustCards from "@/components/sections/TrustCards";
import FreeToolsSection from "@/components/sections/FreeToolsSection";
import ToolGrid from "@/components/sections/ToolGrid";
import LearnPreview from "@/components/sections/LearnPreview";
import NewFactoryBanner from "@/components/sections/NewFactoryBanner";
import BlogPreview from "@/components/sections/BlogPreview";
import CtaSection from "@/components/sections/CtaSection";
import NonAutomotiveBanner from "@/components/sections/NonAutomotiveBanner";

const TITLE = "QMintel — AI 기반 품질 관리 플랫폼 | 자동차 부품 QMS";
const DESCRIPTION =
  "30년 자동차 부품 품질 실무 + AI 도구. AuditSay 심사 통합, AI 대화형 FMEA, APQP·게이지·부적합·변경관리. 무료 SPC·QC7 계산기. IATF 16949 한국어 SaaS.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: "QMintel — AI 기반 품질 관리 플랫폼",
    description: DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: "QMintel",
  },
  twitter: {
    card: "summary",
    title: "QMintel — AI 기반 품질 관리 플랫폼",
    description: DESCRIPTION,
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustCards />
      <FreeToolsSection />
      <ToolGrid />
      <NonAutomotiveBanner />
      <LearnPreview />
      <NewFactoryBanner />
      <BlogPreview />
      <CtaSection />
    </>
  );
}
