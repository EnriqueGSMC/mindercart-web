// ============================================================================
// FILE: scripts/update-supplier-addresses.mjs  (NUEVO)
// - Actualiza direcciones por nombre (sin necesitar el supplierId exacto)
// - Uso:
//   node scripts/update-supplier-addresses.mjs --org org_el_cliente
// ============================================================================
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
function norm(s) {
  return safe(s).toLowerCase().replace(/\s+/g, " ").trim();
}
function mapsUrlFromAddress(addressText) {
  const dest = encodeURIComponent(addressText);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
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

async function main() {
  loadEnv();
  initAdmin();

  const orgId = safe(arg("org"));
  if (!orgId) throw new Error("Uso: node scripts/update-supplier-addresses.mjs --org ORG_ID");

  const db = admin.firestore();
  const col = db.collection(`orgs/${orgId}/suppliers`);
  const snap = await col.get();

  const suppliers = snap.docs.map((d) => ({
    ref: d.ref,
    id: d.id,
    ...(d.data() || {}),
    _name: norm(d.data()?.name || d.data()?.nameEs || d.id),
  }));

  const updates = [
    {
      match: ["heb"],
      set: {
        addressLine1: "3601 FM 1488",
        city: "The Woodlands",
        state: "Texas",
        zip: "77384",
      },
    },
    {
      match: ["kroger kuykendahl", "kroger", "kuykendahl"],
      set: {
        addressLine1: "8000 Research Forest Dr",
        city: "The Woodlands",
        state: "Texas",
        zip: "77382",
      },
      // nota: si existen varios Kroger, este match puede pegarle al incorrecto.
      // si ves que actualizó otro, dime el supplierId y lo fijamos por ID.
    },
    {
      match: ["kroger gosling", "kroger", "gosling"],
      set: {
        addressLine1: "4747 Research Forest Dr",
        city: "The Woodlands",
        state: "Texas",
        zip: "77381",
      },
    },
  ];

  let touched = 0;

  for (const u of updates) {
    // escoge el mejor candidato por "contiene todos los tokens" en el nombre normalizado
    const tokens = u.match.map(norm);
    const candidates = suppliers.filter((s) => tokens.every((t) => s._name.includes(t)));
    const best = candidates[0];

    if (!best) {
      console.log(`⚠ No encontré proveedor para: ${u.match.join(" / ")}`);
      continue;
    }

    const addressText = [u.set.addressLine1, u.set.city, u.set.state, u.set.zip].filter(Boolean).join(", ");
    const mapsUrl = mapsUrlFromAddress(addressText);

    await best.ref.set(
      {
        ...u.set,
        googleMapsUrl: mapsUrl,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );

    touched += 1;
    console.log(`✅ Updated supplier: ${best.id} (${best._name}) -> ${addressText}`);
  }

  console.log(`OK supplier address updates: ${touched}`);
}

main().catch((e) => {
  console.error("Update suppliers error:", e?.message || e);
  process.exit(1);
});