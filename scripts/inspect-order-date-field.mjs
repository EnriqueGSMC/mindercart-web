// FILE: scripts/inspect-order-date-field.mjs
import admin from "firebase-admin";

function init() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

function describeValue(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return `array(len=${v.length})`;
  if (v instanceof admin.firestore.Timestamp) return `Timestamp(${v.toDate().toISOString()})`;
  return `${typeof v}`;
}

async function main() {
  init();
  const db = admin.firestore();

  const collection = process.env.ORDERS_COLLECTION ?? "purchaseOrders_delivery";
  const snap = await db.collection(collection).limit(1).get();
  if (snap.empty) {
    console.log("No docs found in", collection);
    return;
  }

  const doc = snap.docs[0];
  const data = doc.data();

  console.log("Collection:", collection);
  console.log("Doc ID:", doc.id);
  console.log("Fields:");
  for (const [k, v] of Object.entries(data)) {
    console.log(`- ${k}: ${describeValue(v)}`);
  }

  console.log("\nLikely date fields:");
  const candidates = Object.entries(data)
    .filter(([k]) => /date|at|time|created|closed|purchase|purchas/i.test(k))
    .map(([k, v]) => `- ${k}: ${describeValue(v)}`);

  console.log(candidates.length ? candidates.join("\n") : "(none found by heuristic)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});