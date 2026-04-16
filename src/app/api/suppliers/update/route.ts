import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function norm(s: string) {
  return safe(s).toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { orgId, decoded } = await requireAuth(req);
    const role = safe((decoded as any)?.role);
    if (!["ADMIN", "BUYER"].includes(role)) throw new Error("Sin permiso");

    const body = await req.json().catch(() => ({} as any));
    const id = safe(body.id);
    if (!id) throw new Error("id requerido");

    const patch: any = {
      addressLine1: safe(body.addressLine1),
      addressLine2: safe(body.addressLine2),
      city: safe(body.city),
      state: safe(body.state),
      zip: safe(body.zip),
      googleMapsUrl: safe(body.googleMapsUrl),
      website: safe(body.website),
      phone: safe(body.phone),
      notes: safe(body.notes),

      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };

    const db = adminDb();
    await db.doc(`orgs/${orgId}/suppliers/${id}`).set(
      {
        ...patch,
        nameLower: norm(body.name || body.nameEs || id),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}