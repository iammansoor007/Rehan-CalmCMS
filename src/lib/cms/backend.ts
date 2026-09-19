import { connectToDatabase } from "@/lib/mongodb";
import { ensureDatabaseSeeded } from "@/lib/dbSeeder";

/**
 * True when MongoDB is configured (and seeded). Otherwise the CMS falls back to
 * the local JSON file store, so content persists across restarts in development.
 */
export async function hasMongo(): Promise<boolean> {
  const db = await connectToDatabase();
  if (!db) return false;
  await ensureDatabaseSeeded();
  return true;
}
