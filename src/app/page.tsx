import React from "react";
import type { Metadata } from "next";
import {
  getHomepageData,
  getCategories,
  getArticles,
  getSidebarSettings,
  articlesInCategories,
} from "@/lib/cms/client";
import { pickCategories } from "@/lib/categoryTree";
import { buildMetadata, getSeoContext } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { CategoryBar } from "@/components/home/CategoryBar";
import { GuidebookSection } from "@/components/home/GuidebookSection";
import { TrustSection } from "@/components/home/TrustSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Sidebar } from "@/components/ui/Sidebar";
import { CategoryTabs, BrowseTab } from "@/components/ui/CategoryTabs";
import { HomeSectionId } from "@/types/cms";
import { Sparkles } from "lucide-react";
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
  const [homepage, categories, articles, sidebar] = await Promise.all([
    getHomepageData(),
    getCategories(),
    getArticles(),
    getSidebarSettings(),
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
      <section className="py-20 bg-brand-bgSoft/50 border-b border-brand-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-dark tracking-tight mb-2">
                {latest.title}
              </h2>
              <p className="text-sm sm:text-base text-brand-muted">{latest.subtitle}</p>
            </div>
            {latest.linkText && latest.linkHref && (
              <Link
                href={latest.linkHref}
                className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                {latest.linkText}
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className={latest.showSidebar ? "lg:col-span-8" : "lg:col-span-12"}>
              {latestArticles.length === 0 ? (
                <p className="text-sm text-brand-muted">No articles to show yet.</p>
              ) : (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 ${
                    latest.showSidebar ? "" : "lg:grid-cols-3"
                  } gap-6`}
                >
                  {latestArticles.map((article, idx) => (
                    <ArticleCard key={article.slug} article={article} priority={idx === 0} />
                  ))}
                </div>
              )}
            </div>

            {latest.showSidebar && (
              <div className="lg:col-span-4">
                <Sidebar recentArticles={articles} categories={categories} settings={sidebar} />
              </div>
            )}
          </div>
        </div>
      </section>
    ) : null,

    browse:
      browse.visible && browseTabs.length > 0 ? (
        <section className="py-20 bg-white border-b border-brand-borderLight">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{browse.badge}</span>
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-dark tracking-tight mb-3">
                {browse.title}
              </h2>
              <p className="text-sm sm:text-base text-brand-muted">{browse.subtitle}</p>
            </div>

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
