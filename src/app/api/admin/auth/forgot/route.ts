import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/cms/users";
import { errorResponse } from "@/lib/cms/errors";

/**
 * "Forgot password" (no login required). Always answers the same way so the form
 * can't be used to find out which usernames exist.
 */
export async function POST(req: Request) {
  try {
    const { account } = await req.json();
    await requestPasswordReset(String(account || ""));
    return NextResponse.json({
      success: true,
      message:
        "If that account exists, a reset request has been sent to your site administrator. They will send you a link to choose a new password.",
    });
  } catch (error) {
    return errorResponse(error, "Could not send the reset request");
  }
}
