// ============================================================================
// FILE: src/app/api/products/by-barcode/route.ts
// ============================================================================
import { NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeBarcode(v: unknown) {
  return safe(v).replace(/\s+/g, "");
}

function mapProduct(doc: any) {
  const p = doc.data() as any;
  return {
    id: doc.id,
    nameEs: safe(p?.nameEs || p?.name || ""),
    name: safe(p?.name || p?.nameEs || ""),
    unitCapture: safe(p?.unitCapture || ""),
    barcode: safe(p?.barcode || ""),
    supplierId: safe(p?.supplierId || ""),
    supplierName: safe(p?.supplierName || p?.supplierNameEs || ""),
    categoryId: safe(p?.categoryId || ""),
    categoryName: safe(p?.categoryName || p?.categoryNameEs || ""),
  };
}

export async function GET(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const url = new URL(req.url);
    const code = normalizeBarcode(url.searchParams.get("code"));
    if (!code) return NextResponse.json({ error: "code requerido" }, { status: 400 });

    const db = adminDb();
    const { col } = await resolveProductsCollection(db, orgId);

    const tryFields = ["barcode", "ean", "code"];
    for (const field of tryFields) {
      const snap = await col.where(field, "==", code).limit(1).get();
      if (!snap.empty) return NextResponse.json({ product: mapProduct(snap.docs[0]) });
    }

    const fallback = await col.orderBy(FieldPath.documentId()).limit(1000).get();
    for (const doc of fallback.docs) {
      const p = doc.data() as any;
      const vals = [p?.barcode, p?.ean, p?.code].map(normalizeBarcode).filter(Boolean);
      if (vals.includes(code)) return NextResponse.json({ product: mapProduct(doc) });
    }

    return NextResponse.json({ product: null });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}