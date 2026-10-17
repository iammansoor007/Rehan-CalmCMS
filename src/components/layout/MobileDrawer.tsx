"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SiteConfig, NavigationContent, MenuItem } from "@/types/cms";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  navigation: NavigationContent;
}

function DrawerLink({ item, onClose, className }: { item: MenuItem; onClose: () => void; className: string }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      target={item.newTab ? "_blank" : undefined}
      rel={item.newTab ? "noopener noreferrer" : undefined}
      className={className}
    >
      {item.label}
    </Link>
  );
}

function DrawerChildren({ items, onClose, depth = 0 }: { items: MenuItem[]; onClose: () => void; depth?: number }) {
  return (
    <ul className="flex flex-col gap-3 pt-3" style={depth ? { paddingLeft: 14 } : undefined}>
      {items.map((child, i) => (
        <li key={`${child.id}-${i}`}>
          <span className="pl-3.5">
            <span className="text-primary">{depth ? "– " : "• "}</span>
            <DrawerLink
              item={child}
              onClose={onClose}
              className="text-[0.95rem] font-medium text-brand-dark hover:text-primary transition-colors"
            />
          </span>
          {child.children && child.children.length > 0 && (
            <DrawerChildren items={child.children} onClose={onClose} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
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
          {navigation.items.map((item, i) => (
            <li key={`${item.id}-${i}`}>
              <DrawerLink item={item} onClose={onClose} className={linkCls} />
              {item.children && item.children.length > 0 && <DrawerChildren items={item.children} onClose={onClose} />}
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
