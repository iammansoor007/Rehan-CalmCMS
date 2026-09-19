import { promises as fs } from "fs";
import path from "path";
import { mimeFromName } from "@/lib/cms/media";

export const dynamic = "force-dynamic";

/**
 * Serves files uploaded from the admin panel. Next.js only serves files that existed in
 * /public when the site was built, so images uploaded afterwards would 404 in production.
 * Files that were there at build time are still served directly by Next.
 */
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  // basename() blocks any attempt to walk out of the uploads folder
  const name = path.basename(decodeURIComponent(params.name));
  const type = mimeFromName(name);
  if (!name || type === "application/octet-stream") return new Response("Not found", { status: 404 });

  try {
    const file = await fs.readFile(path.join(process.cwd(), "public", "uploads", name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        // upload names contain a timestamp, so a given URL never changes
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // an SVG opened directly can never run script
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
