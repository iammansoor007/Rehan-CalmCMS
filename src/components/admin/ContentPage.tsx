"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/layout/Toast";
import { api, primaryBtnCls, secondaryBtnCls } from "./shared";

interface ContentPageProps<T> {
  /** Content block key understood by /api/admin/content. */
  contentKey: string;
  title: string;
  description: string;
  /** Public URL to open after saving. */
  viewHref?: string;
  children: (ctx: { data: T; setData: React.Dispatch<React.SetStateAction<T>> }) => React.ReactNode;
}

/**
 * Shared shell for the "edit a whole page" screens: loads the content block, keeps an
 * editable copy, and offers Save / Reset with an unsaved-changes guard.
 */
export function ContentPage<T>({
  contentKey,
  title,
  description,
  viewHref,
  children,
}: ContentPageProps<T>) {
  const { showToast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const saved = useRef("");
  const [, bump] = useState(0);

  const load = useCallback(async () => {
    setError("");
    const res = await api<{ data: T }>(`/api/admin/content?key=${contentKey}`);
    if (res.ok && res.data) {
      saved.current = JSON.stringify(res.data.data);
      setData(res.data.data);
      bump((n) => n + 1);
    } else {
      setError(res.error);
    }
  }, [contentKey]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = data !== null && JSON.stringify(data) !== saved.current;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const res = await api("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({ key: contentKey, data }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved! Your changes are live on the site.");
      if (contentKey === "seo") window.dispatchEvent(new Event("cms:seo-saved"));
      await load();
    } else {
      showToast(res.error);
    }
  };

  const reset = async () => {
    if (!confirm("Reset this whole page to the original built-in text? Your edits here will be lost.")) return;
    const res = await api(`/api/admin/content?key=${contentKey}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Reset to the original content.");
      if (contentKey === "seo") window.dispatchEvent(new Event("cms:seo-saved"));
      await load();
    } else {
      showToast(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">{title}</h1>
          <p className="text-xs text-brand-muted max-w-2xl">{description}</p>
        </div>
        {viewHref && (
          <Link href={viewHref} target="_blank" className={`${secondaryBtnCls} flex-shrink-0`}>
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View page</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
      )}

      {!data && !error && (
        <div className="flex items-center gap-2 text-xs text-brand-muted py-10 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      )}

      {data && (
        <>
          <div className="space-y-5">{children({ data, setData: setData as React.Dispatch<React.SetStateAction<T>> })}</div>

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white border border-[#DCDCDE] shadow-lg">
            <button onClick={save} disabled={saving} className={`${primaryBtnCls} px-6 py-2.5`}>
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving…" : "Save Changes"}</span>
            </button>
            <button onClick={reset} className={secondaryBtnCls} type="button">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to original</span>
            </button>
            <span
              className={`text-[11px] font-semibold ml-auto ${dirty ? "text-amber-700" : "text-brand-muted"}`}
            >
              {dirty ? "● Unsaved changes" : "All changes saved"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
