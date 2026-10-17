"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { SiteConfig, NavigationContent, Article, MenuItem } from "@/types/cms";
import { SearchModal } from "../ui/SearchModal";
import { MobileDrawer } from "./MobileDrawer";

interface HeaderProps {
  siteConfig: SiteConfig;
  navigation: NavigationContent;
  articles: Article[];
}

/** Underline-on-hover nav link, as in the original design. */
const linkCls = (active: boolean) =>
  `relative py-1.5 whitespace-nowrap text-[0.95rem] font-medium transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:rounded-sm after:bg-primary after:transition-all after:duration-300 hover:text-primary hover:after:w-full ${
    active ? "text-primary after:w-full" : "text-brand-dark after:w-0"
  }`;

/** Children and grandchildren of a menu entry as one indented list for the dropdown. */
function dropdownEntries(items: MenuItem[] | undefined, depth = 0): { item: MenuItem; depth: number }[] {
  return (items || []).flatMap((item) => [{ item, depth }, ...dropdownEntries(item.children, depth + 1)]);
}

const isCurrent = (item: MenuItem, pathname: string | null): boolean =>
  !!pathname &&
  ((item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)) ||
    (item.children || []).some((c) => isCurrent(c, pathname)));

function NavEntry({ item, pathname }: { item: MenuItem; pathname: string | null }) {
  const external = item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const entries = dropdownEntries(item.children);

  if (entries.length === 0) {
    return (
      <li>
        <Link href={item.href} {...external} className={linkCls(isCurrent(item, pathname))}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="relative group">
      <Link href={item.href} {...external} className={`inline-flex items-center gap-1 ${linkCls(isCurrent(item, pathname))}`}>
        {item.label}
        <ChevronDown className="w-3 h-3 transition-transform duration-[250ms] group-hover:rotate-180" strokeWidth={2.5} />
      </Link>
      <ul className="absolute top-full -left-3 min-w-[220px] py-2.5 bg-white border border-brand-border rounded-2xl shadow-card opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-[1100]">
        {entries.map(({ item: child, depth }, i) => (
          <li key={`${child.id}-${i}`}>
            <Link
              href={child.href}
              target={child.newTab ? "_blank" : undefined}
              rel={child.newTab ? "noopener noreferrer" : undefined}
              className="block px-5 py-2.5 text-[0.92rem] font-medium text-brand-dark transition-all hover:bg-primary-light hover:text-primary-dark"
              style={depth ? { paddingLeft: 20 + depth * 14 } : undefined}
            >
              {depth ? "– " : ""}
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function Header({ siteConfig, navigation, articles }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [initialQuery, setInitialQuery] = useState("");

  // Sidebar search boxes (blog pages) open this modal with their text pre-filled.
  useEffect(() => {
    const open = (e: Event) => {
      setInitialQuery(String((e as CustomEvent<string>).detail || ""));
      setIsSearchOpen(true);
    };
    window.addEventListener("calmtouch:search", open);
    return () => window.removeEventListener("calmtouch:search", open);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-xl border-b border-brand-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {siteConfig.logoUrl ? (
              <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={siteConfig.logoUrl} alt={siteConfig.brandName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-[38px] h-[38px] rounded-full bg-primary-light text-primary flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading font-bold text-[1.4rem] text-brand-dark leading-[1.1]">{siteConfig.brandName}</span>
              <span className="whitespace-nowrap text-[0.72rem] font-medium text-brand-muted tracking-[0.02em] md:max-lg:hidden">{siteConfig.tagline}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-5 lg:gap-8">
              {navigation.items.map((item, i) => (
                <NavEntry key={`${item.id}-${i}`} item={item} pathname={pathname} />
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {navigation.showSearch && (
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search articles"
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-brand-dark bg-brand-bgSoft border border-brand-borderLight hover:text-primary hover:bg-primary-light transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {navigation.cta.visible && navigation.cta.text && navigation.cta.href && (
              <Link
                href={navigation.cta.href}
                className="hidden md:inline-flex px-6 py-2.5 rounded-full bg-primary text-white text-[0.95rem] font-semibold shadow-[0_4px_14px_rgba(78,110,88,0.25)] hover:bg-primary-dark hover:-translate-y-0.5 transition-all"
              >
                {navigation.cta.text}
              </Link>
            )}

            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open mobile navigation"
              className="md:hidden w-[42px] h-[42px] rounded-lg flex flex-col items-center justify-center gap-[5px]"
            >
              <span className="w-5 h-0.5 bg-brand-dark" />
              <span className="w-5 h-0.5 bg-brand-dark" />
              <span className="w-5 h-0.5 bg-brand-dark" />
            </button>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setInitialQuery("");
        }}
        articles={articles}
        initialQuery={initialQuery}
      />

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        siteConfig={siteConfig}
        navigation={navigation}
      />
    </>
  );
}
