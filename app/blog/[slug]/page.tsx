import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;

  const allPosts = getBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const related = allPosts
    .filter((p) => p.slug !== slug && p.category === frontmatter.category)
    .slice(0, 3);

  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        블로그로 돌아가기
      </Link>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <span className="text-xs font-medium text-brand-orange border border-brand-orange rounded-full px-2.5 py-1 mb-4 inline-block">
          {frontmatter.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mt-3 mb-4">
          {frontmatter.title}
        </h1>
        <p className="text-muted-foreground mb-4">{frontmatter.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(frontmatter.date), "yyyy년 M월 d일", { locale: ko })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            읽기 {readingTime}분
          </span>
        </div>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose max-w-none">
        <MDXRemote
          source={content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-bold text-brand-navy mb-5">관련 글</h2>
          <div className="space-y-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={p.href}
                className="block border border-border rounded-xl p-4 hover:border-brand-navy transition-colors group"
              >
                <p className="text-xs text-muted-foreground mb-1">{p.category}</p>
                <p className="font-medium text-foreground group-hover:text-brand-navy transition-colors">
                  {p.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nav */}
      <div className="mt-8 pt-6 border-t border-border flex justify-between gap-4 text-sm">
        {currentIndex > 0 && (
          <Link
            href={allPosts[currentIndex - 1].href}
            className="flex-1 text-left hover:text-brand-navy transition-colors"
          >
            <span className="text-xs text-muted-foreground block mb-1">← 이전 글</span>
            <span className="font-medium line-clamp-1">
              {allPosts[currentIndex - 1].title}
            </span>
          </Link>
        )}
        {currentIndex < allPosts.length - 1 && (
          <Link
            href={allPosts[currentIndex + 1].href}
            className="flex-1 text-right hover:text-brand-navy transition-colors"
          >
            <span className="text-xs text-muted-foreground block mb-1">다음 글 →</span>
            <span className="font-medium line-clamp-1">
              {allPosts[currentIndex + 1].title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
