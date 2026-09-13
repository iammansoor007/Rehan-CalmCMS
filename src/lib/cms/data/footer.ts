import { FooterContent } from "@/types/cms";

export const footerContent: FooterContent = {
  brandDescription:
    "CalmTouch is dedicated to demystifying massage therapy and body wellness. We publish accessible, evidence-aligned guides for a more relaxed, pain-free everyday life.",
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About CalmTouch", href: "/about" },
    { label: "All Wellness Guides", href: "/category/all" },
    { label: "Contact Us", href: "/contact" },
    { label: "Admin CMS", href: "/admin" },
  ],
  categoryLinks: [
    { label: "Massage Therapy", href: "/category/massage-therapy" },
    { label: "Pain Relief", href: "/category/pain-relief" },
    { label: "Stress & Sleep", href: "/category/stress-sleep" },
    { label: "Self-Care Routines", href: "/category/self-care" },
    { label: "Aromatherapy Essentials", href: "/category/aromatherapy" },
    { label: "Physical Recovery", href: "/category/recovery" },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Medical Disclaimer", href: "#" },
  ],
  copyright: `© ${new Date().getFullYear()} CalmTouch Blog. All rights reserved.`,
};
