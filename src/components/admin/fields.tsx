"use client";

import React, { useId, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Category } from "@/types/cms";
import { DynamicIcon, ICON_NAMES } from "@/lib/icons";
import { orderCategories } from "@/lib/categoryTree";
import { useAdminEnv } from "./AdminEnv";
import { MediaPicker } from "./MediaPicker";
import { cardCls, inputCls, labelCls, secondaryBtnCls } from "./shared";

/** Returns a function that shallow-merges a patch into one top-level key of a state object. */
export function sectionPatcher<T, K extends keyof T>(
  setData: React.Dispatch<React.SetStateAction<T>>,
  key: K
) {
  return (patch: Partial<T[K]>) =>
    setData((d) => ({ ...d, [key]: { ...(d[key] as object), ...(patch as object) } }));
}

// ---------------------------------------------------------------------------
// Simple inputs
// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="text-[11px] text-brand-muted mt-1">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  hint,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)));
        }}
        className={inputCls}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  hint,
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </Field>
  );
}

/** On/off switch. */
export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors ${
          checked ? "bg-primary" : "bg-[#C3C4C7]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
      <div className="min-w-0">
        <span className="text-xs font-semibold text-brand-dark block">{label}</span>
        {hint && <span className="text-[11px] text-brand-muted block">{hint}</span>}
      </div>
    </div>
  );
}

/** URL input with suggestions of the site's own pages, categories and posts. */
export function LinkField({
  label,
  value,
  onChange,
  hint,
  placeholder = "/about or https://…",
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const { linkSuggestions } = useAdminEnv();
  const listId = useId();
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        list={listId}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
      <datalist id={listId}>
        {linkSuggestions.map((s) => (
          <option key={s.href} value={s.href}>
            {s.label}
          </option>
        ))}
      </datalist>
    </Field>
  );
}

