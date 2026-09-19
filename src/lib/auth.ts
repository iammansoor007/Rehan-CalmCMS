import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Capability, Role, can, normalizeRole } from "./permissions";
import { findUserRecord } from "./cms/users";

export const SESSION_COOKIE = "calmtouch_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface Session {
  username: string;
  displayName: string;
  email: string;
  role: Role;
}

function secret(): string {
  return process.env.ADMIN_SECRET_KEY || process.env.MONGODB_URI || "calmtouch-dev-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.u !== "string" || typeof data.exp !== "number" || data.exp < Date.now()) {
      return null;
    }
    return data.u;
  } catch {
    return null;
  }
}

export function setSessionCookie(username: string) {
  cookies().set(SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "strict",
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Resolves the logged-in user. The role is re-read from the user store on every
 * call, so demoting or deleting a user takes effect immediately.
 */
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const username = readSessionToken(token);
  if (!username) return null;
  const user = await findUserRecord(username);
  if (!user) return null;
  return {
    username: user.username,
    displayName: user.displayName || user.username,
    email: user.email || "",
    role: normalizeRole(user.role),
  };
}

type AuthResult =
  | { session: Session; error?: undefined }
  | { session?: undefined; error: NextResponse };

/** Guard for admin API routes: 401 when logged out, 403 when the role lacks `cap`. */
export async function authorize(cap?: Capability): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  }
  if (cap && !can(session.role, cap)) {
    return {
      error: NextResponse.json(
        { error: "You do not have permission to do that." },
        { status: 403 }
      ),
    };
  }
  return { session };
}
