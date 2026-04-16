// FILE: src/app/api/orders/close-buying/route.ts
//
// Cierra una orden de compras cuando ya no hay items PENDING.
// Si hay items NOT_BOUGHT (N/C), los re-encola como Needs OPEN (uno por renglón),
// preservando proveedores alternos (supplierA/B/C) para que en un siguiente N/C
// vuelvan a mostrarse las opciones de proveedor 2/3.

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function roleFromAuth(a: any) {
  return safe(a?.role || a?.decoded?.role);
}

function canBuy(role: string) {
  return ["ADMIN", "BUYER", "PURCHASER"].includes(role);
}

type PurchaseState = "PENDING" | "BOUGHT" | "NOT_BOUGHT";

function pickState(it: any): PurchaseState {
  const s = safe(it?.purchaseState || it?.state || "PENDING");
  if (s === "BOUGHT") return "BOUGHT";
  if (s === "NOT_BOUGHT") return "NOT_BOUGHT";
  return "PENDING";
}

type SupplierOpt = { id: string; name: string; rank: number };

function normalizeSupplier(v: any): { id: string; name: string } | null {
  if (!v) return null;

  if (typeof v === "string") {
    const id = safe(v);
    if (!id) return null;
    return { id, name: id };
  }

  const id = safe(v?.id || v?.supplierId || v?.uid || "");
  if (!id) return null;

  const name = safe(v?.nameEs || v?.name || v?.supplierNameEs || v?.supplierName || "");
  return { id, name: name || id };
}

function collectSuppliersFromDoc(d: any): SupplierOpt[] {
  const out: SupplierOpt[] = [];

  const add = (v: any, rank: number) => {
    const s = normalizeSupplier(v);
    if (!s) return;
    out.push({ id: s.id, name: s.name, rank });
  };

  add(d?.supplierA, 1);
  add(d?.supplierB, 2);
  add(d?.supplierC, 3);

  if (!safe(d?.supplierA?.id) && safe(d?.supplierId)) {
    add({ id: d?.supplierId, name: d?.supplierName }, 1);
  }

  add(d?.supplier2, 2);
  add(d?.supplier3, 3);

  // uniq por id, preservando el menor rank
  const best = new Map<string, SupplierOpt>();
  for (const s of out) {
    const prev = best.get(s.id);
    if (!prev || s.rank < prev.rank) best.set(s.id, s);
  }

  return Array.from(best.values()).sort((a, b) => a.rank - b.rank);
}

function reorderSuppliersForNewNeed(params: {
  candidates: SupplierOpt[];
  primaryId: string;
  primaryName: string;
}) {
  const { candidates, primaryId, primaryName } = params;

  const primary: SupplierOpt = {
    id: primaryId,
    name: safe(primaryName) || primaryId,
    rank: 1,
  };

  const filtered = candidates.filter((s) => safe(s.id) && s.id !== primaryId);

  // preserva orden por rank (2,3,...) y nombre
  filtered.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "es"));

  const b = filtered[0] ? { id: filtered[0].id, name: filtered[0].name } : null;
  const c = filtered[1] ? { id: filtered[1].id, name: filtered[1].name } : null;

  return {
    supplierA: { id: primary.id, name: primary.name },
    supplierB: b,
    supplierC: c,
  };
}

function buildRequeuedNeedDoc(params: {
  orderId: string;
  orderNo: string;
  fallbackSupplierId: string;
  fallbackSupplierName: string;
  item: any;
  itemKey: string;
  nowIso: string;
  nowMs: number;
  supplierCandidates: SupplierOpt[];
}) {
  const {
    orderId,
    orderNo,
    fallbackSupplierId,
    fallbackSupplierName,
    item,
    itemKey,
    nowIso,
    nowMs,
    supplierCandidates,
  } = params;

  const requeueSupplierId = safe(item?.requeueSupplierId || item?.requeueToSupplierId || "");
  const requeueSupplierName = safe(item?.requeueSupplierName || item?.requeueToSupplierName || "");

  const finalSupplierId = requeueSupplierId || safe(item?.supplierId || fallbackSupplierId);
  const finalSupplierName = requeueSupplierName || safe(item?.supplierName || fallbackSupplierName);

  const { supplierA, supplierB, supplierC } = reorderSuppliersForNewNeed({
    candidates: supplierCandidates,
    primaryId: finalSupplierId,
    primaryName: finalSupplierName,
  });

  return {
    status: "OPEN",
    productId: safe(item?.productId || ""),
    productName: safe(item?.productName || ""),
    categoryName: safe(item?.categoryName || ""),
    unitCapture: safe(item?.unitCapture || ""),
    needQty: safe(item?.needQty || "0"),
    note: safe(item?.note || ""),

    // Importante: orders/create filtra por supplierA.id si existe.
    // Para que el need caiga en el proveedor escogido, supplierA debe ser el proveedor final.
    supplierA,
    ...(supplierB ? { supplierB } : {}),
    ...(supplierC ? { supplierC } : {}),

    // fallback legacy
    supplierId: supplierA.id,
    supplierName: supplierA.name,

    lastPurchaseState: "NOT_BOUGHT",
    lastNotBoughtReasonText: safe(item?.notBoughtReasonText || item?.notBoughtReason?.text || ""),
    lastPurchaseOrderId: orderId,
    lastPurchaseOrderNo: orderNo,
    lastPurchaseAtMs: nowMs,

    lastPurchaseSupplierId: fallbackSupplierId,
    lastPurchaseSupplierName: fallbackSupplierName,

    requeuedFromOrderId: orderId,
    requeuedFromOrderItemKey: itemKey,

    createdAt: nowIso,
    createdAtMs: nowMs,
    updatedAt: nowIso,
    updatedAtMs: nowMs,
  };
}

