// ============================================================================
// FILE: src/lib/firebase/load-user-data.ts
// FIRESTORE READ v255
// ============================================================================

"use client";

import { doc, getDoc, getFirestore } from "firebase/firestore";
import { clientApp } from "./client";

export async function loadUserData(uid: string) {
  const db = getFirestore(clientApp());

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data();
}