export function IconField({
  label = "Icon",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <DynamicIcon name={value} className="w-4 h-4 text-primary" />
        </span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

export function ImageField({
  label,
  value,
  onChange,
  hint,
  aspect = "aspect-[4/3]",
  fallbackPreview,
}: {
  label?: string;
  value: string | undefined;
  onChange: (url: string, alt?: string) => void;
  hint?: string;
  aspect?: string;
  /** Shown when no image is set (e.g. the built-in default). */
  fallbackPreview?: string;
}) {
  const env = useAdminEnv();
  const [open, setOpen] = useState(false);
  const preview = value || fallbackPreview;

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-4 items-start">
        <div
          className={`w-40 ${aspect} rounded-lg overflow-hidden border border-brand-border bg-brand-bgLight flex items-center justify-center flex-shrink-0`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-brand-muted" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className={secondaryBtnCls}>
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{value ? "Change image" : "Choose image"}</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      <MediaPicker
        open={open}
        title={label ? `Choose: ${label}` : "Choose image"}
        items={env.media}
        canUpload={env.canUpload}
        onClose={() => setOpen(false)}
        onUploaded={env.onMediaChanged}
        onSelect={(item) => {
          onChange(item.url, item.alt);
          setOpen(false);
        }}
      />
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Sections & lists
// ---------------------------------------------------------------------------

/** Collapsible card; pass `visible`/`onVisibleChange` to add a "show on site" switch. */
export function SectionCard({
  title,
  description,
  visible,
  onVisibleChange,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  visible?: boolean;
  onVisibleChange?: (v: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hideable = onVisibleChange !== undefined;
  const hidden = hideable && visible === false;

  return (
    <div className={`${cardCls} !p-0 overflow-hidden ${hidden ? "opacity-80" : ""}`}>
      <div className="flex items-center gap-3 px-5 py-3.5 bg-brand-bgSoft/60">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
          aria-expanded={open}
        >
          <ChevronDown
            className={`w-4 h-4 text-brand-muted flex-shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span className="min-w-0">
            <span className="font-heading font-bold text-sm text-brand-dark block">{title}</span>
            {description && (
              <span className="text-[11px] text-brand-muted block truncate">{description}</span>
            )}
          </span>
        </button>
        {hideable && (
          <label className="flex items-center gap-2 text-[11px] font-semibold text-brand-muted flex-shrink-0 cursor-pointer">
            {visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
            <span className="hidden sm:inline">{visible === false ? "Hidden" : "Shown on site"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={visible !== false}
              aria-label={`Show ${title} on the site`}
              onClick={() => onVisibleChange(visible === false)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                visible === false ? "bg-[#C3C4C7]" : "bg-primary"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  visible === false ? "" : "translate-x-4"
                }`}
              />
            </button>
          </label>
        )}
      </div>
      {open && <div className="p-5 space-y-4 border-t border-brand-borderLight">{children}</div>}
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-brand-muted hover:text-red-600 hover:bg-red-50"
          : "text-brand-muted hover:text-primary hover:bg-brand-bgLight"
      }`}
    >
      {children}
    </button>
  );
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Repeating group: add, remove and reorder items. */
export function ListEditor<T>({
  items,
  onChange,
  newItem,
  renderItem,
  addLabel = "Add item",
  itemLabel = "Item",
  summary,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  addLabel?: string;
  itemLabel?: string;
  /** Short text shown in each item's header (e.g. its title). */
  summary?: (item: T) => string;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-xs text-brand-muted italic">Nothing here yet.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-brand-borderLight bg-brand-bgSoft/50">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-brand-borderLight">
            <span className="text-[11px] font-bold text-brand-muted truncate">
              {itemLabel} {i + 1}
              {summary && summary(item) ? ` — ${summary(item)}` : ""}
            </span>
            <div className="flex items-center flex-shrink-0">
              <IconBtn title="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, i - 1))}>
                <ArrowUp className="w-3.5 h-3.5" />
              </IconBtn>
              <IconBtn
                title="Move down"
                disabled={i === items.length - 1}
                onClick={() => onChange(move(items, i, i + 1))}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </IconBtn>
              <IconBtn title="Remove" danger onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-3.5 h-3.5" />
              </IconBtn>
            </div>
          </div>
          <div className="p-3 space-y-3">
            {renderItem(
              item,
              (patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))),
              i
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  );
}

/** A list of plain text lines (paragraphs, bullet points, dropdown options…). */
export function StringList({
  label,
  items,
  onChange,
  addLabel = "Add line",
  multiline = false,
  placeholder,
}: {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((text, i) => (
          <div key={i} className="flex items-start gap-1.5">
            {multiline ? (
              <textarea
                rows={3}
                value={text}
                placeholder={placeholder}
                onChange={(e) => onChange(items.map((t, idx) => (idx === i ? e.target.value : t)))}
                className={inputCls}
              />
            ) : (
              <input
                type="text"
                value={text}
                placeholder={placeholder}
                onChange={(e) => onChange(items.map((t, idx) => (idx === i ? e.target.value : t)))}
                className={inputCls}
              />
            )}
            <div className="flex flex-col flex-shrink-0">
              <IconBtn title="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, i - 1))}>
                <ArrowUp className="w-3.5 h-3.5" />
              </IconBtn>
              <IconBtn
                title="Move down"
                disabled={i === items.length - 1}
                onClick={() => onChange(move(items, i, i + 1))}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </IconBtn>
            </div>
            <IconBtn title="Remove" danger onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-3.5 h-3.5" />
            </IconBtn>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      </div>
    </Field>
  );
}

/**
 * "Which categories to show": automatic (all) or a hand-picked, reorderable list.
 * An empty `value` means all categories.
 */
export function CategoryPicker({
  label = "Categories to show",
  value,
  onChange,
  hint,
}: {
  label?: string;
  value: string[];
  onChange: (slugs: string[]) => void;
  hint?: string;
}) {
  const { categories } = useAdminEnv();
  const real: Category[] = categories.filter((c) => c.slug !== "all");
  const all = value.length === 0;
  const ordered = orderCategories(real);

  const selected = value.filter((s) => real.some((c) => c.slug === s));
  const unselected = ordered.filter((c) => !selected.includes(c.slug));

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-3">
        <Toggle
          label="Show all categories automatically"
          hint="New categories appear on their own."
          checked={all}
          onChange={(on) => onChange(on ? [] : real.map((c) => c.slug))}
        />

        {!all && (
          <div className="rounded-xl border border-brand-borderLight bg-white divide-y divide-brand-borderLight">
            {selected.map((slug, i) => {
              const cat = real.find((c) => c.slug === slug) as Category;
              return (
                <div key={slug} className="flex items-center gap-2 px-3 py-2">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => onChange(selected.filter((s) => s !== slug))}
                    className="accent-[#4E6E58]"
                    aria-label={`Hide ${cat.name}`}
                  />
                  <span className="text-xs font-semibold text-brand-dark flex-1 truncate">{cat.name}</span>
                  <IconBtn title="Move up" disabled={i === 0} onClick={() => onChange(move(selected, i, i - 1))}>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </IconBtn>
                  <IconBtn
                    title="Move down"
                    disabled={i === selected.length - 1}
                    onClick={() => onChange(move(selected, i, i + 1))}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </IconBtn>
                </div>
              );
            })}
            {unselected.map((cat) => (
              <label key={cat.slug} className="flex items-center gap-2 px-3 py-2 cursor-pointer bg-brand-bgSoft/50">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => onChange([...selected, cat.slug])}
                  className="accent-[#4E6E58]"
                />
                <span className="text-xs text-brand-muted flex-1 truncate">{cat.name} (hidden)</span>
              </label>
            ))}
            {selected.length === 0 && unselected.length === 0 && (
              <p className="px-3 py-2 text-xs text-brand-muted">No categories yet.</p>
            )}
          </div>
        )}
      </div>
    </Field>
  );
}
