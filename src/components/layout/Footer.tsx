import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { SiteConfig, FooterContent, NavItem } from "@/types/cms";

interface FooterProps {
  siteConfig: SiteConfig;
  footerContent: FooterContent;
}

function LinkColumn({ title, links }: { title: string; links: NavItem[] }) {
  return (
    <div>
      {title && <h4 className="font-heading font-semibold text-[0.98rem] text-white mb-5">{title}</h4>}
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              className="text-[#9BAEA4] transition-all hover:text-white hover:pl-1"
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

  const showCategories = footerContent.showCategories && footerContent.categoryLinks.length > 0;
  const showLegal = footerContent.legalLinks.length > 0 || !!footerContent.badgeText;

  return (
    <footer className="bg-brand-dark text-[#C5D0CB] pt-20 pb-10 text-[0.9rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-[60px]">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:pr-5">
            <Link href="/" className="flex items-center gap-2.5">
              {siteConfig.logoUrl ? (
                <div className="w-[38px] h-[38px] rounded-full overflow-hidden border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={siteConfig.logoUrl} alt={siteConfig.brandName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-[38px] h-[38px] rounded-full bg-white/10 text-white flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  </svg>
                </div>
              )}
              <div>
                <span className="block font-heading font-bold text-[1.4rem] text-white leading-tight">{siteConfig.brandName}</span>
                <span className="block text-xs text-[#9BAEA4] tracking-[0.03em]">{siteConfig.tagline}</span>
              </div>
            </Link>
            {footerContent.brandDescription && (
              <p className="text-[0.9rem] text-[#9BAEA4] leading-[1.6]">{footerContent.brandDescription}</p>
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
            <LinkColumn title={footerContent.quickLinksTitle} links={footerContent.quickLinks} />
          )}

          {showCategories && <LinkColumn title={footerContent.categoriesTitle} links={footerContent.categoryLinks} />}

          {showLegal && (
            <div>
              <LinkColumn title={footerContent.legalTitle} links={footerContent.legalLinks} />
              {footerContent.badgeText && (
                <span className="inline-block mt-4 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                  {footerContent.badgeText}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-white/[0.08] mb-[30px]" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.85rem] text-[#7D9287]">
          <span>{footerContent.copyright}</span>
          {footerContent.bottomText && <span>{footerContent.bottomText}</span>}
        </div>
      </div>
    </footer>
  );
}
