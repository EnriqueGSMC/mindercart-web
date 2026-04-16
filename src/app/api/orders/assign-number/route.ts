// ============================================================================
// FILE: src/app/api/orders/assign-number/route.ts   (REEMPLAZA COMPLETO)
// - Asigna consecutivo SOLO cuando lo invocas (PDF / WhatsApp)
// - Formato: <BranchCode>-<YY>-<00001>   ej: A-26-00001
// - Reinicia por año (YY) y por sucursal
// - Lee branchCode desde Firestore (editable)
//   * Primero intenta: orgs/{orgId}/branches/{branchId}.branchCode
//   * Fallback: branches/{branchId}.branchCode
//   * Fallback final: derivado de branchId
// - Resuelve path de order automáticamente:
//   * orgs/{orgId}/branches/{branchId}/orders/{orderId}
//   * branches/{branchId}/orders/{orderId}
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function year2(d = new Date()) {
  return String(d.getFullYear()).slice(-2);
}

function pad5(n: number) {
  return String(n).padStart(5, "0");
}

function branchCodeFallback(branchId: string) {
  const b = safe(branchId).toLowerCase();
  const m = b.match(/(?:^|-)sucursal-([a-z])$/i) || b.match(/-([a-z])$/i);
  if (m?.[1]) return m[1].toUpperCase();
  return safe(branchId).slice(0, 1).toUpperCase() || "X";
}

export async function POST(req: Request) {
  try {
    const { decoded, orgId, branchId: authBranchId } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const orderId = safe(body.orderId);
    const branchId = safe(body.branchId) || safe(authBranchId);
    if (!orderId) throw new Error("orderId requerido");
    if (!branchId) throw new Error("branchId requerido");
    if (!orgId) throw new Error("orgId requerido");

    const db = adminDb();
    const yy = year2();

    // --- Candidatos de paths (org primero) ---
    const branchRefOrg = db.doc(`orgs/${orgId}/branches/${branchId}`);
    const branchRefRoot = db.doc(`branches/${branchId}`);

    const orderRefOrg = db.doc(`orgs/${orgId}/branches/${branchId}/orders/${orderId}`);
    const orderRefRoot = db.doc(`branches/${branchId}/orders/${orderId}`);

    const counterRefOrg = db.doc(`orgs/${orgId}/branches/${branchId}/counters/orders-${yy}`);
    const counterRefRoot = db.doc(`branches/${branchId}/counters/orders-${yy}`);

    const result = await db.runTransaction(async (tx) => {
      // 1) Resolver orderRef real
      const oOrg = await tx.get(orderRefOrg);
      const orderRef = oOrg.exists ? orderRefOrg : orderRefRoot;
      const oSnap = oOrg.exists ? oOrg : await tx.get(orderRefRoot);
      if (!oSnap.exists) throw new Error("Orden no existe");

      const order = oSnap.data() as any;
      const existing = safe(order?.orderNo);
      if (existing) return { orderNo: existing, already: true };

      // 2) Resolver branchCode (editable)
      let branchCode = "";
      const bOrg = await tx.get(branchRefOrg);
      if (bOrg.exists) branchCode = safe((bOrg.data() as any)?.branchCode);

      if (!branchCode) {
        const bRoot = await tx.get(branchRefRoot);
        if (bRoot.exists) branchCode = safe((bRoot.data() as any)?.branchCode);
      }

      if (!branchCode) branchCode = branchCodeFallback(branchId);
      branchCode = branchCode.toUpperCase().slice(0, 3); // seguro

      // 3) Resolver counterRef (misma “zona” que orders)
      const counterRef = orderRef.path.startsWith(`orgs/${orgId}/`) ? counterRefOrg : counterRefRoot;

      // 4) Incrementar consecutivo por año
      const cSnap = await tx.get(counterRef);
      const lastSeq = Number((cSnap.exists ? (cSnap.data() as any)?.lastSeq : 0) || 0);
      const nextSeq = lastSeq + 1;

      const orderNo = `${branchCode}-${yy}-${pad5(nextSeq)}`;
      const nowIso = new Date().toISOString();
      const nowMs = Date.now();

      tx.set(counterRef, { yy, lastSeq: nextSeq, updatedAt: nowIso, updatedAtMs: nowMs }, { merge: true });
      tx.set(
        orderRef,
        { orderNo, orderYY: yy, orderSeq: nextSeq, orderNumberAt: nowIso, updatedAt: nowIso, updatedAtMs: nowMs },
        { merge: true }
      );

      return { orderNo, already: false };
    });

    return NextResponse.json({ ok: true, ...result, orderId, branchId });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}