// FILE: src/app/api/products/quick-create/route.ts
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function lower(v: unknown) {
  return safe(v).toLowerCase();
}
function normUnit(v: unknown) {
  return lower(v || "pza") || "pza";
}

async function findNamedDoc(db: any, orgId: string, base: "suppliers" | "categories", id: string) {
  if (!id) return { name: "" };

  const paths = [
    `orgs/${orgId}/${base}/${id}`,
    `organizations/${orgId}/${base}/${id}`,
    `businesses/${orgId}/${base}/${id}`,
    `tenants/${orgId}/${base}/${id}`,
    `${base}/${id}`,
  ];

  for (const path of paths) {
    try {
      const snap = await db.doc(path).get();
      if (snap.exists) {
        const d = snap.data() as any;
        return { name: safe(d?.nameEs || d?.name || d?.displayName || d?.title || "") };
      }
    } catch {}
  }
  return { name: "" };
}

function productFromDoc(doc: any) {
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

function respondProduct(productId: string, product: any) {
  return NextResponse.json({ ok: true, id: productId, productId, product });
}

function matches(docProd: any, unitCapture: string, supplierId?: string) {
  if (normUnit(docProd?.unitCapture) !== unitCapture) return false;
  if (supplierId) return safe(docProd?.supplierId) === supplierId;
  return true;
}

async function findByName(col: any, nameLowerValue: string, unitCapture: string, supplierId?: string) {
  const s1 = await col.where("nameLowerEs", "==", nameLowerValue).limit(25).get();
  if (!s1.empty) {
    for (const d of s1.docs) {
      const prod = productFromDoc(d);
      if (matches(prod, unitCapture, supplierId)) return { doc: d, prod };
    }
  }
  const s2 = await col.where("nameLower", "==", nameLowerValue).limit(25).get();
  if (!s2.empty) {
    for (const d of s2.docs) {
      const prod = productFromDoc(d);
      if (matches(prod, unitCapture, supplierId)) return { doc: d, prod };
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const body = (await req.json().catch(() => ({}))) as any;

    const nameEs = safe(body?.nameEs);
    const unitCapture = normUnit(body?.unitCapture);
    const barcode = safe(body?.barcode);
    const supplierId = safe(body?.supplierId);
    const supplierNameIn = safe(body?.supplierName);
    const categoryId = safe(body?.categoryId);

    if (!nameEs) return NextResponse.json({ error: "nameEs requerido" }, { status: 400 });

    const db = adminDb();
    const { col } = await resolveProductsCollection(db, orgId);

    const nameLowerValue = lower(nameEs);

    // 1) barcode dedup
    if (barcode) {
      const dup = await col.where("barcode", "==", barcode).limit(1).get();
      if (!dup.empty) {
        const d = dup.docs[0];
        const prod = productFromDoc(d);

        // opcional: completar supplier/category si venían y estaban vacíos
        const updates: any = {};
        if (supplierId && !safe(prod.supplierId)) {
          updates.supplierId = supplierId;
          updates.supplierName = supplierNameIn || prod.supplierName || null;
          updates.supplierNameEs = supplierNameIn || prod.supplierName || null;
          updates.supplierIds = FieldValue.arrayUnion(supplierId);
          if (supplierNameIn) updates.supplierNames = FieldValue.arrayUnion(supplierNameIn);
        } else if (supplierId) {
          updates.supplierIds = FieldValue.arrayUnion(supplierId);
          if (supplierNameIn) updates.supplierNames = FieldValue.arrayUnion(supplierNameIn);
        }
        if (categoryId && !safe(prod.categoryId)) updates.categoryId = categoryId;

        if (Object.keys(updates).length) await d.ref.update({ ...updates, updatedAtMs: Date.now() });

        return respondProduct(d.id, prod);
      }
    }

    // 2) name+unit(+supplier) dedup
    const found = await findByName(col, nameLowerValue, unitCapture, supplierId || undefined);
    if (found) {
      // idem: completar supplier/category si faltan
      const updates: any = {};
      if (supplierId) {
        updates.supplierIds = FieldValue.arrayUnion(supplierId);
        if (supplierNameIn) updates.supplierNames = FieldValue.arrayUnion(supplierNameIn);
        if (!safe(found.prod.supplierId)) {
          updates.supplierId = supplierId;
          updates.supplierName = supplierNameIn || null;
          updates.supplierNameEs = supplierNameIn || null;
        }
      }
      if (categoryId && !safe(found.prod.categoryId)) updates.categoryId = categoryId;

      if (Object.keys(updates).length) await found.doc.ref.update({ ...updates, updatedAtMs: Date.now() });

      return respondProduct(found.doc.id, found.prod);
    }

    // 3) create new
    const supplier = await findNamedDoc(db, orgId, "suppliers", supplierId);
    const category = await findNamedDoc(db, orgId, "categories", categoryId);

    const now = Date.now();
    const ref = await col.add({
      orgId,
      active: true,
      source: "quick-create",
      nameEs,
      name: nameEs,
      nameLowerEs: nameLowerValue,
      nameLower: nameLowerValue,
      unitCapture,
      barcode: barcode || null,

      supplierId: supplierId || null,
      supplierName: supplier.name || supplierNameIn || null,
      supplierNameEs: supplier.name || supplierNameIn || null,
      supplierIds: supplierId ? [supplierId] : [],
      supplierNames: supplier.name || supplierNameIn ? [supplier.name || supplierNameIn] : [],

      categoryId: categoryId || null,
      categoryName: category.name || null,
      categoryNameEs: category.name || null,

      createdAtMs: now,
      updatedAtMs: now,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return respondProduct(ref.id, {
      id: ref.id,
      nameEs,
      name: nameEs,
      unitCapture,
      barcode: barcode || "",
      supplierId,
      supplierName: supplier.name || supplierNameIn,
      categoryId,
      categoryName: category.name,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}