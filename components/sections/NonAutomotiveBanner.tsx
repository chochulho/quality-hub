import { ExternalLink } from "lucide-react";

const TOOLS = [
  { label: "AuditSay", href: "https://auditsay.com", desc: "ISO 심사 통합" },
  { label: "Gauge Manager", href: "https://gaugemanager.com", desc: "측정기기 관리" },
  { label: "APQP Manager", href: "https://apqpmanager.com", desc: "APQP 문서 관리" },
];

export default function NonAutomotiveBanner() {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 md:p-10 md:flex md:items-center md:gap-10">
          <div className="text-5xl mb-5 md:mb-0 md:shrink-0 select-none" aria-hidden="true">
            🏭
          </div>
          <div className="flex-1">
            <h3
              className="text-xl md:text-2xl font-extrabold text-brand-navy mb-2"
              style={{ wordBreak: "keep-all" }}
            >
              자동차가 아닌 회사도 환영합니다
            </h3>
            <p
              className="text-sm text-muted-foreground mb-5 leading-relaxed"
              style={{ wordBreak: "keep-all" }}
            >
              IATF 16949이 없어도 ISO 9001/14001 심사, 측정기기 관리,
              APQP 문서 작성을 단독 도구로 시작할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              {TOOLS.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-orange hover:text-brand-orange transition-colors duration-200"
                >
                  {tool.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
