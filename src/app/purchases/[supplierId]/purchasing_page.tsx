"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter, useSearchParams, useParams } from "next/navigation";

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

export default function SupplierNeedsPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const params = useParams<{ supplierId: string }>();

  const [user, setUser] = React.useState<User | null>(null);
  const [msg, setMsg] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState(false);

  const branch = sp.get("branch") || "sucursal-a";
  const supplierId = decodeURIComponent(params.supplierId || "");

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
    const res = await apiFetch(user, `/api/purchases/supplier?supplierId=${encodeURIComponent(supplierId)}&branch=${encodeURIComponent(branch)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");
    setRows(json.rows || []);
    setSupplierName(json.supplierName || supplierId);
  }, [user, supplierId, branch]);

  React.useEffect(() => {
    if (!user) return;
    void load().catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));
    const t = window.setInterval(() => void load().catch(() => {}), 5000);
    return () => window.clearInterval(t);
  }, [user, load]);

  const createOrder = async () => {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiFetch(user, "/api/orders/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ supplierId, supplierName, branchId: branch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      r.replace(`/orders/${json.orderId}?branch=${encodeURIComponent(branch)}`);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <button onClick={() => r.push("/purchases")} style={{ marginBottom: 10 }}>
        ← Proveedores
      </button>

      <h2 style={{ margin: 0 }}>{supplierName}</h2>
      <div style={{ opacity: 0.75, marginTop: 6 }}>{rows.length} artículo(s) abierto(s)</div>

      <button
        disabled={busy || rows.length === 0}
        onClick={() => void createOrder()}
        style={{
          width: "100%",
          marginTop: 12,
          padding: 14,
          borderRadius: 14,
          border: "1px solid #111",
          background: busy ? "#999" : "#111",
          color: "white",
          fontWeight: 900,
        }}
      >
        {busy ? "Generando…" : "Generar pedido"}
      </button>

      {msg ? <div style={{ marginTop: 10, color: "crimson" }}>{msg}</div> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {rows.map((n) => (
          <div key={n.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 900 }}>{n.productName}</div>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              needQty: <b>{n.needQty}</b> {n.unitCapture || ""} • {n.categoryName || ""}
            </div>
            {n.note ? <div style={{ marginTop: 6, opacity: 0.85 }}>Nota: {n.note}</div> : null}
            {n.warning?.reasonText ? (
              <div style={{ marginTop: 6, color: "crimson" }}>⚠ No comprado antes: {n.warning.reasonText}</div>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}