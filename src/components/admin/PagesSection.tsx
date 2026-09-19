"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Edit, ExternalLink, Eye, Image as ImageIcon, Plus, Save, Search, Trash2 } from "lucide-react";
import { CmsPage, MediaItem } from "@/types/cms";
import { Role, can } from "@/lib/permissions";
import { useToast } from "@/components/layout/Toast";
import { slugify, slugifyInput } from "@/lib/slugify";
import { RichTextEditor, RichTextEditorHandle } from "./RichTextEditor";
import { MediaPicker } from "./MediaPicker";
import { SeoPanel } from "./SeoPanel";
import {
  api,
  cardCls,
  cardTitleCls,
  formatDateTime,
  inputCls,
  labelCls,
  primaryBtnCls,
  secondaryBtnCls,
} from "./shared";

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

interface PagesListProps {
  pages: CmsPage[];
  onNew: () => void;
  onEdit: (page: CmsPage) => void;
  onChanged: () => void;
}

export function PagesList({ pages, onNew, onEdit, onChanged }: PagesListProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");

  const visible = pages.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  const handleDelete = async (page: CmsPage) => {
    if (!confirm(`Permanently delete the page "${page.title}"? This cannot be undone.`)) return;
    const res = await api(`/api/admin/pages?slug=${encodeURIComponent(page.slug)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("Page deleted");
      onChanged();
    } else {
      showToast(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">Pages</h1>
          <p className="text-xs text-brand-muted">
            Standalone pages such as Privacy Policy, Terms or Disclaimer. Each page lives at
            /your-slug.
          </p>
        </div>
        <button onClick={onNew} className={primaryBtnCls}>
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#DCDCDE] shadow-sm max-w-md">
        <Search className="w-4 h-4 text-brand-muted" />
        <input
          type="text"
          placeholder="Search pages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-brand-dark focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Author</th>
              <th className="p-3.5">Last updated</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-borderLight">
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-brand-muted">
                  {pages.length === 0
                    ? "No pages yet. Click “Add New Page” to create one."
                    : "No pages match your search."}
                </td>
              </tr>
            )}
            {visible.map((page) => (
              <tr key={page.slug} className="hover:bg-brand-bgSoft/60 transition-colors">
                <td className="p-3.5">
                  <button
                    onClick={() => onEdit(page)}
                    className="text-sm font-semibold text-brand-dark hover:text-primary text-left block"
                  >
                    {page.title}
                  </button>
                  <span className="text-[11px] text-brand-muted">/{page.slug}</span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      page.status === "draft"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {page.status === "draft" ? "Draft" : "Published"}
                  </span>
                </td>
                <td className="p-3.5 text-brand-muted">{page.author || "—"}</td>
                <td className="p-3.5 text-brand-muted whitespace-nowrap">
                  {formatDateTime(page.updatedAt)}
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/${page.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-md text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight"
                      title={page.status === "published" ? "View page" : "Preview page"}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(page)}
                      className="p-1.5 rounded-md text-brand-muted hover:text-primary hover:bg-brand-bgLight"
                      title="Edit page"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page)}
                      className="p-1.5 rounded-md text-brand-muted hover:text-red-600 hover:bg-red-50"
                      title="Delete page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

interface PageEditorProps {
  initial: CmsPage | null;
  media: MediaItem[];
  me: { displayName: string; role: Role };
  onSaved: () => void;
  onCancel: () => void;
  onMediaChanged: () => void;
}

export function PageEditor({ initial, media, me, onSaved, onCancel, onMediaChanged }: PageEditorProps) {
  const { showToast } = useToast();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const originalSlug = initial?.slug;

  const [draft, setDraft] = useState<CmsPage>(
    () =>
      initial || {
        slug: "",
        title: "",
        content: "",
        status: "published",
        img: "",
        imgAlt: "",
        metaTitle: "",
        metaDescription: "",
        author: me.displayName,
      }
  );
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<null | "featured" | "inline">(null);

  const update = (patch: Partial<CmsPage>) => setDraft((d) => ({ ...d, ...patch }));

  // The slug is always kept in sync with the title (it can still be edited by hand).
  const onTitleChange = (title: string) =>
    setDraft((d) => ({ ...d, title, slug: slugify(title) }));

  const onSlugBlur = () => update({ slug: slugify(draft.slug) || slugify(draft.title) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.title.trim();
    const slug = slugify(draft.slug || title);
    if (!title || !slug) {
      showToast("Please add a title for your page.");
      return;
    }

    setSaving(true);
    const url = `/api/admin/pages${originalSlug ? `?original=${encodeURIComponent(originalSlug)}` : ""}`;
    const res = await api(url, { method: "POST", body: JSON.stringify({ ...draft, title, slug }) });
    setSaving(false);

    if (!res.ok) {
      showToast(res.error);
      return;
    }
    showToast(
      draft.status === "draft" ? "Draft saved." : originalSlug ? "Page updated!" : "Page published!"
    );
    onSaved();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#DCDCDE]">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">
            {originalSlug ? "Edit Page" : "Add New Page"}
          </h1>
          <p className="text-xs text-brand-muted">
            Pages are standalone content, published at /{draft.slug || "your-slug"}.
          </p>
        </div>
        <button type="button" onClick={onCancel} className={secondaryBtnCls}>
          ← Back to All Pages
        </button>
      </div>

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <input
              type="text"
              required
              placeholder="Add title"
              value={draft.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#DCDCDE] bg-white text-xl font-semibold text-brand-dark focus:outline-none focus:border-primary"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-brand-dark">Permalink:</span>
              <span className="text-brand-muted">/</span>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => update({ slug: slugifyInput(e.target.value) })}
                onBlur={onSlugBlur}
                placeholder="page-url-slug"
                className="flex-1 min-w-[160px] px-2.5 py-1 rounded-md border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <RichTextEditor
            ref={editorRef}
            value={draft.content}
            onChange={(html) => update({ content: html })}
            onRequestImage={() => setPicker("inline")}
            placeholder="Start writing your page…"
          />

          <SeoPanel
            value={draft.seo || {}}
            onChange={(patch) => setDraft((d) => ({ ...d, seo: { ...d.seo, ...patch } }))}
            context={{
              kind: "page",
              title: draft.title,
              slug: draft.slug,
              path: `/${draft.slug || "page-slug"}`,
              html: draft.content,
              image: draft.img,
            }}
          />
        </div>

        <div className="lg:col-span-4 space-y-5">
          <div className={`${cardCls} !p-5 space-y-4`}>
            <h3 className={cardTitleCls}>Publish</h3>
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">Status</label>
              <select
                value={draft.status}
                onChange={(e) => update({ status: e.target.value as CmsPage["status"] })}
                className={inputCls}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className={`${primaryBtnCls} w-full py-2.5`}>
              <Save className="w-4 h-4" />
              <span>
                {saving ? "Saving…" : draft.status === "draft" ? "Save Draft" : originalSlug ? "Update" : "Publish"}
              </span>
            </button>
            {originalSlug && (
              <Link
                href={`/${originalSlug}`}
                target="_blank"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{draft.status === "published" ? "View page" : "Preview page"}</span>
              </Link>
            )}
          </div>

          <div className={`${cardCls} !p-5 space-y-3`}>
            <h3 className={cardTitleCls}>Featured Image</h3>
            {draft.img ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-brand-border bg-brand-bgLight">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.img} alt="Featured preview" className="w-full h-full object-cover" />
                </div>
                <input
                  type="text"
                  value={draft.imgAlt || ""}
                  onChange={(e) => update({ imgAlt: e.target.value })}
                  placeholder="Alt text (SEO)"
                  className={inputCls}
                />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPicker("featured")} className={secondaryBtnCls}>
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ img: "", imgAlt: "" })}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPicker("featured")}
                className="w-full p-6 rounded-lg bg-brand-bgSoft border border-dashed border-brand-border text-center text-xs text-brand-muted hover:border-primary hover:text-primary transition-colors"
              >
                <ImageIcon className="w-5 h-5 mx-auto mb-1.5" />
                Set featured image
                <span className="block text-[11px] mt-0.5">Optional</span>
              </button>
            )}
          </div>
        </div>
      </form>

      <MediaPicker
        open={picker !== null}
        title={picker === "inline" ? "Insert image into page" : "Choose featured image"}
        items={media}
        canUpload={can(me.role, "upload_files")}
        onClose={() => setPicker(null)}
        onUploaded={onMediaChanged}
        onSelect={(item) => {
          if (picker === "inline") editorRef.current?.insertImage(item.url, item.alt || item.title || "");
          else update({ img: item.url, imgAlt: item.alt || draft.imgAlt || "" });
          setPicker(null);
        }}
      />
    </div>
  );
}
