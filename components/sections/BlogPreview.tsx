import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getBlogPosts } from "@/lib/content";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const categoryColors: Record<string, string> = {
  "품질일반": "bg-brand-navy",
  "IATF": "bg-brand-orange",
  "SPC": "bg-green-700",
  "MSA": "bg-purple-700",
  "FMEA": "bg-yellow-600",
  "기술사": "bg-red-700",
};

export default function BlogPreview() {
  const posts = getBlogPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background-soft">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-brand-orange mb-2">최근 글</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-navy">
              블로그
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-orange transition-colors"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => {
            const colorClass = categoryColors[post.category] ?? "bg-brand-navy";
            return (
              <Link
                key={post.slug}
                href={post.href}
                className="bg-white border border-border rounded-2xl overflow-hidden hover:border-brand-navy hover:shadow-sm transition-all duration-200 group"
              >
                <div className={`${colorClass} h-28 flex items-center justify-center`}>
                  <span className="text-xs font-semibold text-white/80 border border-white/30 rounded-full px-3 py-1">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground leading-snug group-hover:text-brand-navy transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(post.date), "yyyy년 M월 d일", { locale: ko })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime}분
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            href="/blog"
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
