"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, CheckSquare, Copy, ExternalLink, RefreshCw, Save, Search, Trash2, Upload, X } from "lucide-react";
import { MediaItem } from "@/types/cms";
import { Role, can } from "@/lib/permissions";
import { useToast } from "@/components/layout/Toast";
import {
  api,
  formatBytes,
  formatDateTime,
  inputCls,
  labelCls,
  primaryBtnCls,
  secondaryBtnCls,
} from "./shared";

interface MediaSectionProps {
  items: MediaItem[];
  role: Role;
  /** Where an image is used (posts, pages, hero, logo) — shown before deleting. */
  usedIn: (url: string) => string[];
  onChanged: () => void;
  /** Bumped by the admin bar's "+ New → Media" to open the file dialog straight away. */
  uploadRequest: number;
}

export function MediaSection({ items, role, usedIn, onChanged, uploadRequest }: MediaSectionProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState<MediaItem | null>(null);

  const canUpload = can(role, "upload_files");
  const canManage = can(role, "manage_media");

  useEffect(() => {
    if (uploadRequest > 0 && canUpload) inputRef.current?.click();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadRequest]);

  const filtered = items.filter((m) => {
    const q = query.toLowerCase();
    return (
      !q ||
      m.filename.toLowerCase().includes(q) ||
      (m.alt || "").toLowerCase().includes(q) ||
      (m.title || "").toLowerCase().includes(q)
    );
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    let done = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) done += 1;
      else showToast(`${file.name}: ${res.error}`);
    }
    setUploading(false);
    if (done > 0) {
      showToast(done === 1 ? "Image uploaded successfully!" : `${done} images uploaded!`);
      onChanged();
    }
  };

  const confirmDelete = (urls: string[]) => {
    const usage = urls.flatMap((u) => usedIn(u));
    const usageNote = usage.length
      ? `\n\nIn use by: ${usage.slice(0, 5).join(", ")}${usage.length > 5 ? "…" : ""}\nThey will show a broken image until you replace it.`
      : "";
    return confirm(
      `Permanently delete ${urls.length === 1 ? "this image" : `${urls.length} images`}? This cannot be undone.${usageNote}`
    );
  };

  const deleteUrls = async (urls: string[]) => {
    if (urls.length === 0 || !confirmDelete(urls)) return;
    const res = await api("/api/admin/media", { method: "DELETE", body: JSON.stringify({ urls }) });
    if (res.ok) {
      showToast(urls.length === 1 ? "Image deleted" : `${urls.length} images deleted`);
      setSelected([]);
      setActive(null);
      onChanged();
    } else {
      showToast(res.error);
    }
  };

  const toggle = (url: string) =>
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}${url}`);
    showToast("Image URL copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">Media Library</h1>
          <p className="text-xs text-brand-muted">
            Upload images, then click any image to add alt text, a caption and a description for SEO.
          </p>
        </div>

        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml"
              className="hidden"
              onChange={handleUpload}
            />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className={primaryBtnCls}>
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? "Uploading…" : "Add New Media"}</span>
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#DCDCDE] shadow-sm max-w-md w-full">
          <Search className="w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search media by file name or alt text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-brand-dark focus:outline-none"
          />
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {bulk && selected.length > 0 && (
              <button
                onClick={() => deleteUrls(selected)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete selected ({selected.length})</span>
              </button>
            )}
            <button
              onClick={() => {
                setBulk(!bulk);
                setSelected([]);
              }}
              className={secondaryBtnCls}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{bulk ? "Cancel selection" : "Bulk select"}</span>
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-white border border-[#DCDCDE] text-center text-brand-muted text-sm">
          No media found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((m) => {
            const isSelected = selected.includes(m.url);
            return (
              <button
                key={m.url}
                type="button"
                onClick={() => (bulk ? toggle(m.url) : setActive(m))}
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-brand-bgLight text-left focus:outline-none ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-[#DCDCDE] hover:border-primary/60"
                }`}
                title={m.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.alt || m.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {bulk && (
                  <span
                    className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? "bg-primary border-primary text-white" : "bg-white/90 border-brand-border"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                )}
                {!m.alt && !bulk && (
                  <span
                    className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-white text-[9px] font-bold uppercase"
                    title="No alt text yet — add one for SEO"
                  >
                    No alt
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <MediaDetails
          item={active}
          usage={usedIn(active.url)}
          canManage={canManage}
          onClose={() => setActive(null)}
          onCopy={() => copyUrl(active.url)}
          onDelete={() => deleteUrls([active.url])}
          onSaved={(saved) => {
            setActive(saved);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function MediaDetails({
  item,
  usage,
  canManage,
  onClose,
  onCopy,
  onDelete,
  onSaved,
}: {
  item: MediaItem;
  usage: string[];
  canManage: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onSaved: (item: MediaItem) => void;
}) {
  const { showToast } = useToast();
  const [alt, setAlt] = useState(item.alt || "");
  const [title, setTitle] = useState(item.title || "");
  const [caption, setCaption] = useState(item.caption || "");
  const [description, setDescription] = useState(item.description || "");
  const [saving, setSaving] = useState(false);
  const [dimensions, setDimensions] = useState("");

  useEffect(() => {
    setAlt(item.alt || "");
    setTitle(item.title || "");
    setCaption(item.caption || "");
    setDescription(item.description || "");
    setDimensions("");
  }, [item]);

  const save = async () => {
    setSaving(true);
    const res = await api<MediaItem>("/api/admin/media", {
      method: "PUT",
      body: JSON.stringify({ url: item.url, alt, title, caption, description }),
    });
    setSaving(false);
    if (res.ok && res.data) {
      showToast("Media details saved");
      onSaved({ ...item, ...res.data });
    } else {
      showToast(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-brand-border">
        <div className="flex items-center justify-between p-5 border-b border-brand-borderLight">
          <h3 className="font-heading font-bold text-base text-brand-dark">Attachment Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Preview + file info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-border bg-brand-bgLight overflow-hidden flex items-center justify-center max-h-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={alt || item.filename}
                onLoad={(e) =>
                  setDimensions(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight} px`)
                }
                className="max-w-full max-h-[340px] object-contain"
              />
            </div>

            <dl className="text-xs space-y-1.5">
              {[
                ["File name", item.filename],
                ["File type", item.mimetype || "—"],
                ["File size", formatBytes(item.size)],
                ["Dimensions", dimensions || "—"],
                ["Uploaded on", formatDateTime(item.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-24 font-semibold text-brand-dark flex-shrink-0">{k}:</dt>
                  <dd className="text-brand-muted break-all">{v}</dd>
                </div>
              ))}
              <div className="flex gap-2">
                <dt className="w-24 font-semibold text-brand-dark flex-shrink-0">Used in:</dt>
                <dd className="text-brand-muted">
                  {usage.length ? usage.join(", ") : "Not used anywhere yet"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Editable details */}
          <div className="space-y-4">
            <div>
              <label className={labelCls}>File URL</label>
              <div className="flex gap-2">
                <input readOnly value={item.url} className={`${inputCls} bg-brand-bgSoft`} />
                <button type="button" onClick={onCopy} className={secondaryBtnCls} title="Copy URL">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Alternative Text</label>
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                disabled={!canManage}
                placeholder="Describe the image for search engines and screen readers"
                className={inputCls}
              />
              <p className="text-[11px] text-brand-muted mt-1">
                Good alt text helps SEO. Leave it empty only for purely decorative images.
              </p>
            </div>

            <div>
              <label className={labelCls}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canManage}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Caption</label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={!canManage}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canManage}
                className={inputCls}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {canManage && (
                <button onClick={save} disabled={saving} className={primaryBtnCls}>
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving…" : "Save Details"}</span>
                </button>
              )}
              <a href={item.url} target="_blank" rel="noreferrer" className={secondaryBtnCls}>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View file</span>
              </a>
              {canManage && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1.5 sm:ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete permanently</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
