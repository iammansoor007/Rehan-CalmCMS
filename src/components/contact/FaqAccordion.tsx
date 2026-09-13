"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={faq.question}
            className="rounded-2xl bg-white border border-brand-borderLight overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
            >
              <span className="font-heading font-semibold text-sm sm:text-base text-brand-dark">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-brand-muted transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-muted leading-relaxed border-t border-brand-borderLight/60">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
