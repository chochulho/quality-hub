import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import { ALL_TOOL_IDS, TOOLS } from "@/lib/auth/grades";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background: `
          radial-gradient(ellipse at 85% 15%, rgba(255, 232, 194, 0.6), transparent 50%),
          radial-gradient(ellipse at 95% 85%, rgba(220, 231, 245, 0.7), transparent 55%),
          #FFFFFF
        `,
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-sm font-medium text-brand-orange mb-4">
              중소기업 품질팀을 위한 완성형 솔루션
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy leading-tight mb-6">
              <span className="text-brand-orange">6개월</span> QMS 구축을
              <br />
              <span className="text-brand-orange">1주일</span>로.
            </h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-lg" style={{ wordBreak: "keep-all" }}>
              심사·APQP·게이지·부적합·변경관리 —{" "}
              <strong className="text-foreground">
                <span className="text-brand-orange">5가지</span> 도구
              </strong>
              가 이미 준비되어 있습니다.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-lg" style={{ wordBreak: "keep-all" }}>
              기업회원 하나로 전체 품질시스템을 가동하세요.{" "}
              <span className="text-brand-orange font-medium">+ SPC·QC7·FMEA 무료 계산 도구 포함</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              >
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 bg-white border border-border text-foreground rounded-full px-8 py-4 font-semibold hover:border-brand-navy hover:-translate-y-0.5 transition-all duration-200"
              >
                도구 둘러보기
              </Link>
            </div>

            {/* SaaS tool chips — grades.ts에서 데이터 자동 동기화, 바디 카피와 1:1 매핑 */}
            <div className="mt-10">
              <span className="text-xs text-muted-foreground block mb-2">유료 SaaS 도구</span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TOOL_IDS.map((id) => {
                  const tool = TOOLS[id];
                  return (
                    <a
                      key={id}
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-[11px] font-medium text-white ${tool.color} rounded-full px-2.5 py-1 hover:opacity-85 transition-opacity whitespace-nowrap`}
                    >
                      {tool.name}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm lg:max-w-md">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
