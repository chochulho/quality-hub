import type { Metadata } from "next";
import { VSMViewer } from "@/components/vsm/VSMViewer";

export const metadata: Metadata = {
  title: "가치흐름도 (VSM) | Quality Hub",
  description: "공정 데이터를 입력하면 현재·미래상태 VSM을 자동 생성합니다. 리드타임·NVA 비율 계산 및 Excel 내보내기.",
};

export default function VSMPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2">
            Lean 분석 도구
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
            가치흐름도 (VSM)
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            공급자→고객까지 각 공정의 CT, C/O, 가동률, 재공 재고를 입력하면 현재상태 VSM을 자동으로 그립니다.
            리드타임, 부가가치 시간(VAT), 병목 공정을 즉시 파악하고 Excel로 내보낼 수 있습니다.
          </p>
        </div>

        <VSMViewer />

        {/* Help section */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            {
              title: "택트타임 (TT)",
              desc: "가용 근무시간 ÷ 일 수요량. 시장이 요구하는 생산 리듬. 유효 CT가 TT를 초과하면 병목.",
            },
            {
              title: "리드타임 (LT)",
              desc: "Σ 재공 대기 일수 + Σ CT. LT 대부분은 재고 대기 — VA 시간은 1% 미만이 보통.",
            },
            {
              title: "NVA 비율",
              desc: "(LT − VAT) / LT. 일반 제조업 95% 이상. 린 개선 후 70% 이하가 목표.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-brand-navy mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
