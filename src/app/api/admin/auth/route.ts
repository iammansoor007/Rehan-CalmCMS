import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseSeeded } from "@/lib/dbSeeder";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    await connectToDatabase();
    await ensureDatabaseSeeded();

    // Check against MongoDB or default credentials
    let isAuthenticated = false;

    if (username === "rehanblogsite" && password === "rehanblogsite@2026adsense") {
      isAuthenticated = true;
    } else {
      const user = await User.findOne({ username, password });
      if (user) isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Set cookie
    cookies().set("calmtouch_admin_session", "authenticated_rehanblogsite", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json({ success: true, user: { username } });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = cookies().get("calmtouch_admin_session")?.value;
  if (session === "authenticated_rehanblogsite") {
    return NextResponse.json({ authenticated: true, user: { username: "rehanblogsite" } });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  cookies().delete("calmtouch_admin_session");
  return NextResponse.json({ success: true });
}
