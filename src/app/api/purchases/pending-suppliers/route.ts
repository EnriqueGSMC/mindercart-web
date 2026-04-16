// ============================================================================
// FILE: src/app/api/purchases/pending-suppliers/route.ts   (REEMPLAZA COMPLETO)
// - Antes: leía SOLO orders (por eso no aparecían nuevas necesidades)
// - Ahora: combina:
//   A) Needs OPEN agrupadas por proveedor A (lo que falta por generar pedido)
//   B) Orders DRAFT/BUYING (pedidos en proceso) + pendingCount dentro del pedido
// - Devuelve rows con:
//   supplierId, supplierName, openNeedsCount, orderPendingCount, pendingCount, orderId?, orderNo?, orderStatus?
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

type Row = {
  supplierId: string;
  supplierName: string;
  openNeedsCount: number;
  orderPendingCount: number;
  pendingCount: number;
  orderId: string | null;
  orderNo: string | null;
  orderStatus: string | null;
  updatedAtMs: number;
};

export async function GET(req: Request) {
  try {
    const { decoded, branchId } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branch = safe(url.searchParams.get("branch")) || safe(branchId) || "sucursal-a";
    if (!branch) throw new Error("branch requerido");

    const db = adminDb();

    // 1) NEEDS abiertas (OPEN) agrupadas por proveedor A
    const needsSnap = await db.collection(`branches/${branch}/needs`).orderBy("createdAtMs", "desc").limit(2500).get();

    const bySupplier = new Map<string, Row>();

    for (const d of needsSnap.docs) {
      const n = d.data() as any;
      if (safe(n.status) !== "OPEN") continue;

      const supplierId = safe(n?.supplierA?.id);
      if (!supplierId) continue;

      const supplierName = safe(n?.supplierA?.name) || supplierId || "Proveedor";
      const cur =
        bySupplier.get(supplierId) ||
        ({
          supplierId,
          supplierName,
          openNeedsCount: 0,
          orderPendingCount: 0,
          pendingCount: 0,
          orderId: null,
          orderNo: null,
          orderStatus: null,
          updatedAtMs: 0,
        } as Row);

      cur.openNeedsCount += 1;
      cur.pendingCount = cur.openNeedsCount + cur.orderPendingCount;
      bySupplier.set(supplierId, cur);
    }

    // 2) Pedidos en proceso (DRAFT/BUYING) para abrir/whatsapp/pdf
    const ordersSnap = await db.collection(`branches/${branch}/orders`).orderBy("updatedAtMs", "desc").limit(250).get();

    for (const d of ordersSnap.docs) {
      const o = d.data() as any;
      const status = safe(o.status);
      if (!["DRAFT", "BUYING"].includes(status)) continue;

      const supplierId = safe(o?.supplier?.id);
      if (!supplierId) continue;

      const supplierName = safe(o?.supplier?.name) || supplierId || "Proveedor";
      const items = Array.isArray(o.items) ? o.items : [];
      const orderPendingCount = items.filter((it: any) => safe(it?.purchaseState || "PENDING") === "PENDING").length;

      const updatedAtMs = Number(o.updatedAtMs || o.createdAtMs || 0) || 0;
      const orderNo = safe(o.orderNo) || null;

      const cur =
        bySupplier.get(supplierId) ||
        ({
          supplierId,
          supplierName,
          openNeedsCount: 0,
          orderPendingCount: 0,
          pendingCount: 0,
          orderId: null,
          orderNo: null,
          orderStatus: null,
          updatedAtMs: 0,
        } as Row);

      // Si ya había un pedido asociado, conserva el más reciente
      if (!cur.orderId || updatedAtMs > cur.updatedAtMs) {
        cur.orderId = d.id;
        cur.orderNo = orderNo;
        cur.orderStatus = status;
        cur.updatedAtMs = updatedAtMs;
      }

      // Suma pending del pedido (para ordenar y ver “en tienda”)
      cur.orderPendingCount += orderPendingCount;
      cur.pendingCount = cur.openNeedsCount + cur.orderPendingCount;

      // Preferimos el nombre del pedido si el de needs está vacío
      if (!safe(cur.supplierName)) cur.supplierName = supplierName;

      bySupplier.set(supplierId, cur);
    }

    const rows = Array.from(bySupplier.values()).sort((a, b) => b.pendingCount - a.pendingCount);

    return NextResponse.json({ ok: true, branch, rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}