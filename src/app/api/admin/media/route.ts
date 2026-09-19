import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { deleteMedia, listMedia, updateMediaDetails } from "@/lib/cms/media";
import { errorResponse } from "@/lib/cms/errors";

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;

  try {
    return NextResponse.json(await listMedia());
  } catch (error) {
    return errorResponse(error, "Failed to fetch media");
  }
}

/** Saves alt text, title, caption and description for one image. */
export async function PUT(req: Request) {
  const auth = await authorize("manage_media");
  if (auth.error) return auth.error;

  try {
    const { url, alt, title, caption, description } = await req.json();
    if (!url) return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
    const item = await updateMediaDetails(String(url), { alt, title, caption, description });
    return NextResponse.json(item);
  } catch (error) {
    return errorResponse(error, "Failed to update media");
  }
}

/** Permanently deletes one or more images (body: { urls: string[] }). */
export async function DELETE(req: Request) {
  const auth = await authorize("manage_media");
  if (auth.error) return auth.error;

  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "No files selected" }, { status: 400 });
    }
    const removed = await deleteMedia(urls.map(String));
    return NextResponse.json({ success: true, removed });
  } catch (error) {
    return errorResponse(error, "Failed to delete media");
  }
}
