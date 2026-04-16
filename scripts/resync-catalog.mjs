/**
 * FILE: scripts/resync-catalog.mjs
 *
 * Re-sincroniza catálogo (categories, suppliers, products) hacia Firestore:
 *   orgs/{orgId}/categories/{id}
 *   orgs/{orgId}/suppliers/{id}
 *   orgs/{orgId}/products/{id}
 *
 * Uso:
 *   node scripts/resync-catalog.mjs --org org_el_cliente --catalog .\catalogo_normalizado_v1_1.json
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import admin from "firebase-admin";

function loadEnv() {
  const local = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(local)) dotenv.config({ path: local });
  dotenv.config();
}

function arg(name, def = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] || "") : def;
}

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env: ${name}`);
  return v;
}

function safe(v) {
  return String(v ?? "").trim();
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function initAdmin() {
  if (admin.apps.length) return;
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env("FIREBASE_PROJECT_ID"),
      clientEmail: env("FIREBASE_CLIENT_EMAIL"),
      privateKey: env("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

async function writeDocs(db, pairs, merge = true) {
  let wrote = 0;
  for (const part of chunk(pairs, 450)) {
    const batch = db.batch();
    for (const { ref, data } of part) batch.set(ref, data, { merge });
    await batch.commit();
    wrote += part.length;
  }
  return wrote;
}

async function main() {
  loadEnv();
  initAdmin();

  const orgId = safe(arg("org"));
  const catalogPath = safe(arg("catalog"));

  if (!orgId || !catalogPath) {
    throw new Error("Uso: node scripts/resync-catalog.mjs --org ORG --catalog PATH_JSON");
  }
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`No existe el archivo: ${catalogPath} (ponlo en el root o usa ruta completa)`);
  }

  const raw = fs.readFileSync(catalogPath, "utf-8");
  const catalog = JSON.parse(raw);

  const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
  const suppliers = Array.isArray(catalog?.suppliers) ? catalog.suppliers : [];
  const products = Array.isArray(catalog?.products) ? catalog.products : [];

  const db = admin.firestore();

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const catPairs = categories.map((c) => ({
    ref: db.doc(`orgs/${orgId}/categories/${safe(c.id)}`),
    data: {
      ...c,
      id: safe(c.id),
      name: safe(c.name || c.nameEs || ""),
      nameLower: safe(c.nameLower || safe(c.name || "").toLowerCase()),
      active: c.active !== false,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
  }));

  const supPairs = suppliers.map((s) => ({
    ref: db.doc(`orgs/${orgId}/suppliers/${safe(s.id)}`),
    data: {
      ...s,
      id: safe(s.id),
      name: safe(s.name || s.nameEs || ""),
      nameLower: safe(s.nameLower || safe(s.name || "").toLowerCase()),
      active: s.active !== false,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
  }));

  const prodPairs = products.map((p) => ({
    ref: db.doc(`orgs/${orgId}/products/${safe(p.id)}`),
    data: {
      ...p,
      id: safe(p.id),
      name: safe(p.name || p.nameEs || ""),
      nameLower: safe(p.nameLower || safe(p.name || "").toLowerCase()),
      categoryId: safe(p.categoryId || ""),
      categoryName: safe(p.categoryName || p.categoryNameEs || ""),
      defaultUnitCapture: safe(p.defaultUnitCapture || ""),
      defaultOrderQty: safe(p.defaultOrderQty || ""),
      supplierIds: Array.isArray(p.supplierIds) ? p.supplierIds.map(safe) : [],
      supplierNames: Array.isArray(p.supplierNames) ? p.supplierNames.map(safe) : [],
      supplierOptions: Array.isArray(p.supplierOptions) ? p.supplierOptions : [],
      active: p.active !== false,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
  }));

  const wroteCats = await writeDocs(db, catPairs, true);
  const wroteSups = await writeDocs(db, supPairs, true);
  const wroteProds = await writeDocs(db, prodPairs, true);

  console.log(`OK resync: categories=${wroteCats} suppliers=${wroteSups} products=${wroteProds}`);
}

main().catch((e) => {
  console.error("Resync error:", e?.message || e);
  process.exit(1);
});