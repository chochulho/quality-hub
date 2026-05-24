import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "시험 학습 코너",
  description:
    "품질기술사·품질기사 시험을 위한 학습 자료와 시뮬레이터. 신QC 7가지, QFD, VSM, Kanban 실습 코너.",
};

export default function ExamPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand-orange/10 rounded-2xl px-4 py-2 mb-4">
          <GraduationCap className="h-5 w-5 text-brand-orange" />
          <span className="text-sm font-medium text-brand-orange">시험 학습 코너</span>
        </div>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4">
          품질 자격증 시험 대비
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          품질기술사·품질기사 시험에 자주 출제되는 도구와 이론을 직접 실습하며 익힙니다.
          실무 운영 도구가 아닌 시험 대비 학습 코너임을 참고하세요.
        </p>
      </div>

      <div className="grid gap-4">
        <Link
          href="/learn/exam/pqe"
          className="group flex items-center justify-between p-6 rounded-2xl border border-border bg-white hover:border-brand-navy hover:shadow-sm transition-all duration-200"
        >
          <div>
            <p className="font-bold text-foreground text-lg mb-1">품질기술사 (PQE)</p>
            <p className="text-sm text-muted-foreground">
              신QC 7가지 · QFD · VSM 시뮬레이터 · Kanban 시뮬레이터 · Lean 학습
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-brand-orange transition-colors shrink-0" />
        </Link>

        <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-background-soft opacity-60 cursor-default">
          <div>
            <p className="font-bold text-foreground text-lg mb-1">품질기사 (PQI)</p>
            <p className="text-sm text-muted-foreground">
              기초 통계 · 샘플링 검사 · QC 도구 — 준비 중
            </p>
          </div>
          <span className="text-xs font-semibold bg-muted text-muted-foreground rounded-full px-3 py-1">
            준비 중
          </span>
        </div>
      </div>
    </div>
  );
}
