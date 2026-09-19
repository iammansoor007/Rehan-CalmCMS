import { TemplateSettings } from "@/types/cms";

export const templateSettings: TemplateSettings = {
  post: {
    showReadingTime: true,
    showShare: true,
    showCta: true,
    ctaTitle: "Stay Restored & Comfortable",
    ctaText: "Explore our complete library of practical wellness and body care guides.",
    ctaButtonText: "Browse All Topics",
    ctaButtonHref: "/category/all",
    showAuthorBox: true,
    authorBoxLabel: "About the Author",
    authorBio:
      "Certified wellness advisor and massage practitioner dedicated to bringing practical, evidence-aligned body recovery techniques to daily living.",
    showPrevNext: true,
  },
  archive: {
    badge: "Category Archive",
    showCount: true,
    emptyTitle: "No articles found in this category",
    emptyText: "Explore our other wellness categories or browse all articles.",
  },
  directory: {
    badge: "Wellness Topics & Directory",
    title: "All Wellness Categories",
    subtitle:
      "Find targeted advice, practical self-massage steps, and certified bodywork knowledge organized by topic.",
  },
};
