// FILE: src/lib/firebase/admin.ts
import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function loadServiceAccountFromBase64() {
  const encoded = safe(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
  if (!encoded) return null;

  try {
    const json = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
    if (!json?.project_id || !json?.client_email || !json?.private_key) {
      throw new Error("missing service-account fields");
    }

    return {
      projectId: safe(json.project_id),
      clientEmail: safe(json.client_email),
      privateKey: safe(json.private_key).replace(/\\n/g, "\n"),
    };
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is invalid");
  }
}

function loadServiceAccountFromEnv() {
  const projectId = safe(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = safe(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKeyRaw = safe(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKeyRaw) return null;

  return {
    projectId,
    clientEmail,
    privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
  };
}

function loadServiceAccountFromPath() {
  const p = safe(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!p) return null;

  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  if (!fs.existsSync(abs)) {
    throw new Error(`No existe FIREBASE_SERVICE_ACCOUNT_PATH: ${abs}`);
  }

  const json = JSON.parse(fs.readFileSync(abs, "utf-8"));
  if (!json?.project_id) {
    throw new Error('serviceAccountKey.json inválido: falta "project_id"');
  }

  return {
    projectId: safe(json.project_id),
    clientEmail: safe(json.client_email),
    privateKey: safe(json.private_key).replace(/\\n/g, "\n"),
  };
}

function loadServiceAccount() {
  const fromBase64 = loadServiceAccountFromBase64();
  if (fromBase64) return fromBase64;

  const fromEnv = loadServiceAccountFromEnv();
  if (fromEnv) return fromEnv;

  const fromPath = loadServiceAccountFromPath();
  if (fromPath) return fromPath;

  throw new Error(
    "Missing Firebase Admin credentials. Usa FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY, o FIREBASE_SERVICE_ACCOUNT_PATH como fallback local."
  );
}

export function adminApp(): admin.app.App {
  if (admin.apps.length) return admin.app();

  const serviceAccount = loadServiceAccount();

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function adminDb(): FirebaseFirestore.Firestore {
  adminApp();
  return admin.firestore();
}

export function adminAuth() {
  adminApp();
  return admin.auth();
}

export async function verifyIdTokenFromRequest(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) {
    throw new Error("Falta Authorization: Bearer <token>");
  }

  return adminAuth().verifyIdToken(token);
}
