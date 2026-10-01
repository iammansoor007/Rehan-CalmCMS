"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SiteConfig, NavigationContent } from "@/types/cms";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  navigation: NavigationContent;
}

export function MobileDrawer({ isOpen, onClose, siteConfig, navigation }: MobileDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const linkCls = "font-heading text-[1.15rem] font-medium text-brand-dark hover:text-primary transition-colors";

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-brand-dark/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-[1001] w-[300px] max-w-[85vw] h-screen overflow-y-auto bg-white shadow-floating px-6 py-8 flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-primary-light text-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-[1.2rem] text-brand-dark">{siteConfig.brandName}</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-2xl text-brand-muted hover:text-brand-dark">
            &times;
          </button>
        </div>

        <ul className="flex flex-col gap-5">
          <li>
            <Link href="/" onClick={onClose} className={linkCls}>
              {navigation.homeLabel}
            </Link>
          </li>

          {navigation.categoriesMenu.visible && (
            <li>
              <span className="block px-0 pt-1 pb-1 text-xs font-bold uppercase tracking-[0.1em] text-primary">
                {navigation.categoriesMenu.label}
              </span>
              <ul className="flex flex-col gap-3 pt-2">
                {navigation.categoriesMenu.items.map((cat) => (
                  <li key={cat.slug} style={cat.depth ? { paddingLeft: cat.depth * 14 } : undefined}>
                    <Link href={cat.href} onClick={onClose} className="pl-3.5 text-[0.95rem] font-medium text-brand-dark hover:text-primary transition-colors">
                      {cat.depth ? "– " : "• "}
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}

          {navigation.links.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                onClick={onClose}
                target={item.newTab ? "_blank" : undefined}
                className={linkCls}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {navigation.cta.visible && navigation.cta.text && navigation.cta.href && (
            <li className="pt-2">
              <Link
                href={navigation.cta.href}
                onClick={onClose}
                className="block text-center px-4 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                {navigation.cta.text}
              </Link>
            </li>
          )}
        </ul>
      </aside>
    </>
  );
}
