// FILE: src/app/basic/recibir/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder } from "@/lib/types";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

type TabKey = "recibido" | "historial";
type ModalMode = "view" | "deliverer" | "confirm" | "checklist";

function toMillis(v: any): number {
  if (!v) return 0;
  if (typeof v?.toDate === "function") return v.toDate().getTime();
  if (typeof v === "number") return v;
  const t = new Date(String(v)).getTime();
  return Number.isFinite(t) ? t : 0;
}

function formatDate(v?: any, vMs?: any): string {
  const ms = toMillis(vMs) || toMillis(v);
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}


function itemAlreadyReceived(it: any): boolean {
  const status = String(
    it?.receiptStatus ||
      it?.receivingStatus ||
      it?.receiveStatus ||
      it?.deliveryStatus ||
      it?.status ||
      ""
  )
    .trim()
    .toUpperCase();

  const qtyReceived = Number(it?.receivedQty ?? it?.qtyReceived ?? it?.deliveredQty ?? 0) || 0;
  const receivedFlag = Boolean(
    it?.received ||
      it?.isReceived ||
      it?.checked ||
      it?.delivered ||
      it?.receivedOk
  );

  return receivedFlag || qtyReceived > 0 || ["RECEIVED", "PARTIAL", "DELIVERED", "CHECKED"].includes(status);
}

function Modal(props: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  if (!props.open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={props.onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontWeight: 900 }}>{props.title}</div>
            {props.subtitle ? <div className="muted" style={{ fontSize: 13 }}>{props.subtitle}</div> : null}
          </div>
          <button className="btn" onClick={props.onClose}>Regresar</button>
        </div>
        <div className="modal-body">{props.children}</div>
      </div>
    </div>
  );
}

