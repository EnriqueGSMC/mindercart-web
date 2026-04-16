import type { Firestore, CollectionReference, DocumentData } from "firebase-admin/firestore";

type Resolved = { path: string; col: CollectionReference<DocumentData> };

let cached: Record<string, Resolved> = {};

async function firstNonEmpty(db: Firestore, paths: string[]): Promise<Resolved | null> {
  for (const p of paths) {
    const snap = await db.collection(p).limit(1).get();
    if (!snap.empty) return { path: p, col: db.collection(p) };
  }
  return null;
}

export async function resolveProductsCollection(db: Firestore, orgId: string): Promise<Resolved> {
  if (cached[orgId]) return cached[orgId];

  const envPath = (process.env.FIRESTORE_PRODUCTS_PATH || "").trim();
  const candidates = [
    envPath ? envPath.replace("{orgId}", orgId) : "",
    `orgs/${orgId}/products`,
    `orgs/${orgId}/articulos`,
    `orgs/${orgId}/items`,
    `orgs/${orgId}/catalog/products`,
    `orgs/${orgId}/catalogo/products`,
    `orgs/${orgId}/catalog/articulos`,
    `orgs/${orgId}/catalogo/articulos`,
    `orgs/${orgId}/catalogProducts`,
  ].filter(Boolean);

  const found = await firstNonEmpty(db, candidates);

  // si todo está vacío, caemos al default (para reportar total 0 y no romper)
  const fallback = { path: `orgs/${orgId}/products`, col: db.collection(`orgs/${orgId}/products`) };

  cached[orgId] = found ?? fallback;
  return cached[orgId];
}