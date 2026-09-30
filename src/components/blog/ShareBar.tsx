"use client";

import React from "react";
import { useToast } from "@/components/layout/Toast";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

/** "Share this article" strip with round social buttons. */
export function ShareBar({ title }: { title: string }) {
  const { showToast } = useToast();

  const share = (platform: string) => {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const targets: Record<string, string> = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      Twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      Email: `mailto:?subject=${text}&body=${url}`,
    };
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    showToast(`Link copied — opening ${platform}…`);
    window.open(targets[platform], "_blank", "noopener,noreferrer");
  };

  const btn =
    "w-9 h-9 rounded-full bg-brand-bgSoft border border-brand-border text-brand-muted flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-0.5 transition-all";

  return (
    <div className="flex items-center justify-between gap-4 py-4 my-9 border-y border-brand-borderLight">
      <span className="font-semibold text-[0.95rem] text-brand-dark">Share this article</span>
      <div className="flex gap-2.5">
        <button onClick={() => share("Facebook")} title="Share on Facebook" className={btn}><Facebook className="w-[15px] h-[15px]" /></button>
        <button onClick={() => share("Twitter")} title="Share on Twitter" className={btn}><Twitter className="w-[15px] h-[15px]" /></button>
        <button onClick={() => share("LinkedIn")} title="Share on LinkedIn" className={btn}><Linkedin className="w-[15px] h-[15px]" /></button>
        <button onClick={() => share("Email")} title="Share via Email" className={btn}><Mail className="w-[15px] h-[15px]" /></button>
      </div>
    </div>
  );
}
