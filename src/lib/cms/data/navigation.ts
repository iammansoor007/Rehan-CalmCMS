import { NavigationContent } from "@/types/cms";

export const navigationContent: NavigationContent = {
  mainNav: [
    { label: "Home", href: "/" },
    { label: "Self-Care", href: "/category/self-care" },
    { label: "Guides", href: "/#guide" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  categoryDropdown: [
    { label: "Massage Therapy", href: "/category/massage-therapy", slug: "massage-therapy" },
    { label: "Pain Relief", href: "/category/pain-relief", slug: "pain-relief" },
    { label: "Stress & Sleep", href: "/category/stress-sleep", slug: "stress-sleep" },
    { label: "Self-Care", href: "/category/self-care", slug: "self-care" },
    { label: "Aromatherapy", href: "/category/aromatherapy", slug: "aromatherapy" },
    { label: "Recovery", href: "/category/recovery", slug: "recovery" },
    { label: "All Categories", href: "/category/all", slug: "all" },
  ],
};
