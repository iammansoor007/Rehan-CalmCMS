"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle, Link2 } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red styling for destructive actions (delete). */
  danger?: boolean;
}

export interface PromptOptions {
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Show the value for copying instead of asking for one (e.g. a reset link). */
  readOnly?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;
/** Resolves with the typed text, or null when the dialog was cancelled. */
type PromptFn = (opts: PromptOptions) => Promise<string | null>;

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));
const PromptContext = createContext<PromptFn>(() => Promise.resolve(null));

const overlayCls = "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm";
const dialogCls = "w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-border p-6 space-y-5";
const cancelBtnCls =
  "px-4 py-2 rounded-lg border border-brand-border bg-white text-xs font-semibold text-brand-dark hover:bg-brand-bgLight transition-colors";

/**
 * Branded replacement for the browser's `confirm()` and `prompt()` popups. Wrap the
 * admin tree once, then `const confirm = useConfirm(); if (await confirm({...})) …`
 * or `const prompt = usePrompt(); const url = await prompt({...})`.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const [promptOpts, setPromptOpts] = useState<PromptOptions | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const promptResolver = useRef<((v: string | null) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const prompt = useCallback<PromptFn>((o) => {
    setPromptValue(o.defaultValue ?? "");
    setPromptOpts(o);
    return new Promise<string | null>((resolve) => {
      promptResolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  }, []);

  const closePrompt = useCallback((result: string | null) => {
    promptResolver.current?.(result);
    promptResolver.current = null;
    setPromptOpts(null);
  }, []);

  useEffect(() => {
    if (!opts && !promptOpts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (opts) close(false);
      else closePrompt(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, promptOpts, close, closePrompt]);

  return (
    <ConfirmContext.Provider value={confirm}>
      <PromptContext.Provider value={prompt}>
        {children}
        {opts && (
          <div className={overlayCls} onClick={() => close(false)}>
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className={dialogCls}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    opts.danger ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                  }`}
                >
                  {opts.danger ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                </span>
                <div className="min-w-0">
                  <h3 id="confirm-title" className="font-heading font-bold text-base text-brand-dark">
                    {opts.title}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1.5 leading-relaxed whitespace-pre-line">
                    {opts.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => close(false)} className={cancelBtnCls}>
                  {opts.cancelLabel || "Cancel"}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => close(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
                    opts.danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  {opts.confirmLabel || "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        {promptOpts && (
          <div className={overlayCls} onClick={() => closePrompt(null)}>
            <form
              role="dialog"
              aria-modal="true"
              aria-labelledby="prompt-title"
              className={dialogCls}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                closePrompt(promptValue);
              }}
            >
              <div className="flex items-start gap-4">
                <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                  <Link2 className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 id="prompt-title" className="font-heading font-bold text-base text-brand-dark">
                    {promptOpts.title}
                  </h3>
                  {promptOpts.message && (
                    <p className="text-xs text-brand-muted mt-1.5 leading-relaxed whitespace-pre-line">
                      {promptOpts.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {promptOpts.label && (
                  <label htmlFor="prompt-input" className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                    {promptOpts.label}
                  </label>
                )}
                <input
                  id="prompt-input"
                  type="text"
                  autoFocus
                  readOnly={promptOpts.readOnly}
                  value={promptValue}
                  placeholder={promptOpts.placeholder}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setPromptValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border text-xs text-brand-dark bg-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => closePrompt(null)} className={cancelBtnCls}>
                  {promptOpts.cancelLabel || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm bg-primary hover:bg-primary-dark transition-colors"
                >
                  {promptOpts.confirmLabel || "OK"}
                </button>
              </div>
            </form>
          </div>
        )}
      </PromptContext.Provider>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}

export function usePrompt(): PromptFn {
  return useContext(PromptContext);
}
