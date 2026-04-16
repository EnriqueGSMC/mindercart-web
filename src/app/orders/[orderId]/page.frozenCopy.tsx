"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ScreenShell } from "@/components/ScreenShell";
import { QuickAddToOrderDialog } from "./QuickAddToOrderDialog";

type Lang = "es" | "en";
type PurchaseState = "PENDING" | "BOUGHT" | "NOT_BOUGHT";

const REASONS_ES = ["No existencia", "Muy caro", "Mucha cantidad", "No me gustó"];
const REASONS_EN = ["Out of stock", "Too expensive", "Too much quantity", "Did not like"];

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeKeyText(v: string) {
  const s = safe(v).toLowerCase();
  try {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return s.replace(/\s+/g, " ").trim();
  }
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

function readLangClient(): Lang {
  if (typeof window === "undefined") return "es";
  try {
    const fromStorage = window.localStorage.getItem("cc_lang") || window.localStorage.getItem("lang") || "";
    if (fromStorage.toLowerCase().startsWith("en")) return "en";

    const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:cc_lang|lang)=([^;]+)/);
    const fromCookie = decodeURIComponent(cookieMatch?.[1] || "").toLowerCase();
    if (fromCookie.startsWith("en")) return "en";
  } catch {}
  return "es";
}

function formatShortDate(ms: number, lang: Lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-MX", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 10);
  }
}

async function apiFetch(user: User, path: string, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  headers.set("cache-control", "no-store");
  return fetch(path, { ...init, headers, cache: "no-store" });
}

function parseNum(x: string): number | null {
  const s = String(x ?? "").trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type SupplierOption = { id: string; name: string };

type LastAttempt = {
  supplierName: string;
  atMs: number;
  reasonText: string;
  orderNo: string;
};

type OrderItem = {
  itemId: string;
  needId: string;
  productId: string;
  productName: string;
  needQty: string;
  unitCapture: string;
  note: string;
  purchaseState: PurchaseState;
  notBoughtReasonText: string;
  lastPurchaseState?: string;
  lastNotBoughtReasonText?: string;
  lastPurchaseSupplierName?: string;
  lastPurchaseOrderNo?: string;
  lastPurchaseAtMs?: number;
};

type Group = {
  key: string;
  productId: string;
  needId: string;
  productName: string;
  unit: string;
  qtyText: string;
  notesText: string;
  reasonsText: string;
  itemIds: string[];
  prevSupplierName: string;
  prevAtMs: number;
  prevOrderNo: string;
  prevReason: string;
};

function groupByState(items: OrderItem[], state: PurchaseState): Group[] {
  const m = new Map<
    string,
    {
      name: string;
      productId: string;
      needId: string;
      unit: string;
      nums: number[];
      raws: string[];
      notes: Set<string>;
      reasons: Set<string>;
      ids: string[];
      prevSupplierName: string;
      prevAtMs: number;
      prevOrderNo: string;
      prevReason: string;
    }
  >();

  for (const it of items) {
    if (it.purchaseState !== state) continue;

    const name = safe(it.productName) || "Artículo";
    const unit = safe(it.unitCapture);
    const pid = safe(it.productId);
    const baseKey = normalizeKeyText(pid || name);
    const key = `${baseKey}__${normalizeKeyText(unit)}`;

    const cur =
      m.get(key) || {
        name,
        productId: pid,
        needId: safe((it as any).needId),
        unit,
        nums: [],
        raws: [],
        notes: new Set<string>(),
        reasons: new Set<string>(),
        ids: [],
        prevSupplierName: "",
        prevAtMs: 0,
        prevOrderNo: "",
        prevReason: "",
      };

    if (!cur.productId) cur.productId = pid;
    if (!cur.needId) cur.needId = safe((it as any).needId);

    const rawQty = safe(it.needQty);
    const n = parseNum(rawQty);
    if (n === null) cur.raws.push(rawQty);
    else cur.nums.push(n);

    if (safe(it.note)) cur.notes.add(safe(it.note));
    if (state === "NOT_BOUGHT" && safe(it.notBoughtReasonText)) cur.reasons.add(safe(it.notBoughtReasonText));

    const prevState = safe((it as any).lastPurchaseState).toUpperCase();
    if (prevState === "NOT_BOUGHT") {
      const atMs = Number((it as any).lastPurchaseAtMs || 0) || 0;
      const sup = safe((it as any).lastPurchaseSupplierName);
      const ord = safe((it as any).lastPurchaseOrderNo);
      const rea = safe((it as any).lastNotBoughtReasonText);
      const has = atMs > 0 || sup || ord || rea;
      if (has && (!cur.prevAtMs || atMs >= cur.prevAtMs)) {
        cur.prevAtMs = atMs;
        cur.prevSupplierName = sup;
        cur.prevOrderNo = ord;
        cur.prevReason = rea;
      }
    }

    cur.ids.push(safe(it.itemId));
    m.set(key, cur);
  }

  const out: Group[] = [];
  for (const [key, v] of m.entries()) {
    const sum = v.nums.length ? v.nums.reduce((a, b) => a + b, 0) : null;
    const qtyText = sum !== null ? String(sum) : v.raws.filter(Boolean).join(" + ") || "0";
    out.push({
      key,
      productId: v.productId,
      needId: v.needId,
      productName: v.name,
      unit: v.unit,
      qtyText,
      notesText: Array.from(v.notes).join(" | "),
      reasonsText: Array.from(v.reasons).join(" | "),
      itemIds: v.ids,
      prevSupplierName: v.prevSupplierName,
      prevAtMs: v.prevAtMs,
      prevOrderNo: v.prevOrderNo,
      prevReason: v.prevReason,
    });
  }

  out.sort((a, b) => a.productName.localeCompare(b.productName));
  return out;
}

function BottomSheet({
  open,
  onClose,
  header,
  body,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
}) {
  const bodyRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: 0 }));
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-sheet cc-sheet--square" onClick={(e) => e.stopPropagation()}>
        <div className="cc-sheet-header">{header}</div>
        <div className="cc-sheet-body" ref={bodyRef}>
          {body}
        </div>
        <div className="cc-sheet-footer">{footer}</div>
      </div>
    </div>
  );
}

