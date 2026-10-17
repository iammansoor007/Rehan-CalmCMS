"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, GripVertical, Search } from "lucide-react";
import { MenuItem } from "@/types/cms";
import { orderCategories } from "@/lib/categoryTree";
import { useAdminEnv } from "./AdminEnv";
import { LinkField, Toggle } from "./fields";
import { cardCls, cardTitleCls, inputCls, labelCls, secondaryBtnCls } from "./shared";

// ---------------------------------------------------------------------------
// Menu tree <-> flat list. The builder edits a flat list with a `depth` per item
// (this is how WordPress does it); the saved menu is the nested tree.
// ---------------------------------------------------------------------------

type Flat = Omit<MenuItem, "children"> & { depth: number };

export const newMenuId = () => `m${Math.random().toString(36).slice(2, 9)}`;

function toFlat(items: MenuItem[] | undefined, depth = 0): Flat[] {
  return (items || []).flatMap(({ children, ...rest }) => [{ ...rest, depth }, ...toFlat(children, depth + 1)]);
}

function toTree(flat: Flat[]): MenuItem[] {
  const root: MenuItem[] = [];
  const parents: MenuItem[] = [];
  flat.forEach(({ depth, ...item }) => {
    const d = Math.min(depth, parents.length); // a level can never be skipped
    const node: MenuItem = { ...item };
    if (d === 0) root.push(node);
    else {
      const parent = parents[d - 1];
      parent.children = [...(parent.children || []), node];
    }
    parents.length = d;
    parents[d] = node;
  });
  return root;
}

/** Index just after an item and everything nested under it. */
const blockEnd = (list: Flat[], i: number) => {
  let e = i + 1;
  while (e < list.length && list[e].depth > list[i].depth) e++;
  return e;
};

function moveUp(list: Flat[], i: number): Flat[] {
  const d = list[i].depth;
  let j = i - 1;
  while (j >= 0 && list[j].depth > d) j--;
  if (j < 0 || list[j].depth < d) return list;
  const end = blockEnd(list, i);
  return [...list.slice(0, j), ...list.slice(i, end), ...list.slice(j, i), ...list.slice(end)];
}

function moveDown(list: Flat[], i: number): Flat[] {
  const end = blockEnd(list, i);
  if (end >= list.length || list[end].depth !== list[i].depth) return list;
  const end2 = blockEnd(list, end);
  return [...list.slice(0, i), ...list.slice(end, end2), ...list.slice(i, end), ...list.slice(end2)];
}

function indent(list: Flat[], i: number, maxDepth: number): Flat[] {
  const end = blockEnd(list, i);
  if (i === 0 || list[i - 1].depth < list[i].depth) return list;
  const deepest = Math.max(...list.slice(i, end).map((x) => x.depth));
  if (deepest + 1 > maxDepth) return list;
  return list.map((x, k) => (k >= i && k < end ? { ...x, depth: x.depth + 1 } : x));
}

/** Moves an item (with its sub-items) out from under its parent, to just after it. */
function outdent(list: Flat[], i: number): Flat[] {
  const d = list[i].depth;
  if (d === 0) return list;
  const end = blockEnd(list, i);
  let p = i - 1;
  while (p >= 0 && list[p].depth >= d) p--;
  const parentEnd = blockEnd(list, p);
  const block = list.slice(i, end).map((x) => ({ ...x, depth: x.depth - 1 }));
  const without = [...list.slice(0, i), ...list.slice(end)];
  const at = parentEnd - (end - i);
  return [...without.slice(0, at), ...block, ...without.slice(at)];
}

/**
 * Drag & drop onto a card: dragging up puts `from` (and its sub-items) right before `to`;
 * dragging down puts it right after `to` (and `to`'s own sub-items). Either way it takes
 * the same level as `to`.
 */
