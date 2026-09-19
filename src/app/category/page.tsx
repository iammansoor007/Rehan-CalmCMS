import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getArticles, getSidebarSettings, getTemplateSettings } from "@/lib/cms/client";
import { buildMetadata, getSeoContext } from "@/lib/seo";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Sidebar } from "@/components/ui/Sidebar";
import { Folder, ChevronRight } from "lucide-react";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [templates, ctx] = await Promise.all([getTemplateSettings(), getSeoContext()]);
  return buildMetadata(ctx, {
    kind: "other",
    path: "/category",
    title: "All Categories & Wellness Guides",
    description: templates.directory.subtitle,
  });
}

export default async function CategoriesIndexPage() {
  const [categories, allArticles, sidebar, templates] = await Promise.all([
    getCategories(),
    getArticles(),
    getSidebarSettings(),
    getTemplateSettings(),
  ]);
  const directory = templates.directory;

  const realCategories = categories.filter((c) => c.slug !== "all");

  return (
    <div className="py-12 bg-brand-bgSoft/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-dark font-medium">Categories</span>
        </nav>

        {/* Page Header */}
        <header className="mb-12 p-8 sm:p-12 rounded-3xl bg-white border border-brand-borderLight shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Folder className="w-3.5 h-3.5" />
            <span>{directory.badge}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight mb-4">
            {directory.title}
          </h1>
          {directory.subtitle && (
            <p className="text-base text-brand-muted max-w-2xl leading-relaxed mb-6">
              {directory.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {realCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`#${cat.slug}`}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-brand-bgLight text-brand-dark hover:bg-primary hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </header>

        {/* Categories Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-16">
            {realCategories.map((cat) => {
              const catArticles = allArticles.filter((a) => {
                const aSlug = slugify(a.category);
                const cSlug = slugify(cat.slug);
                return (
                  aSlug === cSlug ||
                  a.category.toLowerCase() === cat.name.toLowerCase() ||
                  aSlug.includes(cSlug) ||
                  cSlug.includes(aSlug)
                );
              });

              return (
                <section key={cat.slug} id={cat.slug} className="scroll-mt-24">
                  <div className="flex items-center justify-between border-b border-brand-borderLight pb-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-bold text-2xl text-brand-dark">
                          {cat.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                          {catArticles.length} {catArticles.length === 1 ? "Guide" : "Guides"}
                        </span>
                      </div>
                      <p className="text-sm text-brand-muted mt-1 max-w-xl">
                        {cat.description}
                      </p>
                    </div>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      <span>View category page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {catArticles.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-brand-border text-center text-sm text-brand-muted">
                      No guides published in this category yet. Check back soon!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {catArticles.map((article) => (
                        <ArticleCard key={article.slug} article={article} />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 sm:hidden">
                    <Link
                      href={`/category/${cat.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      <span>View all {cat.name} articles</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="lg:col-span-4">
            <Sidebar recentArticles={allArticles} categories={categories} settings={sidebar} />
          </div>
        </div>
      </div>
    </div>
  );
}
