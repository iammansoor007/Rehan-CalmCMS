export type Role = "administrator" | "editor" | "author" | "contributor";

export type Capability =
  | "edit_others_posts"
  | "publish_posts"
  | "manage_categories"
  | "upload_files"
  | "manage_media"
  | "manage_pages"
  | "manage_users"
  | "manage_settings"
  | "view_leads";

export const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "administrator",
    label: "Administrator",
    description: "Full access: users, pages, homepage, branding, and everything below.",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Publishes and manages all posts, pages, categories, media, and inbox.",
  },
  {
    value: "author",
    label: "Author",
    description: "Writes, publishes, and manages their own posts. Can upload images.",
  },
  {
    value: "contributor",
    label: "Contributor",
    description: "Writes their own posts as drafts only. Cannot publish or upload.",
  },
];

const ALL: Capability[] = [
  "edit_others_posts",
  "publish_posts",
  "manage_categories",
  "upload_files",
  "manage_media",
  "manage_pages",
  "manage_users",
  "manage_settings",
  "view_leads",
];

const ROLE_CAPS: Record<Role, Capability[]> = {
  administrator: ALL,
  editor: [
    "edit_others_posts",
    "publish_posts",
    "manage_categories",
    "upload_files",
    "manage_media",
    "manage_pages",
    "view_leads",
  ],
  author: ["publish_posts", "upload_files"],
  contributor: [],
};

/** Maps stored role strings (including the legacy "admin") onto a known role. */
export function normalizeRole(role?: string | null): Role {
  if (role === "admin" || role === "administrator") return "administrator";
  if (role === "editor" || role === "author" || role === "contributor") return role;
  return "contributor";
}

export function capabilitiesFor(role: Role): Capability[] {
  return ROLE_CAPS[role];
}

export function can(role: Role | undefined, cap: Capability): boolean {
  return !!role && ROLE_CAPS[role].includes(cap);
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.value === role)?.label || role;
}
