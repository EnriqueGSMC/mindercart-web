// FILE: src/app/api/needs/suppliers/route.ts
//
// Devuelve los proveedores permitidos para un artículo (need/product), para que el modal de NC
// muestre SOLO proveedor 1/2/3 si existen, y no toda la lista.

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

type SupplierOpt = { id: string; name: string; rank: number };

function normalizeSupplier(v: any): { id: string; name: string } | null {
  if (!v) return null;

  // string id
  if (typeof v === "string") {
    const id = safe(v);
    if (!id) return null;
    return { id, name: id };
  }

  const id = safe(v?.id || v?.supplierId || v?.uid || "");
  if (!id) return null;

  const name = safe(v?.nameEs || v?.name || v?.supplierNameEs || v?.supplierName || "");
  return { id, name: name || id };
}

function collectSuppliersFromDoc(d: any): SupplierOpt[] {
  const out: SupplierOpt[] = [];

  const add = (v: any, rank: number) => {
    const s = normalizeSupplier(v);
    if (!s) return;
    out.push({ id: s.id, name: s.name, rank });
  };

  // Preferimos supplierA/B/C (observado en needs y/o products)
  add(d?.supplierA, 1);
  add(d?.supplierB, 2);
  add(d?.supplierC, 3);

  // Fallbacks comunes
  if (!safe(d?.supplierA?.id) && safe(d?.supplierId)) {
    add({ id: d?.supplierId, name: d?.supplierName }, 1);
  }

  add(d?.supplier2, 2);
  add(d?.supplier3, 3);

  // uniq por id, preservando el menor rank
  const best = new Map<string, SupplierOpt>();
  for (const s of out) {
    const prev = best.get(s.id);
    if (!prev || s.rank < prev.rank) best.set(s.id, s);
  }

  return Array.from(best.values()).sort((a, b) => a.rank - b.rank);
}

async function hydrateSupplierNames(db: any, orgId: string, rows: SupplierOpt[]) {
  const final: SupplierOpt[] = [...rows];

  await Promise.all(
    final.map(async (s) => {
      if (safe(s.name) && safe(s.name) !== safe(s.id)) return;
      try {
        const snap = await db.doc(`orgs/${orgId}/suppliers/${s.id}`).get();
        if (!snap.exists) return;
        const d = snap.data() as any;
        const name = safe(d?.nameEs || d?.name || "");
        if (name) s.name = name;
      } catch {
        // best-effort
      }
    })
  );

  return final;
}

export async function GET(req: Request) {
  try {
    const { role, orgId, branchId: claimBranchId } = await requireAuth(req);
    if (!canBuy(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branchId = safe(url.searchParams.get("branch")) || safe(claimBranchId) || "sucursal-a";
    const needId = safe(url.searchParams.get("needId"));
    if (!needId) throw new Error("needId requerido");

    const db = adminDb();

    const needSnap = await db.doc(`branches/${branchId}/needs/${needId}`).get();
    if (!needSnap.exists) {
      return NextResponse.json({ ok: true, branchId, needId, suppliers: [] });
    }

    const need = needSnap.data() as any;
    let suppliers = collectSuppliersFromDoc(need);

    // Extra (best-effort): si el need no trae B/C, intentar leer el producto.
    const productId = safe(need?.productId || "");
    if (productId && suppliers.length <= 1) {
      const tries = [
        `orgs/${orgId}/products/${productId}`,
        `orgs/${orgId}/items/${productId}`,
        `products/${productId}`,
      ];

      for (const path of tries) {
        try {
          const pSnap = await db.doc(path).get();
          if (!pSnap.exists) continue;
          const p = pSnap.data() as any;
          const extra = collectSuppliersFromDoc(p);
          const merged = [...suppliers, ...extra];

          // re-uniq
          const best = new Map<string, SupplierOpt>();
          for (const s of merged) {
            const prev = best.get(s.id);
            if (!prev || s.rank < prev.rank) best.set(s.id, s);
          }
          suppliers = Array.from(best.values()).sort((a, b) => a.rank - b.rank);
          break;
        } catch {
          // try next
        }
      }
    }

    suppliers = await hydrateSupplierNames(db, orgId, suppliers);

    return NextResponse.json({
      ok: true,
      branchId,
      needId,
      productId,
      suppliers: suppliers.map((s) => ({ id: s.id, name: s.name })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
