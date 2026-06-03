import type { Metadata } from "next";
import { BookOpen, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "소개",
  description: "QMintel을 만든 이유와 운영자 소개입니다.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <p className="text-sm font-medium text-brand-orange mb-3">About</p>
      <h1 className="text-4xl font-extrabold text-brand-navy mb-6">소개</h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-brand-navy mb-3">이 사이트의 미션</h2>
        <p className="text-muted-foreground leading-relaxed">
          "품질 실무자가 IATF 16949·품질기술사 시험·실무 도구를 한 곳에서 만난다."
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          품질 분야의 지식은 규격집, 교재, 커뮤니티에 흩어져 있습니다.
          QMintel은 이를 하나의 체계적인 공간에 정리하고,
          실무에서 바로 쓸 수 있는 도구들과 연결합니다.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-brand-navy mb-3">운영자 소개</h2>
        <div className="bg-background-soft border border-border rounded-2xl p-6">
          <p className="text-muted-foreground italic text-sm">
            [TODO: 운영자 프로필 작성 — 이름, 배경, 품질 분야 경력, 이 사이트를 만든 계기]
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-brand-navy mb-4">자매 도구</h2>
        <p className="text-muted-foreground mb-5">
          QMintel은 아래 세 가지 SaaS 도구들의 지식 베이스 역할을 합니다.
          각 도구는 독립적으로 사용 가능하지만, QMintel에서 배운 내용을 실무에 적용하는 가장 빠른 방법입니다.
        </p>
        <div className="space-y-4">
          {[
            {
              name: "AuditSay",
              url: "https://auditsay.com",
              desc: "IATF·ISO 심사 체크리스트 자동 생성 SaaS",
            },
            {
              name: "APQP Manager",
              url: "https://apqpmanager.com",
              desc: "APQP 5문서(PFMEA → PPAP) 통합 관리 SaaS",
            },
            {
              name: "Gauge Manager",
              url: "https://gaugemanager.com",
              desc: "측정기 검교정·MSA 관리 SaaS",
            },
          ].map((tool) => (
            <div
              key={tool.name}
              className="flex items-center justify-between border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-brand-orange" />
                <div>
                  <p className="font-semibold text-sm text-foreground">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </div>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-brand-navy hover:text-brand-orange transition-colors"
              >
                {tool.url.replace("https://", "")}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-brand-navy mb-3">연락</h2>
        <a
          href="mailto:support@qmintel.com"
          className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-orange transition-colors"
        >
          <Mail className="h-4 w-4" />
          support@qmintel.com
        </a>
      </section>
    </div>
  );
}
