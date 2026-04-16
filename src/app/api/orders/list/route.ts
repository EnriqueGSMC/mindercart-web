// FILE: src/app/api/orders/list/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function canBuy(role: string) {
  return role === "ADMIN" || role === "BUYER" || role === "PURCHASER";
}

function canReceive(role: string) {
  return role === "ADMIN" || role === "BUYER" || role === "PURCHASER" || role === "BASIC";
}

function getBucket(bucketRaw: string) {
  const b = safe(bucketRaw).toLowerCase();
  if (b === "pending") return "pending";
  if (b === "authorized") return "authorized";
  if (b === "buying") return "buying";
  if (b === "delivery") return "delivery";
  if (b === "history") return "history";
  return "authorized";
}

function statusForBucket(bucket: string): string[] {
  if (bucket === "pending") return ["DRAFT"];
  if (bucket === "authorized") return ["CREATED", "BUYING"];
  if (bucket === "buying") return ["BUYING"];
  if (bucket === "delivery") return ["CLOSED", "DELIVERY"];
  if (bucket === "history") return ["RECEIVED"];
  return ["CREATED", "BUYING"];
}

function computeCounts(items: any[]) {
  const rows = Array.isArray(items) ? items : [];
  let pending = 0;
  let bought = 0;
  let notBought = 0;
  let receivedBought = 0;

  for (const it of rows) {
    const s = safe(it?.state || it?.purchaseState).toUpperCase();
    if (s === "BOUGHT") {
      bought++;
      if (Boolean(it?.received)) receivedBought++;
    } else if (s === "NOT_BOUGHT") {
      notBought++;
    } else {
      pending++;
    }
  }

  const total = rows.length;
  return { total, pending, bought, notBought, receivedBought };
}

export async function GET(req: Request) {
  try {
    const { role, branchId } = await requireAuth(req);

    const url = new URL(req.url);
    const bucket = getBucket(url.searchParams.get("bucket") || "");
    const branch = safe(url.searchParams.get("branch")) || branchId;

    if (bucket === "delivery" || bucket === "history") {
      if (!canReceive(role)) throw new Error("Sin permiso");
    } else {
      if (!canBuy(role)) throw new Error("Sin permiso");
    }

    const statuses = statusForBucket(bucket);
    const db = adminDb();
    const colPath = `branches/${branch}/orders`;

    const orderField = bucket === "history" ? "receivedAtMs" : "updatedAtMs";
    const snap = await db.collection(colPath).orderBy(orderField, "desc").limit(300).get();

    const orders: any[] = [];

    snap.forEach((doc) => {
      const d = doc.data() as any;

      const status = safe(d.status);
      if (!status || !statuses.includes(status) || status === "MERGED") return;

      const counts = computeCounts(d.items || []);
      if (!counts.total) return;

      let itemCount = counts.total;
      if (bucket === "authorized" || bucket === "buying") {
        itemCount = counts.pending;
        if (itemCount <= 0) return;
      }

      orders.push({
        id: doc.id,
        orderId: doc.id,
        status,
        orderNo: safe(d.orderNo),
        supplier: d.supplier || null,
        supplierId: safe(d.supplier?.id || d.supplierId),
        supplierName: safe(d.supplier?.name || d.supplierName),
        itemCount,
        counts,
        deliveredBy: d.deliveredBy || null,
        receivedBy: d.receivedBy || null,
        deliveredByUserId: safe(d.deliveredBy?.id || d.deliveredByUserId || ""),
        receivedByUserId: safe(d.receivedBy?.id || d.receivedByUserId || ""),
        deliveredByName: safe(d.deliveredBy?.name || d.deliveredByName || ""),
        receivedByName: safe(d.receivedBy?.name || d.receivedByName || ""),


        receiptType: safe(d.receiptType || ""),
        receivedAtMs: Number(d.receivedAtMs || 0) || 0,

        closedAtMs: Number(d.closedAtMs || 0) || 0,
        createdAtMs: Number(d.createdAtMs || 0) || 0,
        updatedAtMs: Number(d.updatedAtMs || 0) || 0,
      });
    });

    return NextResponse.json({ ok: true, orders });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}