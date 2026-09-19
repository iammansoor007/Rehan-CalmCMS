import React from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveRedirect } from "@/lib/cms/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getCategories,
  getArticlesByCategory,
  getArticles,
  getSidebarSettings,
  getTemplateSettings,
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
  const [category, ctx] = await Promise.all([getCategoryBySlug(params.slug), getSeoContext()]);
  if (!category) return { title: "Category Not Found", robots: { index: false, follow: false } };

  return buildMetadata(ctx, {
    kind: "category",
    path: `/category/${category.slug}`,
    title: category.name,
    seo: category.seo,
    description: category.description,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    const moved = await resolveRedirect(`/category/${params.slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  // Reached through an alternative spelling of the slug: use the real address.
  if (category.slug !== params.slug) permanentRedirect(`/category/${category.slug}`);
  const seoCtx = await getSeoContext();

  const articles = await getArticlesByCategory(params.slug);
  const allArticles = await getArticles();
  const allCategories = await getCategories();
  const [sidebar, templates] = await Promise.all([getSidebarSettings(), getTemplateSettings()]);
  const archive = templates.archive;
  const parent = category.parent
    ? allCategories.find((c) => c.slug === category.parent)
    : undefined;
  const children = allCategories.filter((c) => c.parent === category.slug);

  return (
    <div className="py-12 bg-brand-bgSoft/30 min-h-screen">
      <JsonLd
        data={[
          webPageJsonLd(seoCtx, {
            path: `/category/${category.slug}`,
            name: category.seo?.title || category.name,
            description: category.seo?.description || category.description,
            type: "CollectionPage",
          }),
          breadcrumbJsonLd(seoCtx, [
            { name: "Home", path: "/" },
            ...(parent
              ? [{ name: parent.seo?.breadcrumbTitle || parent.name, path: `/category/${parent.slug}` }]
              : []),
            { name: category.seo?.breadcrumbTitle || category.name, path: `/category/${category.slug}` },
          ]),
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          {parent && (
            <>
              <Link href={`/category/${parent.slug}`} className="hover:text-primary transition-colors">
                {parent.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </>
          )}
          <span className="text-brand-dark font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <header className="mb-12 p-8 sm:p-12 rounded-3xl bg-white border border-brand-borderLight shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Folder className="w-3.5 h-3.5" />
            <span>{archive.badge}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-base text-brand-muted max-w-2xl leading-relaxed mb-6">
              {category.description}
            </p>
          )}
          {children.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-brand-dark">Sub-categories:</span>
              {children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/category/${child.slug}`}
                  className="px-3 py-1 bg-brand-bgLight rounded-full text-xs font-medium text-brand-dark hover:bg-primary hover:text-white transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
          {archive.showCount && (
            <div className="text-xs font-semibold text-primary">
              Showing {articles.length} {articles.length === 1 ? "Guide" : "Guides"}
            </div>
          )}
        </header>

        {/* Grid and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {articles.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-brand-border text-center space-y-4">
                <h3 className="font-heading font-bold text-xl text-brand-dark">
                  {archive.emptyTitle}
                </h3>
                <p className="text-sm text-brand-muted">{archive.emptyText}</p>
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
            <Sidebar recentArticles={allArticles} categories={allCategories} settings={sidebar} />
          </div>
        </div>
      </div>
    </div>
  );
}
