import { NextResponse } from "next/server";
import { getArticles, saveArticle, deleteArticle } from "@/lib/cms/client";
import { Article } from "@/types/cms";

export async function GET() {
  const articles = await getArticles();
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  try {
    const body: Article = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }
    const saved = await saveArticle(body);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save article" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }
    const success = await deleteArticle(slug);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
