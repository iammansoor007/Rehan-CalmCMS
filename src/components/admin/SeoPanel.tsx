"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Info, Monitor, Search, Smartphone, TriangleAlert, XCircle } from "lucide-react";
import { SeoMeta, SeoSettings } from "@/types/cms";
import { Analysis, Check, analyseReadability, analyseSeo, stripHtml } from "@/lib/seoAnalysis";
import {
  DESCRIPTION_IDEAL_MIN,
  DESCRIPTION_MAX,
  SEO_VARIABLES,
  SeoKind,
  TITLE_IDEAL_MIN,
  TITLE_MAX,
  resolveSeoTitle,
} from "@/lib/seoShared";
import { api, cardCls, inputCls, labelCls } from "./shared";
import { ImageField, Toggle } from "./fields";

// ---------------------------------------------------------------------------
// Site-wide info (templates, separator, base URL) — fetched once and cached
// ---------------------------------------------------------------------------

export interface SeoSite {
  baseUrl: string;
  siteName: string;
  tagline: string;
  siteDescription: string;
  settings: SeoSettings;
}

let siteCache: SeoSite | null = null;
let siteRequest: Promise<SeoSite | null> | null = null;

function loadSeoSite(force = false): Promise<SeoSite | null> {
  if (!force && siteCache) return Promise.resolve(siteCache);
  if (!siteRequest || force) {
    siteRequest = api<SeoSite>("/api/admin/seo").then((res) => {
      siteRequest = null;
      if (res.data) siteCache = res.data;
      return siteCache;
    });
  }
  return siteRequest;
}

export function useSeoSite(): SeoSite | null {
  const [site, setSite] = useState<SeoSite | null>(siteCache);
  useEffect(() => {
    let alive = true;
    loadSeoSite().then((s) => alive && setSite(s));
    const refresh = () => loadSeoSite(true).then((s) => alive && setSite(s));
    window.addEventListener("cms:seo-saved", refresh);
    return () => {
      alive = false;
      window.removeEventListener("cms:seo-saved", refresh);
    };
  }, []);
  return site;
}

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

const LEVEL_STYLE = {
  good: "bg-emerald-500",
  ok: "bg-amber-500",
  bad: "bg-red-500",
  none: "bg-slate-300",
} as const;

export function ScoreDot({ level, label }: { level: Analysis["level"]; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className={`w-3 h-3 rounded-full ${LEVEL_STYLE[level]}`} />
      {label && <span className="text-[11px] font-semibold text-brand-muted">{label}</span>}
    </span>
  );
}

function CheckIcon({ status }: { status: Check["status"] }) {
  if (status === "good") return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />;
  if (status === "ok") return <TriangleAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;
}

function CheckList({ checks }: { checks: Check[] }) {
  const groups: { key: Check["status"]; title: string }[] = [
    { key: "bad", title: "Problems" },
    { key: "ok", title: "Improvements" },
    { key: "good", title: "Good results" },
  ];
  return (
    <div className="space-y-2">
      {groups.map(({ key, title }) => {
        const items = checks.filter((c) => c.status === key);
        if (items.length === 0) return null;
        return <CheckGroup key={key} title={`${title} (${items.length})`} items={items} defaultOpen={key !== "good"} />;
      })}
    </div>
  );
}

