import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { deletePage, getPages, savePage } from "@/lib/cms/pages";
import { errorResponse } from "@/lib/cms/errors";
import { sanitizeContent } from "@/lib/sanitize";
import { cleanSeo } from "@/lib/seoShared";
import { CmsPage } from "@/types/cms";

export async function GET() {
  const auth = await authorize("manage_pages");
  if (auth.error) return auth.error;
  return NextResponse.json(await getPages({ includeAll: true }));
}

export async function POST(req: Request) {
  const auth = await authorize("manage_pages");
  if (auth.error) return auth.error;

  try {
    const body: CmsPage = await req.json();
    const originalSlug = new URL(req.url).searchParams.get("original") || undefined;

    const seo = cleanSeo(body.seo);
    const page: CmsPage = {
      slug: body.slug || "",
      title: body.title || "",
      content: sanitizeContent(body.content),
      status: body.status === "draft" ? "draft" : "published",
      img: body.img || "",
      imgAlt: body.imgAlt || "",
      seo,
      metaTitle: seo.title || "",
      metaDescription: seo.description || "",
      author: body.author || auth.session.displayName,
    };

    return NextResponse.json(await savePage(page, originalSlug));
  } catch (error) {
    return errorResponse(error, "Failed to save page");
  }
}

export async function DELETE(req: Request) {
  const auth = await authorize("manage_pages");
  if (auth.error) return auth.error;

  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    return NextResponse.json({ success: await deletePage(slug) });
  } catch (error) {
    return errorResponse(error, "Failed to delete page");
  }
}
