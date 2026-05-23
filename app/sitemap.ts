import type { MetadataRoute } from "next";
import { getLearnPosts, getBlogPosts } from "@/lib/content";

const BASE_URL = "https://quality-hub.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const learnPosts = getLearnPosts();
  const blogPosts = getBlogPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const learnRoutes: MetadataRoute.Sitemap = learnPosts.map((post) => ({
    url: `${BASE_URL}${post.href}`,
    lastModified: new Date(post.updated),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}${post.href}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...learnRoutes, ...blogRoutes];
}
