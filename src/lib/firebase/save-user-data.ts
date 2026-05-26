// ============================================================================
// FILE: src/lib/firebase/save-user-data.ts
// FIRESTORE WRITE v302
// ============================================================================

"use client";

import { doc, getFirestore, setDoc } from "firebase/firestore";
import type { InitialCloudBootstrapPayload } from "@/lib/mindercart/storage";
import { clientApp } from "./client";

const REMOTE_HISTORY_LIMIT = 20;

type UnknownRecord = Record<string, unknown>;

export type SaveUserDataInput = {
  uid: string;
  data: Record<string, unknown>;
  bootstrapPayload?: InitialCloudBootstrapPayload | null;
};

export type SaveUserDataResult = {
  uid: string;
  savedAt: number;
  merged: true;
  wroteBootstrapPayload: boolean;
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

function requireData(data: Record<string, unknown>) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("User data payload must be an object");
  }

  return data;
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function withLimitedRemoteHistory<T>(value: T): T {
  if (!isRecord(value)) {
    return value;
  }

  const coreState = value.coreState;

  if (!isRecord(coreState)) {
    return value;
  }

  const shoppingHistory = coreState.shoppingHistory;

  if (!Array.isArray(shoppingHistory)) {
    return value;
  }

  return {
    ...value,
    coreState: {
      ...coreState,
      shoppingHistory: shoppingHistory.slice(0, REMOTE_HISTORY_LIMIT),
    },
  } as T;
}

export async function saveUserData(input: SaveUserDataInput): Promise<SaveUserDataResult> {
  const uid = requireUid(input.uid);
  const data = withLimitedRemoteHistory(requireData(input.data));
  const savedAt = Date.now();
  const db = getFirestore(clientApp());

  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: savedAt,
  };

  if (input.bootstrapPayload) {
    payload.initialBootstrapPayload = withLimitedRemoteHistory(input.bootstrapPayload);
  }

  await setDoc(doc(db, "users", uid), payload, { merge: true });

  return {
    uid,
    savedAt,
    merged: true,
    wroteBootstrapPayload: !!input.bootstrapPayload,
  };
}
