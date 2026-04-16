import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

function arg(name, def = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? String(process.argv[i + 1] || "") : def;
}
function safe(s) {
  return String(s ?? "").trim();
}
function usernameToEmail(u) {
  u = safe(u).toLowerCase();
  if (!u) throw new Error("username requerido");
  return `${u}@carnitas.local`;
}

function initAdmin() {
  if (admin.apps.length) return;
  const servicePath = safe(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!servicePath) throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_PATH en .env.local");
  const abs = path.isAbsolute(servicePath) ? servicePath : path.join(process.cwd(), servicePath);
  const json = JSON.parse(fs.readFileSync(abs, "utf-8"));
  admin.initializeApp({ credential: admin.credential.cert(json) });
}

async function main() {
  initAdmin();

  const orgId = safe(arg("org", process.env.ORG_ID || "org_el_cliente"));
  const username = safe(arg("username", ""));
  const password = safe(arg("password", ""));
  const role = safe(arg("role", ""));
  const branchId = safe(arg("branch", "sucursal-a"));

  if (!username || !password || !role) {
    throw new Error("Faltan --username/--password/--role");
  }

  const email = usernameToEmail(username);

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch {
    userRecord = await admin.auth().createUser({ email, password, displayName: username });
  }

  const claims =
    role === "BASIC"
      ? { orgId, role: "BASIC", branchId }
      : role === "COMPRAS"
        ? { orgId, role: "COMPRAS", branchIds: [], canBuyOnline: false, canBuyInStore: true }
        : { orgId, role: "ADMIN", branchIds: [], canBuyOnline: true, canBuyInStore: true };

  await admin.auth().setCustomUserClaims(userRecord.uid, claims);

  const db = admin.firestore();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  await db.doc(`orgs/${orgId}/users/${userRecord.uid}`).set(
    {
      orgId,
      uid: userRecord.uid,
      username,
      displayName: username,
      role: claims.role,
      active: true,
      branchId: claims.branchId || "",
      branchIds: claims.branchIds || [],
      canBuyOnline: !!claims.canBuyOnline,
      canBuyInStore: claims.canBuyInStore !== false,
      createdAt: nowIso,
      createdAtMs: nowMs,
      updatedAt: nowIso,
      updatedAtMs: nowMs,
    },
    { merge: true }
  );

  console.log("✅ User OK:", { username, role: claims.role, email, branch: claims.branchId || "" });
}

main().catch((e) => {
  console.error("❌ create-user error:", e);
  process.exit(1);
});