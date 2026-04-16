// ============================================================================
// FILE: src/app/api/products/update-barcode/route.ts   (NUEVO si no existe)
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const { decoded, orgId } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const productId = safe(body.productId);
    const barcode = safe(body.barcode);

    if (!productId) throw new Error("productId requerido");

    const db = adminDb();
    await db.doc(`orgs/${orgId}/products/${productId}`).set({ barcode }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
