import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/content";
import { Clock } from "lucide-react";
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
