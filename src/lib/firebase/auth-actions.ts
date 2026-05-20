// ============================================================================
// FILE: src/lib/firebase/auth-actions.ts
// AUTH ACTIONS v258
// ============================================================================

"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { saveUserData } from "@/lib/firebase/save-user-data";
import { CHANGE_EVENT, readState, resetStateForLogout } from "@/lib/mindercart/storage";

const SAVED_LISTS_STORAGE_KEY = "mindercart.savedLists.v1";

export type AuthActionErrorCode =
  | "invalid-input"
  | "sign-in-failed"
  | "sign-up-failed"
  | "sign-out-failed";

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

export async function signOutUser() {
  try {
    const auth = clientAuth();
    const uid = auth.currentUser?.uid ?? "";
    const coreState = readState();
    const savedLists = readSavedListsForLogout();

    if (uid) {
      await saveUserData({
        uid,
        data: {
          coreState,
          savedLists,
        },
      });
    }

    await signOut(auth);
    resetStateForLogout();
    clearSavedListsForLogout();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    throw new AuthActionError("sign-out-failed", message);
  }
}
