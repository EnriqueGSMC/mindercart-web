// ============================================================================
// FILE: src/app/api/orders/authorize/route.ts   (REEMPLAZA COMPLETO)
// - Autoriza un pedido pendiente
// - Si ya existe uno autorizado del mismo proveedor => MERGE (1 sola fila por proveedor)
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
    const orderId = safe(body.orderId);
    const branchId = safe(body.branchId) || safe(claimBranchId) || "sucursal-a";
    if (!orderId) throw new Error("orderId requerido");

    const db = adminDb();
    const ref = db.doc(`branches/${branchId}/orders/${orderId}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Pedido no existe");

    const o = snap.data() as any;
    const supplierId = safe(o?.supplier?.id);
    if (!supplierId) throw new Error("Proveedor inválido");

    const status = safe(o.status);
    if (!["DRAFT", "PENDING_AUTH"].includes(status)) {
      // idempotente
      return NextResponse.json({ ok: true, mode: "ALREADY", orderId });
    }

    // Buscar orden autorizada existente de ese proveedor (CREATED o BUYING)
    const list = await db.collection(`branches/${branchId}/orders`).orderBy("updatedAtMs", "desc").limit(400).get();
    const existing = list.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .find((x) => x.id !== orderId && ["CREATED", "BUYING"].includes(safe(x.status)) && safe(x?.supplier?.id) === supplierId);

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    if (!existing) {
      await ref.update({
        status: "CREATED",
        authorizedAt: nowIso,
        authorizedAtMs: nowMs,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      });
      return NextResponse.json({ ok: true, mode: "SINGLE", orderId });
    }

    // MERGE items al existente
    const eRef = db.doc(`branches/${branchId}/orders/${safe(existing.id)}`);
    const eSnap = await eRef.get();
    if (!eSnap.exists) throw new Error("Orden existente no encontrada");
    const e = eSnap.data() as any;

    const eItems = Array.isArray(e.items) ? e.items : [];
    const oItems = Array.isArray(o.items) ? o.items : [];

    await eRef.update({
      items: [...eItems, ...oItems],
      updatedAt: nowIso,
      updatedAtMs: nowMs,
      mergedFrom: [...(Array.isArray(e.mergedFrom) ? e.mergedFrom : []), orderId],
    });

    // Marcar el nuevo como MERGED (no se lista)
    await ref.update({
      status: "MERGED",
      mergedInto: safe(existing.id),
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    });

    return NextResponse.json({ ok: true, mode: "MERGED", mergedInto: safe(existing.id) });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
