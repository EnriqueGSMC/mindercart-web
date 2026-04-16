// FILE: src/app/orders/[orderId]/print/page.tsx
"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Lang = "es" | "en";
type PurchaseState = "PENDING" | "BOUGHT" | "NOT_BOUGHT";

type Line = {
  id: string;
  productId: string;
  productName: string;
  needQty: string;
  unit: string;
  note: string;
  notBoughtReasonText: string;
  purchaseState: PurchaseState;
};

type GroupedLine = {
  key: string;
  productName: string;
  qtyText: string;
  unit: string;
  note: string;
};

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers, cache: "no-store" });
}

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function readLangClient(): Lang {
  if (typeof window === "undefined") return "es";
  try {
    const fromStorage = window.localStorage.getItem("cc_lang") || window.localStorage.getItem("lang") || "";
    if (fromStorage.toLowerCase().startsWith("en")) return "en";
    const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:cc_lang|lang)=([^;]+)/);
    const fromCookie = decodeURIComponent(cookieMatch?.[1] || "").toLowerCase();
    if (fromCookie.startsWith("en")) return "en";
  } catch {}
  return "es";
}

function formatDateOnly(ms: number, lang: Lang) {
  if (!ms) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function parseNum(x: string): number | null {
  const s = String(x ?? "").trim();
  const matches = s.match(/\d+(?:[.,]\d+)?/g);
  if (!matches?.length) return null;
  const n = Number(matches[matches.length - 1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function groupToBuy(lines: Line[]): GroupedLine[] {
  const map = new Map<
    string,
    { productName: string; unit: string; nums: number[]; raws: string[]; notes: Set<string> }
  >();

  for (const l of lines) {
    if (l.purchaseState !== "PENDING" && l.purchaseState !== "NOT_BOUGHT") continue;

    const key = `${safe(l.productId || l.productName).toLowerCase()}__${safe(l.unit).toLowerCase()}`;
    const n = parseNum(l.needQty);

    const cur = map.get(key) || {
      productName: safe(l.productName),
      unit: safe(l.unit),
      nums: [],
      raws: [],
      notes: new Set<string>(),
    };

    if (n === null) cur.raws.push(safe(l.needQty));
    else cur.nums.push(n);

    if (safe(l.note)) cur.notes.add(safe(l.note));
    if (l.purchaseState === "NOT_BOUGHT" && safe(l.notBoughtReasonText)) {
      cur.notes.add(`Prev N/C: ${safe(l.notBoughtReasonText)}`);
    }
    map.set(key, cur);
  }

  const out: GroupedLine[] = [];
  for (const [key, v] of map.entries()) {
    const qtyText = v.nums.length
      ? String(v.nums.reduce((a, b) => a + b, 0))
      : v.raws.filter(Boolean).join(" + ") || "0";

    out.push({
      key,
      productName: v.productName,
      qtyText,
      unit: v.unit,
      note: Array.from(v.notes).join(" | "),
    });
  }

  out.sort((a, b) => a.productName.localeCompare(b.productName, "es"));
  return out;
}

function pendingLabel(lang: Lang, pendingCount: number) {
  if (lang === "en") return `${pendingCount} Pending`;
  return `${pendingCount} ${pendingCount === 1 ? "Pendiente" : "Pendientes"}`;
}

export default function OrderPrintPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const params = useParams<{ orderId: string }>();

  const orderId = decodeURIComponent(params.orderId || "");
  const branch = sp.get("branch") || "sucursal-a";
  const from = safe(sp.get("from"));

  const [lang, setLang] = React.useState<Lang>("es");
  const [user, setUser] = React.useState<User | null>(null);
  const [order, setOrder] = React.useState<any>(null);
  const [msg, setMsg] = React.useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setLang(readLangClient());
    sync();
    window.addEventListener("langchange", sync);
    return () => window.removeEventListener("langchange", sync);
  }, []);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      if (!u) return r.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [r]);

  React.useEffect(() => {
    if (!user) return;
    setMsg("");

    (async () => {
      const res = await apiFetch(
        user,
        `/api/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      setOrder(json.order);
    })().catch((e) => setMsg(`⚠ ${String((e as any)?.message || e)}`));
  }, [user, orderId, branch]);

  const goBack = () => {
    if (from) r.push(from);
    else r.back();
  };

  const supplierName = safe(order?.supplier?.name) || safe(order?.supplierName) || "Proveedor";
  const orderNo = safe(order?.orderNo);

  const addressText =
    safe(order?.supplier?.addressText) ||
    safe(order?.supplierAddressText) ||
    [
      safe(
        order?.supplier?.addressLine1 ||
          order?.supplier?.address1 ||
          order?.supplier?.street ||
          order?.supplier?.address
      ),
      safe(order?.supplier?.city),
      safe(order?.supplier?.state),
      safe(order?.supplier?.postalCode || order?.supplier?.zip),
    ]
      .filter(Boolean)
      .join(", ");

  // Fecha del pedido (autorización preferida; fallback a creación)
  const orderedAtMs = Number((order as any)?.authorizedAtMs || (order as any)?.createdAtMs || (order as any)?.updatedAtMs || 0) || 0;

  const raw = Array.isArray(order?.items) ? order.items : [];
  const lines: Line[] = raw.map((x: any) => ({
    id: safe(x.itemId || x.id || x.productId),
    productId: safe(x.productId),
    productName: safe(x.productName),
    needQty: safe(x.needQty),
    unit: safe(x.unitCapture || ""),
    note: safe(x.note || ""),
    notBoughtReasonText: safe(x.notBoughtReasonText || x.notBoughtReason?.text || ""),
    purchaseState: (safe(x.purchaseState || x.state || "PENDING").toUpperCase() as PurchaseState) || "PENDING",
  }));

  const toBuyLines = lines.filter((x) => x.purchaseState === "PENDING" || x.purchaseState === "NOT_BOUGHT");
  const pendingItemCount = toBuyLines.length;
  const pending = groupToBuy(toBuyLines);

  return (
    <main className="cc-container" style={{ maxWidth: 980 }}>
      <style>{`@media print { .cc-noprint { display:none !important; } }`}</style>

      {msg ? <div className="cc-msg">{msg}</div> : null}

      <div
        className="cc-noprint"
        style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}
      >
        <button className="cc-btn" onClick={goBack}>
          ← {lang === "en" ? "Back" : "Regresar"}
        </button>
        <button className="cc-btn cc-btn--primary" onClick={() => window.print()}>
          {lang === "en" ? "Print / PDF" : "Imprimir / PDF"}
        </button>
      </div>

      <div className="cc-card" style={{ marginTop: 12 }}>
        <div className="cc-head-top">
          <div>
            <div style={{ fontWeight: 1000, fontSize: 18 }}>
              {lang === "en" ? "Purchases Carnitas El Cliente" : "Compras Carnitas El Cliente"}
            </div>
            <div style={{ marginTop: 10, fontWeight: 1000, fontSize: 18 }}>{supplierName}</div>
            {addressText ? <div className="cc-sub" style={{ marginTop: 6 }}>{addressText}</div> : null}
          </div>

          <div className="cc-head-right">
            {orderNo ? (
              <div className="cc-head-line cc-head-line--strong">
                {lang === "en" ? "Order #" : "Orden #"} {orderNo}
              </div>
            ) : null}

            {orderedAtMs ? (
              <div className="cc-head-line">
                {lang === "en" ? "Date: " : "Fecha: "}
                {formatDateOnly(orderedAtMs, lang)}
              </div>
            ) : null}

            {pendingItemCount ? (
              <div className="cc-head-line">{pendingLabel(lang, pendingItemCount)}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="cc-card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 1000, marginBottom: 8 }}>{lang === "en" ? "Pending" : "Pendientes"}</div>

        <table className="cc-invoice">
          <thead>
            <tr>
              <th className="cc-th-item">{lang === "en" ? "Item" : "Artículo"}</th>
              <th className="cc-th-qty">{lang === "en" ? "Qty" : "Cant."}</th>
              <th className="cc-th-unit">{lang === "en" ? "Unit" : "Unidad"}</th>
              <th className="cc-th-notes">{lang === "en" ? "Notes" : "Notas"}</th>
            </tr>
          </thead>

          <tbody>
            {pending.map((x) => (
              <tr key={x.key}>
                <td className="cc-td-item">{x.productName}</td>
                <td className="cc-td-qty">{x.qtyText}</td>
                <td className="cc-td-unit">{x.unit}</td>
                <td className="cc-td-notes">{x.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .cc-container { margin: 0 auto; padding: 14px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
        .cc-card { border: 1px solid #eee; border-radius: 16px; padding: 12px; background: #fff; }
        .cc-sub { opacity: 0.75; font-size: 13px; }
        .cc-msg { margin-top: 10px; padding: 10px 12px; border: 1px solid #ddd; border-radius: 12px; background: #fafafa; font-weight: 800; }
        .cc-btn { padding: 10px 12px; border-radius: 14px; border: 1px solid #ddd; background: #fff; font-weight: 900; }
        .cc-btn--primary { background: #111; color: white; border-color: transparent; }

        .cc-head-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
        .cc-head-right { min-width: 260px; text-align: right; }
        .cc-head-kv { display: grid; gap: 2px; justify-items: end; }
        .cc-head-k { opacity: 0.75; font-size: 12px; font-weight: 900; }
        .cc-head-v { font-weight: 1000; font-size: 13px; }
        .cc-head-line { font-weight: 1000; font-size: 13px; }
        .cc-head-line + .cc-head-line { margin-top: 8px; }
        .cc-head-line--strong { font-size: 14px; }

        .cc-invoice { width: 100%; border-collapse: collapse; table-layout: fixed; border-top: 1px solid #eee; }
        .cc-invoice thead th { border-bottom: 1px solid #eee; padding: 8px 0; font-size: 12px; font-weight: 1000; opacity: 0.85; }

        .cc-th-item { text-align: left; width: 38%; }
        /* SEPARADO + CENTRADO como tu imagen */
        .cc-th-qty  { text-align: center; width: 8%; }
        .cc-th-unit { text-align: center; width: 8%; }
        .cc-th-notes{ text-align: left;  width: 46%; padding-left: 10px; }

        .cc-invoice tbody td { border-bottom: 1px solid #f1f1f1; padding: 8px 0; vertical-align: top; }
        .cc-td-item { font-weight: 950; overflow-wrap: anywhere; }
        /* Datos centrados debajo de su título */
        .cc-td-qty  { text-align: center; white-space: nowrap; font-weight: 1000; }
        .cc-td-unit { text-align: center; white-space: nowrap; font-weight: 1000; }
        .cc-td-notes{ text-align: left; white-space: normal; overflow-wrap: anywhere; opacity: 0.9; font-weight: 900; padding-left: 10px; }
      

        @media screen and (max-width: 520px) {
          .cc-container { padding: 10px; }
          .cc-head-top { flex-direction: column; }
          .cc-head-right { min-width: unset; text-align: left; }

          .cc-invoice thead th { font-size: 11px; padding: 6px 2px; }
          .cc-invoice tbody td { padding: 10px 2px; }

          .cc-th-item { width: 38%; }
          .cc-th-qty  { width: 14%; }
          .cc-th-unit { width: 14%; }
          .cc-th-notes{ width: 34%; padding-left: 6px; }

          .cc-td-notes{ padding-left: 6px; font-weight: 800; }
        }
`}</style>
    </main>
  );
}