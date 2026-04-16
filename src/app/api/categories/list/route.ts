// ============================================================================
// FILE: src/app/api/categories/list/route.ts   (NUEVO si no existe)
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
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const q = safe2(url.searchParams.get("q")).toLowerCase();

    const db = adminDb();
    const snap = await db.collection(`orgs/${orgId}/categories`).limit(200).get();

    let rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    if (q) {
      rows = rows.filter((c: any) => {
        const a = safe2(c.nameEs || c.name || "").toLowerCase();
        const b = safe2(c.nameEn || "").toLowerCase();
        return a.includes(q) || b.includes(q) || safe2(c.id).toLowerCase().includes(q);
      });
    }
    rows.sort((a: any, b: any) => safe2(a.nameEs || a.name || a.id).localeCompare(safe2(b.nameEs || b.name || b.id)));
    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
