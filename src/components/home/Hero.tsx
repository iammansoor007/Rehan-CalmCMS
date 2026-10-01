import React from "react";
import Link from "next/link";
import { HomepageContent } from "@/types/cms";

interface HeroProps {
  hero: HomepageContent["hero"];
}

/** Full-width photo hero with dark overlay, centered text and two buttons (matches the original design). */
export function Hero({ hero }: HeroProps) {
  const image = hero.image || "/assets/images/hero.png";
  const title = [hero.titleStart, hero.titleHighlight, hero.titleEnd].filter(Boolean).join(" ");
  const hasStats = hero.stats.some((s) => s.value || s.label);

  return (
    <section
      id="hero"
      aria-label={hero.imageAlt || undefined}
      className="relative w-full min-h-[600px] flex items-center justify-center bg-cover bg-no-repeat overflow-hidden py-24 sm:py-[130px] sm:pb-[140px]"
      style={{ backgroundImage: `url('${image}')`, backgroundPosition: "center 35%" }}
    >
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,22,18,0.70) 0%, rgba(30,44,36,0.58) 50%, rgba(12,18,15,0.72) 100%), radial-gradient(circle at center, rgba(12,18,15,0.30) 0%, rgba(8,14,11,0.65) 100%)",
        }}
      />
      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center">
        <div className="max-w-[840px] text-center flex flex-col items-center">
          {hero.badge && (
            <span className="inline-block px-[22px] py-2 mb-6 rounded-full bg-white/[0.16] text-white text-[0.78rem] font-bold uppercase tracking-[0.14em] border border-white/35 backdrop-blur-[10px] shadow-[0_4px_18px_rgba(0,0,0,0.15)]">
              {hero.badge}
            </span>
          )}

          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-[3.5rem] text-white leading-[1.18] tracking-[-0.025em] mb-[22px] [text-shadow:0_3px_16px_rgba(0,0,0,0.35)]">
            {title}
          </h1>

          {hero.subtitle && (
            <p className="text-lg sm:text-[1.22rem] text-white/95 mb-[38px] max-w-[680px] leading-[1.68] [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
              {hero.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-[18px]">
            {hero.ctaText && hero.ctaHref && (
              <Link
                href={hero.ctaHref}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-primary text-white text-[0.95rem] font-semibold shadow-[0_4px_14px_rgba(78,110,88,0.25)] hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(78,110,88,0.35)] transition-all"
              >
                {hero.ctaText}
              </Link>
            )}
            {hero.secondaryCtaText && hero.secondaryCtaHref && (
              <Link
                href={hero.secondaryCtaHref}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white/15 text-white text-[0.95rem] font-semibold border-[1.5px] border-white/45 backdrop-blur-lg hover:bg-white hover:text-brand-dark hover:border-white hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(0,0,0,0.25)] transition-all"
              >
                {hero.secondaryCtaText}
              </Link>
            )}
          </div>

          {hero.popularTags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {hero.popularTags.map((tag) => (
                <Link
                  key={tag}
                  href="/category/all"
                  className="px-3.5 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium border border-white/30 hover:bg-white hover:text-brand-dark transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {hasStats && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-10 text-white">
              {hero.stats.map((s) => (
                <div key={s.label + s.value}>
                  <div className="font-heading font-bold text-3xl">{s.value}</div>
                  <div className="text-xs text-white/80 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {hero.cardTitle && (
            <Link
              href={hero.cardHref || "#"}
              className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/90 text-left hover:bg-white transition-colors"
            >
              <span>
                {hero.cardLabel && (
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">{hero.cardLabel}</span>
                )}
                <span className="text-sm font-semibold text-brand-dark">{hero.cardTitle}</span>
              </span>
              <span className="text-primary">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
