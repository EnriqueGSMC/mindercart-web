// ============================================================================
// FILE: src/app/api/needs/move-to-order/route.ts   (NUEVO)
// - Mueve una NEED (OPEN) a una orden (agrega como item PENDING) y elimina need
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function canBuy(role: string) {
  return ["ADMIN", "BUYER"].includes(role);
}

export async function POST(req: Request) {
  try {
    const { role, branchId: claimBranchId } = await requireAuth(req);
    if (!canBuy(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const needId = safe(body.needId);
    const orderId = safe(body.orderId);
    const branchId = safe(body.branchId) || safe(claimBranchId) || "sucursal-a";
    if (!needId) throw new Error("needId requerido");
    if (!orderId) throw new Error("orderId requerido");

    const db = adminDb();
    const nRef = db.doc(`branches/${branchId}/needs/${needId}`);
    const oRef = db.doc(`branches/${branchId}/orders/${orderId}`);

    const [nSnap, oSnap] = await Promise.all([nRef.get(), oRef.get()]);
    if (!nSnap.exists) throw new Error("Need no existe");
    if (!oSnap.exists) throw new Error("Orden no existe");

    const n = nSnap.data() as any;
    if (safe(n.status) !== "OPEN") throw new Error("Need no está OPEN");

    const o = oSnap.data() as any;
    const items = Array.isArray(o.items) ? o.items : [];

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const itemId = `${safe(n.productId)}_${nowMs}_${Math.random().toString(16).slice(2)}`;

    items.push({
      itemId,
      productId: safe(n.productId),
      productName: safe(n.productName),
      unitCapture: safe(n.unitCapture || ""),
      needQty: safe(n.needQty),
      note: safe(n.note || ""),
      purchaseState: "PENDING",
      notBoughtReason: null,
      createdFrom: "ALT_SUPPLIER",
      createdAt: nowIso,
      createdAtMs: nowMs,
    });

    await Promise.all([
      oRef.update({ items, updatedAt: nowIso, updatedAtMs: nowMs }),
      nRef.update({ status: "MOVED", movedToOrderId: orderId, updatedAt: nowIso, updatedAtMs: nowMs }),
    ]);

    return NextResponse.json({ ok: true, itemId });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}