function FinishModal({ open, onExit, lang }: { open: boolean; onExit: () => void; lang: Lang }) {
  if (!open) return null;

  return (
    <div className="cc-overlay" onClick={onExit}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 1000, fontSize: "1.25rem" }}>{lang === "en" ? "Purchase completed" : "Compra terminada"}</div>
        <div className="cc-sub" style={{ marginTop: 8 }}>
          {lang === "en" ? "You have finished buying all items." : "Has terminado de comprar todos los artículos."}
        </div>

        <div style={{ marginTop: 14 }}>
          <button className="cc-btn cc-btn--primary" style={{ width: "100%" }} onClick={onExit}>
            {lang === "en" ? "Exit" : "Salir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderInStorePage() {
  const r = useRouter();
  const sp = useSearchParams();
  const params = useParams<{ orderId: string }>();

  const orderId = decodeURIComponent(params.orderId || "");
  const branch = sp.get("branch") || "sucursal-a";
  const from = safe(sp.get("from")) || `/purchases?branch=${encodeURIComponent(branch)}&tab=AUTHORIZED`;

  const [lang, setLang] = React.useState<Lang>("es");
  const [user, setUser] = React.useState<User | null>(null);

  const [order, setOrder] = React.useState<any>(null);
  const [items, setItems] = React.useState<OrderItem[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const [dirty, setDirty] = React.useState(false);
  const [autoBuying, setAutoBuying] = React.useState(false);

  const [nbOpen, setNbOpen] = React.useState(false);
  const [nbReason, setNbReason] = React.useState("");
  const [nbNote, setNbNote] = React.useState("");
  const [nbRequeueSupplierId, setNbRequeueSupplierId] = React.useState("");
  const [supplierOptions, setSupplierOptions] = React.useState<SupplierOption[]>([]);
  const [nbSupLoading, setNbSupLoading] = React.useState(false);
  const [nbSupMsg, setNbSupMsg] = React.useState("");
  const [nbShowAltPicker, setNbShowAltPicker] = React.useState(false);
  const [nbSupplierTouched, setNbSupplierTouched] = React.useState(false);
  const [nbLastAttempt, setNbLastAttempt] = React.useState<LastAttempt | null>(null);
  const [nbPrevExpanded, setNbPrevExpanded] = React.useState(false);
  const [nbOrderDetailsOpen, setNbOrderDetailsOpen] = React.useState(false);
  const nbAttemptCacheRef = React.useRef(new Map<string, LastAttempt | null>());
  const nbSupCacheRef = React.useRef(new Map<string, SupplierOption[]>());
  const nbSupTokenRef = React.useRef(0);

  const [nbTarget, setNbTarget] = React.useState<Group | null>(null);
  const [nbErr, setNbErr] = React.useState("");

  const [bOpen, setBOpen] = React.useState(false);
  const [bNote, setBNote] = React.useState("");
  const [bTarget, setBTarget] = React.useState<Group | null>(null);
  const [bErr, setBErr] = React.useState("");

  const [doneOpen, setDoneOpen] = React.useState(false);
  const closingRef = React.useRef(false);

  const [qaOpen, setQaOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setLang(readLangClient());
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

    const res = await apiFetch(user, `/api/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error");

    const o = json.order;
    if (!o) throw new Error("Pedido no existe");

    if (safe(o.status) === "CREATED") {
      await apiFetch(user, `/api/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "setStatus", status: "BUYING" }),
      }).catch(() => {});
      setAutoBuying(true);
    }

    const raw = Array.isArray(o.items) ? o.items : [];

// itemId en Firestore a veces no existe o se repite (cuando se duplica por productId).
// Para evitar que marcar C/N/C actualice el renglón incorrecto, usamos:
// - itemId/id si existe y es único dentro del array
// - si falta o está duplicado, usamos el índice del array (string) como id estable para PATCH
const rawIds = raw.map((x: any) => safe(x?.itemId || x?.id || ""));
const freq = new Map<string, number>();
for (const id of rawIds) {
  if (!id) continue;
  freq.set(id, (freq.get(id) || 0) + 1);
}

