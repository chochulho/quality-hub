"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, BookOpen } from "lucide-react";
import { LEARN_CATEGORIES } from "@/lib/categories";

// ── 그룹 정의 ──────────────────────────────────────────────
const SIDEBAR_GROUPS = [
  {
    id: "qms-group",
    label: "품질경영 시스템",
    icon: "🏭",
    categoryIds: ["qms", "nc-capa", "change-management", "competence"],
  },
  {
    id: "stats-group",
    label: "통계·데이터",
    icon: "📊",
    categoryIds: ["statistics", "spc", "capability", "msa", "doe"],
  },
  {
    id: "methods-group",
    label: "품질 기법",
    icon: "🔧",
    categoryIds: ["fmea", "apqp", "qfd", "qc7", "new-qc7"],
  },
  {
    id: "production-group",
    label: "생산·운영",
    icon: "⚙️",
    categoryIds: ["lean", "6sigma", "tpm", "service-quality", "quality-cost"],
  },
  {
    id: "exam-group",
    label: "시험·신뢰성",
    icon: "📝",
    categoryIds: ["reliability", "qe-exam"],
  },
] as const;

// ── 현재 활성 카테고리 감지 ────────────────────────────────
function useActiveCategory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // /learn?category=spc
  const queryCategory = searchParams.get("category");
  if (queryCategory) return queryCategory;

  // /learn/spc/control-chart → ["", "learn", "spc", "control-chart"]
  const segments = pathname.split("/");
  if (segments[1] === "learn" && segments[2]) return segments[2];

  return null;
}

// ── 컴포넌트 ──────────────────────────────────────────────
export function LearnSidebar() {
  const pathname = usePathname();
  const activeCategory = useActiveCategory();

  // 활성 카테고리가 속한 그룹 ID 초기값
  const initialOpen = SIDEBAR_GROUPS.find((g) =>
    g.categoryIds.includes(activeCategory as never)
  )?.id ?? null;

  const [openGroup, setOpenGroup] = useState<string | null>(initialOpen);

  // URL이 바뀌면 해당 그룹 자동 펼침
  useEffect(() => {
    const group = SIDEBAR_GROUPS.find((g) =>
      g.categoryIds.includes(activeCategory as never)
    );
    if (group) setOpenGroup(group.id);
  }, [activeCategory]);

  const toggle = (id: string) =>
    setOpenGroup((prev) => (prev === id ? null : id));

  const isGlossary = pathname === "/glossary";

  return (
    <nav className="space-y-0.5">
      {/* 전체 보기 */}
      <Link
        href="/learn"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          !activeCategory && !isGlossary
            ? "bg-brand-navy/8 text-brand-navy font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        전체 보기
      </Link>

      {/* 용어사전 */}
      <Link
        href="/glossary"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isGlossary
            ? "bg-brand-orange/10 text-brand-orange font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <BookOpen className="h-4 w-4 shrink-0" />
        품질 용어사전
      </Link>

      <div className="pt-0.5 space-y-0.5">
        {SIDEBAR_GROUPS.map((group) => {
          const isOpen = openGroup === group.id;
          const groupCategories = LEARN_CATEGORIES.filter((c) =>
            group.categoryIds.includes(c.id as never)
          );
          const hasActive = group.categoryIds.includes(activeCategory as never);

          return (
            <div key={group.id}>
              {/* 그룹 헤더 */}
              <button
                onClick={() => toggle(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  hasActive
                    ? "text-brand-navy font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{group.icon}</span>
                  <span className="leading-tight">{group.label}</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 카테고리 목록 (아코디언) */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-3 pl-3 border-l border-border py-0.5 space-y-0.5">
                  {groupCategories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <Link
                        key={cat.id}
                        href={`/learn?category=${cat.id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? "bg-brand-navy/8 text-brand-navy font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="text-base leading-none">{cat.icon}</span>
                        <span className="leading-tight">{cat.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
