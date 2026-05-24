import Hero from "@/components/sections/Hero";
import TrustCards from "@/components/sections/TrustCards";
import FreeToolsSection from "@/components/sections/FreeToolsSection";
import ToolGrid from "@/components/sections/ToolGrid";
import LearnPreview from "@/components/sections/LearnPreview";
import BlogPreview from "@/components/sections/BlogPreview";
import CtaSection from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustCards />
      <FreeToolsSection />
      <ToolGrid />
      <LearnPreview />
      <BlogPreview />
      <CtaSection />
    </>
  );
}
