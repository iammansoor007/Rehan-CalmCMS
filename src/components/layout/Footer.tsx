import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { SiteConfig, FooterContent, NavItem } from "@/types/cms";

interface FooterProps {
  siteConfig: SiteConfig;
  footerContent: FooterContent;
}

function LinkColumn({ title, links, className }: { title: string; links: NavItem[]; className: string }) {
  return (
    <div className={`${className} space-y-3`}>
      {title && (
        <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider">
          {title}
        </h4>
      )}
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              className="text-[#ECEAE1]/75 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ siteConfig, footerContent }: FooterProps) {
  if (!footerContent.visible) return null;

  const social = siteConfig.socialLinks || {};
  const socialItems = [
    { href: social.facebook, label: "Facebook", Icon: Facebook },
    { href: social.twitter, label: "Twitter", Icon: Twitter },
    { href: social.instagram, label: "Instagram", Icon: Instagram },
    { href: social.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: social.email ? `mailto:${social.email}` : "", label: "Email", Icon: Mail },
  ].filter((s) => !!s.href);

  return (
    <footer className="bg-[#26322D] text-[#ECEAE1] pt-16 pb-12 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {siteConfig.logoUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteConfig.logoUrl}
                    alt={siteConfig.brandName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                  </svg>
                </div>
              )}
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                {siteConfig.brandName}
              </span>
            </Link>
            {footerContent.brandDescription && (
              <p className="text-sm text-[#ECEAE1]/70 leading-relaxed max-w-sm">
                {footerContent.brandDescription}
              </p>
            )}
            {footerContent.showSocial && socialItems.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {socialItems.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {footerContent.quickLinks.length > 0 && (
            <LinkColumn
              className="md:col-span-3"
              title={footerContent.quickLinksTitle}
              links={footerContent.quickLinks}
            />
          )}

          {footerContent.showCategories && footerContent.categoryLinks.length > 0 && (
            <LinkColumn
              className="md:col-span-3"
              title={footerContent.categoriesTitle}
              links={footerContent.categoryLinks}
            />
          )}

          {(footerContent.legalLinks.length > 0 || footerContent.badgeText) && (
            <div className="md:col-span-2 space-y-3">
              {footerContent.legalTitle && (
                <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider">
                  {footerContent.legalTitle}
                </h4>
              )}
              <ul className="space-y-2 text-sm">
                {footerContent.legalLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      target={link.newTab ? "_blank" : undefined}
                      className="text-[#ECEAE1]/75 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {footerContent.badgeText && (
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">
                    {footerContent.badgeText}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#ECEAE1]/60 gap-4">
          <p>{footerContent.copyright}</p>
          {footerContent.bottomText && <p>{footerContent.bottomText}</p>}
        </div>
      </div>
    </footer>
  );
}
