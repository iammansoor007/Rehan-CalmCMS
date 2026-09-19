import crypto from "crypto";

const PREFIX = "scrypt";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${PREFIX}$${salt}$${hash}`;
}

export function isHashed(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`);
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verifies a password against a stored value. Accounts created by older
 * versions of the CMS stored the password as plaintext; those still verify
 * here so nobody is locked out, and callers re-hash them on successful login.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  if (!isHashed(stored)) {
    return safeEqual(Buffer.from(password), Buffer.from(stored));
  }
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return safeEqual(candidate, Buffer.from(hash, "hex"));
}
