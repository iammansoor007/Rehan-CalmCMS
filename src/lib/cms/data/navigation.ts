import { NavigationSettings } from "@/types/cms";

export const navigationSettings: NavigationSettings = {
  items: [
    { id: "nav-home", label: "Home", href: "/", type: "custom" },
    {
      id: "nav-categories",
      label: "Categories",
      href: "/category/all",
      type: "custom",
      children: [
        { id: "nav-cat-massage-therapy", label: "Massage Therapy", href: "/category/massage-therapy", type: "category" },
        { id: "nav-cat-pain-relief", label: "Pain Relief", href: "/category/pain-relief", type: "category" },
        { id: "nav-cat-stress-sleep", label: "Stress & Sleep", href: "/category/stress-sleep", type: "category" },
        { id: "nav-cat-self-care", label: "Self-Care", href: "/category/self-care", type: "category" },
        { id: "nav-cat-aromatherapy", label: "Aromatherapy", href: "/category/aromatherapy", type: "category" },
        { id: "nav-cat-recovery", label: "Recovery", href: "/category/recovery", type: "category" },
        { id: "nav-cat-all", label: "All Categories", href: "/category/all", type: "custom" },
      ],
    },
    { id: "nav-self-care", label: "Self-Care", href: "/category/self-care", type: "category" },
    { id: "nav-guides", label: "Guides", href: "/#guide", type: "custom" },
    { id: "nav-about", label: "About", href: "/about", type: "page" },
    { id: "nav-contact", label: "Contact", href: "/contact", type: "page" },
  ],
  showSearch: true,
  cta: { visible: false, text: "Subscribe", href: "/#newsletter" },
};
