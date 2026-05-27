// ============================================================================
// FILE: src/lib/firebase/save-user-data.ts
// FIRESTORE WRITE v317
// - Supports individual vs family workspace targets
// - Resolves active family workspace automatically when caller does not specify
// ============================================================================

"use client";

import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  type DocumentReference,
} from "firebase/firestore";
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

type ActiveFamilyMembership = {
  familyId: string;
  role: string | null;
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

function usersDoc(uid: string) {
  const db = getFirestore(clientApp());
  return doc(db, "users", uid);
}

function familyWorkspaceDoc(familyId: string) {
  const db = getFirestore(clientApp());
  return doc(db, "families", familyId, "workspace", "core");
}

function resolveExplicitWorkspaceType(input: SaveUserDataInput): WorkspaceType | null {
  if (input.workspaceType === "family") {
    return "family";
  }

  if (input.workspaceType === "individual") {
    return "individual";
  }

  return null;
}

function readActiveFamilyMembership(value: unknown): ActiveFamilyMembership | null {
  if (!isRecord(value)) {
    return null;
  }

  const membership = value.familyMembership;

  if (!isRecord(membership)) {
    return null;
  }

  const familyId = safe(membership.familyId);
  const status = safe(membership.status).toLowerCase();
  const role = safe(membership.role) || null;

  if (!familyId || status !== "active") {
    return null;
  }

  return {
    familyId,
    role,
  };
}

function buildFamilyWorkspaceTarget(
  uid: string,
  familyId: string,
  ownerUid?: string | null,
): WorkspaceTarget {
  return {
    workspaceType: "family",
    familyId,
    ownerUid: safe(ownerUid) || undefined,
    targetPath: `families/${familyId}/workspace/core`,
    ref: familyWorkspaceDoc(familyId),
  };
}

function buildIndividualWorkspaceTarget(uid: string): WorkspaceTarget {
  return {
    workspaceType: "individual",
    targetPath: `users/${uid}`,
    ref: usersDoc(uid),
  };
}

async function resolveWorkspaceTarget(input: SaveUserDataInput): Promise<WorkspaceTarget> {
  const uid = requireUid(input.uid);
  const explicitWorkspaceType = resolveExplicitWorkspaceType(input);

  if (explicitWorkspaceType === "family") {
    const familyId = safe(input.familyId);

    if (!familyId) {
      throw new Error("Family workspace requires familyId");
    }

    return buildFamilyWorkspaceTarget(uid, familyId, input.ownerUid ?? uid);
  }

  if (explicitWorkspaceType === "individual") {
    return buildIndividualWorkspaceTarget(uid);
  }

  const userSnap = await getDoc(usersDoc(uid));

  if (userSnap.exists()) {
    const activeMembership = readActiveFamilyMembership(userSnap.data());

    if (activeMembership) {
      const resolvedOwnerUid =
        activeMembership.role === "owner" ? uid : input.ownerUid ?? null;

      return buildFamilyWorkspaceTarget(
        uid,
        activeMembership.familyId,
        resolvedOwnerUid,
      );
    }
  }

  return buildIndividualWorkspaceTarget(uid);
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
    payload.updatedByUid = requireUid(input.uid);

    if (target.ownerUid) {
      payload.ownerUid = target.ownerUid;
    }
  }

  return payload;
}

export async function saveUserData(input: SaveUserDataInput): Promise<SaveUserDataResult> {
  const uid = requireUid(input.uid);
  const savedAt = Date.now();
  const target = await resolveWorkspaceTarget(input);
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
