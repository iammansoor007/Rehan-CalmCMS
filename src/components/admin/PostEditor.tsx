"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { CalendarClock, Eye, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { Article, Category, MediaItem } from "@/types/cms";
import { useToast } from "@/components/layout/Toast";
import { slugify, slugifyInput } from "@/lib/slugify";
import { orderCategories } from "@/lib/categoryTree";
import { Role, can } from "@/lib/permissions";
import { RichTextEditor, RichTextEditorHandle } from "./RichTextEditor";
import { MediaPicker } from "./MediaPicker";
import { SeoPanel } from "./SeoPanel";
import {
  api,
  cardCls,
  cardTitleCls,
  defaultScheduleInput,
  formatDateTime,
  fromLocalInput,
  inputCls,
  labelCls,
  primaryBtnCls,
  secondaryBtnCls,
  toLocalInput,
} from "./shared";

interface PostEditorProps {
  /** The post to edit, or null to start a new one. */
  initial: Article | null;
  categories: Category[];
  media: MediaItem[];
  me: { username: string; displayName: string; role: Role };
  onSaved: () => void;
  onCancel: () => void;
  onMediaChanged: () => void;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Older posts were built from separate intro/summary/sections fields; fold them into one editable body. */
function legacyToHtml(a: Article): string {
  if (a.content) return a.content;
  const parts: string[] = [];
  if (a.quickSummary) {
    parts.push(`<blockquote><strong>Quick summary:</strong> ${escapeHtml(a.quickSummary)}</blockquote>`);
  }
  if (a.intro) parts.push(`<p>${escapeHtml(a.intro)}</p>`);
  if (a.keyBenefits && a.keyBenefits.length > 0) {
    parts.push(
      `<h2>Key Benefits of This Approach</h2><ul>${a.keyBenefits
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join("")}</ul>`
    );
  }
  for (const sec of a.sections || []) {
    if (sec.heading) parts.push(`<h2>${escapeHtml(sec.heading)}</h2>`);
    for (const para of (sec.text || "").split(/\n{2,}/)) {
      if (para.trim()) parts.push(`<p>${escapeHtml(para.trim())}</p>`);
    }
  }
  return parts.join("");
}

export function PostEditor({
  initial,
  categories,
  media,
  me,
  onSaved,
  onCancel,
  onMediaChanged,
}: PostEditorProps) {
  const { showToast } = useToast();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const originalSlug = initial?.slug;
  const canPublish = can(me.role, "publish_posts");
  const canUpload = can(me.role, "upload_files");

  const selectableCategories = categories.filter((c) => c.slug !== "all");

  const [draft, setDraft] = useState<Article>(() =>
    initial
      ? { ...initial, content: legacyToHtml(initial), status: initial.status || "published" }
      : {
          slug: "",
          title: "",
          category: selectableCategories[0]?.name || "",
          date: "",
          author: me.displayName,
          img: "",
          imgAlt: "",
          intro: "",
          content: "",
          sections: [],
          relatedSlugs: [],
          status: canPublish ? "published" : "draft",
          metaTitle: "",
          metaDescription: "",
          keywords: [],
        }
  );
  const [scheduleLocal, setScheduleLocal] = useState(
    toLocalInput(initial?.scheduledAt) || defaultScheduleInput()
  );
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<null | "featured" | "inline">(null);

  const update = (patch: Partial<Article>) => setDraft((d) => ({ ...d, ...patch }));
  const status = draft.status || "published";

  // The slug is always kept in sync with the title. It can still be edited by hand,
  // but the next change to the title regenerates it.
  const onTitleChange = (title: string) =>
    setDraft((d) => ({ ...d, title, slug: slugify(title) }));

  const onSlugChange = (value: string) => update({ slug: slugifyInput(value) });

  const onSlugBlur = () => update({ slug: slugify(draft.slug) || slugify(draft.title) });

  const save = async (forceStatus?: "draft") => {
    const title = draft.title.trim();
    const slug = slugify(draft.slug || title);
    if (!title || !slug) {
      showToast("Please add a title for your post.");
      return;
    }

    const nextStatus = !canPublish ? "draft" : forceStatus || status;
    let scheduledAt: string | undefined;
    if (nextStatus === "scheduled") {
      scheduledAt = fromLocalInput(scheduleLocal);
      if (!scheduledAt) {
        showToast("Pick a valid date and time to schedule this post.");
        return;
      }
    }

    setSaving(true);
    const payload: Article = {
      ...draft,
      title,
      slug,
      status: nextStatus,
      scheduledAt,
      // Everything now lives in the editor body.
      sections: [],
      keyBenefits: [],
      quickSummary: "",
    };
    const url = `/api/admin/articles${originalSlug ? `?original=${encodeURIComponent(originalSlug)}` : ""}`;
    const res = await api<Article>(url, { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);

    if (!res.ok) {
      showToast(res.error);
      return;
    }
    showToast(
      nextStatus === "draft"
        ? "Draft saved."
        : nextStatus === "scheduled"
        ? `Post scheduled for ${formatDateTime(scheduledAt)}.`
        : originalSlug
        ? "Post updated!"
        : "Post published!"
    );
    onSaved();
  };

  const primaryLabel = saving
    ? "Saving…"
    : status === "draft"
    ? "Save Draft"
    : status === "scheduled"
    ? "Schedule"
    : originalSlug
    ? "Update"
    : "Publish";

  const categoryOptions = orderCategories(selectableCategories);
  const categoryMissing =
    draft.category && !selectableCategories.some((c) => c.name === draft.category);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#DCDCDE]">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">
            {originalSlug ? "Edit Post" : "Add New Post"}
          </h1>
          <p className="text-xs text-brand-muted">
            Write your post, choose a category, and publish now or schedule it for later.
          </p>
        </div>
        <button type="button" onClick={onCancel} className={secondaryBtnCls}>
          ← Back to All Posts
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Main column */}
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
              <span className="text-brand-muted">/blog/</span>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                onBlur={onSlugBlur}
                placeholder="post-url-slug"
                className="flex-1 min-w-[160px] px-2.5 py-1 rounded-md border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
              />
            </div>
            <p className="text-[11px] text-brand-muted">
              The permalink follows the title automatically.
              {originalSlug && draft.slug !== originalSlug && (
                <span className="text-amber-700 font-semibold">
                  {" "}
                  Heads up: this changes the post URL from /blog/{originalSlug}.
                </span>
              )}
            </p>
          </div>

          <RichTextEditor
            ref={editorRef}
            value={draft.content || ""}
            onChange={(html) => update({ content: html })}
            onRequestImage={() => setPicker("inline")}
          />

          <div className={`${cardCls} space-y-3`}>
            <h3 className={cardTitleCls}>Excerpt</h3>
            <textarea
              rows={3}
              placeholder="Optional short summary shown on post cards and used as the default search description…"
              value={draft.intro}
              onChange={(e) => update({ intro: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* SEO (Yoast-style) */}
          <SeoPanel
            value={draft.seo || {}}
            onChange={(patch) => setDraft((d) => ({ ...d, seo: { ...d.seo, ...patch } }))}
            context={{
              kind: "post",
              title: draft.title,
              slug: draft.slug,
              path: `/blog/${draft.slug || "post-slug"}`,
              fallbackDescription: draft.intro,
              html: draft.content || "",
              image: draft.img,
              categoryName: draft.category,
            }}
          />
        </div>

        {/* Sidebar column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Publish */}
          <div className={`${cardCls} !p-5 space-y-4`}>
            <h3 className={cardTitleCls}>Publish</h3>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => update({ status: e.target.value as Article["status"] })}
                className={inputCls}
              >
                <option value="published" disabled={!canPublish}>
                  Published
                </option>
                <option value="draft">Draft</option>
                <option value="scheduled" disabled={!canPublish}>
                  Scheduled
                </option>
              </select>
              {!canPublish && (
                <p className="text-[11px] text-brand-muted mt-1">
                  Your role can save drafts only. An editor will publish this post.
                </p>
              )}
            </div>

            {status === "scheduled" && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark">
                  <CalendarClock className="w-3.5 h-3.5 text-primary" />
                  Publish on
                </label>
                <input
                  type="datetime-local"
                  value={scheduleLocal}
                  onChange={(e) => setScheduleLocal(e.target.value)}
                  className={inputCls}
                />
                <p className="text-[11px] text-brand-muted">
                  The post goes live automatically at this time (your local time zone).
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button type="submit" disabled={saving} className={`${primaryBtnCls} w-full py-2.5`}>
                <Save className="w-4 h-4" />
                <span>{primaryLabel}</span>
              </button>
              {status !== "draft" && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save("draft")}
                  className={`${secondaryBtnCls} w-full`}
                >
                  Save as Draft
                </button>
              )}
              {originalSlug && (
                <Link
                  href={`/blog/${originalSlug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{status === "published" ? "View post" : "Preview post"}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Category */}
          <div className={`${cardCls} !p-5 space-y-3`}>
            <h3 className={cardTitleCls}>Category</h3>
            <select
              value={draft.category}
              onChange={(e) => update({ category: e.target.value })}
              className={inputCls}
            >
              {categoryMissing && <option value={draft.category}>{draft.category}</option>}
              {categoryOptions.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.depth > 0 ? `${"  ".repeat(cat.depth)}– ` : ""}
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-brand-muted">
              The post appears on this category page (and on its parent category).
            </p>
          </div>

          {/* Featured image */}
          <div className={`${cardCls} !p-5 space-y-3`}>
            <h3 className={cardTitleCls}>Featured Image</h3>
            {draft.img ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-brand-border bg-brand-bgLight">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.img} alt="Featured preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">
                    Alt text (SEO)
                  </label>
                  <input
                    type="text"
                    value={draft.imgAlt || ""}
                    onChange={(e) => update({ imgAlt: e.target.value })}
                    placeholder="Describe the image"
                    className={inputCls}
                  />
                </div>
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

          {/* Author */}
          <div className={`${cardCls} !p-5 space-y-3`}>
            <h3 className={cardTitleCls}>Author</h3>
            <input
              type="text"
              value={draft.author}
              onChange={(e) => update({ author: e.target.value })}
              className={inputCls}
            />
            <p className="text-[11px] text-brand-muted">Name shown under the post title.</p>
          </div>
        </div>
      </form>

      <MediaPicker
        open={picker !== null}
        title={picker === "inline" ? "Insert image into post" : "Choose featured image"}
        items={media}
        canUpload={canUpload}
        onClose={() => setPicker(null)}
        onUploaded={onMediaChanged}
        onSelect={(item) => {
          if (picker === "inline") {
            editorRef.current?.insertImage(item.url, item.alt || item.title || "");
          } else {
            update({ img: item.url, imgAlt: item.alt || draft.imgAlt || "" });
          }
          setPicker(null);
        }}
      />
    </div>
  );
}
