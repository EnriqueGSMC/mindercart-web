import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function arg(name, def = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? String(process.argv[i + 1] || "") : def;
}

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env: ${name}`);
  return v;
}

function safe(s) {
  return String(s ?? "").trim();
}

function usernameToEmail(u) {
  u = safe(u).toLowerCase();
  if (!u) throw new Error("adminUsername requerido");
  return `${u}@carnitas.local`;
}

async function main() {
  const orgId = safe(arg("org", process.env.ORG_ID || "org_el_cliente"));
  const branchId = safe(arg("branch", "sucursal-a"));

  const adminUsername = safe(arg("adminUsername", "admin"));
  const adminPassword = safe(arg("adminPassword", ""));
  if (!adminPassword) throw new Error("Falta --adminPassword");

  const catalogPath = safe(arg("catalog", ""));
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const projectId = env("FIREBASE_PROJECT_ID");
  const clientEmail = env("FIREBASE_CLIENT_EMAIL");
  const privateKey = env("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  const db = admin.firestore();

  // Org
  await db.doc(`orgs/${orgId}`).set(
    {
      orgId,
      name: "Carnitas El Cliente",
      createdAt: nowIso,
      createdAtMs: nowMs,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
    { merge: true }
  );

  // Branch
  await db.doc(`branches/${branchId}`).set(
    {
      orgId,
      branchId,
      name: branchId,
      active: true,
      createdAt: nowIso,
      createdAtMs: nowMs,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
    { merge: true }
  );
  await db.doc(`orgs/${orgId}/branches/${branchId}`).set(
    { orgId, branchId, name: branchId, active: true, updatedAt: nowIso, updatedAtMs: nowMs },
    { merge: true }
  );

  // Motivos default
  const reasons = [
    { id: "no-existencia", nameEs: "No existencia", nameEn: "Out of stock" },
    { id: "muy-caro", nameEs: "Muy caro", nameEn: "Too expensive" },
    { id: "mucha-cantidad", nameEs: "Mucha cantidad", nameEn: "Too much quantity" },
    { id: "no-me-gusto", nameEs: "No me gustó", nameEn: "Did not like it" },
  ];
  for (const r of reasons) {
    await db.doc(`orgs/${orgId}/notPurchasedReasons/${r.id}`).set(
      { ...r, active: true, orgId, createdAt: nowIso, createdAtMs: nowMs, updatedAt: nowIso, updatedAtMs: nowMs },
      { merge: true }
    );
  }

  // Catálogo (opcional)
  if (catalogPath) {
    const abs = path.isAbsolute(catalogPath) ? catalogPath : path.join(process.cwd(), catalogPath);
    const raw = JSON.parse(fs.readFileSync(abs, "utf-8"));

    const categories = raw.categories || [];
    const suppliers = raw.suppliers || [];
    const products = raw.products || [];

    for (const c of categories) {
      const id = safe(c.id);
      if (!id) continue;
      const name = safe(c.name);
      await db.doc(`orgs/${orgId}/categories/${id}`).set(
        {
          orgId,
          id,
          nameEs: name,
          nameEn: name,
          nameLowerEs: safe(c.nameLower || name).toLowerCase(),
          nameLowerEn: safe(c.nameLower || name).toLowerCase(),
          active: !!c.active,
          createdAt: nowIso,
          createdAtMs: nowMs,
          updatedAt: nowIso,
          updatedAtMs: nowMs,
        },
        { merge: true }
      );
    }

    for (const s of suppliers) {
      const id = safe(s.id);
      if (!id) continue;
      await db.doc(`orgs/${orgId}/suppliers/${id}`).set(
        {
          orgId,
          id,
          name: safe(s.name),
          nameLower: safe(s.nameLower || s.name).toLowerCase(),
          mode: safe(s.type) === "ONLINE" ? "ONLINE" : safe(s.type) === "DELIVERY" ? "DELIVERY" : "IN_STORE",
          addressLine1: safe(s.addressLine1),
          addressLine2: safe(s.addressLine2),
          city: safe(s.city),
          state: safe(s.state),
          zip: safe(s.zip),
          googleMapsUrl: safe(s.googleMapsUrl),
          websiteUrl: safe(s.websiteUrl),
          notes: safe(s.notes),
          geo: s.geo && s.geo.lat && s.geo.lng ? { lat: Number(s.geo.lat), lng: Number(s.geo.lng) } : null,
          active: !!s.active,
          createdAt: nowIso,
          createdAtMs: nowMs,
          updatedAt: nowIso,
          updatedAtMs: nowMs,
        },
        { merge: true }
      );
    }

    for (const p of products) {
      const id = safe(p.id);
      if (!id) continue;
      const name = safe(p.name);
      await db.doc(`orgs/${orgId}/products/${id}`).set(
        {
          orgId,
          id,
          nameEs: name,
          nameEn: name,
          nameLowerEs: safe(p.nameLower || name).toLowerCase(),
          nameLowerEn: safe(p.nameLower || name).toLowerCase(),
          categoryId: safe(p.categoryId),
          categoryNameEs: safe(p.categoryName),
          categoryNameEn: safe(p.categoryName),
          unitCapture: safe(p.defaultUnitCapture || "pieza"),
          defaultOrderQty: safe(p.defaultOrderQty || "1"),
          note: safe(p.note),
          barcodes: Array.isArray(p.barcodes) ? p.barcodes : [],
          supplierIds: Array.isArray(p.supplierIds) ? p.supplierIds.slice(0, 3).map(safe) : [],
          supplierNames: Array.isArray(p.supplierNames) ? p.supplierNames.slice(0, 3).map(safe) : [],
          supplierOptions: Array.isArray(p.supplierOptions) ? p.supplierOptions.slice(0, 3) : [],
          active: !!p.active,
          createdAt: nowIso,
          createdAtMs: nowMs,
          updatedAt: nowIso,
          updatedAtMs: nowMs,
        },
        { merge: true }
      );
    }
  }

  // Crear ADMIN (Auth)
  const email = usernameToEmail(adminUsername);

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch {
    userRecord = await admin.auth().createUser({
      email,
      password: adminPassword,
      displayName: "Administrador",
    });
  }

  await admin.auth().setCustomUserClaims(userRecord.uid, {
    orgId,
    role: "ADMIN",
    branchIds: [],
    canBuyOnline: true,
    canBuyInStore: true,
  });

  await db.doc(`orgs/${orgId}/users/${userRecord.uid}`).set(
    {
      orgId,
      uid: userRecord.uid,
      username: adminUsername,
      displayName: "Administrador",
      role: "ADMIN",
      active: true,
      branchIds: [],
      canBuyOnline: true,
      canBuyInStore: true,
      createdAt: nowIso,
      createdAtMs: nowMs,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
    { merge: true }
  );

  console.log("✅ Seed OK");
  console.log(`ORG: ${orgId}`);
  console.log(`Branch: ${branchId}`);
  console.log(`Admin username: ${adminUsername}`);
  console.log(`Admin email interno: ${email}`);
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
