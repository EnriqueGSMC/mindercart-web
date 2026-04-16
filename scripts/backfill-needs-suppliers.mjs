/**
 * FILE: scripts/backfill-needs-suppliers.mjs
 *
 * Arregla necesidades OPEN que quedaron sin proveedor (supplierA vacío).
 * - Lee needs: branches/{branchId}/needs (OPEN, supplierA.id vacío)
 * - Lee producto: orgs/{orgId}/products/{productId}
 * - Extrae suppliers (IDs y nombres) con heurísticas
 * - Si faltan nombres, los busca en orgs/{orgId}/suppliers/{supplierId}
 * - Actualiza need con supplierA/B/C, unitCapture, productName, categoryName
 *
 * Uso:
 *   node scripts/backfill-needs-suppliers.mjs --org org_el_cliente --branch sucursal-a
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import admin from "firebase-admin";

function loadEnv() {
  // Carga .env.local si existe; luego .env
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

function asArr(v) {
  return Array.isArray(v) ? v : [];
}

function normArr(arr) {
  return asArr(arr).map(safe).filter(Boolean);
}

function pickFirstNonEmptyArray(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v) && v.length) return v;
  }
  return [];
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

async function supplierNameFromCatalog(db, orgId, supplierId) {
  try {
    const snap = await db.doc(`orgs/${orgId}/suppliers/${supplierId}`).get();
    if (!snap.exists) return supplierId;
    const d = snap.data() || {};
    return safe(d.name || d.nameEs || d.displayName || supplierId);
  } catch {
    return supplierId;
  }
}

async function fillSupplierNames(db, orgId, suppliers) {
  const out = [];
  for (const s of suppliers) {
    if (!s?.id) continue;
    if (s.name) out.push(s);
    else out.push({ id: s.id, name: await supplierNameFromCatalog(db, orgId, s.id) });
  }
  return out;
}

function extractSuppliersFromProduct(p) {
  // 1) supplierIds + supplierNames (lo normal)
  const ids = normArr(
    pickFirstNonEmptyArray(p, ["supplierIds", "suppliersIds", "providerIds", "proveedorIds", "proveedoresIds"])
  );
  const names = normArr(
    pickFirstNonEmptyArray(p, ["supplierNames", "suppliersNames", "providerNames", "proveedorNames", "proveedoresNames"])
  );

  if (ids.length) {
    return ids
      .slice(0, 3)
      .map((id, i) => ({ id, name: safe(names[i] || "") }))
      .filter((x) => x.id);
  }

  // 2) supplierOptions / suppliers / proveedores: array objetos con prioridad
  const opts = asArr(p?.supplierOptions).length
    ? asArr(p?.supplierOptions)
    : asArr(p?.suppliers).length
      ? asArr(p?.suppliers)
      : asArr(p?.proveedores);

  if (opts.length) {
    return opts
      .slice()
      .sort((a, b) => Number(a?.priority ?? a?.prioridad ?? 999) - Number(b?.priority ?? b?.prioridad ?? 999))
      .slice(0, 3)
      .map((o) => ({
        id: safe(o?.supplierId || o?.id || o?.providerId || o?.proveedorId),
        name: safe(o?.supplierName || o?.name || o?.providerName || o?.proveedorName),
      }))
      .filter((x) => x.id);
  }

  // 3) fallback: un supplierId suelto
  const sid = safe(p?.supplierId || p?.proveedorId || p?.providerId);
  if (sid) return [{ id: sid, name: safe(p?.supplierName || p?.proveedorName || p?.providerName) }];

  return [];
}

async function main() {
  loadEnv();
  initAdmin();

  const db = admin.firestore();
  const orgId = arg("org");
  const branchId = arg("branch");

  if (!orgId || !branchId) {
    throw new Error('Uso: node scripts/backfill-needs-suppliers.mjs --org ORG --branch BRANCH');
  }

  const needsCol = db.collection(`branches/${branchId}/needs`);
  const snap = await needsCol.orderBy("createdAtMs", "desc").limit(2000).get();

  const toFix = snap.docs
    .map((d) => ({ ref: d.ref, id: d.id, ...(d.data() || {}) }))
    .filter((n) => n.status === "OPEN" && !safe(n?.supplierA?.id));

  let fixed = 0;
  let skippedNoProduct = 0;
  let skippedNoSuppliers = 0;

  const updates = [];

  for (const n of toFix) {
    const productId = safe(n.productId);
    if (!productId) {
      skippedNoProduct += 1;
      continue;
    }

    const pSnap = await db.doc(`orgs/${orgId}/products/${productId}`).get();
    if (!pSnap.exists) {
      skippedNoProduct += 1;
      continue;
    }

    const p = pSnap.data() || {};
    let suppliers = extractSuppliersFromProduct(p);
    suppliers = await fillSupplierNames(db, orgId, suppliers);

    if (!suppliers.length) {
      skippedNoSuppliers += 1;
      continue;
    }

    const unitCapture = safe(p.unitCapture || p.defaultUnitCapture || n.unitCapture || "");
    const productName = safe(p.nameEs || p.name || n.productName || productId);
    const categoryName = safe(p.categoryNameEs || p.categoryName || n.categoryName || "");

    updates.push({
      ref: n.ref,
      data: {
        supplierA: suppliers[0] ? { id: suppliers[0].id, name: suppliers[0].name } : null,
        supplierB: suppliers[1] ? { id: suppliers[1].id, name: suppliers[1].name } : null,
        supplierC: suppliers[2] ? { id: suppliers[2].id, name: suppliers[2].name } : null,
        unitCapture,
        productName,
        categoryName,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      },
    });
  }

  for (const part of chunk(updates, 450)) {
    const batch = db.batch();
    for (const u of part) batch.update(u.ref, u.data);
    await batch.commit();
    fixed += part.length;
  }

  console.log(
    `OK backfill: fixed=${fixed} openMissingSupplier=${toFix.length} skippedNoProduct=${skippedNoProduct} skippedNoSuppliers=${skippedNoSuppliers}`
  );
}

main().catch((e) => {
  console.error("Backfill error:", e?.message || e);
  process.exit(1);
});