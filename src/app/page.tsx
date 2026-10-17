import React from "react";
import type { Metadata } from "next";
import {
  getHomepageData,
  getCategories,
  getArticles,
  articlesInCategories,
} from "@/lib/cms/client";
import { pickCategories } from "@/lib/categoryTree";
import { buildMetadata, getSeoContext } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { CategoryBar, SectionHead } from "@/components/home/CategoryBar";
import { GuidebookSection } from "@/components/home/GuidebookSection";
import { TrustSection } from "@/components/home/TrustSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { CategoryTabs, BrowseTab } from "@/components/ui/CategoryTabs";
import { HomeSectionId } from "@/types/cms";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ALL_SECTIONS: HomeSectionId[] = [
  "hero",
  "categories",
  "latest",
  "browse",
  "guidebook",
  "trust",
  "newsletter",
];

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, ctx] = await Promise.all([getHomepageData(), getSeoContext()]);
  return buildMetadata(ctx, {
    kind: "home",
    path: "/",
    title: "",
    seo,
    description: ctx.site.metaDescription,
    image: undefined,
  });
}

export default async function HomePage() {
  const [homepage, categories, articles] = await Promise.all([
    getHomepageData(),
    getCategories(),
    getArticles(),
  ]);

  // Saved order first; any section the saved order doesn't know about is appended.
  const order = [
    ...homepage.sectionOrder.filter((id) => ALL_SECTIONS.includes(id)),
    ...ALL_SECTIONS.filter((id) => !homepage.sectionOrder.includes(id)),
  ];

  const latestArticles = articlesInCategories(
    articles,
    categories,
    homepage.latestSection.categorySlugs
  ).slice(0, homepage.latestSection.count);

  const browseTabs: BrowseTab[] = pickCategories(categories, homepage.browseSection.categorySlugs)
    .filter((c) => c.depth === 0 || homepage.browseSection.categorySlugs.length > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      posts: articlesInCategories(articles, categories, [c.slug])
        .slice(0, homepage.browseSection.postsPerCategory)
        .map((a) => ({ slug: a.slug, title: a.title, img: a.img, imgAlt: a.imgAlt })),
    }))
    .filter((t) => t.posts.length > 0);

  const { latestSection: latest, browseSection: browse } = homepage;

  const sections: Record<HomeSectionId, React.ReactNode> = {
    hero: homepage.hero.visible ? <Hero hero={homepage.hero} /> : null,

    categories: homepage.categoriesSection.visible ? (
      <CategoryBar categoriesSection={homepage.categoriesSection} categories={categories} />
    ) : null,

    latest: latest.visible ? (
      <section id="latest" className="pt-[90px] pb-[100px] bg-brand-bgSoft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              {latest.badge && (
                <span className="inline-block px-4 py-1.5 mb-2 rounded-full bg-primary-light text-primary text-[0.78rem] font-bold uppercase tracking-[0.12em]">
                  {latest.badge}
                </span>
              )}
              <h2 className="font-heading font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-brand-dark">{latest.title}</h2>
              {latest.subtitle && <p className="text-base text-brand-muted mt-2">{latest.subtitle}</p>}
            </div>
            {latest.linkText && latest.linkHref && (
              <Link
                href={latest.linkHref}
                className="inline-flex items-center gap-1.5 font-heading font-semibold text-[0.95rem] text-primary hover:text-primary-dark hover:translate-x-1 transition-all"
              >
                {latest.linkText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            )}
          </div>

          {latestArticles.length === 0 ? (
            <p className="text-sm text-brand-muted">No articles to show yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestArticles.map((article, idx) => (
                <ArticleCard key={article.slug} article={article} priority={idx === 0} />
              ))}
            </div>
          )}
        </div>
      </section>
    ) : null,

    browse:
      browse.visible && browseTabs.length > 0 ? (
        <section id="browse" className="py-[50px] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead badge={browse.badge} title={browse.title} subtitle={browse.subtitle} />

            <CategoryTabs tabs={browseTabs} />
          </div>
        </section>
      ) : null,

    guidebook: homepage.guidebook.visible ? <GuidebookSection guidebook={homepage.guidebook} /> : null,

    trust: homepage.trustSection.visible ? <TrustSection trustSection={homepage.trustSection} /> : null,

    newsletter: homepage.newsletter.visible ? <NewsletterSection newsletter={homepage.newsletter} /> : null,
  };

  return (
    <div>
      {order.map((id) => (
        <React.Fragment key={id}>{sections[id]}</React.Fragment>
      ))}
    </div>
  );
}
