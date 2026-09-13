"use client";

import React from "react";
import { useToast } from "@/components/layout/Toast";
import { Share2, Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export function ShareBar({ title }: { title: string }) {
  const { showToast } = useToast();

  const handleShare = (platform: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast(`Link copied to clipboard for ${platform}!`);
    }
  };

  return (
    <div className="py-6 border-y border-brand-borderLight flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
        <Share2 className="w-4 h-4 text-primary" />
        <span>Share this guide:</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare("Facebook")}
          title="Share on Facebook"
          className="p-2.5 rounded-full bg-brand-bgSoft hover:bg-primary hover:text-white text-brand-muted transition-colors"
        >
          <Facebook className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare("Twitter / X")}
          title="Share on Twitter"
          className="p-2.5 rounded-full bg-brand-bgSoft hover:bg-primary hover:text-white text-brand-muted transition-colors"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare("LinkedIn")}
          title="Share on LinkedIn"
          className="p-2.5 rounded-full bg-brand-bgSoft hover:bg-primary hover:text-white text-brand-muted transition-colors"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare("Email")}
          title="Share via Email"
          className="p-2.5 rounded-full bg-brand-bgSoft hover:bg-primary hover:text-white text-brand-muted transition-colors"
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
