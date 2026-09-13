export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  pinterest?: string;
  email?: string;
}

export interface SiteConfig {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  metaDescription: string;
  contactEmail: string;
  socialLinks: SocialLinks;
  googleSiteVerification?: string;
  keywords?: string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface CategoryDropdownItem {
  label: string;
  href: string;
  slug: string;
}

export interface NavigationContent {
  mainNav: NavItem[];
  categoryDropdown: CategoryDropdownItem[];
}

export interface ArticleSection {
  heading: string;
  text: string;
}

export interface SafeStep {
  step: number;
  title: string;
  desc: string;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  authorRole?: string;
  img: string;
  intro: string;
  quickSummary?: string;
  keyBenefits?: string[];
  sections: ArticleSection[];
  dataTable?: {
    headers: string[];
    rows: string[][];
  };
  safeSteps?: SafeStep[];
  callout?: string;
  relatedSlugs: string[];
  status?: "published" | "draft";
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface Subscriber {
  _id?: string;
  email: string;
  createdAt: string | Date;
}

export interface Inquiry {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string | Date;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface BrowseCard {
  title: string;
  img: string;
}

export interface HomepageContent {
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    searchPlaceholder: string;
    popularTags: string[];
    stats: { label: string; value: string }[];
  };
  categoriesSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  latestSection: {
    title: string;
    subtitle: string;
  };
  browseSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  guidebook: {
    badge: string;
    title: string;
    subtitle: string;
    perks: string[];
    ctaText: string;
    ctaHref: string;
    img: string;
  };
  trustSection: {
    items: {
      title: string;
      desc: string;
      iconName: string;
    }[];
  };
  newsletter: {
    badge: string;
    title: string;
    subtitle: string;
    disclaimer: string;
    buttonText: string;
  };
}

export interface AboutContent {
  badge: string;
  title: string;
  subtitle: string;
  story: {
    title: string;
    paragraphs: string[];
  };
  values: {
    title: string;
    desc: string;
    iconName: string;
  }[];
  team: {
    name: string;
    role: string;
    bio: string;
    initial: string;
  }[];
  commitments: string[];
}

export interface ContactContent {
  badge: string;
  title: string;
  subtitle: string;
  infoCards: {
    title: string;
    detail: string;
    subtext: string;
    iconName: string;
  }[];
  subjects: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface FooterContent {
  brandDescription: string;
  quickLinks: NavItem[];
  categoryLinks: NavItem[];
  legalLinks: NavItem[];
  copyright: string;
}
