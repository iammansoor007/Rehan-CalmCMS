import { NavigationSettings } from "@/types/cms";

export const navigationSettings: NavigationSettings = {
  homeLabel: "Home",
  links: [
    { label: "Self-Care", href: "/category/self-care", visible: true },
    { label: "Guides", href: "/#guide", visible: true },
    { label: "About", href: "/about", visible: true },
    { label: "Contact", href: "/contact", visible: true },
  ],
  categoriesMenu: {
    visible: true,
    label: "Categories",
    categorySlugs: [],
    showAllLink: true,
    allLabel: "All Categories",
  },
  showSearch: true,
  cta: { visible: false, text: "Subscribe", href: "/#newsletter" },
};
