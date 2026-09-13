import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { MediaModel } from "@/models/Media";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}_${originalName}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    // Optionally save to MongoDB Media library
    try {
      const db = await connectToDatabase();
      if (db) {
        await MediaModel.create({
          filename: originalName,
          url: fileUrl,
          size: file.size,
          mimetype: file.type,
        });
      }
    } catch (e) {
      console.warn("Could not save media record to MongoDB:", e);
    }

    return NextResponse.json({ url: fileUrl, filename: originalName });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
