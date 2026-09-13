import { NextResponse } from "next/server";
import { getCategories, saveCategory, deleteCategory, getArticles } from "@/lib/cms/client";
import { Category } from "@/types/cms";

export async function GET() {
  const [categories, articles] = await Promise.all([getCategories(), getArticles()]);

  const categoriesWithCounts = categories.map((cat) => {
    const count = articles.filter(
      (a) => a.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
    ).length;
    return { ...cat, count };
  });

  return NextResponse.json(categoriesWithCounts);
}

export async function POST(req: Request) {
  try {
    const body: Category = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Category name and slug are required" }, { status: 400 });
    }
    const saved = await saveCategory(body);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }
    const success = await deleteCategory(slug);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
