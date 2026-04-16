import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function buildAddressText(s: any) {
  const line1 =
    safe(s?.addressLine1) ||
    safe(s?.address1) ||
    safe(s?.street) ||
    safe(s?.address) ||
    safe(s?.direccion) ||
    "";
  const line2 =
    safe(s?.addressLine2) ||
    safe(s?.address2) ||
    safe(s?.suite) ||
    safe(s?.colonia) ||
    "";
  const city = safe(s?.city) || safe(s?.ciudad) || "";
  const state = safe(s?.state) || safe(s?.estado) || "";
  const zip = safe(s?.zip) || safe(s?.postalCode) || safe(s?.cp) || "";

  const parts = [line1, line2, city, state, zip].filter(Boolean);
  return parts.join(", ");
}

function buildMapsUrl(s: any, addressText: string) {
  const explicit =
    safe(s?.googleMapsUrl) ||
    safe(s?.mapsUrl) ||
    safe(s?.mapsLink) ||
    safe(s?.gmapUrl) ||
    "";
  if (explicit) return explicit;

  const lat = safe(s?.lat) || safe(s?.latitude) || "";
  const lng = safe(s?.lng) || safe(s?.longitude) || "";
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
  }

  if (addressText) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText)}`;
  }

  return "";
}

export async function GET(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const url = new URL(req.url);
    const supplierId = safe(url.searchParams.get("id"));
    if (!supplierId) throw new Error("id requerido");

    const db = adminDb();
    const snap = await db.doc(`orgs/${orgId}/suppliers/${supplierId}`).get();
    if (!snap.exists) throw new Error("Proveedor no existe");

    const s = snap.data() as any;

    const addressText = buildAddressText(s);
    const mapsUrl = buildMapsUrl(s, addressText);
    const website =
      safe(s?.website) || safe(s?.url) || safe(s?.web) || safe(s?.pagina) || "";
    const phone =
      safe(s?.phone) || safe(s?.telefono) || safe(s?.tel) || safe(s?.phoneNumber) || "";

    return NextResponse.json({
      ok: true,
      supplier: {
        id: supplierId,
        name: safe(s?.name || s?.nameEs || s?.displayName || supplierId),
        addressText,
        mapsUrl,
        website,
        phone,
        notes: safe(s?.notes || ""),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}