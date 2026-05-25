import { CheckCircle } from "lucide-react";

const cards = [
  {
    title: "30년 현장 경험 기반",
    description: "이론이 아닌 실제 현장에서 검증된 내용과 도구만 담았습니다.",
  },
  {
    title: "별도 시스템 구축 불필요",
    description: "기업회원 가입 후 즉시 도구를 사용합니다. 별도 IT 구축 없이.",
  },
  {
    title: "지식 + 운영 도구 통합",
    description: "품질 학습 위키부터 5가지 실무 SaaS 도구까지 한 플랫폼에서.",
  },
];

export default function TrustCards() {
  return (
    <section className="max-w-6xl mx-auto px-4 -mt-6 pb-16 md:pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-border rounded-2xl p-5 flex items-start gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{card.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
