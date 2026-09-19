import { MetadataRoute } from "next";
import { getArticles, getCategories } from "@/lib/cms/client";
import { getPages } from "@/lib/cms/pages";
import { getSeoContext, toIsoDate } from "@/lib/seo";
import { resolveRobots } from "@/lib/seoShared";
import type { SeoMeta } from "@/types/cms";

export const dynamic = "force-dynamic";

/** XML sitemap: follows Admin → SEO Settings, and leaves out anything set to noindex or "exclude from sitemap". */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings, baseUrl } = await getSeoContext();
  if (!settings.sitemap.enabled || !settings.indexing.siteVisible) return [];

  const [articles, categories, pages] = await Promise.all([
    getArticles(),
    getCategories(),
    getPages(),
  ]);

  const listed = (kind: "post" | "page" | "category", seo?: SeoMeta) =>
    !seo?.excludeFromSitemap && resolveRobots(settings, kind, seo).index;

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  if (settings.sitemap.pages) {
    for (const p of pages) {
      if (!listed("page", p.seo)) continue;
      entries.push({
        url: `${baseUrl}/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  if (settings.sitemap.categories) {
    for (const cat of categories) {
      if (cat.slug !== "all" && !listed("category", cat.seo)) continue;
      entries.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  if (settings.sitemap.posts) {
    for (const art of articles) {
      if (!listed("post", art.seo)) continue;
      const modified = toIsoDate(art.scheduledAt) || toIsoDate(art.date);
      entries.push({
        url: `${baseUrl}/blog/${art.slug}`,
        lastModified: modified ? new Date(modified) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  return entries;
}
