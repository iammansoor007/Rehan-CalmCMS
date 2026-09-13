"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { SiteConfig, NavigationContent } from "@/types/cms";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  navigation: NavigationContent;
}

export function MobileDrawer({ isOpen, onClose, siteConfig, navigation }: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <aside className="relative ml-auto w-full max-w-xs bg-white h-full shadow-floating flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-brand-borderLight flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
              </svg>
            </div>
            <span className="font-heading font-bold text-lg text-brand-dark">
              {siteConfig.brandName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="p-5 space-y-6 flex-1">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-2">
              Menu
            </span>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-dark hover:bg-brand-bgLight hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              {navigation.mainNav
                .filter((item) => item.label !== "Home")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-dark hover:bg-brand-bgLight hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-2">
              Categories
            </span>
            <ul className="space-y-1">
              {navigation.categoryDropdown.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={cat.href}
                    onClick={onClose}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-dark/80 hover:bg-brand-bgLight hover:text-primary transition-colors"
                  >
                    • {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="p-5 border-t border-brand-borderLight text-xs text-brand-muted">
          <p>{siteConfig.brandName} — {siteConfig.tagline}</p>
        </div>
      </aside>
    </div>
  );
}
