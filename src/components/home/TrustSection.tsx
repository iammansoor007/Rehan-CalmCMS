import React from "react";
import { HomepageContent } from "@/types/cms";
import { DynamicIcon } from "@/lib/icons";
import { SectionHead } from "./CategoryBar";

interface TrustSectionProps {
  trustSection: HomepageContent["trustSection"];
}

export function TrustSection({ trustSection }: TrustSectionProps) {
  return (
    <section id="trust" className="py-[100px] bg-brand-bgLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {trustSection.title && (
          <SectionHead badge={trustSection.badge} title={trustSection.title} subtitle={trustSection.subtitle} />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSection.items.map((item) => (
            <div
              key={`${item.title}-${item.iconName}`}
              className="group flex flex-col items-start rounded-2xl bg-white border border-brand-border px-7 py-9 shadow-soft transition-all hover:-translate-y-[5px] hover:shadow-card hover:border-primary"
            >
              <div className="w-[52px] h-[52px] rounded-xl bg-brand-bgLight text-primary flex items-center justify-center mb-5 transition-colors group-hover:bg-primary-light">
                <DynamicIcon name={item.iconName} fallback="ShieldCheck" className="w-6 h-6" />
              </div>
              <div className="w-6 h-[2.5px] rounded-sm bg-brand-accentBeige mb-3" />
              <h3 className="font-heading font-semibold text-[1.2rem] text-brand-dark leading-[1.3] mb-2">{item.title}</h3>
              <p className="text-[0.95rem] text-brand-muted leading-[1.55]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
