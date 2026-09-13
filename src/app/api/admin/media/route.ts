import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { MediaModel } from "@/models/Media";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const records = await MediaModel.find().sort({ createdAt: -1 }).lean();
      if (records.length > 0) {
        return NextResponse.json(records);
      }
    }

    // Fallback: read filesystem public/uploads and public/assets/images
    const mediaList: { filename: string; url: string; createdAt: Date }[] = [];

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      const uploadFiles = await fs.readdir(uploadsDir);
      for (const f of uploadFiles) {
        mediaList.push({
          filename: f,
          url: `/uploads/${f}`,
          createdAt: new Date(),
        });
      }
    } catch {}

    const imagesDir = path.join(process.cwd(), "public", "assets", "images");
    try {
      const imageFiles = await fs.readdir(imagesDir);
      for (const f of imageFiles) {
        mediaList.push({
          filename: f,
          url: `/assets/images/${f}`,
          createdAt: new Date(),
        });
      }
    } catch {}

    return NextResponse.json(mediaList);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
