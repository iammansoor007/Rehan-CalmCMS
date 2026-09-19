import {
  SiteConfig,
  NavigationContent,
  HomepageContent,
  Category,
  Article,
  AboutContent,
  ContactContent,
  FooterContent,
  SidebarSettings,
  TemplateSettings,
} from "@/types/cms";
import { slugify } from "@/lib/slugify";
import { descendantSlugs, pickCategories } from "@/lib/categoryTree";
import { ArticleModel } from "@/models/Article";
import { CategoryModel } from "@/models/Category";
import { SiteConfigModel } from "@/models/SiteConfig";
import { hasMongo } from "./backend";
import { CmsError } from "./errors";
import { readStore, updateStore } from "./store";
import { addRedirect, getContent, renameCategorySlug } from "./content";
import { foldLegacySeo } from "@/lib/seoShared";

export { slugify };

// ---------------------------------------------------------------------------
// Site config & homepage
// ---------------------------------------------------------------------------

export async function getSiteConfig(): Promise<SiteConfig> {
  if (await hasMongo()) {
    const config = await SiteConfigModel.findOne().lean();
    if (config) {
      return {
        brandName: config.brandName,
        tagline: config.tagline,
        logoUrl: config.logoUrl,
        metaDescription: config.metaDescription,
        contactEmail: config.contactEmail,
        socialLinks: config.socialLinks || {},
      };
    }
  }
  return readStore().siteConfig;
}

export async function updateSiteConfig(newConfig: Partial<SiteConfig>): Promise<SiteConfig> {
  if (await hasMongo()) {
    const updated = await SiteConfigModel.findOneAndUpdate({}, newConfig, {
      upsert: true,
      new: true,
    }).lean();
    if (updated) {
      return {
        brandName: updated.brandName,
        tagline: updated.tagline,
        logoUrl: updated.logoUrl,
        metaDescription: updated.metaDescription,
        contactEmail: updated.contactEmail,
        socialLinks: updated.socialLinks || {},
      };
    }
  }
  return updateStore((s) => {
    s.siteConfig = { ...s.siteConfig, ...newConfig };
    return s.siteConfig;
  });
}

export async function getHomepageData(): Promise<HomepageContent> {
  return getContent("homepage");
}

export async function getAboutData(): Promise<AboutContent> {
  return getContent("about");
}

export async function getContactData(): Promise<ContactContent> {
  return getContent("contact");
}

export async function getSidebarSettings(): Promise<SidebarSettings> {
  return getContent("sidebar");
}

export async function getTemplateSettings(): Promise<TemplateSettings> {
  return getContent("templates");
}

const visibleOnly = <T extends { visible?: boolean }>(items: T[]) =>
  items.filter((item) => item.visible !== false);

export async function getNavigation(): Promise<NavigationContent> {
  const [settings, categories] = await Promise.all([getContent("navigation"), getCategories()]);
  const menu = settings.categoriesMenu;

  const items = pickCategories(categories, menu.categorySlugs).map((c) => ({
    label: c.name,
    href: `/category/${c.slug}`,
    slug: c.slug,
    depth: c.depth,
  }));
  if (menu.showAllLink) {
    items.push({ label: menu.allLabel, href: "/category/all", slug: "all", depth: 0 });
  }

  return {
    homeLabel: settings.homeLabel,
    links: visibleOnly(settings.links),
    categoriesMenu: { visible: menu.visible, label: menu.label, items },
    showSearch: settings.showSearch,
    cta: settings.cta,
  };
}

