import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "품질기술사 시험 학습",
  description:
    "품질기술사(PQE) 시험 대비 학습 코너. 신QC 7가지, QFD, VSM 시뮬레이터, Kanban 시뮬레이터를 직접 실습합니다.",
};

const tools = [
  {
    href: "/new-qc7",
    label: "신QC 7가지 도구",
    desc: "친화도 · 연관도 · 계통도 · 매트릭스도 · PDPC · 애로우 다이어그램",
    status: "available" as const,
  },
  {
    href: "/qfd",
    label: "QFD 매트릭스",
    desc: "품질기능전개 · 품질의 집(HOQ) · 3단계 폭포 구조",
    status: "available" as const,
  },
  {
    href: "/learn/exam/pqe/lean/vsm",
    label: "VSM 시뮬레이터",
    desc: "가치흐름지도 · 리드타임 분석 · 병목 공정 식별",
    status: "coming" as const,
  },
  {
    href: "/learn/exam/pqe/lean/kanban",
    label: "Kanban 시뮬레이터",
    desc: "BOM 기반 칸반 발행 · 일별 재고 시뮬레이션",
    status: "coming" as const,
  },
];

export default function PqePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <Link
        href="/learn/exam"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        시험 학습 코너
      </Link>

      <p className="text-sm font-medium text-brand-orange mb-2">품질기술사 (PQE)</p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
        품질기술사 시험 학습
      </h1>
      <p className="text-muted-foreground mb-10 leading-relaxed">
        실무 운영 시스템이 아닌 시험 대비 실습 도구입니다.
        각 도구의 개념을 이해하고 시뮬레이터로 직접 연습하세요.
      </p>

      <div className="space-y-3">
        {tools.map((tool) => {
          const isAvailable = tool.status === "available";
          const card = (
            <div
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 ${
                isAvailable
                  ? "border-border bg-white hover:border-brand-navy hover:shadow-sm cursor-pointer"
                  : "border-border bg-background-soft cursor-default"
              }`}
            >
              <div>
                <p className={`font-semibold mb-0.5 ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                  {tool.label}
                </p>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </div>
              {isAvailable ? (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full px-3 py-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  준비 중
                </span>
              )}
            </div>
          );

          return isAvailable ? (
            <Link key={tool.href} href={tool.href} className="block group">
              {card}
            </Link>
          ) : (
            <div key={tool.href}>{card}</div>
          );
        })}
      </div>

      <div className="mt-10 p-5 rounded-2xl border border-border bg-muted/40">
        <p className="text-sm font-semibold text-foreground mb-1">학습 위키와 함께 사용하세요</p>
        <p className="text-sm text-muted-foreground mb-3">
          각 도구의 이론과 출제 패턴은 학습 위키에서 확인할 수 있습니다.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:text-brand-navy-dark transition-colors"
        >
          학습 위키 보기
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