export default function BasicRecibirPage() {
  const [tab, setTab] = useState<TabKey>("recibido");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deliveries, setDeliveries] = useState<PurchaseOrder[]>([]);
  const [history, setHistory] = useState<PurchaseOrder[]>([]);

  const [activeOrder, setActiveOrder] = useState<PurchaseOrder | null>(null);
  const [mode, setMode] = useState<ModalMode>("view");

  const [deliveredByName, setDeliveredByName] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      if (tab === "recibido") {
        const res = await fetch(`/api/basic/receiving/deliveries?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const data = await res.json();
        setDeliveries((data.orders ?? []) as PurchaseOrder[]);
      } else {
        const res = await fetch(`/api/basic/receiving/history?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const data = await res.json();
        setHistory((data.orders ?? []) as PurchaseOrder[]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error cargando");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const groupedDeliveries = useMemo(() => {
    const map = new Map<string, PurchaseOrder[]>();
    for (const o of deliveries) {
      const k = o.supplierName || "Sin proveedor";
      const arr = map.get(k) ?? [];
      arr.push(o);
      map.set(k, arr);
    }

    const groups = [...map.entries()].map(([supplier, orders]) => {
      const sorted = [...orders].sort((a: any, b: any) => {
        const ta = toMillis((a as any).closedAtMs) || toMillis((a as any).closedAt);
        const tb = toMillis((b as any).closedAtMs) || toMillis((b as any).closedAt);
        return tb - ta;
      });
      return { supplier, orders: sorted };
    });

    groups.sort((a, b) => {
      const ta = a.orders.length ? (toMillis((a.orders[0] as any).closedAtMs) || toMillis((a.orders[0] as any).closedAt)) : 0;
      const tb = b.orders.length ? (toMillis((b.orders[0] as any).closedAtMs) || toMillis((b.orders[0] as any).closedAt)) : 0;
      return tb - ta;
    });

    return groups;
  }, [deliveries]);

  function openOrder(o: PurchaseOrder) {
    setActiveOrder(o);
    setMode("view");
    setDeliveredByName(safe((o as any).deliveredByName || (o as any).receivedByName || ""));
    const init: Record<string, boolean> = {};
    for (const it of (o.items ?? [])) init[it.id] = itemAlreadyReceived(it);
    setChecked(init);
  }

  function closeModal() {
    setActiveOrder(null);
    setMode("view");
    setDeliveredByName("");
    setChecked({});
  }

  async function saveReceive() {
    if (!activeOrder) return;
    if (!deliveredByName.trim()) {
      setError("Escribe quién entrega.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const receivedItemIds = Object.entries(checked).filter(([, v]) => v).map(([k]) => k);

      const res = await fetch("/api/basic/receiving/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeOrder.id,
          deliveredByName,
          receivedItemIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar");

      closeModal();
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Compras / Recibir</div>
          <div className="muted" style={{ marginTop: 4 }}>Simple: CLOSED → recibir → RECEIVED.</div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "recibido" ? "tab-active" : ""}`} onClick={() => setTab("recibido")}>Recibido</button>
          <button className={`tab ${tab === "historial" ? "tab-active" : ""}`} onClick={() => setTab("historial")}>Historial</button>
        </div>
      </div>

      <div className="hr" style={{ margin: "14px 0" }} />

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="label">Buscar (proveedor o # orden)</div>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn" onClick={load} disabled={loading}>Buscar</button>
      </div>

      {error && <div className="card" style={{ borderColor: "#b00020", color: "#b00020", marginBottom: 12 }}>{error}</div>}
      {loading && <div className="muted">Cargando…</div>}

      {!loading && tab === "recibido" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {groupedDeliveries.length === 0 ? (
            <div className="muted">No hay compras CLOSED para recibir.</div>
          ) : (
            groupedDeliveries.map((g) => (
              <div key={g.supplier} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{g.supplier}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{g.orders.length} orden(es)</div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 10 }}>
                  {g.orders.map((o: any) => (
                    <button
                      key={o.id}
                      className="card"
                      style={{ borderRadius: 14, textAlign: "left", cursor: "pointer" }}
                      onClick={() => openOrder(o)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 850 }}>{o.supplierName}</div>
                        <div className="muted">{o.items?.length ?? 0} art.</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                        <div className="muted"># {o.orderNumber ?? o.id.slice(0, 8)}</div>
                        <div className="muted">{formatDate(o.closedAt, o.closedAtMs)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && tab === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.length === 0 ? (
            <div className="muted">No hay historial.</div>
          ) : (
            history.map((o: any) => (
              <button
                key={o.id}
                className="card"
                style={{ textAlign: "left", cursor: "pointer" }}
                onClick={() => openOrder(o)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{o.supplierName}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge">{o.receiptType ?? "—"}</span>
                    <div className="muted">{o.items?.length ?? 0} art.</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <div className="muted"># {o.orderNumber ?? o.id.slice(0, 8)}</div>
                  <div className="muted">Recibido: {formatDate(o.receivedAt, o.receivedAtMs)}</div>
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                  Entrega: {o.deliveredByName ?? "—"}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <Modal
        open={!!activeOrder}
        title={activeOrder ? `${activeOrder.supplierName}` : ""}
        subtitle={activeOrder ? `Orden #${activeOrder.orderNumber ?? activeOrder.id.slice(0, 8)}` : ""}
        onClose={closeModal}
      >
        {activeOrder && (
          <>
            {mode === "view" && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th style={{ width: 140 }}>Cantidad</th>
                      <th style={{ width: 110 }}>Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeOrder.items ?? []).map((it) => (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 700 }}>{it.name}</td>
                        <td className="muted">{it.qty} {it.unit ?? ""}</td>
                        <td className="muted">{it.purchaseStatus ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="btn" onClick={closeModal}>Regresar</button>
                  {tab === "recibido" ? (
                    <button className="btn btn-primary" onClick={() => setMode("deliverer")}>Recibir</button>
                  ) : (
                    <button className="btn" disabled>Recibir</button>
                  )}
                </div>
              </>
            )}

            {mode === "deliverer" && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div className="label">¿Quién entrega?</div>
                  <input className="input" value={deliveredByName} onChange={(e) => setDeliveredByName(e.target.value)} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn" onClick={() => setMode("view")}>Regresar</button>
                  <button className="btn btn-primary" onClick={() => setMode("confirm")} disabled={!deliveredByName.trim()}>
                    Continuar
                  </button>
                </div>
              </>
            )}

            {mode === "confirm" && (
              <>
                <div className="card" style={{ padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Confirmación</div>
                  <div className="muted">Entrega: <span style={{ color: "#000" }}>{deliveredByName}</span></div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    Lo que no llegue se deja sin check (queda PARTIAL).
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn" onClick={() => setMode("deliverer")}>Regresar</button>
                  <button className="btn btn-primary" onClick={() => setMode("checklist")}>Confirmar</button>
                </div>
              </>
            )}

            {mode === "checklist" && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>Recibido</th>
                      <th>Artículo</th>
                      <th style={{ width: 140 }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeOrder.items ?? []).map((it) => (
                      <tr key={it.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!checked[it.id]}
                            onChange={(e) => setChecked((prev) => ({ ...prev, [it.id]: e.target.checked }))}
                          />
                        </td>
                        <td style={{ fontWeight: 750 }}>{it.name}</td>
                        <td className="muted">{it.qty} {it.unit ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="btn" onClick={() => setMode("view")} disabled={saving}>Regresar</button>
                  <button className="btn btn-primary" onClick={saveReceive} disabled={saving}>
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}