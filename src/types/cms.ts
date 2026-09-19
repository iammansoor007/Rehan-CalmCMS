import type { Role } from "@/lib/permissions";

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
  /** Hidden from the site when false (undefined = shown). */
  visible?: boolean;
  newTab?: boolean;
}

export interface CategoryDropdownItem {
  label: string;
  href: string;
  slug: string;
  /** Nesting level for sub-categories (0 = top level). */
  depth?: number;
}

export interface NavCta {
  visible: boolean;
  text: string;
  href: string;
}

/** What the admin edits. */
export interface NavigationSettings {
  homeLabel: string;
  links: NavItem[];
  categoriesMenu: {
    visible: boolean;
    label: string;
    /** Categories to list, in order. Empty = all. */
    categorySlugs: string[];
    showAllLink: boolean;
    allLabel: string;
  };
  showSearch: boolean;
  cta: NavCta;
}

/** What the header renders (settings resolved against the real categories). */
export interface NavigationContent {
  homeLabel: string;
  links: NavItem[];
  categoriesMenu: { visible: boolean; label: string; items: CategoryDropdownItem[] };
  showSearch: boolean;
  cta: NavCta;
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

export type RobotsIndex = "default" | "index" | "noindex";
export type RobotsFollow = "default" | "follow" | "nofollow";

/** Per-item SEO settings (the Yoast-style panel). Empty/"default" means "use the site-wide setting". */
export interface SeoMeta {
  /** Search-result title. May contain %%title%%, %%sitename%%, %%sep%%, %%tagline%%, %%category%%. */
  title?: string;
  description?: string;
  focusKeyword?: string;
  canonical?: string;
  index?: RobotsIndex;
  follow?: RobotsFollow;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  /** Label used for this item in breadcrumbs. */
  breadcrumbTitle?: string;
  excludeFromSitemap?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  /** Structured-data type override, e.g. "BlogPosting", "NewsArticle", "FAQPage". Empty = default. */
  schemaType?: string;
}

export type PostStatus = "published" | "draft" | "scheduled";

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  authorRole?: string;
  /** Featured image URL. Empty string means no featured image. */
  img: string;
  imgAlt?: string;
  /** Short excerpt shown on cards and used as the default meta description. */
  intro: string;
  /** Rich-text body (HTML) from the post editor. Legacy posts use `sections` instead. */
  content?: string;
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
  status?: PostStatus;
  /** ISO timestamp — when a "scheduled" post goes live. */
  scheduledAt?: string;
  /** Username of the CMS user who created the post. */
  authorId?: string;
  /** Yoast-style SEO panel. The legacy metaTitle/metaDescription/keywords/canonicalUrl/ogImage fields feed into it. */
  seo?: SeoMeta;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface CmsPage {
  slug: string;
  title: string;
  /** Rich-text body (HTML). */
  content: string;
  status: "published" | "draft";
  img?: string;
  imgAlt?: string;
  seo?: SeoMeta;
  metaTitle?: string;
  metaDescription?: string;
  author?: string;
  updatedAt?: string;
}

export interface CmsUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
}

export interface MediaItem {
  id?: string;
  filename: string;
  url: string;
  size?: number;
  mimetype?: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  createdAt?: string | Date;
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
  /** Slug of the parent category (empty / undefined for top-level categories). */
  parent?: string;
  seo?: SeoMeta;
}

export interface BrowseCard {
  title: string;
  img: string;
}

export type HomeSectionId =
  | "hero"
  | "categories"
  | "latest"
  | "browse"
  | "guidebook"
  | "trust"
  | "newsletter";

/** Content blocks (homepage, about, contact) use the same SEO shape as posts. */
export type SeoFields = SeoMeta;

export interface HomepageContent {
  seo: SeoFields;
  /** Order in which the homepage sections are rendered. */
  sectionOrder: HomeSectionId[];
  hero: {
    visible: boolean;
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    searchPlaceholder: string;
    popularTags: string[];
    stats: { label: string; value: string }[];
    /** Hero image (defaults to the bundled hero.png). */
    image?: string;
    imageAlt?: string;
    /** Primary call-to-action button. Hidden when text or link is empty. */
    ctaText?: string;
    ctaHref?: string;
    /** Small caption card floating over the hero image. Hidden when title is empty. */
    cardLabel?: string;
    cardTitle?: string;
    cardHref?: string;
  };
  categoriesSection: {
    visible: boolean;
    badge: string;
    title: string;
    subtitle: string;
    /** Categories to show, in order. Empty = all categories. */
    categorySlugs: string[];
    showDescriptions: boolean;
  };
  latestSection: {
    visible: boolean;
    title: string;
    subtitle: string;
    /** How many posts to list. */
    count: number;
    /** Only list posts from these categories. Empty = all categories. */
    categorySlugs: string[];
    showSidebar: boolean;
    linkText: string;
    linkHref: string;
  };
  browseSection: {
    visible: boolean;
    badge: string;
    title: string;
    subtitle: string;
    /** Category tabs to show, in order. Empty = every category that has posts. */
    categorySlugs: string[];
    postsPerCategory: number;
  };
  guidebook: {
    visible: boolean;
    badge: string;
    title: string;
    subtitle: string;
    perks: string[];
    ctaText: string;
    ctaHref: string;
    img: string;
  };
  trustSection: {
    visible: boolean;
    items: {
      title: string;
      desc: string;
      iconName: string;
    }[];
  };
  newsletter: {
    visible: boolean;
    badge: string;
    title: string;
    subtitle: string;
    disclaimer: string;
    buttonText: string;
  };
}

