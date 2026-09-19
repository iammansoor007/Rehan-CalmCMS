import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getArticles,
  getCategories,
  getTemplateSettings,
  isLive,
} from "@/lib/cms/client";
import { resolveRedirect } from "@/lib/cms/content";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  getSeoContext,
  toIsoDate,
} from "@/lib/seo";
import { getSession } from "@/lib/auth";
import { getExcerpt } from "@/lib/excerpt";
import { slugify } from "@/lib/slugify";
import { ShareBar } from "@/components/blog/ShareBar";
import {
  Calendar,
  ChevronRight,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
} from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

/** Logged-in admins can open drafts and scheduled posts to preview them. */
async function loadArticle(slug: string) {
  const session = await getSession();
  return getArticleBySlug(slug, { includeAll: !!session });
}

function Thumb({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary/50">
        <Sparkles className="w-5 h-5" />
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes="64px" className="object-cover" />;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const [article, ctx] = await Promise.all([loadArticle(params.slug), getSeoContext()]);
  if (!article) return { title: "Article Not Found", robots: { index: false, follow: false } };

  return buildMetadata(ctx, {
    kind: "post",
    path: `/blog/${article.slug}`,
    title: article.title,
    seo: article.seo,
    description: getExcerpt(article),
    image: article.img,
    category: article.category,
    keywords: article.keywords,
    preview: !isLive(article),
    article: {
      publishedTime: toIsoDate(article.scheduledAt) || toIsoDate(article.date),
      author: article.author,
      section: article.category,
    },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const article = await loadArticle(params.slug);
  if (!article) {
    // A post whose slug changed keeps working: send visitors (and Google) to the new address.
    const moved = await resolveRedirect(`/blog/${params.slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  // Reached through an alternative address (e.g. the title-derived slug): use the real URL.
  if (article.slug !== params.slug) permanentRedirect(`/blog/${article.slug}`);

  const [articles, templates, seoCtx, categories] = await Promise.all([
    getArticles(),
    getTemplateSettings(),
    getSeoContext(),
    getCategories(),
  ]);
  const tpl = templates.post;
  const wordCount = (
    article.content ||
    [article.intro, ...article.sections.map((sec) => sec.text)].join(" ")
  )
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const currentIndex = articles.findIndex((a) => a.slug === article.slug);
  const prevArticle =
    currentIndex > 0 ? articles[currentIndex - 1] : articles[articles.length - 1];
  const nextArticle =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : articles[0];

  const categoryEntry = categories.find((c) => c.name === article.category);
  const seo = article.seo || {};
  const jsonLd = [
    articleJsonLd(seoCtx, {
      path: `/blog/${article.slug}`,
      headline: article.title,
      description: seo.description || getExcerpt(article),
      image: seo.ogImage || article.img,
      published: toIsoDate(article.scheduledAt) || toIsoDate(article.date),
      author: article.author,
      section: article.category,
      keywords: article.keywords,
      type: seo.schemaType || undefined,
    }),
    breadcrumbJsonLd(seoCtx, [
      { name: "Home", path: "/" },
      {
        name: categoryEntry?.seo?.breadcrumbTitle || article.category,
        path: `/category/${categoryEntry?.slug || slugify(article.category)}`,
      },
      { name: seo.breadcrumbTitle || article.title, path: `/blog/${article.slug}` },
    ]),
  ];

  return (
    <article className="py-12 bg-brand-bgSoft/30 min-h-screen">
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isLive(article) && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span>
              Preview only — this post is{" "}
              {article.status === "scheduled" ? "scheduled and not live yet" : "a draft"}. Visitors
              cannot see it.
            </span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <Link
            href={`/category/${slugify(article.category)}`}
            className="hover:text-primary transition-colors"
          >
            {article.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-dark font-medium truncate max-w-xs sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <Link
            href={`/category/${slugify(article.category)}`}
            className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 hover:bg-primary/20 transition-colors"
          >
            {article.category}
          </Link>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight leading-[1.2] mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-brand-muted border-b border-brand-borderLight pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                {article.author.charAt(0)}
              </div>
              <span className="font-medium text-brand-dark">By {article.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            {tpl.showReadingTime && (
              <>
                <span>•</span>
                <span>{readMinutes} min read</span>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.img && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-card border border-brand-borderLight mb-10 bg-brand-bgLight">
            <Image
              src={article.img}
              alt={article.imgAlt || article.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Quick Summary Callout Box */}
        {article.quickSummary && (
          <div className="p-6 rounded-2xl bg-brand-bgSoft border-l-4 border-primary shadow-soft mb-10">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Quick Summary</span>
            </div>
            <p className="text-sm text-brand-dark leading-relaxed">
              {article.quickSummary}
            </p>
          </div>
        )}

        {article.content ? (
          <div
            className="cms-content mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <>
        {/* Article Intro & Key Benefits */}
        <div className="space-y-6 text-base text-brand-dark leading-relaxed mb-10">
          <p className="text-lg font-medium text-brand-dark/90 leading-relaxed">
            {article.intro}
          </p>

          {article.keyBenefits && article.keyBenefits.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-brand-borderLight space-y-3">
              <h2 className="font-heading font-semibold text-lg text-brand-dark">
                Key Benefits of This Approach
              </h2>
              <ul className="space-y-2.5">
                {article.keyBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm text-brand-muted">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8 mb-12">
          {article.sections.map((sec) => (
            <section key={sec.heading} className="space-y-3">
              <h2 className="font-heading font-bold text-2xl text-brand-dark tracking-tight">
                {sec.heading}
              </h2>
              <p className="text-base text-brand-muted leading-relaxed">
                {sec.text}
              </p>
            </section>
          ))}
        </div>

          </>
        )}

        {/* Data Table */}
        {article.dataTable && (
          <div className="my-10 space-y-4">
            <h2 className="font-heading font-bold text-2xl text-brand-dark tracking-tight">
              Recommended Treatment Overview
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-brand-border">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-brand-bgSoft border-b border-brand-border">
                    {article.dataTable.headers.map((h) => (
                      <th key={h} className="p-4 font-semibold text-brand-dark">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-borderLight bg-white">
                  {article.dataTable.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-brand-bgSoft/50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-4 text-brand-muted">
                          {cIdx === 0 ? (
                            <strong className="text-brand-dark">{cell}</strong>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Safe Steps Numbered List */}
        {article.safeSteps && article.safeSteps.length > 0 && (
          <div className="my-10 space-y-4">
            <h2 className="font-heading font-bold text-2xl text-brand-dark tracking-tight">
              How to Practice Safely
            </h2>
            <div className="space-y-3">
              {article.safeSteps.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-brand-borderLight"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-brand-dark mb-0.5">
                      {step.title}
                    </h4>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Callout Box */}
        {article.callout && (
          <div className="my-10 p-6 rounded-2xl bg-brand-accentBeigeLight/50 border border-brand-accentBeige/30 text-sm text-brand-dark flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-dark flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{article.callout}</p>
          </div>
        )}

        {/* In-Article CTA Banner */}
        {tpl.showCta && (
          <div className="my-12 p-8 rounded-3xl bg-brand-bgSoft border border-brand-borderLight flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading font-bold text-xl text-brand-dark">{tpl.ctaTitle}</h3>
              <p className="text-xs sm:text-sm text-brand-muted">{tpl.ctaText}</p>
            </div>
            {tpl.ctaButtonText && tpl.ctaButtonHref && (
              <Link
                href={tpl.ctaButtonHref}
                className="px-6 py-3 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark shadow-sm transition-colors whitespace-nowrap"
              >
                {tpl.ctaButtonText}
              </Link>
            )}
          </div>
        )}

        {/* Social Sharing Bar */}
        {tpl.showShare && <ShareBar title={article.title} />}

        {/* Author Bio Card */}
        {tpl.showAuthorBox && (
          <div className="my-10 p-6 sm:p-8 rounded-3xl bg-white border border-brand-borderLight flex items-start gap-5">
            <div className="w-14 h-14 rounded-full bg-primary-light text-primary font-bold text-xl flex items-center justify-center flex-shrink-0">
              {article.author.charAt(0)}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
                {tpl.authorBoxLabel}
              </span>
              <h4 className="font-heading font-bold text-lg text-brand-dark">{article.author}</h4>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{tpl.authorBio}</p>
            </div>
          </div>
        )}

        {/* Previous / Next Article Cards */}
        {tpl.showPrevNext && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-10 pt-6 border-t border-brand-borderLight">
          {prevArticle && (
            <Link
              href={`/blog/${prevArticle.slug}`}
              className="p-4 rounded-2xl bg-white border border-brand-borderLight hover:border-primary/40 hover:shadow-sm transition-all group flex items-center gap-3"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bgLight">
                <Thumb src={prevArticle.img} alt={prevArticle.title} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-brand-muted flex items-center gap-1 group-hover:text-primary transition-colors">
                  <ArrowLeft className="w-3 h-3" /> PREVIOUS GUIDE
                </span>
                <h5 className="font-heading font-semibold text-xs text-brand-dark group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                  {prevArticle.title}
                </h5>
              </div>
            </Link>
          )}

          {nextArticle && (
            <Link
              href={`/blog/${nextArticle.slug}`}
              className="p-4 rounded-2xl bg-white border border-brand-borderLight hover:border-primary/40 hover:shadow-sm transition-all group flex items-center justify-between gap-3 text-right"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-brand-muted flex items-center justify-end gap-1 group-hover:text-primary transition-colors">
                  NEXT GUIDE <ArrowRight className="w-3 h-3" />
                </span>
                <h5 className="font-heading font-semibold text-xs text-brand-dark group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                  {nextArticle.title}
                </h5>
              </div>
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bgLight">
                <Thumb src={nextArticle.img} alt={nextArticle.title} />
              </div>
            </Link>
          )}
        </div>
        )}
      </div>
    </article>
  );
}
