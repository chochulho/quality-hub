import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/content";
import { ArrowRight, Bot, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const metadata: Metadata = {
  title: "블로그",
  description: "품질 실무, IATF 16949, 품질기술사 시험에 관한 글을 씁니다.",
};

const categoryColors: Record<string, string> = {
  "품질일반": "bg-brand-navy",
  "IATF": "bg-brand-orange",
  "SPC": "bg-green-700",
  "MSA": "bg-purple-700",
  "FMEA": "bg-yellow-600",
  "제조공법·FMEA": "bg-yellow-600",
  "기술사": "bg-red-700",
};

const POSTS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const allPosts = getBlogPosts();
  const total = allPosts.length;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const posts = allPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <p className="text-sm font-medium text-brand-orange mb-3">블로그</p>
      <h1 className="text-4xl font-extrabold text-brand-navy mb-10">
        품질 이야기
      </h1>

      {/* AI FMEA 데모 연결 */}
      <Link
        href="/calculators/fmea-demo"
        className="group mb-10 p-6 rounded-3xl bg-background-soft border border-border flex items-center justify-between flex-wrap gap-4 hover:border-brand-orange transition-all duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="bg-brand-orange/10 rounded-xl p-2.5 shrink-0">
            <Bot className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <p className="font-bold text-brand-navy mb-1">글로 읽는 것보다 직접 해보고 싶다면?</p>
            <p className="text-sm text-muted-foreground">AI와 대화하며 FMEA를 완성하는 데모, 회원가입 없이 3분이면 체험할 수 있습니다.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange border border-brand-orange rounded-full px-5 py-2.5 group-hover:bg-brand-orange group-hover:text-white transition-all duration-200 shrink-0">
          FMEA 데모 체험하기
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📝</p>
          <p>아직 글이 없습니다. 곧 첫 글을 올리겠습니다!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const colorClass = categoryColors[post.category] ?? "bg-brand-navy";
            return (
              <Link
                key={post.slug}
                href={post.href}
                className="flex flex-col sm:flex-row gap-5 border border-border rounded-2xl overflow-hidden hover:border-brand-navy hover:shadow-sm transition-all duration-200 group bg-white"
              >
                <div
                  className={`${colorClass} sm:w-32 h-24 sm:h-auto flex items-center justify-center shrink-0`}
                >
                  <span className="text-xs font-semibold text-white/80 border border-white/30 rounded-full px-2.5 py-1">
                    {post.category}
                  </span>
                </div>
                <div className="p-5 sm:pl-0 sm:py-5 sm:pr-6">
                  <h2 className="font-semibold text-foreground group-hover:text-brand-navy transition-colors leading-snug mb-1.5">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? "bg-brand-navy text-white"
                  : "border border-border text-muted-foreground hover:border-brand-navy"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
