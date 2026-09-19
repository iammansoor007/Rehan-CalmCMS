"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { RedirectsContent, SeoSettings } from "@/types/cms";
import { SEO_VARIABLES, fillTemplate } from "@/lib/seoShared";
import { ContentPage } from "./ContentPage";
import {
  Field,
  ImageField,
  ListEditor,
  SectionCard,
  TextAreaField,
  TextField,
  Toggle,
  sectionPatcher,
} from "./fields";
import { useSeoSite } from "./SeoPanel";
import { inputCls } from "./shared";

const SEPARATORS = ["|", "-", "–", "—", "·", "•", "»", "/"];

function TemplateField({
  label,
  value,
  onChange,
  sample,
  separator,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  sample: string;
  separator: string;
}) {
  const site = useSeoSite();
  const preview = fillTemplate(value, {
    title: sample,
    sitename: site?.siteName || "Your Site",
    tagline: site?.tagline || "Your tagline",
    sep: separator,
    category: "Category",
  });
  return (
    <Field label={label}>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        {SEO_VARIABLES.map((v) => (
          <button
            key={v.token}
            type="button"
            onClick={() => onChange(`${value} ${v.token}`.trim())}
            className="px-2 py-0.5 rounded-full bg-brand-bgLight hover:bg-primary hover:text-white text-[11px] font-semibold text-brand-dark transition-colors"
          >
            + {v.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-brand-muted mt-1.5">
        Preview: <span className="font-semibold text-[#1a0dab]">{preview || "—"}</span>
      </p>
    </Field>
  );
}

export function SeoSettingsEditor() {
  return (
    <ContentPage<SeoSettings>
      contentKey="seo"
      title="SEO Settings"
      description="Site-wide search-engine settings. Every post, page and category can override these in its own SEO panel."
      viewHref="/"
    >
      {({ data, setData }) => {
        const indexing = sectionPatcher(setData, "indexing");
        const templates = sectionPatcher(setData, "titleTemplates");
        const social = sectionPatcher(setData, "social");
        const verify = sectionPatcher(setData, "verification");
        const schema = sectionPatcher(setData, "schema");
        const sitemap = sectionPatcher(setData, "sitemap");
        const robots = sectionPatcher(setData, "robotsTxt");
        const analytics = sectionPatcher(setData, "analytics");
        const sep = data.titleSeparator;

        return (
          <>
            <SectionCard
              title="Indexing"
              description="Should search engines list your site?"
              defaultOpen
            >
              <Toggle
                label="Allow search engines to show this site in results"
                hint="Turn this off to hide the WHOLE site (noindex, nofollow and Disallow in robots.txt). Use it while building the site."
                checked={data.indexing.siteVisible}
                onChange={(v) => indexing({ siteVisible: v })}
              />
              {!data.indexing.siteVisible && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  Search engines are currently asked to ignore your entire site. Turn this back on when you are ready to launch.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-brand-borderLight">
                <Toggle label="Index posts by default" checked={data.indexing.posts} onChange={(v) => indexing({ posts: v })} />
                <Toggle label="Index pages by default" checked={data.indexing.pages} onChange={(v) => indexing({ pages: v })} />
                <Toggle label="Index category pages by default" checked={data.indexing.categories} onChange={(v) => indexing({ categories: v })} />
                <Toggle label="Follow links by default" checked={data.indexing.follow} onChange={(v) => indexing({ follow: v })} />
              </div>
              <p className="text-[11px] text-brand-muted">
                Each post/page/category can override these in the Advanced tab of its SEO panel.
              </p>
            </SectionCard>

            <SectionCard
              title="Search appearance: titles"
              description="How titles look in Google, per content type"
              defaultOpen
            >
              <Field label="Title separator">
                <div className="flex flex-wrap gap-2">
                  {SEPARATORS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, titleSeparator: s }))}
                      className={`w-9 h-9 rounded-lg border text-sm font-bold transition-colors ${
                        sep === s ? "bg-primary text-white border-primary" : "bg-white text-brand-dark border-brand-border hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <TemplateField label="Homepage title" value={data.titleTemplates.home} onChange={(v) => templates({ home: v })} sample="" separator={sep} />
              <TemplateField label="Post title" value={data.titleTemplates.post} onChange={(v) => templates({ post: v })} sample="Sample Post Title" separator={sep} />
              <TemplateField label="Page title" value={data.titleTemplates.page} onChange={(v) => templates({ page: v })} sample="Sample Page" separator={sep} />
              <TemplateField label="Category title" value={data.titleTemplates.category} onChange={(v) => templates({ category: v })} sample="Sample Category" separator={sep} />
              <TemplateField label="Other pages (About, Contact…)" value={data.titleTemplates.other} onChange={(v) => templates({ other: v })} sample="About Us" separator={sep} />
              <TextAreaField
                label="Default meta description"
                rows={2}
                value={data.defaultDescription}
                onChange={(v) => setData((d) => ({ ...d, defaultDescription: v }))}
                hint="Used when a page has no description of its own. Leave empty to use the site description from Branding & Logo."
              />
              <TextField
                label="Site URL"
                value={data.siteUrl}
                onChange={(v) => setData((d) => ({ ...d, siteUrl: v }))}
                placeholder="https://www.yoursite.com"
                hint="Your public web address, used in canonical links, the sitemap and social cards. Leave empty to use the NEXT_PUBLIC_SITE_URL setting."
              />
            </SectionCard>

            <SectionCard title="Social sharing" description="Open Graph and Twitter defaults">
              <TextField label="Site name for social cards" value={data.social.ogSiteName} onChange={(v) => social({ ogSiteName: v })} hint="Leave empty to use the brand name." />
              <ImageField
                label="Default share image"
                aspect="aspect-[1.91/1]"
                value={data.social.defaultImage}
                onChange={(url) => social({ defaultImage: url })}
                hint="Used when a page has no image of its own. Best size: 1200 × 630 px."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Twitter / X handle" value={data.social.twitterHandle} onChange={(v) => social({ twitterHandle: v })} placeholder="@yourbrand" />
                <Field label="Twitter card style">
                  <select
                    value={data.social.twitterCard}
                    onChange={(e) => social({ twitterCard: e.target.value as SeoSettings["social"]["twitterCard"] })}
                    className={inputCls}
                  >
                    <option value="summary_large_image">Large image</option>
                    <option value="summary">Small summary</option>
                  </select>
                </Field>
              </div>
              <p className="text-[11px] text-brand-muted">Facebook, Twitter, Instagram and LinkedIn page links are set under Branding & Logo.</p>
            </SectionCard>

            <SectionCard title="Structured data (Schema)" description="Helps Google understand who you are">
              <Toggle label="Add structured data (JSON-LD) to every page" checked={data.schema.enabled} onChange={(v) => schema({ enabled: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Site represents">
                  <select
                    value={data.schema.orgType}
                    onChange={(e) => schema({ orgType: e.target.value as SeoSettings["schema"]["orgType"] })}
                    className={inputCls}
                  >
                    <option value="Organization">An organization / brand</option>
                    <option value="Person">A person</option>
                  </select>
                </Field>
                <TextField label="Name" value={data.schema.orgName} onChange={(v) => schema({ orgName: v })} hint="Leave empty to use the brand name." />
              </div>
              <ImageField label="Logo" aspect="aspect-square" value={data.schema.orgLogo} onChange={(url) => schema({ orgLogo: url })} hint="Leave empty to use the logo from Branding & Logo." />
              <Field label="Default article type for posts">
                <select
                  value={data.schema.articleType}
                  onChange={(e) => schema({ articleType: e.target.value as SeoSettings["schema"]["articleType"] })}
                  className={inputCls}
                >
                  <option value="BlogPosting">Blog post</option>
                  <option value="Article">Article</option>
                  <option value="NewsArticle">News article</option>
                </select>
              </Field>
              <Toggle label="Add breadcrumb structured data" checked={data.schema.breadcrumbs} onChange={(v) => schema({ breadcrumbs: v })} />
            </SectionCard>

            <SectionCard title="XML sitemap" description="/sitemap.xml">
              <Toggle label="Enable the XML sitemap" checked={data.sitemap.enabled} onChange={(v) => sitemap({ enabled: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Toggle label="Include posts" checked={data.sitemap.posts} onChange={(v) => sitemap({ posts: v })} />
                <Toggle label="Include pages" checked={data.sitemap.pages} onChange={(v) => sitemap({ pages: v })} />
                <Toggle label="Include categories" checked={data.sitemap.categories} onChange={(v) => sitemap({ categories: v })} />
              </div>
              <p className="text-[11px] text-brand-muted">
                Items set to “noindex” or “Exclude from sitemap” are never listed.
              </p>
              <Link href="/sitemap.xml" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> View sitemap.xml
              </Link>
            </SectionCard>

            <SectionCard title="robots.txt" description="Rules for crawlers">
              <Toggle
                label="Block AI training crawlers"
                hint="Adds Disallow rules for GPTBot, CCBot, Google-Extended, ClaudeBot and similar."
                checked={data.robotsTxt.blockAiCrawlers}
                onChange={(v) => robots({ blockAiCrawlers: v })}
              />
              <TextAreaField
                label="Extra rules"
                rows={5}
                value={data.robotsTxt.extra}
                onChange={(v) => robots({ extra: v })}
                placeholder={"User-agent: Bingbot\nCrawl-delay: 5"}
                hint="Added to the end of robots.txt. The /admin and /api folders are always blocked."
              />
              <Link href="/robots.txt" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> View robots.txt
              </Link>
            </SectionCard>

            <SectionCard title="Webmaster tools" description="Verify ownership with search engines">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Google Search Console" value={data.verification.google} onChange={(v) => verify({ google: v })} hint="The content value of the google-site-verification tag." />
                <TextField label="Bing Webmaster Tools" value={data.verification.bing} onChange={(v) => verify({ bing: v })} />
                <TextField label="Yandex Webmaster" value={data.verification.yandex} onChange={(v) => verify({ yandex: v })} />
                <TextField label="Pinterest" value={data.verification.pinterest} onChange={(v) => verify({ pinterest: v })} />
              </div>
            </SectionCard>

            <SectionCard title="Analytics" description="Google Analytics 4">
              <TextField
                label="Measurement ID"
                value={data.analytics.ga4Id}
                onChange={(v) => analytics({ ga4Id: v.trim() })}
                placeholder="G-XXXXXXXXXX"
                hint="Leave empty to disable tracking."
              />
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}

export function RedirectsEditor() {
  return (
    <ContentPage<RedirectsContent>
      contentKey="redirects"
      title="Redirects"
      description="Send visitors and search engines from an old address to a new one (permanent 301). Redirects are added automatically when you change a post, page or category slug."
    >
      {({ data, setData }) => (
        <SectionCard title="Redirect rules" description="Works for /blog/…, /category/… and /page-slug addresses" defaultOpen>
          <ListEditor
            items={data.items}
            onChange={(items) => setData((d) => ({ ...d, items }))}
            newItem={() => ({ from: "", to: "" })}
            itemLabel="Redirect"
            addLabel="Add a redirect"
            summary={(r) => (r.from ? `${r.from} → ${r.to}` : "")}
            renderItem={(r, update) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField label="From (old address)" value={r.from} onChange={(v) => update({ from: v })} placeholder="/blog/old-post" />
                <TextField label="To (new address)" value={r.to} onChange={(v) => update({ to: v })} placeholder="/blog/new-post or https://…" />
              </div>
            )}
          />
          <p className="text-[11px] text-brand-muted">
            “From” must start with “/”. Rules with an empty or identical address are dropped when you save.
          </p>
        </SectionCard>
      )}
    </ContentPage>
  );
}
