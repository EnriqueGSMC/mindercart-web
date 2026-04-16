import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";
import { FieldPath } from "firebase-admin/firestore";

export const runtime = "nodejs";

type ProductRow = {
  id: string;
  nameEs?: string;
  name?: string;
  nameLowerEs?: string;
  nameLower?: string;
  unitCapture?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  categoryNameEs?: string;
  active?: boolean;
  [key: string]: unknown;
};

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function norm(v: unknown) {
  const s = safe(v).toLowerCase();
  try {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  } catch {
    return s.replace(/\s+/g, " ").trim();
  }
}

function mapDoc(d: FirebaseFirestore.QueryDocumentSnapshot): ProductRow {
  return { id: d.id, ...(d.data() as any) };
}

function productName(p: ProductRow) {
  return safe(p.nameEs || p.name);
}

function bestText(p: ProductRow) {
  return [
    p.id,
    p.nameLowerEs,
    p.nameLower,
    p.nameEs,
    p.name,
    p.categoryNameEs,
    p.categoryName,
  ]
    .map((x) => norm(x))
    .filter(Boolean)
    .join(" ");
}

function tokenStartsWith(text: string, q: string) {
  return norm(text)
    .split(" ")
    .some((part) => part.startsWith(q));
}

function scoreProduct(p: ProductRow, q: string) {
  const name = norm(productName(p));
  const text = bestText(p);
  const barcode = norm(p.barcode);

  if (barcode && barcode === q) return 1000;
  if (!name) return text.includes(q) ? 100 : -1;
  if (name === q) return 900;
  if (name.startsWith(q)) return 800;
  if (tokenStartsWith(name, q)) return 700;
  if (text.includes(q)) return 200;
  return -1;
}

function dedupeById(rows: ProductRow[]) {
  const out: ProductRow[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const id = safe(row.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }

  return out;
}

function toClientRow(p: ProductRow) {
  return {
    id: safe(p.id),
    name: safe(p.nameEs || p.name),
    nameEs: safe(p.nameEs || p.name),
    unitCapture: safe(p.unitCapture),
    barcode: safe(p.barcode),
    categoryId: safe(p.categoryId),
    categoryName: safe(p.categoryNameEs || p.categoryName),
  };
}

async function prefixQuery(
  col: FirebaseFirestore.CollectionReference,
  field: string,
  q: string,
  limit: number
): Promise<ProductRow[]> {
  try {
    const snap = await col
      .orderBy(field)
      .startAt(q)
      .endAt(q + "\uf8ff")
      .limit(limit)
      .get();

    return snap.docs.map(mapDoc);
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const url = new URL(req.url);

    const q = norm(url.searchParams.get("q"));
    const limitRaw = Number(url.searchParams.get("limit") || 25);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 50)) : 25;

    const db = adminDb();
    const { col, path } = await resolveProductsCollection(db, orgId);

    if (!q) {
      return NextResponse.json({
        ok: true,
        collectionPath: path,
        matched: 0,
        mode: "empty-query",
        items: [],
        rows: [],
        products: [],
        results: [],
      });
    }

    const barcodeRows =
      /^\d{6,}$/.test(q)
        ? await col
            .where("barcode", "==", q)
            .limit(Math.min(limit, 5))
            .get()
            .then((snap) => snap.docs.map(mapDoc))
            .catch(() => [])
        : [];

    const [nameLowerEsRows, nameLowerRows] = await Promise.all([
      prefixQuery(col as FirebaseFirestore.CollectionReference, "nameLowerEs", q, limit * 3),
      prefixQuery(col as FirebaseFirestore.CollectionReference, "nameLower", q, limit * 3),
    ]);

    let combined = dedupeById([...barcodeRows, ...nameLowerEsRows, ...nameLowerRows]).filter(
      (p) => p.active !== false && !!productName(p)
    );

    if (combined.length < limit) {
      const fallbackSnap = await col.orderBy(FieldPath.documentId()).limit(1500).get();
      const fallbackRows = fallbackSnap.docs
        .map(mapDoc)
        .filter((p) => p.active !== false)
        .filter((p) => scoreProduct(p, q) >= 0);

      combined = dedupeById([...combined, ...fallbackRows]);
    }

    const ranked = [...combined]
      .filter((p) => scoreProduct(p, q) >= 0)
      .sort((a, b) => {
        const sa = scoreProduct(a, q);
        const sb = scoreProduct(b, q);
        if (sb !== sa) return sb - sa;
        return productName(a).localeCompare(productName(b), "es", { sensitivity: "base" });
      })
      .slice(0, limit);

    const items = ranked.map(toClientRow);

    return NextResponse.json({
      ok: true,
      collectionPath: path,
      matched: items.length,
      mode: "name-prefix-ranked",
      items,
      rows: items,
      products: items,
      results: items,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}