import { ContentModel } from "@/models/Content";
import { SiteConfigModel } from "@/models/SiteConfig";
import { hasMongo } from "./backend";
import { CmsError } from "./errors";
import { readStore, updateStore } from "./store";
import { homepageContent } from "./data/homepage";
import { aboutContent } from "./data/about";
import { contactContent } from "./data/contact";
import { navigationSettings } from "./data/navigation";
import { footerSettings } from "./data/footer";
import { sidebarSettings } from "./data/sidebar";
import { templateSettings } from "./data/templates";
import { seoSettings, redirectsContent } from "./data/seo";
import type { RedirectRule } from "@/types/cms";

/** Every editable block of site content. Each one is a single JSON document. */
export const CONTENT_DEFAULTS = {
  homepage: homepageContent,
  about: aboutContent,
  contact: contactContent,
  navigation: navigationSettings,
  footer: footerSettings,
  sidebar: sidebarSettings,
  templates: templateSettings,
  seo: seoSettings,
  redirects: redirectsContent,
} as const;

export type ContentKey = keyof typeof CONTENT_DEFAULTS;

export function isContentKey(key: string): key is ContentKey {
  return key in CONTENT_DEFAULTS;
}

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain =>
  !!v && typeof v === "object" && !Array.isArray(v);

/**
 * Overlays saved edits on the built-in defaults. Objects merge key by key (so new
 * fields added in a later release still get their defaults); arrays are replaced
 * whole, so removing or reordering items in the admin sticks.
 */
export function deepMerge<T>(base: T, saved: unknown): T {
  if (saved === undefined || saved === null) return base;
  if (Array.isArray(base)) return (Array.isArray(saved) ? saved : base) as T;
  if (isPlain(base)) {
    if (!isPlain(saved)) return base;
    const out: Plain = { ...base };
    for (const key of Object.keys(saved)) {
      out[key] = key in base ? deepMerge((base as Plain)[key], saved[key]) : saved[key];
    }
    return out as T;
  }
  return (typeof saved === typeof base ? saved : base) as T;
}

const SAFE_HREF = /^(\/|#|https?:\/\/|mailto:|tel:)/i;

function safeHref(value: string): string {
  const v = value.trim();
  if (!v || SAFE_HREF.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ""; // some other scheme, e.g. javascript:
  return `https://${v}`;
}

/** Link fields are admin-typed, so make sure none can smuggle in a script URL. */
function cleanLinks(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((v) => cleanLinks(v, key));
  if (isPlain(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cleanLinks(v, k)]));
  }
  if (typeof value === "string" && /href$/i.test(key)) return safeHref(value);
  return value;
}

async function loadSaved(key: ContentKey): Promise<unknown> {
  if (await hasMongo()) {
    const doc = await ContentModel.findOne({ key }).lean();
    if (doc) return doc.data;
    if (key === "homepage") {
      const legacy = await SiteConfigModel.findOne().lean();
      return legacy?.homepage ?? null;
    }
    return null;
  }
  const store = readStore();
  return store.content[key] ?? (key === "homepage" ? store.homepage : null);
}

export async function getContent<K extends ContentKey>(
  key: K
): Promise<(typeof CONTENT_DEFAULTS)[K]> {
  const defaults = CONTENT_DEFAULTS[key];
  return deepMerge(defaults, await loadSaved(key));
}

export async function saveContent(key: ContentKey, data: unknown): Promise<void> {
  if (!isPlain(data)) throw new CmsError(400, "Invalid content.");
  const clean = cleanLinks(data) as Plain;
  if (key === "seo") normaliseSeoSettings(clean);
  if (key === "redirects") normaliseRedirects(clean);
  if (await hasMongo()) {
    await ContentModel.findOneAndUpdate(
      { key },
      { key, data: clean, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } else {
    updateStore((s) => {
      s.content[key] = clean;
    });
  }
}

/**
 * Renaming a category changes its slug. Keep every saved "which categories to show"
 * list and every /category/<slug> link pointing at the renamed category.
 */
export async function renameCategorySlug(oldSlug: string, newSlug: string): Promise<void> {
  const oldPath = `/category/${oldSlug}`;
  const rewrite = (value: unknown, key = ""): unknown => {
    if (Array.isArray(value)) {
      return value.map((v) => (/Slugs$/.test(key) && v === oldSlug ? newSlug : rewrite(v, key)));
    }
    if (isPlain(value)) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v, k)]));
    }
    if (typeof value === "string" && /href$/i.test(key)) {
      if (value === oldPath || value.startsWith(`${oldPath}?`) || value.startsWith(`${oldPath}#`)) {
        return `/category/${newSlug}${value.slice(oldPath.length)}`;
      }
    }
    return value;
  };

  for (const key of Object.keys(CONTENT_DEFAULTS) as ContentKey[]) {
    const saved = await loadSaved(key);
    if (!isPlain(saved)) continue;
    const next = rewrite(saved);
    if (JSON.stringify(next) !== JSON.stringify(saved)) await saveContent(key, next);
  }
}

function normaliseSeoSettings(doc: Plain) {
  const url = typeof doc.siteUrl === "string" ? doc.siteUrl.trim().replace(/\/+$/, "") : "";
  doc.siteUrl = /^https?:\/\/[^\s/]+/i.test(url) ? url : "";
}

function normaliseRedirects(doc: Plain) {
  const items = Array.isArray(doc.items) ? doc.items : [];
  const seen = new Set<string>();
  doc.items = items
    .map((r) => ({
      from: String((r as Plain)?.from ?? "").trim(),
      to: String((r as Plain)?.to ?? "").trim(),
    }))
    .filter((r) => r.from.startsWith("/") && r.to && r.from !== r.to)
    .filter((r) => (seen.has(r.from) ? false : (seen.add(r.from), true)));
}

/**
 * Remembers that a URL moved. Existing rules pointing at the old address are
 * re-pointed (no redirect chains) and a rule for the new address is dropped (no loops).
 */
export async function addRedirect(from: string, to: string): Promise<void> {
  if (!from || !to || from === to) return;
  const current = await getContent("redirects");
  const items: RedirectRule[] = current.items
    .filter((r) => r.from !== to && r.from !== from)
    .map((r) => (r.to === from ? { ...r, to } : r));
  items.push({ from, to });
  await saveContent("redirects", { items });
}

/** Where a moved URL now lives, or null. */
export async function resolveRedirect(path: string): Promise<string | null> {
  const { items } = await getContent("redirects");
  const hit = items.find((r) => r.from === path || r.from === decodeURI(path));
  return hit ? hit.to : null;
}

/** Throws the saved edits away so the page goes back to its built-in text. */
export async function resetContent(key: ContentKey): Promise<void> {
  if (await hasMongo()) {
    await ContentModel.deleteOne({ key });
    if (key === "homepage") await SiteConfigModel.updateOne({}, { homepage: null });
  } else {
    updateStore((s) => {
      delete s.content[key];
      if (key === "homepage") s.homepage = null;
    });
  }
}
