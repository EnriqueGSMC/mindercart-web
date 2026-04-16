import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";
import { resolveProductsCollection } from "@/lib/firestore/products";
import { FieldPath } from "firebase-admin/firestore";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}
function norm(v: unknown) {
  return safe(v).toLowerCase();
}
function bestText(p: any) {
  return [
    p?.id,
    p?.nameLowerEs,
    p?.nameLower,
    p?.nameEs,
    p?.name,
    p?.categoryNameEs,
    p?.categoryName,
  ]
    .map((x) => norm(x))
    .filter(Boolean)
    .join(" ");
}

export async function GET(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const url = new URL(req.url);
    const q = norm(url.searchParams.get("q"));

    const db = adminDb();
    const { col, path } = await resolveProductsCollection(db, orgId);

    if (!q) {
      const snap = await col.orderBy(FieldPath.documentId()).limit(25).get();
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      return NextResponse.json({ ok: true, collectionPath: path, total: rows.length, matched: rows.length, rows });
    }

    const byIdSnap = await col
      .orderBy(FieldPath.documentId())
      .startAt(q)
      .endAt(q + "\uf8ff")
      .limit(25)
      .get();

    let rows = byIdSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    if (rows.length === 0) {
      const snap = await col.orderBy(FieldPath.documentId()).limit(1000).get();
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      rows = all.filter((p) => bestText(p).includes(q)).slice(0, 25);
      return NextResponse.json({
        ok: true,
        collectionPath: path,
        total: all.length,
        matched: rows.length,
        mode: "fallback-includes",
        rows,
      });
    }

    return NextResponse.json({
      ok: true,
      collectionPath: path,
      matched: rows.length,
      mode: "docId-prefix",
      rows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}