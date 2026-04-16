// FILE: src/lib/urls.ts
export type OrdersModeParam = "copy" | "frozen" | "experimental" | "frozenCopy";

type Primitive = string | number | boolean | null | undefined;

function addExtras(params: URLSearchParams, extra?: Record<string, Primitive>) {
  if (!extra) return;
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }
}

/**
 * Build a URL to /orders/[orderId] ensuring ordersMode=copy by default.
 * Use this for every navigation that opens "En tienda".
 */
export function buildOrdersUrl(opts: {
  orderId: string;
  branch: string;
  mode?: string; // e.g. "BUYING"
  from?: string; // e.g. "/purchases?branch=...&tab=AUTHORIZED..."
  ordersMode?: OrdersModeParam; // default: "copy"
  extra?: Record<string, Primitive>;
}): string {
  const {
    orderId,
    branch,
    mode = "BUYING",
    from = "purchases",
    ordersMode = "copy",
    extra,
  } = opts;

  const params = new URLSearchParams();
  params.set("branch", branch);
  if (mode) params.set("mode", mode);
  if (from) params.set("from", from);
  params.set("ordersMode", ordersMode);
  addExtras(params, extra);

  return `/orders/${encodeURIComponent(orderId)}?${params.toString()}`;
}

/**
 * Build a URL to /orders/[orderId]/print, adding a cache-buster _v=Date.now() by default.
 * This avoids mobile browsers reusing a stale /print view.
 */
export function buildOrderPrintUrl(opts: {
  orderId: string;
  branch: string;
  cacheBust?: boolean; // default true
  ordersMode?: OrdersModeParam; // optional (harmless)
  extra?: Record<string, Primitive>;
}): string {
  const { orderId, branch, cacheBust = true, ordersMode, extra } = opts;

  const params = new URLSearchParams();
  params.set("branch", branch);
  if (ordersMode) params.set("ordersMode", ordersMode);
  if (cacheBust) params.set("_v", String(Date.now()));
  addExtras(params, extra);

  return `/orders/${encodeURIComponent(orderId)}/print?${params.toString()}`;
}

/**
 * If you already have an /orders/... URL, force ordersMode=copy (preserves the rest).
 */
export function ensureOrdersModeCopy(url: string): string {
  const [path, qs = ""] = url.split("?");
  const params = new URLSearchParams(qs);
  if (!params.get("ordersMode")) params.set("ordersMode", "copy");
  return `${path}?${params.toString()}`;
}

/**
 * If you already have a /print URL, force a cache-buster _v=Date.now() (preserves the rest).
 */
export function ensurePrintCacheBust(url: string): string {
  const [path, qs = ""] = url.split("?");
  const params = new URLSearchParams(qs);
  params.set("_v", String(Date.now()));
  return `${path}?${params.toString()}`;
}
