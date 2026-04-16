// ============================================================================
// FILE: src/app/api/branches/set-code/route.ts   (NUEVO)
// - Admin actualiza branchCode (A/B/C)
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
    if (role !== "ADMIN") throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const branchId = safe3(body.branchId);
    const branchCode = safe3(body.branchCode).toUpperCase();

    if (!branchId) throw new Error("branchId requerido");
    if (!branchCode) throw new Error("branchCode requerido");

    const db = adminDb();
    const ref = db.doc(`orgs/${orgId}/branches/${branchId}`);

    await ref.set(
      {
        branchCode,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, branchId, branchCode });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}