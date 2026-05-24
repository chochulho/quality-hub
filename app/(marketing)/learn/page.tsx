import type { Metadata } from "next";
import Link from "next/link";
import { getLearnPosts, LEARN_CATEGORIES } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const metadata: Metadata = {
  title: "학습 위키",
  description:
    "IATF 16949, ISO 9001, SPC, MSA, FMEA, 품질기술사 시험까지 — 품질 지식을 카테고리별로 정리합니다.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

// QMS slugs are grouped under the /learn/qms hub page
const QMS_HUB_SLUGS = new Set([
  "/learn/qms/quality-principles",
  "/learn/qms/iatf-iso-comparison",
  "/learn/qms/esg-iso-programs",
  "/learn/qms/audit",
  "/learn/qms/documentation",
  "/learn/qms/kpi-bsc",
  "/learn/qms/iatf-overview",
]);

const QMS_HUB_CARD = {
  href: "/learn/qms",
  title: "품질경영(QMS) 가이드",
  description: "IATF 16949·ISO 9001 원칙부터 문서화 체계·터틀 다이어그램·심사·KPI까지, 품질경영시스템 구축에 필요한 핵심 내용을 한 곳에서 학습합니다.",
  category: "qms",
  tags: ["QMS", "IATF16949", "ISO9001", "심사", "KPI", "문서화"],
  exam_topic: true as const,
  iatf_clause: undefined as string | undefined,
  updated: "2026-05-17",
  slug: ["qms"],
};

// These 3 lean slugs are grouped under the /learn/lean hub page
const LEAN_HUB_SLUGS = new Set([
  "/learn/lean/lean-production",
  "/learn/lean/cycle-takt-time",
  "/learn/lean/smed-changeover",
]);

const LEAN_HUB_CARD = {
  href: "/learn/lean",
  title: "린 생산 가이드",
  description: "린 생산방식 개요(VSM·JIT·Kanban·Kaizen), 사이클·택트 타임, SMED & Changeover를 탭으로 한 페이지에서 학습합니다.",
  category: "lean",
  tags: ["린생산", "VSM", "JIT", "Kanban", "SMED", "TaktTime"],
  exam_topic: true as const,
  iatf_clause: undefined as string | undefined,
  updated: "2026-05-17",
  slug: ["lean"],
};

export default async function LearnIndexPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const allPosts = getLearnPosts();

  // Remove individual articles that are grouped into hub pages
  const filteredPosts = allPosts.filter(
    (p) => !LEAN_HUB_SLUGS.has(p.href) && !QMS_HUB_SLUGS.has(p.href)
  );

  // Insert QMS hub card (replaces all 7 qms articles)
  const showQmsHub = !category || category === "qms";
  const postsWithQms = showQmsHub
    ? [QMS_HUB_CARD, ...filteredPosts].filter(
        (p, i, arr) => arr.findIndex((x) => x.href === p.href) === i
      )
    : filteredPosts;

  // Insert the lean hub card in place of the removed articles (only if lean is visible)
  const showLeanHub = !category || category === "lean";
  const postsWithHub = showLeanHub
    ? [
        ...postsWithQms.filter((p) => p.category !== "lean" || p.href === "/learn/lean/5s-wastes"),
        LEAN_HUB_CARD,
        ...postsWithQms.filter((p) => p.category === "lean" && p.href !== "/learn/lean/5s-wastes"),
      ].filter(
        (p, i, arr) => arr.findIndex((x) => x.href === p.href) === i
      )
    : postsWithQms;

  const posts = category
    ? postsWithHub.filter((p) => p.category === category)
    : postsWithHub;

  const activeCategory = LEARN_CATEGORIES.find((c) => c.id === category);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-navy mb-2">
          {activeCategory ? activeCategory.label : "전체 학습 노트"}
        </h1>
        <p className="text-muted-foreground">
          {posts.length}개 노트
        </p>
      </div>

      {/* Mobile category filter */}
      <div className="flex gap-2 flex-wrap mb-8 lg:hidden">
        <Link
          href="/learn"
          className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
            !category
              ? "bg-brand-navy text-white border-brand-navy"
              : "border-border text-muted-foreground hover:border-brand-navy"
          }`}
        >
          전체
        </Link>
        {LEARN_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/learn?category=${cat.id}`}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
              category === cat.id
                ? "bg-brand-navy text-white border-brand-navy"
                : "border-border text-muted-foreground hover:border-brand-navy"
            }`}
          >
            {cat.icon} {cat.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📭</p>
          <p>아직 노트가 없습니다. 곧 추가됩니다!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => {
            const cat = LEARN_CATEGORIES.find((c) => c.id === post.category);
            return (
              <Link
                key={post.href}
                href={post.href}
                className="border border-border rounded-2xl p-5 hover:border-brand-navy hover:shadow-sm transition-all duration-200 group bg-white"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {cat && <span className="text-lg">{cat.icon}</span>}
                    <Badge variant="secondary" className="text-xs">
                      {cat?.label ?? post.category}
                    </Badge>
                  </div>
                  {post.exam_topic && (
                    <span className="text-xs font-medium text-brand-orange border border-brand-orange rounded-full px-2 py-0.5 shrink-0">
                      시험 출제
                    </span>
                  )}
                </div>
                <h2 className="font-semibold text-foreground group-hover:text-brand-navy transition-colors leading-snug mb-1">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.description}
                </p>
                {post.iatf_clause && (
                  <p className="text-xs text-muted-foreground mt-3">
                    IATF 조항 {post.iatf_clause}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.updated), "yyyy.MM.dd", { locale: ko })}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
