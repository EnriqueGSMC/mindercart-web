// ============================================================================
// FILE: src/app/purchases/[supplierId]/page.tsx  (REEMPLAZA COMPLETO)
// - Muestra lista consolidada (sumando repetidos) para revisar antes de generar pedido
// - Auto-refresh
// ============================================================================

"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { getLang, type Lang } from "@/lib/lang";

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function parseNum(x: unknown): number | null {
  const s = safe(x).replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type Consolidated = {
  key: string;
  productId: string;
  productName: string;
  unit: string;
  qtyText: string;
  notes: string[];
  count: number;
  warnings: string[];
};

export default function SupplierNeedsPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const params = useParams<{ supplierId: string }>();

  const [lang, setLang] = React.useState<Lang>("es");
  const [user, setUser] = React.useState<User | null>(null);

  const [supplierName, setSupplierName] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const branch = sp.get("branch") || "sucursal-a";
  const supplierId = decodeURIComponent(params.supplierId || "");

  React.useEffect(() => {
    const sync = () => setLang(getLang());
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

  const load = React.useCallback(async () => {
    if (!user) return;
    setMsg("");
    const res = await apiFetch(
      user,
      `/api/purchases/supplier?supplierId=${encodeURIComponent(supplierId)}&branch=${encodeURIComponent(branch)}`
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");
    setRows(Array.isArray(json.rows) ? json.rows : []);
    setSupplierName(String(json.supplierName || supplierId));
  }, [user, supplierId, branch]);

  React.useEffect(() => {
    if (!user) return;
    void load().catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));

    const t = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void load().catch(() => {});
    }, 3000);

    return () => window.clearInterval(t);
  }, [user, load]);

  const consolidated = React.useMemo<Consolidated[]>(() => {
    const m = new Map<string, { productId: string; productName: string; unit: string; nums: number[]; raws: string[]; notes: Set<string>; warnings: Set<string>; count: number }>();

    for (const it of rows) {
      const pid = safe(it?.productId);
      const name = safe(it?.productName) || "Artículo";
      const unit = safe(it?.unitCapture);
      const key = `${pid || name.toLowerCase()}__${unit}`;

      const qn = parseNum(it?.needQty);
      const cur = m.get(key) || { productId: pid, productName: name, unit, nums: [], raws: [], notes: new Set<string>(), warnings: new Set<string>(), count: 0 };

      if (qn === null) cur.raws.push(safe(it?.needQty));
      else cur.nums.push(qn);

      const note = safe(it?.note);
      if (note) cur.notes.add(note);

      const warn = safe(it?.warning?.reasonText);
      if (warn) cur.warnings.add(warn);

      cur.count += 1;
      m.set(key, cur);
    }

    const out: Consolidated[] = [];
    for (const [key, v] of m.entries()) {
      const sum = v.nums.length ? v.nums.reduce((a, b) => a + b, 0) : null;
      const qtyText = sum !== null ? String(sum) : v.raws.filter(Boolean).join(" + ") || "0";
      out.push({
        key,
        productId: v.productId,
        productName: v.productName,
        unit: v.unit,
        qtyText,
        notes: Array.from(v.notes.values()),
        warnings: Array.from(v.warnings.values()),
        count: v.count,
      });
    }
    return out.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [rows]);

  const createOrder = async () => {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiFetch(user, "/api/orders/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ supplierId, branchId: branch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      const orderId = String(json?.orderId || json?.id || "");
      if (!orderId) throw new Error("No se recibió orderId");
      r.push(`/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}`);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <button onClick={() => r.push(`/purchases?branch=${encodeURIComponent(branch)}`)} style={{ padding: "10px 12px" }}>
          ← {lang === "en" ? "Suppliers" : "Proveedores"}
        </button>
      </div>

      <div style={{ marginTop: 10, fontWeight: 1000, fontSize: 18 }}>{supplierName || supplierId}</div>
      <div style={{ marginTop: 4, opacity: 0.75, fontSize: 12 }}>Sucursal: {branch}</div>

      {msg ? <div style={{ marginTop: 10, color: "crimson" }}>{msg}</div> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {consolidated.length === 0 ? <div style={{ opacity: 0.75 }}>{lang === "en" ? "No open needs." : "No hay necesidades abiertas."}</div> : null}

        {consolidated.map((x) => (
          <div key={x.key} style={{ border: "1px solid #eee", borderRadius: 16, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 1000 }}>{x.productName}</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              <b>{x.qtyText}</b> {x.unit || ""}
              <span style={{ marginLeft: 8, opacity: 0.6, fontSize: 12 }}>({x.count})</span>
            </div>
            {x.notes.length ? <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>📝 {x.notes.join(" | ")}</div> : null}
            {x.warnings.length ? <div style={{ marginTop: 6, color: "crimson", fontSize: 12 }}>⚠ {x.warnings.join(" | ")}</div> : null}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button style={{ flex: 1 }} onClick={() => void createOrder()} disabled={busy}>
          {busy ? (lang === "en" ? "Creating…" : "Generando…") : lang === "en" ? "Create order" : "Generar pedido"}
        </button>
      </div>
    </main>
  );
}