import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

type SupplierRef = { id: string; name: string };

function asArr(v: any): any[] {
  return Array.isArray(v) ? v : [];
}

function pickFirstNonEmptyArray(p: any, keys: string[]): any[] {
  for (const k of keys) {
    const v = p?.[k];
    if (Array.isArray(v) && v.length) return v;
  }
  return [];
}

async function fillSupplierNames(
  db: FirebaseFirestore.Firestore,
  orgId: string,
  suppliers: SupplierRef[]
): Promise<SupplierRef[]> {
  const out: SupplierRef[] = [];
  for (const s of suppliers) {
    if (!s.id) continue;
    if (s.name) {
      out.push(s);
      continue;
    }
    try {
      const snap = await db.doc(`orgs/${orgId}/suppliers/${s.id}`).get();
      const d: any = snap.exists ? snap.data() : null;
      out.push({ id: s.id, name: safe(d?.name || d?.nameEs || d?.displayName || s.id) });
    } catch {
      out.push({ id: s.id, name: s.id });
    }
  }
  return out;
}

async function extractSuppliers(
  db: FirebaseFirestore.Firestore,
  orgId: string,
  p: any
): Promise<SupplierRef[]> {
  // 1) Caso normal: supplierIds + supplierNames (tu JSON normalizado lo trae así)
  const ids = pickFirstNonEmptyArray(p, ["supplierIds", "suppliersIds", "providerIds", "proveedorIds", "proveedoresIds"]).map(safe);
  const names = pickFirstNonEmptyArray(p, ["supplierNames", "suppliersNames", "providerNames", "proveedorNames", "proveedoresNames"]).map(safe);
  let suppliers: SupplierRef[] =
    ids.length ? ids.slice(0, 3).map((id, i) => ({ id, name: safe(names[i] || "") })).filter((x) => x.id) : [];

  // 2) supplierOptions / providers / proveedores (array de objetos con prioridad)
  if (!suppliers.length) {
    const opts =
      asArr(p?.supplierOptions).length ? asArr(p?.supplierOptions) :
      asArr(p?.suppliers).length ? asArr(p?.suppliers) :
      asArr(p?.proveedores);

    if (opts.length) {
      suppliers = opts
        .slice()
        .sort((a: any, b: any) => Number(a?.priority ?? a?.prioridad ?? 999) - Number(b?.priority ?? b?.prioridad ?? 999))
        .slice(0, 3)
        .map((o: any) => ({
          id: safe(o?.supplierId || o?.id || o?.providerId || o?.proveedorId),
          name: safe(o?.supplierName || o?.name || o?.providerName || o?.proveedorName),
        }))
        .filter((x: SupplierRef) => x.id);
    }
  }

  // 3) fallback: campos sueltos
  if (!suppliers.length) {
    const a = safe(p?.supplierId || p?.proveedorId || p?.providerId);
    if (a) suppliers = [{ id: a, name: safe(p?.supplierName || p?.proveedorName || p?.providerName) }];
  }

  // 4) completar nombres desde orgs/{orgId}/suppliers
  suppliers = await fillSupplierNames(db, orgId, suppliers);

  return suppliers;
}

export async function POST(req: Request) {
  try {
    const { decoded, orgId, branchId } = await requireAuth(req);

    const body = await req.json().catch(() => ({} as any));
    const productId = safe(body.productId);
    const needQty = safe(body.needQty);
    const note = safe(body.note);

    if (!productId) throw new Error("productId requerido");
    if (!needQty) throw new Error("needQty requerido");
    if (!branchId) throw new Error("branchId requerido");

    const db = adminDb();
    const { col } = await resolveProductsCollection(db, orgId);
    const pSnap = await col.doc(productId).get();
    if (!pSnap.exists) throw new Error("Producto no existe");

    const p = pSnap.data() as any;
    const suppliers = await extractSuppliers(db, orgId, p);

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();
    const c = decoded as any;

    const unitCapture = safe(p?.unitCapture || p?.defaultUnitCapture || "");
    const productName = safe(p?.nameEs || p?.name || productId);
    const categoryName = safe(p?.categoryNameEs || p?.categoryName || "");

    const doc = {
      orgId,
      branchId,
      status: "OPEN",
      createdAt: nowIso,
      createdAtMs: nowMs,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
      createdBy: { uid: safe(c.uid), role: safe(c.role) },

      productId,
      productName,
      categoryName,
      unitCapture,
      needQty,
      note,

      supplierA: suppliers[0] ? { id: suppliers[0].id, name: suppliers[0].name } : null,
      supplierB: suppliers[1] ? { id: suppliers[1].id, name: suppliers[1].name } : null,
      supplierC: suppliers[2] ? { id: suppliers[2].id, name: suppliers[2].name } : null,
    };

    const ref = await db.collection(`branches/${branchId}/needs`).add(doc);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}