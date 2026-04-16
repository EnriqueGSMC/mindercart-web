// FILE: src/app/deliveries/DeliveriesClient.tsx
"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function receiptLabel(receiptTypeRaw: unknown) {
  const rt = safe(receiptTypeRaw).toUpperCase();
  if (rt === "FULL") return "Completa";
  if (rt === "PARTIAL") return "Parcial";
  return "—";
}


async function authJson<T>(user: User, url: string, init?: RequestInit): Promise<T> {
  const token = await user.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  const json = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error((json as any)?.error || `HTTP ${res.status}`);
  return json as T;
}

type OrderRow = {
  id: string;
  orderNo: string;
  status: string;
  supplier: { id: string; name: string };
  counts: { total: number; pending: number; bought: number; notBought: number; receivedBought?: number };
  receiptType?: string;
  receivedAtMs?: number;
  closedAtMs?: number;
  updatedAtMs?: number;
  createdAtMs?: number;
};

type Item = {
  itemId: string;
  productName: string;
  needQty: string;
  unitCapture: string;
  note: string;
  purchaseState: string;
  received?: boolean;
};

type UserRow = { id: string; name: string; email?: string; role?: string };
type TabKey = "receive" | "history";

function fmtDate(ms?: number) {
  if (!ms) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function isBoughtState(s: string) {
  return safe(s).toUpperCase() === "BOUGHT";
}

function normKey(s: string) {
  return safe(s).toLowerCase();
}

function parseQty(q: string): number | null {
  const n = Number(String(q).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

type ConsolidatedLine = {
  key: string;
  productName: string;
  unitCapture: string;
  qtySum: number | null;
  qtyParts: string[];
  notes: string[];
  itemIds: string[];
};

function consolidateBought(items: Item[]): { lines: ConsolidatedLine[]; allItemIds: string[] } {
  const map = new Map<string, ConsolidatedLine>();
  const allItemIds: string[] = [];

  for (const it of items) {
    allItemIds.push(it.itemId);

    const key = `${normKey(it.productName)}__${normKey(it.unitCapture)}`;
    const qtyN = parseQty(it.needQty);
    const note = safe(it.note);

    if (!map.has(key)) {
      map.set(key, {
        key,
        productName: it.productName,
        unitCapture: it.unitCapture,
        qtySum: qtyN,
        qtyParts: qtyN === null ? [it.needQty] : [],
        notes: note ? [note] : [],
        itemIds: [it.itemId],
      });
      continue;
    }

    const g = map.get(key)!;
    g.itemIds.push(it.itemId);

    if (qtyN === null || g.qtySum === null) {
      g.qtySum = null;
      g.qtyParts.push(it.needQty);
    } else {
      g.qtySum += qtyN;
    }

    if (note && !g.notes.includes(note)) g.notes.push(note);
  }

  const lines = [...map.values()].sort((a, b) => a.productName.localeCompare(b.productName));
  return { lines, allItemIds };
}

function stableCheckedEntries(checked: Record<string, boolean>) {
  return Object.keys(checked)
    .sort()
    .map((k) => [k, Boolean(checked[k])] as const);
}

function receiveSnapshot(checked: Record<string, boolean>, note: string, deliveredByUserId: string) {
  return JSON.stringify({
    deliveredByUserId: safe(deliveredByUserId),
    note: safe(note),
    checked: stableCheckedEntries(checked),
  });
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
    <div className="cc-overlay cc-overlay--sheet" onClick={onClose}>
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

function ConfirmModal({
  open,
  who,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  who: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="cc-overlay cc-overlay--confirm" onClick={onCancel}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 1000, fontSize: 16 }}>Confirmar entrega</div>
        <div className="cc-sub" style={{ marginTop: 10 }}>
          {`Confirma que recibes de ${who}?`}
        </div>

        <div className="cc-row" style={{ marginTop: 14, justifyContent: "flex-end", gap: 10 }}>
          <button className="cc-btn" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="cc-btn cc-btn--danger" type="button" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionModal({
  open,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="cc-overlay cc-overlay--confirm" onClick={onCancel}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 1000, fontSize: 16 }}>{title}</div>
        <div className="cc-sub" style={{ marginTop: 10 }}>
          {message}
        </div>

        <div className="cc-row" style={{ marginTop: 14, justifyContent: "flex-end", gap: 10 }}>
          <button className="cc-btn" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="cc-btn cc-btn--danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupCheckbox({
  checkedAll,
  checkedAny,
  disabled,
  onChange,
}: {
  checkedAll: boolean;
  checkedAny: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = checkedAny && !checkedAll;
  }, [checkedAny, checkedAll]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checkedAll}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      style={{ marginTop: 4 }}
    />
  );
}

