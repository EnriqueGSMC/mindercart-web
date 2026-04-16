// FILE: src/lib/receivingRepo.ts
import { admin, firestoreAdmin } from "./firebaseAdmin";
import type { PurchaseOrder, ReceiptType } from "./types";

const ORDERS_COLLECTION =
  process.env.RECEIVING_ORDERS_COLLECTION ?? "branches/sucursal-a/orders";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matchesQ(o: PurchaseOrder, q: string): boolean {
  const nq = normalize(q);
  const hay = [o.supplierName ?? "", o.orderNumber ?? "", o.id ?? ""]
    .map(normalize)
    .join(" | ");
  return hay.includes(nq);
}

function toMillis(v: unknown): number {
  if (!v) return 0;

  // Firestore Timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyV = v as any;
  if (typeof anyV?.toDate === "function") {
    const t = anyV.toDate()?.getTime?.();
    return Number.isFinite(t) ? t : 0;
  }

  if (typeof v === "number" && Number.isFinite(v)) return v;

  if (typeof v === "string") {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  if (v instanceof Date) return v.getTime();

  return 0;
}

function closedTime(o: any): number {
  return (
    toMillis(o.closedAtMs) ||
    toMillis(o.closedAt) ||
    toMillis(o.updatedAtMs) ||
    toMillis(o.updatedAt) ||
    0
  );
}

function receivedTime(o: any): number {
  return (
    toMillis(o.receivedAtMs) ||
    toMillis(o.receivedAt) ||
    toMillis(o.updatedAtMs) ||
    toMillis(o.updatedAt) ||
    0
  );
}

export async function listDeliveryClosed(params: { q?: string | null } = {}): Promise<PurchaseOrder[]> {
  const snap = await firestoreAdmin
    .collection(ORDERS_COLLECTION)
    .where("status", "==", "CLOSED")
    .limit(300)
    .get();

  const items = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) })) as PurchaseOrder[];

  const sorted = [...items].sort((a: any, b: any) => closedTime(b) - closedTime(a));

  const q = params.q?.trim();
  return q ? sorted.filter((o) => matchesQ(o, q)) : sorted;
}

export async function listHistory(params: { q?: string | null } = {}): Promise<PurchaseOrder[]> {
  const snap = await firestoreAdmin
    .collection(ORDERS_COLLECTION)
    .where("status", "==", "RECEIVED")
    .limit(300)
    .get();

  const items = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) })) as PurchaseOrder[];

  const sorted = [...items].sort((a: any, b: any) => receivedTime(b) - receivedTime(a));

  const q = params.q?.trim();
  return q ? sorted.filter((o) => matchesQ(o, q)) : sorted;
}

export async function receiveOrder(params: {
  orderId: string;
  deliveredByName: string;
  receivedByUserId: string;
  receivedByName: string;
  receivedItemIds: string[];
}): Promise<{ ok: true; receiptType: ReceiptType }> {
  const { orderId, deliveredByName, receivedByUserId, receivedByName, receivedItemIds } = params;

  if (!orderId) throw new Error("orderId requerido");
  if (!deliveredByName?.trim()) throw new Error("Quién entrega es requerido");
  if (!receivedByUserId) throw new Error("receivedByUserId requerido");

  const orderRef = firestoreAdmin.collection(ORDERS_COLLECTION).doc(orderId);

  let computedReceiptType: ReceiptType = "FULL";

  await firestoreAdmin.runTransaction(async (tx) => {
    const doc = await tx.get(orderRef);
    if (!doc.exists) throw new Error("La orden no existe");

    const order = { id: doc.id, ...(doc.data() as any) } as any;
    if (order.status !== "CLOSED") throw new Error("La orden no está en estado CLOSED");

    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) throw new Error("Orden sin artículos");

    const receivedSet = new Set(receivedItemIds ?? []);
    const updatedItems = items.map((it: any) => ({ ...it, received: receivedSet.has(it.id) }));

    const receivedCount = updatedItems.filter((i: any) => i.received).length;
    computedReceiptType = receivedCount === updatedItems.length ? "FULL" : "PARTIAL";

    const nowMs = Date.now();
    const nowTs = admin.firestore.FieldValue.serverTimestamp();

    tx.set(
      orderRef,
      {
        status: "RECEIVED",
        receivedAt: nowTs,
        receivedAtMs: nowMs,
        receiptType: computedReceiptType,
        deliveredByName: deliveredByName.trim(),
        receivedByUserId,
        receivedByName,
        updatedAt: nowTs,
        updatedAtMs: nowMs,
        items: updatedItems,
      },
      { merge: true }
    );
  });

  return { ok: true, receiptType: computedReceiptType };
}

