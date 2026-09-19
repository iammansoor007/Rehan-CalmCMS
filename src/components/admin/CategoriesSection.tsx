"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { Category, SeoMeta } from "@/types/cms";
import { SeoPanel } from "./SeoPanel";
import { useToast } from "@/components/layout/Toast";
import { slugify, slugifyInput } from "@/lib/slugify";
import { descendantSlugs, orderCategories } from "@/lib/categoryTree";
import {
  api,
  cardCls,
  cardTitleCls,
  inputCls,
  labelCls,
  primaryBtnCls,
  secondaryBtnCls,
} from "./shared";

type CategoryRow = Category & { count?: number };

interface CategoriesSectionProps {
  categories: CategoryRow[];
  onChanged: () => void;
}

export function CategoriesSection({ categories, onChanged }: CategoriesSectionProps) {
  const { showToast } = useToast();

  // `editing` holds the slug of the category being edited (null = adding a new one).
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("");
  const [description, setDescription] = useState("");
  const [seo, setSeo] = useState<SeoMeta>({});
  const [saving, setSaving] = useState(false);

  const real = categories.filter((c) => c.slug !== "all");
  const rows = orderCategories(categories.filter((c) => c.slug !== "all"));
  const all = categories.find((c) => c.slug === "all");

  // A category can't be its own parent, or sit under one of its own sub-categories.
  const blocked = editing ? [editing, ...descendantSlugs(real, editing)] : [];
  const parentOptions = orderCategories(real).filter((c) => !blocked.includes(c.slug));

  const reset = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setParent("");
    setDescription("");
    setSeo({});
  };

  const startEdit = (cat: Category) => {
    setEditing(cat.slug);
    setName(cat.name);
    setSlug(cat.slug);
    setParent(cat.parent || "");
    setDescription(cat.description || "");
    setSeo(cat.seo || {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The slug always follows the name (it can still be edited by hand).
  const onNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const onSlugChange = (value: string) => setSlug(slugifyInput(value));

  const onSlugBlur = () => setSlug(slugify(slug) || slugify(name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Category name is required.");
      return;
    }
    const finalSlug = slugify(slug || name);
    if (!finalSlug) {
      showToast("Please enter a valid slug.");
      return;
    }

    setSaving(true);
    const url = `/api/admin/categories${editing ? `?original=${encodeURIComponent(editing)}` : ""}`;
    const res = await api(url, {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        slug: finalSlug,
        parent,
        description: description.trim(),
        seo,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      showToast(res.error);
      return;
    }
    showToast(editing ? `Category "${name.trim()}" updated!` : `Category "${name.trim()}" created!`);
    reset();
    onChanged();
  };

  const handleDelete = async (cat: Category) => {
    const kids = real.filter((c) => c.parent === cat.slug).length;
    const message = kids
      ? `Delete "${cat.name}"? Its ${kids} sub-categor${kids === 1 ? "y" : "ies"} will move up a level.`
      : `Delete category "${cat.name}"?`;
    if (!confirm(message)) return;

    const res = await api(`/api/admin/categories?slug=${encodeURIComponent(cat.slug)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("Category deleted");
      if (editing === cat.slug) reset();
      onChanged();
    } else {
      showToast(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">Categories</h1>
        <p className="text-xs text-brand-muted">
          Organise posts into categories and sub-categories. Every category appears in the site
          menu and gets its own archive page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add / edit form */}
        <div className={`lg:col-span-6 ${cardCls} space-y-4`}>
          <h3 className={cardTitleCls}>{editing ? "Edit Category" : "Add New Category"}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hot Stone Therapy"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className={inputCls}
              />
              <p className="text-[11px] text-brand-muted mt-1">The name shown on your site.</p>
            </div>

            <div>
              <label className={labelCls}>Slug</label>
              <input
                type="text"
                placeholder="hot-stone-therapy"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                onBlur={onSlugBlur}
                className={inputCls}
              />
              <p className="text-[11px] text-brand-muted mt-1">
                The URL-friendly version: /category/{slug || "your-slug"}
              </p>
            </div>

            <div>
              <label className={labelCls}>Parent Category</label>
              <select value={parent} onChange={(e) => setParent(e.target.value)} className={inputCls}>
                <option value="">None (top level)</option>
                {parentOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.depth > 0 ? `${"  ".repeat(c.depth)}– ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-brand-muted mt-1">
                Make this a sub-category, e.g. “Hot Stone” under “Massage Therapy”.
              </p>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                placeholder="Shown at the top of this category's page and on the homepage category cards…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
              />
            </div>

            <SeoPanel
              value={seo}
              onChange={(patch) => setSeo((s) => ({ ...s, ...patch }))}
              context={{
                kind: "category",
                title: name,
                slug,
                path: `/category/${slug || "category-slug"}`,
                fallbackDescription: description,
              }}
            />

            <div className="flex items-center gap-2">
              <button type="submit" disabled={saving} className={primaryBtnCls}>
                {editing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving…" : editing ? "Update Category" : "Add New Category"}</span>
              </button>
              {editing && (
                <button type="button" onClick={reset} className={secondaryBtnCls}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Posts</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-borderLight">
              {rows.map((cat) => {
                const row = categories.find((c) => c.slug === cat.slug) as CategoryRow;
                return (
                  <tr key={cat.slug} className="hover:bg-brand-bgSoft/60 transition-colors">
                    <td className="p-3.5 font-semibold text-brand-dark">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="text-left hover:text-primary block"
                        style={{ paddingLeft: cat.depth * 18 }}
                      >
                        {cat.depth > 0 && <span className="text-brand-muted mr-1">–</span>}
                        {cat.name}
                      </button>
                      <span
                        className="text-[11px] font-normal text-brand-muted line-clamp-2 block"
                        style={{ paddingLeft: cat.depth * 18 }}
                      >
                        {cat.description || "No description"}
                      </span>
                    </td>
                    <td className="p-3.5 text-brand-muted">/{cat.slug}</td>
                    <td className="p-3.5 font-bold text-primary">{row?.count ?? 0}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/category/${cat.slug}`}
                          target="_blank"
                          className="p-1.5 rounded text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight"
                          title="View category page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded text-brand-muted hover:text-primary hover:bg-brand-bgLight"
                          title="Edit category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded text-brand-muted hover:text-red-600 hover:bg-red-50"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {all && (
                <tr className="bg-brand-bgSoft/40">
                  <td className="p-3.5 font-semibold text-brand-muted">
                    {all.name}
                    <span className="text-[11px] font-normal block">
                      Built-in archive listing every post. It can&apos;t be edited or deleted.
                    </span>
                  </td>
                  <td className="p-3.5 text-brand-muted">/{all.slug}</td>
                  <td className="p-3.5 text-brand-muted">All</td>
                  <td className="p-3.5 text-right">
                    <Link
                      href="/category/all"
                      target="_blank"
                      className="p-1.5 inline-block rounded text-brand-muted hover:text-brand-dark"
                      title="View archive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
