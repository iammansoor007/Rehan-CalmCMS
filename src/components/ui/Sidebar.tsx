import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article, Category } from "@/types/cms";
import { Calendar, Tag } from "lucide-react";

interface SidebarProps {
  recentArticles: Article[];
  categories: Category[];
}

export function Sidebar({ recentArticles, categories }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Popular Topics / Categories Widget */}
      <div className="bg-brand-bgSoft p-6 rounded-2xl border border-brand-borderLight">
        <h4 className="font-heading font-semibold text-base text-brand-dark mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          Explore Topics
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-brand-dark border border-brand-border hover:border-primary hover:text-primary transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Guides Widget */}
      <div className="bg-brand-bgSoft p-6 rounded-2xl border border-brand-borderLight">
        <h4 className="font-heading font-semibold text-base text-brand-dark mb-4">
          Popular Guides
        </h4>
        <div className="space-y-4">
          {recentArticles.slice(0, 4).map((art) => (
            <Link
              key={art.slug}
              href={`/blog/${art.slug}`}
              className="group flex items-center gap-3.5"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bgLight">
                <Image
                  src={art.img}
                  alt={art.title}
                  fill
                  sizes="64px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-primary block truncate">
                  {art.category}
                </span>
                <h5 className="text-xs font-semibold text-brand-dark group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h5>
                <span className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {art.date}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mini Advice Card */}
      <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 text-center">
        <span className="inline-block p-2 rounded-full bg-primary text-white mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </span>
        <h5 className="font-heading font-semibold text-sm text-brand-dark mb-1">
          Evidence-Aligned Reading
        </h5>
        <p className="text-xs text-brand-muted mb-4">
          Every guide is written with physiological principles and safe pressure levels in mind.
        </p>
        <Link
          href="/about"
          className="inline-block text-xs font-semibold text-primary hover:underline"
        >
          Learn Our Methodology →
        </Link>
      </div>
    </aside>
  );
}
