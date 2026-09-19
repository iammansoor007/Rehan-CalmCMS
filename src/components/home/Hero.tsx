import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HomepageContent } from "@/types/cms";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroProps {
  hero: HomepageContent["hero"];
}

export function Hero({ hero }: HeroProps) {
  return (
    <section className="relative bg-brand-bgLight/70 pt-16 pb-20 overflow-hidden border-b border-brand-borderLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hero.badge}</span>
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-brand-dark tracking-tight leading-[1.15]">
              {hero.titleStart}{" "}
              <span className="text-primary italic font-serif font-normal">
                {hero.titleHighlight}
              </span>{" "}
              {hero.titleEnd}
            </h1>

            <p className="text-base sm:text-lg text-brand-muted max-w-xl leading-relaxed">
              {hero.subtitle}
            </p>

            {hero.ctaText && hero.ctaHref && (
              <div>
                <Link
                  href={hero.ctaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-dark transition-colors"
                >
                  <span>{hero.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Popular quick tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-brand-dark">Popular Topics:</span>
              {hero.popularTags.map((tag) => (
                <Link
                  key={tag}
                  href="/category/all"
                  className="px-3 py-1 bg-white rounded-full text-xs font-medium text-brand-muted hover:text-primary hover:border-primary border border-brand-border transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Stats strip */}
            <div className="pt-6 border-t border-brand-borderLight flex items-center gap-8 sm:gap-12">
              {hero.stats.map((st) => (
                <div key={st.label}>
                  <div className="font-heading font-bold text-2xl sm:text-3xl text-primary">
                    {st.value}
                  </div>
                  <div className="text-xs text-brand-muted font-medium mt-0.5">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-floating border-4 border-white bg-white">
              <Image
                src={hero.image || "/assets/images/hero.png"}
                alt={hero.imageAlt || "Massage & Wellness Experience"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {hero.cardTitle && (
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-between">
                  <div>
                    {hero.cardLabel && (
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                        {hero.cardLabel}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-brand-dark">
                      {hero.cardTitle}
                    </span>
                  </div>
                  {hero.cardHref && (
                    <Link
                      href={hero.cardHref}
                      aria-label={hero.cardTitle}
                      className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
