import crypto from "crypto";
import { CmsUser } from "@/types/cms";
import { Role, normalizeRole } from "@/lib/permissions";
import { hashPassword, isHashed, verifyPassword } from "@/lib/password";
import { User } from "@/models/User";
import { hasMongo } from "./backend";
import { CmsError } from "./errors";
import { StoredUser, readStore, updateStore } from "./store";

export interface UserInput {
  username: string;
  email: string;
  displayName: string;
  role: Role;
  password?: string;
}

function toPublic(u: StoredUser): CmsUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email || "",
    displayName: u.displayName || u.username,
    role: normalizeRole(u.role),
    createdAt: u.createdAt,
  };
}

async function loadUsers(): Promise<StoredUser[]> {
  if (await hasMongo()) {
    const docs = await User.find().sort({ createdAt: 1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      username: d.username,
      password: d.password,
      email: d.email || "",
      displayName: d.displayName || "",
      role: normalizeRole(d.role),
      createdAt: new Date(d.createdAt).toISOString(),
    }));
  }
  return readStore().users;
}

export async function listUsers(): Promise<CmsUser[]> {
  return (await loadUsers()).map(toPublic);
}

export async function findUserRecord(username: string): Promise<StoredUser | null> {
  const users = await loadUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/** Returns the user when the credentials are valid; upgrades legacy plaintext passwords. */
export async function verifyLogin(username: string, password: string): Promise<StoredUser | null> {
  const user = await findUserRecord(username);
  if (!user || !verifyPassword(password, user.password)) return null;
  if (!isHashed(user.password)) {
    await setPasswordHash(user.id, hashPassword(password));
  }
  return user;
}

async function setPasswordHash(id: string, hash: string) {
  if (await hasMongo()) {
    await User.findByIdAndUpdate(id, { password: hash });
  } else {
    updateStore((s) => {
      const u = s.users.find((x) => x.id === id);
      if (u) u.password = hash;
    });
  }
}

function validate(input: Partial<UserInput>, creating: boolean) {
  if (creating) {
    if (!input.username || !/^[a-zA-Z0-9._-]{3,32}$/.test(input.username)) {
      throw new CmsError(
        400,
        "Username must be 3-32 characters: letters, numbers, dots, dashes or underscores."
      );
    }
  }
  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) {
    throw new CmsError(400, "Please enter a valid email address.");
  }
  if (creating || input.password) {
    if (!input.password || input.password.length < 8) {
      throw new CmsError(400, "Password must be at least 8 characters.");
    }
  }
}

export async function createUser(input: UserInput): Promise<CmsUser> {
  validate(input, true);
  if (await findUserRecord(input.username)) {
    throw new CmsError(409, "That username is already taken.");
  }
  const record: StoredUser = {
    id: crypto.randomUUID(),
    username: input.username,
    password: hashPassword(input.password as string),
    email: input.email || "",
    displayName: input.displayName || input.username,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  if (await hasMongo()) {
    const doc = await User.create({
      username: record.username,
      password: record.password,
      email: record.email,
      displayName: record.displayName,
      role: record.role,
    });
    record.id = String(doc._id);
  } else {
    updateStore((s) => s.users.push(record));
  }
  return toPublic(record);
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<UserInput, "username">>,
  actingUsername: string
): Promise<CmsUser> {
  validate(patch, false);
  const users = await loadUsers();
  const target = users.find((u) => u.id === id);
  if (!target) throw new CmsError(404, "User not found.");

  const nextRole = patch.role ?? normalizeRole(target.role);
  if (normalizeRole(target.role) === "administrator" && nextRole !== "administrator") {
    const admins = users.filter((u) => normalizeRole(u.role) === "administrator");
    if (admins.length <= 1) {
      throw new CmsError(400, "There must be at least one administrator.");
    }
    if (target.username === actingUsername) {
      throw new CmsError(400, "You cannot remove your own administrator role.");
    }
  }

  const updated: StoredUser = {
    ...target,
    email: patch.email ?? target.email,
    displayName: patch.displayName || target.displayName,
    role: nextRole,
    password: patch.password ? hashPassword(patch.password) : target.password,
  };

  if (await hasMongo()) {
    await User.findByIdAndUpdate(id, {
      email: updated.email,
      displayName: updated.displayName,
      role: updated.role,
      password: updated.password,
    });
  } else {
    updateStore((s) => {
      const i = s.users.findIndex((u) => u.id === id);
      if (i >= 0) s.users[i] = updated;
    });
  }
  return toPublic(updated);
}

export async function deleteUser(id: string, actingUsername: string): Promise<void> {
  const users = await loadUsers();
  const target = users.find((u) => u.id === id);
  if (!target) throw new CmsError(404, "User not found.");
  if (target.username === actingUsername) {
    throw new CmsError(400, "You cannot delete your own account.");
  }
  if (normalizeRole(target.role) === "administrator") {
    const admins = users.filter((u) => normalizeRole(u.role) === "administrator");
    if (admins.length <= 1) throw new CmsError(400, "There must be at least one administrator.");
  }
  if (await hasMongo()) {
    await User.findByIdAndDelete(id);
  } else {
    updateStore((s) => {
      s.users = s.users.filter((u) => u.id !== id);
    });
  }
}
