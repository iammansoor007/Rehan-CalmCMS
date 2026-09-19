export const inputCls =
  "w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark bg-white focus:outline-none focus:border-primary";
export const labelCls = "block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1";
export const cardCls = "bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm";
export const cardTitleCls =
  "font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight";
export const primaryBtnCls =
  "px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed";
export const secondaryBtnCls =
  "px-4 py-2 rounded-lg border border-brand-border bg-white text-brand-dark text-xs font-semibold hover:bg-brand-bgLight transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60";

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
}

/** fetch() wrapper for the admin API: parses JSON and surfaces the server's error message. */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers:
        init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json", ...(init.headers || {}) }
          : init?.headers,
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("cms:unauthorized"));
    }
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "";
    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? (data as T) : null,
      error: res.ok ? "" : message || `Request failed (${res.status})`,
    };
  } catch {
    return { ok: false, status: 0, data: null, error: "Network error. Please try again." };
  }
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(value?: string | Date): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** ISO timestamp -> value for <input type="datetime-local"> (local time). */
export function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (local time) -> ISO timestamp. */
export function fromLocalInput(local: string): string {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function defaultScheduleInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toLocalInput(d.toISOString());
}
