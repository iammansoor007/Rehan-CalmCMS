import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InquiryModel } from "@/models/Inquiry";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await InquiryModel.create({
        name: name.trim(),
        email: email.trim(),
        subject: subject || "General Inquiry",
        message: message.trim(),
      });
    }

    return NextResponse.json({ success: true, message: "Inquiry received successfully!" });
  } catch (error) {
    console.error("Inquiry error:", error);
    return NextResponse.json({ error: "Failed to save inquiry." }, { status: 500 });
  }
}
