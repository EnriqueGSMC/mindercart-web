"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

type Row = {
  id: string;
  name?: string;
  branchCode?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export default function AdminBranchesPage() {
  const r = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      if (!u) return r.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [r]);

  const load = React.useCallback(async () => {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiFetch(user, "/api/branches/list");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      setRows(json.rows || []);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    void load();
  }, [user, load]);

  const save = async (row: Row) => {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiFetch(user, "/api/branches/upsert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...row, branchId: row.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      setMsg("✅ Guardado");
      await load();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const setField = (id: string, k: keyof Row, v: string) => {
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  };

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Sucursales</h2>
        <button onClick={() => r.push("/admin/products")}>Productos</button>
      </div>

      {msg ? <div style={{ marginTop: 10, color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</div> : null}
      {busy ? <div style={{ marginTop: 10, opacity: 0.75 }}>Procesando…</div> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {rows.map((b) => (
          <div key={b.id} style={{ border: "1px solid #eee", borderRadius: 16, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 1000 }}>{b.name || b.id}</div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>ID: {b.id}</div>

            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              <input
                placeholder="Nombre (ej: Sucursal A)"
                value={b.name || ""}
                onChange={(e) => setField(b.id, "name", e.target.value)}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <input
                placeholder="BranchCode (A/B/C)"
                value={b.branchCode || ""}
                onChange={(e) => setField(b.id, "branchCode", e.target.value.toUpperCase())}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc", maxWidth: 160 }}
                maxLength={3}
              />
              <input
                placeholder="Dirección (línea 1)"
                value={b.addressLine1 || ""}
                onChange={(e) => setField(b.id, "addressLine1", e.target.value)}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Ciudad"
                  value={b.city || ""}
                  onChange={(e) => setField(b.id, "city", e.target.value)}
                  style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc", flex: 1 }}
                />
                <input
                  placeholder="Estado"
                  value={b.state || ""}
                  onChange={(e) => setField(b.id, "state", e.target.value)}
                  style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc", width: 120 }}
                />
                <input
                  placeholder="CP"
                  value={b.zip || ""}
                  onChange={(e) => setField(b.id, "zip", e.target.value)}
                  style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc", width: 140 }}
                />
              </div>

              <button onClick={() => void save(b)} disabled={busy} style={{ padding: 12, borderRadius: 14, fontWeight: 900 }}>
                Guardar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}