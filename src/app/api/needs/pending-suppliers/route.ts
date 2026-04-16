// ============================================================================
// FILE: src/app/api/needs/pending-suppliers/route.ts
// ============================================================================
//
// Devuelve proveedores con necesidades OPEN pendientes.
// itemCount = número de renglones consolidados por proveedor (agrupa por producto+unidad).
// - Usa productId cuando existe.
// - Fallback: productName normalizado (sin acentos, minúsculas, espacios colapsados).
// - Si unitCapture está vacío, se consolida con la primera unidad conocida del mismo producto.
//
// Nota: NO cambia la lógica de creación de Needs; solo mejora el conteo/agrupación.
//
// ============================================================================

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeProductKey(productId: unknown, productName: unknown) {
  const pid = safe(productId);
  if (pid) return `id:${pid}`;

  const name = safe(productName)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return name ? `name:${name}` : "";
}

function normalizeUnitKey(unit: unknown) {
  return safe(unit)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

type Agg = {
  supplierId: string;
  supplierName: string;
  // baseKey -> set(unitKey), where "*" means unknown unit (consolidates with any)
  baseToUnits: Map<string, Set<string>>;
  rawCount: number;
};

function addConsolidatedKey(agg: Agg, baseKey: string, unitKey: string, fallbackUnique: string) {
  if (!baseKey) {
    // No identificable -> cuenta como renglón único
    const set = agg.baseToUnits.get(fallbackUnique) ?? new Set<string>();
    set.add("*");
    agg.baseToUnits.set(fallbackUnique, set);
    agg.rawCount += 1;
    return;
  }

  const set = agg.baseToUnits.get(baseKey) ?? new Set<string>();

  if (unitKey) {
    // Si antes fue desconocida, reemplazamos "*" por la unidad real (sin duplicar conteo)
    if (set.has("*")) set.delete("*");
    set.add(unitKey);
  } else {
    // unit vacía: si ya hay alguna unidad registrada, no agregamos otra variante
    if (set.size === 0) set.add("*");
  }

  agg.baseToUnits.set(baseKey, set);
  agg.rawCount += 1;
}

export async function GET(req: Request) {
  try {
    const { decoded, branchId: claimBranchId } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER", "PURCHASER"].includes(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branchId = safe(url.searchParams.get("branch")) || safe(claimBranchId) || "sucursal-a";

    const db = adminDb();
    const snap = await db
      .collection(`branches/${branchId}/needs`)
      .orderBy("createdAtMs", "desc")
      .limit(2500)
      .get();

    const bySupplier = new Map<string, Agg>();

    for (const d of snap.docs) {
      const n = d.data() as any;
      if (safe(n.status) !== "OPEN") continue;

      const sid = safe(n?.supplierA?.id || n?.supplierId);
      const sname = safe(n?.supplierA?.name || n?.supplierName) || sid || "Proveedor";
      if (!sid) continue;

      const agg =
        bySupplier.get(sid) ??
        ({
          supplierId: sid,
          supplierName: sname,
          baseToUnits: new Map<string, Set<string>>(),
          rawCount: 0,
        } satisfies Agg);

      // Mantén el nombre más reciente/no vacío
      if (!agg.supplierName || agg.supplierName === agg.supplierId) agg.supplierName = sname;

      const baseKey = normalizeProductKey(n?.productId, n?.productName);
      const unitKey = normalizeUnitKey(n?.unitCapture || "");
      const fallbackUnique = `row:${safe(d.id)}`;

      addConsolidatedKey(agg, baseKey, unitKey, fallbackUnique);
      bySupplier.set(sid, agg);
    }

    const rows = Array.from(bySupplier.values())
      .map((x) => {
        let itemCount = 0;
        for (const units of x.baseToUnits.values()) itemCount += units.size || 1;
        return {
          supplierId: x.supplierId,
          supplierName: x.supplierName,
          itemCount,
        };
      })
      .sort((a, b) => b.itemCount - a.itemCount);

    return NextResponse.json({ ok: true, branchId, rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
