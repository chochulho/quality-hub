import { ExternalLink } from "lucide-react";
import { ALL_TOOL_IDS, TOOLS } from "@/lib/auth/grades";

export default function ToolGrid() {
  return (
    <section className="py-16 md:py-24 bg-background-soft">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-brand-orange mb-2">관련 도구</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-navy">
            실무를 더 빠르게 만드는 도구들
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            QmIntel과 함께하는 자매 SaaS 서비스. 지식에서 실무로 자연스럽게 연결됩니다.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_TOOL_IDS.map((toolId) => {
            const tool = TOOLS[toolId];
            return (
              <div
                key={tool.id}
                className="bg-white border border-border rounded-3xl overflow-hidden hover:border-brand-navy transition-colors duration-200 group"
              >
                <div className={`${tool.color} px-6 py-5`}>
                  <p className="text-xs font-medium text-white/70 mb-1">{tool.tagline}</p>
                  <h3 className="text-xl font-bold text-white">{tool.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {tool.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-orange transition-colors"
                  >
                    {tool.name} 방문하기
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
