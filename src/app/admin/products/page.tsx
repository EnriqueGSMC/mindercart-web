// ============================================================================
// FILE: src/app/admin/products/page.tsx   (REEMPLAZA COMPLETO)
// - Editar barcode + botón Escanear
// ============================================================================
"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { DictationInput } from "@/components/DictationInput";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

type ProductRow = {
  id: string;
  name: string;
  nameEs?: string;
  unitCapture?: string;
  categoryName?: string;
  categoryNameEs?: string;
  supplierNames?: string[];
  barcode?: string;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export default function AdminProductsPage() {
  const r = useRouter();
  const [user, setUser] = React.useState<User | null>(null);

  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<ProductRow[]>([]);
  const [selected, setSelected] = React.useState<ProductRow | null>(null);

  const [barcode, setBarcode] = React.useState("");
  const [scanOpen, setScanOpen] = React.useState(false);

  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      if (!u) return r.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [r]);

  const search = React.useCallback(async () => {
    if (!user) return;
    setMsg("");
    const res = await apiFetch(user, `/api/products/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");
    setRows(json.rows || []);
  }, [user, q]);

  React.useEffect(() => {
    if (!user) return;
    void search().catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));
  }, [user, search]);

  const pick = (p: ProductRow) => {
    setSelected(p);
    setBarcode(safe((p as any)?.barcode));
    setMsg("");
  };

  const save = async () => {
    if (!user || !selected) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await apiFetch(user, "/api/products/update-barcode", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: selected.id, barcode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      setMsg("✅ Barcode guardado");
      await search();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>🧾 Productos (Barcode)</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => r.push("/admin/products/new")}>Alta rápida</button>
          <button onClick={() => void clientAuth().signOut().then(() => r.replace("/login"))}>Salir</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <DictationInput
            placeholder="Buscar producto… (ej: aceite, cebolla)"
            value={q}
            onChange={setQ}
            lang="es"
            enterKeyHint="search"
            autoComplete="off"
          />
        </div>
        <button onClick={() => void search()} disabled={!user}>
          Buscar
        </button>
      </div>

      {msg ? <div style={{ marginTop: 10, color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Lista</div>
          <div style={{ display: "grid", gap: 8, maxHeight: 520, overflow: "auto" }}>
            {rows.map((p) => (
              <button
                key={p.id}
                onClick={() => pick(p)}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderRadius: 12,
                  border: selected?.id === p.id ? "2px solid #111" : "1px solid #eee",
                  background: "white",
                }}
              >
                <div style={{ fontWeight: 900 }}>{safe(p.nameEs || p.name || p.id)}</div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>
                  {p.unitCapture || "—"} • {safe(p.categoryNameEs || p.categoryName || "—")}
                </div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {(p.supplierNames || []).join(" • ") || "Sin proveedor"}
                </div>
                {safe((p as any)?.barcode) ? (
                  <div style={{ opacity: 0.8, fontSize: 12 }}>Barcode: {safe((p as any).barcode)}</div>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Editar</div>
          {!selected ? (
            <div style={{ opacity: 0.7 }}>Selecciona un producto.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>{safe(selected.nameEs || selected.name)}</div>
              <div style={{ opacity: 0.75, fontSize: 12 }}>ID: {selected.id}</div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <DictationInput
                    placeholder="Barcode (1 por producto)"
                    value={barcode}
                    onChange={setBarcode}
                    lang="es"
                    inputMode="numeric"
                    enterKeyHint="done"
                  />
                </div>
                <button onClick={() => setScanOpen(true)} style={{ padding: "12px 14px", borderRadius: 12, fontWeight: 900 }}>
                  Escanear
                </button>
              </div>

              <button onClick={() => void save()} disabled={busy} style={{ padding: 12, borderRadius: 12, fontWeight: 900 }}>
                {busy ? "Guardando…" : "Guardar barcode"}
              </button>
            </div>
          )}
        </div>
      </div>

      <BarcodeScannerModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDetected={(code) => setBarcode(code)}
      />
    </main>
  );
}
