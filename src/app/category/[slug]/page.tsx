import React from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { resolveRedirect } from "@/lib/cms/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import {
  getCategoryBySlug,
  getCategories,
  getArticlesByCategory,
  getTemplateSettings,
} from "@/lib/cms/client";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
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

/** Full-width category archive (no sidebar), matching the site's original design. */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    const moved = await resolveRedirect(`/category/${params.slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  // Reached through an alternative spelling of the slug: use the real address.
  if (category.slug !== params.slug) permanentRedirect(`/category/${category.slug}`);

  const [seoCtx, articles, allCategories, templates] = await Promise.all([
    getSeoContext(),
    getArticlesByCategory(params.slug),
    getCategories(),
    getTemplateSettings(),
  ]);
  const archive = templates.archive;
  const parent = category.parent ? allCategories.find((c) => c.slug === category.parent) : undefined;
  const children = allCategories.filter((c) => c.parent === category.slug);

  return (
    <div className="bg-white pt-10 pb-24 min-h-[80vh]">
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
            ...(parent ? [{ name: parent.seo?.breadcrumbTitle || parent.name, path: `/category/${parent.slug}` }] : []),
            { name: category.seo?.breadcrumbTitle || category.name, path: `/category/${category.slug}` },
          ]),
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            parent ? { label: parent.name, href: `/category/${parent.slug}` } : { label: "Category" },
            { label: category.name },
          ]}
        />

        {/* Archive header */}
        <header className="rounded-2xl bg-brand-bgSoft border border-brand-border px-6 py-6 sm:px-10 sm:py-9 mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-light text-primary text-[0.78rem] font-bold uppercase tracking-[0.12em] mb-3.5">
            {archive.badge}
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[2.6rem] text-brand-dark tracking-[-0.02em] leading-[1.2] mt-2.5 mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-[1.08rem] text-brand-muted leading-relaxed max-w-[680px] mb-4">{category.description}</p>
          )}
          {children.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-brand-dark">Sub-categories:</span>
              {children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/category/${child.slug}`}
                  className="px-3 py-1 bg-white border border-brand-border rounded-full text-xs font-medium text-brand-dark hover:bg-primary hover:border-primary hover:text-white transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
          {archive.showCount && (
            <div className="text-[0.88rem] font-bold uppercase tracking-[0.08em] text-primary">
              Showing {articles.length} {articles.length === 1 ? "Article" : "Articles"}
            </div>
          )}
        </header>

        {/* Full-width grid */}
        {articles.length === 0 ? (
          <div className="mt-9 p-12 rounded-2xl bg-brand-bgSoft border border-brand-border text-center space-y-4">
            <h3 className="font-heading font-bold text-xl text-brand-dark">{archive.emptyTitle}</h3>
            <p className="text-sm text-brand-muted">{archive.emptyText}</p>
            <Link
              href="/category/all"
              className="inline-block px-7 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              View All Articles
            </Link>
          </div>
        ) : (
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {articles.map((article, i) => (
              <ArticleCard key={article.slug} article={article} priority={i < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
