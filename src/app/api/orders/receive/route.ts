// FILE: src/app/api/orders/receive/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function roleFromAuth(a: any) {
  return safe(a?.role || a?.decoded?.role);
}
function uidFromAuth(a: any) {
  return safe(a?.decoded?.uid || a?.uid);
}
function emailFromAuth(a: any) {
  return safe(a?.decoded?.email || a?.email);
}
function canReceive(role: string) {
  return ["ADMIN", "BUYER", "BASIC", "PURCHASER"].includes(role);
}

function isBought(it: any) {
  const s = safe(it?.purchaseState || it?.state).toUpperCase();
  return s === "BOUGHT";
}

function itemIdOf(it: any): string {
  return safe(it?.itemId || it?.id || it?.productId);
}

async function userFromAuth(uid: string): Promise<{ id: string; name: string; email?: string }> {
  const u = await admin.auth().getUser(uid);
  const name = safe(u.displayName) || safe(u.email) || u.uid;
  return { id: u.uid, name, email: u.email || undefined };
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);

    const role = roleFromAuth(auth);
    const uid = uidFromAuth(auth);
    const email = emailFromAuth(auth);
    const claimBranchId = safe((auth as any)?.branchId);

    if (!canReceive(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const branchId = safe(body.branchId) || claimBranchId || "sucursal-a";
    const orderId = safe(body.orderId);

    const deliveredByUserId = safe(body.deliveredByUserId);
    const finalize = Boolean(body.finalize);
    const note = safe(body.note || "");

    const receivedItemIds: string[] = Array.isArray(body.receivedItemIds)
      ? body.receivedItemIds.map(safe).filter(Boolean)
      : [];

    if (!orderId) throw new Error("orderId requerido");
    if (!deliveredByUserId) throw new Error("Selecciona quién entrega.");

    const db = adminDb();
    const ref = db.doc(`branches/${branchId}/orders/${orderId}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Pedido no existe");

    const o = snap.data() as any;
    const curStatus = safe(o.status);

    if (curStatus !== "CLOSED" && curStatus !== "DELIVERY") {
      throw new Error(`La orden no está lista para recibir (status=${curStatus || "?"}).`);
    }

    const deliveredBy = await userFromAuth(deliveredByUserId);
    const receivedBy = await userFromAuth(uid);

    const items: any[] = Array.isArray(o.items) ? o.items : [];
    const receivedSet = new Set(receivedItemIds);

    const patched = items.map((it) => {
      if (!isBought(it)) return it;
      const id = itemIdOf(it);
      return { ...it, received: receivedSet.has(id) };
    });

    const bought = patched.filter(isBought);
    const allBoughtReceived = bought.length > 0 && bought.every((it) => Boolean(it.received));
    const receiptType = allBoughtReceived ? "FULL" : "PARTIAL";

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const update: any = {
      items: patched,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
      receiveNote: note || "",
      deliveredBy,
      deliveredByUserId: deliveredBy.id,
      deliveredByName: deliveredBy.name,
      receiveProgressAt: nowIso,
      receiveProgressAtMs: nowMs,
      receiveProgressBy: { uid, email, role },
    };

    if (!finalize && curStatus === "CLOSED") update.status = "DELIVERY";

    if (finalize) {
      update.status = "RECEIVED";
      update.receiptType = receiptType;
      update.receivedAt = nowIso;
      update.receivedAtMs = nowMs;
      update.receivedBy = { id: receivedBy.id, name: receivedBy.name, email: receivedBy.email, role };
      update.receivedByUserId = receivedBy.id;
      update.receivedByName = receivedBy.name;

      update.deliveredAt = nowIso;
      update.deliveredAtMs = nowMs;
    }

    await ref.update(update);

    return NextResponse.json({ ok: true, status: update.status ?? curStatus, receiptType });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}