function dropOnto(list: Flat[], from: number, to: number, maxDepth: number): Flat[] {
  const end = blockEnd(list, from);
  if (to >= from && to < end) return list;
  const block = list.slice(from, end);
  const delta = list[to].depth - block[0].depth;
  if (Math.max(...block.map((x) => x.depth)) + delta > maxDepth) return list;
  const moved = block.map((x) => ({ ...x, depth: x.depth + delta }));
  const without = [...list.slice(0, from), ...list.slice(end)];
  const at = to > from ? blockEnd(list, to) - (end - from) : to;
  return [...without.slice(0, at), ...moved, ...without.slice(at)];
}

function dropAtEnd(list: Flat[], from: number): Flat[] {
  const end = blockEnd(list, from);
  const base = list[from].depth;
  const block = list.slice(from, end).map((x) => ({ ...x, depth: x.depth - base }));
  return [...list.slice(0, from), ...list.slice(end), ...block];
}

function remove(list: Flat[], i: number): Flat[] {
  const end = blockEnd(list, i);
  return list
    .map((x, k) => (k > i && k < end ? { ...x, depth: x.depth - 1 } : x))
    .filter((_, k) => k !== i);
}

const TYPE_LABEL: Record<string, string> = {
  page: "Page",
  post: "Post",
  category: "Category",
  custom: "Custom Link",
};

// ---------------------------------------------------------------------------
// Menu structure (right-hand side)
// ---------------------------------------------------------------------------

const iconBtn =
  "w-6 h-6 rounded flex items-center justify-center text-brand-muted hover:bg-white hover:text-brand-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed";

