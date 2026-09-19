"use client";

import React, { useRef, useState } from "react";
import { Search, Upload, X, RefreshCw } from "lucide-react";
import { MediaItem } from "@/types/cms";
import { api, formatBytes } from "./shared";
import { useToast } from "@/components/layout/Toast";

interface MediaPickerProps {
  open: boolean;
  title?: string;
  items: MediaItem[];
  canUpload: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  /** Called after a new file is uploaded so the parent can refresh its library. */
  onUploaded: () => void;
}

export function MediaPicker({
  open,
  title = "Select from Media Library",
  items,
  canUpload,
  onClose,
  onSelect,
  onUploaded,
}: MediaPickerProps) {
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  if (!open) return null;

  const filtered = items.filter((m) => {
    const q = query.toLowerCase();
    return !q || m.filename.toLowerCase().includes(q) || (m.alt || "").toLowerCase().includes(q);
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await api<{ url: string; filename: string }>("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);

    if (!res.ok || !res.data) {
      showToast(res.error || "Image upload failed");
      return;
    }
    showToast("Image uploaded successfully!");
    onUploaded();
    onSelect({ filename: res.data.filename, url: res.data.url, alt: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-brand-border">
        <div className="flex items-center justify-between p-5 border-b border-brand-borderLight">
          <h3 className="font-heading font-bold text-base text-brand-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3 border-b border-brand-borderLight">
          <div className="flex items-center gap-2 flex-1 bg-brand-bgSoft rounded-lg px-3 py-2 border border-brand-border">
            <Search className="w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images…"
              className="w-full bg-transparent text-xs focus:outline-none"
            />
          </div>
          {canUpload && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploading ? "Uploading…" : "Upload New"}</span>
              </button>
            </>
          )}
        </div>

        <div className="overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-brand-muted py-10">No images found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((m) => (
                <button
                  key={m.url}
                  type="button"
                  onClick={() => onSelect(m)}
                  title={`${m.filename} · ${formatBytes(m.size)}`}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-brand-border hover:border-primary focus:outline-none focus:border-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt || m.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                    Select
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
