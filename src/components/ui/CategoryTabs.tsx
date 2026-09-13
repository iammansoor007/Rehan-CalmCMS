"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrowseCard } from "@/types/cms";
import { slugify } from "@/lib/slugify";

interface CategoryTabsProps {
  browseCards: Record<string, BrowseCard[]>;
}

export function CategoryTabs({ browseCards }: CategoryTabsProps) {
  const categories = Object.keys(browseCards);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "Massage Therapy");

  const cards = browseCards[activeCategory] || [];

  return (
    <div>
      {/* Category Tab Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start md:justify-center">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-brand-bgLight text-brand-dark hover:bg-brand-border"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Cards with smooth transition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
        {cards.map((card) => {
          const slug = slugify(card.title);
          return (
            <Link
              key={card.title}
              href={`/blog/${slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-brand-borderLight hover:border-primary/40 hover:shadow-card transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/11] overflow-hidden bg-brand-bgLight">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <h4 className="font-heading font-semibold text-sm text-brand-dark group-hover:text-primary transition-colors line-clamp-2">
                  {card.title}
                </h4>
                <span className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                  Read Topic →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
