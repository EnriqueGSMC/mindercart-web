// FILE: src/app/api/users/list/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { requireAuth } from "@/app/api/_shared";

export const runtime = "nodejs";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

type UserRow = {
  id: string; // uid
  name: string;
  email?: string;
  role?: string;
};

function nameFromAuth(u: admin.auth.UserRecord): string {
  const dn = safe(u.displayName);
  if (dn) return dn;
  const em = safe(u.email);
  if (em) return em;
  return u.uid;
}

export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);

    const res = await admin.auth().listUsers(limit);

    const users: UserRow[] = res.users
      .map((u) => {
        const role = safe((u.customClaims as any)?.role);
        return {
          id: u.uid,
          name: nameFromAuth(u),
          email: safe(u.email) || undefined,
          role: role || undefined,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ ok: true, users });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}