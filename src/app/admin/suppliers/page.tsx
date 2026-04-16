// ============================================================================
// FILE: src/app/admin/suppliers/page.tsx  (REEMPLAZA COMPLETO)
// - añade campo Teléfono
// ============================================================================
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

type Supplier = {
  id: string;
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  googleMapsUrl?: string;
  website?: string;
  phone?: string;
  notes?: string;
};

export default function AdminSuppliersPage() {
  const r = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<Supplier[]>([]);
  const [selected, setSelected] = React.useState<Supplier | null>(null);
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
    setMsg("");
    const res = await apiFetch(user, `/api/suppliers/list?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");
    setRows(json.rows || []);
  }, [user, q]);

  React.useEffect(() => {
    if (!user) return;
    void load().catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));
  }, [user, load]);

  const save = async () => {
    if (!user || !selected) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiFetch(user, "/api/suppliers/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(selected),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      await load();
      setMsg("✅ Guardado");
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>🏪 Proveedores (Admin)</h2>
        <button onClick={() => void clientAuth().signOut().then(() => r.replace("/login"))}>Salir</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          placeholder="Buscar proveedor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #ccc" }}
        />
        <button onClick={() => void load()} disabled={!user}>
          Buscar
        </button>
      </div>

      {msg ? <div style={{ marginTop: 10, color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Lista</div>
          <div style={{ display: "grid", gap: 8, maxHeight: 520, overflow: "auto" }}>
            {rows.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected({ ...s })}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 12,
                  border: selected?.id === s.id ? "2px solid #111" : "1px solid #eee",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800 }}>{s.name || s.id}</div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {s.addressLine1 ? `${s.addressLine1}, ${s.city || ""} ${s.state || ""} ${s.zip || ""}` : "Sin dirección"}
                </div>
                {s.phone ? <div style={{ opacity: 0.7, fontSize: 12 }}>Tel: {s.phone}</div> : null}
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Editar</div>
          {!selected ? (
            <div style={{ opacity: 0.7 }}>Selecciona un proveedor.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 800 }}>{selected.name || selected.id}</div>

              <input
                placeholder="Teléfono (opcional)"
                value={selected.phone || ""}
                onChange={(e) => setSelected({ ...selected, phone: e.target.value })}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
              />

              <input
                placeholder="Dirección 1"
                value={selected.addressLine1 || ""}
                onChange={(e) => setSelected({ ...selected, addressLine1: e.target.value })}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <input
                placeholder="Dirección 2"
                value={selected.addressLine2 || ""}
                onChange={(e) => setSelected({ ...selected, addressLine2: e.target.value })}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Ciudad"
                  value={selected.city || ""}
                  onChange={(e) => setSelected({ ...selected, city: e.target.value })}
                  style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
                />
                <input
                  placeholder="Estado"
                  value={selected.state || ""}
                  onChange={(e) => setSelected({ ...selected, state: e.target.value })}
                  style={{ width: 140, padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
                />
                <input
                  placeholder="CP"
                  value={selected.zip || ""}
                  onChange={(e) => setSelected({ ...selected, zip: e.target.value })}
                  style={{ width: 120, padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
                />
              </div>

              <input
                placeholder="Google Maps URL (opcional)"
                value={selected.googleMapsUrl || ""}
                onChange={(e) => setSelected({ ...selected, googleMapsUrl: e.target.value })}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <input
                placeholder="Website (opcional)"
                value={selected.website || ""}
                onChange={(e) => setSelected({ ...selected, website: e.target.value })}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
              />
              <input
                placeholder="Notas"
                value={selected.notes || ""}
                onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
              />

              <button onClick={() => void save()} disabled={busy} style={{ padding: 12, borderRadius: 12, fontWeight: 900 }}>
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}