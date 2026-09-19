import React from "react";
import Link from "next/link";
import { Category, HomepageContent } from "@/types/cms";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { pickCategories } from "@/lib/categoryTree";

interface CategoryBarProps {
  categoriesSection: HomepageContent["categoriesSection"];
  categories: Category[];
}

export function CategoryBar({ categoriesSection, categories }: CategoryBarProps) {
  const displayCategories = pickCategories(categories, categoriesSection.categorySlugs);

  return (
    <section className="py-16 bg-white border-b border-brand-borderLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{categoriesSection.badge}</span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-brand-dark tracking-tight mb-3">
            {categoriesSection.title}
          </h2>
          <p className="text-sm sm:text-base text-brand-muted">
            {categoriesSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group p-6 rounded-2xl bg-brand-bgSoft border border-brand-borderLight hover:border-primary/40 hover:bg-white hover:shadow-card transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </span>
                  <span className="text-brand-muted group-hover:text-primary transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-brand-dark group-hover:text-primary transition-colors mb-2">
                  {cat.name}
                </h3>
                {categoriesSection.showDescriptions && cat.description && (
                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-brand-borderLight/80 text-xs font-semibold text-primary">
                Explore guides →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
