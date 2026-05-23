import Link from "next/link";
import { ArrowRight, Building2, BookOpen } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 기업회원 카드 */}
          <div
            className="rounded-3xl p-8 flex flex-col justify-between min-h-[240px]"
            style={{
              background: `
                radial-gradient(ellipse at 90% 10%, rgba(255, 232, 194, 0.5), transparent 60%),
                #1E3666
              `,
            }}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-4">
                <Building2 className="h-3.5 w-3.5 text-white/80" />
                <span className="text-xs font-medium text-white/80">기업회원</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-snug mb-3" style={{ wordBreak: "keep-all" }}>
                QMS 구축 없이<br />
                <span className="text-[#FFB347]">전체 품질시스템</span>을 가동하세요.
              </h2>
              <p className="text-sm text-white/70 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                심사·APQP·게이지·SPC·부적합·변경관리까지.<br />
                5가지 도구를 기업회원 하나로 운영합니다.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                도입 문의하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* 개인 학습 카드 */}
          <div className="rounded-3xl p-8 bg-white border border-border flex flex-col justify-between min-h-[240px]">
            <div>
              <div className="inline-flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 mb-4">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">개인 학습</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-navy leading-snug mb-3" style={{ wordBreak: "keep-all" }}>
                품질기술사부터<br />
                <span className="text-brand-orange">IATF 실무</span>까지.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
                30년 현장 경험이 담긴 학습 노트.<br />
                통계·SPC·MSA·FMEA·신뢰성 — 무료로 학습하세요.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-navy hover:text-white hover:-translate-y-0.5 transition-all duration-200"
              >
                학습 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
