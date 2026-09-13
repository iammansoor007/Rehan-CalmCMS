import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticles } from "@/lib/cms/client";
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
} from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article Not Found" };

  const metaTitle = article.metaTitle || article.title;
  const metaDescription = article.metaDescription || article.intro;
  const ogImg = article.ogImage || article.img;
  const canonical = article.canonicalUrl || `https://calmtouch.com/blog/${article.slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: article.keywords && article.keywords.length > 0 ? article.keywords : [article.category, "massage therapy", "wellness guide"],
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      siteName: "CalmTouch",
      images: [{ url: ogImg, width: 1200, height: 630, alt: article.title }],
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImg],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const articles = await getArticles();
  const currentIndex = articles.findIndex((a) => a.slug === article.slug);
  const prevArticle =
    currentIndex > 0 ? articles[currentIndex - 1] : articles[articles.length - 1];
  const nextArticle =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : articles[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.intro,
    image: [article.img],
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "CalmTouch",
      logo: {
        "@type": "ImageObject",
        url: "https://calmtouch.com/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://calmtouch.com/blog/${article.slug}`,
    },
  };

  return (
    <article className="py-12 bg-brand-bgSoft/30 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-card border border-brand-borderLight mb-10 bg-brand-bgLight">
          <Image
            src={article.img}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

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
        <div className="my-12 p-8 rounded-3xl bg-brand-bgSoft border border-brand-borderLight flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-heading font-bold text-xl text-brand-dark">
              Stay Restored & Comfortable
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted">
              Explore our complete library of practical wellness and body care guides.
            </p>
          </div>
          <Link
            href="/category/all"
            className="px-6 py-3 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark shadow-sm transition-colors whitespace-nowrap"
          >
            Browse All Topics
          </Link>
        </div>

        {/* Social Sharing Bar */}
        <ShareBar title={article.title} />

        {/* Author Bio Card */}
        <div className="my-10 p-6 sm:p-8 rounded-3xl bg-white border border-brand-borderLight flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-primary-light text-primary font-bold text-xl flex items-center justify-center flex-shrink-0">
            {article.author.charAt(0)}
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
              About the Author
            </span>
            <h4 className="font-heading font-bold text-lg text-brand-dark">
              {article.author}
            </h4>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Certified wellness advisor and massage practitioner dedicated to bringing practical,
              evidence-aligned body recovery techniques to daily living.
            </p>
          </div>
        </div>

        {/* Previous / Next Article Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-10 pt-6 border-t border-brand-borderLight">
          {prevArticle && (
            <Link
              href={`/blog/${prevArticle.slug}`}
              className="p-4 rounded-2xl bg-white border border-brand-borderLight hover:border-primary/40 hover:shadow-sm transition-all group flex items-center gap-3"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bgLight">
                <Image
                  src={prevArticle.img}
                  alt={prevArticle.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
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
                <Image
                  src={nextArticle.img}
                  alt={nextArticle.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
