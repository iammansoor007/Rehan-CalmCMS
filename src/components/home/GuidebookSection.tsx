import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HomepageContent } from "@/types/cms";
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";

interface GuidebookSectionProps {
  guidebook: HomepageContent["guidebook"];
}

export function GuidebookSection({ guidebook }: GuidebookSectionProps) {
  return (
    <section id="guide" className="py-20 bg-brand-bgLight/60 border-b border-brand-borderLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-brand-borderLight shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{guidebook.badge}</span>
            </div>

            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-brand-dark tracking-tight leading-snug">
              {guidebook.title}
            </h2>

            <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
              {guidebook.subtitle}
            </p>

            {/* Checklist */}
            <ul className="space-y-3 pt-2">
              {guidebook.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-brand-dark font-medium">{perk}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link
                href={guidebook.ctaHref}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm hover:shadow transition-all duration-200"
              >
                <span>{guidebook.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column Image */}
          <div className="lg:col-span-5 relative h-72 lg:h-full min-h-[340px] bg-brand-bgLight">
            <Image
              src={guidebook.img}
              alt={guidebook.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
