"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export interface BrowseTab {
  slug: string;
  name: string;
  posts: { slug: string; title: string; img: string; imgAlt?: string }[];
}

interface CategoryTabsProps {
  tabs: BrowseTab[];
}

export function CategoryTabs({ tabs }: CategoryTabsProps) {
  const [activeSlug, setActiveSlug] = useState<string>(tabs[0]?.slug || "");
  const active = tabs.find((t) => t.slug === activeSlug) || tabs[0];

  if (!active) return null;

  return (
    <div>
      {/* Category Tab Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start md:justify-center">
        {tabs.map((tab) => {
          const isActive = active.slug === tab.slug;
          return (
            <button
              key={tab.slug}
              onClick={() => setActiveSlug(tab.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-brand-bgLight text-brand-dark hover:bg-brand-border"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Grid of Cards with smooth transition */}
      <div key={active.slug} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
        {active.posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl overflow-hidden border border-brand-borderLight hover:border-primary/40 hover:shadow-card transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-brand-bgLight">
              {post.img ? (
                <Image
                  src={post.img}
                  alt={post.imgAlt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-brand-bgLight to-brand-accentBeigeLight text-primary/40">
                  <Sparkles className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1 justify-between">
              <h4 className="font-heading font-semibold text-sm text-brand-dark group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <span className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                Read Topic →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
