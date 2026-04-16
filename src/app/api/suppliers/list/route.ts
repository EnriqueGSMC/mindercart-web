// ============================================================================
// 4) PROVEEDORES VACÍO: endpoint robusto
// FILE: src/app/api/suppliers/list/route.ts  (REEMPLAZA COMPLETO)
// - Si q vacío => lista TODOS (limit 200)
// - Busca en orgs/{orgId}/suppliers  (tu debug mostró subcollection "suppliers")
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function fold(s: string) {
  return s.toLowerCase();
}

export async function GET(req: Request) {
  try {
    const { orgId, role } = await requireAuth(req);
    if (role !== "ADMIN") throw new Error("Sin permiso");

    const url = new URL(req.url);
    const q = fold(safe(url.searchParams.get("q")));

    const db = adminDb();
    const col = db.collection(`orgs/${orgId}/suppliers`);

    // 1) Trae un batch (pocos) y filtra en memoria para evitar índices/queries raros.
    const snap = await col.orderBy("updatedAtMs", "desc").limit(300).get();
    let rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    if (q) {
      rows = rows.filter((x) => fold(safe(x.nameEs || x.name)).includes(q));
    }

    // Limita para UI
    rows = rows.slice(0, 200);

    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
