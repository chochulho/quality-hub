import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Lean 시뮬레이터 — 품질기술사",
  description:
    "VSM(가치흐름지도)과 Kanban 시뮬레이터로 Lean 개념을 직접 실습합니다. 품질기술사 시험 대비.",
};

export default function LeanPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <Link
        href="/learn/exam/pqe"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        품질기술사 학습
      </Link>

      <p className="text-sm font-medium text-brand-orange mb-2">Lean 시뮬레이터</p>
      <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
        Lean 학습 — VSM & Kanban
      </h1>
      <p className="text-muted-foreground mb-10">
        가치흐름지도(VSM)와 칸반 시뮬레이터를 통해 Lean 개념을 직접 체험합니다.
        두 도구 모두 가다듬는 중입니다.
      </p>

      <div className="space-y-3">
        {[
          {
            href: "/learn/exam/pqe/lean/vsm",
            label: "VSM 시뮬레이터",
            desc: "가치흐름지도 · 리드타임 · NVA 비율 분석",
          },
          {
            href: "/learn/exam/pqe/lean/kanban",
            label: "Kanban 시뮬레이터",
            desc: "BOM 기반 칸반 발행 · 일별 재고 시뮬레이션",
          },
        ].map((tool) => (
          <Link key={tool.href} href={tool.href} className="block">
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border bg-background-soft cursor-default">
              <div>
                <p className="font-semibold text-muted-foreground mb-0.5">{tool.label}</p>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full px-3 py-1 shrink-0">
                <Clock className="h-3 w-3" />
                준비 중
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
