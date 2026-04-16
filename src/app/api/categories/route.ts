// ============================================================================
// FILE: src/app/api/categories/options/route.ts
// ============================================================================
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

async function readCandidates(db: any, paths: string[]) {
  for (const path of paths) {
    const snap = await db.collection(path).limit(200).get();
    if (!snap.empty) {
      return snap.docs.map((d: any) => {
        const x = d.data() as any;
        return { id: d.id, name: safe(x?.nameEs || x?.name || "") };
      }).filter((x: any) => !!x.id && !!x.name);
    }
  }
  return [];
}

export async function GET(req: Request) {
  try {
    const { orgId } = await requireAuth(req);
    const db = adminDb();

    let rows = await readCandidates(db, [
      `organizations/${orgId}/categories`,
      `orgs/${orgId}/categories`,
      `businesses/${orgId}/categories`,
      `tenants/${orgId}/categories`,
    ]);

    if (rows.length === 0) {
      const snap = await db.collection("categories").where("orgId", "==", orgId).limit(200).get();
      rows = snap.docs.map((d: any) => {
        const x = d.data() as any;
        return { id: d.id, name: safe(x?.nameEs || x?.name || "") };
      }).filter((x: any) => !!x.id && !!x.name);
    }

    rows.sort((a: any, b: any) => a.name.localeCompare(b.name, "es"));
    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}