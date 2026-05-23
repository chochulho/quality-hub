import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import remarkGfm from "remark-gfm";
import { getLearnPost } from "@/lib/content";
import { LeanGuideTabs } from "@/components/lean/LeanGuideTabs";
import { RevealAnswer } from "@/components/mdx/RevealAnswer";
import { ExamCase } from "@/components/mdx/ExamCase";
import { KanbanFlowDemo } from "@/components/lean/KanbanFlowDemo";

export const metadata: Metadata = {
  title: "린 생산 가이드 | Quality Hub",
  description:
    "린 생산방식(Lean Production), 사이클·택트 타임, SMED & Changeover를 한 페이지에서 탭으로 학습합니다.",
};

const MDX_OPTIONS = { mdxOptions: { remarkPlugins: [remarkGfm] } };
const COMPONENTS = { RevealAnswer, ExamCase, KanbanFlowDemo };

export default async function LeanHubPage() {
  const leanProd = getLearnPost(["lean", "lean-production"]);
  const cycleTakt = getLearnPost(["lean", "cycle-takt-time"]);
  const smed = getLearnPost(["lean", "smed-changeover"]);

  const tabs = [
    {
      id: "lean-production",
      label: "린 생산방식 개요",
      sublabel: "VSM · JIT · Kanban · Kaizen",
      content: leanProd ? (
        <div className="prose max-w-none">
          <MDXRemote source={leanProd.content} options={MDX_OPTIONS} components={COMPONENTS} />
        </div>
      ) : null,
    },
    {
      id: "cycle-takt-time",
      label: "사이클 · 택트 타임",
      sublabel: "CT / TT / LT · 야마즈미 차트",
      content: cycleTakt ? (
        <div className="prose max-w-none">
          <MDXRemote source={cycleTakt.content} options={MDX_OPTIONS} components={COMPONENTS} />
        </div>
      ) : null,
    },
    {
      id: "smed-changeover",
      label: "SMED & Changeover",
      sublabel: "교체시간 단축 · 내부/외부 작업",
      content: smed ? (
        <div className="prose max-w-none">
          <MDXRemote source={smed.content} options={MDX_OPTIONS} components={COMPONENTS} />
        </div>
      ) : null,
    },
  ];

  return (
    <div className="max-w-full">
      {/* Back link */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        학습 위키로 돌아가기
      </Link>

      {/* Page header */}
      <div className="mb-6 pb-6 border-b border-border">
        <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2">
          린 생산 (Lean Production)
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
          린 생산 가이드
        </h1>
        <p className="text-muted-foreground">
          도요타 생산방식(TPS)의 핵심 개념을 탭으로 탐색하세요. VSM·JIT·Kanban·Kaizen 개요부터
          사이클·택트 타임 계산, SMED 교체시간 단축까지 한 페이지에서 학습할 수 있습니다.
        </p>
      </div>

      <LeanGuideTabs tabs={tabs} defaultTab="lean-production" />
    </div>
  );
}