const mapped: OrderItem[] = raw.map((x: any, idx: number) => {
  const candidate = safe(x?.itemId || x?.id || "");
  const useCandidate = !!candidate && (freq.get(candidate) || 0) === 1;
  const stableId = useCandidate ? candidate : String(idx);

  return {
    itemId: stableId,
    needId: safe((x as any).needId || (x as any).needID || ""),
    productId: safe(x.productId),
    productName: safe(x.productName),
    needQty: safe(x.needQty),
    unitCapture: safe(x.unitCapture || ""),
    note: safe(x.note || ""),
    purchaseState: (safe(x.purchaseState || x.state || "PENDING") as PurchaseState) || "PENDING",
    notBoughtReasonText: safe(x.notBoughtReasonText || x.notBoughtReason?.text || ""),
    lastPurchaseState: safe((x as any).lastPurchaseState || ""),
    lastNotBoughtReasonText: safe((x as any).lastNotBoughtReasonText || ""),
    lastPurchaseSupplierName: safe((x as any).lastPurchaseSupplierName || ""),
    lastPurchaseOrderNo: safe((x as any).lastPurchaseOrderNo || ""),
    lastPurchaseAtMs: Number((x as any).lastPurchaseAtMs || 0) || 0,
  };
});

    setOrder(o);
    setItems(mapped);
  }, [user, orderId, branch]);

  const loadSuppliersForNeed = React.useCallback(
    async (needId: string, opts?: { force?: boolean }): Promise<SupplierOption[]> => {
      const nid = safe(needId);
      if (!user || !nid) return [];

      const cached = nbSupCacheRef.current.get(nid);
      if (cached && !opts?.force) return cached;

      const res = await apiFetch(user, `/api/needs/suppliers?branch=${encodeURIComponent(branch)}&needId=${encodeURIComponent(nid)}`);
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(String((json as any)?.error || "No se pudieron cargar proveedores"));

      const raw = Array.isArray((json as any)?.suppliers)
        ? (json as any).suppliers
        : Array.isArray((json as any)?.rows)
          ? (json as any).rows
          : [];

      const suppliers: SupplierOption[] = raw
        .map((x: any) => ({ id: safe(x?.id || x?.supplierId || ""), name: safe(x?.name || x?.supplierName || "") }))
        .filter((x: SupplierOption) => !!x.id);

      const curId = safe(order?.supplierId || order?.supplier?.id || "");
      const curName = safe(order?.supplierName || order?.supplier?.name || "");
      if (curId && !suppliers.some((s) => s.id === curId)) suppliers.unshift({ id: curId, name: curName || curId });

      const uniq: SupplierOption[] = [];
      const seen = new Set<string>();
      for (const s of suppliers) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        uniq.push({ id: s.id, name: s.name || s.id });
      }

      const la = (json as any)?.lastAttempt;
      const lastAttempt: LastAttempt | null = (() => {
        if (!la) return null;
        const atMs = Number(la?.atMs || la?.lastPurchaseAtMs || 0) || 0;
        const supplierName = safe(la?.supplierName || la?.lastPurchaseSupplierName || "");
        const reasonText = safe(la?.reasonText || la?.lastNotBoughtReasonText || "");
        const orderNo = safe(la?.orderNo || la?.lastPurchaseOrderNo || "");
        const hasAny = atMs > 0 || !!supplierName || !!reasonText || !!orderNo;
        if (!hasAny) return null;
        return { supplierName, atMs, reasonText, orderNo };
      })();
      nbAttemptCacheRef.current.set(nid, lastAttempt);

      nbSupCacheRef.current.set(nid, uniq);
      return uniq;
    },
    [user, branch, order]
  );

  const loadRequeueOptionsForGroup = React.useCallback(
    async (group: Group) => {
      const token = ++nbSupTokenRef.current;

      const nid = safe(group.needId);
      if (!nid) {
        setNbSupLoading(false);
        setSupplierOptions([]);
        setNbLastAttempt(
          group.prevSupplierName || group.prevAtMs || group.prevOrderNo || group.prevReason
            ? {
                supplierName: safe(group.prevSupplierName),
                atMs: Number(group.prevAtMs || 0) || 0,
                reasonText: safe(group.prevReason),
                orderNo: safe(group.prevOrderNo),
              }
            : null
        );
        setNbSupMsg(lang === "en" ? "Keeping the same supplier." : "Se mantendrá el mismo proveedor.");
        return;
      }

      setNbSupLoading(true);
      setNbSupMsg("");
      setSupplierOptions([]);

      try {
        const allowed = await loadSuppliersForNeed(nid, { force: true });
        const curId = safe(order?.supplierId || order?.supplier?.id || "");
        const alt = allowed.filter((s) => !!s.id && s.id !== curId);

        if (token !== nbSupTokenRef.current) return;

        setSupplierOptions(alt);
        const cachedAttempt = nbAttemptCacheRef.current.get(nid) || null;
        const fallbackAttempt =
          group.prevSupplierName || group.prevAtMs || group.prevOrderNo || group.prevReason
            ? {
                supplierName: safe(group.prevSupplierName),
                atMs: Number(group.prevAtMs || 0) || 0,
                reasonText: safe(group.prevReason),
                orderNo: safe(group.prevOrderNo),
              }
            : null;
        setNbLastAttempt(cachedAttempt || fallbackAttempt);

        if (!nbSupplierTouched) {
          setNbRequeueSupplierId((prev) => prev || (alt.length === 1 ? alt[0].id : ""));
        }

        if (alt.length === 0) {
          setNbSupMsg(lang === "en" ? "This item only exists in this supplier." : "Este artículo solo existe con este proveedor.");
        } else {
          setNbSupMsg("");
        }
      } catch {
        if (token !== nbSupTokenRef.current) return;
        setSupplierOptions([]);
        setNbLastAttempt(
          group.prevSupplierName || group.prevAtMs || group.prevOrderNo || group.prevReason
            ? {
                supplierName: safe(group.prevSupplierName),
                atMs: Number(group.prevAtMs || 0) || 0,
                reasonText: safe(group.prevReason),
                orderNo: safe(group.prevOrderNo),
              }
            : null
        );
        setNbSupMsg(
          lang === "en"
            ? "Supplier options unavailable. Keeping the same supplier."
            : "No se pudieron cargar proveedores del artículo. Se mantendrá el mismo proveedor."
        );
      } finally {
        if (token === nbSupTokenRef.current) setNbSupLoading(false);
      }
    },
    [lang, loadSuppliersForNeed, order, nbSupplierTouched]
  );

  React.useEffect(() => {
    if (!user) return;
    setMsg("");
    void load().catch((e) => setMsg(`⚠ ${String(e?.message || e)}`));
  }, [user, load]);

  const patchMany = async (bodies: any[]) => {
    if (!user) return;
    for (const body of bodies) {
      const res = await apiFetch(user, `/api/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
    }
  };

  const openBought = (group: Group) => {
    // Evita dos ventanas abiertas (Edge desktop)
    setNbOpen(false);
    setNbTarget(null);

    setBErr("");
    setBTarget(group);
    setBNote(group.notesText || "");
    setBOpen(true);
  };

  const confirmBought = async () => {
    if (!bTarget) return;

    setDirty(true);
    setBusy(true);
    setMsg("");
    try {
      const note = safe(bNote);
      await patchMany(bTarget.itemIds.map((id) => ({ action: "markBought", itemId: id, note })));
      setBOpen(false);
      setBTarget(null);
      await load();
    } catch (e: any) {
      setBErr(`⚠ ${String(e?.message || e)}`);
      setMsg(`⚠ ${String(e?.message || e)}`);
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const openNotBought = (group: Group) => {
    // Evita dos ventanas abiertas (Edge desktop)
    setBOpen(false);
    setBTarget(null);

    setNbErr("");
    setNbTarget(group);
    setNbReason((lang === "en" ? REASONS_EN : REASONS_ES)[0] || "");
    setNbNote(group.notesText || "");
    setNbRequeueSupplierId("");
    setNbShowAltPicker(false);
    setNbOrderDetailsOpen(false);
    setNbSupplierTouched(false);
    setNbLastAttempt(
      group.prevSupplierName || group.prevAtMs || group.prevOrderNo || group.prevReason
        ? {
            supplierName: safe(group.prevSupplierName),
            atMs: Number(group.prevAtMs || 0) || 0,
            reasonText: safe(group.prevReason),
            orderNo: safe(group.prevOrderNo),
          }
        : null
    );
    setNbPrevExpanded(false);
    setNbOpen(true);
    void loadRequeueOptionsForGroup(group);
  };

  const supplierById = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const s of supplierOptions) m.set(s.id, s.name);
    return m;
  }, [supplierOptions]);

  const confirmNotBought = async (opts?: { requeueSupplierId?: string | null }) => {
    if (!nbTarget) return;
    const reasonText = safe(nbReason);
    if (!reasonText) {
      setNbErr(lang === "en" ? "Reason required" : "Motivo requerido");
      return;
    }

    setDirty(true);
    setBusy(true);
    setMsg("");

    const effectiveRequeueSupplierId = safe(opts?.requeueSupplierId ?? nbRequeueSupplierId);
    const effectiveRequeueSupplierName = effectiveRequeueSupplierId ? supplierById.get(effectiveRequeueSupplierId) || "" : "";

    try {
      await patchMany(
        nbTarget.itemIds.map((id) => ({
          action: "markNotBought",
          itemId: id,
          reasonText,
          requeueSupplierId: effectiveRequeueSupplierId || undefined,
          requeueSupplierName: effectiveRequeueSupplierId ? effectiveRequeueSupplierName : undefined,
          note: nbNote ? nbNote : undefined,
        }))
      );
      setNbOpen(false);
      setNbTarget(null);
      await load();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const pending = groupByState(items, "PENDING");
  const bought = groupByState(items, "BOUGHT");
  const notBought = groupByState(items, "NOT_BOUGHT");

  const unresolved = pending.length > 0;
  const allResolved = !unresolved;
  const hasResolvedAny = bought.length > 0 || notBought.length > 0;

  React.useEffect(() => {
    if (closingRef.current) return;
    if (dirty && allResolved && hasResolvedAny) {
      setDoneOpen(true);
    }
  }, [dirty, allResolved, hasResolvedAny]);

  const doCloseBuying = async () => {
    const res = await apiFetch(user!, "/api/orders/close-buying", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, branchId: branch }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((json as any)?.error || "Error");
  };

  const requestClosePurchase = async (pendingGroups: Group[]) => {
    if (!user || busy || closingRef.current) return;

    const pendingIds = pendingGroups.flatMap((g) => g.itemIds).filter(Boolean);
    const pendingCount = pendingIds.length;

    const ok = window.confirm(
      pendingCount > 0
        ? lang === "en"
          ? `There are ${pendingCount} item(s) not bought yet. Finalize purchase and send them back as N/B (N/C) to Needs?`
          : `Aún hay ${pendingCount} artículo(s) sin comprar. ¿Finalizar la compra y regresarlos como N/C a Necesidades?`
        : lang === "en"
          ? "Finalize purchase?"
          : "¿Finalizar la compra?"
    );
    if (!ok) return;

    closingRef.current = true;
    setBusy(true);
    setMsg("");

    try {
      if (pendingCount > 0) {
        setDirty(true);
        const reasonText = lang === "en" ? "Purchase closed" : "Compra cerrada";
        await patchMany(
          pendingIds.map((id) => ({
            action: "markNotBought",
            itemId: id,
            reasonText,
          }))
        );
        await load().catch(() => {});
      }

      await doCloseBuying();
      r.push(`/purchases?branch=${encodeURIComponent(branch)}&tab=AUTHORIZED`);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      closingRef.current = false;
      setBusy(false);
    }
  };

  const closePurchase = async () => {
    if (!user) return;
    setBusy(true);
    setMsg("");

    try {
      await doCloseBuying();
      r.push(`/purchases?branch=${encodeURIComponent(branch)}&tab=AUTHORIZED`);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const goBack = async () => {
    if (user && autoBuying && !dirty) {
      await apiFetch(user, `/api/orders/${encodeURIComponent(orderId)}?branch=${encodeURIComponent(branch)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "setStatus", status: "CREATED" }),
      }).catch(() => {});
    }
    r.push(from);
  };
  const openQuickAdd = () => {
    setQaOpen(true);
  };





  const supplierName = safe(order?.supplier?.name || order?.supplierName) || "Proveedor";
  const orderNo = safe(order?.orderNo);
  const currentSupplierId = safe(order?.supplierId || order?.supplier?.id || "");
  const currentSupplierName = safe(order?.supplierName || order?.supplier?.name || "") || currentSupplierId;
  const addr =
    safe(order?.supplier?.addressText || order?.supplierAddressText) ||
    [
      safe(order?.supplier?.addressLine1 || order?.supplier?.address1 || order?.supplier?.street || order?.supplier?.address),
      safe(order?.supplier?.city),
      safe(order?.supplier?.state),
      safe(order?.supplier?.postalCode || order?.supplier?.zip),
    ]
      .filter(Boolean)
      .join(", ");

  const headerDateMs = Number((order as any)?.authorizedAtMs || 0) || 0;
  const headerDateText = headerDateMs ? formatShortDate(headerDateMs, lang) : "";

  return (
    <>
      <ScreenShell
        style={{
          height: "100dvh",
          maxWidth: 860,
          margin: "0 auto",
          padding: 14,
          boxSizing: "border-box",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          overflow: "hidden",
        }}
        header={
          <div className="cc-header-area">
            <div className="cc-card" style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 1000,
                      fontSize: "1.25rem",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {supplierName}
                  </div>

                  {headerDateText ? (
                    <div
                      className="cc-muted"
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 400,
                        marginTop: 4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {headerDateText}
                    </div>
                  ) : null}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="cc-muted" style={{ fontSize: "0.95rem", fontWeight: 400, whiteSpace: "nowrap" }}>
                    Orden # {orderNo || "-"}
                  </div>
                  <div
                    className="cc-muted"
                    style={{ fontSize: "0.95rem", fontWeight: 900, marginTop: 4, whiteSpace: "nowrap" }}
                  >
                    {pending.length}/{pending.length + bought.length + notBought.length} Pendientes
                  </div>
                </div>
              </div>

              {addr ? <div className="cc-sub">{addr}</div> : null}
            </div>

            {msg ? <div className="cc-msg">{msg}</div> : null}
            {busy ? <div className="cc-sub">Procesando…</div> : null}
          </div>
        }
        footer={
          <div className="cc-footer-bar">
            <div className="cc-footer-inner">
              <button className="cc-btn" style={{ flex: 1 }} onClick={() => void goBack()} disabled={busy}>
                Regresar
              </button>

              <button className="cc-btn" style={{ flex: 1 }} onClick={openQuickAdd} disabled={busy}>
                {lang === "en" ? "+ Add item" : "+ Agregar artículo"}
              </button>

              <button
                className="cc-btn cc-btn--danger"
                style={{ flex: 1 }}
                onClick={() => void requestClosePurchase(pending)}
                disabled={busy}
              >
                Finalizar compra
              </button>
            </div>
          </div>
        }
        contentStyle={{ paddingBottom: 18 }}
      >
        <div style={{ display: "grid", gap: 12, paddingTop: 12 }}>
          {pending.length === 0 ? <div className="cc-sub">No hay pendientes.</div> : null}

          {pending.map((g) => (
            <div key={g.key} className="cc-card">
              <div className="cc-row" style={{ alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 1000 }} className="cc-ellipsis">
                    {g.productName}
                  </div>
                  <div className="cc-sub">
                    <b>{g.qtyText}</b> {g.unit || ""}
                  </div>
                  {g.notesText ? <div className="cc-sub">📝 {g.notesText}</div> : null}

                  {(() => {
                    const hasPrev = !!(g.prevSupplierName || g.prevAtMs || g.prevOrderNo || g.prevReason);
                    if (!hasPrev) return null;

                    const title = `${g.prevSupplierName || "-"}${g.prevAtMs ? ` • ${formatShortDate(g.prevAtMs, lang)}` : ""}${
                      g.prevReason ? ` • ${lang === "en" ? "Reason" : "Motivo"}: ${g.prevReason}` : ""
                    }`;

                    return (
                      <div className="cc-sub cc-clamp1" title={title}>
                        <span className="cc-pill-ncprev">{lang === "en" ? "Prev N/B" : "N/C previo"}</span>{" "}
                        ⏱ {lang === "en" ? "Previous try" : "Intento previo"}:{" "}
                        <span style={{ fontWeight: 1000 }}>{g.prevSupplierName || "-"}</span>
                        {g.prevAtMs ? (
                          <>
                            {" • "}
                            {formatShortDate(g.prevAtMs, lang)}
                          </>
                        ) : null}
                        {g.prevReason ? ` • ${lang === "en" ? "Reason" : "Motivo"}: ${g.prevReason}` : ""}
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="cc-btn"
                    style={{
                      width: 70,
                      height: 56,
                      padding: 0,
                      borderRadius: 16,
                      fontSize: "1.25rem",
                      background: "#16a34a",
                      color: "white",
                      borderColor: "transparent",
                    }}
                    onClick={() => openBought(g)}
                    disabled={busy}
                    title="Comprado"
                  >
                    C
                  </button>
                  <button
                    className="cc-btn"
                    style={{
                      width: 70,
                      height: 56,
                      padding: 0,
                      borderRadius: 16,
                      fontSize: "1rem",
                      background: "#e5e7eb",
                      color: "#111",
                      border: "1px solid #ddd",
                    }}
                    onClick={() => openNotBought(g)}
                    disabled={busy}
                    title="No comprado"
                  >
                    N/C
                  </button>
                </div>
              </div>
            </div>
          ))}

          {bought.length ? (
            <div className="cc-card">
              <div style={{ fontWeight: 1000, marginBottom: 10 }}>Comprados</div>
              <div className="cc-list">
                {bought.map((g) => (
                  <div key={g.key} className="cc-listitem">
                    <div className="cc-lirow">
                      <div className="cc-ellipsis" style={{ fontWeight: 950 }}>
                        {g.productName}
                      </div>
                      <div className="cc-liqty">
                        {g.qtyText} {g.unit}
                      </div>
                    </div>
                    {g.notesText ? <div className="cc-linote">📝 {g.notesText}</div> : null}
                    <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
  <button
    className="cc-btn"
    style={{
      width: 70,
      height: 44,
      padding: 0,
      borderRadius: 14,
      fontSize: "1.15rem",
      background: "#16a34a",
      color: "white",
      borderColor: "transparent",
      fontWeight: 1000,
    }}
    onClick={() => openBought(g)}
    disabled={busy}
    title={lang === "en" ? "Shopping cart" : "Carrito de compras"}
  >
    C
  </button>
  <button
    className="cc-btn"
    style={{
      width: 70,
      height: 44,
      padding: 0,
      borderRadius: 14,
      fontSize: "0.95rem",
      background: "#e5e7eb",
      color: "#111",
      border: "1px solid #ddd",
      fontWeight: 900,
    }}
    onClick={() => openNotBought(g)}
    disabled={busy}
    title={lang === "en" ? "Not bought" : "No comprado"}
  >
    N/C
  </button>
</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </ScreenShell>

      <BottomSheet
        open={nbOpen}
        onClose={() => (busy ? null : setNbOpen(false))}
        header={
          <>
            <div className="cc-sheet-title">No comprado</div>
            {nbTarget ? (
              <div className="cc-ellipsis" style={{ fontWeight: 1000, marginTop: 6 }}>
                {nbTarget.productName}
              </div>
            ) : null}
            <div className="cc-sheet-sub">Motivo (obligatorio)</div>
            {nbErr ? <div className="cc-msg">{nbErr}</div> : null}
          </>
        }
        body={
          <div style={{ display: "grid", gap: 10 }}>
            <select className="cc-btn" style={{ width: "100%" }} value={nbReason} onChange={(e) => setNbReason(e.target.value)} disabled={busy}>
              {(lang === "en" ? REASONS_EN : REASONS_ES).map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <div className="cc-field-label">{lang === "en" ? "Note / price (optional)" : "Nota / precio (opcional)"}</div>

            <textarea
              className="cc-textarea"
              rows={3}
              value={nbNote}
              onChange={(e) => setNbNote(e.target.value)}
              onFocus={(e) => {
                try {
                  e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
                } catch {}
              }}
              placeholder={lang === "en" ? "e.g. $25 / lb" : "ej. $25 / lb"}
              disabled={busy}
            />

            <div className="cc-sheet-sub" style={{ marginTop: 10 }}>
              {lang === "en" ? "Current supplier:" : "Proveedor actual:"} <span style={{ fontWeight: 1000 }}>{currentSupplierName || "-"}</span>
            </div>

            {(() => {
              const a =
                nbLastAttempt ||
                (nbTarget && (nbTarget.prevSupplierName || nbTarget.prevAtMs || nbTarget.prevOrderNo || nbTarget.prevReason)
                  ? {
                      supplierName: safe(nbTarget.prevSupplierName),
                      atMs: Number(nbTarget.prevAtMs || 0) || 0,
                      reasonText: safe(nbTarget.prevReason),
                      orderNo: safe(nbTarget.prevOrderNo),
                    }
                  : null);

              if (!a) return null;
              const has = (a.atMs || 0) > 0 || !!a.supplierName || !!a.reasonText || !!a.orderNo;
              if (!has) return null;

              return (
                <div style={{ marginTop: 6 }}>
                  <div className="cc-sub cc-clamp1">
                    <span className="cc-pill-ncprev">{lang === "en" ? "Prev N/B" : "N/C previo"}</span>{" "}
                    ⏱ {lang === "en" ? "Previous try" : "Intento previo"}: <span style={{ fontWeight: 1000 }}>{a.supplierName || "-"}</span>
                    {(a.atMs || 0) > 0 ? (
                      <>
                        {" • "}
                        {formatShortDate(a.atMs, lang)}
                      </>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="cc-link"
                    onClick={async () => {
                      const parts: string[] = [];
                      if (a.supplierName) parts.push(a.supplierName);
                      if ((a.atMs || 0) > 0) parts.push(formatShortDate(a.atMs, lang));
                      if (a.reasonText) parts.push(`${lang === "en" ? "Reason" : "Motivo"}: ${a.reasonText}`);
                      if (nbNote) parts.push(`${lang === "en" ? "Note" : "Nota"}: ${nbNote}`);
                      const ok = await copyToClipboard(parts.join(" • "));
                      setMsg(ok ? "✅ Copiado" : "⚠ No se pudo copiar");
                    }}
                  >
                    {lang === "en" ? "Copy" : "Copiar"}
                  </button>

                  {a.orderNo ? (
                    <button type="button" className="cc-link" onClick={() => setNbOrderDetailsOpen((v) => !v)}>
                      {nbOrderDetailsOpen ? (lang === "en" ? "Hide details" : "Ocultar detalles") : lang === "en" ? "Show details" : "Mostrar detalles"}
                    </button>
                  ) : null}

                  {nbOrderDetailsOpen && a.orderNo ? (
                    <div className="cc-sub" style={{ marginTop: 4 }}>
                      {lang === "en" ? "Order" : "Orden"}: {a.orderNo}
                    </div>
                  ) : null}

                  {a.reasonText ? (
                    <>
                      <div className={`cc-sub ${nbPrevExpanded ? "" : "cc-clamp2"}`} style={{ marginTop: 4 }}>
                        {lang === "en" ? "Reason" : "Motivo"}: {a.reasonText}
                      </div>
                      {a.reasonText.length > 60 ? (
                        <button type="button" className="cc-link" onClick={() => setNbPrevExpanded((v) => !v)}>
                          {nbPrevExpanded ? (lang === "en" ? "See less" : "Ver menos") : lang === "en" ? "See more" : "Ver más"}
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })()}

            {supplierOptions.length > 0 ? (
              <>
                <div className="cc-sheet-sub" style={{ marginTop: 4 }}>
                  {lang === "en" ? "Try another supplier (optional)" : "Reintentar con otro proveedor (opcional)"}
                </div>

                {supplierOptions.length === 1 && !nbShowAltPicker ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <div className="cc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ minWidth: 0 }}>
                        <span className="cc-sheet-sub">{lang === "en" ? "Suggested supplier:" : "Proveedor sugerido:"} </span>
                        <span style={{ fontWeight: 1000 }}>{supplierOptions[0]?.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="cc-btn"
                          style={{ width: "auto", padding: "8px 10px" }}
                          onClick={() => {
                            setNbSupplierTouched(true);
                            setNbShowAltPicker(false);
                            setNbOrderDetailsOpen(false);
                            void confirmNotBought({ requeueSupplierId: "" });
                          }}
                          disabled={busy || nbSupLoading}
                        >
                          {lang === "en" ? "Keep same" : "Mantener"}
                        </button>
                        <button
                          className="cc-btn"
                          style={{ width: "auto", padding: "8px 10px" }}
                          onClick={() => setNbShowAltPicker(true)}
                          disabled={busy || nbSupLoading}
                        >
                          {lang === "en" ? "Change" : "Cambiar"}
                        </button>
                      </div>
                    </div>

                    <div className="cc-muted" style={{ fontSize: "0.95rem" }}>
                      {lang === "en"
                        ? nbRequeueSupplierId
                          ? "This item will be re-queued to the suggested supplier. Use Change to pick another option."
                          : "This item will keep the same supplier."
                        : nbRequeueSupplierId
                          ? "Este artículo se re-encolará al proveedor sugerido. Usa Cambiar para elegir otra opción."
                          : "Este artículo se mantendrá con el mismo proveedor."}
                    </div>
                  </div>
                ) : (
                  <select
                    className="cc-btn"
                    style={{ width: "100%" }}
                    value={nbRequeueSupplierId}
                    onChange={(e) => {
                      setNbSupplierTouched(true);
                      setNbRequeueSupplierId(e.target.value);
                    }}
                    disabled={busy || nbSupLoading}
                  >
                    <option value="">{lang === "en" ? "Keep same supplier" : "Mantener mismo proveedor"}</option>
                    {supplierOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <div className="cc-muted" style={{ fontSize: "0.95rem" }}>
                {nbSupLoading ? (lang === "en" ? "Loading suppliers…" : "Cargando proveedores…") : nbSupMsg || (lang === "en" ? "Keeping the same supplier." : "Se mantendrá el mismo proveedor.")}
              </div>
            )}
          </div>
        }
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="cc-btn" style={{ flex: 1, maxWidth: 260 }} onClick={() => setNbOpen(false)} disabled={busy}>
              Regresar
            </button>
            <button className="cc-btn cc-btn--danger" style={{ flex: 1, maxWidth: 260 }} onClick={() => void confirmNotBought()} disabled={busy}>
              Seguro de no comprar
            </button>
          </div>
        }
      />

      <BottomSheet
        open={bOpen}
        onClose={() => (busy ? null : setBOpen(false))}
        header={
          <>
            <div className="cc-sheet-title">{lang === "en" ? "Shopping cart" : "Carrito de compras"}</div>

            {bTarget ? (
              <div className="cc-ellipsis" style={{ fontWeight: 1000, marginTop: 6 }}>
                {bTarget.productName}
              </div>
            ) : null}

            {bErr ? <div className="cc-msg">{bErr}</div> : null}
          </>
        }
        body={
          <div style={{ display: "grid", gap: 10 }}>

            {bTarget && (bTarget.prevSupplierName || bTarget.prevAtMs || bTarget.prevOrderNo || bTarget.prevReason) ? (
              <div className="cc-muted" style={{ fontSize: "0.95rem" }}>
                ⏱ {lang === "en" ? "Previous try" : "Intento previo"}:{" "}
                <span style={{ fontWeight: 1000 }}>{bTarget.prevSupplierName || "-"}</span>
                {bTarget.prevAtMs ? (
                  <>
                    {" • "}
                    {formatShortDate(bTarget.prevAtMs, lang)}
                  </>
                ) : null}
                {bTarget.prevOrderNo ? ` • ${(lang === "en" ? "Order" : "Orden")} ${bTarget.prevOrderNo}` : ""}
                {bTarget.prevReason ? ` • ${(lang === "en" ? "Reason" : "Motivo")}: ${bTarget.prevReason}` : ""}
              </div>
            ) : null}

            <div className="cc-field-label">{lang === "en" ? "Note / price (optional)" : "Nota / precio (opcional)"}</div>

            <textarea
              className="cc-textarea"
              rows={2}
              value={bNote}
              onChange={(e) => setBNote(e.target.value)}
              placeholder={lang === "en" ? "e.g. $25 / lb" : "ej. $25 / lb"}
              disabled={busy}
              style={{ minHeight: 56 }}
            />
          </div>
        }
        footer={
          <div style={{ display: "grid", gap: 10 }}>
            <button className="cc-btn" style={{ width: "100%" }} onClick={() => setBOpen(false)} disabled={busy}>
              Regresar
            </button>
            <button className="cc-btn cc-btn--success" style={{ width: "100%" }} onClick={() => void confirmBought()} disabled={busy}>
              {lang === "en" ? "In cart?" : "¿Ya en el Carrito?"}
            </button>
          </div>
        }
      />

      <FinishModal open={doneOpen} onExit={() => void closePurchase()} lang={lang} />


      {user ? (
        <QuickAddToOrderDialog
          open={qaOpen}
          onClose={() => setQaOpen(false)}
          onAdded={() => {
            void load();
          }}
          user={user}
          lang={lang}
          branchId={branch}
          orderId={orderId}
          supplierId={currentSupplierId}
          supplierName={currentSupplierName}
        />
      ) : null}




<style jsx global>{`
        .cc-header-area {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        .cc-footer-bar {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(6px);
          border-top: 1px solid #eee;
          padding-top: 10px;
          padding-bottom: calc(10px + env(safe-area-inset-bottom));
          flex-shrink: 0;
          z-index: 2;
        }
        .cc-footer-inner {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cc-card {
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 12px;
          background: #fff;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
          max-width: 100%;
          overflow-x: hidden;
          color: #111;
        }
        .cc-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          min-width: 0;
        }
        .cc-row > * {
          min-width: 0;
        }
        .cc-ellipsis {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .cc-sub {
          opacity: 0.75;
          font-size: 13px;
          margin-top: 4px;
          min-width: 0;
          max-width: 100%;
        }
        .cc-msg {
          margin-top: 10px;
          padding: 10px 12px;
          border: 1px solid #f3c;
          border-radius: 12px;
          background: #fff5fb;
          color: #a20055;
          font-weight: 700;
        }
        .cc-btn {
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          background: #fff;
          font-weight: 900;
          color: #111;
        }
        .cc-btn--primary {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .cc-btn--danger {
          background: #b91c1c;
          color: #fff;
          border-color: transparent;
        }
                .cc-btn--success {
          background: #16a34a;
          color: #fff;
          border-color: transparent;
        }
        .cc-list {
          display: grid;
          gap: 8px;
        }
        .cc-listitem {
          border-bottom: 1px solid #f1f1f1;
          padding: 8px 0;
        }
        .cc-listitem:last-child {
          border-bottom: 0;
        }
        .cc-lirow {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }
        .cc-lirow > * {
          min-width: 0;
        }
        .cc-liqty {
          white-space: nowrap;
          font-weight: 900;
        }
        .cc-linote {
          margin-top: 6px;
          opacity: 0.75;
          font-size: 12px;
        }
        .cc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: end;
          justify-content: center;
          z-index: 70;
          padding: 0;
        }
        .cc-sheet {
          width: 100%;
          max-width: 860px;
          background: #fff;
          border-radius: 18px 18px 0 0;
          max-height: calc(100dvh - 16px);
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          overflow: hidden;
          max-width: 100%;
          overflow-x: hidden;
        }
        .cc-sheet--square {
          border-radius: 18px 18px 0 0;
        }
        .cc-sheet-header,
        .cc-sheet-footer {
          padding: 14px;
          border-top: 1px solid #f2f2f2;
        }
        .cc-sheet-footer {
          padding-bottom: calc(14px + env(safe-area-inset-bottom));
        }
        .cc-sheet-header {
          border-top: 0;
          border-bottom: 1px solid #f2f2f2;
        }
        .cc-sheet-body {
          padding: 14px;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .cc-sheet-title {
          font-weight: 1000;
          font-size: 18px;
        }
        .cc-sheet-sub {
          opacity: 0.75;
          font-size: 13px;
          margin-top: 4px;
        }
        .cc-field-label {
          margin-top: 10px;
          margin-bottom: 6px;
          font-weight: 1000;
          font-size: 14px;
        }
        .cc-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          background: #fff;
          font-weight: 700;
          height: 44px;
        }
        .cc-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          background: #fff;
          font-weight: 700;
          resize: vertical;
          min-height: 72px;
        }
        .cc-pill-ncprev {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 22px;
          padding: 0 10px;
          border-radius: 999px;
          font-weight: 1000;
          background: #b91c1c;
          color: #fff;
          font-size: 12px;
          line-height: 1;
          flex-shrink: 0;
        }
        .cc-clamp1 {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          max-width: 100%;
          display: block;
        }
        .cc-break {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .cc-clamp2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cc-link {
          margin-top: 6px;
          padding: 0;
          border: 0;
          background: transparent;
          text-decoration: underline;
          font-weight: 900;
          opacity: 0.85;
          cursor: pointer;
        }
        .cc-modal {
          width: 100%;
          max-width: 560px;
          background: #fff;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
          max-width: 100%;
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
}
