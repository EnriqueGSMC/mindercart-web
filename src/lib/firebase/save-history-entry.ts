// ============================================================================
// FILE: src/lib/firebase/save-history-entry.ts
// FIRESTORE HISTORY WRITE v300
// ============================================================================

"use client";

import { doc, getFirestore, setDoc } from "firebase/firestore";
import { clientApp } from "./client";

export type SaveHistoryEntryInput = {
  uid: string;
  entry: {
    id: string;
    closedAt: number;
    store: string;
    items: unknown[];
  };
};

export type SaveHistoryEntryResult = {
  uid: string;
  historyId: string;
  savedAt: number;
};

function safe(value: unknown) {
  return String(value ?? "").trim();
}

function requireUid(uid: string) {
  const normalizedUid = safe(uid);

  if (!normalizedUid) {
    throw new Error("User uid is required");
  }

  return normalizedUid;
}

function requireHistoryId(historyId: string) {
  const normalizedHistoryId = safe(historyId);

  if (!normalizedHistoryId) {
    throw new Error("History entry id is required");
  }

  return normalizedHistoryId;
}

export async function saveHistoryEntryForUser(input: SaveHistoryEntryInput): Promise<SaveHistoryEntryResult> {
  const uid = requireUid(input.uid);
  const historyId = requireHistoryId(input.entry?.id);
  const savedAt = Date.now();
  const db = getFirestore(clientApp());

  const payload = {
    id: historyId,
    closedAt: typeof input.entry?.closedAt === "number" ? input.entry.closedAt : savedAt,
    store: safe(input.entry?.store),
    items: Array.isArray(input.entry?.items) ? input.entry.items : [],
    itemCount: Array.isArray(input.entry?.items) ? input.entry.items.length : 0,
    source: "in-store-close",
    updatedAt: savedAt,
  };

  await setDoc(doc(db, "users", uid, "history", historyId), payload, { merge: true });

  return {
    uid,
    historyId,
    savedAt,
  };
}
