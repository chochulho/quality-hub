import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Q&A",
  description: "QMintel 자주 묻는 질문",
};

const FAQ = [
  {
    category: "가입 · 요금제",
    items: [
      {
        q: "무료로 사용할 수 있는 기능은 무엇인가요?",
        a: "회원가입 없이도 품질 학습 위키 전체와 SPC·QC7·신QC7·QFD·VSM·Kanban 내장 도구를 무료로 이용할 수 있습니다. 자매 SaaS 도구(AuditSay·NC Manager 등)는 구독 후 이용 가능합니다.",
      },
      {
        q: "개인 회원과 기업 회원의 차이는 무엇인가요?",
        a: "개인 회원은 이메일 인증 후 즉시 활성화됩니다. 기업 회원은 관리자 검토·승인 후 활성화되며, 추후 팀원 초대 기능이 제공될 예정입니다.",
      },
      {
        q: "요금제는 언제든지 변경할 수 있나요?",
        a: "네, 언제든지 업그레이드 가능합니다. 업그레이드는 즉시 반영됩니다. 다운그레이드는 현재 결제 주기 종료 후 적용됩니다.",
      },
      {
        q: "연간 결제 시 얼마나 할인되나요?",
        a: "연간 결제 시 약 10% 할인됩니다. Silver ₩44,000, Gold ₩89,000, Platinum ₩179,000 (월 환산)으로 이용하실 수 있습니다.",
      },
    ],
  },
  {
    category: "도구 접근 · SSO",
    items: [
      {
        q: "각 등급에서 사용할 수 있는 도구는?",
        a: "Silver: AuditSay + NC Manager (2개), Gold: + APQP Manager (3개), Platinum: 전체 5개 도구 (+ Gauge Manager + 4M Change Manager)",
      },
      {
        q: "자매 사이트 자동 로그인(SSO)은 언제 지원되나요?",
        a: "SSO 기능은 Phase 2 개발 예정입니다. Platinum 구독자부터 우선 적용될 예정입니다. 현재는 각 도구를 개별 링크로 이용하실 수 있습니다.",
      },
    ],
  },
  {
    category: "기술 · 기타",
    items: [
      {
        q: "모바일에서도 사용할 수 있나요?",
        a: "Quality Hub 사이트와 내장 도구는 모바일에서 이용 가능합니다. 각 자매 SaaS(AuditSay, Gauge Manager 등)도 모바일 최적화가 되어 있습니다.",
      },
      {
        q: "데이터는 어떻게 보호되나요?",
        a: "Supabase(PostgreSQL)를 통해 데이터를 안전하게 저장하며, 행 수준 보안(RLS)을 적용해 본인 데이터만 접근 가능합니다. Vercel + Supabase 인프라는 SOC 2 Type II 인증을 보유하고 있습니다.",
      },
    ],
  },
];

export default function QnaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-brand-orange mb-3">지원</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4">자주 묻는 질문</h1>
        <p className="text-muted-foreground">
          찾는 답이 없으면{" "}
          <a href="/support/request" className="text-brand-orange hover:underline font-medium">
            서비스 요청
          </a>
          으로 직접 문의해 주세요.
        </p>
      </div>

      <div className="space-y-10">
        {FAQ.map((section) => (
          <div key={section.category}>
            <h2 className="text-sm font-semibold text-brand-orange uppercase tracking-wide mb-4">
              {section.category}
            </h2>
            <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
              {section.items.map((item) => (
                <details key={item.q} className="group bg-white">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-muted/40 transition-colors">
                    <span className="text-sm font-medium text-foreground pr-4">{item.q}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
