import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HomepageContent } from "@/types/cms";
import { CheckCircle } from "lucide-react";

interface GuidebookSectionProps {
  guidebook: HomepageContent["guidebook"];
}

/** Green featured-guide banner with a tilted book cover (matches the original). */
export function GuidebookSection({ guidebook }: GuidebookSectionProps) {
  return (
    <section id="guide" className="py-[30px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center rounded-3xl bg-primary text-white px-8 py-12 sm:px-[60px] sm:py-16 shadow-card">
          <div className="relative z-[2] flex flex-col items-start">
            {guidebook.badge && (
              <span className="inline-block px-3.5 py-1.5 mb-4 rounded-full bg-white/[0.18] text-white text-[0.75rem] font-bold uppercase tracking-[0.1em]">
                {guidebook.badge}
              </span>
            )}
            <h2 className="font-heading font-bold text-3xl sm:text-[2.3rem] text-white leading-[1.2] mb-4">{guidebook.title}</h2>
            {guidebook.subtitle && (
              <p className="text-[1.05rem] text-white/[0.88] leading-[1.6] mb-8">{guidebook.subtitle}</p>
            )}
            {guidebook.perks.length > 0 && (
              <ul className="space-y-3 mb-8">
                {guidebook.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-accentBeige" />
                    <span className="text-sm text-white/95 font-medium">{perk}</span>
                  </li>
                ))}
              </ul>
            )}
            {guidebook.ctaText && guidebook.ctaHref && (
              <Link
                href={guidebook.ctaHref}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-brand-accentBeige text-brand-dark text-[0.95rem] font-semibold hover:bg-[#be9e83] hover:-translate-y-0.5 transition-all"
              >
                {guidebook.ctaText}
              </Link>
            )}
          </div>

          <div className="relative z-[2] flex items-center justify-center">
            {guidebook.img && (
              <div className="group relative w-full max-w-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guidebook.img}
                  alt={guidebook.title}
                  className="w-full rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.25)] rotate-2 transition-transform duration-[400ms] group-hover:rotate-0 group-hover:scale-[1.02]"
                />
              </div>
            )}
          </div>

          <div className="absolute z-[1] w-[350px] h-[350px] rounded-full bg-white/5 -right-[100px] -bottom-[100px]" />
        </div>
      </div>
    </section>
  );
}
