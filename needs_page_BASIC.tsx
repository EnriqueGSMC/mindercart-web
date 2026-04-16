"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { DictationInput } from "@/components/DictationInput";

type Product = {
  id: string;
  nameEs?: string;
  name?: string;
  categoryNameEs?: string;
  categoryName?: string;
  unitCapture?: string;
  defaultUnitCapture?: string;
  defaultOrderQty?: string;
};

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

function label(p: Product) {
  return p.nameEs || p.name || p.id;
}

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export default function NeedsPage() {
  const r = useRouter();

  const [authReady, setAuthReady] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");
  const [uid, setUid] = React.useState("");

  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [searchErr, setSearchErr] = React.useState("");

  const [needQty, setNeedQty] = React.useState("1");
  const [note, setNote] = React.useState("");

  const [rows, setRows] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [busyDelete, setBusyDelete] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const [delTarget, setDelTarget] = React.useState<any | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), async (u) => {
      setAuthReady(true);
      if (!u) {
        setUser(null);
        setEmail("");
        setRole("");
        setUid("");
        r.replace("/login");
        return;
      }
      setUser(u);
      setEmail(u.email || "");
      setUid(u.uid);

      // role desde claims (si existe)
      try {
        const tok = await u.getIdTokenResult();
        setRole(String((tok.claims as any)?.role || ""));
      } catch {
        setRole("");
      }
    });
    return () => unsub();
  }, [r]);

  const loadNeeds = React.useCallback(async (u: User) => {
    const res = await apiFetch(u, "/api/needs/list");
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");
    setRows(json.rows || []);
  }, []);

  // Load inicial + auto-refresh (sin botón)
  React.useEffect(() => {
    if (!user) return;
    setMsg("");
    void loadNeeds(user).catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));

    const t = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadNeeds(user).catch(() => {});
    }, 2500);

    const onFocus = () => void loadNeeds(user).catch(() => {});
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, loadNeeds]);

  React.useEffect(() => {
    if (!user) return;
    setSearchErr("");

    const t = window.setTimeout(async () => {
      try {
        const qq = q.trim();
        if (!qq) {
          setResults([]);
          return;
        }

        const res = await apiFetch(user, `/api/products/search?q=${encodeURIComponent(qq)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error");

        const list = (json.rows || []) as Product[];
        setResults(list);
        if (list.length === 0) setSearchErr("Sin resultados.");
      } catch (e: any) {
        setResults([]);
        setSearchErr(String(e?.message || e));
      }
    }, 180);

    return () => window.clearTimeout(t);
  }, [q, user]);

  const pick = (p: Product) => {
    setSelected(p);
    setResults([]);
    setQ(label(p));
    setNeedQty(String(p.defaultOrderQty || "1"));
    setSearchErr("");
  };

  const addNeed = async () => {
    setMsg("");
    if (!user) return setMsg("⚠ No autenticado");
    if (!selected) return setMsg("⚠ Selecciona un artículo de la lista (autocomplete).");
    if (!needQty.trim()) return setMsg("⚠ needQty requerido");

    setBusy(true);
    try {
      const res = await apiFetch(user, "/api/needs/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: selected.id, needQty, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");

      setSelected(null);
      setQ("");
      setNeedQty("1");
      setNote("");
      await loadNeeds(user);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const canDeleteNeed = (n: any) => {
    const st = safe(n?.status || "OPEN");
    if (st !== "OPEN") return false;
    const createdByUid = safe(n?.createdBy?.uid);
    if (role === "ADMIN" || role === "BUYER") return true;
    if (role === "BASIC") return createdByUid && uid && createdByUid === uid;
    // Si no sabemos role todavía, permitir solo si es propia
    return createdByUid && uid && createdByUid === uid;
  };

  const confirmDelete = async () => {
    if (!user || !delTarget?.id) return;
    setMsg("");
    setBusyDelete(true);
    try {
      const res = await apiFetch(user, "/api/needs/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ needId: delTarget.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      setDelTarget(null);
      await loadNeeds(user);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusyDelete(false);
    }
  };

  if (!authReady) {
    return (
      <main className="cc-container cc-glove" style={{ maxWidth: 520, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
        <h2>Necesidades</h2>
        <div>Cargando sesión…</div>
      </main>
    );
  }

  const visibleRows = (rows || []).filter((n) => safe(n?.status || "OPEN") !== "DELETED");

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <h2 style={{ margin: 0 }}>📝 Necesidades</h2>
      <div style={{ opacity: 0.75, fontSize: 13, marginTop: 6 }}>Usuario: {email}</div>

      <button style={{ marginTop: 10 }} onClick={() => void clientAuth().signOut().then(() => r.replace("/login"))}>
        Salir
      </button>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Buscar artículo</div>

        <DictationInput
          value={q}
          onChange={(v) => {
            setQ(v);
            setSelected(null);
          }}
          placeholder="Ej: cebolla, tortilla, sal…"
          lang="es"
          autoComplete="off"
          enterKeyHint="search"
          dictation="search"
          dictationReplace
        />

        {results.length ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, marginTop: 8, overflow: "hidden" }}>
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => pick(p)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 12,
                  border: "0",
                  borderBottom: "1px solid #eee",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800 }}>{label(p)}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{p.categoryNameEs || p.categoryName || ""}</div>
              </button>
            ))}
          </div>
        ) : null}

        {searchErr ? <div style={{ marginTop: 8, color: "crimson" }}>⚠ {searchErr}</div> : null}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Cantidad</div>
            <DictationInput
              value={needQty}
              onChange={setNeedQty}
              lang="es"
              inputMode="decimal"
              enterKeyHint="done"
              dictation="number"
              dictationReplace
            />
          </div>

          <div style={{ width: 130 }}>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Unidad</div>
            <div style={{ padding: 12, borderRadius: 10, border: "1px solid #eee", background: "#fafafa" }}>
              <b>{selected?.unitCapture || selected?.defaultUnitCapture || "—"}</b>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Nota (opcional)</div>
          <DictationInput value={note} onChange={setNote} placeholder="Ej: marca, tamaño, etc…" lang="es" enterKeyHint="done" dictation="text" />
        </div>

        <button
          onClick={() => void addNeed()}
          style={{
            width: "100%",
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #111",
            background: busy ? "#999" : "#111",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
          disabled={busy || busyDelete}
        >
          {busy ? "Guardando…" : "Agregar necesidad"}
        </button>

        {msg ? <div style={{ marginTop: 10, color: "crimson" }}>{msg}</div> : null}
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ fontWeight: 900 }}>Pendientes ({visibleRows.length})</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>Última acción primero. No se suman cantidades.</div>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {visibleRows.map((n) => (
          <div key={n.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 900, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {n.productName}
              </div>

              {canDeleteNeed(n) ? (
                <button
                  onClick={() => setDelTarget(n)}
                  title="Borrar"
                  aria-label="Borrar"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid #eee",
                    background: "white",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                  disabled={busyDelete}
                >
                  🗑️
                </button>
              ) : null}
            </div>

            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
              Cantidad: <b>{n.needQty}</b> {n.unitCapture || ""} • {n.categoryName || ""} • Prov: {n?.supplierA?.name || "—"}
            </div>

            {n.note ? <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Nota: {n.note}</div> : null}
            {n.warning?.reasonText ? <div style={{ marginTop: 6, color: "crimson" }}>⚠ No comprado antes: {n.warning.reasonText}</div> : null}
          </div>
        ))}
      </div>

      {delTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            padding: 14,
            zIndex: 50,
          }}
          onClick={() => (busyDelete ? null : setDelTarget(null))}
        >
          <div
            style={{ width: "100%", maxWidth: 520, background: "white", borderRadius: 16, padding: 14 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 1000, fontSize: 16 }}>Borrar necesidad</div>
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              <b>{safe(delTarget.productName)}</b>
            </div>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              {safe(delTarget.needQty)} {safe(delTarget.unitCapture)}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ flex: 1, padding: 12 }} onClick={() => setDelTarget(null)} disabled={busyDelete}>
                Cancelar
              </button>
              <button
                style={{ flex: 1, padding: 12, background: "#111", color: "white", fontWeight: 900, borderRadius: 12 }}
                onClick={() => void confirmDelete()}
                disabled={busyDelete}
              >
                {busyDelete ? "Borrando…" : "Sí, borrar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}