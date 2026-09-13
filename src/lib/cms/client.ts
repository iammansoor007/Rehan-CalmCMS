import { siteConfig as defaultSiteConfig } from "./data/siteConfig";
import { navigationContent } from "./data/navigation";
import { homepageContent as defaultHomepageContent } from "./data/homepage";
import { categoriesData as defaultCategoriesData, browseCategoryCards } from "./data/categories";
import { articlesData as defaultArticlesData } from "./data/articles";
import { aboutContent } from "./data/about";
import { contactContent } from "./data/contact";
import { footerContent } from "./data/footer";
import {
  SiteConfig,
  NavigationContent,
  HomepageContent,
  Category,
  Article,
  AboutContent,
  ContactContent,
  FooterContent,
  BrowseCard,
} from "@/types/cms";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseSeeded } from "@/lib/dbSeeder";
import { ArticleModel } from "@/models/Article";
import { CategoryModel } from "@/models/Category";
import { SiteConfigModel } from "@/models/SiteConfig";

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// In-memory runtime cache / fallback
let memoryArticles: Article[] = [...defaultArticlesData];
let memorySiteConfig: SiteConfig = { ...defaultSiteConfig };
let memoryHomepageContent: HomepageContent = { ...defaultHomepageContent };
let memoryCategories: Category[] = [...defaultCategoriesData];

export async function getSiteConfig(): Promise<SiteConfig> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
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
  return memorySiteConfig;
}

export async function getNavigation(): Promise<NavigationContent> {
  const categories = await getCategories();
  return {
    ...navigationContent,
    categoryDropdown: [
      ...categories.map((c) => ({
        label: c.name,
        href: `/category/${c.slug}`,
        slug: c.slug,
      })),
      { label: "All Categories", href: "/category/all", slug: "all" },
    ],
  };
}

export async function getHomepageData(): Promise<HomepageContent> {
  return memoryHomepageContent;
}

export async function getAboutData(): Promise<AboutContent> {
  return aboutContent;
}

export async function getContactData(): Promise<ContactContent> {
  return contactContent;
}

export async function getFooterData(): Promise<FooterContent> {
  const config = await getSiteConfig();
  const categories = await getCategories();
  return {
    ...footerContent,
    brandDescription: config.metaDescription || footerContent.brandDescription,
    categoryLinks: categories.slice(0, 6).map((c) => ({
      label: c.name,
      href: `/category/${c.slug}`,
    })),
  };
}

export async function getCategories(): Promise<Category[]> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    const cats = await CategoryModel.find().lean();
    if (cats && cats.length > 0) {
      return cats.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
      }));
    }
  }
  return memoryCategories;
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
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    const cat = await CategoryModel.findOne({
      $or: [
        { slug: normSlug },
        { slug: slug },
        { slug: new RegExp(`^${normSlug}$`, "i") },
      ],
    }).lean();
    if (cat) {
      return {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
      };
    }
  }
  const match = memoryCategories.find(
    (c) => slugify(c.slug) === normSlug || slugify(c.name) === normSlug
  );
  return match || null;
}

export async function getBrowseCards(): Promise<Record<string, BrowseCard[]>> {
  return browseCategoryCards;
}

export async function getArticles(): Promise<Article[]> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    const arts = await ArticleModel.find().sort({ createdAt: -1 }).lean();
    if (arts && arts.length > 0) {
      return arts.map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        date: a.date,
        author: a.author,
        authorRole: a.authorRole,
        img: a.img,
        intro: a.intro,
        quickSummary: a.quickSummary,
        keyBenefits: a.keyBenefits || [],
        sections: a.sections || [],
        dataTable: a.dataTable,
        safeSteps: a.safeSteps,
        callout: a.callout,
        relatedSlugs: a.relatedSlugs || [],
      }));
    }
  }
  return memoryArticles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const targetSlug = slugify(slug);
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    const art = await ArticleModel.findOne({ slug: targetSlug }).lean();
    if (art) {
      return {
        slug: art.slug,
        title: art.title,
        category: art.category,
        date: art.date,
        author: art.author,
        authorRole: art.authorRole,
        img: art.img,
        intro: art.intro,
        quickSummary: art.quickSummary,
        keyBenefits: art.keyBenefits || [],
        sections: art.sections || [],
        dataTable: art.dataTable,
        safeSteps: art.safeSteps,
        callout: art.callout,
        relatedSlugs: art.relatedSlugs || [],
      };
    }
  }
  const match = memoryArticles.find((a) => a.slug === targetSlug || slugify(a.title) === targetSlug);
  return match || null;
}

export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const allArticles = await getArticles();
  const target = slugify(categorySlug);
  if (target === "all") {
    return allArticles;
  }
  return allArticles.filter((a) => {
    const artCatSlug = slugify(a.category);
    if (target === "self-care" || target === "self-massage") {
      return artCatSlug.includes("self");
    }
    return (
      artCatSlug === target ||
      artCatSlug.replace(/-/g, "") === target.replace(/-/g, "") ||
      artCatSlug.includes(target) ||
      target.includes(artCatSlug)
    );
  });
}

// In-App CMS mutations
export async function saveArticle(article: Article): Promise<Article> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    await ArticleModel.findOneAndUpdate(
      { slug: article.slug },
      { ...article, status: "published" },
      { upsert: true, new: true }
    );
  }
  const index = memoryArticles.findIndex((a) => a.slug === article.slug);
  if (index >= 0) {
    memoryArticles[index] = article;
  } else {
    memoryArticles.unshift(article);
  }
  return article;
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    await ArticleModel.findOneAndDelete({ slug });
  }
  const initialLen = memoryArticles.length;
  memoryArticles = memoryArticles.filter((a) => a.slug !== slug);
  return memoryArticles.length < initialLen || !!db;
}

export async function saveCategory(cat: Category): Promise<Category> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    await CategoryModel.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, new: true }
    );
  }
  const idx = memoryCategories.findIndex((c) => c.slug === cat.slug);
  if (idx >= 0) {
    memoryCategories[idx] = cat;
  } else {
    memoryCategories.push(cat);
  }
  return cat;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
    await CategoryModel.findOneAndDelete({ slug });
  }
  const initLen = memoryCategories.length;
  memoryCategories = memoryCategories.filter((c) => c.slug !== slug);
  return memoryCategories.length < initLen || !!db;
}

export async function updateSiteConfig(newConfig: Partial<SiteConfig>): Promise<SiteConfig> {
  const db = await connectToDatabase();
  if (db) {
    await ensureDatabaseSeeded();
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
  memorySiteConfig = { ...memorySiteConfig, ...newConfig };
  return memorySiteConfig;
}

export async function updateHomepageData(newData: Partial<HomepageContent>): Promise<HomepageContent> {
  memoryHomepageContent = { ...memoryHomepageContent, ...newData };
  return memoryHomepageContent;
}
