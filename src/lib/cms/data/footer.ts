import { FooterSettings } from "@/types/cms";

export const footerSettings: FooterSettings = {
  visible: true,
  brandDescription:
    "CalmTouch is dedicated to demystifying massage therapy and body wellness. We publish accessible, evidence-aligned guides for a more relaxed, pain-free everyday life.",
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { label: "Home", href: "/", visible: true },
    { label: "About CalmTouch", href: "/about", visible: true },
    { label: "All Wellness Guides", href: "/category/all", visible: true },
    { label: "Contact Us", href: "/contact", visible: true },
  ],
  showCategories: true,
  categoriesTitle: "Categories",
  categorySlugs: [],
  legalTitle: "Information",
  legalLinks: [
    { label: "Privacy Policy", href: "#", visible: true },
    { label: "Terms of Service", href: "#", visible: true },
    { label: "Medical Disclaimer", href: "#", visible: true },
  ],
  badgeText: "100% Educational",
  copyright: `© ${new Date().getFullYear()} CalmTouch Blog. All rights reserved.`,
  bottomText: "Designed with care for a more relaxed lifestyle.",
  showSocial: true,
};
