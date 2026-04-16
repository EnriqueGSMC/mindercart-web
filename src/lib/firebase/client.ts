// ============================================================================
// FILE: src/lib/firebase/client.ts
// - Misma lógica, pero error de env con nombre correcto (para debug más claro)
// ============================================================================
"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

function cfg() {
  const required = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  for (const [k, v] of Object.entries(required)) {
    if (!v) throw new Error(`Falta env: ${k}`);
  }

  return {
    apiKey: required.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: required.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: required.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: required.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: required.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: required.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
}

let _app: FirebaseApp | null = null;

export function clientApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApps()[0] : initializeApp(cfg());
  return _app;
}

export function clientAuth(): Auth {
  return getAuth(clientApp());
}