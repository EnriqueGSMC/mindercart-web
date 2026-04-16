// ============================================================================
// FILE: src/app/api/suppliers/options/route.ts
// REEMPLAZA COMPLETO
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function mapRows(docs: any[]) {
  return docs
    .map((d: any) => {
      const x = d.data() as any;
      return {
        id: d.id,
        name: safe(x?.nameEs || x?.name || x?.displayName || x?.title || ""),
      };
    })
    .filter((x: any) => !!x.id && !!x.name);
}

async function readCollectionPaths(db: any, paths: string[]) {
  for (const path of paths) {
    try {
      const snap = await db.collection(path).limit(300).get();
      if (!snap.empty) return mapRows(snap.docs);
    } catch {}
  }
  return [];
}

export async function GET(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const db = adminDb();

    let rows = await readCollectionPaths(db, [
      `orgs/${orgId}/suppliers`,
      `organizations/${orgId}/suppliers`,
      `businesses/${orgId}/suppliers`,
      `tenants/${orgId}/suppliers`,
    ]);

    if (!rows.length) {
      try {
        const snap = await db.collection("suppliers").where("orgId", "==", orgId).limit(300).get();
        rows = mapRows(snap.docs);
      } catch {}
    }

    rows.sort((a: any, b: any) => a.name.localeCompare(b.name, "es"));
    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}