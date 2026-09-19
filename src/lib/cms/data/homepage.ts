import { HomepageContent } from "@/types/cms";

export const homepageContent: HomepageContent = {
  seo: {
    title: "",
    description: "",
  },
  sectionOrder: ["hero", "categories", "latest", "browse", "guidebook", "trust", "newsletter"],
  hero: {
    visible: true,
    badge: "Mindful Living & Body Wellness",
    titleStart: "Simple Guidance for a",
    titleHighlight: "Calmer, Healthier",
    titleEnd: "Body",
    subtitle:
      "Explore evidence-aligned techniques, self-massage routines, and expert bodywork advice designed to relieve everyday stress, improve sleep, and restore mobility.",
    searchPlaceholder: "Search techniques, pain relief, essential oils...",
    popularTags: ["Neck Relief", "Lower Back", "Swedish Massage", "Sleep Rituals"],
    stats: [
      { value: "50+", label: "Wellness Guides" },
      { value: "100%", label: "Evidence-Aligned" },
      { value: "25k+", label: "Monthly Readers" },
    ],
    image: "/assets/images/hero.png",
    imageAlt: "Massage & Wellness Experience",
    ctaText: "Explore All Guides",
    ctaHref: "/category/all",
    cardLabel: "Featured Modality",
    cardTitle: "Classic Swedish Full Body Flow",
    cardHref: "/blog/swedish-massage-what-to-expect",
  },
  categoriesSection: {
    visible: true,
    badge: "Explore by Topic",
    title: "Browse Wellness Categories",
    subtitle: "Find the exact advice, techniques, and guidance you need for your body.",
    categorySlugs: [],
    showDescriptions: true,
  },
  latestSection: {
    visible: true,
    title: "Latest Articles & Guides",
    subtitle: "Fresh insights and practical routines published weekly by our team.",
    count: 6,
    categorySlugs: [],
    showSidebar: true,
    linkText: "View all articles →",
    linkHref: "/category/all",
  },
  browseSection: {
    visible: true,
    badge: "Curated Directory",
    title: "Browse by Category",
    subtitle: "Select a focus area below to discover targeted routines and treatments.",
    categorySlugs: [],
    postsPerCategory: 4,
  },
  guidebook: {
    visible: true,
    badge: "Featured Masterclass",
    title: "The Beginner’s Complete Guide to Massage Therapy",
    subtitle:
      "Demystify your first appointment with our complete beginner's handbook. Learn how to communicate your pressure preferences, what to expect, and proper post-treatment recovery.",
    perks: [
      "Understand differences between Swedish, Deep Tissue, and Shiatsu",
      "Essential pre-appointment checklist and clinic etiquette",
      "Actionable hydration and stretching tips for lasting relief",
    ],
    ctaText: "Read the Complete Guide",
    ctaHref: "/blog/the-beginners-guide-to-massage-therapy",
    img: "/assets/images/guide.png",
  },
  trustSection: {
    visible: true,
    items: [
      {
        title: "Evidence-Aligned Advice",
        desc: "All content is reviewed against current musculoskeletal anatomy and therapeutic standards.",
        iconName: "ShieldCheck",
      },
      {
        title: "Certified Practitioners",
        desc: "Written and curated with insights from experienced licensed massage therapists.",
        iconName: "Award",
      },
      {
        title: "Practical & Doable",
        desc: "Routines require no expensive equipment—learn techniques you can use at your desk or bed.",
        iconName: "Sparkles",
      },
      {
        title: "Ad-Free & Respectful",
        desc: "We focus on clean, calming reading experiences free from noisy popups and spam.",
        iconName: "HeartHandshake",
      },
    ],
  },
  newsletter: {
    visible: true,
    badge: "Stay Grounded",
    title: "Subscribe to Our Weekly Wellness Digest",
    subtitle:
      "Join over 25,000 mindful individuals receiving simple weekly massage tips, sleep rituals, and posture resets.",
    disclaimer: "No spam. Unsubscribe anytime with one click.",
    buttonText: "Subscribe Free",
  },
};
