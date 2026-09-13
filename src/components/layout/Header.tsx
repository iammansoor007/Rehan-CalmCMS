"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, ChevronDown } from "lucide-react";
import { SiteConfig, NavigationContent, Article } from "@/types/cms";
import { SearchModal } from "../ui/SearchModal";
import { MobileDrawer } from "./MobileDrawer";

interface HeaderProps {
  siteConfig: SiteConfig;
  navigation: NavigationContent;
  articles: Article[];
}

export function Header({ siteConfig, navigation, articles }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-borderLight transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {siteConfig.logoUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-brand-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={siteConfig.logoUrl}
                  alt={siteConfig.brandName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
              </div>
            )}
            <div>
              <span className="font-heading font-bold text-xl tracking-tight text-brand-dark block leading-none">
                {siteConfig.brandName}
              </span>
              <span className="text-[11px] font-medium text-brand-muted tracking-wide block mt-1">
                {siteConfig.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === "/" ? "text-primary font-semibold" : "text-brand-dark hover:text-primary"
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1.5 text-sm font-medium text-brand-dark group-hover:text-primary transition-colors focus:outline-none">
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 text-brand-muted" />
              </button>

              <div className="absolute top-full left-0 w-60 bg-white border border-brand-border rounded-2xl shadow-floating py-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                {navigation.categoryDropdown.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-bgLight/80 hover:text-primary transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {navigation.mainNav
              .filter((item) => item.label !== "Home")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href ? "text-primary font-semibold" : "text-brand-dark hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          {/* Actions: Search & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search articles"
              className="p-2.5 rounded-full text-brand-dark hover:text-primary hover:bg-brand-bgLight transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open mobile navigation"
              className="md:hidden p-2.5 rounded-lg text-brand-dark hover:bg-brand-bgLight transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        siteConfig={siteConfig}
        navigation={navigation}
      />
    </>
  );
}
