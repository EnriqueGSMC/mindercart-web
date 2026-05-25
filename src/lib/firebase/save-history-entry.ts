// ============================================================================
// FILE: src/lib/firebase/save-history-entry.ts
// FIRESTORE HISTORY WRITE v301
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

function sanitizeFirestoreValue(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const valueType = typeof value;

  if (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean"
  ) {
    return value;
  }

  if (valueType === "bigint") {
    return String(value);
  }

  if (valueType === "function" || valueType === "symbol") {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeFirestoreValue(entry))
      .filter((entry) => entry !== undefined);
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value && valueType === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const sanitizedEntry = sanitizeFirestoreValue(entry);

      if (sanitizedEntry !== undefined) {
        output[key] = sanitizedEntry;
      }
    }

    return output;
  }

  return String(value);
}

function sanitizeHistoryItems(items: unknown[]) {
  return items
    .map((item) => sanitizeFirestoreValue(item))
    .filter((item) => item !== undefined);
}

export async function saveHistoryEntryForUser(input: SaveHistoryEntryInput): Promise<SaveHistoryEntryResult> {
  const uid = requireUid(input.uid);
  const historyId = requireHistoryId(input.entry?.id);
  const savedAt = Date.now();
  const db = getFirestore(clientApp());
  const items = Array.isArray(input.entry?.items) ? sanitizeHistoryItems(input.entry.items) : [];

  const payload = {
    id: historyId,
    closedAt: typeof input.entry?.closedAt === "number" ? input.entry.closedAt : savedAt,
    store: safe(input.entry?.store),
    items,
    itemCount: items.length,
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
