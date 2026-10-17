import { FooterSettings } from "@/types/cms";

export const footerSettings: FooterSettings = {
  visible: true,
  brandDescription:
    "Simple, trustworthy guidance for massage, recovery, relaxation, and everyday wellness.",
  columns: [
    {
      id: "foot-quick",
      title: "Quick Links",
      items: [
        { id: "fq-home", label: "Home", href: "/", type: "custom" },
        { id: "fq-about", label: "About Us", href: "/about", type: "page" },
        { id: "fq-contact", label: "Contact Us", href: "/contact", type: "page" },
        { id: "fq-all", label: "All Articles", href: "/category/all", type: "custom" },
      ],
    },
    {
      id: "foot-categories",
      title: "Categories",
      items: [
        { id: "fc-massage", label: "Massage Therapy", href: "/category/massage-therapy", type: "category" },
        { id: "fc-pain", label: "Pain Relief", href: "/category/pain-relief", type: "category" },
        { id: "fc-stress", label: "Stress & Sleep", href: "/category/stress-sleep", type: "category" },
        { id: "fc-self", label: "Self-Care", href: "/category/self-care", type: "category" },
      ],
    },
    {
      id: "foot-resources",
      title: "Resources",
      items: [
        { id: "fr-guides", label: "Beginner Guides", href: "/#guide", type: "custom" },
        { id: "fr-glossary", label: "Wellness Glossary", href: "#", type: "custom" },
        { id: "fr-faqs", label: "FAQs", href: "/contact", type: "custom" },
        { id: "fr-news", label: "Newsletter", href: "/#newsletter", type: "custom" },
      ],
    },
    {
      id: "foot-legal",
      title: "Legal",
      items: [
        { id: "fl-privacy", label: "Privacy Policy", href: "#", type: "custom" },
        { id: "fl-terms", label: "Terms & Conditions", href: "#", type: "custom" },
        { id: "fl-disclaimer", label: "Disclaimer", href: "#", type: "custom" },
      ],
    },
  ],
  badgeText: "",
  copyright: `© ${new Date().getFullYear()} CalmTouch. All rights reserved.`,
  bottomText: "Crafted for gentle living & modern wellness",
  showSocial: false,
};
