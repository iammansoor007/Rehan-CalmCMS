import { NextResponse } from "next/server";
import { getCategories, saveCategory, deleteCategory, getArticles } from "@/lib/cms/client";
import { errorResponse } from "@/lib/cms/errors";
import { authorize } from "@/lib/auth";
import { Category } from "@/types/cms";
import { cleanSeo } from "@/lib/seoShared";

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticles({ includeAll: true }),
  ]);

  const categoriesWithCounts = categories.map((cat) => {
    const count = articles.filter(
      (a) => a.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
    ).length;
    return { ...cat, count };
  });

  return NextResponse.json(categoriesWithCounts);
}

export async function POST(req: Request) {
  const auth = await authorize("manage_categories");
  if (auth.error) return auth.error;

  try {
    const body: Category = await req.json();
    const originalSlug = new URL(req.url).searchParams.get("original") || undefined;
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Category name and slug are required" }, { status: 400 });
    }
    const saved = await saveCategory({ ...body, seo: cleanSeo(body.seo) }, originalSlug);
    return NextResponse.json(saved);
  } catch (error) {
    return errorResponse(error, "Failed to save category");
  }
}

export async function DELETE(req: Request) {
  const auth = await authorize("manage_categories");
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }
    const success = await deleteCategory(slug);
    return NextResponse.json({ success });
  } catch (error) {
    return errorResponse(error, "Failed to delete category");
  }
}
