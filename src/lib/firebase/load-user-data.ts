// FILE: src/lib/firebase/load-user-data.ts
"use client";

import { getFirestore, doc, getDoc } from "firebase/firestore";
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
