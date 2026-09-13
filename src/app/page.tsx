import React from "react";
import {
  getHomepageData,
  getCategories,
  getArticles,
  getBrowseCards,
} from "@/lib/cms/client";
import { Hero } from "@/components/home/Hero";
import { CategoryBar } from "@/components/home/CategoryBar";
import { GuidebookSection } from "@/components/home/GuidebookSection";
import { TrustSection } from "@/components/home/TrustSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Sidebar } from "@/components/ui/Sidebar";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homepage = await getHomepageData();
  const categories = await getCategories();
  const articles = await getArticles();
  const browseCards = await getBrowseCards();

  const latestArticles = articles.slice(0, 6);

  return (
    <div>
      {/* 1. Hero Section */}
      <Hero hero={homepage.hero} />

      {/* 2. Topic Category Strip */}
      <CategoryBar
        categoriesSection={homepage.categoriesSection}
        categories={categories}
      />

      {/* 3. Latest Articles & Sidebar Grid */}
      <section className="py-20 bg-brand-bgSoft/50 border-b border-brand-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-dark tracking-tight mb-2">
                {homepage.latestSection.title}
              </h2>
              <p className="text-sm sm:text-base text-brand-muted">
                {homepage.latestSection.subtitle}
              </p>
            </div>
            <Link
              href="/category/all"
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Article Stream */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {latestArticles.map((article, idx) => (
                  <ArticleCard key={article.slug} article={article} priority={idx === 0} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <Sidebar recentArticles={articles} categories={categories} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Browse By Category Tabs */}
      <section className="py-20 bg-white border-b border-brand-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{homepage.browseSection.badge}</span>
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-dark tracking-tight mb-3">
              {homepage.browseSection.title}
            </h2>
            <p className="text-sm sm:text-base text-brand-muted">
              {homepage.browseSection.subtitle}
            </p>
          </div>

          <CategoryTabs browseCards={browseCards} />
        </div>
      </section>

      {/* 5. Guidebook Promotion Section */}
      <GuidebookSection guidebook={homepage.guidebook} />

      {/* 6. Trust & Quality Badges */}
      <TrustSection trustSection={homepage.trustSection} />

      {/* 7. Newsletter Section */}
      <NewsletterSection newsletter={homepage.newsletter} />
    </div>
  );
}
