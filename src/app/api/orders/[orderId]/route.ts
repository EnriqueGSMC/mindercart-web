// FILE: src/app/api/orders/[orderId]/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function resolveItemIndex(items: any[], itemId: string): number {
  const target = safe(itemId);
  if (!target) return -1;

  // Prefer explicit ids
  let idx = items.findIndex((it: any) => safe(it?.itemId || it?.id) === target);
  if (idx >= 0) return idx;

  // If caller sends an index (recommended when items don't have ids)
  if (/^\d+$/.test(target)) {
    const n = Number(target);
    if (Number.isInteger(n) && n >= 0 && n < items.length) return n;
  }

  // Fallback to productId match (legacy; ambiguous if duplicates)
  idx = items.findIndex((it: any) => safe(it?.productId) === target);
  return idx;
}

function canView(role: string) {
  return role === "ADMIN" || role === "BUYER" || role === "PURCHASER" || role === "BASIC";
}

function canBuy(role: string) {
  return role === "ADMIN" || role === "BUYER" || role === "PURCHASER";
}

function coerceItemsArray(items: any): any[] {
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") {
    const obj = items as Record<string, any>;
    const keys = Object.keys(obj);
    const allNumeric = keys.length > 0 && keys.every((k) => String(Number(k)) === k);
    if (allNumeric) {
      return keys
        .map((k) => Number(k))
        .sort((a, b) => a - b)
        .map((n) => obj[String(n)])
        .filter(Boolean);
    }
    return Object.values(obj).filter(Boolean);
  }
  return [];
}

