"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Article } from "@/types/cms";
import { slugify } from "@/lib/slugify";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
}

export function SearchModal({ isOpen, onClose, articles }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase()) ||
          a.intro.toLowerCase().includes(query.toLowerCase())
      )
    : articles.slice(0, 5);

  const handleSelect = (slug: string) => {
    onClose();
    router.push(`/blog/${slug}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-floating overflow-hidden border border-brand-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-borderLight">
          <Search className="w-5 h-5 text-brand-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search articles or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-brand-dark placeholder-brand-muted text-base focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-3">
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            {query.trim() ? `Search Results (${filtered.length})` : "Popular Guides"}
          </p>

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-brand-muted">
              No wellness guides found matching &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => handleSelect(item.slug)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-brand-bgLight/70 transition-colors flex flex-col group"
                >
                  <span className="text-xs font-semibold text-primary mb-0.5">{item.category}</span>
                  <span className="text-sm font-medium text-brand-dark group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
