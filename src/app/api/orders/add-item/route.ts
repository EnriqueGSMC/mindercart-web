// FILE: src/app/api/orders/add-item/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function canBuy(role: string) {
  return ["ADMIN", "BUYER", "PURCHASER"].includes(String(role || "").toUpperCase());
}
function normalizeItems(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, any>)
      .filter(([k]) => /^\d+$/.test(k))
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    if (entries.length) return entries.map(([, v]) => v);
    return Object.values(raw as Record<string, any>);
  }
  return [];
}
function parseQty(q: string): number | null {
  const s = safe(q).replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function fmtQty(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Number.isInteger(r) ? String(r) : String(r);
}
function getState(it: any) {
  return String(it?.purchaseState || it?.state || "PENDING").toUpperCase().trim();
}

export async function POST(req: Request) {
  try {
    const { orgId, role, branchId: claimBranchId } = await requireAuth(req);
    if (!canBuy(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const orderId = safe(body.orderId);
    const branchId = safe(body.branchId) || safe(claimBranchId) || "sucursal-a";
    const productId = safe(body.productId);
    const needQty = safe(body.needQty);
    const note = safe(body.note || "");
    const unitFromBody = safe(body.unitCapture || "");

    if (!orderId) throw new Error("orderId requerido");
    if (!productId) throw new Error("productId requerido");
    if (!needQty) throw new Error("needQty requerido");

    const db = adminDb();
    const { col } = await resolveProductsCollection(db, orgId);

    const pSnap = await col.doc(productId).get();
    if (!pSnap.exists) throw new Error("Producto no existe");
    const p = pSnap.data() as any;

    const ref = db.doc(`branches/${branchId}/orders/${orderId}`);
    const oSnap = await ref.get();
    if (!oSnap.exists) throw new Error("Pedido no existe");
    const o = oSnap.data() as any;

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const productName = safe(p.nameEs || p.name || productId);
    const unitCapture = unitFromBody || safe(p.unitCapture || "") || "pza";
    const categoryName = safe(p.categoryNameEs || p.categoryName || "");

    const items = normalizeItems(o.items);

    // merge SOLO contra PENDING same productId+unitCapture
    const idx = items.findIndex((it) => getState(it) === "PENDING" && safe(it.productId) === productId && safe(it.unitCapture) === unitCapture);

    if (idx >= 0) {
      const it = { ...(items[idx] || {}) };
      const a = parseQty(safe(it.needQty));
      const b = parseQty(needQty);
      it.needQty = a !== null && b !== null ? fmtQty(a + b) : `${safe(it.needQty) || ""}${safe(it.needQty) ? " + " : ""}${needQty}`;
      it.note = safe(it.note) ? (note ? `${safe(it.note)} | ${note}` : safe(it.note)) : note;
      it.updatedAt = nowIso;
      it.updatedAtMs = nowMs;
      items[idx] = it;

      await ref.update({ items, updatedAt: nowIso, updatedAtMs: nowMs });
      return NextResponse.json({ ok: true, merged: true, mergedIndex: idx });
    }

    const itemId = `${productId}_${nowMs}_${Math.random().toString(16).slice(2)}`;
    const newItem = {
      itemId,
      productId,
      productName,
      categoryName,
      unitCapture,
      needQty,
      note,

      purchaseState: "PENDING",
      notBoughtReason: null,

      createdFrom: "IN_STORE",
      createdAt: nowIso,
      createdAtMs: nowMs,
    };

    items.push(newItem);

    await ref.update({
      items,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    });

    return NextResponse.json({ ok: true, merged: false, itemId });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}