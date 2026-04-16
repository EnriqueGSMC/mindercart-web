import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";

export const runtime = "nodejs";

async function probe(db: FirebaseFirestore.Firestore, path: string) {
  try {
    const snap = await db.collection(path).limit(1).get();
    return { path, nonEmpty: !snap.empty, sampleId: snap.docs[0]?.id ?? null };
  } catch (e: any) {
    return { path, nonEmpty: false, sampleId: null, error: String(e?.message || e) };
  }
}

export async function GET(req: Request) {
  try {
    const { decoded, orgId, branchId, role } = await requireAuth(req);
    const db = adminDb();

    const candidates = [
      `orgs/${orgId}/products`,
      `orgs/${orgId}/articulos`,
      `orgs/${orgId}/items`,
      `orgs/${orgId}/catalog/products`,
      `orgs/${orgId}/catalogo/products`,
      `orgs/${orgId}/catalog/articulos`,
      `orgs/${orgId}/catalogo/articulos`,
      `orgs/${orgId}/catalogProducts`,
      `branches/${branchId}/products`,
      `branches/${branchId}/catalog/products`,
    ];

    const checks = await Promise.all(candidates.map((p) => probe(db, p)));
    const resolved = await resolveProductsCollection(db, orgId);

    let orgSubcollections: string[] = [];
    try {
      const cols = await db.doc(`orgs/${orgId}`).listCollections();
      orgSubcollections = cols.map((c) => c.id);
    } catch {
      orgSubcollections = [];
    }

    return NextResponse.json({
      ok: true,
      orgId,
      branchId,
      role,
      uid: (decoded as any)?.uid ?? null,
      resolvedProductsPath: resolved.path,
      candidates: checks,
      orgSubcollections,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}