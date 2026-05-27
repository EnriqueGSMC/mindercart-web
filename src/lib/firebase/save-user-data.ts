// ============================================================================
// FILE: src/lib/firebase/save-user-data.ts
// FIRESTORE WRITE v316
// - Supports individual vs family workspace targets
// ============================================================================

"use client";

import { doc, getFirestore, setDoc, type DocumentReference } from "firebase/firestore";
import type { InitialCloudBootstrapPayload } from "@/lib/mindercart/storage";
import { clientApp } from "./client";

const REMOTE_HISTORY_LIMIT = 20;

type UnknownRecord = Record<string, unknown>;

export type WorkspaceType = "individual" | "family";

export type SaveUserDataInput = {
  uid: string;
  data: Record<string, unknown>;
  bootstrapPayload?: InitialCloudBootstrapPayload | null;
  workspaceType?: WorkspaceType;
  familyId?: string | null;
  ownerUid?: string | null;
};

export type SaveUserDataResult = {
  uid: string;
  savedAt: number;
  merged: true;
  wroteBootstrapPayload: boolean;
  workspaceType: WorkspaceType;
  targetPath: string;
};

type WorkspaceTarget = {
  workspaceType: WorkspaceType;
  targetPath: string;
  ref: DocumentReference;
  ownerUid?: string;
  familyId?: string;
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

function resolveWorkspaceType(input: SaveUserDataInput): WorkspaceType {
  if (input.workspaceType === "family") {
    return "family";
  }

  return "individual";
}

function resolveWorkspaceTarget(input: SaveUserDataInput): WorkspaceTarget {
  const db = getFirestore(clientApp());
  const uid = requireUid(input.uid);
  const workspaceType = resolveWorkspaceType(input);

  if (workspaceType === "family") {
    const familyId = safe(input.familyId);
    const ownerUid = safe(input.ownerUid) || uid;

    if (!familyId) {
      throw new Error("Family workspace requires familyId");
    }

    return {
      workspaceType,
      familyId,
      ownerUid,
      targetPath: `families/${familyId}/workspace/core`,
      ref: doc(db, "families", familyId, "workspace", "core"),
    };
  }

  return {
    workspaceType,
    targetPath: `users/${uid}`,
    ref: doc(db, "users", uid),
  };
}

function buildPayload(input: SaveUserDataInput, savedAt: number, target: WorkspaceTarget) {
  const data = withLimitedRemoteHistory(requireData(input.data));

  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: savedAt,
  };

  if (input.bootstrapPayload) {
    payload.initialBootstrapPayload = withLimitedRemoteHistory(input.bootstrapPayload);
  }

  if (target.workspaceType === "family") {
    payload.workspaceType = "family";
    payload.familyId = target.familyId;
    payload.ownerUid = target.ownerUid;
    payload.updatedByUid = requireUid(input.uid);
  }

  return payload;
}

export async function saveUserData(input: SaveUserDataInput): Promise<SaveUserDataResult> {
  const uid = requireUid(input.uid);
  const savedAt = Date.now();
  const target = resolveWorkspaceTarget(input);
  const payload = buildPayload(input, savedAt, target);

  await setDoc(target.ref, payload, { merge: true });

  return {
    uid,
    savedAt,
    merged: true,
    wroteBootstrapPayload: !!input.bootstrapPayload,
    workspaceType: target.workspaceType,
    targetPath: target.targetPath,
  };
}
