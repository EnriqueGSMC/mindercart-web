import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function canBuy(role: string) {
  return ["ADMIN", "BUYER", "PURCHASER"].includes(role);
}

function parseQty(v: unknown) {
  const x = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(x) ? x : 0;
}

function dedupeConsecutive(lines: string[]) {
  const out: string[] = [];
  for (const raw of Array.isArray(lines) ? lines : []) {
    const ln = safe(raw);
    if (!ln) continue;
    if (out.length && out[out.length - 1] === ln) continue;
    out.push(ln);
  }
  return out;
}

function consolidatePending(items: any[]) {
  const map = new Map<string, { productName: string; needQty: number; unitCapture: string }>();

  for (const it of Array.isArray(items) ? items : []) {
    const state = safe(it?.purchaseState || it?.state || "PENDING").toUpperCase();
    if (state !== "PENDING") continue;

    const productName = safe(it?.productName);
    const unitCapture = safe(it?.unitCapture || "");
    const key = `${safe(it?.productId) || productName}__${unitCapture}`;

    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        productName,
        needQty: parseQty(it?.needQty),
        unitCapture,
      });
    } else {
      map.set(key, {
        ...prev,
        needQty: prev.needQty + parseQty(it?.needQty),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.productName.localeCompare(b.productName, "es"));
}

export async function GET(req: Request) {
  try {
    const { role, branchId } = await requireAuth(req);
    if (!canBuy(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const orderId = safe(url.searchParams.get("orderId"));
    const branch = safe(url.searchParams.get("branch")) || safe(branchId);

    if (!orderId) throw new Error("orderId requerido");

    const db = adminDb();
    const snap = await db.doc(`branches/${branch}/orders/${orderId}`).get();
    if (!snap.exists) throw new Error("Orden no encontrada");

    const d = snap.data() as any;
    const supplierName = safe(d?.supplier?.name || d?.supplierName || "Proveedor");
    const supplierAddressText = safe(d?.supplier?.addressText || d?.supplierAddressText || "");
    const pending = consolidatePending(d?.items || []);

    // WhatsApp format (as requested): supplier, address, items (one per line).
    const lines = dedupeConsecutive([
      supplierName,
      supplierAddressText,
      ...(pending.length
        ? pending.map((x) => `${x.productName} ${x.needQty} ${x.unitCapture}`.trim())
        : ["Sin artículos pendientes de compra"]),
    ]);

    return NextResponse.json({
      ok: true,
      text: lines.join("\n"),
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
