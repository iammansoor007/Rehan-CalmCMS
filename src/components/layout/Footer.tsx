import React from "react";
import Link from "next/link";
import { SiteConfig, FooterContent } from "@/types/cms";

interface FooterProps {
  siteConfig: SiteConfig;
  footerContent: FooterContent;
}

export function Footer({ siteConfig, footerContent }: FooterProps) {
  return (
    <footer className="bg-[#26322D] text-[#ECEAE1] pt-16 pb-12 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
              </div>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                {siteConfig.brandName}
              </span>
            </Link>
            <p className="text-sm text-[#ECEAE1]/70 leading-relaxed max-w-sm">
              {footerContent.brandDescription}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {footerContent.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#ECEAE1]/75 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              {footerContent.categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#ECEAE1]/75 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust / Disclaimer */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider">
              Information
            </h4>
            <ul className="space-y-2 text-sm">
              {footerContent.legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#ECEAE1]/75 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                100% Educational
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#ECEAE1]/60 gap-4">
          <p>{footerContent.copyright}</p>
          <p>
            Designed with care for a more relaxed lifestyle.
          </p>
        </div>
      </div>
    </footer>
  );
}
