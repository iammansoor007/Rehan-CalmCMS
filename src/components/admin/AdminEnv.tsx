"use client";

import { createContext, useContext } from "react";
import { Category, MediaItem } from "@/types/cms";

export interface LinkSuggestion {
  label: string;
  href: string;
}

/** Shared lookups the content editors need (media library, categories, internal URLs). */
export interface AdminEnv {
  media: MediaItem[];
  canUpload: boolean;
  onMediaChanged: () => void;
  categories: Category[];
  linkSuggestions: LinkSuggestion[];
}

export const AdminEnvContext = createContext<AdminEnv>({
  media: [],
  canUpload: false,
  onMediaChanged: () => {},
  categories: [],
  linkSuggestions: [],
});

export const useAdminEnv = () => useContext(AdminEnvContext);
