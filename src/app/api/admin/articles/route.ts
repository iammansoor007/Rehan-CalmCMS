import { NextResponse } from "next/server";
import { getArticles, saveArticle, deleteArticle, slugify } from "@/lib/cms/client";
import { errorResponse } from "@/lib/cms/errors";
import { authorize } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { sanitizeContent } from "@/lib/sanitize";
import { cleanSeo } from "@/lib/seoShared";
import { Article } from "@/types/cms";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;
  const { session } = auth;

  const articles = await getArticles({ includeAll: true });
  // Authors and contributors only see their own posts.
  const visible = can(session.role, "edit_others_posts")
    ? articles
    : articles.filter((a) => a.authorId === session.username);
  return NextResponse.json(visible);
}

export async function POST(req: Request) {
  const auth = await authorize();
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const body: Article = await req.json();
    const originalSlug = new URL(req.url).searchParams.get("original") || undefined;

    const slug = slugify(body.slug || "");
    if (!body.title?.trim() || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const all = await getArticles({ includeAll: true });
    const existing = originalSlug ? all.find((a) => a.slug === originalSlug) : undefined;
    if (originalSlug && !existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing) {
      const isOwn = existing.authorId === session.username;
      if (!isOwn && !can(session.role, "edit_others_posts")) {
        return NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 });
      }
      if (!can(session.role, "publish_posts") && existing.status !== "draft") {
        return NextResponse.json(
          { error: "You cannot edit a post that is already published." },
          { status: 403 }
        );
      }
    }

    // Contributors can only ever save drafts.
    let status = can(session.role, "publish_posts") ? body.status || "published" : "draft";
    let scheduledAt: string | undefined;
    let date = body.date || existing?.date || formatDate(Date.now());

    if (status === "scheduled") {
      const when = new Date(body.scheduledAt || "").getTime();
      if (Number.isNaN(when)) {
        return NextResponse.json(
          { error: "Pick a valid date and time to schedule this post." },
          { status: 400 }
        );
      }
      date = formatDate(when);
      if (when <= Date.now()) status = "published";
      else scheduledAt = new Date(when).toISOString();
    }

    const seo = cleanSeo(body.seo);
    const article: Article = {
      slug,
      title: body.title.trim(),
      category: body.category,
      date,
      author: body.author || session.displayName,
      authorRole: body.authorRole || "",
      authorId: existing?.authorId || session.username,
      img: body.img || "",
      imgAlt: body.imgAlt || "",
      intro: body.intro || "",
      content: sanitizeContent(body.content),
      quickSummary: body.quickSummary || "",
      keyBenefits: body.keyBenefits || [],
      sections: body.sections || [],
      dataTable: body.dataTable,
      safeSteps: body.safeSteps,
      callout: body.callout || "",
      relatedSlugs: body.relatedSlugs || [],
      status,
      scheduledAt,
      seo,
      // Legacy fields stay in step with the SEO panel so older code paths keep working.
      metaTitle: seo.title || "",
      metaDescription: seo.description || "",
      keywords: seo.focusKeyword ? [seo.focusKeyword] : [],
      canonicalUrl: seo.canonical || "",
      ogImage: seo.ogImage || "",
    };

    const saved = await saveArticle(article, originalSlug);
    return NextResponse.json(saved);
  } catch (error) {
    return errorResponse(error, "Failed to save article");
  }
}

export async function DELETE(req: Request) {
  const auth = await authorize();
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const all = await getArticles({ includeAll: true });
    const existing = all.find((a) => a.slug === slug);
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const isOwn = existing.authorId === session.username;
    const canDeleteOwn = isOwn && (existing.status === "draft" || can(session.role, "publish_posts"));
    if (!can(session.role, "edit_others_posts") && !canDeleteOwn) {
      return NextResponse.json({ error: "You cannot delete this post." }, { status: 403 });
    }

    const success = await deleteArticle(slug);
    return NextResponse.json({ success });
  } catch (error) {
    return errorResponse(error, "Failed to delete article");
  }
}
