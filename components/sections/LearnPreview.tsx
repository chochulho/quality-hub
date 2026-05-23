import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLearnPosts, LEARN_CATEGORIES } from "@/lib/content";

export default function LearnPreview() {
  const posts = getLearnPosts();

  const categoryCounts = LEARN_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] = posts.filter((p) => p.category === cat.id).length;
    return acc;
  }, {});

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-brand-orange mb-2">지금 배우기</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-navy">
              품질 지식 위키
            </h2>
          </div>
          <Link
            href="/learn"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-orange transition-colors"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEARN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/learn?category=${cat.id}`}
              className="bg-white border border-border rounded-2xl p-4 text-center hover:border-brand-navy hover:shadow-sm transition-all duration-200 group"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-sm font-semibold text-foreground group-hover:text-brand-navy transition-colors leading-tight">
                {cat.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {categoryCounts[cat.id] ?? 0}개 노트
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-orange transition-colors"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
