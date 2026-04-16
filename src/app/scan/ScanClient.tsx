"use client";

// ============================================================================
// FILE: src/app/scan/page.tsx   (REEMPLAZA COMPLETO)
// - /scan?mode=order&orderId=...&branch=...&returnTo=...
// - Si existe barcode => agrega a orden y regresa
// - Si NO existe => abre /admin/products/new con returnTo + orderId + mode
// ============================================================================
"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export default function ScanPage() {
  const r = useRouter();
  const sp = useSearchParams();

  const mode = safe(sp.get("mode")); // "order" o ""
  const orderId = safe(sp.get("orderId"));
  const branch = safe(sp.get("branch")) || "sucursal-a";
  const returnTo = safe(sp.get("returnTo"));

  const [user, setUser] = React.useState<User | null>(null);
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      if (!u) return r.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [r]);

  const goBack = () => {
    if (returnTo) r.push(returnTo);
    else r.back();
  };

  const onDetected = async (c: string) => {
    if (!user) return;
    setMsg("");
    setRows([]);
    setCode(c);

    try {
      const res = await apiFetch(user, `/api/products/by-barcode?code=${encodeURIComponent(c)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");

      const found = (json.rows || []) as any[];
      setRows(found);

      const rt = returnTo || (orderId ? `/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}` : "/purchases");

      if (mode === "order" && orderId) {
        if (!found.length) {
          setMsg("No encontrado. Abriendo alta de producto…");
          r.push(
            `/admin/products/new?barcode=${encodeURIComponent(c)}&returnTo=${encodeURIComponent(rt)}&mode=order&orderId=${encodeURIComponent(
              orderId
            )}&branch=${encodeURIComponent(branch)}`
          );
          return;
        }

        const productId = safe(found[0]?.id);
        if (!productId) throw new Error("Producto inválido");

        const addRes = await apiFetch(user, "/api/orders/add-item", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderId, branchId: branch, productId, needQty: "1", note: "" }),
        });
        const addJson = await addRes.json().catch(() => ({}));
        if (!addRes.ok) throw new Error(addJson?.error || "Error al agregar");

        goBack();
        return;
      }

      if (!found.length) {
        setMsg("No encontrado. Abriendo alta de producto…");
        r.push(`/admin/products/new?barcode=${encodeURIComponent(c)}`);
      }
    } catch (e: any) {
      setMsg(String(e?.message || e));
    }
  };

  return (
    <main className="cc-container" style={{ maxWidth: 520 }}>
      <div className="cc-row">
        <button className="cc-btn" onClick={goBack}>
          ← Volver
        </button>
        <button className="cc-btn cc-btn--primary" onClick={() => setOpen(true)} style={{ fontWeight: 1000 }}>
          Escanear
        </button>
      </div>

      <div className="cc-card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 1000, fontSize: 18 }}>Scanner</div>
        <div className="cc-sub">{mode === "order" ? "Modo tienda (agrega a la orden)" : "Modo catálogo"}</div>
        {code ? (
          <div className="cc-sub" style={{ marginTop: 10 }}>
            Código: <b>{code}</b>
          </div>
        ) : null}
        {msg ? (
          <div className="cc-msg" style={{ marginTop: 10 }}>
            ⚠ {msg}
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {rows.map((p) => (
          <div key={p.id} className="cc-card">
            <div style={{ fontWeight: 1000 }}>{p.nameEs || p.name || p.id}</div>
            <div className="cc-sub">
              {p.unitCapture || "—"} • {p.categoryNameEs || p.categoryName || "—"}
            </div>
            <div className="cc-sub">{(p.supplierNames || []).join(" • ")}</div>
          </div>
        ))}
      </div>

      <BarcodeScannerModal open={open} onClose={() => setOpen(false)} onDetected={onDetected} />
    </main>
  );
}