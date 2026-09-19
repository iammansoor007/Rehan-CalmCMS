import { CmsPage } from "@/types/cms";
import { slugify } from "@/lib/slugify";
import { PageModel } from "@/models/Page";
import { hasMongo } from "./backend";
import { CmsError } from "./errors";
import { readStore, updateStore } from "./store";
import { addRedirect } from "./content";
import { foldLegacySeo } from "@/lib/seoShared";

/** URLs that already belong to the app and cannot be claimed by a CMS page. */
const RESERVED_SLUGS = [
  "admin",
  "api",
  "about",
  "contact",
  "blog",
  "category",
  "categories",
  "sitemap",
  "robots",
  "uploads",
  "assets",
  "favicon",
];

type PageSource = Omit<Partial<CmsPage>, "updatedAt"> & {
  slug: string;
  title: string;
  updatedAt?: string | Date;
};

function mapPage(p: PageSource): CmsPage {
  return {
    slug: p.slug,
    title: p.title,
    content: p.content || "",
    status: p.status === "draft" ? "draft" : "published",
    img: p.img || "",
    imgAlt: p.imgAlt || "",
    seo: foldLegacySeo({
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      seo: p.seo,
    }),
    metaTitle: p.metaTitle || "",
    metaDescription: p.metaDescription || "",
    author: p.author || "",
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
  };
}

async function loadPages(): Promise<CmsPage[]> {
  if (await hasMongo()) {
    const docs = await PageModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => mapPage(d));
  }
  return readStore().pages.map(mapPage);
}

export async function getPages(query: { includeAll?: boolean } = {}): Promise<CmsPage[]> {
  const all = await loadPages();
  return query.includeAll ? all : all.filter((p) => p.status === "published");
}

export async function getPageBySlug(
  slug: string,
  query: { includeAll?: boolean } = {}
): Promise<CmsPage | null> {
  const target = slugify(slug);
  const pages = await getPages(query);
  return pages.find((p) => p.slug === target) || null;
}

export async function savePage(page: CmsPage, originalSlug?: string): Promise<CmsPage> {
  const slug = slugify(page.slug);
  if (!page.title.trim() || !slug) throw new CmsError(400, "Title and URL slug are required.");
  if (RESERVED_SLUGS.includes(slug)) {
    throw new CmsError(400, `"${slug}" is used by the site itself. Please choose another slug.`);
  }

  const existing = await loadPages();
  if (originalSlug && !existing.some((p) => p.slug === originalSlug)) {
    throw new CmsError(404, "Page not found.");
  }
  if (slug !== originalSlug && existing.some((p) => p.slug === slug)) {
    throw new CmsError(409, "Another page already uses that slug. Please choose a different one.");
  }

  const next: CmsPage = { ...page, slug, updatedAt: new Date().toISOString() };
  if (await hasMongo()) {
    await PageModel.findOneAndUpdate({ slug: originalSlug || slug }, next, {
      upsert: true,
      new: true,
    });
  } else {
    updateStore((s) => {
      const idx = s.pages.findIndex((p) => p.slug === (originalSlug || slug));
      if (idx >= 0) s.pages[idx] = next;
      else s.pages.unshift(next);
    });
  }
  if (originalSlug && originalSlug !== slug) await addRedirect(`/${originalSlug}`, `/${slug}`);
  return next;
}

export async function deletePage(slug: string): Promise<boolean> {
  if (await hasMongo()) {
    return !!(await PageModel.findOneAndDelete({ slug }));
  }
  return updateStore((s) => {
    const before = s.pages.length;
    s.pages = s.pages.filter((p) => p.slug !== slug);
    return s.pages.length < before;
  });
}