export function MenuStructure({
  items,
  onChange,
  maxDepth = 2,
  emptyText = "Nothing here yet. Add items from the left, then drag them into order.",
}: {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  /** 0 = flat list (no sub-items). */
  maxDepth?: number;
  emptyText?: string;
}) {
  const flat = useMemo(() => toFlat(items), [items]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const commit = (next: Flat[]) => onChange(toTree(next));
  const patch = (i: number, p: Partial<Flat>) => commit(flat.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const indexOf = (id: string | null) => flat.findIndex((x) => x.id === id);

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  if (flat.length === 0) {
    return (
      <p className="text-xs text-brand-muted py-8 text-center border border-dashed border-[#C3C4C7] rounded-lg">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {flat.map((it, i) => {
        const open = openId === it.id;
        const type = TYPE_LABEL[it.type || "custom"];
        return (
          <div
            key={it.id}
            style={{ marginLeft: it.depth * 28 }}
            className={`rounded-lg border bg-white ${
              overId === it.id && dragId !== it.id ? "border-primary ring-2 ring-primary/20" : "border-[#DCDCDE]"
            } ${dragId === it.id ? "opacity-50" : ""}`}
            onDragOver={(e) => {
              if (!dragId || dragId === it.id) return;
              e.preventDefault();
              if (overId !== it.id) setOverId(it.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = indexOf(dragId);
              if (from >= 0) commit(dropOnto(flat, from, i, maxDepth));
              endDrag();
            }}
          >
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", it.id);
                setDragId(it.id);
              }}
              onDragEnd={endDrag}
              className="flex items-center gap-2 px-2.5 py-2 bg-[#F6F7F7] rounded-lg cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-brand-muted flex-shrink-0" aria-hidden />
              <button
                type="button"
                onClick={() => setOpenId(open ? null : it.id)}
                className="flex-1 min-w-0 text-left text-xs font-bold text-brand-dark truncate"
                aria-expanded={open}
              >
                {it.label || "(no label)"}
              </button>
              <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                {type}
              </span>
              <button type="button" className={iconBtn} title="Move up" aria-label="Move up" disabled={moveUp(flat, i) === flat} onClick={() => commit(moveUp(flat, i))}>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" className={iconBtn} title="Move down" aria-label="Move down" disabled={moveDown(flat, i) === flat} onClick={() => commit(moveDown(flat, i))}>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              {maxDepth > 0 && (
                <>
                  <button type="button" className={iconBtn} title="Move out one level" aria-label="Move out one level" disabled={it.depth === 0} onClick={() => commit(outdent(flat, i))}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className={iconBtn} title="Make sub-item of the item above" aria-label="Make sub-item" disabled={indent(flat, i, maxDepth) === flat} onClick={() => commit(indent(flat, i, maxDepth))}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button type="button" className={iconBtn} aria-label={open ? "Close" : "Edit"} onClick={() => setOpenId(open ? null : it.id)}>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </div>

            {open && (
              <div className="p-3 space-y-3 border-t border-brand-borderLight">
                <div>
                  <label className={labelCls}>Navigation label</label>
                  <input className={inputCls} value={it.label} onChange={(e) => patch(i, { label: e.target.value })} />
                </div>
                <LinkField label="Link (URL)" value={it.href} onChange={(v) => patch(i, { href: v })} />
                <Toggle label="Open link in a new tab" checked={!!it.newTab} onChange={(v) => patch(i, { newTab: v })} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-brand-muted">{type}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(null);
                      commit(remove(flat, i));
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {dragId && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOverId("__end");
          }}
          onDrop={(e) => {
            e.preventDefault();
            const from = indexOf(dragId);
            if (from >= 0) commit(dropAtEnd(flat, from));
            endDrag();
          }}
          className={`text-center text-[11px] py-2 rounded-lg border border-dashed ${
            overId === "__end" ? "border-primary text-primary bg-primary/5" : "border-[#C3C4C7] text-brand-muted"
          }`}
        >
          Drop here to move to the end
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// "Add menu items" panel (left-hand side)
// ---------------------------------------------------------------------------

interface Option {
  key: string;
  label: string;
  href: string;
  indent?: number;
}

function normaliseHref(value: string): string {
  const v = value.trim();
  if (!v || /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  return `https://${v}`;
}

function CheckGroup({
  title,
  options,
  type,
  open,
  onToggle,
  onAdd,
  searchable,
}: {
  title: string;
  options: Option[];
  type: NonNullable<MenuItem["type"]>;
  open: boolean;
  onToggle: () => void;
  onAdd: (items: MenuItem[]) => void;
  searchable?: boolean;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const shown = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  const allPicked = shown.length > 0 && shown.every((o) => picked.includes(o.key));

  const add = () => {
    const chosen = options.filter((o) => picked.includes(o.key));
    if (!chosen.length) return;
    onAdd(chosen.map((o) => ({ id: newMenuId(), label: o.label, href: o.href, type })));
    setPicked([]);
  };

  return (
    <div className="border-b border-[#DCDCDE] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-brand-dark hover:bg-[#F6F7F7]"
      >
        {title}
        <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {searchable && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                className={`${inputCls} pl-8`}
                placeholder={`Search ${title.toLowerCase()}…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto border border-brand-borderLight rounded-lg p-2 space-y-1.5">
            {shown.length === 0 && <p className="text-[11px] text-brand-muted px-1 py-2">Nothing found.</p>}
            {shown.map((o) => (
              <label
                key={o.key}
                className="flex items-start gap-2 text-xs text-brand-dark cursor-pointer"
                style={o.indent ? { paddingLeft: o.indent * 14 } : undefined}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-primary"
                  checked={picked.includes(o.key)}
                  onChange={(e) =>
                    setPicked((p) => (e.target.checked ? [...p, o.key] : p.filter((k) => k !== o.key)))
                  }
                />
                <span className="leading-snug">{o.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-brand-muted cursor-pointer">
              <input
                type="checkbox"
                className="accent-primary"
                checked={allPicked}
                onChange={(e) =>
                  setPicked(e.target.checked ? Array.from(new Set([...picked, ...shown.map((o) => o.key)])) : [])
                }
              />
              Select all
            </label>
            <button type="button" onClick={add} disabled={picked.length === 0} className={secondaryBtnCls}>
              Add to menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MenuAddPanel({
  onAdd,
  header,
}: {
  onAdd: (items: MenuItem[]) => void;
  /** Extra controls above the accordions (e.g. "which footer column"). */
  header?: React.ReactNode;
}) {
  const { pages, posts, categories } = useAdminEnv();
  const [section, setSection] = useState("pages");
  const [url, setUrl] = useState("https://");
  const [text, setText] = useState("");
  const toggle = (id: string) => setSection((s) => (s === id ? "" : id));

  const pageOptions: Option[] = [
    { key: "home", label: "Home", href: "/" },
    { key: "about", label: "About", href: "/about" },
    { key: "contact", label: "Contact", href: "/contact" },
    ...pages.map((p) => ({ key: `page-${p.slug}`, label: p.title, href: `/${p.slug}` })),
  ];
  const quickOptions: Option[] = [
    { key: "all-posts", label: "All posts", href: "/category/all" },
    { key: "all-cats", label: "All categories", href: "/category" },
    { key: "guide", label: "Homepage: featured guide", href: "/#guide" },
    { key: "news", label: "Homepage: newsletter", href: "/#newsletter" },
  ];
  const categoryOptions: Option[] = orderCategories(categories.filter((c) => c.slug !== "all")).map((c) => ({
    key: c.slug,
    label: c.name,
    href: `/category/${c.slug}`,
    indent: c.depth,
  }));
  const postOptions: Option[] = posts.map((p) => ({ key: p.slug, label: p.title, href: `/blog/${p.slug}` }));

  const addCustom = () => {
    const href = normaliseHref(url === "https://" ? "" : url);
    if (!href || !text.trim()) return;
    onAdd([{ id: newMenuId(), label: text.trim(), href, type: "custom" }]);
    setUrl("https://");
    setText("");
  };

  return (
    <div className={`${cardCls} !p-0 overflow-hidden lg:sticky lg:top-0`}>
      <div className="px-4 py-3 border-b border-[#DCDCDE] bg-[#F6F7F7]">
        <h3 className="font-heading font-bold text-sm text-brand-dark">Add menu items</h3>
      </div>
      {header && <div className="px-4 py-3 border-b border-[#DCDCDE]">{header}</div>}
      <CheckGroup title="Pages" type="page" options={pageOptions} open={section === "pages"} onToggle={() => toggle("pages")} onAdd={onAdd} searchable={pageOptions.length > 8} />
      <CheckGroup title="Posts" type="post" options={postOptions} open={section === "posts"} onToggle={() => toggle("posts")} onAdd={onAdd} searchable />
      <CheckGroup title="Categories" type="category" options={categoryOptions} open={section === "categories"} onToggle={() => toggle("categories")} onAdd={onAdd} />
      <CheckGroup title="Quick links" type="custom" options={quickOptions} open={section === "quick"} onToggle={() => toggle("quick")} onAdd={onAdd} />

      <div className="border-b border-[#DCDCDE] last:border-b-0">
        <button
          type="button"
          onClick={() => toggle("custom")}
          aria-expanded={section === "custom"}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-brand-dark hover:bg-[#F6F7F7]"
        >
          Custom Links
          <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform ${section === "custom" ? "rotate-180" : ""}`} />
        </button>
        {section === "custom" && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className={labelCls}>URL</label>
              <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
            </div>
            <div>
              <label className={labelCls}>Link text</label>
              <input
                className={inputCls}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
              />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={addCustom} className={secondaryBtnCls}>
                Add to menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared frame: add-panel on the left, structure on the right
// ---------------------------------------------------------------------------

export function MenuFrame({ panel, children }: { panel: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
      {panel}
      <div className="space-y-5 min-w-0">{children}</div>
    </div>
  );
}

export function MenuCard({
  title,
  help,
  children,
  action,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={`${cardCls} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`${cardTitleCls} !border-0 !pb-0`}>{title}</h3>
          {help && <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">{help}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
