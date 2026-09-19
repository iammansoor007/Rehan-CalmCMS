import fs from "fs";
import path from "path";
import {
  Article,
  Category,
  CmsPage,
  HomepageContent,
  MediaItem,
  SiteConfig,
} from "@/types/cms";
import type { Role } from "@/lib/permissions";
import { articlesData } from "./data/articles";
import { categoriesData } from "./data/categories";
import { siteConfig as defaultSiteConfig } from "./data/siteConfig";
import { hashPassword } from "@/lib/password";
import { BOOTSTRAP_ADMIN } from "@/lib/bootstrapAdmin";

export interface StoredUser {
  id: string;
  username: string;
  password: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
}

export interface Store {
  articles: Article[];
  categories: Category[];
  pages: CmsPage[];
  users: StoredUser[];
  media: MediaItem[];
  siteConfig: SiteConfig;
  /** Legacy location of the homepage overrides (now stored under content.homepage). */
  homepage: Partial<HomepageContent> | null;
  /** Admin edits for the editable pages/menus, keyed by content key. */
  content: Record<string, unknown>;
}

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

function bootstrapUsers(): StoredUser[] {
  return [
    {
      id: "bootstrap-admin",
      username: BOOTSTRAP_ADMIN.username,
      password: hashPassword(BOOTSTRAP_ADMIN.password),
      email: BOOTSTRAP_ADMIN.email,
      displayName: BOOTSTRAP_ADMIN.displayName,
      role: "administrator",
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Local development store used when MONGODB_URI is not set. It lives in a JSON
 * file rather than in module memory because Next.js compiles pages and API
 * routes into separate bundles that do not share module state.
 */
export function readStore(): Store {
  let saved: Partial<Store> | null = null;
  try {
    saved = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch {
    saved = null;
  }

  const store: Store = {
    articles: saved?.articles ?? articlesData.map((a) => ({ ...a, status: "published" as const })),
    categories: saved?.categories ?? [...categoriesData],
    pages: saved?.pages ?? [],
    users: saved?.users?.length ? saved.users : bootstrapUsers(),
    media: saved?.media ?? [],
    siteConfig: saved?.siteConfig ?? { ...defaultSiteConfig },
    homepage: saved?.homepage ?? null,
    content: saved?.content ?? {},
  };
  if (!saved) writeStore(store);
  return store;
}

export function writeStore(store: Store) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, STORE_FILE);
}

/** Read-modify-write helper so callers can't forget to persist. */
export function updateStore<T>(mutate: (store: Store) => T): T {
  const store = readStore();
  const result = mutate(store);
  writeStore(store);
  return result;
}