export default function DeliveriesClient() {
  const r = useRouter();
  const sp = useSearchParams();
  const branch = safe(sp.get("branch")) || "sucursal-a";
  const from = safe(sp.get("from"));

  const [tab, setTab] = React.useState<TabKey>("receive");

  const [user, setUser] = React.useState<User | null>(null);
  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [msg, setMsg] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<OrderRow | null>(null);

  const [itemsBought, setItemsBought] = React.useState<Item[]>([]);
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [deliveredByUserId, setDeliveredByUserId] = React.useState("");
  const [candidateId, setCandidateId] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const [partialConfirmOpen, setPartialConfirmOpen] = React.useState(false);
  const [discardOpen, setDiscardOpen] = React.useState(false);

  const baselineRef = React.useRef<string>("");
  const [dirty, setDirty] = React.useState(false);

  const [deliveredByName, setDeliveredByName] = React.useState("");
  const [receivedByName, setReceivedByName] = React.useState("");

  const [notesOpen, setNotesOpen] = React.useState<Record<string, boolean>>({});

  const sheetHistoryArmedRef = React.useRef(false);
  const closingViaHistoryRef = React.useRef(false);

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
    try {
      const bucket = tab === "history" ? "history" : "delivery";
      const json = await authJson<{ orders?: OrderRow[] }>(
        user,
        `/api/orders/list?bucket=${bucket}&branch=${encodeURIComponent(branch)}`
      );

      const orders = Array.isArray(json.orders) ? json.orders : [];
      const filtered = tab === "receive" ? orders.filter((o) => Number(o?.counts?.bought || 0) > 0) : orders;
      setRows(filtered);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    }
  }, [user, branch, tab]);

  React.useEffect(() => {
    if (!user) return;
    void load();
  }, [user, load]);

  const loadUsersOnce = React.useCallback(async () => {
    if (!user) return;
    if (users.length) return;
    const json = await authJson<{ users?: UserRow[] }>(user, `/api/users/list?limit=200`);
    setUsers(Array.isArray(json.users) ? json.users : []);
  }, [user, users.length]);

  const resetDeliverer = () => {
    setDeliveredByUserId("");
    setCandidateId("");
    setConfirmOpen(false);
  };

  const disarmSheetHistory = () => {
    if (!sheetHistoryArmedRef.current) return;
    closingViaHistoryRef.current = true;
    sheetHistoryArmedRef.current = false;
    history.back();
  };

  const hardCloseSheet = (opts?: { skipHistoryBack?: boolean }) => {
    setConfirmOpen(false);
    setPartialConfirmOpen(false);
    setDiscardOpen(false);
    setCandidateId("");

    setOpen(false);
    setActive(null);
    setItemsBought([]);
    setChecked({});
    setNote("");

    setDirty(false);
    baselineRef.current = "";

    setDeliveredByName("");
    setReceivedByName("");
    setDeliveredByUserId("");

    if (!opts?.skipHistoryBack) disarmSheetHistory();
  };

  const requestClose = () => {
    if (busy) return;
    if (tab === "receive" && open && dirty) {
      setDiscardOpen(true);
      return;
    }
    hardCloseSheet();
  };

  React.useEffect(() => {
    if (!open) return;
    if (sheetHistoryArmedRef.current) return;
    history.pushState({ __ccDeliverySheet: true }, "", location.href);
    sheetHistoryArmedRef.current = true;
  }, [open]);

  React.useEffect(() => {
    const onPopState = () => {
      if (closingViaHistoryRef.current) {
        closingViaHistoryRef.current = false;
        return;
      }

      if (!open) return;

      sheetHistoryArmedRef.current = false;

      if (tab === "receive" && dirty) {
        history.pushState({ __ccDeliverySheet: true }, "", location.href);
        sheetHistoryArmedRef.current = true;
        setDiscardOpen(true);
        return;
      }

      hardCloseSheet({ skipHistoryBack: true });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open, tab, dirty]);

  const openOrder = async (o: OrderRow) => {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      await loadUsersOnce();
      baselineRef.current = "";
      setDirty(false);

      const json = await authJson<any>(
        user,
        `/api/orders/${encodeURIComponent(o.id)}?branch=${encodeURIComponent(branch)}`
      );
      const ord = json.order || json;

      const raw = Array.isArray(ord.items) ? ord.items : [];
      const mapped: Item[] = raw.map((x: any) => ({
        itemId: safe(x.itemId || x.id || x.productId),
        productName: safe(x.productName || x.name),
        needQty: safe(x.needQty || x.qty),
        unitCapture: safe(x.unitCapture || ""),
        note: safe(x.note || ""),
        purchaseState: safe(x.purchaseState || x.state || "PENDING").toUpperCase(),
        received: Boolean(x.received),
      }));

      const boughtOnly = mapped.filter((it) => isBoughtState(it.purchaseState));

      const nextChecked: Record<string, boolean> = {};
      for (const it of boughtOnly) nextChecked[it.itemId] = Boolean(it.received);

      const initialNote = safe(ord.receiveNote || "");

      const deliveredById = safe(ord.deliveredBy?.id || ord.deliveredByUserId || ord.deliveredBy?.uid || "");
      const deliveredByNm = safe(
        ord.deliveredBy?.name || ord.deliveredByName || ord.deliveredBy?.email || deliveredById || ""
      );
      const receivedByNm = safe(
        ord.receivedBy?.name || ord.receivedByName || ord.receivedBy?.email || ord.receivedBy?.id || ""
      );

      setActive(o);
      setItemsBought(boughtOnly);
      setChecked(nextChecked);
      setNote(initialNote);

      setDeliveredByName(deliveredByNm);
      setReceivedByName(receivedByNm);

      setNotesOpen({});

      if (tab === "receive") {
        resetDeliverer();
      } else {
        setDeliveredByUserId(deliveredById);
      }

      baselineRef.current = receiveSnapshot(
        nextChecked,
        initialNote,
        tab === "receive" ? "" : deliveredById
      );
      setDirty(false);

      setOpen(true);
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const { lines: consolidated, allItemIds } = React.useMemo(
    () => consolidateBought(itemsBought),
    [itemsBought]
  );

  const allBoughtChecked = allItemIds.length > 0 && allItemIds.every((id) => checked[id]);

  React.useEffect(() => {
    if (!open || tab !== "receive" || !active) {
      setDirty(false);
      return;
    }
    if (!baselineRef.current) {
      baselineRef.current = receiveSnapshot(checked, note, deliveredByUserId);
      setDirty(false);
      return;
    }
    const snap = receiveSnapshot(checked, note, deliveredByUserId);
    setDirty(snap !== baselineRef.current);
  }, [open, tab, active?.id, checked, note, deliveredByUserId]);

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!(open && tab === "receive" && dirty)) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [open, tab, dirty]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key !== "Escape") return;
      e.preventDefault();
      requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, tab, dirty, busy]);

  const candidate = users.find((u) => u.id === candidateId);
  const candidateName = candidate?.name || "—";

  const deliveredByText =
    users.find((u) => u.id === deliveredByUserId)?.name || deliveredByName || "—";

  const onPickDeliverer = (id: string) => {
    if (!id) return;
    setCandidateId(id);
    setConfirmOpen(true);
  };

  const confirmDeliverer = () => {
    if (!candidateId) return;
    setDeliveredByUserId(candidateId);
    setCandidateId("");
    setConfirmOpen(false);
  };

  const cancelDeliverer = () => {
    setCandidateId("");
    setConfirmOpen(false);
  };

  const changeDeliverer = () => setDeliveredByUserId("");

  const toggleGroup = (ids: string[], value: boolean) => {
    setChecked((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = value;
      return next;
    });
  };

  const toggleNotes = (key: string) => {
    setNotesOpen((p) => ({ ...p, [key]: !p[key] }));
  };

  const submitReceive = async (finalize: boolean) => {
    if (!user || !active) return;

    setBusy(true);
    setMsg("");
    try {
      const receivedItemIds = Object.entries(checked)
        .filter(([, v]) => v)
        .map(([k]) => k);

      await authJson<any>(user, "/api/orders/receive", {
        method: "POST",
        body: JSON.stringify({
          orderId: active.id,
          branchId: branch,
          receivedItemIds,
          note,
          finalize,
          deliveredByUserId,
        }),
      });

      hardCloseSheet();
      await load();
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  const saveOrReceive = (finalize: boolean) => {
    if (!user || !active) return;

    if (!deliveredByUserId) {
      setMsg("⚠ Selecciona quién entrega.");
      return;
    }

    if (finalize && !allBoughtChecked) {
      setPartialConfirmOpen(true);
      return;
    }

    void submitReceive(finalize);
  };

  const goBack = async () => {
    if (from) return r.push(from);
    return r.push(`/needs?branch=${encodeURIComponent(branch)}`);
  };

  const onTopBack = () => {
    if (open) return requestClose();
    return void goBack();
  };

  return (
    <main className="cc-container">
      <div className="cc-row">
        <div>
          <div className="cc-title">Entregas</div>
          <div className="cc-sub">Sucursal: {branch}</div>
        </div>

        <div className="cc-row" style={{ gap: 10 }}>
          <div className="cc-tabs">
            <button
              className={`cc-tab ${tab === "receive" ? "cc-tab--active" : ""}`}
              onClick={() => setTab("receive")}
              type="button"
              disabled={open}
              title={open ? "Cierra el detalle para cambiar de tab" : ""}
            >
              Recibir
            </button>
            <button
              className={`cc-tab ${tab === "history" ? "cc-tab--active" : ""}`}
              onClick={() => setTab("history")}
              type="button"
              disabled={open}
              title={open ? "Cierra el detalle para cambiar de tab" : ""}
            >
              Historial
            </button>
          </div>

          <button className="cc-btn" onClick={onTopBack} type="button">
            Regresar
          </button>
        </div>
      </div>

      {msg ? <div className="cc-msg">{msg}</div> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {rows.length ? (
          rows.map((o) => {
            const rb = Number(o.counts.receivedBought || 0);
            const b = Number(o.counts.bought || 0);
            const dateMs = o.closedAtMs || o.updatedAtMs || o.createdAtMs || 0;
            const isInProgress = safe(o.status).toUpperCase() === "DELIVERY";

            return (
              <button
                key={o.id}
                className="cc-card"
                style={{ textAlign: "left" }}
                onClick={() => void openOrder(o)}
                disabled={busy}
              >
                <div className="cc-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 1000 }} className="cc-ellipsis">
                      {o.supplier?.name || "Proveedor"}{" "}
                      {o.orderNo ? <span className="cc-muted">• Orden # {o.orderNo}</span> : null}
                      {tab === "receive" && isInProgress ? (
                        <span className="cc-badge" style={{ marginLeft: 8 }}>
                          En progreso
                        </span>
                      ) : null}
                    </div>

                    {tab === "receive" ? (
                      <div className="cc-sub">
                        Fecha: {fmtDate(dateMs)} • Comprados: {b} • Recibidos: {rb}/{b}
                      </div>
                    ) : (
                      <div className="cc-sub">
                        Tipo: {receiptLabel(o.receiptType)} • {rb}/{b}
                        {o.receivedAtMs ? ` • ${fmtDate(o.receivedAtMs)}` : ""}
                      </div>
                    )}
                  </div>

                  {tab === "receive" ? (
                    <span className="cc-pill">
                      {rb}/{b}
                    </span>
                  ) : (
                    <span className="cc-pill">{safe(o.receiptType || "—")}</span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="cc-sub">{tab === "receive" ? "Sin entregas pendientes." : "Sin historial."}</div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        who={candidateName}
        onCancel={cancelDeliverer}
        onConfirm={confirmDeliverer}
      />

      <ActionModal
        open={partialConfirmOpen}
        title="Finalizar recepción"
        message="Faltan artículos por marcar. ¿Finalizar como recepción PARCIAL?"
        cancelLabel="Cancelar"
        confirmLabel="Finalizar parcial"
        onCancel={() => setPartialConfirmOpen(false)}
        onConfirm={() => {
          setPartialConfirmOpen(false);
          void submitReceive(true);
        }}
      />

      <ActionModal
        open={discardOpen}
        title="Salir sin guardar"
        message="Tienes cambios sin guardar. ¿Salir y perder cambios?"
        cancelLabel="Seguir editando"
        confirmLabel="Salir"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false);
          hardCloseSheet();
        }}
      />

      <BottomSheet
        open={open}
        onClose={requestClose}
        header={
          <>
            <div className="cc-sheet-title">{tab === "receive" ? "Recibir" : "Historial-Recibido"}</div>
            <div className="cc-sheet-sub">
              {tab === "receive" ? (
                <>
                  {active?.supplier?.name || ""} {active?.orderNo ? `• Orden # ${active.orderNo}` : ""}
                  {dirty ? (
                    <span className="cc-badge" style={{ marginLeft: 8 }}>
                      Cambios sin guardar
                    </span>
                  ) : null}
                  {safe(active?.status).toUpperCase() === "DELIVERY" ? (
                    <span className="cc-badge" style={{ marginLeft: 8 }}>
                      En progreso
                    </span>
                  ) : null}
                </>
              ) : (
                <>{active?.orderNo ? `Orden # ${active.orderNo}` : ""}</>
              )}
            </div>
          </>
        }
        body={
          <>
            {tab === "receive" ? (
              <div className="cc-card" style={{ marginBottom: 12 }}>
                <div className="cc-sub" style={{ marginBottom: 8 }}>
                  Quién entrega
                </div>

                {deliveredByUserId ? (
                  <div className="cc-row" style={{ alignItems: "center" }}>
                    <div style={{ fontWeight: 1000 }}>{deliveredByText}</div>
                    <button className="cc-link" onClick={changeDeliverer} type="button" disabled={busy}>
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <select
                    className="cc-btn"
                    value={candidateId}
                    onChange={(e) => onPickDeliverer(e.target.value)}
                    size={8}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 8,
                      border: candidateId ? "1px solid #ddd" : "2px solid #16a34a",
                      background: candidateId ? "white" : "#ecfdf5",
                      fontWeight: candidateId ? 700 : 1000,
                    }}
                  >
                    <option value="">Selecciona usuario…</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="cc-card" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 1000, fontSize: 16 }}>{active?.supplier?.name || "Proveedor"}</div>
                <div className="cc-sub" style={{ marginTop: 6 }}>
                  {fmtDate(active?.receivedAtMs)} {active?.orderNo ? `• Orden # ${active.orderNo}` : ""}
                </div>
                <div className="cc-sub" style={{ marginTop: 6 }}>
                  Tipo: {receiptLabel(active?.receiptType)} • {Number(active?.counts?.receivedBought || 0)}/{Number(active?.counts?.bought || 0)}
                </div>
                <div className="cc-sub" style={{ marginTop: 6 }}>
                  Quién entregó: <span style={{ fontWeight: 1000, opacity: 1 }}>{deliveredByText}</span>
                </div>
                <div className="cc-sub" style={{ marginTop: 6 }}>
                  Quién recibió:{" "}
                  <span style={{ fontWeight: 1000, opacity: 1 }}>{receivedByName || "—"}</span>
                </div>
              </div>
            )}

            <div className="cc-card">
              <div style={{ fontWeight: 1000, marginBottom: 8 }}>Artículos</div>
              {tab === "history" ? (
                <div className="cc-sub" style={{ marginTop: -2, marginBottom: 8 }}>
                  {receiptLabel(active?.receiptType)} • {itemsBought.filter((it) => Boolean(checked[it.itemId])).length}/{itemsBought.length}
                </div>
              ) : null}

              {consolidated.length ? (
                <div className="cc-list">
                  {consolidated.map((g) => {
                    const all = g.itemIds.every((id) => Boolean(checked[id]));
                    const any = g.itemIds.some((id) => Boolean(checked[id]));
                    const qtyText = g.qtySum !== null ? String(g.qtySum) : g.qtyParts.join(" + ");
                    const openNotes = Boolean(notesOpen[g.key]);

                    return (
                      <div key={g.key} className="cc-listitem">
                        <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <GroupCheckbox
                            checkedAll={all}
                            checkedAny={any}
                            disabled={tab === "history"}
                            onChange={(val) => toggleGroup(g.itemIds, val)}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="cc-ellipsis" style={{ fontWeight: 950 }}>
                              {g.productName}
                            </div>
                            <div className="cc-sub">
                              {qtyText} {g.unitCapture}
                            </div>

                            
                            {g.notes.length === 1 ? (
                              <div className="cc-sub" style={{ marginTop: 4 }}>
                                📝 {g.notes[0]}
                              </div>
                            ) : g.notes.length > 1 ? (
                              <div style={{ marginTop: 6 }}>
                                <button
                                  type="button"
                                  className="cc-link"
                                  onClick={() => toggleNotes(g.key)}
                                  disabled={busy}
                                >
                                  📝 {g.notes.length} notas {openNotes ? "▲" : "▼"}
                                </button>

                                {openNotes ? (
                                  <ul className="cc-notes">
                                    {g.notes.map((n) => (
                                      <li key={n} className="cc-sub">
                                        {n}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="cc-sub">No hay artículos comprados.</div>
              )}
            </div>

            <div className="cc-card" style={{ marginTop: 12 }}>
              <div className="cc-sub">Notas</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="cc-btn"
                style={{ width: "100%", minHeight: 90, textAlign: "left" }}
                disabled={tab === "history"}
              />
            </div>
          </>
        }
        footer={
          tab === "history" ? (
            <button
              className="cc-btn cc-btn--primary"
              style={{ width: "100%" }}
              onClick={() => hardCloseSheet()}
              disabled={busy}
            >
              Cerrar
            </button>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <button className="cc-btn" style={{ width: "100%" }} onClick={requestClose} disabled={busy}>
                Regresar
              </button>
              <button
                className="cc-btn"
                style={{ width: "100%" }}
                onClick={() => saveOrReceive(false)}
                disabled={busy || !deliveredByUserId}
              >
                Guardar progreso
              </button>
              <button
                className="cc-btn cc-btn--primary"
                style={{ width: "100%" }}
                onClick={() => saveOrReceive(true)}
                disabled={busy || !deliveredByUserId}
              >
                Recibir (finalizar)
              </button>
            </div>
          )
        }
      />

      <style jsx global>{`
        .cc-container { max-width: 760px; margin: 0 auto; padding: 14px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color: #111; }
        .cc-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .cc-title { font-weight: 1000; font-size: 20px; }
        .cc-sub { opacity: 0.75; font-size: 13px; margin-top: 2px; }
        .cc-msg { margin-top: 10px; padding: 10px 12px; border: 1px solid #ddd; border-radius: 12px; background: #fafafa; font-weight: 800; }
        .cc-btn { padding: 10px 12px; border-radius: 14px; border: 1px solid #ddd; background: #fff; font-weight: 900; }
        .cc-btn--primary { background: #111; color: #fff; border-color: transparent; font-weight: 1000; }
        .cc-btn--danger { background: #b00020; color: #fff; border-color: transparent; font-weight: 1000; }
        .cc-card { border: 1px solid #eee; border-radius: 16px; padding: 12px; background: #fff; box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
        .cc-ellipsis { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .cc-muted { opacity: 0.75; }
        .cc-pill { display: inline-flex; min-width: 56px; height: 28px; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid #eee; font-weight: 1000; }
        .cc-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; border: 1px solid #eee; background: #f6f6f6; font-weight: 950; font-size: 12px; opacity: 0.9; }
        .cc-link { background: transparent; border: 0; padding: 0; font-weight: 1000; text-decoration: underline; cursor: pointer; color: #111; }
        .cc-tabs { display: inline-flex; border: 1px solid #eee; border-radius: 14px; overflow: hidden; }
        .cc-tab { padding: 10px 12px; border: 0; background: #fff; font-weight: 900; cursor: pointer; }
        .cc-tab--active { background: #f6f6f6; }
        .cc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; justify-content: center; align-items: center; padding: 16px; }
        .cc-overlay--sheet { z-index: 50; align-items: flex-end; }
        .cc-overlay--confirm { z-index: 80; }
        .cc-sheet { width: 100%; max-width: 780px; background: #fff; border-radius: 18px 18px 0 0; overflow: hidden; }
        .cc-sheet--square { border-radius: 18px; margin: 0; }
        .cc-sheet-header { padding: 12px 14px; border-bottom: 1px solid #eee; }
        .cc-sheet-title { font-weight: 1000; font-size: 18px; }
        .cc-sheet-sub { opacity: 0.75; font-size: 13px; margin-top: 2px; }
        .cc-sheet-body { padding: 12px 14px; max-height: 70vh; overflow: auto; }
        .cc-sheet-footer { padding: 12px 14px; border-top: 1px solid #eee; }
        .cc-list { display: grid; gap: 10px; }
        .cc-listitem { border: 1px solid #eee; border-radius: 14px; padding: 10px 12px; }
        .cc-modal { width: min(520px, 100%); background: #fff; border-radius: 18px; border: 1px solid #eee; padding: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        .cc-notes { margin: 8px 0 0 18px; padding: 0; display: grid; gap: 4px; }
      `}</style>
    </main>
  );
}