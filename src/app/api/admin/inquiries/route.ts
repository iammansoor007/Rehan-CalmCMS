import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { InquiryModel } from "@/models/Inquiry";

export async function GET() {
  const auth = await authorize("view_leads");
  if (auth.error) return auth.error;

  try {
    const db = await connectToDatabase();
    if (db) {
      const inquiries = await InquiryModel.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json(inquiries);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await authorize("view_leads");
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const db = await connectToDatabase();
    if (db && id) {
      await InquiryModel.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
