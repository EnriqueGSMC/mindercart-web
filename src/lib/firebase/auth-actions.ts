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
    await signOut(auth);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    throw new AuthActionError("sign-out-failed", message);
  }
}
