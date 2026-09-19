"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Eraser,
  Undo2,
  Redo2,
} from "lucide-react";

export interface RichTextEditorHandle {
  /** Inserts an image at the caret (restoring the position it had before the media picker opened). */
  insertImage: (url: string, alt?: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Called when the toolbar's image button is clicked; open a media picker, then call insertImage. */
  onRequestImage?: () => void;
  minHeight?: number;
  placeholder?: string;
}

const PASTE_TAGS = new Set([
  "P", "BR", "H2", "H3", "H4", "STRONG", "B", "EM", "I", "U", "S", "STRIKE", "UL", "OL", "LI",
  "BLOCKQUOTE", "A", "IMG", "HR", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
]);

const escapeAttr = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Reduces pasted HTML (Word, Google Docs, web pages) to the tags the editor supports. */
function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const clean = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    if (["SCRIPT", "STYLE", "META", "LINK", "TITLE"].includes(el.tagName)) return "";
    const inner = Array.from(el.childNodes).map(clean).join("");
    if (!PASTE_TAGS.has(el.tagName)) return inner;

    const tag = el.tagName.toLowerCase();
    if (tag === "br" || tag === "hr") return `<${tag}>`;
    if (tag === "a") {
      const href = el.getAttribute("href") || "";
      return /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? `<a href="${escapeAttr(href)}">${inner}</a>` : inner;
    }
    if (tag === "img") {
      const src = el.getAttribute("src") || "";
      return /^(https?:|\/)/i.test(src)
        ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(el.getAttribute("alt") || "")}">`
        : "";
    }
    return `<${tag}>${inner}</${tag}>`;
  };

  return Array.from(doc.body.childNodes).map(clean).join("");
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // keep the caret/selection inside the editor while clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-1.5 rounded text-[#3C434A] hover:bg-white hover:text-primary hover:shadow-sm transition-colors"
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="w-px h-5 bg-[#DCDCDE] mx-1" />;

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    { value, onChange, onRequestImage, minHeight = 380, placeholder = "Start writing your post…" },
    ref
  ) {
    const [mode, setMode] = useState<"visual" | "html">("visual");
    const editorRef = useRef<HTMLDivElement>(null);
    const lastHtml = useRef<string | null>(null);
    const savedRange = useRef<Range | null>(null);

    // Push outside changes (initial load, HTML tab edits) into the visual editor
    // without disturbing the caret while the user is typing.
    useEffect(() => {
      const el = editorRef.current;
      if (el && value !== lastHtml.current) {
        el.innerHTML = value;
        lastHtml.current = value;
      }
    }, [value]);

    const emit = () => {
      const el = editorRef.current;
      if (!el) return;
      let html = el.innerHTML;
      if (html === "<br>") html = "";
      lastHtml.current = html;
      onChange(html);
    };

    const rememberSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    };

    const restoreSelection = () => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      if (savedRange.current && sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    };

    const exec = (command: string, arg?: string) => {
      // The text-style <select> takes focus from the editor, so put the caret back first.
      if (document.activeElement !== editorRef.current) restoreSelection();
      document.execCommand(command, false, arg);
      emit();
    };

    useImperativeHandle(ref, () => ({
      insertImage(url: string, alt = "") {
        restoreSelection();
        document.execCommand(
          "insertHTML",
          false,
          `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}">`
        );
        emit();
      },
    }));

    const addLink = () => {
      rememberSelection();
      const input = window.prompt("Link URL (e.g. https://example.com or /about)");
      if (!input) return;
      const url = /^(https?:|mailto:|tel:|\/|#)/i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
      restoreSelection();
      const sel = window.getSelection();
      if (sel && sel.isCollapsed) {
        document.execCommand("insertHTML", false, `<a href="${escapeAttr(url)}">${escapeAttr(url)}</a>`);
      } else {
        document.execCommand("createLink", false, url);
      }
      emit();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");
      e.preventDefault();
      if (html) {
        document.execCommand("insertHTML", false, cleanPastedHtml(html));
      } else {
        document.execCommand("insertText", false, text);
      }
      emit();
    };

    const wordCount = (() => {
      const text = value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
      return text ? text.split(/\s+/).length : 0;
    })();

    return (
      <div className="border border-[#DCDCDE] rounded-lg overflow-hidden bg-white">
        {/* Tabs */}
        <div className="flex items-center justify-between bg-[#F6F7F7] border-b border-[#DCDCDE] px-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted px-2 pb-2">
            Content
          </span>
          <div className="flex items-end gap-1">
            {(["visual", "html"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-t-md border border-b-0 ${
                  mode === m
                    ? "bg-white text-brand-dark border-[#DCDCDE] -mb-px"
                    : "bg-[#EBECED] text-brand-muted border-transparent hover:text-brand-dark"
                }`}
              >
                {m === "visual" ? "Visual" : "Text (HTML)"}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        {mode === "visual" && (
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[#F6F7F7] border-b border-[#DCDCDE]">
            <select
              aria-label="Text style"
              defaultValue="p"
              onChange={(e) => {
                exec("formatBlock", `<${e.target.value}>`);
                e.target.value = "p";
              }}
              className="text-xs text-brand-dark bg-white border border-[#DCDCDE] rounded px-2 py-1 mr-1 focus:outline-none"
            >
              <option value="p">Paragraph</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="blockquote">Quote</option>
            </select>

            <ToolButton label="Bold (Ctrl+B)" onClick={() => exec("bold")}>
              <Bold className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Italic (Ctrl+I)" onClick={() => exec("italic")}>
              <Italic className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Underline (Ctrl+U)" onClick={() => exec("underline")}>
              <Underline className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Strikethrough" onClick={() => exec("strikeThrough")}>
              <Strikethrough className="w-4 h-4" />
            </ToolButton>
            <Divider />
            <ToolButton label="Bulleted list" onClick={() => exec("insertUnorderedList")}>
              <List className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
              <ListOrdered className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Blockquote" onClick={() => exec("formatBlock", "<blockquote>")}>
              <Quote className="w-4 h-4" />
            </ToolButton>
            <Divider />
            <ToolButton label="Align left" onClick={() => exec("justifyLeft")}>
              <AlignLeft className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Align center" onClick={() => exec("justifyCenter")}>
              <AlignCenter className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Align right" onClick={() => exec("justifyRight")}>
              <AlignRight className="w-4 h-4" />
            </ToolButton>
            <Divider />
            <ToolButton label="Insert link" onClick={addLink}>
              <Link2 className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Remove link" onClick={() => exec("unlink")}>
              <Link2Off className="w-4 h-4" />
            </ToolButton>
            {onRequestImage && (
              <ToolButton
                label="Insert image from media library"
                onClick={() => {
                  rememberSelection();
                  onRequestImage();
                }}
              >
                <ImageIcon className="w-4 h-4" />
              </ToolButton>
            )}
            <ToolButton label="Horizontal line" onClick={() => exec("insertHorizontalRule")}>
              <Minus className="w-4 h-4" />
            </ToolButton>
            <Divider />
            <ToolButton label="Clear formatting" onClick={() => exec("removeFormat")}>
              <Eraser className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Undo" onClick={() => exec("undo")}>
              <Undo2 className="w-4 h-4" />
            </ToolButton>
            <ToolButton label="Redo" onClick={() => exec("redo")}>
              <Redo2 className="w-4 h-4" />
            </ToolButton>
          </div>
        )}

        {/* Visual surface (kept mounted so the caret/undo history survive tab switches) */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={rememberSelection}
          onPaste={handlePaste}
          className={`cms-content cms-editor px-5 py-4 focus:outline-none ${mode === "visual" ? "" : "hidden"}`}
          style={{ minHeight }}
        />

        {mode === "html" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="w-full px-5 py-4 font-mono text-xs text-brand-dark leading-relaxed focus:outline-none resize-y"
            style={{ minHeight }}
          />
        )}

        <div className="flex items-center justify-between px-4 py-2 bg-[#F6F7F7] border-t border-[#DCDCDE] text-[11px] text-brand-muted">
          <span>Word count: {wordCount}</span>
          <span>Tip: paste from Word or Google Docs — formatting is cleaned automatically.</span>
        </div>
      </div>
    );
  }
);
