import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getCategories,
  getArticlesByCategory,
  getArticles,
} from "@/lib/cms/client";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Sidebar } from "@/components/ui/Sidebar";
import { ChevronRight, Folder } from "lucide-react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Guides`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(params.slug);
  const allArticles = await getArticles();
  const allCategories = await getCategories();

  return (
    <div className="py-12 bg-brand-bgSoft/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-dark font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <header className="mb-12 p-8 sm:p-12 rounded-3xl bg-white border border-brand-borderLight shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Folder className="w-3.5 h-3.5" />
            <span>Category Archive</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight mb-4">
            {category.name}
          </h1>
          <p className="text-base text-brand-muted max-w-2xl leading-relaxed mb-6">
            {category.description}
          </p>
          <div className="text-xs font-semibold text-primary">
            Showing {articles.length} {articles.length === 1 ? "Guide" : "Guides"}
          </div>
        </header>

        {/* Grid and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {articles.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-brand-border text-center space-y-4">
                <h3 className="font-heading font-bold text-xl text-brand-dark">
                  No articles found in this category
                </h3>
                <p className="text-sm text-brand-muted">
                  Explore our other wellness categories or browse all articles.
                </p>
                <Link
                  href="/category/all"
                  className="inline-block px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  View All Guides
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <Sidebar recentArticles={allArticles} categories={allCategories} />
          </div>
        </div>
      </div>
    </div>
  );
}
