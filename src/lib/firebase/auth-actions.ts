// ============================================================================
// FILE: src/lib/firebase/auth-actions.ts
// AUTH ACTIONS v259
// ============================================================================

"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { saveUserData } from "@/lib/firebase/save-user-data";
import { CHANGE_EVENT, readState, resetStateForLogout, saveSettings } from "@/lib/mindercart/storage";

const SAVED_LISTS_STORAGE_KEY = "mindercart.savedLists.v1";
const PENDING_CLOUD_SYNC_STORAGE_PREFIX = "mindercart.pendingCloudSync.v1.";
const LOGOUT_CLOUD_SAVE_TIMEOUT_MS = 6000;

type LogoutCloudSnapshot = {
  uid: string;
  signature: string;
  coreState: ReturnType<typeof readState>;
  savedLists: unknown[];
  createdAt: number;
};

export type AuthActionErrorCode =
  | "invalid-input"
  | "sign-in-failed"
  | "sign-up-failed"
  | "sign-out-failed"
  | "password-reset-failed";

export class AuthActionError extends Error {
  code: AuthActionErrorCode;

  constructor(code: AuthActionErrorCode, message: string) {
    super(message);
    this.name = "AuthActionError";
    this.code = code;
  }
}

function cleanCredential(value: string) {
  return value.trim();
}

function requireEmail(email: string) {
  const nextEmail = cleanCredential(email);

  if (!nextEmail) {
    throw new AuthActionError("invalid-input", "Email is required");
  }

  return nextEmail;
}

function requireEmailAndPassword(email: string, password: string) {
  const nextEmail = cleanCredential(email);
  const nextPassword = cleanCredential(password);

  if (!nextEmail || !nextPassword) {
    throw new AuthActionError("invalid-input", "Email and password are required");
  }

  return {
    email: nextEmail,
    password: nextPassword,
  };
}

function readSavedListsForLogout() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_LISTS_STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearSavedListsForLogout() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SAVED_LISTS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function pendingCloudSyncStorageKey(uid: string) {
  return `${PENDING_CLOUD_SYNC_STORAGE_PREFIX}${uid}`;
}

function buildLogoutCloudSnapshot(
  uid: string,
  coreState: ReturnType<typeof readState>,
  savedLists: unknown[]
): LogoutCloudSnapshot {
  return {
    uid,
    signature: JSON.stringify({ coreState, savedLists }),
    coreState,
    savedLists,
    createdAt: Date.now(),
  };
}

function writePendingLogoutSnapshot(snapshot: LogoutCloudSnapshot) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      pendingCloudSyncStorageKey(snapshot.uid),
      JSON.stringify(snapshot)
    );
    return true;
  } catch {
    return false;
  }
}

function clearPendingLogoutSnapshot(snapshot: LogoutCloudSnapshot) {
  if (typeof window === "undefined") return;

  try {
    const key = pendingCloudSyncStorageKey(snapshot.uid);
    const raw = window.localStorage.getItem(key);
    if (!raw) return;

    const pending = JSON.parse(raw) as Partial<LogoutCloudSnapshot> | null;
    if (pending?.signature === snapshot.signature) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Keep an unreadable marker rather than interrupting logout.
  }
}

async function saveBeforeLogout(snapshot: LogoutCloudSnapshot) {
  let timeoutId: number | null = null;

  const save = saveUserData({
    uid: snapshot.uid,
    data: {
      coreState: snapshot.coreState,
      savedLists: snapshot.savedLists,
    },
  }).then(() => {
    clearPendingLogoutSnapshot(snapshot);
    return true;
  }).catch(() => false);

  const timeout = new Promise<boolean>((resolve) => {
    timeoutId = window.setTimeout(() => resolve(false), LOGOUT_CLOUD_SAVE_TIMEOUT_MS);
  });

  await Promise.race([save, timeout]);

  if (timeoutId !== null) {
    window.clearTimeout(timeoutId);
  }
}

function readUiPreferencesForLogout() {
  const state = readState();

  return {
    language: state.settings.language === "en" ? "en" : "es",
    preferredStore: state.settings.preferredStore || "HEB",
    fontScale: state.settings.fontScale === "large" ? "large" : "normal",
  } as const;
}

export async function signInUser(email: string, password: string) {
  const credentials = requireEmailAndPassword(email, password);

  try {
    const auth = clientAuth();
    return await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    throw new AuthActionError("sign-in-failed", message);
  }
}

export async function signUpUser(email: string, password: string) {
  const credentials = requireEmailAndPassword(email, password);

  try {
    const auth = clientAuth();
    return await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    throw new AuthActionError("sign-up-failed", message);
  }
}

export async function resetPasswordForUser(email: string) {
  const nextEmail = requireEmail(email);

  try {
    const auth = clientAuth();
    await sendPasswordResetEmail(auth, nextEmail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset failed";
    throw new AuthActionError("password-reset-failed", message);
  }
}

export async function signOutUser() {
  try {
    const auth = clientAuth();
    const uid = auth.currentUser?.uid ?? "";
    const coreState = readState();
    const uiPreferences = readUiPreferencesForLogout();
    const savedLists = readSavedListsForLogout();

    if (uid) {
      const pendingSnapshot = buildLogoutCloudSnapshot(uid, coreState, savedLists);
      const hasRecoverableBackup = writePendingLogoutSnapshot(pendingSnapshot);

      if (hasRecoverableBackup) {
        await saveBeforeLogout(pendingSnapshot);
      } else {
        await saveUserData({
          uid,
          data: {
            coreState,
            savedLists,
          },
        });
      }
    }

    await signOut(auth);
    resetStateForLogout();
    saveSettings(uiPreferences);
    clearSavedListsForLogout();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    throw new AuthActionError("sign-out-failed", message);
  }
}
