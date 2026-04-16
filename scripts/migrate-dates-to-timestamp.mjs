// FILE: scripts/migrate-dates-to-timestamp.mjs
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

function toTs(v) {
  if (!v) return null;
  if (v instanceof admin.firestore.Timestamp) return v;
  if (typeof v === "string") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return admin.firestore.Timestamp.fromDate(d);
  }
  return null;
}

async function migrate(collection) {
  const snap = await db.collection(collection).limit(500).get();
  const batch = db.batch();
  let n = 0;

  snap.docs.forEach((doc) => {
    const d = doc.data();
    const createdAt = toTs(d.createdAt);
    const closedAt = toTs(d.closedAt);
    const updatedAt = toTs(d.updatedAt);

    // Solo actualiza si hay conversión posible
    const patch = {};
    if (createdAt && typeof d.createdAt === "string") patch.createdAt = createdAt;
    if (closedAt && typeof d.closedAt === "string") patch.closedAt = closedAt;
    if (updatedAt && typeof d.updatedAt === "string") patch.updatedAt = updatedAt;

    if (Object.keys(patch).length) {
      batch.set(doc.ref, patch, { merge: true });
      n += 1;
    }
  });

  if (n) await batch.commit();
  console.log(`Updated ${n} docs in ${collection}`);
}

await migrate(process.env.ORDERS_COLLECTION ?? "purchaseOrders_delivery");

