import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const { branchId: claimBranchId } = await requireAuth(req);

    const url = new URL(req.url);
    const branchId = safe(url.searchParams.get("branch")) || claimBranchId || "sucursal-a";

    const db = adminDb();
    const snap = await db
      .collection(`branches/${branchId}/needs`)
      .orderBy("createdAtMs", "desc")
      .limit(300)
      .get();

    const rows = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter((n) => n.status === "OPEN"); // Basic solo ve OPEN

    return NextResponse.json({ ok: true, branchId, rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}