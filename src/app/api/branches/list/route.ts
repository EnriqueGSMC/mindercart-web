// ============================================================================
// FILE: src/app/api/branches/list/route.ts   (NUEVO)
// - Lista sucursales del org (para editar branchCode desde Admin)
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe2(v: unknown) {
  return String(v ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const { decoded, orgId } = await requireAuth(req);
    const role = safe2((decoded as any)?.role);
    if (role !== "ADMIN") throw new Error("Sin permiso");

    const db = adminDb();

    // Preferido: branches dentro del org
    const col = db.collection(`orgs/${orgId}/branches`);
    const snap = await col.limit(200).get();

    const rows = snap.docs.map((d) => {
      const x = d.data() as any;
      return {
        id: d.id,
        name: safe2(x.name || d.id),
        branchCode: safe2(x.branchCode || ""),
      };
    });

    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}