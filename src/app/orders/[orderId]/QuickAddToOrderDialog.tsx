// FILE: src/app/orders/[orderId]/QuickAddToOrderDialog.tsx
"use client";

import * as React from "react";
import type { User } from "firebase/auth";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";

type Lang = "es" | "en";

type CategoryOpt = { id: string; name: string };
type ProductOpt = {
  id: string;
  name: string;
  unitCapture: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
};

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  headers.set("cache-control", "no-store");
  return fetch(path, { ...init, headers, cache: "no-store" });
}

async function readJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeText(v: unknown) {
  const s = safe(v).toLowerCase();
  try {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  } catch {
    return s.replace(/\s+/g, " ").trim();
  }
}

function uniqStrings(values: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const key = normalizeText(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function pickFirstString(...vals: unknown[]) {
  for (const v of vals) {
    const s = safe(v);
    if (s) return s;
  }
  return "";
}

function dedupeProductsByName(items: ProductOpt[]) {
  const out: ProductOpt[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const key = normalizeText(item.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function startsWithQuery(name: string, query: string) {
  return normalizeText(name).startsWith(normalizeText(query));
}

export function QuickAddToOrderDialog(props: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  user: User;
  lang: Lang;
  branchId: string;
  orderId: string;
  supplierId?: string;
  supplierName?: string;
}) {
  const { open, onClose, onAdded, user, lang, branchId, orderId, supplierId, supplierName } = props;

  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const [nameEs, setNameEs] = React.useState("");
  const [qty, setQty] = React.useState("1");
  const [unit, setUnit] = React.useState("pza");
  const [note, setNote] = React.useState("");
  const [barcode, setBarcode] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");

  const [rawSuggestions, setRawSuggestions] = React.useState<ProductOpt[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductOpt | null>(null);

  const [categories, setCategories] = React.useState<CategoryOpt[]>([]);
  const [catLoading, setCatLoading] = React.useState(false);
  const [catMsg, setCatMsg] = React.useState("");

  const [openScan, setOpenScan] = React.useState(false);

  const nameRef = React.useRef<HTMLInputElement | null>(null);

  const baseUnits = React.useMemo(
    () => ["pza", "caja", "paquete", "bolsa", "botella", "lata", "kg", "g", "lb", "oz", "litro", "ml", "galón", "charola", "bote"],
    []
  );

  const detectedUnits = React.useMemo(() => {
    const fromSuggestions = rawSuggestions.map((s) => safe(s.unitCapture)).filter(Boolean);
    const fromSelected = selectedProduct?.unitCapture ? [selectedProduct.unitCapture] : [];
    return uniqStrings([...fromSelected, ...fromSuggestions]);
  }, [rawSuggestions, selectedProduct]);

  const unitOptions = React.useMemo(() => uniqStrings([...detectedUnits, ...baseUnits]), [detectedUnits, baseUnits]);

  React.useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
        nameRef.current?.focus();
      } catch {}
    }, 50);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    setBusy(false);
    setMsg("");
    setNameEs("");
    setQty("1");
    setUnit("pza");
    setNote("");
    setBarcode("");
    setCategoryId("");
    setRawSuggestions([]);
    setSelectedProduct(null);
    setCatMsg("");

    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCatLoading(true);
        setCatMsg("");

        const candidates = [
          "/api/categories/options",
          "/api/categories/list",
          "/api/categories",
          "/api/catalog/categories/options",
        ];

        let loaded: CategoryOpt[] = [];

        for (const path of candidates) {
          const res = await apiFetch(user, path);
          const json: any = await readJson(res);
          if (!res.ok) continue;

          const raw = json?.options || json?.items || json?.categories || json?.rows || [];
          const mapped: CategoryOpt[] = Array.isArray(raw)
            ? raw.map((c: any) => ({
                id: safe(c?.id || c?.value || c?.docId || c?.categoryId),
                name: safe(c?.nameEs || c?.name || c?.label || c?.title),
              }))
            : [];

          const clean = mapped.filter((x) => x.id && x.name);
          if (clean.length > 0) {
            loaded = clean;
            break;
          }
        }

        if (cancelled) return;

        setCategories(loaded);
        if (loaded.length === 0) {
          setCatMsg(lang === "en" ? "No categories loaded from API." : "No se cargaron categorías desde API.");
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setCatMsg(lang === "en" ? "Could not load categories." : "No se pudieron cargar categorías.");
        }
      } finally {
        if (!cancelled) setCatLoading(false);
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open, user, lang]);

  React.useEffect(() => {
    if (!open) return;

    const query = normalizeText(nameEs);
    if (query.length < 2) {
      setRawSuggestions([]);
      return;
    }

    let cancelled = false;
    const ctrl = new AbortController();

    const run = async () => {
      try {
        const url = `/api/products/search-store?q=${encodeURIComponent(nameEs)}&branch=${encodeURIComponent(branchId)}&lang=${encodeURIComponent(lang)}&limit=30`;
        const res = await apiFetch(user, url, { signal: ctrl.signal as any });
        const json: any = await readJson(res);

        if (!res.ok) {
          if (!cancelled) setRawSuggestions([]);
          return;
        }

        const raw = json?.items || json?.products || json?.results || json?.rows || [];
        const mapped: ProductOpt[] = (Array.isArray(raw) ? raw : [])
          .map((p: any) => ({
            id: safe(p?.id || p?.productId || p?.docId),
            name: safe(p?.nameEs || p?.name || p?.title),
            unitCapture: safe(p?.unitCapture || p?.unit || ""),
            barcode: safe(p?.barcode || ""),
            categoryId: safe(p?.categoryId || ""),
            categoryName: safe(p?.categoryName || p?.categoryNameEs || ""),
          }))
          .filter((x) => x.id && x.name);

        if (!cancelled) setRawSuggestions(mapped);
      } catch {
        if (!cancelled) setRawSuggestions([]);
      }
    };

    const t = window.setTimeout(run, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [open, nameEs, user, branchId, lang]);

  const filteredSuggestions = React.useMemo(() => {
    const query = normalizeText(nameEs);
    if (query.length < 2) return [];

    const clean = dedupeProductsByName(rawSuggestions)
      .filter((item) => startsWithQuery(item.name, query))
      .sort((a, b) =>
        a.name.localeCompare(b.name, lang === "en" ? "en" : "es", {
          sensitivity: "base",
        })
      );

    return clean.slice(0, 30);
  }, [rawSuggestions, nameEs, lang]);

  const showSuggestions = !selectedProduct && normalizeText(nameEs).length >= 2 && filteredSuggestions.length > 0;

  function handleNameChange(value: string) {
    setNameEs(value);

    if (selectedProduct) {
      const sameName = normalizeText(selectedProduct.name) === normalizeText(value);
      if (!sameName) {
        setSelectedProduct(null);
        setBarcode("");
        setCategoryId("");
      }
    }
  }

  function handlePickSuggestion(product: ProductOpt) {
    setSelectedProduct(product);
    setNameEs(product.name);
    setUnit(product.unitCapture || unit || "pza");
    setBarcode(product.barcode || "");
    setCategoryId(product.categoryId || "");
    setMsg("");
  }

  async function addToOrder(productId: string, unitCapture: string) {
    const q = safe(qty) || "1";
    const u = safe(unitCapture) || safe(unit) || "pza";

    const addRes = await apiFetch(user, "/api/orders/add-item", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        branchId,
        orderId,
        productId,
        needQty: q,
        unitCapture: u,
        note: safe(note) || "",
      }),
    });

    const addJson: any = await readJson(addRes);
    if (!addRes.ok) throw new Error(String(addJson?.error || "No se pudo agregar a la orden"));
  }

  async function onSave() {
    setMsg("");

    const n = safe(nameEs);
    const u = safe(unit) || "pza";

    if (!n && !selectedProduct) {
      setMsg(lang === "en" ? "Name required" : "Nombre requerido");
      return;
    }

    if (!u) {
      setMsg(lang === "en" ? "Unit required" : "Unidad requerida");
      return;
    }

    setBusy(true);
    try {
      if (selectedProduct?.id) {
        await addToOrder(selectedProduct.id, safe(unit) || safe(selectedProduct.unitCapture) || "pza");
        onAdded();
        onClose();
        return;
      }

      const prodRes = await apiFetch(user, "/api/products/quick-create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nameEs: n,
          unitCapture: u,
          barcode: safe(barcode) || undefined,
          supplierId: safe(supplierId) || undefined,
          supplierName: safe(supplierName) || undefined,
          categoryId: safe(categoryId) || undefined,
        }),
      });

      const prodJson: any = await readJson(prodRes);
      if (!prodRes.ok) throw new Error(String(prodJson?.error || "No se pudo crear el producto"));

      const productId = pickFirstString(
        prodJson?.id,
        prodJson?.productId,
        prodJson?.product?.id,
        prodJson?.product?.productId
      );

      if (!productId) throw new Error("Producto sin id");

      await addToOrder(productId, u);
      onAdded();
      onClose();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        onClick={busy ? () => {} : onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(0,0,0,0.38)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
          padding: 12,
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          className="cc-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(980px, calc(100vw - 24px))",
            maxWidth: 980,
            background: "#fff",
            borderRadius: 18,
            padding: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            maxHeight: "calc(100dvh - 24px)",
            overflowY: "auto",
            overflowX: "hidden",
            margin: "0 auto",
          }}
        >
          <div style={{ fontWeight: 1000, fontSize: 18 }}>
            {lang === "en" ? "Quick add" : "Alta rápida"}
          </div>

          {supplierName ? (
            <div className="cc-muted" style={{ fontWeight: 900, marginTop: 6 }}>
              {lang === "en" ? "Supplier" : "Proveedor"}: {supplierName}
            </div>
          ) : null}

          {msg ? (
            <div className="cc-msg" style={{ marginTop: 10 }}>
              {msg}
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <div style={{ position: "relative" }}>
              <div className="cc-field-label">
                {lang === "en" ? "Name" : "Nombre"}{" "}
                <span style={{ opacity: 0.65, fontWeight: 700 }}>
                  {lang === "en" ? "(type 2+ letters)" : "(escribe 2+ letras)"}
                </span>
              </div>

              <input
                ref={nameRef}
                className="cc-input"
                value={nameEs}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={lang === "en" ? "e.g. Coke 600ml" : "ej. Coca 600ml"}
                autoComplete="off"
                disabled={busy}
              />

              {showSuggestions ? (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    marginTop: 4,
                    background: "#fff",
                    border: "1px solid #d4d4d8",
                    borderRadius: 12,
                    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                    maxHeight: 260,
                    overflowY: "auto",
                    padding: "8px 0",
                  }}
                >
                  {filteredSuggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePickSuggestion(p)}
                      disabled={busy}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 18px",
                        border: "none",
                        background: "#fff",
                        cursor: "pointer",
                        font: "inherit",
                        fontWeight: 900,
                        display: "block",
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div className="cc-field-label">{lang === "en" ? "Qty" : "Cant."}</div>
                <input className="cc-input" value={qty} onChange={(e) => setQty(e.target.value)} disabled={busy} />
              </div>

              <div style={{ flex: 1 }}>
                <div className="cc-field-label">{lang === "en" ? "Unit" : "Unidad"}</div>
                <select className="cc-input" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={busy}>
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cc-field-label">{lang === "en" ? "Category" : "Categoría"}</div>
            <select
              className="cc-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={busy || catLoading || !!selectedProduct}
            >
              <option value="">
                {catLoading
                  ? lang === "en"
                    ? "Loading..."
                    : "Cargando..."
                  : lang === "en"
                    ? "No category"
                    : "Sin categoría"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {catMsg ? (
              <div className="cc-muted" style={{ fontSize: 12 }}>
                {catMsg}
              </div>
            ) : null}

            <div className="cc-field-label">{lang === "en" ? "Note (optional)" : "Nota (opcional)"}</div>
            <input className="cc-input" value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} />

            <div className="cc-field-label">{lang === "en" ? "Barcode (optional)" : "Código de barras (opcional)"}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="cc-input"
                style={{ flex: 1 }}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="0123456789"
                disabled={busy}
              />
              <button type="button" className="cc-btn" onClick={() => setOpenScan(true)} disabled={busy}>
                {lang === "en" ? "Scan" : "Escanear"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" className="cc-btn" style={{ flex: 1 }} onClick={onClose} disabled={busy}>
                {lang === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                className="cc-btn cc-btn--success"
                style={{ flex: 1 }}
                onClick={() => void onSave()}
                disabled={busy}
              >
                {busy
                  ? lang === "en"
                    ? "Saving..."
                    : "Guardando..."
                  : selectedProduct
                    ? lang === "en"
                      ? "Add selected"
                      : "Agregar seleccionado"
                    : lang === "en"
                      ? "Add"
                      : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BarcodeScannerModal
        open={openScan}
        onClose={() => setOpenScan(false)}
        onCode={(code) => {
          setBarcode(code);
          setOpenScan(false);
        }}
      />
    </>
  );
}