export interface AboutContent {
  seo: SeoFields;
  badge: string;
  title: string;
  subtitle: string;
  /** Optional wide image under the page header. */
  image?: string;
  story: {
    visible: boolean;
    title: string;
    paragraphs: string[];
    image?: string;
  };
  values: {
    visible: boolean;
    title: string;
    subtitle: string;
    items: { title: string; desc: string; iconName: string }[];
  };
  team: {
    visible: boolean;
    title: string;
    subtitle: string;
    members: { name: string; role: string; bio: string; photo?: string }[];
  };
  commitments: {
    visible: boolean;
    title: string;
    subtitle: string;
    items: string[];
  };
}

export interface ContactContent {
  seo: SeoFields;
  badge: string;
  title: string;
  subtitle: string;
  infoCards: {
    visible: boolean;
    items: { title: string; detail: string; subtext: string; iconName: string; href?: string }[];
  };
  form: {
    visible: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    subjects: string[];
    /** Where the "Send Message" mail draft is addressed. */
    recipientEmail: string;
    successMessage: string;
  };
  faq: {
    visible: boolean;
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
}

export interface FooterSettings {
  visible: boolean;
  brandDescription: string;
  quickLinksTitle: string;
  quickLinks: NavItem[];
  showCategories: boolean;
  categoriesTitle: string;
  /** Categories to list, in order. Empty = the first six. */
  categorySlugs: string[];
  legalTitle: string;
  legalLinks: NavItem[];
  badgeText: string;
  copyright: string;
  bottomText: string;
  showSocial: boolean;
}

export interface FooterContent extends Omit<FooterSettings, "categorySlugs"> {
  categoryLinks: NavItem[];
}

export interface SidebarSettings {
  showTopics: boolean;
  topicsTitle: string;
  /** Categories to list. Empty = all. */
  topicCategorySlugs: string[];
  showPopular: boolean;
  popularTitle: string;
  popularCount: number;
  showCard: boolean;
  cardTitle: string;
  cardText: string;
  cardLinkText: string;
  cardLinkHref: string;
}

export interface TemplateSettings {
  post: {
    showReadingTime: boolean;
    showShare: boolean;
    showCta: boolean;
    ctaTitle: string;
    ctaText: string;
    ctaButtonText: string;
    ctaButtonHref: string;
    showAuthorBox: boolean;
    authorBoxLabel: string;
    authorBio: string;
    showPrevNext: boolean;
  };
  archive: {
    badge: string;
    showCount: boolean;
    emptyTitle: string;
    emptyText: string;
  };
  directory: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

export interface SeoSettings {
  /** Public address of the site, e.g. https://example.com (used for canonical, sitemap, social cards). */
  siteUrl: string;
  titleSeparator: string;
  titleTemplates: {
    home: string;
    post: string;
    page: string;
    category: string;
    other: string;
  };
  defaultDescription: string;
  indexing: {
    /** Off = ask search engines to skip the whole site (like WordPress "discourage search engines"). */
    siteVisible: boolean;
    posts: boolean;
    pages: boolean;
    categories: boolean;
    follow: boolean;
  };
  social: {
    ogSiteName: string;
    defaultImage: string;
    twitterHandle: string;
    twitterCard: "summary_large_image" | "summary";
  };
  verification: {
    google: string;
    bing: string;
    yandex: string;
    pinterest: string;
  };
  schema: {
    enabled: boolean;
    orgType: "Organization" | "Person";
    orgName: string;
    orgLogo: string;
    articleType: "Article" | "BlogPosting" | "NewsArticle";
    breadcrumbs: boolean;
  };
  sitemap: {
    enabled: boolean;
    posts: boolean;
    pages: boolean;
    categories: boolean;
  };
  robotsTxt: {
    blockAiCrawlers: boolean;
    /** Extra lines appended to robots.txt. */
    extra: string;
  };
  analytics: {
    ga4Id: string;
  };
}

export interface RedirectRule {
  from: string;
  to: string;
}

export interface RedirectsContent {
  items: RedirectRule[];
}
