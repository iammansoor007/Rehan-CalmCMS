"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red styling for destructive actions (delete). */
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));

/**
 * Styled replacement for the browser's `confirm()` popup. Wrap the admin tree once,
 * then `const confirm = useConfirm(); if (await confirm({...})) …`.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  }, []);

  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-border p-6 space-y-5"
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
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg border border-brand-border bg-white text-xs font-semibold text-brand-dark hover:bg-brand-bgLight transition-colors"
              >
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
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}
