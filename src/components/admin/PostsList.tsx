"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarClock, Edit, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { Article } from "@/types/cms";
import { Role, can } from "@/lib/permissions";
import { useToast } from "@/components/layout/Toast";
import { api, formatDateTime, primaryBtnCls } from "./shared";
import { analyseSeo } from "@/lib/seoAnalysis";
import { ScoreDot } from "./SeoPanel";

interface PostsListProps {
  articles: Article[];
  me: { username: string; role: Role };
  onNew: () => void;
  onEdit: (article: Article) => void;
  onChanged: () => void;
}

type Filter = "all" | "published" | "draft" | "scheduled";

/** A scheduled post whose time has passed is already live. */
function effectiveStatus(a: Article): "published" | "draft" | "scheduled" {
  const s = a.status || "published";
  if (s === "scheduled" && a.scheduledAt && new Date(a.scheduledAt).getTime() <= Date.now()) {
    return "published";
  }
  return s;
}

function seoLevel(a: Article) {
  const seo = a.seo || {};
  return analyseSeo({
    keyword: seo.focusKeyword || "",
    title: seo.title || a.title,
    description: seo.description || a.intro || "",
    hasCustomDescription: !!seo.description?.trim(),
    slug: a.slug,
    html: a.content || [a.intro, ...a.sections.map((s) => `<h2>${s.heading}</h2><p>${s.text}</p>`)].join(""),
  });
}

const STATUS_STYLE = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  scheduled: "bg-sky-100 text-sky-800",
};

export function PostsList({ articles, me, onNew, onEdit, onChanged }: PostsListProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const count = (f: Filter) =>
    f === "all" ? articles.length : articles.filter((a) => effectiveStatus(a) === f).length;

  const visible = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    return matchesSearch && (filter === "all" || effectiveStatus(a) === filter);
  });

  const canEdit = (a: Article) =>
    can(me.role, "edit_others_posts") ||
    (a.authorId === me.username && (can(me.role, "publish_posts") || a.status === "draft"));
  const canDelete = (a: Article) =>
    can(me.role, "edit_others_posts") ||
    (a.authorId === me.username && (can(me.role, "publish_posts") || a.status === "draft"));

  const handleDelete = async (a: Article) => {
    if (!confirm(`Permanently delete the post "${a.title}"? This cannot be undone.`)) return;
    const res = await api(`/api/admin/articles?slug=${encodeURIComponent(a.slug)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("Post deleted");
      onChanged();
    } else {
      showToast(res.error);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Drafts" },
    { id: "scheduled", label: "Scheduled" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">Posts</h1>
          <p className="text-xs text-brand-muted">
            Manage the posts that appear on the homepage and category pages.
          </p>
        </div>
        <button onClick={onNew} className={primaryBtnCls}>
          <Plus className="w-4 h-4" />
          <span>Add New Post</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === f.id
                  ? "bg-primary text-white"
                  : "bg-white text-brand-dark hover:bg-brand-bgLight border border-brand-border"
              }`}
            >
              {f.label} ({count(f.id)})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#DCDCDE] shadow-sm max-w-md w-full sm:w-auto">
          <Search className="w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search posts by title or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-brand-dark focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">SEO</th>
              <th className="p-3.5">Author</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-borderLight">
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-brand-muted">
                  No posts found.
                </td>
              </tr>
            )}
            {visible.map((art) => {
              const st = effectiveStatus(art);
              return (
                <tr key={art.slug} className="hover:bg-brand-bgSoft/60 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {art.img && (
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-brand-bgLight">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={art.img} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        {canEdit(art) ? (
                          <button
                            onClick={() => onEdit(art)}
                            className="text-sm font-semibold text-brand-dark hover:text-primary text-left block"
                          >
                            {art.title}
                          </button>
                        ) : (
                          <span className="text-sm font-semibold text-brand-dark block">
                            {art.title}
                          </span>
                        )}
                        <span className="text-[11px] text-brand-muted">/{art.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[st]}`}
                    >
                      {st === "draft" ? "Draft" : st === "scheduled" ? "Scheduled" : "Published"}
                    </span>
                    {st === "scheduled" && art.scheduledAt && (
                      <span className="flex items-center gap-1 text-[11px] text-sky-700 mt-1">
                        <CalendarClock className="w-3 h-3" />
                        {formatDateTime(art.scheduledAt)}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                      {art.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {(() => {
                      const seo = seoLevel(art);
                      return (
                        <div className="flex items-center gap-2">
                          <ScoreDot
                            level={seo.level}
                            label={seo.level === "none" ? "No keyphrase" : `${seo.score}%`}
                          />
                          {art.seo?.index === "noindex" && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                              noindex
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3.5 text-brand-muted">{art.author}</td>
                  <td className="p-3.5 text-brand-muted whitespace-nowrap">{art.date}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${art.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-md text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight"
                        title={st === "published" ? "View post" : "Preview post"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {canEdit(art) && (
                        <button
                          onClick={() => onEdit(art)}
                          className="p-1.5 rounded-md text-brand-muted hover:text-primary hover:bg-brand-bgLight"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete(art) && (
                        <button
                          onClick={() => handleDelete(art)}
                          className="p-1.5 rounded-md text-brand-muted hover:text-red-600 hover:bg-red-50"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