export async function getFooterData(): Promise<FooterContent> {
  const [settings, config, categories] = await Promise.all([
    getContent("footer"),
    getSiteConfig(),
    getCategories(),
  ]);
  const { categorySlugs, ...rest } = settings;
  const picked = pickCategories(categories, categorySlugs);

  return {
    ...rest,
    brandDescription: settings.brandDescription || config.metaDescription,
    quickLinks: visibleOnly(settings.quickLinks),
    legalLinks: visibleOnly(settings.legalLinks),
    categoryLinks: (categorySlugs.length ? picked : picked.slice(0, 6)).map((c) => ({
      label: c.name,
      href: `/category/${c.slug}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function mapCategory(c: {
  slug: string;
  name: string;
  description?: string;
  parent?: string;
  seo?: unknown;
}): Category {
  return {
    slug: c.slug,
    name: c.name,
    description: c.description || "",
    parent: c.parent || "",
    seo: (c.seo as Category["seo"]) || {},
  };
}

async function loadCategories(): Promise<Category[]> {
  if (await hasMongo()) {
    const cats = await CategoryModel.find().sort({ createdAt: 1 }).lean();
    return cats.map(mapCategory);
  }
  return readStore().categories.map(mapCategory);
}

export async function getCategories(): Promise<Category[]> {
  return loadCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const normSlug = slugify(slug);
  if (normSlug === "all") {
    return {
      slug: "all",
      name: "All Category Archives",
      description:
        "Browse our complete collection of simple, evidence-aligned massage and body care guides.",
    };
  }
  const categories = await loadCategories();
  return (
    categories.find((c) => c.slug === normSlug || c.slug === slug) ||
    categories.find((c) => slugify(c.slug) === normSlug || slugify(c.name) === normSlug) ||
    null
  );
}

export async function saveCategory(cat: Category, originalSlug?: string): Promise<Category> {
  const name = (cat.name || "").trim();
  const slug = slugify(cat.slug || name);
  if (!name || !slug) throw new CmsError(400, "Category name and slug are required.");
  if (slug === "all") throw new CmsError(400, 'The slug "all" is reserved.');

  const categories = await loadCategories();
  const previous = originalSlug ? categories.find((c) => c.slug === originalSlug) : undefined;
  if (originalSlug && !previous) throw new CmsError(404, "Category not found.");
  if (slug !== originalSlug && categories.some((c) => c.slug === slug)) {
    throw new CmsError(409, "A category with that slug already exists.");
  }

  let parent = cat.parent || "";
  if (parent === slug || parent === originalSlug) parent = "";
  if (parent) {
    if (!categories.some((c) => c.slug === parent)) {
      throw new CmsError(400, "The selected parent category no longer exists.");
    }
    if (originalSlug && descendantSlugs(categories, originalSlug).includes(parent)) {
      throw new CmsError(400, "A category cannot be moved under one of its own sub-categories.");
    }
  }

  const next: Category = {
    slug,
    name,
    description: (cat.description || "").trim(),
    parent,
    seo: cat.seo || previous?.seo || {},
  };
  const renamed = previous && previous.name !== name;
  const reslugged = previous && previous.slug !== slug;

  if (await hasMongo()) {
    await CategoryModel.findOneAndUpdate({ slug: originalSlug || slug }, next, {
      upsert: true,
      new: true,
    });
    if (renamed) await ArticleModel.updateMany({ category: previous.name }, { category: name });
    if (reslugged) await CategoryModel.updateMany({ parent: previous.slug }, { parent: slug });
  } else {
    updateStore((s) => {
      const idx = s.categories.findIndex((c) => c.slug === (originalSlug || slug));
      if (idx >= 0) s.categories[idx] = next;
      else s.categories.push(next);
      if (renamed) {
        s.articles.forEach((a) => {
          if (a.category === previous.name) a.category = name;
        });
      }
      if (reslugged) {
        s.categories.forEach((c) => {
          if (c.parent === previous.slug) c.parent = slug;
        });
      }
    });
  }
  if (reslugged) {
    await renameCategorySlug(previous.slug, slug);
    await addRedirect(`/category/${previous.slug}`, `/category/${slug}`);
  }
  return next;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  if (slug === "all") throw new CmsError(400, "The default archive category cannot be deleted.");
  const categories = await loadCategories();
  const target = categories.find((c) => c.slug === slug);
  if (!target) return false;
  const newParent = target.parent || "";

  if (await hasMongo()) {
    await CategoryModel.findOneAndDelete({ slug });
    await CategoryModel.updateMany({ parent: slug }, { parent: newParent });
  } else {
    updateStore((s) => {
      s.categories = s.categories.filter((c) => c.slug !== slug);
      s.categories.forEach((c) => {
        if (c.parent === slug) c.parent = newParent;
      });
    });
  }
  return true;
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

/** Whether the visitors of the public site may see this post right now. */
export function isLive(article: Pick<Article, "status" | "scheduledAt">, now = Date.now()): boolean {
  const status = article.status ?? "published";
  if (status === "published") return true;
  if (status === "scheduled") {
    return !!article.scheduledAt && new Date(article.scheduledAt).getTime() <= now;
  }
  return false;
}

type ArticleSource = Omit<Article, "img" | "status" | "dataTable"> & {
  img?: string;
  status?: string;
  dataTable?: { headers?: string[]; rows?: string[][] } | null;
};

function mapArticle(a: ArticleSource): Article {
  const hasTable = !!a.dataTable && (a.dataTable.headers?.length || 0) > 0;
  return {
    slug: a.slug,
    title: a.title,
    category: a.category,
    date: a.date,
    author: a.author,
    authorRole: a.authorRole || undefined,
    authorId: a.authorId || undefined,
    img: a.img || "",
    imgAlt: a.imgAlt || "",
    intro: a.intro || "",
    content: a.content || "",
    quickSummary: a.quickSummary || "",
    keyBenefits: a.keyBenefits || [],
    sections: a.sections || [],
    dataTable: hasTable
      ? { headers: a.dataTable?.headers || [], rows: a.dataTable?.rows || [] }
      : undefined,
    safeSteps: a.safeSteps && a.safeSteps.length > 0 ? a.safeSteps : undefined,
    callout: a.callout || "",
    relatedSlugs: a.relatedSlugs || [],
    status: (a.status as Article["status"]) || "published",
    scheduledAt: a.scheduledAt || undefined,
    seo: foldLegacySeo({
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      keywords: a.keywords,
      canonicalUrl: a.canonicalUrl,
      ogImage: a.ogImage,
      seo: a.seo,
    }),
    metaTitle: a.metaTitle || "",
    metaDescription: a.metaDescription || "",
    keywords: a.keywords || [],
    canonicalUrl: a.canonicalUrl || "",
    ogImage: a.ogImage || "",
  };
}

async function loadArticles(): Promise<Article[]> {
  if (await hasMongo()) {
    const arts = await ArticleModel.find().sort({ createdAt: -1 }).lean();
    return arts.map((a) => mapArticle(a as unknown as ArticleSource));
  }
  return readStore().articles.map((a) => mapArticle(a as unknown as ArticleSource));
}

export interface ArticleQuery {
  /** Include drafts and scheduled posts — for the admin panel and previews. */
  includeAll?: boolean;
}

export async function getArticles(query: ArticleQuery = {}): Promise<Article[]> {
  const all = await loadArticles();
  if (query.includeAll) return all;
  const now = Date.now();
  return all.filter((a) => isLive(a, now));
}

export async function getArticleBySlug(
  slug: string,
  query: ArticleQuery = {}
): Promise<Article | null> {
  const target = slugify(slug);
  const all = await getArticles(query);
  return all.find((a) => a.slug === target) || all.find((a) => slugify(a.title) === target) || null;
}

function categoryMatches(article: Article, target: string): boolean {
  const artCatSlug = slugify(article.category);
  if (target === "self-care" || target === "self-massage") {
    return artCatSlug.includes("self");
  }
  return (
    artCatSlug === target ||
    artCatSlug.replace(/-/g, "") === target.replace(/-/g, "") ||
    artCatSlug.includes(target) ||
    target.includes(artCatSlug)
  );
}

/**
 * Posts filed under any of the given categories (a parent category also includes
 * its sub-categories). An empty list means "no filter" and returns every post.
 */
export function articlesInCategories(
  articles: Article[],
  categories: Category[],
  slugs: string[]
): Article[] {
  const wanted = slugs.filter((s) => s && s !== "all");
  if (wanted.length === 0) return articles;
  const targets = wanted.flatMap((s) => [s, ...descendantSlugs(categories, s)]);
  return articles.filter((a) => targets.some((t) => categoryMatches(a, t)));
}

export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const [allArticles, categories] = await Promise.all([getArticles(), getCategories()]);
  const target = slugify(categorySlug);
  if (target === "all") return allArticles;
  return articlesInCategories(allArticles, categories, [target]);
}

export async function saveArticle(article: Article, originalSlug?: string): Promise<Article> {
  const slug = slugify(article.slug);
  if (!article.title.trim() || !slug) throw new CmsError(400, "Title and URL slug are required.");

  const existing = await loadArticles();
  if (originalSlug && !existing.some((a) => a.slug === originalSlug)) {
    throw new CmsError(404, "Post not found.");
  }
  if (slug !== originalSlug && existing.some((a) => a.slug === slug)) {
    throw new CmsError(409, "Another post already uses that slug. Please choose a different one.");
  }

  const next: Article = { ...article, slug };
  if (await hasMongo()) {
    await ArticleModel.findOneAndUpdate({ slug: originalSlug || slug }, next, {
      upsert: true,
      new: true,
    });
  } else {
    updateStore((s) => {
      const idx = s.articles.findIndex((a) => a.slug === (originalSlug || slug));
      if (idx >= 0) s.articles[idx] = next;
      else s.articles.unshift(next);
    });
  }
  if (originalSlug && originalSlug !== slug) {
    await addRedirect(`/blog/${originalSlug}`, `/blog/${slug}`);
  }
  return next;
}

export async function deleteArticle(slug: string): Promise<boolean> {
  if (await hasMongo()) {
    const removed = await ArticleModel.findOneAndDelete({ slug });
    return !!removed;
  }
  return updateStore((s) => {
    const before = s.articles.length;
    s.articles = s.articles.filter((a) => a.slug !== slug);
    return s.articles.length < before;
  });
}
