// FILE: src/lib/needs/requeueNotBought.ts

export type PurchaseState = "PENDING" | "BOUGHT" | "NOT_BOUGHT";

export type OrderItemLike = {
  itemId?: string;
  id?: string;
  productId?: string;
  productName?: string;
  needQty?: string | number;
  unitCapture?: string;
  note?: string;
  purchaseState?: PurchaseState | string;
  state?: PurchaseState | string;
  notBoughtReasonText?: string;
  notBoughtReason?: { text?: string };
};

export type OrderLike = {
  id?: string;
  orderId?: string;
  orderNo?: string;
  supplierId?: string;
  supplierName?: string;
  items?: OrderItemLike[];
};

export type RequeuedNeed = {
  // Campos “normales” (deben empatar con tu schema actual de needs)
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  needQty: string;
  unitCapture: string;
  note: string;

  // Metadata para BASIC (no rompe nada si es extra)
  lastPurchaseState: "NOT_BOUGHT";
  lastNotBoughtReasonText: string;
  lastPurchaseOrderId: string;
  lastPurchaseOrderNo: string;
  lastPurchaseAtMs: number;

  // Para idempotencia / trazabilidad
  requeuedFromOrderId: string;
  requeuedKey: string;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function num(v: unknown) {
  const x = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(x) ? x : 0;
}

function pickPurchaseState(x: OrderItemLike): PurchaseState {
  const s = safe(x.purchaseState ?? x.state ?? "PENDING").toUpperCase();
  if (s === "BOUGHT") return "BOUGHT";
  if (s === "NOT_BOUGHT") return "NOT_BOUGHT";
  return "PENDING";
}

/**
 * Construye necesidades re-encoladas a partir de items NOT_BOUGHT.
 * - Consolida por (productId|productName + unitCapture) para no duplicar.
 * - Mantiene motivo(s) concatenados.
 * - Incluye metadata para que BASIC pueda mostrar pill N/C + motivo.
 */
export function buildRequeuedNeedsFromOrder(order: OrderLike, nowMs = Date.now()): RequeuedNeed[] {
  const orderId = safe(order.orderId ?? order.id);
  const orderNo = safe(order.orderNo);
  const supplierId = safe(order.supplierId);
  const supplierName = safe(order.supplierName || "Proveedor");

  const items = Array.isArray(order.items) ? order.items : [];
  const map = new Map<string, RequeuedNeed>();

  for (const it of items) {
    if (pickPurchaseState(it) !== "NOT_BOUGHT") continue;

    const productId = safe(it.productId);
    const productName = safe(it.productName);
    const unitCapture = safe(it.unitCapture || "");
    const note = safe(it.note || "");
    const reason = safe(it.notBoughtReasonText || it.notBoughtReason?.text || "");
    const qty = num(it.needQty);

    if (!supplierId || !orderId || (!productId && !productName) || qty <= 0) continue;

    const key = `${productId || productName}__${unitCapture || "-"}`;
    const prev = map.get(key);

    if (!prev) {
      map.set(key, {
        supplierId,
        supplierName,
        productId,
        productName,
        needQty: String(qty),
        unitCapture,
        note,

        lastPurchaseState: "NOT_BOUGHT",
        lastNotBoughtReasonText: reason,
        lastPurchaseOrderId: orderId,
        lastPurchaseOrderNo: orderNo,
        lastPurchaseAtMs: nowMs,

        requeuedFromOrderId: orderId,
        requeuedKey: key,
      });
    } else {
      map.set(key, {
        ...prev,
        needQty: String(num(prev.needQty) + qty),
        note: [safe(prev.note), note].filter(Boolean).join(" | "),
        lastNotBoughtReasonText: [safe(prev.lastNotBoughtReasonText), reason].filter(Boolean).join(" | "),
      });
    }
  }

  return Array.from(map.values());
}