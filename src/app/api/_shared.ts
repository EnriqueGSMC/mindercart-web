import { verifyIdTokenFromRequest } from "@/lib/firebase/admin";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

export async function requireAuth(req: Request) {
  const decoded = await verifyIdTokenFromRequest(req);
  const c = decoded as any;

  const orgId = safe(c.orgId) || safe(process.env.ORG_ID);
  const role = safe(c.role);

  // branchId: si no viene en claims, usamos fallback para seguir avanzando
  const branchId = safe(c.branchId) || safe(process.env.DEFAULT_BRANCH_ID) || "sucursal-a";

  if (!orgId) throw new Error("orgId requerido");
  return { decoded, orgId, branchId, role };
}