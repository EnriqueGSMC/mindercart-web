import "dotenv/config";
import admin from "firebase-admin";

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env: ${name}`);
  return v;
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : "";
}

function normalizeBarcode(v) {
  return String(v || "").trim().replace(/\s+/g, "");
}

function initAdmin() {
  if (admin.apps.length) return;

  const projectId = env("FIREBASE_PROJECT_ID");
  const clientEmail = env("FIREBASE_CLIENT_EMAIL");
  const privateKey = env("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

async function main() {
  const org = arg("org");
  const productId = arg("productId");
  const barcode = normalizeBarcode(arg("barcode"));

  if (!org) throw new Error("Uso: --org org_el_cliente");
  if (!productId) throw new Error("Uso: --productId aceite");
  if (!barcode) throw new Error("Uso: --barcode 0123456789012");

  initAdmin();
  const db = admin.firestore();

  const ref = db.doc(`orgs/${org}/products/${productId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Producto no existe");

  await ref.set(
    {
      barcode,
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );

  console.log("✅ OK", { org, productId, barcode });
}

main().catch((e) => {
  console.error("❌ set-barcode error:", e?.message || e);
  process.exit(1);
});