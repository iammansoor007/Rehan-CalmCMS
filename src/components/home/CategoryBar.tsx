import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article, Category, HomepageContent } from "@/types/cms";
import { pickCategories } from "@/lib/categoryTree";
import { slugify } from "@/lib/slugify";
import { Sparkles } from "lucide-react";

interface CategoryBarProps {
  categoriesSection: HomepageContent["categoriesSection"];
  categories: Category[];
  /** Used to borrow a picture for each category card (its newest post with an image). */
  articles: Article[];
}

export function SectionHead({ badge, title, subtitle }: { badge?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-3.5 rounded-full bg-primary-light text-primary text-[0.78rem] font-bold uppercase tracking-[0.12em]">
          {badge}
        </span>
      )}
      <h2 className="font-heading font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-brand-dark mb-3">{title}</h2>
      {subtitle && <p className="text-[1.05rem] text-brand-muted max-w-[580px] mx-auto mb-12">{subtitle}</p>}
    </div>
  );
}

export function CategoryBar({ categoriesSection, categories, articles }: CategoryBarProps) {
  const display = pickCategories(categories, categoriesSection.categorySlugs);
  const imageFor = (cat: Category) =>
    articles.find((a) => a.img && (slugify(a.category) === cat.slug || a.category === cat.name))?.img || "";

  return (
    <section id="categories" className="py-[100px] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          badge={categoriesSection.badge}
          title={categoriesSection.title}
          subtitle={categoriesSection.subtitle}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {display.map((cat) => {
            const img = imageFor(cat);
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center h-full text-center bg-white border border-brand-border rounded-2xl px-4 pt-4 pb-[22px] transition-all hover:-translate-y-1.5 hover:shadow-card hover:border-brand-accentBeige"
              >
                <div className="relative w-full h-[110px] rounded-xl overflow-hidden mb-3.5 bg-brand-bgSoft">
                  {img ? (
                    <Image
                      src={img}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 16vw"
                      className="object-cover transition-transform group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-brand-bgLight to-brand-accentBeigeLight text-primary/40">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-base text-brand-dark leading-tight mb-1">{cat.name}</h3>
                {categoriesSection.showDescriptions && cat.description && (
                  <p className="text-[0.82rem] text-brand-muted leading-[1.4] line-clamp-2">{cat.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
