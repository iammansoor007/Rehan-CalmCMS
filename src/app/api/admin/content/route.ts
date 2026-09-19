import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import {
  CONTENT_DEFAULTS,
  getContent,
  isContentKey,
  resetContent,
  saveContent,
} from "@/lib/cms/content";
import { errorResponse } from "@/lib/cms/errors";

/** Editable site content: homepage, about, contact, menus, footer, sidebar and templates. */

export async function GET(req: Request) {
  const auth = await authorize("manage_settings");
  if (auth.error) return auth.error;

  const key = new URL(req.url).searchParams.get("key") || "";
  if (!isContentKey(key)) return NextResponse.json({ error: "Unknown content block" }, { status: 400 });

  try {
    return NextResponse.json({ data: await getContent(key), defaults: CONTENT_DEFAULTS[key] });
  } catch (error) {
    return errorResponse(error, "Failed to load content");
  }
}

export async function POST(req: Request) {
  const auth = await authorize("manage_settings");
  if (auth.error) return auth.error;

  try {
    const { key, data } = await req.json();
    if (!isContentKey(String(key))) {
      return NextResponse.json({ error: "Unknown content block" }, { status: 400 });
    }
    await saveContent(key, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Failed to save content");
  }
}

/** Reset a block back to the built-in text. */
export async function DELETE(req: Request) {
  const auth = await authorize("manage_settings");
  if (auth.error) return auth.error;

  const key = new URL(req.url).searchParams.get("key") || "";
  if (!isContentKey(key)) return NextResponse.json({ error: "Unknown content block" }, { status: 400 });

  try {
    await resetContent(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Failed to reset content");
  }
}
