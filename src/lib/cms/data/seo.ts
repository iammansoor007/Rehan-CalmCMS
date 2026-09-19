import { RedirectsContent, SeoSettings } from "@/types/cms";

export const seoSettings: SeoSettings = {
  siteUrl: "",
  titleSeparator: "|",
  titleTemplates: {
    home: "%%sitename%% — %%tagline%%",
    post: "%%title%% %%sep%% %%sitename%%",
    page: "%%title%% %%sep%% %%sitename%%",
    category: "%%title%% Guides %%sep%% %%sitename%%",
    other: "%%title%% %%sep%% %%sitename%%",
  },
  defaultDescription: "",
  indexing: {
    siteVisible: true,
    posts: true,
    pages: true,
    categories: true,
    follow: true,
  },
  social: {
    ogSiteName: "",
    defaultImage: "",
    twitterHandle: "",
    twitterCard: "summary_large_image",
  },
  verification: {
    google: "",
    bing: "",
    yandex: "",
    pinterest: "",
  },
  schema: {
    enabled: true,
    orgType: "Organization",
    orgName: "",
    orgLogo: "",
    articleType: "BlogPosting",
    breadcrumbs: true,
  },
  sitemap: {
    enabled: true,
    posts: true,
    pages: true,
    categories: true,
  },
  robotsTxt: {
    blockAiCrawlers: false,
    extra: "",
  },
  analytics: {
    ga4Id: "",
  },
};

export const redirectsContent: RedirectsContent = { items: [] };
