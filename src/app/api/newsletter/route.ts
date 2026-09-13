import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SubscriberModel } from "@/models/Subscriber";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await SubscriberModel.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { email: email.toLowerCase().trim() },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: "Thank you for subscribing!" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Failed to process subscription." }, { status: 500 });
  }
}
