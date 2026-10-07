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
  runTransaction,
  type DocumentReference,
} from "firebase/firestore";
import type { InitialCloudBootstrapPayload } from "@/lib/mindercart/storage";
import { clientApp } from "./client";
import { voiceItemIdentity } from "@/lib/voice/item-identity";
import { withOperationTimeout } from "./operation-timeout";
import { compactJsonSignature } from "@/lib/mindercart/compact-signature";

const REMOTE_HISTORY_LIMIT = 20;
const FIRESTORE_WRITE_TIMEOUT_MS = 10000;

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

const inFlightSaves = new Map<string, Promise<SaveUserDataResult>>();

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

function mergePendingVoiceItems(
  data: Record<string, unknown>,
  remote: Record<string, unknown> | null,
) {
  const pending = Array.isArray(remote?.pendingVoiceItems)
    ? remote.pendingVoiceItems.filter(isRecord)
    : [];
  if (!pending.length || !isRecord(data.coreState)) return data;

  const remoteCoreState = isRecord(remote?.coreState) ? remote.coreState : {};
  const localCoreState = data.coreState;
  const localActive = Array.isArray(localCoreState.activeShoppingListItems)
    ? localCoreState.activeShoppingListItems.filter(isRecord)
    : [];
  const remoteActive = Array.isArray(remoteCoreState.activeShoppingListItems)
    ? remoteCoreState.activeShoppingListItems.filter(isRecord)
    : [];
  const localGeneral = Array.isArray(localCoreState.generalListItems)
    ? localCoreState.generalListItems.filter(isRecord)
    : [];
  const remoteGeneral = Array.isArray(remoteCoreState.generalListItems)
    ? remoteCoreState.generalListItems.filter(isRecord)
    : [];
  const localMaster = Array.isArray(localCoreState.itemsMaster)
    ? localCoreState.itemsMaster.filter(isRecord)
    : [];
  const remoteMaster = Array.isArray(remoteCoreState.itemsMaster)
    ? remoteCoreState.itemsMaster.filter(isRecord)
    : [];

  const pendingKeys = new Set(pending.map((item) => safe(item.itemKey)).filter(Boolean));
  const pendingIdentities = new Set(pending.map(voiceItemIdentity));
  const voiceGeneral = remoteGeneral.filter((item) => pendingIdentities.has(voiceItemIdentity(item)));
  const voiceActive = remoteActive.filter((item) => pendingIdentities.has(voiceItemIdentity(item)));
  const voiceActiveIds = new Set(voiceActive.map((item) => safe(item.id)));
  const voiceMaster = remoteMaster.filter((item) => pendingKeys.has(safe(item.itemKey)));
  const withoutVoiceGeneral = localGeneral.filter((item) => !pendingIdentities.has(voiceItemIdentity(item)));
  const localMasterKeys = new Set(localMaster.map((item) => safe(item.itemKey)).filter(Boolean));

  return {
    ...data,
    coreState: {
      ...localCoreState,
      activeShoppingListItems: [
        ...voiceActive,
        ...localActive.filter((item) => !voiceActiveIds.has(safe(item.id)) && !pendingIdentities.has(voiceItemIdentity(item))),
      ],
      generalListItems: [...voiceGeneral, ...withoutVoiceGeneral],
      itemsMaster: [
        ...voiceMaster.filter((item) => !localMasterKeys.has(safe(item.itemKey))),
        ...localMaster,
      ],
    },
    pendingVoiceItems: [],
    voiceConsumedAt: Number(remote?.voiceUpdatedAt ?? Date.now()),
  };
}

function buildInFlightSaveKey(input: SaveUserDataInput) {
  return compactJsonSignature({
    uid: requireUid(input.uid),
    data: requireData(input.data),
    bootstrapPayload: input.bootstrapPayload ?? null,
    workspaceType: input.workspaceType ?? null,
    familyId: safe(input.familyId) || null,
    ownerUid: safe(input.ownerUid) || null,
  });
}

async function saveUserDataOnce(input: SaveUserDataInput): Promise<SaveUserDataResult> {
  const uid = requireUid(input.uid);
  const savedAt = Date.now();
  const target = await withOperationTimeout(
    resolveWorkspaceTarget(input),
    FIRESTORE_WRITE_TIMEOUT_MS,
    "Resolve cloud workspace",
  );
  await withOperationTimeout(
    runTransaction(getFirestore(clientApp()), async (transaction) => {
      const userSnap = await transaction.get(usersDoc(uid));
      const membership = userSnap.exists() ? readActiveFamilyMembership(userSnap.data()) : null;
      if (
        (target.workspaceType === "family" && membership?.familyId !== target.familyId)
        || (target.workspaceType === "individual" && membership !== null)
      ) throw new Error("Cloud workspace changed; reload before saving");
      const remoteSnap = target.targetPath === `users/${uid}` ? userSnap : await transaction.get(target.ref);
      const mergedData = mergePendingVoiceItems(requireData(input.data), remoteSnap.exists() ? remoteSnap.data() : null);
      const payload = buildPayload({ ...input, data: mergedData }, savedAt, target);
      transaction.set(target.ref, payload, { merge: true });
    }),
    FIRESTORE_WRITE_TIMEOUT_MS,
    "Save cloud workspace",
  );

  return {
    uid,
    savedAt,
    merged: true,
    wroteBootstrapPayload: !!input.bootstrapPayload,
    workspaceType: target.workspaceType,
    targetPath: target.targetPath,
  };
}

export async function saveUserData(input: SaveUserDataInput): Promise<SaveUserDataResult> {
  const inFlightKey = buildInFlightSaveKey(input);
  const inFlight = inFlightSaves.get(inFlightKey);
  if (inFlight) return inFlight;

  const save: Promise<SaveUserDataResult> = saveUserDataOnce(input).finally(() => {
    if (inFlightSaves.get(inFlightKey) === save) {
      inFlightSaves.delete(inFlightKey);
    }
  });

  inFlightSaves.set(inFlightKey, save);
  return save;
}
