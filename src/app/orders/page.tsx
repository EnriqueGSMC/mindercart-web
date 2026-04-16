"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

async function apiFetch(user: User, path: string) {
  const token = await user.getIdToken();
  return fetch(path, { headers: { authorization: `Bearer ${token}` } });
}

export default function OrdersPage() {
  const r = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [rows, setRows] = React.useState<any[]>([]);
  const [msg, setMsg] = React.useState("");

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
    const res = await apiFetch(user, "/api/orders/list?branch=sucursal-a");
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");
    setRows(json.rows || []);
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    void load().catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));
  }, [user, load]);

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <button onClick={() => r.push("/purchases")} style={{ marginBottom: 10 }}>
        ← Compras
      </button>
      <h2 style={{ margin: 0 }}>📚 Historial de pedidos</h2>
      {msg ? <div style={{ marginTop: 10, color: "crimson" }}>{msg}</div> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {rows.map((o) => (
          <button
            key={o.id}
            onClick={() => r.push(`/orders/${o.id}?branch=sucursal-a`)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 14,
              border: "1px solid #eee",
              background: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 900 }}>{o?.supplier?.name || "Proveedor"}</div>
            <div style={{ opacity: 0.75, marginTop: 6 }}>
              {o.status} • {(o.items || []).length} items
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}