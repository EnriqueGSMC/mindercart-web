import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function addressText(body: any) {
  const line1 = safe(body.addressLine1 || "");
  const city = safe(body.city || "");
  const state = safe(body.state || "");
  const zip = safe(body.zip || "");

  const parts = [line1, [city, state].filter(Boolean).join(", "), zip].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  try {
    const { decoded, orgId } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (role !== "ADMIN") throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const branchId = safe(body.branchId);
    if (!branchId) throw new Error("branchId requerido");

    const branchCode = safe(body.branchCode).toUpperCase().slice(0, 3);
    const name = safe(body.name);
    const line1 = safe(body.addressLine1);
    const city = safe(body.city);
    const state = safe(body.state);
    const zip = safe(body.zip);

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const db = adminDb();
    const ref = db.doc(`orgs/${orgId}/branches/${branchId}`);

    await ref.set(
      {
        name,
        branchCode,
        addressLine1: line1,
        city,
        state,
        zip,
        addressText: addressText(body),
        updatedAt: nowIso,
        updatedAtMs: nowMs,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}