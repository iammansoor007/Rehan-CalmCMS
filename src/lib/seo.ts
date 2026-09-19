import type { Metadata } from "next";
import type { SeoMeta, SeoSettings, SiteConfig } from "@/types/cms";
import { getContent } from "@/lib/cms/content";
import { getSiteConfig } from "@/lib/cms/client";
import {
  SeoKind,
  absoluteUrl,
  resolveRobots,
  resolveSeoTitle,
} from "@/lib/seoShared";

export interface SeoContext {
  settings: SeoSettings;
  site: SiteConfig;
  baseUrl: string;
}

/** Site-wide SEO settings + brand info, loaded once per request by each page. */
export async function getSeoContext(): Promise<SeoContext> {
  const [settings, site] = await Promise.all([getContent("seo"), getSiteConfig()]);
  const baseUrl = (
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://calmtouch.com"
  ).replace(/\/+$/, "");
  return { settings: settings as SeoSettings, site, baseUrl };
}

export interface PageSeoInput {
  kind: SeoKind;
  /** Site path of this page, e.g. "/blog/my-post". */
  path: string;
  /** The page's own title (before templates are applied). */
  title: string;
  seo?: SeoMeta;
  /** Used when no SEO description is set (e.g. the post excerpt). */
  description?: string;
  /** Featured image, used for social cards when no social image is set. */
  image?: string;
  category?: string;
  keywords?: string[];
  /** Drafts, scheduled posts and other previews are never indexed. */
  preview?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; author?: string; section?: string };
}

/** Builds every <head> tag for a page: title, description, canonical, robots, Open Graph and Twitter. */
export function buildMetadata(ctx: SeoContext, input: PageSeoInput): Metadata {
  const { settings, site, baseUrl } = ctx;
  const seo = input.seo || {};

  const title = resolveSeoTitle(settings, input.kind, {
    seoTitle: seo.title,
    title: input.title,
    sitename: site.brandName,
    tagline: site.tagline,
    category: input.category,
  });
  const description =
    seo.description?.trim() ||
    input.description?.trim() ||
    settings.defaultDescription?.trim() ||
    site.metaDescription ||
    "";

  const canonical = seo.canonical ? absoluteUrl(baseUrl, seo.canonical) : absoluteUrl(baseUrl, input.path);
  const robots = resolveRobots(settings, input.kind, seo, !!input.preview);

  const ogTitle = seo.ogTitle?.trim() || title;
  const ogDescription = seo.ogDescription?.trim() || description;
  const ogImage = absoluteUrl(
    baseUrl,
    seo.ogImage || input.image || settings.social.defaultImage || ""
  );
  const twTitle = seo.twitterTitle?.trim() || ogTitle;
  const twDescription = seo.twitterDescription?.trim() || ogDescription;
  const twImage = absoluteUrl(baseUrl, seo.twitterImage || seo.ogImage || input.image || settings.social.defaultImage || "");
  const handle = settings.social.twitterHandle?.trim();

  const keywords = [
    ...(seo.focusKeyword ? [seo.focusKeyword] : []),
    ...(input.keywords || []).filter((k) => k && k !== seo.focusKeyword),
  ];

  return {
    title: { absolute: title },
    description: description || undefined,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    robots: {
      index: robots.index,
      follow: robots.follow,
      noarchive: robots.noarchive || undefined,
      nosnippet: robots.nosnippet || undefined,
      noimageindex: robots.noimageindex || undefined,
      googleBot: robots.index
        ? {
            index: true,
            follow: robots.follow,
            "max-image-preview": "large",
            "max-snippet": robots.nosnippet ? 0 : -1,
            "max-video-preview": -1,
          }
        : undefined,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription || undefined,
      url: canonical,
      siteName: settings.social.ogSiteName || site.brandName,
      locale: "en_US",
      type: input.article ? "article" : "website",
      images: ogImage ? [{ url: ogImage, alt: ogTitle }] : undefined,
      ...(input.article
        ? {
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime,
            authors: input.article.author ? [input.article.author] : undefined,
            section: input.article.section,
          }
        : {}),
    },
    twitter: {
      card: twImage ? settings.social.twitterCard : "summary",
      site: handle ? (handle.startsWith("@") ? handle : `@${handle}`) : undefined,
      title: twTitle,
      description: twDescription || undefined,
      images: twImage ? [twImage] : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Structured data (JSON-LD)
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

export function socialProfiles(site: SiteConfig): string[] {
  const s = site.socialLinks || {};
  return [s.facebook, s.twitter, s.instagram, s.linkedin].filter((u): u is string => !!u);
}

function organization(ctx: SeoContext): Json {
  const { settings, site, baseUrl } = ctx;
  const logo = absoluteUrl(baseUrl, settings.schema.orgLogo || site.logoUrl || "");
  return {
    "@type": settings.schema.orgType,
    "@id": `${baseUrl}/#organization`,
    name: settings.schema.orgName || site.brandName,
    url: baseUrl,
    ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}),
    ...(socialProfiles(site).length ? { sameAs: socialProfiles(site) } : {}),
  };
}

/** Organization + WebSite, rendered on every page. */
export function siteJsonLd(ctx: SeoContext): Json | null {
  if (!ctx.settings.schema.enabled) return null;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(ctx),
      {
        "@type": "WebSite",
        "@id": `${ctx.baseUrl}/#website`,
        url: ctx.baseUrl,
        name: ctx.settings.social.ogSiteName || ctx.site.brandName,
        description: ctx.site.tagline,
        publisher: { "@id": `${ctx.baseUrl}/#organization` },
      },
    ],
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(ctx: SeoContext, crumbs: Crumb[]): Json | null {
  if (!ctx.settings.schema.enabled || !ctx.settings.schema.breadcrumbs || crumbs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(ctx.baseUrl, c.path),
    })),
  };
}

export function articleJsonLd(
  ctx: SeoContext,
  input: {
    path: string;
    headline: string;
    description: string;
    image?: string;
    published?: string;
    modified?: string;
    author: string;
    section?: string;
    keywords?: string[];
    type?: string;
  }
): Json | null {
  if (!ctx.settings.schema.enabled) return null;
  const image = absoluteUrl(ctx.baseUrl, input.image || ctx.settings.social.defaultImage);
  const url = absoluteUrl(ctx.baseUrl, input.path);
  return {
    "@context": "https://schema.org",
    "@type": input.type || ctx.settings.schema.articleType,
    headline: input.headline,
    description: input.description,
    ...(image ? { image: [image] } : {}),
    ...(input.published ? { datePublished: input.published } : {}),
    dateModified: input.modified || input.published,
    author: { "@type": "Person", name: input.author },
    publisher: { "@id": `${ctx.baseUrl}/#organization`, "@type": ctx.settings.schema.orgType, name: ctx.settings.schema.orgName || ctx.site.brandName },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
  };
}

export function webPageJsonLd(
  ctx: SeoContext,
  input: { path: string; name: string; description: string; type?: string; image?: string }
): Json | null {
  if (!ctx.settings.schema.enabled) return null;
  const image = absoluteUrl(ctx.baseUrl, input.image || "");
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(ctx.baseUrl, input.path),
    isPartOf: { "@id": `${ctx.baseUrl}/#website` },
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image } } : {}),
  };
}

/** Resolved parsed date (ISO) from the CMS's display dates like "Apr 28, 2026". */
export function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
