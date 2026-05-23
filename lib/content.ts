import fs from "fs";
import path from "path";
import matter from "gray-matter";
export { LEARN_CATEGORIES } from "@/lib/categories";
export type { CategoryId } from "@/lib/categories";

const contentRoot = path.join(process.cwd(), "content");

export interface LearnFrontmatter {
  title: string;
  description: string;
  category: string;
  tags: string[];
  exam_topic?: boolean;
  iatf_clause?: string;
  related_tool?: string;
  tool_href?: string;
  tool_label?: string;
  tools?: Array<{ href: string; label: string }>;
  updated: string;
}

export interface LearnPost extends LearnFrontmatter {
  slug: string[];
  href: string;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  category: string;
  date: string;
  tags?: string[];
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  href: string;
  readingTime: number;
}

function readMDXFile(filePath: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content };
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getLearnPosts(): LearnPost[] {
  const learnDir = path.join(contentRoot, "learn");
  if (!fs.existsSync(learnDir)) return [];

  const posts: LearnPost[] = [];

  const categories = fs
    .readdirSync(learnDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const catDir = path.join(learnDir, category);
    const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const { frontmatter } = readMDXFile(path.join(catDir, file));
      const fileSlug = file.replace(/\.mdx$/, "");
      posts.push({
        ...(frontmatter as unknown as LearnFrontmatter),
        slug: [category, fileSlug],
        href: `/learn/${category}/${fileSlug}`,
      });
    }
  }

  return posts;
}

export function getLearnPost(slug: string[]): {
  frontmatter: LearnFrontmatter;
  content: string;
} | null {
  const filePath = path.join(contentRoot, "learn", ...slug) + ".mdx";
  if (!fs.existsSync(filePath)) return null;
  const { frontmatter, content } = readMDXFile(filePath);
  return { frontmatter: frontmatter as unknown as LearnFrontmatter, content };
}

export function getLearnSlugs(): string[][] {
  const learnDir = path.join(contentRoot, "learn");
  if (!fs.existsSync(learnDir)) return [];

  const slugs: string[][] = [];
  const categories = fs
    .readdirSync(learnDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const catDir = path.join(learnDir, category);
    const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".mdx"));
    for (const file of files) {
      slugs.push([category, file.replace(/\.mdx$/, "")]);
    }
  }

  return slugs;
}

export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(contentRoot, "blog");
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const { frontmatter, content } = readMDXFile(path.join(blogDir, file));
      const slug = file.replace(/\.mdx$/, "");
      return {
        ...(frontmatter as unknown as BlogFrontmatter),
        slug,
        href: `/blog/${slug}`,
        readingTime: estimateReadingTime(content),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): {
  frontmatter: BlogFrontmatter;
  content: string;
} | null {
  const filePath = path.join(contentRoot, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { frontmatter, content } = readMDXFile(filePath);
  return { frontmatter: frontmatter as unknown as BlogFrontmatter, content };
}

