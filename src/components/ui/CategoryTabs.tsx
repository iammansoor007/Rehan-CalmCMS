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

/** Underlined tabs + a row of image cards, like the original "Browse by category" block. */
export function CategoryTabs({ tabs }: { tabs: BrowseTab[] }) {
  const [activeSlug, setActiveSlug] = useState<string>(tabs[0]?.slug || "");
  const active = tabs.find((t) => t.slug === activeSlug) || tabs[0];
  if (!active) return null;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 mb-11">
        {tabs.map((tab) => {
          const isActive = active.slug === tab.slug;
          return (
            <button
              key={tab.slug}
              onClick={() => setActiveSlug(tab.slug)}
              className={`px-6 py-2.5 text-[0.95rem] border-b-[2.5px] transition-all ${
                isActive
                  ? "text-primary font-semibold border-primary"
                  : "text-brand-muted font-medium border-transparent hover:text-primary"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      <div key={active.slug} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
        {active.posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl overflow-hidden bg-brand-bgSoft border border-brand-border transition-all hover:-translate-y-1 hover:shadow-card hover:bg-white"
          >
            <div className="relative h-[180px] overflow-hidden">
              {post.img ? (
                <Image
                  src={post.img}
                  alt={post.imgAlt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-[400ms] group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-brand-bgLight to-brand-accentBeigeLight text-primary/40">
                  <Sparkles className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h4 className="font-heading font-semibold text-[1.05rem] text-brand-dark leading-[1.35]">{post.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
