import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getLearnPost, getLearnSlugs, LEARN_CATEGORIES } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, BookOpen, ArrowRight } from "lucide-react";
import remarkGfm from "remark-gfm";
import { RevealAnswer } from "@/components/mdx/RevealAnswer";
import { ExamCase } from "@/components/mdx/ExamCase";
import { KanbanFlowDemo } from "@/components/lean/KanbanFlowDemo";
import { OCCurve } from "@/components/mdx/OCCurve";
import { NormalCurve } from "@/components/mdx/NormalCurve";
import { DistributionMap } from "@/components/mdx/DistributionMap";
import { DocumentHierarchy } from "@/components/mdx/DocumentHierarchy";
import { TurtleDiagram } from "@/components/mdx/TurtleDiagram";
import { CustomerComplaintFlow } from "@/components/mdx/CustomerComplaintFlow";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getLearnSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getLearnPost(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function LearnPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getLearnPost(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const cat = LEARN_CATEGORIES.find((c) => c.id === frontmatter.category);

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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Article */}
        <article className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {cat && (
                <Badge variant="secondary">
                  {cat.icon} {cat.label}
                </Badge>
              )}
              {frontmatter.exam_topic && (
                <span className="text-xs font-medium text-brand-orange border border-brand-orange rounded-full px-2 py-0.5">
                  품질기술사 출제 영역
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
              {frontmatter.title}
            </h1>
            <p className="text-muted-foreground">{frontmatter.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                최종 수정:{" "}
                {format(new Date(frontmatter.updated), "yyyy년 M월 d일", {
                  locale: ko,
                })}
              </span>
              {frontmatter.iatf_clause && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  IATF 조항 {frontmatter.iatf_clause}
                </span>
              )}
            </div>
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
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
          </div>

          {/* 연결 도구 CTA — 다중 버튼 */}
          {frontmatter.tools && frontmatter.tools.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {frontmatter.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center justify-between gap-4 bg-brand-orange/5 border border-brand-orange/30 hover:border-brand-orange hover:bg-brand-orange/10 rounded-2xl px-5 py-4 flex-1 transition-all duration-200"
                >
                  <div>
                    <p className="text-[10px] font-semibold text-brand-orange uppercase tracking-wider mb-0.5">
                      직접 실습하기
                    </p>
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand-navy transition-colors">
                      {tool.label}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-brand-orange shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          ) : frontmatter.tool_href ? (
            <Link
              href={frontmatter.tool_href}
              className="group flex items-center justify-between gap-4 bg-brand-orange/5 border border-brand-orange/30 hover:border-brand-orange hover:bg-brand-orange/10 rounded-2xl px-5 py-4 mb-8 transition-all duration-200"
            >
              <div>
                <p className="text-[10px] font-semibold text-brand-orange uppercase tracking-wider mb-0.5">
                  직접 실습하기
                </p>
                <p className="text-sm font-semibold text-foreground group-hover:text-brand-navy transition-colors">
                  {frontmatter.tool_label ?? "관련 분석 도구 열기"}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-brand-orange shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : null}

          {/* MDX Content */}
          <div className="prose max-w-none">
            <MDXRemote
              source={content}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              components={{ RevealAnswer, ExamCase, KanbanFlowDemo, OCCurve, NormalCurve, DistributionMap, DocumentHierarchy, TurtleDiagram, CustomerComplaintFlow }}
            />
          </div>
        </article>

        {/* Right sidebar (TOC placeholder) */}
        <aside className="hidden xl:block w-52 shrink-0">
          <div className="sticky top-28">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              목차
            </p>
            <p className="text-xs text-muted-foreground italic">
              [TODO: 자동 목차 생성]
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
