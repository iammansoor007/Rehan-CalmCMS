import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { createUser, deleteUser, listUsers, updateUser } from "@/lib/cms/users";
import { errorResponse } from "@/lib/cms/errors";
import { ROLES, normalizeRole } from "@/lib/permissions";

function parseRole(value: unknown) {
  const known = ROLES.some((r) => r.value === value);
  return known ? normalizeRole(String(value)) : undefined;
}

export async function GET() {
  const auth = await authorize("manage_users");
  if (auth.error) return auth.error;
  return NextResponse.json(await listUsers());
}

export async function POST(req: Request) {
  const auth = await authorize("manage_users");
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const role = parseRole(body.role);
    if (!role) return NextResponse.json({ error: "Please choose a valid role." }, { status: 400 });

    const user = await createUser({
      username: String(body.username || "").trim(),
      email: String(body.email || "").trim(),
      displayName: String(body.displayName || "").trim(),
      role,
      password: String(body.password || ""),
    });
    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error, "Failed to create user");
  }
}

export async function PUT(req: Request) {
  const auth = await authorize("manage_users");
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "User id is required" }, { status: 400 });

    const role = body.role === undefined ? undefined : parseRole(body.role);
    if (body.role !== undefined && !role) {
      return NextResponse.json({ error: "Please choose a valid role." }, { status: 400 });
    }

    const user = await updateUser(
      String(body.id),
      {
        email: body.email === undefined ? undefined : String(body.email).trim(),
        displayName: body.displayName === undefined ? undefined : String(body.displayName).trim(),
        role,
        password: body.password ? String(body.password) : undefined,
      },
      auth.session.username
    );
    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error, "Failed to update user");
  }
}

export async function DELETE(req: Request) {
  const auth = await authorize("manage_users");
  if (auth.error) return auth.error;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User id is required" }, { status: 400 });
    await deleteUser(id, auth.session.username);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Failed to delete user");
  }
}