async function hydrateSupplierNames(db: any, orgId: string, rows: SupplierOpt[]) {
  if (!safe(orgId)) return rows;
  const final: SupplierOpt[] = [...rows];

  await Promise.all(
    final.map(async (s) => {
      if (safe(s.name) && safe(s.name) !== safe(s.id)) return;
      try {
        const snap = await db.doc(`orgs/${orgId}/suppliers/${s.id}`).get();
        if (!snap.exists) return;
        const d = snap.data() as any;
        const name = safe(d?.nameEs || d?.name || "");
        if (name) s.name = name;
      } catch {
        // best-effort
      }
    })
  );

  return final;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    const role = roleFromAuth(auth);
    const orgId = safe((auth as any)?.orgId);
    const claimBranchId = safe((auth as any)?.branchId);

    if (!canBuy(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const orderId = safe(body.orderId);
    const branchId = safe(body.branchId) || claimBranchId || "sucursal-a";
    if (!orderId) throw new Error("orderId requerido");

    const db = adminDb();
    const ref = db.doc(`branches/${branchId}/orders/${orderId}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Pedido no existe");

    const o = snap.data() as any;
    const items: any[] = Array.isArray(o.items) ? o.items : [];

    const pending = items.filter((it) => safe(it?.purchaseState || it?.state || "PENDING") === "PENDING");
    if (pending.length > 0) throw new Error("Aún hay artículos pendientes");

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const patched = items.map((it) => {
      if (safe(it?.purchaseState || it?.state) === "BOUGHT") {
        return {
          ...it,
          received: Boolean(it.received),
        };
      }
      return it;
    });

    const needsCol = db.collection(`branches/${branchId}/needs`);
    const supplierId = safe(o?.supplierId || "");
    const supplierName = safe(o?.supplierName || "Proveedor");
    const orderNo = safe(o?.orderNo || "");

    const requeuedItems = patched
      .map((it, idx) => ({ it, idx }))
      .filter(({ it }) => pickState(it) === "NOT_BOUGHT");

    // Prefetch: por cada item N/C, leemos su need original para copiar supplierA/B/C
    const needIds = Array.from(
      new Set(
        requeuedItems
          .map(({ it }) => safe(it?.needId))
          .filter(Boolean)
      )
    );

    const needMap = new Map<string, any>();
    if (needIds.length) {
      const snaps = await Promise.all(needIds.map((id) => needsCol.doc(id).get()));
      for (const s of snaps) {
        if (!s.exists) continue;
        needMap.set(s.id, s.data() as any);
      }
    }

    // best-effort: hidratar nombres si solo vienen ids
    const allCandidateSuppliers: SupplierOpt[] = [];
    for (const [_, nd] of needMap.entries()) {
      allCandidateSuppliers.push(...collectSuppliersFromDoc(nd));
    }
    const uniqCandidate = new Map<string, SupplierOpt>();
    for (const s of allCandidateSuppliers) {
      const prev = uniqCandidate.get(s.id);
      if (!prev || s.rank < prev.rank) uniqCandidate.set(s.id, s);
    }
    const hydratedCandidates = await hydrateSupplierNames(db, orgId, Array.from(uniqCandidate.values()));

    const batch = db.batch();

    batch.update(ref, {
      status: "CLOSED",
      items: patched,
      closedAt: nowIso,
      closedAtMs: nowMs,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    });

    if (requeuedItems.length > 0) {
      for (const { it, idx } of requeuedItems) {
        const itemKey = safe(it?.itemId || it?.id || it?.needId) || String(idx);
        const docId = `requeue__${orderId}__${itemKey}`;

        const baseNeed = needMap.get(safe(it?.needId)) || null;

        // Candidates: prefer the original need's suppliers; fallback to global candidates (best-effort)
        let candidates = baseNeed ? collectSuppliersFromDoc(baseNeed) : [];
        if (candidates.length === 0) candidates = hydratedCandidates;

        const needRef = needsCol.doc(docId);
        batch.set(
          needRef,
          buildRequeuedNeedDoc({
            orderId,
            orderNo,
            fallbackSupplierId: supplierId,
            fallbackSupplierName: supplierName,
            item: it,
            itemKey,
            nowIso,
            nowMs,
            supplierCandidates: candidates,
          }),
          { merge: true }
        );
      }
    }

    await batch.commit();

    return NextResponse.json({
      ok: true,
      mode: "ALL_DONE",
      closedOrderId: orderId,
      requeuedNotBought: requeuedItems.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
