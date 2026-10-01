"use client";

import React, { useState } from "react";
import { HomepageContent } from "@/types/cms";
import { useToast } from "@/components/layout/Toast";
import { Mail } from "lucide-react";

interface NewsletterSectionProps {
  newsletter: HomepageContent["newsletter"];
}

export function NewsletterSection({ newsletter }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        showToast("Subscription successful! Thank you.");
        setEmail("");
      } else {
        showToast("Subscription error. Please try again.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="pt-20 pb-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center rounded-3xl bg-[#E8F0EA] border border-[#D6E3D9] px-6 py-12 sm:px-12 sm:py-[60px]">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 shadow-soft">
              <Mail className="w-[26px] h-[26px]" />
            </div>
            <div>
              {newsletter.badge && (
                <span className="inline-block px-3 py-1 mb-2 rounded-full bg-white/70 text-primary text-[0.72rem] font-bold uppercase tracking-[0.12em]">
                  {newsletter.badge}
                </span>
              )}
              <h2 className="font-heading font-bold text-2xl sm:text-[1.75rem] text-brand-dark leading-[1.25] mb-2">{newsletter.title}</h2>
              {newsletter.subtitle && <p className="text-[0.98rem] text-brand-muted">{newsletter.subtitle}</p>}
            </div>
          </div>

          <div>
            <form
              onSubmit={handleSubmit}
              className="flex gap-3 bg-white pl-5 p-1.5 rounded-full border border-brand-border shadow-soft"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="flex-1 min-w-0 bg-transparent text-[0.95rem] text-brand-dark placeholder:text-[#94A39A] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3.5 rounded-full bg-primary text-white text-[0.95rem] font-semibold hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(78,110,88,0.3)] transition-all disabled:opacity-70"
              >
                {loading ? "…" : newsletter.buttonText}
              </button>
            </form>
            {newsletter.disclaimer && <p className="text-xs text-brand-muted mt-3 pl-5">{newsletter.disclaimer}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