function CheckGroup({ title, items, defaultOpen }: { title: string; items: Check[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-brand-borderLight overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-brand-bgSoft text-xs font-bold text-brand-dark"
      >
        {title}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <ul className="p-3 space-y-2 bg-white">
          {items.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-xs text-brand-dark leading-relaxed">
              <CheckIcon status={c.status} />
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LengthBar({ length, min, max }: { length: number; min: number; max: number }) {
  const pct = Math.min(100, Math.round((length / max) * 100));
  const color = length === 0 ? "bg-slate-300" : length > max ? "bg-red-500" : length < min ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="h-1.5 rounded-full bg-brand-bgLight overflow-hidden mt-1.5">
      <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

export interface SeoPanelContext {
  kind: SeoKind;
  /** The page's own title (post title, category name…). */
  title: string;
  slug?: string;
  /** Site path used in the snippet preview, e.g. "/blog/my-post". */
  path: string;
  /** Text used when no meta description is written (post excerpt, category description…). */
  fallbackDescription?: string;
  /** Body HTML. When undefined the content checks and the Readability tab are skipped. */
  html?: string;
  /** Featured image, shown in social previews when no social image is chosen. */
  image?: string;
  categoryName?: string;
}

type Tab = "seo" | "readability" | "social" | "advanced";

const SCHEMA_OPTIONS: Record<string, { value: string; label: string }[]> = {
  post: [
    { value: "", label: "Default (from SEO Settings)" },
    { value: "Article", label: "Article" },
    { value: "BlogPosting", label: "Blog post" },
    { value: "NewsArticle", label: "News article" },
    { value: "TechArticle", label: "Technical article" },
    { value: "HowTo", label: "How-to" },
  ],
  page: [
    { value: "", label: "Default (Web page)" },
    { value: "WebPage", label: "Web page" },
    { value: "AboutPage", label: "About page" },
    { value: "ContactPage", label: "Contact page" },
    { value: "FAQPage", label: "FAQ page" },
    { value: "CollectionPage", label: "Collection page" },
  ],
};

export function SeoPanel({
  value,
  onChange,
  context,
}: {
  value: SeoMeta;
  onChange: (patch: Partial<SeoMeta>) => void;
  context: SeoPanelContext;
}) {
  const site = useSeoSite();
  const [tab, setTab] = useState<Tab>("seo");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const titleRef = useRef<HTMLInputElement>(null);

  const hasBody = context.html !== undefined;
  const settings = site?.settings;

  const resolvedTitle = useMemo(() => {
    if (!settings) return value.title || context.title;
    return resolveSeoTitle(settings, context.kind, {
      seoTitle: value.title,
      title: context.title,
      sitename: site?.siteName || "",
      tagline: site?.tagline || "",
      category: context.categoryName,
    });
  }, [settings, site, value.title, context.kind, context.title, context.categoryName]);

  const bodyText = hasBody ? stripHtml(context.html || "") : "";
  const fallbackDescription =
    context.fallbackDescription?.trim() ||
    (bodyText ? bodyText.slice(0, DESCRIPTION_MAX) : "") ||
    site?.siteDescription ||
    "";
  const resolvedDescription = value.description?.trim() || fallbackDescription;

  const seoAnalysis = useMemo(
    () =>
      analyseSeo({
        keyword: value.focusKeyword || "",
        title: resolvedTitle,
        description: resolvedDescription,
        hasCustomDescription: !!value.description?.trim(),
        slug: context.slug || "",
        html: context.html,
      }),
    [value.focusKeyword, value.description, resolvedTitle, resolvedDescription, context.slug, context.html]
  );
  const readability = useMemo(
    () => (hasBody ? analyseReadability(context.html || "") : null),
    [hasBody, context.html]
  );

  const host = (site?.baseUrl || "https://example.com").replace(/^https?:\/\//, "");
  const crumbs = context.path.split("/").filter(Boolean);
  const snippetTitle = resolvedTitle.length > TITLE_MAX ? `${resolvedTitle.slice(0, TITLE_MAX - 1)}…` : resolvedTitle;
  const snippetDescription =
    resolvedDescription.length > DESCRIPTION_MAX ? `${resolvedDescription.slice(0, DESCRIPTION_MAX - 1)}…` : resolvedDescription;

  const insertVariable = (token: string) => {
    const el = titleRef.current;
    const current = value.title || "";
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    onChange({ title: `${current.slice(0, start)}${token}${current.slice(end)}` });
    el?.focus();
  };

  const siteDefaults = settings?.indexing;
  const defaultIndex =
    context.kind === "post"
      ? siteDefaults?.posts
      : context.kind === "page"
      ? siteDefaults?.pages
      : context.kind === "category"
      ? siteDefaults?.categories
      : true;

  const tabs: { id: Tab; label: string }[] = [
    { id: "seo", label: "SEO" },
    ...(hasBody ? [{ id: "readability" as Tab, label: "Readability" }] : []),
    { id: "social", label: "Social" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className={`${cardCls} !p-0 overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-brand-borderLight bg-brand-bgSoft/60">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-brand-dark">SEO</h3>
        </div>
        <div className="flex items-center gap-4">
          <ScoreDot level={seoAnalysis.level} label={`SEO: ${seoAnalysis.level === "none" ? "no keyphrase" : `${seoAnalysis.score}%`}`} />
          {readability && <ScoreDot level={readability.level} label={`Readability: ${readability.score}%`} />}
        </div>
      </div>

      <div className="flex gap-1 px-3 pt-2 border-b border-brand-borderLight overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-md border-b-2 whitespace-nowrap ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-brand-muted hover:text-brand-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ============ SEO tab ============ */}
        {tab === "seo" && (
          <>
            <div>
              <label className={labelCls}>Focus keyphrase</label>
              <input
                type="text"
                value={value.focusKeyword || ""}
                onChange={(e) => onChange({ focusKeyword: e.target.value })}
                placeholder="e.g. neck pain relief"
                className={inputCls}
              />
              <p className="text-[11px] text-brand-muted mt-1">
                The search term you want this page to rank for. The checks below use it.
              </p>
            </div>

            {/* Snippet preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={labelCls + " mb-0"}>Google preview</span>
                <div className="flex rounded-lg border border-brand-border overflow-hidden">
                  {(["mobile", "desktop"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDevice(d)}
                      className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 ${
                        device === d ? "bg-primary text-white" : "bg-white text-brand-muted"
                      }`}
                    >
                      {d === "mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      {d === "mobile" ? "Mobile" : "Desktop"}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={`rounded-xl border border-slate-200 bg-white p-4 ${device === "mobile" ? "max-w-sm" : ""}`}
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {(site?.siteName || "S").charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] text-slate-800 leading-tight truncate">{site?.siteName || "Your site"}</div>
                    <div className="text-[11px] text-slate-500 leading-tight truncate">
                      {host}
                      {crumbs.length > 0 && ` › ${crumbs.join(" › ")}`}
                    </div>
                  </div>
                </div>
                <div className="text-[19px] leading-snug text-[#1a0dab] mb-1 break-words">
                  {snippetTitle || "Add an SEO title"}
                </div>
                <p className="text-[13px] leading-snug text-slate-600 break-words">
                  {snippetDescription || "No description yet — search engines will choose text from the page."}
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls + " mb-0"}>SEO title</label>
                <span className="text-[11px] text-brand-muted">{resolvedTitle.length} / {TITLE_MAX}</span>
              </div>
              <input
                ref={titleRef}
                type="text"
                value={value.title || ""}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder={resolvedTitle || "Leave empty to use the default title format"}
                className={inputCls}
              />
              <LengthBar length={resolvedTitle.length} min={TITLE_IDEAL_MIN} max={TITLE_MAX} />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-brand-muted">Insert:</span>
                {SEO_VARIABLES.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => insertVariable(v.token)}
                    className="px-2 py-0.5 rounded-full bg-brand-bgLight hover:bg-primary hover:text-white text-[11px] font-semibold text-brand-dark transition-colors"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              {!value.title && (
                <p className="text-[11px] text-brand-muted mt-1.5">
                  Using the default format from SEO Settings. Type here to override it.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls + " mb-0"}>Meta description</label>
                <span className="text-[11px] text-brand-muted">
                  {(value.description || "").length} / {DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                rows={3}
                value={value.description || ""}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder={fallbackDescription || "Write a short summary that makes people want to click"}
                className={inputCls}
              />
              <LengthBar length={(value.description || "").length} min={DESCRIPTION_IDEAL_MIN} max={DESCRIPTION_MAX} />
            </div>

            {/* Analysis */}
            <div>
              <span className={labelCls}>SEO analysis</span>
              <CheckList checks={seoAnalysis.checks} />
            </div>
          </>
        )}

        {/* ============ Readability ============ */}
        {tab === "readability" && readability && (
          <div>
            <span className={labelCls}>Readability analysis</span>
            <CheckList checks={readability.checks} />
          </div>
        )}

        {/* ============ Social ============ */}
        {tab === "social" && (
          <div className="space-y-6">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-brand-muted">
              <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              Leave these empty to reuse the SEO title, meta description and featured image. Set them only if the
              post should look different when shared.
            </div>

            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs text-brand-dark">Facebook / Open Graph</h4>
              <input
                type="text"
                value={value.ogTitle || ""}
                onChange={(e) => onChange({ ogTitle: e.target.value })}
                placeholder={`Title — ${resolvedTitle}`}
                className={inputCls}
              />
              <textarea
                rows={2}
                value={value.ogDescription || ""}
                onChange={(e) => onChange({ ogDescription: e.target.value })}
                placeholder={`Description — ${resolvedDescription.slice(0, 80)}`}
                className={inputCls}
              />
              <ImageField
                label="Social image"
                value={value.ogImage}
                aspect="aspect-[1.91/1]"
                onChange={(url) => onChange({ ogImage: url })}
                fallbackPreview={context.image || settings?.social.defaultImage}
                hint="Best size: 1200 × 630 px."
              />
              <SocialCard
                host={host}
                title={value.ogTitle || resolvedTitle}
                description={value.ogDescription || resolvedDescription}
                image={value.ogImage || context.image || settings?.social.defaultImage}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-brand-borderLight">
              <h4 className="font-heading font-bold text-xs text-brand-dark">Twitter / X</h4>
              <input
                type="text"
                value={value.twitterTitle || ""}
                onChange={(e) => onChange({ twitterTitle: e.target.value })}
                placeholder={`Title — ${value.ogTitle || resolvedTitle}`}
                className={inputCls}
              />
              <textarea
                rows={2}
                value={value.twitterDescription || ""}
                onChange={(e) => onChange({ twitterDescription: e.target.value })}
                placeholder="Description — defaults to the Facebook description"
                className={inputCls}
              />
              <ImageField
                label="Twitter image"
                value={value.twitterImage}
                aspect="aspect-[2/1]"
                onChange={(url) => onChange({ twitterImage: url })}
                fallbackPreview={value.ogImage || context.image || settings?.social.defaultImage}
              />
            </div>
          </div>
        )}

        {/* ============ Advanced ============ */}
        {tab === "advanced" && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Allow search engines to show this page in results?</label>
              <select
                value={value.index || "default"}
                onChange={(e) => onChange({ index: e.target.value as SeoMeta["index"] })}
                className={inputCls}
              >
                <option value="default">Default for this content type ({defaultIndex === false ? "No — noindex" : "Yes — index"})</option>
                <option value="index">Yes (index)</option>
                <option value="noindex">No (noindex)</option>
              </select>
              {settings && !settings.indexing.siteVisible && (
                <p className="text-[11px] text-red-600 mt-1">
                  The whole site is currently hidden from search engines (SEO Settings → Indexing).
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Should search engines follow links on this page?</label>
              <select
                value={value.follow || "default"}
                onChange={(e) => onChange({ follow: e.target.value as SeoMeta["follow"] })}
                className={inputCls}
              >
                <option value="default">Default ({settings?.indexing.follow === false ? "No — nofollow" : "Yes — follow"})</option>
                <option value="follow">Yes (follow)</option>
                <option value="nofollow">No (nofollow)</option>
              </select>
            </div>

            <div className="space-y-3">
              <span className={labelCls}>Advanced robots meta</span>
              <Toggle label="No archive" hint="Stops search engines showing a cached copy." checked={!!value.noarchive} onChange={(v) => onChange({ noarchive: v })} />
              <Toggle label="No snippet" hint="Stops search engines showing a text snippet." checked={!!value.nosnippet} onChange={(v) => onChange({ nosnippet: v })} />
              <Toggle label="No image index" hint="Stops search engines indexing images on this page." checked={!!value.noimageindex} onChange={(v) => onChange({ noimageindex: v })} />
            </div>

            <div>
              <label className={labelCls}>Canonical URL</label>
              <input
                type="text"
                value={value.canonical || ""}
                onChange={(e) => onChange({ canonical: e.target.value })}
                placeholder={`${site?.baseUrl || ""}${context.path}`}
                className={inputCls}
              />
              <p className="text-[11px] text-brand-muted mt-1">
                Only change this if the same content lives at another address you want search engines to prefer.
              </p>
            </div>

            <div>
              <label className={labelCls}>Breadcrumbs title</label>
              <input
                type="text"
                value={value.breadcrumbTitle || ""}
                onChange={(e) => onChange({ breadcrumbTitle: e.target.value })}
                placeholder={context.title}
                className={inputCls}
              />
              <p className="text-[11px] text-brand-muted mt-1">Name used for this page in breadcrumb structured data.</p>
            </div>

            {SCHEMA_OPTIONS[context.kind] && (
              <div>
                <label className={labelCls}>Schema type</label>
                <select
                  value={value.schemaType || ""}
                  onChange={(e) => onChange({ schemaType: e.target.value })}
                  className={inputCls}
                >
                  {SCHEMA_OPTIONS[context.kind].map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Toggle
              label="Exclude from the XML sitemap"
              hint="The page stays live but is not listed in sitemap.xml."
              checked={!!value.excludeFromSitemap}
              onChange={(v) => onChange({ excludeFromSitemap: v })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SocialCard({
  host,
  title,
  description,
  image,
}: {
  host: string;
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <div className="max-w-md rounded-lg border border-slate-300 overflow-hidden bg-[#F0F2F5]">
      <div className="aspect-[1.91/1] bg-slate-200 flex items-center justify-center text-[11px] text-slate-500">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          "No image — add one for better sharing"
        )}
      </div>
      <div className="p-3">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 truncate">{host}</div>
        <div className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{title}</div>
        <div className="text-xs text-slate-600 line-clamp-2">{description}</div>
      </div>
    </div>
  );
}
