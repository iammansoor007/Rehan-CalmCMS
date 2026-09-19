import React from "react";
import { HomepageContent } from "@/types/cms";
import { DynamicIcon } from "@/lib/icons";

interface TrustSectionProps {
  trustSection: HomepageContent["trustSection"];
}

export function TrustSection({ trustSection }: TrustSectionProps) {
  return (
    <section className="py-16 bg-white border-b border-brand-borderLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustSection.items.map((item) => (
            <div
              key={`${item.title}-${item.iconName}`}
              className="p-6 rounded-2xl bg-brand-bgSoft/60 border border-brand-borderLight flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <DynamicIcon name={item.iconName} fallback="ShieldCheck" className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-base text-brand-dark mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
