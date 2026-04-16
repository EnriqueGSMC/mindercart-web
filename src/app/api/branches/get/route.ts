import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const { decoded, orgId, branchId: authBranchId } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const url = new URL(req.url);
    const branchId = safe(url.searchParams.get("branchId")) || safe(authBranchId);
    if (!branchId) throw new Error("branchId requerido");

    const db = adminDb();
    const ref = db.doc(`orgs/${orgId}/branches/${branchId}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: true, branch: { id: branchId } });

    return NextResponse.json({ ok: true, branch: { id: branchId, ...(snap.data() as any) } });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}