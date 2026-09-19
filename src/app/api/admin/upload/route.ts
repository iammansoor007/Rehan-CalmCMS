import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { authorize } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { ALLOWED_UPLOAD_TYPES, mimeFromName, recordUpload } from "@/lib/cms/media";
import { errorResponse } from "@/lib/cms/errors";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const auth = await authorize("upload_files");
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Trust the extension over the client-supplied type; SVG can carry scripts,
    // so it is limited to roles that manage the media library.
    const mimetype = mimeFromName(file.name);
    const isSvg = mimetype === "image/svg+xml";
    const allowed = ALLOWED_UPLOAD_TYPES.includes(mimetype) || (isSvg && can(auth.session.role, "manage_media"));
    if (!allowed) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PNG, JPG, GIF, WebP or AVIF image." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image is too large (10 MB maximum)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}_${originalName}`;
    await fs.writeFile(path.join(uploadsDir, uniqueName), buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    await recordUpload({
      filename: originalName,
      url: fileUrl,
      size: file.size,
      mimetype,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ url: fileUrl, filename: originalName });
  } catch (error) {
    return errorResponse(error, "File upload failed");
  }
}
