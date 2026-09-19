import { NextResponse } from "next/server";
import { authorize, clearSessionCookie, getSession, setSessionCookie } from "@/lib/auth";
import { capabilitiesFor } from "@/lib/permissions";
import { verifyPassword } from "@/lib/password";
import { findUserRecord, updateUser, verifyLogin } from "@/lib/cms/users";
import { errorResponse } from "@/lib/cms/errors";

function sessionPayload(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  return {
    username: session.username,
    displayName: session.displayName,
    email: session.email,
    role: session.role,
    capabilities: capabilitiesFor(session.role),
  };
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const user = await verifyLogin(String(username), String(password));
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    setSessionCookie(user.username);
    const session = await getSession();
    return NextResponse.json({ success: true, user: session ? sessionPayload(session) : null });
  } catch (error) {
    return errorResponse(error, "Authentication failed");
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, user: sessionPayload(session) });
}

/** "My Profile": lets any logged-in user change their own name, email and password. */
export async function PUT(req: Request) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const record = await findUserRecord(auth.session.username);
    if (!record) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    if (body.newPassword) {
      if (!verifyPassword(String(body.currentPassword || ""), record.password)) {
        return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
      }
    }

    await updateUser(
      record.id,
      {
        displayName: body.displayName,
        email: body.email,
        password: body.newPassword || undefined,
      },
      auth.session.username
    );
    const session = await getSession();
    return NextResponse.json({ success: true, user: session ? sessionPayload(session) : null });
  } catch (error) {
    return errorResponse(error, "Failed to update profile");
  }
}

export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ success: true });
}
