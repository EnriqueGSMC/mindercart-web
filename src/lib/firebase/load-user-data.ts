// FILE: src/lib/firebase/load-user-data.ts
"use client";

import { getFirestore, doc, getDoc, getDocFromServer, onSnapshot } from "firebase/firestore";
import { clientApp } from "./client";
import { withOperationTimeout } from "./operation-timeout";

const FIRESTORE_READ_TIMEOUT_MS = 8000;

export type WorkspaceType = "individual" | "family";

export type LoadUserDataInput =
  | string
  | {
      uid: string;
      workspaceType?: WorkspaceType | null;
      familyId?: string | null;
    };

function normalizeString(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveInput(input: LoadUserDataInput): {
  uid: string;
  workspaceType: WorkspaceType;
  familyId: string | null;
} {
  if (typeof input === "string") {
    const uid = normalizeString(input);

    if (!uid) {
      throw new Error("loadUserData requires a valid uid");
    }

    return {
      uid,
      workspaceType: "individual",
      familyId: null,
    };
  }

  const uid = normalizeString(input.uid);
  const workspaceType =
    input.workspaceType === "family" ? "family" : "individual";
  const familyId = normalizeString(input.familyId) || null;

  if (!uid) {
    throw new Error("loadUserData requires a valid uid");
  }

  if (workspaceType === "family" && !familyId) {
    throw new Error("loadUserData requires familyId for family workspace");
  }

  return {
    uid,
    workspaceType,
    familyId,
  };
}

function userDocRef(uid: string) {
  const db = getFirestore(clientApp());
  return doc(db, "users", uid);
}

function familyWorkspaceDocRef(familyId: string) {
  const db = getFirestore(clientApp());
  return doc(db, "families", familyId, "workspace", "core");
}

// Notify only for server-confirmed voice additions; ordinary local saves must
// not cause a bootstrap/save feedback loop.
export function watchPendingVoiceItems(input: LoadUserDataInput, onChange: (data: Record<string, unknown>) => void) {
  const { uid, workspaceType, familyId } = resolveInput(input);
  const reference = workspaceType === "family" && familyId
    ? familyWorkspaceDocRef(familyId)
    : userDocRef(uid);
  let lastSignature = "";
  let stopped = false;
  let checking = false;
  const receive = (data: Record<string, unknown> | undefined) => {
    if (stopped) return;
    const pending = data?.pendingVoiceItems;
    if (!Array.isArray(pending) || !pending.length) {
      lastSignature = "";
      return;
    }
    const signature = JSON.stringify([data?.updatedAt, pending]);
    if (signature === lastSignature) return;
    lastSignature = signature;
    onChange(data!);
  };
  const unsubscribe = onSnapshot(reference, { includeMetadataChanges: true }, (snapshot) => {
    if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
    receive(snapshot.data());
  }, () => {
    // The visible-page server check below recovers from a lost listener.
  });
  const checkServer = async () => {
    if (stopped || checking || document.visibilityState !== "visible") return;
    checking = true;
    try {
      const snapshot = await withOperationTimeout(
        getDocFromServer(reference), FIRESTORE_READ_TIMEOUT_MS, "Check pending voice items",
      );
      receive(snapshot.data());
    } catch {
      // Leave local edits intact and retry on the next visible check.
    } finally {
      checking = false;
    }
  };
  // Siri can overlay Safari without a focus or visibility event.
  const interval = window.setInterval(() => void checkServer(), 15000);
  window.addEventListener("focus", checkServer);
  document.addEventListener("visibilitychange", checkServer);
  return () => {
    stopped = true;
    unsubscribe();
    window.clearInterval(interval);
    window.removeEventListener("focus", checkServer);
    document.removeEventListener("visibilitychange", checkServer);
  };
}

export async function loadUserData(input: LoadUserDataInput) {
  const { uid, workspaceType, familyId } = resolveInput(input);

  if (workspaceType === "family" && familyId) {
    const familySnap = await withOperationTimeout(
      getDoc(familyWorkspaceDocRef(familyId)),
      FIRESTORE_READ_TIMEOUT_MS,
      "Load family workspace",
    );

    if (familySnap.exists()) {
      return familySnap.data();
    }

    return null;
  }

  const userSnap = await withOperationTimeout(
    getDoc(userDocRef(uid)),
    FIRESTORE_READ_TIMEOUT_MS,
    "Load user workspace",
  );

  if (userSnap.exists()) {
    return userSnap.data();
  }

  return null;
}
