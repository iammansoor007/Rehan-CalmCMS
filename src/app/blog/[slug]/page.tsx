import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getArticles,
  getCategories,
  getSidebarSettings,
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
import { Sidebar } from "@/components/ui/Sidebar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Calendar, Sparkles, Check, ShieldCheck, Eye, Star } from "lucide-react";

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
  return (
    <div className="relative w-[60px] h-[60px] rounded-[10px] overflow-hidden flex-shrink-0 bg-brand-bgLight">
      {src ? (
        <Image src={src} alt={alt} fill sizes="60px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary/50">
          <Sparkles className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
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

  const [articles, templates, seoCtx, categories, sidebar] = await Promise.all([
    getArticles(),
    getTemplateSettings(),
    getSeoContext(),
    getCategories(),
    getSidebarSettings(),
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
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : articles[articles.length - 1];
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : articles[0];

  const categoryEntry = categories.find((c) => c.name === article.category);
  const categorySlug = categoryEntry?.slug || slugify(article.category);
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
      { name: categoryEntry?.seo?.breadcrumbTitle || article.category, path: `/category/${categorySlug}` },
      { name: seo.breadcrumbTitle || article.title, path: `/blog/${article.slug}` },
    ]),
  ];

  const h2 = "font-heading font-bold text-[1.65rem] text-brand-dark leading-[1.3] mt-9 mb-4";

  return (
    <div className="bg-white pt-10 pb-24 min-h-[80vh]">
      <JsonLd data={jsonLd} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isLive(article) && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span>
              Preview only — this post is {article.status === "scheduled" ? "scheduled and not live yet" : "a draft"}.
              Visitors cannot see it.
            </span>
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: article.category, href: `/category/${categorySlug}` },
            { label: article.title },
          ]}
        />

        {/* 2 columns: article + 340px sidebar (sidebar hidden below lg, like the original) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-12 items-start">
          <article className="min-w-0">
            {/* Header */}
            <header className="mb-6">
              <Link
                href={`/category/${categorySlug}`}
                className="inline-block px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-[0.78rem] font-bold uppercase tracking-[0.1em] mb-4 hover:bg-primary hover:text-white transition-colors"
              >
                {article.category}
              </Link>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[2.5rem] text-brand-dark tracking-[-0.025em] leading-[1.22] mb-[18px]">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-[0.9rem] text-brand-muted pb-5 border-b border-brand-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-[0.8rem] flex items-center justify-center">
                    {article.author.charAt(0)}
                  </div>
                  <span className="font-semibold text-brand-dark">By {article.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-[15px] h-[15px]" />
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

            {/* Featured image */}
            {article.img && (
              <div className="relative w-full aspect-[16/9] max-h-[420px] rounded-2xl overflow-hidden my-7 mb-9 shadow-card bg-brand-bgSoft">
                <Image
                  src={article.img}
                  alt={article.imgAlt || article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 860px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Quick summary box */}
            {(article.quickSummary || (!article.content && article.intro)) && (
              <div className="rounded-2xl bg-primary-light border border-primary/25 px-[26px] py-[22px] mb-8">
                <div className="flex items-center gap-2 font-bold text-[0.95rem] text-primary-dark mb-2">
                  <Star className="w-[18px] h-[18px] text-primary" />
                  <span>Quick Summary</span>
                </div>
                <p className="text-[0.98rem] text-brand-dark leading-relaxed">
                  {article.quickSummary || article.intro}
                </p>
              </div>
            )}

            {/* Body */}
            <div className="blog-detail-body">
              {article.content ? (
                <div className="cms-content" dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <>
                  {article.intro && (
                    <p className="text-[1.12rem] font-medium text-brand-dark leading-[1.75] mb-6">{article.intro}</p>
                  )}
                  {article.keyBenefits && article.keyBenefits.length > 0 && (
                    <>
                      <h2 className={h2}>Key Benefits of This Approach</h2>
                      <ul className="my-5 mb-7 space-y-3">
                        {article.keyBenefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-3 text-[1.02rem] text-brand-dark">
                            <span className="w-[22px] h-[22px] rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {article.sections.map((sec) => (
                    <section key={sec.heading}>
                      <h2 className={h2}>{sec.heading}</h2>
                      <p className="text-[1.05rem] text-[#36443E] leading-[1.82] mb-[22px]">{sec.text}</p>
                    </section>
                  ))}
                </>
              )}

              {article.dataTable && (
                <>
                  <h2 className={h2}>Recommended Treatment Overview</h2>
                  <div className="overflow-x-auto rounded-xl border border-brand-border my-7">
                    <table className="w-full border-collapse text-[0.95rem]">
                      <thead>
                        <tr className="bg-primary-light">
                          {article.dataTable.headers.map((h) => (
                            <th key={h} className="text-left font-bold text-brand-dark px-[18px] py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {article.dataTable.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-brand-borderLight last:border-b-0">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-[18px] py-3.5 text-[#36443E]">
                                {cIdx === 0 ? <strong className="text-brand-dark">{cell}</strong> : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {article.safeSteps && article.safeSteps.length > 0 && (
                <>
                  <h2 className={h2}>How to Practice Safely</h2>
                  <ol className="my-6 mb-8 space-y-4">
                    {article.safeSteps.map((step) => (
                      <li key={step.step} className="flex items-start gap-3.5 text-[1.02rem]">
                        <span className="w-[26px] h-[26px] rounded-full bg-primary text-white font-bold text-[0.85rem] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {step.step}
                        </span>
                        <div className="text-[#36443E]">
                          <strong className="text-brand-dark">{step.title}:</strong> {step.desc}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {article.callout && (
                <div className="my-8 flex items-start gap-3 rounded-2xl bg-brand-accentBeigeLight border border-brand-accentBeige px-6 py-5 text-[0.95rem] text-brand-dark">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{article.callout}</p>
                </div>
              )}

              {/* Bottom CTA banner */}
              {tpl.showCta && (
                <div className="my-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-brand-accentBeigeLight border border-brand-accentBeige px-7 py-6">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 shadow-soft">
                      <ShieldCheck className="w-6 h-6" />
                    </span>
                    <div>
                      <strong className="block text-[1.05rem] text-brand-dark mb-0.5">{tpl.ctaTitle}</strong>
                      <p className="text-[0.88rem] text-brand-muted">{tpl.ctaText}</p>
                    </div>
                  </div>
                  {tpl.ctaButtonText && tpl.ctaButtonHref && (
                    <Link
                      href={tpl.ctaButtonHref}
                      className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-primary text-white text-[0.95rem] font-semibold hover:bg-primary-dark hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(78,110,88,0.25)]"
                    >
                      {tpl.ctaButtonText}
                    </Link>
                  )}
                </div>
              )}

              {tpl.showShare && <ShareBar title={article.title} />}

              {tpl.showAuthorBox && (
                <div className="my-9 flex items-center gap-5 rounded-2xl bg-brand-bgSoft border border-brand-border px-7 py-6">
                  <div className="w-16 h-16 rounded-full bg-primary-light text-primary font-bold text-2xl flex items-center justify-center flex-shrink-0">
                    {article.author.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary">{tpl.authorBoxLabel}</span>
                    <h4 className="font-heading font-bold text-[1.15rem] text-brand-dark mt-0.5 mb-1.5">{article.author}</h4>
                    <p className="text-[0.88rem] text-brand-muted leading-[1.5]">{tpl.authorBio}</p>
                  </div>
                </div>
              )}

              {tpl.showPrevNext && (prevArticle || nextArticle) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-9">
                  {prevArticle ? (
                    <Link
                      href={`/blog/${prevArticle.slug}`}
                      className="flex items-center gap-3.5 rounded-2xl bg-brand-bgSoft border border-brand-border p-4 hover:bg-white hover:border-primary hover:shadow-soft transition-all"
                    >
                      <Thumb src={prevArticle.img} alt={prevArticle.title} />
                      <div className="min-w-0">
                        <span className="text-[0.72rem] font-bold tracking-[0.08em] text-primary">← PREVIOUS ARTICLE</span>
                        <h5 className="text-[0.88rem] font-semibold text-brand-dark mt-1 leading-[1.3] line-clamp-2">{prevArticle.title}</h5>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextArticle && (
                    <Link
                      href={`/blog/${nextArticle.slug}`}
                      className="flex items-center gap-3.5 rounded-2xl bg-brand-bgSoft border border-brand-border p-4 hover:bg-white hover:border-primary hover:shadow-soft transition-all text-right"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[0.72rem] font-bold tracking-[0.08em] text-primary">NEXT ARTICLE →</span>
                        <h5 className="text-[0.88rem] font-semibold text-brand-dark mt-1 leading-[1.3] line-clamp-2">{nextArticle.title}</h5>
                      </div>
                      <Thumb src={nextArticle.img} alt={nextArticle.title} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </article>

          <div className="hidden lg:block">
            <Sidebar
              recentArticles={articles}
              categories={categories}
              settings={sidebar}
              activeCategorySlug={categorySlug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
