import type { Article, CmsPage, RobotsFollow, RobotsIndex, SeoMeta, SeoSettings } from "@/types/cms";

/** Helpers shared by the admin SEO panel (live previews) and the public site (real tags). */

export const TITLE_IDEAL_MIN = 35;
export const TITLE_MAX = 60;
export const DESCRIPTION_IDEAL_MIN = 120;
export const DESCRIPTION_MAX = 156;

export const SEO_VARIABLES: { token: string; label: string }[] = [
  { token: "%%title%%", label: "Title" },
  { token: "%%sitename%%", label: "Site name" },
  { token: "%%sep%%", label: "Separator" },
  { token: "%%tagline%%", label: "Tagline" },
  { token: "%%category%%", label: "Category" },
];

export interface TitleVars {
  title?: string;
  sitename?: string;
  sep?: string;
  tagline?: string;
  category?: string;
}

/** Replaces %%variables%% and tidies up separators left dangling by empty values. */
export function fillTemplate(template: string, vars: TitleVars): string {
  const sep = vars.sep ?? "|";
  const filled = template
    .replace(/%%title%%/gi, vars.title ?? "")
    .replace(/%%sitename%%/gi, vars.sitename ?? "")
    .replace(/%%sep%%/gi, sep)
    .replace(/%%tagline%%/gi, vars.tagline ?? "")
    .replace(/%%category%%/gi, vars.category ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!sep) return filled;
  const esc = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return filled
    .replace(new RegExp(`^(?:${esc}\\s*)+`), "")
    .replace(new RegExp(`(?:\\s*${esc})+$`), "")
    .trim();
}

export type SeoKind = "home" | "post" | "page" | "category" | "other";

export function templateFor(settings: SeoSettings, kind: SeoKind): string {
  return settings.titleTemplates[kind] || settings.titleTemplates.other;
}

/** The title search engines will show: the custom SEO title if set, otherwise the type's template. */
export function resolveSeoTitle(
  settings: SeoSettings,
  kind: SeoKind,
  input: { seoTitle?: string; title: string; sitename: string; tagline: string; category?: string }
): string {
  const vars: TitleVars = {
    title: input.title,
    sitename: input.sitename,
    sep: settings.titleSeparator,
    tagline: input.tagline,
    category: input.category,
  };
  return fillTemplate(input.seoTitle?.trim() ? input.seoTitle : templateFor(settings, kind), vars);
}

export interface ResolvedRobots {
  index: boolean;
  follow: boolean;
  noarchive: boolean;
  nosnippet: boolean;
  noimageindex: boolean;
}

/** Combines the item's own robots choices with the site-wide indexing rules. */
export function resolveRobots(
  settings: SeoSettings,
  kind: SeoKind,
  seo: SeoMeta | undefined,
  forceNoindex = false
): ResolvedRobots {
  const idx = settings.indexing;
  const typeDefault =
    kind === "post" ? idx.posts : kind === "page" ? idx.pages : kind === "category" ? idx.categories : true;

  const pick = (choice: RobotsIndex | RobotsFollow | undefined, on: string, off: string, fallback: boolean) =>
    choice === on ? true : choice === off ? false : fallback;

  let index = pick(seo?.index, "index", "noindex", typeDefault);
  let follow = pick(seo?.follow, "follow", "nofollow", idx.follow);
  if (!idx.siteVisible || forceNoindex) {
    index = false;
    follow = false;
  }
  return {
    index,
    follow,
    noarchive: !!seo?.noarchive,
    nosnippet: !!seo?.nosnippet,
    noimageindex: !!seo?.noimageindex,
  };
}

export function absoluteUrl(baseUrl: string, pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl.replace(/\/+$/, "")}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

// ---------------------------------------------------------------------------
// Sanitising what the admin submits
// ---------------------------------------------------------------------------

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

const safeUrl = (v: unknown) => {
  const s = str(v, 500);
  return s && /^(https?:\/\/|\/)/i.test(s) ? s : "";
};

/** Whitelists and trims an SEO object coming from the browser. */
export function cleanSeo(input: unknown): SeoMeta {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const enumOf = <T extends string>(v: unknown, allowed: T[], fallback: T): T =>
    allowed.includes(v as T) ? (v as T) : fallback;

  return {
    title: str(raw.title, 200) || "",
    description: str(raw.description, 500) || "",
    focusKeyword: str(raw.focusKeyword, 100) || "",
    canonical: safeUrl(raw.canonical),
    index: enumOf<RobotsIndex>(raw.index, ["default", "index", "noindex"], "default"),
    follow: enumOf<RobotsFollow>(raw.follow, ["default", "follow", "nofollow"], "default"),
    noarchive: !!raw.noarchive,
    nosnippet: !!raw.nosnippet,
    noimageindex: !!raw.noimageindex,
    breadcrumbTitle: str(raw.breadcrumbTitle, 100) || "",
    excludeFromSitemap: !!raw.excludeFromSitemap,
    ogTitle: str(raw.ogTitle, 200) || "",
    ogDescription: str(raw.ogDescription, 500) || "",
    ogImage: safeUrl(raw.ogImage),
    twitterTitle: str(raw.twitterTitle, 200) || "",
    twitterDescription: str(raw.twitterDescription, 500) || "",
    twitterImage: safeUrl(raw.twitterImage),
    schemaType: str(raw.schemaType, 50) || "",
  };
}

/** Older posts/pages stored a few SEO fields directly; fold them into the new SEO object. */
export function foldLegacySeo(
  item: Pick<Article, "metaTitle" | "metaDescription" | "keywords" | "canonicalUrl" | "ogImage"> &
    Partial<Pick<CmsPage, "seo">>
): SeoMeta {
  const legacy: SeoMeta = {
    title: item.metaTitle || "",
    description: item.metaDescription || "",
    focusKeyword: item.keywords?.[0] || "",
    canonical: item.canonicalUrl || "",
    ogImage: item.ogImage || "",
  };
  const own = (item.seo || {}) as SeoMeta;
  const merged: SeoMeta = { ...legacy };
  for (const [key, value] of Object.entries(own)) {
    if (value !== undefined && value !== "" && value !== null) (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}
