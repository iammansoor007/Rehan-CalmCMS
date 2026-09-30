"use client";

import React, { useState } from "react";
import { Mail, Search } from "lucide-react";
import { useToast } from "@/components/layout/Toast";

/** Search box that opens the site's search modal with the typed text. */
export function SidebarSearch({ placeholder }: { placeholder: string }) {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("calmtouch:search", { detail: q }));
      }}
      className="flex rounded-full border border-brand-border bg-white overflow-hidden"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        className="flex-1 min-w-0 px-4 py-2.5 text-sm text-brand-dark bg-transparent focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="px-4 bg-primary text-white hover:bg-primary-dark transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}

/** Green newsletter widget; subscribers show up under Leads in the admin. */
export function SidebarNewsletter({
  title,
  text,
  buttonText,
}: {
  title: string;
  text: string;
  buttonText: string;
}) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      showToast("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      showToast(res.ok ? "Subscribed! Thank you." : "Subscription error. Please try again.");
      if (res.ok) setEmail("");
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl bg-primary text-white p-6">
      <div className="w-[42px] h-[42px] rounded-full bg-white/15 flex items-center justify-center mb-3.5">
        <Mail className="w-5 h-5" />
      </div>
      <h4 className="font-heading font-bold text-[1.15rem] mb-1.5">{title}</h4>
      <p className="text-[0.86rem] text-white/90 mb-4 leading-relaxed">{text}</p>
      <form onSubmit={submit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-3.5 py-2.5 rounded-lg border border-white/30 bg-white/15 text-white text-sm placeholder:text-white/70 focus:outline-none focus:border-white"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full mt-2.5 py-3 rounded-full bg-white text-primary font-semibold text-sm hover:bg-brand-bgLight transition-colors disabled:opacity-70"
        >
          {busy ? "Subscribing…" : buttonText}
        </button>
      </form>
    </div>
  );
}
