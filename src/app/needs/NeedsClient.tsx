"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { DictationInput } from "@/components/DictationInput";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";
import { ModalShell } from "@/components/ModalShell";
import { getLang, t } from "@/lib/lang";

type Product = {
  id: string;
  nameEs?: string;
  name?: string;
  unitCapture?: string;
  barcode?: string;
  supplierId?: string;
  supplierName?: string;
  categoryId?: string;
  categoryName?: string;
};

type NeedRow = {
  id: string;
  productId: string;
  productName: string;
  unitCapture?: string;
  needQty: string;
  note?: string;
  status?: string;
  createdAtMs?: number;
  updatedAtMs?: number;

  lastPurchaseState?: string;
  lastNotBoughtReasonText?: string;
  lastPurchaseOrderNo?: string;
  lastPurchaseOrderId?: string;
  lastPurchaseAtMs?: number;
  lastPurchaseSupplierId?: string;
  lastPurchaseSupplierName?: string;
};

type OptionRow = {
  id: string;
  name: string;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function norm(v: unknown) {
  return safe(v).toLowerCase();
}

function label(p: Product) {
  return safe(p.nameEs || p.name || "");
}

function dedupeProductsByLabel(items: Product[]) {
  const out: Product[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const key = norm(label(item));
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function isVisibleNeedStatus(v: unknown) {
  const s = norm(v);
  return !["deleted", "cancelled", "canceled", "closed", "received"].includes(s);

}

function formatAttempt(ms: unknown, lang: "es" | "en") {
  const n = Number(ms || 0);
  if (!Number.isFinite(n) || n <= 0) return "";
  try {
    const locale = lang === "en" ? "en-US" : "es-MX";
    return new Intl.DateTimeFormat(locale, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(n));
  } catch {
    return new Date(n).toLocaleString();
  }
}

function buildAttemptTitle(n: NeedRow, lang: "es" | "en") {
  const parts: string[] = [];
  const sup = safe((n as any).lastPurchaseSupplierName);
  const at = Number((n as any).lastPurchaseAtMs || 0) || 0;
  const ord = safe((n as any).lastPurchaseOrderNo);
  const rea = safe((n as any).lastNotBoughtReasonText);
  if (sup) parts.push(sup);
  if (at > 0) parts.push(formatAttempt(at, lang));
  // Order number intentionally hidden in main view (details only)
  if (rea) parts.push(`${lang === "en" ? "Reason" : "Motivo"}: ${rea}`);
  return parts.join(" • ");
}


async function copyToClipboard(text: string): Promise<boolean> {
  const s = String(text || "").trim();
  if (!s) return false;

  try {
    await navigator.clipboard.writeText(s);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = s;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

async function apiJson<T>(user: User, path: string, init?: RequestInit): Promise<T> {
  const token = await user.getIdToken();
  const res = await fetch(path, {
    cache: "no-store",
    ...(init || {}),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const txt = await res.text();

  if (!res.ok && txt.startsWith("<!DOCTYPE html>")) {
    throw new Error(`Ruta API no encontrada: ${path}`);
  }

  let json: any = {};
  try {
    json = txt ? JSON.parse(txt) : {};
  } catch {
    throw new Error(txt || `HTTP ${res.status}`);
  }

  if (!res.ok) throw new Error(String(json?.error || json?.message || `HTTP ${res.status}`));
  return json as T;
}

export default function NeedsPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const branchId = safe(sp.get("branch")) || "sucursal-a";
  const showBranchLabel = branchId && branchId !== "sucursal-a";
  const [lang, setLang] = React.useState<"es" | "en">("es");

  React.useEffect(() => {
    setLang(getLang());
  }, []);

const [user, setUser] = React.useState<User | null>(null);
  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  const [rows, setRows] = React.useState<NeedRow[]>([]);
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [needQty, setNeedQty] = React.useState("1");
  const [note, setNote] = React.useState("");

  const [scannerOpen, setScannerOpen] = React.useState(false);

  const [quickOpen, setQuickOpen] = React.useState(false);
  const [quickName, setQuickName] = React.useState("");
  const [quickUnit, setQuickUnit] = React.useState("pza");
  const [quickBarcode, setQuickBarcode] = React.useState("");
  const [quickSupplierId, setQuickSupplierId] = React.useState("");
  const [quickCategoryId, setQuickCategoryId] = React.useState("");
  const [supplierOptions, setSupplierOptions] = React.useState<OptionRow[]>([]);
  const [categoryOptions, setCategoryOptions] = React.useState<OptionRow[]>([]);

  const [noResultOpen, setNoResultOpen] = React.useState(false);
  const [noResultQuery, setNoResultQuery] = React.useState("");

  const cachedProductsRef = React.useRef<Map<string, Product[]>>(new Map());
  const suppressSearchRef = React.useRef(false);
  const promptedQueryRef = React.useRef("");

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      setUser(u);
      if (!u) r.replace("/login");
    });
    return () => unsub();
  }, [r]);

  const loadNeeds = React.useCallback(async () => {
    if (!user) return;
    setMsg("");
    try {
      const json = await apiJson<{ rows?: any[] }>(
        user,
        `/api/needs/list?branch=${encodeURIComponent(branchId)}&lang=${encodeURIComponent(lang)}`
      );

      const raw = Array.isArray(json.rows) ? json.rows : [];
      const normalized = raw
        .map((n: any) => ({
          id: safe(n?.id || n?.needId || n?._id || ""),
          productId: safe(n?.productId || ""),
          productName: safe(n?.productName || ""),
          unitCapture: safe(n?.unitCapture || ""),
          needQty: safe(n?.needQty || ""),
          note: safe(n?.note || ""),
          status: safe(n?.status || ""),

          lastPurchaseState: safe(n?.lastPurchaseState || ""),
          lastNotBoughtReasonText: safe(n?.lastNotBoughtReasonText || ""),
          lastPurchaseOrderNo: safe(n?.lastPurchaseOrderNo || ""),
          lastPurchaseOrderId: safe(n?.lastPurchaseOrderId || ""),
          lastPurchaseAtMs: Number(n?.lastPurchaseAtMs || 0) || undefined,
          lastPurchaseSupplierId: safe(n?.lastPurchaseSupplierId || ""),
          lastPurchaseSupplierName: safe(n?.lastPurchaseSupplierName || ""),

          createdAtMs: Number(n?.createdAtMs || 0) || undefined,
          updatedAtMs: Number(n?.updatedAtMs || 0) || undefined,
        }))
        .filter((n) => !!n.id && isVisibleNeedStatus(n.status));

      setRows(normalized);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
      setRows([]);
    }
  }, [user, branchId, lang]);

  React.useEffect(() => {
    if (!user) return;
    void loadNeeds();
    const tmr = window.setInterval(() => void loadNeeds(), 10000);
    return () => window.clearInterval(tmr);
  }, [user, loadNeeds]);

  React.useEffect(() => {
    if (!user) return;

    const qq = norm(q);

    if (suppressSearchRef.current) {
      suppressSearchRef.current = false;
      return;
    }

    if (selected && norm(label(selected)) === qq) {
      setResults([]);
      return;
    }

    if (qq.length < 2) {
      setResults([]);
      return;
    }

    const cached = cachedProductsRef.current.get(qq);
    if (cached) {
      setResults(cached);
      return;
    }

    const tmr = window.setTimeout(async () => {
      setSearching(true);
      try {
        const json = await apiJson<{ rows?: any[] }>(
          user,
          `/api/products/search-store?q=${encodeURIComponent(qq)}&branch=${encodeURIComponent(branchId)}&lang=${encodeURIComponent(lang)}`
        );

        const raw = Array.isArray(json.rows) ? json.rows : [];
        const list: Product[] = dedupeProductsByLabel(
          raw
            .map((p: any) => ({
              id: safe(p?.id),
              nameEs: safe(p?.nameEs || p?.name || ""),
              name: safe(p?.name || p?.nameEs || ""),
              unitCapture: safe(p?.unitCapture || ""),
              barcode: safe(p?.barcode || ""),
              supplierId: safe(p?.supplierId || ""),
              supplierName: safe(p?.supplierName || p?.supplierNameEs || ""),
              categoryId: safe(p?.categoryId || ""),
              categoryName: safe(p?.categoryName || p?.categoryNameEs || ""),
            }))
            .filter((p) => !!p.id)
        );

        cachedProductsRef.current.set(qq, list);
        setResults(list);

        if (list.length === 0 && qq.length >= 3 && promptedQueryRef.current !== qq) {
          promptedQueryRef.current = qq;
          setNoResultQuery(q);
          setNoResultOpen(true);
        }
      } catch (e: any) {
        setResults([]);
        setMsg(`⚠ ${String(e?.message || e)}`);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(tmr);
  }, [q, user, selected, branchId, lang]);

  const visibleRows = React.useMemo(() => {
    const list = Array.isArray(rows) ? rows.filter((n) => isVisibleNeedStatus(n.status)) : [];
    list.sort((a, b) => Number(b.updatedAtMs || b.createdAtMs || 0) - Number(a.updatedAtMs || a.createdAtMs || 0));
    return list.slice(0, 200);
  }, [rows]);

  const selectProduct = (p: Product) => {
    suppressSearchRef.current = true;
    setSelected(p);
    setQ(label(p));
    setResults([]);
    setNoResultOpen(false);
  };

  const normalizeQty = (s: string) => {
    const txt = String(s || "").replace(/[.。,，]/g, " ").trim();
    const parts = txt.split(/\s+/).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  };

  const createNeed = async () => {
    if (!user) return;
    setMsg("");

    const productId = safe(selected?.id);
    if (!productId) {
      setMsg(lang === "en" ? "⚠ Select an item from the list or create a new one." : "⚠ Selecciona un artículo de la lista o crea uno nuevo.");
      return;
    }

    const qty = safe(normalizeQty(needQty)) || "1";

    setBusy(true);
    try {
      await apiJson(
        user,
        `/api/needs/create?branch=${encodeURIComponent(branchId)}&lang=${encodeURIComponent(lang)}`,
        {
          method: "POST",
          body: JSON.stringify({ productId, needQty: qty, note }),
        }
      );

      setSelected(null);
      setQ("");
      setNeedQty("1");
      setNote("");
      setResults([]);
      await loadNeeds();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const [delTarget, setDelTarget] = React.useState<NeedRow | null>(null);

  const [attemptNeed, setAttemptNeed] = React.useState<NeedRow | null>(null);
  const [attemptDetailsOpen, setAttemptDetailsOpen] = React.useState(false);

  const confirmDelete = async () => {
    if (!user || !delTarget) return;
    setMsg("");
    setBusy(true);
    try {
      await apiJson(
        user,
        `/api/needs/delete?branch=${encodeURIComponent(branchId)}&lang=${encodeURIComponent(lang)}`,
        {
          method: "POST",
          body: JSON.stringify({ needId: delTarget.id }),
        }
      );
      setDelTarget(null);
      await loadNeeds();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const loadQuickOptions = async () => {
    if (!user) return;
    try {
      const [supJson, catJson] = await Promise.all([
        apiJson<{ rows?: OptionRow[] }>(user, "/api/suppliers/options"),
        apiJson<{ rows?: OptionRow[] }>(user, "/api/categories/options"),
      ]);

      setSupplierOptions(Array.isArray(supJson.rows) ? supJson.rows : []);
      setCategoryOptions(Array.isArray(catJson.rows) ? catJson.rows : []);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
      setSupplierOptions([]);
      setCategoryOptions([]);
    }
  };

  const openQuickAdd = async (prefill?: Partial<Product>) => {
    setQuickName(safe(prefill?.nameEs || prefill?.name || q));
    setQuickUnit(safe(prefill?.unitCapture || "pza") || "pza");
    setQuickBarcode(safe(prefill?.barcode || ""));
    setQuickSupplierId(safe(prefill?.supplierId || ""));
    setQuickCategoryId(safe(prefill?.categoryId || ""));
    setQuickOpen(true);
    setNoResultOpen(false);
    if (user) await loadQuickOptions();
  };

  const createQuickProduct = async () => {
    if (!user) return;
    setMsg("");

    const nameEs = safe(quickName);
    if (!nameEs) {
      setMsg(`⚠ ${t(lang, "Nombre requerido", "Name required")}`);
      return;
    }

    setBusy(true);
    try {
      const json = await apiJson<{ product: Product }>(user, "/api/products/quick-create", {
        method: "POST",
        body: JSON.stringify({
          nameEs,
          unitCapture: safe(quickUnit) || "pza",
          barcode: safe(quickBarcode) || null,
          supplierId: safe(quickSupplierId) || null,
          categoryId: safe(quickCategoryId) || null,
        }),
      });

      setQuickOpen(false);
      selectProduct(json.product);
      setMsg(lang === "en" ? "✅ Item created. Now tap Add need." : "✅ Artículo creado. Ahora pulsa Agregar necesidad.");
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const onBarcode = async (code: string) => {
    if (!user) return;
    const barcode = safe(code);
    if (!barcode) return;

    setBusy(true);
    setMsg("");
    try {
      const json = await apiJson<{ product: Product | null }>(
        user,
        `/api/products/by-barcode?code=${encodeURIComponent(barcode)}`
      );

      if (json.product) {
        selectProduct(json.product);
        return;
      }

      await openQuickAdd({ barcode, nameEs: "", unitCapture: "pza" });
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="cc-main">
      <div className="cc-topbar">
        <div>
          <div style={{ fontWeight: 1000 }}>{t(lang, "needs")}</div>
          {showBranchLabel ? (
            <div className="cc-muted" style={{ fontSize: 12 }}>Sucursal: {branchId}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="cc-btn cc-btn--ghost"
            onClick={() =>
              r.push(
                `/deliveries?branch=${encodeURIComponent(branchId)}&from=${encodeURIComponent(`/needs?branch=${encodeURIComponent(branchId)}`)}`
              )
            }
          >
            {t(lang, "deliveries")}
          </button>
          <button className="cc-btn" onClick={() => void clientAuth().signOut()}>
            {t(lang, "logout")}
          </button>
        </div>
      </div>

      {msg ? <div className="cc-alert">{msg}</div> : null}

      <div className="cc-card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 1000 }}>{t(lang, "newNeed")}</div>

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <DictationInput
              placeholder={t(lang, "searchArticle")}
              value={q}
              onChange={(v) => {
                setQ(v);
                setSelected(null);
                if (norm(v) !== promptedQueryRef.current) {
                  setNoResultOpen(false);
                }
              }}
              data-dictation="search"
            />

            {searching ? <div className="cc-muted" style={{ marginTop: 6 }}>{t(lang, "searching")}</div> : null}

            {results.length ? (
              <div className="cc-dropdown">
                {results.slice(0, 10).map((p) => (
                  <button key={p.id} type="button" className="cc-dd-item" onClick={() => selectProduct(p)}>
                    <div style={{ fontWeight: 900 }}>{label(p)}</div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="cc-capture-grid">
            <div className="cc-qty">
              <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "qty")}</div>
              <DictationInput
                placeholder={t(lang, "qty")}
                value={needQty}
                onChange={(v) => setNeedQty(v)}
                inputMode="numeric"
                data-dictation="number"
                data-dictation-replace="true"
              />
            </div>

            <div className="cc-unit">
              <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "unit")}</div>
              <input className="cc-input" value={safe(selected?.unitCapture) || ""} readOnly placeholder="-" />
            </div>

            <button type="button" className="cc-btn cc-barcode-btn" onClick={() => setScannerOpen(true)} disabled={busy}>
              {t(lang, "barcode")}
            </button>
          </div>

          <DictationInput
            placeholder={t(lang, "noteOptional")}
            value={note}
            onChange={(v) => setNote(v)}
            data-dictation="text"
          />

          <button type="button" className="cc-btn cc-btn--primary" onClick={() => void createNeed()} disabled={busy}>
            {t(lang, "addNeed")}
          </button>

        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 1000 }}>
          {t(lang, "pending")} ({visibleRows.length})
        </div>

        {visibleRows.length === 0 ? (
          <div className="cc-muted" style={{ marginTop: 8 }}>{t(lang, "noResults")}</div>
        ) : null}

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {visibleRows.map((n) => (
            <div key={n.id} className="cc-card">
              <div className="cc-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="cc-ellipsis" style={{ fontWeight: 1000 }}>{n.productName}</div>
                  <div className="cc-muted" style={{ fontSize: 12 }}>
                    {n.needQty} {n.unitCapture || ""}
                  </div>

                  {safe(n.lastPurchaseState).toUpperCase() === "NOT_BOUGHT" ? (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span className="cc-nc-pill">N/C</span>

                        {safe(n.lastPurchaseSupplierName) || safe(n.lastPurchaseAtMs) || safe(n.lastPurchaseOrderNo) ? (
                          <div
                            className="cc-muted cc-clamp1 cc-clickable"
                            style={{ fontSize: 12 }}
                            role="button"
                            tabIndex={0}
                            title={buildAttemptTitle(n, lang)}
                            onClick={() => {
                            setAttemptNeed(n);
                            setAttemptDetailsOpen(false);
                          }}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? (setAttemptNeed(n), setAttemptDetailsOpen(false)) : null)}
                          >
                            {lang === "en" ? "Previous try" : "Intento previo"}:{" "}
                            {[safe(n.lastPurchaseSupplierName), formatAttempt(n.lastPurchaseAtMs, lang)]
                              .filter(Boolean)
                              .join(" • ")}
                            {safe(n.lastNotBoughtReasonText)
                              ? ` • ${lang === "en" ? "Reason" : "Motivo"}: ${safe(n.lastNotBoughtReasonText)}`
                              : ""}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  {safe(n.note) ? (
                    <div className="cc-muted" style={{ fontSize: 12, marginTop: 4 }}>{t(lang, "note")}: {safe(n.note)}</div>
                  ) : null}
                </div>

                <button type="button" className="cc-btn cc-btn--danger" onClick={() => setDelTarget(n)} disabled={busy}>
                  {t(lang, "delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {delTarget ? (
        <div className="cc-modal-backdrop" onClick={() => setDelTarget(null)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 1000, fontSize: 18 }}>{t(lang, "confirmDeleteTitle")}</div>
            <div className="cc-muted" style={{ marginTop: 6 }}>{delTarget.productName}</div>

            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button type="button" className="cc-btn" style={{ flex: 1 }} onClick={() => setDelTarget(null)} disabled={busy}>
                {t(lang, "back")}
              </button>
              <button type="button" className="cc-btn cc-btn--danger" style={{ flex: 1 }} onClick={() => void confirmDelete()} disabled={busy}>
                {t(lang, "yesDelete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {noResultOpen ? (
        <div className="cc-modal-backdrop" onClick={() => setNoResultOpen(false)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 1000, fontSize: 18 }}>
              {lang === "en" ? "This item does not exist" : "Ese artículo no existe"}
            </div>
            <div className="cc-muted" style={{ marginTop: 8 }}>
              {lang === "en"
                ? `Do you want to create a new record for "${safe(noResultQuery)}"?`
                : `¿Deseas crear un nuevo registro para "${safe(noResultQuery)}"?`}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button type="button" className="cc-btn" style={{ flex: 1 }} onClick={() => setNoResultOpen(false)} disabled={busy}>
                {t(lang, "cancel")}
              </button>
              <button
                type="button"
                className="cc-btn cc-btn--primary"
                style={{ flex: 1 }}
                onClick={() => void openQuickAdd({ nameEs: noResultQuery })}
                disabled={busy}
              >
                {t(lang, "quickAdd")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {quickOpen ? (
        <div className="cc-modal-backdrop" onClick={() => setQuickOpen(false)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 1000, fontSize: 18 }}>{t(lang, "quickAdd")}</div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div>
                <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "name")}</div>
                <input className="cc-input" value={quickName} onChange={(e) => setQuickName(e.target.value)} />
              </div>

              <div>
                <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "unit")}</div>
                <select className="cc-input" value={quickUnit} onChange={(e) => setQuickUnit(e.target.value)}>
                  <option value="pza">pza</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="lt">lt</option>
                  <option value="ml">ml</option>
                  <option value="caja">caja</option>
                  <option value="bolsa">bolsa</option>
                  <option value="paq">paq</option>
                </select>
              </div>

              <div>
                <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "supplier")}</div>
                <select className="cc-input" value={quickSupplierId} onChange={(e) => setQuickSupplierId(e.target.value)}>
                  <option value="">{t(lang, "noSupplier")}</option>
                  {supplierOptions.map((x) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "category")}</div>
                <select className="cc-input" value={quickCategoryId} onChange={(e) => setQuickCategoryId(e.target.value)}>
                  <option value="">{t(lang, "noCategory")}</option>
                  {categoryOptions.map((x) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="cc-muted" style={{ fontSize: 12, fontWeight: 900 }}>{t(lang, "barcode")}</div>
                <input className="cc-input" value={quickBarcode} onChange={(e) => setQuickBarcode(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="cc-btn" style={{ flex: 1 }} onClick={() => setQuickOpen(false)} disabled={busy}>
                  {t(lang, "cancel")}
                </button>
                <button type="button" className="cc-btn cc-btn--primary" style={{ flex: 1 }} onClick={() => void createQuickProduct()} disabled={busy}>
                  {busy ? t(lang, "creating") : t(lang, "create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCode={(code) => {
          setScannerOpen(false);
          void onBarcode(code);
        }}
      />

      <style jsx global>{`
        .cc-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 14px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
          overflow-x: hidden;
}
        .cc-main input,
        .cc-main select,
        .cc-main textarea {
          font-size: 16px !important;
        }
        .cc-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .cc-alert {
          margin-top: 10px;
          padding: 10px 12px;
          border: 1px solid #f3c;
          border-radius: 12px;
          background: #fff5fb;
          color: #a20055;
          font-weight: 700;
        }
        .cc-card {
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 12px;
          background: #fff;
          box-shadow: 0 1px 0 rgba(0,0,0,0.02);
          overflow: visible;
          max-width: 100%;
          overflow-x: hidden;
}
        .cc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          min-width: 0;
}

        .cc-row > * { min-width: 0; }

        .cc-ellipsis {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .cc-muted {
          opacity: 0.75;
        }
        .cc-btn {
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          background: #fff;
          font-weight: 900;
          box-sizing: border-box;
          font-size: 15px;
        
          color: #111;}
        .cc-btn--ghost {
          background: #fff;
          border-color: transparent;
          color: #111;
          padding: 10px 8px;
        }

        .cc-btn--primary {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .cc-btn--danger {
          background: #c81d25;
          border-color: #c81d25;
          color: #fff;
        }

        .cc-nc-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          font-weight: 1000;
          background: #b91c1c;
          color: #fff;
          font-size: 12px;
          line-height: 1;
        }
        .cc-dropdown {
          position: absolute;
          top: 44px;
          left: 0;
          right: 0;
          z-index: 30;
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .cc-dd-item {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border: 0;
          background: #fff;
          font-weight: 800;
          box-sizing: border-box;
          font-size: 16px;
        
          color: #111;}
        .cc-dd-item:hover {
          background: #f6f6f6;
        }
        .cc-input {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          background: #fff;
          font-weight: 700;
          box-sizing: border-box;
          display: block;
        
          color: #111;}
        .cc-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 50;
        }
        .cc-modal {
          width: min(560px, calc(100vw - 24px));
          max-width: calc(100vw - 24px);
          background: #fff;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          box-sizing: border-box;
          overflow-x: hidden;
          max-width: 100%;
}
        .cc-modal * {
          box-sizing: border-box;
        }
        .cc-capture-grid {
          display: grid;
          gap: 10px;
          grid-template-columns: minmax(0, 1fr) 88px auto;
          align-items: end;
        }
        .cc-qty {
          min-width: 0;
        }
        .cc-unit {
          min-width: 0;
          width: 88px;
        }
        .cc-barcode-btn {
          min-width: 128px;
          width: auto;
          white-space: nowrap;
        }
        @media (max-width: 720px) {
          .cc-capture-grid {
            grid-template-columns: minmax(0, 1fr) 82px 112px;
          }
          .cc-unit {
            width: 82px;
          }
          .cc-barcode-btn {
            min-width: 112px;
          }
        }
        @media (max-width: 560px) {
          .cc-capture-grid {
            grid-template-columns: 1fr;
          }
          .cc-unit {
            width: 100%;
          }
          .cc-barcode-btn {
            width: 100%;
            min-width: 0;
          }
        }
      
        .cc-clamp1 {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          max-width: 100%;
          display: block;
}

        .cc-break { overflow-wrap: anywhere; word-break: break-word; }

        .cc-clickable {
          cursor: pointer;
        }
        .cc-link {
          background: transparent;
          border: 0;
          padding: 0;
          font-weight: 900;
          text-decoration: underline;
          cursor: pointer;
        }
`}</style>
    
      {attemptNeed ? (
        <ModalShell
          onClose={() => setAttemptNeed(null)}
          ariaLabel={lang === "en" ? "Previous try" : "Intento previo"}
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="cc-btn"
                style={{ flex: 1 }}
                onClick={async () => {
                  const title = buildAttemptTitle(attemptNeed, lang);
                  const extra = safe(attemptNeed.note) ? `
${lang === "en" ? "Note" : "Nota"}: ${safe(attemptNeed.note)}` : "";
                  const ok = await copyToClipboard(`${title}${extra}`.trim());
                  setMsg(ok ? "✅ Copiado" : "⚠ No se pudo copiar");
                }}
              >
                {lang === "en" ? "Copy" : "Copiar"}
              </button>
              <button
                className="cc-btn cc-btn--primary"
                style={{ flex: 1 }}
                onClick={() => setAttemptNeed(null)}
              >
                {lang === "en" ? "Close" : "Cerrar"}
              </button>
            </div>
          }
        >
          <div style={{ fontWeight: 1000, fontSize: "1.1rem" }}>
            {lang === "en" ? "Previous try (N/C)" : "Intento previo (N/C)"}
          </div>

          <div className="cc-muted" style={{ marginTop: 10 }}>
            {buildAttemptTitle(attemptNeed, lang) || (lang === "en" ? "No details." : "Sin detalles.")}
          </div>

          {safe((attemptNeed as any).lastPurchaseOrderNo) ? (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                className="cc-link"
                onClick={() => setAttemptDetailsOpen((v) => !v)}
              >
                {attemptDetailsOpen
                  ? lang === "en"
                    ? "Hide details"
                    : "Ocultar detalles"
                  : lang === "en"
                    ? "Show details"
                    : "Mostrar detalles"}
              </button>
              {attemptDetailsOpen ? (
                <div className="cc-muted" style={{ marginTop: 6 }}>
                  {lang === "en" ? "Order" : "Orden"}: {safe((attemptNeed as any).lastPurchaseOrderNo)}
                </div>
              ) : null}
            </div>
          ) : null}

          {safe(attemptNeed.note) ? (
            <div className="cc-muted" style={{ marginTop: 10 }}>
              {lang === "en" ? "Note" : "Nota"}: {safe(attemptNeed.note)}
            </div>
          ) : null}
        </ModalShell>
      ) : null}
</main>
  );
}