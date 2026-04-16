// ============================================================================
// FILE: src/app/api/products/create/route.ts   (NUEVO si no existe)
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe3(v: unknown) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const { decoded, orgId } = await requireAuth(req);
    const role = safe3((decoded as any)?.role);
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));

    const id = safe3(body.id);
    const nameEs = safe3(body.nameEs);
    const unitCapture = safe3(body.unitCapture);
    const categoryId = safe3(body.categoryId);
    const categoryNameEs = safe3(body.categoryNameEs);
    const defaultOrderQty = safe3(body.defaultOrderQty);
    const barcode = safe3(body.barcode);

    const supplierA = body.supplierA || null;
    const supplierB = body.supplierB || null;
    const supplierC = body.supplierC || null;

    if (!id) throw new Error("id requerido");
    if (!nameEs) throw new Error("Nombre requerido");
    if (!unitCapture) throw new Error("Unidad requerida");
    if (!supplierA?.id) throw new Error("Proveedor A requerido");

    const supplierIds = [safe3(supplierA.id), safe3(supplierB?.id), safe3(supplierC?.id)].filter(Boolean).slice(0, 3);
    const supplierNames = [safe3(supplierA.name), safe3(supplierB?.name), safe3(supplierC?.name)].filter(Boolean).slice(0, 3);

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const db = adminDb();
    await db.doc(`orgs/${orgId}/products/${id}`).set(
      {
        id,
        nameEs,
        name: nameEs,
        unitCapture,
        categoryId: categoryId || null,
        categoryNameEs: categoryNameEs || "",
        categoryName: categoryNameEs || "",
        defaultOrderQty: defaultOrderQty || "1",
        barcode: barcode || "",
        supplierIds,
        supplierNames,
        createdAt: nowIso,
        createdAtMs: nowMs,
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
