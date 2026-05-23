import type { Metadata } from "next";
import Link from "next/link";
import { getLearnPosts, LEARN_CATEGORIES } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const metadata: Metadata = {
  title: "품질경영(QMS) 가이드",
  description:
    "IATF 16949·ISO 9001 기반 품질경영시스템 구축에 필요한 핵심 내용 — 7대 원칙, 문서화 체계, 심사, KPI/BSC까지 한 곳에서 학습합니다.",
};

const TOPIC_ORDER = [
  "iatf-overview",
  "quality-principles",
  "iatf-iso-comparison",
  "esg-iso-programs",
  "documentation",
  "audit",
  "kpi-bsc",
];

export default function QMSHubPage() {
  const allPosts = getLearnPosts();
  const qmsPosts = allPosts.filter((p) => p.category === "qms");

  // Sort by TOPIC_ORDER, unknown slugs go to end
  const sorted = [...qmsPosts].sort((a, b) => {
    const aSlug = a.slug[a.slug.length - 1];
    const bSlug = b.slug[b.slug.length - 1];
    const ai = TOPIC_ORDER.indexOf(aSlug);
    const bi = TOPIC_ORDER.indexOf(bSlug);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const cat = LEARN_CATEGORIES.find((c) => c.id === "qms");

  return (
    <div>
      {/* Back link */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-navy transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        전체 학습 노트
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {cat && <span className="text-2xl">{cat.icon}</span>}
          <Badge variant="secondary">{cat?.label ?? "품질경영"}</Badge>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
          품질경영(QMS) 가이드
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          IATF 16949·ISO 9001 기반으로 품질경영시스템을 이해하고 구축하는 데 필요한
          핵심 내용을 단계별로 정리했습니다. 신규 QMS 구축 조직부터 기존 시스템 개선을
          원하는 실무자까지 활용할 수 있습니다.
        </p>
      </div>

      {/* Note grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="border border-border rounded-2xl p-5 hover:border-brand-navy hover:shadow-sm transition-all duration-200 group bg-white"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <Badge variant="secondary" className="text-xs">
                {cat?.label ?? post.category}
              </Badge>
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
        ))}
      </div>
    </div>
  );
}
