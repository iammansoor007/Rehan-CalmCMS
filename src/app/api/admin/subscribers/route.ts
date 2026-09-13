import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SubscriberModel } from "@/models/Subscriber";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const subscribers = await SubscriberModel.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json(subscribers);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const db = await connectToDatabase();
    if (db && id) {
      await SubscriberModel.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
