// ============================================================================
// FILE: src/app/api/orders/create/route.ts
// ============================================================================
//
// Cambio: "1 orden abierta por proveedor/sucursal"
// - Al autorizar (o crear) para un supplierId, ahora REUTILIZA una orden existente
//   si su status está en: DRAFT | CREATED | BUYING (misma sucursal + proveedor).
// - Los nuevos needs OPEN se agregan a esa orden:
//   - Se consolidan entre sí (producto+unidad)
//   - Se mezclan SOLO con renglones PENDING existentes (NO se fusiona con BOUGHT/NOT_BOUGHT)
// - orderNo NO impide consolidar: se conserva el mismo.
// - Se setea authorizedAt/authorizedAtMs cuando se pasa a CREATED (o si falta).
//
// Esto evita crear múltiples órdenes del mismo proveedor entre días mientras la orden
// siga abierta.
//
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function n(v: unknown) {
  const x = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(x) ? x : 0;
}

function normalizeKeyPart(v: string) {
  const s = safe(v).toLowerCase();
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAddressText(s: any) {
  const line1 = safe(s.addressLine1 || s.address1 || s.street || s.address || "");
  const city = safe(s.city || "");
  const state = safe(s.state || "");
  const postal = safe(s.postalCode || s.zip || "");
  return [line1, city, state, postal].filter(Boolean).join(", ");
}

function looksLikeLegacyOrderNo(orderNo: string) {
  return /^\d{8}-\d{4,}$/.test(safe(orderNo));
}

function getYear2(nowMs: number) {
  return String(new Date(nowMs).getFullYear()).slice(-2);
}

function getBranchPrefix(branch: string) {
  const b = safe(branch).toLowerCase();
  const m = b.match(/sucursal-([a-z0-9])/);
  if (m?.[1]) return String(m[1]).toUpperCase();
  return safe(branch).slice(0, 1).toUpperCase() || "A";
}

function formatOrderNo(prefix: string, yy: string, seq: number) {
  return `${prefix}-${yy}-${String(seq).padStart(5, "0")}`;
}

async function allocOrderNoTx(params: {
  tx: any;
  db: any;
  branch: string;
  nowIso: string;
  nowMs: number;
}) {
  const { tx, db, branch, nowIso, nowMs } = params;
  const yy = getYear2(nowMs);
  const prefix = getBranchPrefix(branch);
  const counterRef = db.doc(`branches/${branch}/counters/orders_${yy}`);
  const snap = await tx.get(counterRef);
  const prev = snap.exists ? Number((snap.data() as any)?.seq || 0) : 0;
  const seq = prev + 1;

  tx.set(counterRef, { seq, updatedAt: nowIso, updatedAtMs: nowMs }, { merge: true });

  return formatOrderNo(prefix, yy, seq);
}

function statusOfItem(it: any): string {
  return safe(it?.purchaseState || it?.state || "PENDING").toUpperCase() || "PENDING";
}

function isPendingItem(it: any): boolean {
  const s = statusOfItem(it);
  return s === "PENDING" || s === "";
}

function itemKey(it: any): string {
  const pid = safe(it?.productId);
  const nameKey = normalizeKeyPart(safe(it?.productName));
  const unit = safe(it?.unitCapture) || "-";
  const base = pid || nameKey;
  if (!base) return "";
  return `${base}__${unit}`;
}

function applyAttempt(dst: any, src: any) {
  const srcAt = Number(src?.lastPurchaseAtMs || 0) || 0;
  const dstAt = Number(dst?.lastPurchaseAtMs || 0) || 0;

  const srcHas =
    srcAt > 0 ||
    safe(src?.lastPurchaseSupplierName) ||
    safe(src?.lastNotBoughtReasonText) ||
    safe(src?.lastPurchaseOrderNo);
  const dstHas =
    dstAt > 0 ||
    safe(dst?.lastPurchaseSupplierName) ||
    safe(dst?.lastNotBoughtReasonText) ||
    safe(dst?.lastPurchaseOrderNo);

  if (!srcHas) return dst;

  if (!dstHas || srcAt > dstAt) {
    return {
      ...dst,
      lastPurchaseState: safe(src?.lastPurchaseState),
      lastNotBoughtReasonText: safe(src?.lastNotBoughtReasonText),
      lastPurchaseSupplierId: safe(src?.lastPurchaseSupplierId),
      lastPurchaseSupplierName: safe(src?.lastPurchaseSupplierName),
      lastPurchaseOrderId: safe(src?.lastPurchaseOrderId),
      lastPurchaseOrderNo: safe(src?.lastPurchaseOrderNo),
      lastPurchaseAtMs: srcAt,
    };
  }

  return dst;
}

function consolidateNewItems(items: any[]) {
  // Consolida SOLO el batch nuevo (todos llegan PENDING)
  const map = new Map<string, any>();

  for (const it of items) {
    const key = itemKey(it);
    if (!key) continue;

    const prev = map.get(key);
    const qty = n(it.needQty) || 0;

    if (!prev) {
      const base = applyAttempt(
        {
          ...it,
          productId: safe(it.productId),
          productName: safe(it.productName),
          unitCapture: safe(it.unitCapture),
          needQty: String(qty || 0),
          state: "PENDING",
        },
        it
      );
      map.set(key, base);
    } else {
      const merged = applyAttempt(
        {
          ...prev,
          productId: prev.productId || safe(it.productId),
          productName: prev.productName || safe(it.productName),
          unitCapture: prev.unitCapture || safe(it.unitCapture),
          needQty: String(n(prev.needQty) + qty),
          note: [safe(prev.note), safe(it.note)].filter(Boolean).join(" | "),
        },
        it
      );
      map.set(key, merged);
    }
  }

  return Array.from(map.values());
}

function mergeIntoExistingOpenOrder(existingItems: any[], newItemsConsolidated: any[]) {
  const out = Array.isArray(existingItems) ? [...existingItems] : [];

  // index ONLY pending items by key
  const pendingIndex = new Map<string, number>();
  for (let i = 0; i < out.length; i++) {
    const it = out[i];
    if (!isPendingItem(it)) continue;
    const key = itemKey(it);
    if (!key) continue;
    if (!pendingIndex.has(key)) pendingIndex.set(key, i);
  }

  for (const ni of newItemsConsolidated) {
    const key = itemKey(ni);
    if (!key) continue;

    const idx = pendingIndex.get(key);
    if (idx === undefined) {
      out.push(ni);
      pendingIndex.set(key, out.length - 1);
      continue;
    }

    const cur = out[idx];
    const merged = applyAttempt(
      {
        ...cur,
        // NO tocamos el estado; solo incrementamos qty y nota en renglón pendiente
        needQty: String(n(cur.needQty) + n(ni.needQty)),
        note: [safe(cur.note), safe(ni.note)].filter(Boolean).join(" | "),
        unitCapture: safe(cur.unitCapture) || safe(ni.unitCapture),
        productId: safe(cur.productId) || safe(ni.productId),
        productName: safe(cur.productName) || safe(ni.productName),
      },
      ni
    );

    out[idx] = merged;
  }

  return out;
}

async function findExistingOpenOrderId(params: {
  ordersCol: FirebaseFirestore.CollectionReference;
  supplierId: string;
}) {
  const { ordersCol, supplierId } = params;

  // Sin orderBy para evitar índices compuestos.
  const snap = await ordersCol.where("status", "in", ["DRAFT", "CREATED", "BUYING"]).limit(250).get();

  let bestId: string | null = null;
  let bestUpdatedAtMs = -1;

  snap.forEach((doc) => {
    const d = doc.data() as any;
    if (safe(d.status) === "MERGED") return;

    const sid = safe(d.supplier?.id || d.supplierId);
    if (sid !== supplierId) return;

    const updatedAtMs = Number(d.updatedAtMs || 0) || 0;
    if (updatedAtMs >= bestUpdatedAtMs) {
      bestUpdatedAtMs = updatedAtMs;
      bestId = doc.id;
    }
  });

  return bestId;
}

export async function POST(req: Request) {
  try {
    const { role, orgId, branchId } = await requireAuth(req);
    if (!["ADMIN", "BUYER", "PURCHASER"].includes(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branch = safe(url.searchParams.get("branch")) || branchId;

    const body = await req.json().catch(() => ({} as any));
    const supplierId = safe(body.supplierId);
    const needIds: string[] = Array.isArray(body.needIds) ? body.needIds.map(safe).filter(Boolean) : [];
    const authorize = Boolean(body.authorize);

    if (!supplierId) throw new Error("supplierId requerido");

    const db = adminDb();
    const needsCol = db.collection(`branches/${branch}/needs`);

    let needs: any[] = [];

    if (needIds.length) {
      const needSnaps = await Promise.all(needIds.map((id) => needsCol.doc(id).get()));
      needs = needSnaps
        .filter((s) => s.exists)
        .map((s) => ({ id: s.id, ...(s.data() as any) }))
        .filter((n) => safe(n.status) === "OPEN" && safe(n?.supplierA?.id || n?.supplierId) === supplierId);
    } else {
      const snap = await needsCol.orderBy("createdAtMs", "desc").limit(2500).get();
      needs = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((n) => safe(n.status) === "OPEN" && safe(n?.supplierA?.id || n?.supplierId) === supplierId);
    }

    if (!needs.length) throw new Error("No hay necesidades OPEN para este proveedor.");

    let supplier: any = {
      id: supplierId,
      name: safe(needs[0]?.supplierA?.name || needs[0]?.supplierName || supplierId),
      addressText: "",
      phone: "",
    };

    try {
      const sSnap = await db.doc(`orgs/${orgId}/suppliers/${supplierId}`).get();
      if (sSnap.exists) {
        const s = sSnap.data() as any;
        supplier = {
          id: supplierId,
          name: safe(s.nameEs || s.name || supplier.name),
          addressText: buildAddressText(s),
          phone: safe(s.phone || s.tel || ""),
        };
      }
    } catch {
      // ignore
    }

    const itemsRaw = needs.map((nn) => ({
      needId: nn.id,
      productId: safe(nn.productId),
      productName: safe(nn.productName),
      categoryName: safe(nn.categoryName),
      unitCapture: safe(nn.unitCapture),
      needQty: safe(nn.needQty || "0"),
      note: safe(nn.note || ""),

      lastPurchaseState: safe((nn as any).lastPurchaseState),
      lastNotBoughtReasonText: safe((nn as any).lastNotBoughtReasonText),
      lastPurchaseSupplierId: safe((nn as any).lastPurchaseSupplierId),
      lastPurchaseSupplierName: safe((nn as any).lastPurchaseSupplierName),
      lastPurchaseOrderId: safe((nn as any).lastPurchaseOrderId),
      lastPurchaseOrderNo: safe((nn as any).lastPurchaseOrderNo),
      lastPurchaseAtMs: Number((nn as any).lastPurchaseAtMs || 0) || 0,

      state: "PENDING",
      notBought: null,
    }));

    const newItems = consolidateNewItems(itemsRaw);

    const ordersCol = db.collection(`branches/${branch}/orders`);
    const existingOpenId = await findExistingOpenOrderId({ ordersCol, supplierId });

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    if (existingOpenId) {
      const ref = ordersCol.doc(existingOpenId);

      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error("Orden abierta no existe");

        const d = snap.data() as any;

        const prevItems = Array.isArray(d.items) ? d.items : [];
        const mergedItems = mergeIntoExistingOpenOrder(prevItems, newItems);

        const curStatus = safe(d.status) || "DRAFT";
        let nextStatus = curStatus;

        // Si autorizan y estaba DRAFT => pasa a CREATED (pero NO crea otro doc).
        if (authorize && curStatus === "DRAFT") nextStatus = "CREATED";

        let orderNoNext = safe(d.orderNo || "");
        if (authorize && (!orderNoNext || looksLikeLegacyOrderNo(orderNoNext))) {
          orderNoNext = await allocOrderNoTx({ tx, db, branch, nowIso, nowMs });
        }

        const hadAuthorizedAt = Number(d.authorizedAtMs || 0) > 0 || safe(d.authorizedAt);
        const shouldSetAuthorizedAt = authorize && nextStatus === "CREATED" && !hadAuthorizedAt;

        tx.update(ref, {
          supplier,
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierAddressText: supplier.addressText,

          updatedAt: nowIso,
          updatedAtMs: nowMs,

          items: mergedItems,
          status: nextStatus,
          orderNo: orderNoNext,

          ...(shouldSetAuthorizedAt
            ? { authorizedAt: nowIso, authorizedAtMs: nowMs }
            : {}),
        });

        for (const nd of needs) {
          tx.update(needsCol.doc(nd.id), {
            status: "IN_ORDER",
            orderId: existingOpenId,
            updatedAt: nowIso,
            updatedAtMs: nowMs,
          });
        }
      });

      return NextResponse.json({ ok: true, orderId: existingOpenId, reusedOpenOrder: true });
    }

    // No había orden abierta: crear una nueva.
    const status = authorize ? "CREATED" : "DRAFT";
    const orderRef = ordersCol.doc();
    let createdOrderNo = "";

    await db.runTransaction(async (tx) => {
      if (authorize) {
        createdOrderNo = await allocOrderNoTx({ tx, db, branch, nowIso, nowMs });
      }

      const doc = {
        orgId,
        branchId: branch,
        status,
        orderNo: createdOrderNo,

        supplier,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierAddressText: supplier.addressText,

        createdAt: nowIso,
        createdAtMs: nowMs,
        updatedAt: nowIso,
        updatedAtMs: nowMs,

        ...(authorize ? { authorizedAt: nowIso, authorizedAtMs: nowMs } : {}),

        items: newItems,
        needsCount: needs.length,
      };

      tx.set(orderRef, doc);

      for (const nd of needs) {
        tx.update(needsCol.doc(nd.id), {
          status: "IN_ORDER",
          orderId: orderRef.id,
          updatedAt: nowIso,
          updatedAtMs: nowMs,
        });
      }
    });

    return NextResponse.json({
      ok: true,
      orderId: orderRef.id,
      reusedOpenOrder: false,
      orderNo: createdOrderNo,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
