// ============================================================================
// FILE: src/app/api/purchases/supplier/route.ts
// ============================================================================
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

export async function GET(req: Request) {
  try {
    const { role, branchId: claimBranchId } = await requireAuth(req);
    if (!canBuy(role)) throw new Error("No autorizado");

    const url = new URL(req.url);
    const supplierId = safe(url.searchParams.get("supplierId"));
    const branchId = safe(url.searchParams.get("branch")) || claimBranchId || "sucursal-a";
    if (!supplierId) throw new Error("supplierId requerido");

    const db = adminDb();

    const snap = await db.collection(`branches/${branchId}/needs`).orderBy("createdAtMs", "desc").limit(2500).get();
    const rows = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter((n) => safe(n.status) === "OPEN" && safe(n?.supplierA?.id || n?.supplierId) === supplierId);

    const supplierName = safe(rows[0]?.supplierA?.name || rows[0]?.supplierName || "");

    return NextResponse.json({
      ok: true,
      branchId,
      supplierId,
      supplierName,
      rows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}