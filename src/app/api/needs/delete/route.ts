import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

async function findNeedRef(db: FirebaseFirestore.Firestore, orgId: string, branchId: string, needId: string) {
  const orgRef = db.doc(`orgs/${orgId}/branches/${branchId}/needs/${needId}`);
  const rootRef = db.doc(`branches/${branchId}/needs/${needId}`);

  const orgSnap = await orgRef.get().catch(() => null);
  if (orgSnap?.exists) return { ref: orgRef, snap: orgSnap };

  const rootSnap = await rootRef.get().catch(() => null);
  if (rootSnap?.exists) return { ref: rootRef, snap: rootSnap };

  return null;
}

export async function POST(req: Request) {
  try {
    const { decoded, orgId, branchId: claimBranchId } = await requireAuth(req);

    const body = await req.json().catch(() => ({} as any));
    const needId = safe(body.needId || body.id);
    const branchId = safe(body.branchId) || safe(claimBranchId) || "sucursal-a";

    if (!needId) throw new Error("needId requerido");

    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER", "BASIC"].includes(role)) throw new Error("Sin permiso");

    const db = adminDb();
    const found = await findNeedRef(db, orgId, branchId, needId);
    if (!found) throw new Error("Necesidad no existe");

    const data = found.snap.data() as any;
    const status = safe(data?.status);
    if (status && status !== "OPEN") throw new Error("Solo se puede borrar si está OPEN");

    // ✅ Regla final: BASIC puede borrar cualquier OPEN (incluye regresados por N/C)
    await found.ref.delete();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}