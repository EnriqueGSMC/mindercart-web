// =======================================================
// FILE: src/lib/modes.ts
// =======================================================
export type SearchParams = Record<string, string | string[] | undefined>;

export type PurchasesMode = "frozen" | "experimental";
export type OrdersMode = "frozen" | "experimental" | "frozenCopy";

export function firstParam(sp: SearchParams | undefined, key: string): string {
  const v = sp?.[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] || "";
  return "";
}

function norm(v: unknown): string {
  return String(v ?? "").toLowerCase().trim();
}

export function resolvePurchasesMode(sp?: SearchParams): PurchasesMode {
  const qp = norm(firstParam(sp, "purchasesMode"));
  if (qp === "experimental" || qp === "exp" || qp === "new") return "experimental";
  if (qp === "frozen" || qp === "safe" || qp === "old") return "frozen";

  const env = norm(process.env.NEXT_PUBLIC_PURCHASES_MODE);
  if (env === "experimental" || env === "exp" || env === "new") return "experimental";

  return "frozen";
}

export function resolveOrdersMode(sp?: SearchParams): OrdersMode {
  const qp = norm(firstParam(sp, "ordersMode"));
  if (qp === "experimental" || qp === "exp" || qp === "new") return "experimental";
  if (qp === "frozencopy" || qp === "copy") return "frozenCopy";
  if (qp === "frozen" || qp === "safe" || qp === "old") return "frozen";

  const env = norm(process.env.NEXT_PUBLIC_ORDERS_MODE);
  if (env === "experimental" || env === "exp" || env === "new") return "experimental";
  if (env === "frozencopy" || env === "copy") return "frozenCopy";

  return "frozen";
}