function normalizeItems(items: any[]) {
  return (Array.isArray(items) ? items : []).map((it) => ({
    id: safe(it?.id || it?.itemId || it?.productId),
    itemId: safe(it?.itemId || it?.id || it?.productId),
    needId: safe(it?.needId || ""),
    productId: safe(it?.productId),
    productName: safe(it?.productName),
    needQty: safe(it?.needQty || "0"),
    unitCapture: safe(it?.unitCapture || ""),
    note: safe(it?.note || ""),
    state: safe(it?.state || ""),
    purchaseState: safe(it?.purchaseState || it?.state || ""),
    received: Boolean(it?.received),
    notBoughtReasonText: safe(it?.notBoughtReasonText || it?.notBoughtReason?.text || ""),
    notBoughtReason: it?.notBoughtReason || null,
    requeueSupplierId: safe(it?.requeueSupplierId || ""),
    requeueSupplierName: safe(it?.requeueSupplierName || ""),
    lastPurchaseState: safe(it?.lastPurchaseState || ""),
    lastNotBoughtReasonText: safe(it?.lastNotBoughtReasonText || ""),
    lastPurchaseSupplierName: safe(it?.lastPurchaseSupplierName || ""),
    lastPurchaseOrderNo: safe(it?.lastPurchaseOrderNo || ""),
    lastPurchaseOrderId: safe(it?.lastPurchaseOrderId || ""),
    lastPurchaseAtMs: Number(it?.lastPurchaseAtMs || 0) || 0,
  }));
}

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const { role, branchId } = await requireAuth(req);
    if (!canView(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branch = safe(url.searchParams.get("branch")) || safe(branchId);

    const { orderId } = await ctx.params;
    const id = safe(orderId);
    if (!id) throw new Error("orderId requerido");

    const db = adminDb();
    const ref = db.doc(`branches/${branch}/orders/${id}`);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const d = snap.data() as any;
    const lines = normalizeItems(coerceItemsArray(d?.items));

    return NextResponse.json({
      ok: true,
      orderId: snap.id,
      order: {
        id: snap.id,
        orderId: snap.id,
        status: safe(d?.status),
        orderNo: safe(d?.orderNo),
        supplier: d?.supplier || null,
        supplierId: safe(d?.supplier?.id || d?.supplierId),
        supplierName: safe(d?.supplier?.name || d?.supplierName),
        supplierAddressText: safe(d?.supplier?.addressText || d?.supplierAddressText),
        createdAtMs: Number(d?.createdAtMs || 0) || 0,
        updatedAtMs: Number(d?.updatedAtMs || 0) || 0,
        authorizedAtMs: Number(d?.authorizedAtMs || 0) || 0,
        authorizedAt: safe(d?.authorizedAt || ""),
        receiveNote: safe(d?.receiveNote || ""),
        receiptType: safe(d?.receiptType || ""),
        deliveredAtMs: Number(d?.deliveredAtMs || 0) || 0,
        receivedAtMs: Number(d?.receivedAtMs || 0) || 0,
        closedAtMs: Number(d?.closedAtMs || 0) || 0,
        deliveredBy: d?.deliveredBy || null,
        receivedBy: d?.receivedBy || null,
        deliveredByUserId: safe(d?.deliveredByUserId || d?.deliveredBy?.id || ""),
        deliveredByName: safe(d?.deliveredByName || d?.deliveredBy?.name || d?.deliveredBy?.email || ""),
        receivedByUserId: safe(d?.receivedByUserId || d?.receivedBy?.id || ""),
        receivedByName: safe(d?.receivedByName || d?.receivedBy?.name || d?.receivedBy?.email || ""),
        items: lines,
      },
      lines,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const { role, branchId } = await requireAuth(req);
    if (!canBuy(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branch = safe(url.searchParams.get("branch")) || safe(branchId);

    const { orderId } = await ctx.params;
    const id = safe(orderId);
    if (!id) throw new Error("orderId requerido");

    const body = await req.json().catch(() => ({} as any));
    const action = safe(body?.action);

    const db = adminDb();
    const ref = db.doc(`branches/${branch}/orders/${id}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Orden no encontrada");

    const d = snap.data() as any;
    const items = [...coerceItemsArray(d?.items)];

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    if (action === "setStatus") {
      const status = safe(body?.status).toUpperCase();
      if (!["CREATED", "BUYING", "CLOSED", "RECEIVED"].includes(status)) {
        throw new Error("status inválido");
      }

      await ref.update({
        status,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      });

      return NextResponse.json({ ok: true, status });
    }

    if (action === "markBought") {
      const itemId = safe(body?.itemId);
      const note = safe(body?.note);
      if (!itemId) throw new Error("itemId requerido");

      const idx = resolveItemIndex(items, itemId);
      if (idx < 0) throw new Error("Item no encontrado");

      items[idx] = {
        ...items[idx],
        purchaseState: "BOUGHT",
        state: "BOUGHT",
        notBoughtReasonText: "",
        notBoughtReason: null,
        requeueSupplierId: "",
        requeueSupplierName: "",
        note: note || safe(items[idx]?.note || ""),
      };

      await ref.update({
        status: "BUYING",
        items,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "markNotBought") {
  const itemId = safe(body?.itemId);
  const reasonText = safe(body?.reasonText);
  const requeueSupplierId = safe(body?.requeueSupplierId);
  const requeueSupplierName = safe(body?.requeueSupplierName);
  const note = safe(body?.note);

  if (!itemId) throw new Error("itemId requerido");
  if (!reasonText) throw new Error("reasonText requerido");

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const needId = await db.runTransaction(async (tx) => {
    const cur = await tx.get(ref);
    if (!cur.exists) throw new Error("Orden no encontrada");

    const d0 = cur.data() as any;
    const items0 = [...coerceItemsArray(d0?.items)];

    const idx = resolveItemIndex(items0, itemId);
    if (idx < 0) throw new Error("Item no encontrado");

    const curr = items0[idx] || {};
    const supplierId =
      requeueSupplierId || safe(d0?.supplier?.id || d0?.supplierId || curr?.requeueSupplierId || "");
    const supplierName =
      requeueSupplierName || safe(d0?.supplier?.name || d0?.supplierName || curr?.requeueSupplierName || "");

    const productId = safe(curr?.productId || "");
    const productName = safe(curr?.productName || curr?.name || "");
    const unitCapture = safe(curr?.unitCapture || curr?.unit || "");
    const needQty = safe(curr?.needQty || curr?.qty || "1");
    const existingNeedId = safe(curr?.needId || "");

    // Reusa needId si existe y el doc está, si no crea uno nuevo.
    let needRef = existingNeedId ? db.doc(`branches/${branch}/needs/${existingNeedId}`) : null;
    if (needRef) {
      const needSnap = await tx.get(needRef);
      if (!needSnap.exists) needRef = null;
    }
    if (!needRef) needRef = db.collection(`branches/${branch}/needs`).doc();

    const nextNeedId = needRef.id;

    items0[idx] = {
      ...curr,
      needId: nextNeedId,
      purchaseState: "NOT_BOUGHT",
      state: "NOT_BOUGHT",
      notBoughtReasonText: reasonText,
      notBoughtReason: { text: reasonText },
      requeueSupplierId: supplierId,
      requeueSupplierName: supplierName,
      note: note || safe(curr?.note || ""),
      lastPurchaseState: "NOT_BOUGHT",
      lastNotBoughtReasonText: reasonText,
      lastPurchaseSupplierName: safe(d0?.supplier?.name || d0?.supplierName || ""),
      lastPurchaseOrderNo: safe(d0?.orderNo || ""),
      lastPurchaseOrderId: safe(cur.id || ""),
      lastPurchaseAtMs: nowMs,
    };

    tx.set(
      needRef,
      {
        branchId: branch,
        status: "OPEN",
        supplierId,
        supplierName,
        productId,
        productName,
        unitCapture,
        needQty,
        note: note || "",
        notBoughtReasonText: reasonText,
        fromOrderId: cur.id,
        fromOrderNo: safe(d0?.orderNo || ""),
        createdAt: nowIso,
        createdAtMs: nowMs,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      },
      { merge: true }
    );

    tx.update(ref, {
      status: "BUYING",
      items: items0,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    });

    return nextNeedId;
  });

  return NextResponse.json({ ok: true, needId });
}



    if (action === "setNote") {
      const itemId = safe(body?.itemId);
      const note = safe(body?.note);
      if (!itemId) throw new Error("itemId requerido");

      const idx = resolveItemIndex(items, itemId);
      if (idx < 0) throw new Error("Item no encontrado");

      items[idx] = { ...items[idx], note };

      await ref.update({
        status: "BUYING",
        items,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      });

      return NextResponse.json({ ok: true });
    }

    throw new Error("action inválida");
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}