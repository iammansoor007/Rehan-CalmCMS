import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { cancelPasswordReset, getPendingResetToken } from "@/lib/cms/users";
import { errorResponse } from "@/lib/cms/errors";
import { getSeoContext } from "@/lib/seo";

/** Administrators fetch (to copy) or cancel a user's pending password-reset link. */
export async function GET(req: Request) {
  const auth = await authorize("manage_users");
  if (auth.error) return auth.error;

  try {
    const id = new URL(req.url).searchParams.get("id") || "";
    const token = await getPendingResetToken(id);
    if (!token) return NextResponse.json({ error: "No pending reset request for this user." }, { status: 404 });
    // Build the link on the address the admin is actually using (works on localhost and
    // staging too); fall back to the configured site URL if the request URL is unusable.
    let origin = "";
    try {
      origin = new URL(req.url).origin;
    } catch {
      origin = (await getSeoContext()).baseUrl;
    }
    return NextResponse.json({ url: `${origin.replace(/\/+$/, "")}/admin?reset=${token}` });
  } catch (error) {
    return errorResponse(error, "Could not load the reset link");
  }
}

export async function DELETE(req: Request) {
  const auth = await authorize("manage_users");
  if (auth.error) return auth.error;

  try {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "User id is required" }, { status: 400 });
    await cancelPasswordReset(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Could not cancel the reset request");
  }
}
