import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/cms/users";
import { setSessionCookie } from "@/lib/auth";
import { errorResponse } from "@/lib/cms/errors";

/** Completes a password reset from a link, then logs the person in. */
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    const user = await resetPasswordWithToken(String(token || ""), String(password || ""));
    setSessionCookie(user.username);
    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    return errorResponse(error, "Could not reset the password");
  }
}
