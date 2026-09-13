"use client";

import React, { useState } from "react";
import { HomepageContent } from "@/types/cms";
import { useToast } from "@/components/layout/Toast";
import { Mail, Sparkles } from "lucide-react";

interface NewsletterSectionProps {
  newsletter: HomepageContent["newsletter"];
}

export function NewsletterSection({ newsletter }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

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
        showToast("Thank you for subscribing to CalmTouch!");
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
    <section className="py-20 bg-brand-bgLight/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-white border border-brand-border shadow-card">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{newsletter.badge}</span>
          </div>

          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-brand-dark tracking-tight mb-3">
            {newsletter.title}
          </h2>

          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto mb-8">
            {newsletter.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-5 h-5 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-full border border-brand-border bg-brand-bgSoft text-sm text-brand-dark focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              {newsletter.buttonText}
            </button>
          </form>

          <p className="text-xs text-brand-muted mt-4">
            {newsletter.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
