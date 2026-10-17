"use client";

import { createContext, useContext } from "react";
import { Category, MediaItem } from "@/types/cms";

export interface LinkSuggestion {
  label: string;
  href: string;
}

export interface EntryRef {
  title: string;
  slug: string;
}

/** Shared lookups the content editors need (media library, categories, internal URLs). */
export interface AdminEnv {
  media: MediaItem[];
  canUpload: boolean;
  onMediaChanged: () => void;
  categories: Category[];
  linkSuggestions: LinkSuggestion[];
  /** Pages and posts that can be picked into menus. */
  pages: EntryRef[];
  posts: EntryRef[];
}

export const AdminEnvContext = createContext<AdminEnv>({
  media: [],
  canUpload: false,
  onMediaChanged: () => {},
  categories: [],
  linkSuggestions: [],
  pages: [],
  posts: [],
});

export const useAdminEnv = () => useContext(AdminEnvContext);
