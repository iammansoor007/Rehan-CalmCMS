import { promises as fs } from "fs";
import path from "path";
import { MediaItem } from "@/types/cms";
import { MediaModel } from "@/models/Media";
import { hasMongo } from "./backend";
import { CmsError } from "./errors";
import { readStore, updateStore } from "./store";

/** Folders under /public that make up the media library. */
const ROOTS = [
  { url: "/uploads", dir: path.join(process.cwd(), "public", "uploads") },
  { url: "/assets/images", dir: path.join(process.cwd(), "public", "assets", "images") },
];

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export const ALLOWED_UPLOAD_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
];

export function mimeFromName(name: string): string {
  return MIME_BY_EXT[path.extname(name).toLowerCase()] || "application/octet-stream";
}

/** Resolves a public media URL to a file on disk, refusing anything outside the media folders. */
function resolveMediaPath(url: string): string | null {
  for (const root of ROOTS) {
    if (url.startsWith(`${root.url}/`)) {
      const name = path.basename(url);
      if (name && `${root.url}/${name}` === url) return path.join(root.dir, name);
    }
  }
  return null;
}

async function scanDisk(): Promise<MediaItem[]> {
  const items: MediaItem[] = [];
  for (const root of ROOTS) {
    let files: string[] = [];
    try {
      files = await fs.readdir(root.dir);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!MIME_BY_EXT[path.extname(file).toLowerCase()]) continue;
      try {
        const stat = await fs.stat(path.join(root.dir, file));
        if (!stat.isFile()) continue;
        items.push({
          filename: file,
          url: `${root.url}/${file}`,
          size: stat.size,
          mimetype: mimeFromName(file),
          createdAt: stat.mtime.toISOString(),
        });
      } catch {
        // file vanished between readdir and stat
      }
    }
  }
  return items;
}

async function loadRecords(): Promise<MediaItem[]> {
  if (await hasMongo()) {
    const docs = await MediaModel.find().lean();
    return docs.map((d) => ({
      id: String(d._id),
      filename: d.filename,
      url: d.url,
      size: d.size,
      mimetype: d.mimetype,
      alt: d.alt || "",
      title: d.title || "",
      caption: d.caption || "",
      description: d.description || "",
      createdAt: new Date(d.createdAt).toISOString(),
    }));
  }
  return readStore().media;
}

/** Library contents: every image on disk, enriched with any saved SEO details. */
export async function listMedia(): Promise<MediaItem[]> {
  const [disk, records] = await Promise.all([scanDisk(), loadRecords()]);
  const byUrl = new Map(records.map((r) => [r.url, r]));

  const merged = disk.map((file) => {
    const record = byUrl.get(file.url);
    return record ? { ...file, ...record, size: file.size, createdAt: record.createdAt || file.createdAt } : file;
  });

  return merged.sort((a, b) => {
    const aUpload = a.url.startsWith("/uploads/") ? 1 : 0;
    const bUpload = b.url.startsWith("/uploads/") ? 1 : 0;
    if (aUpload !== bUpload) return bUpload - aUpload;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

type MediaDetails = Pick<MediaItem, "alt" | "title" | "caption" | "description">;

async function upsertRecord(item: MediaItem) {
  if (await hasMongo()) {
    await MediaModel.findOneAndUpdate({ url: item.url }, item, { upsert: true, new: true });
  } else {
    updateStore((s) => {
      const idx = s.media.findIndex((m) => m.url === item.url);
      if (idx >= 0) s.media[idx] = { ...s.media[idx], ...item };
      else s.media.push(item);
    });
  }
}

/** Records a freshly uploaded file. */
export async function recordUpload(item: MediaItem) {
  await upsertRecord({ ...item, alt: "", title: "", caption: "", description: "" });
}

/** Saves alt text / title / caption / description for a library image. */
export async function updateMediaDetails(url: string, details: MediaDetails): Promise<MediaItem> {
  const filePath = resolveMediaPath(url);
  if (!filePath) throw new CmsError(400, "Unknown media file.");
  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat) throw new CmsError(404, "That file no longer exists.");

  const item: MediaItem = {
    filename: path.basename(filePath),
    url,
    size: stat.size,
    mimetype: mimeFromName(filePath),
    alt: (details.alt || "").trim(),
    title: (details.title || "").trim(),
    caption: (details.caption || "").trim(),
    description: (details.description || "").trim(),
    createdAt: stat.mtime.toISOString(),
  };
  await upsertRecord(item);
  return item;
}

/** Deletes files from disk and drops their library records. */
export async function deleteMedia(urls: string[]): Promise<number> {
  let removed = 0;
  for (const url of urls) {
    const filePath = resolveMediaPath(url);
    if (!filePath) continue;
    try {
      await fs.unlink(filePath);
      removed += 1;
    } catch {
      // already gone — still clear the record below
    }
  }
  const valid = urls.filter((u) => resolveMediaPath(u));
  if (await hasMongo()) {
    await MediaModel.deleteMany({ url: { $in: valid } });
  } else {
    updateStore((s) => {
      s.media = s.media.filter((m) => !valid.includes(m.url));
    });
  }
  return removed;
}
