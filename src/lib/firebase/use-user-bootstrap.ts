"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthSession, type AuthStatus } from "@/lib/firebase/auth-context";
import {
  resolveUserBootstrap,
  type UserBootstrapResolution,
} from "@/lib/firebase/resolve-user-bootstrap";
import { CHANGE_EVENT, writeState } from "@/lib/mindercart/storage";

const SAVED_LISTS_STORAGE_KEY = "mindercart.savedLists.v1";

export type UserBootstrapHookStatus = "loading" | "ready" | "error";

export type UserBootstrapState = {
  status: UserBootstrapHookStatus;
  authStatus: AuthStatus;
  enabled: boolean;
  uid: string;
  resolution: UserBootstrapResolution | null;
  error: string | null;
};

const INITIAL_STATE: UserBootstrapState = {
  status: "loading",
  authStatus: "loading",
  enabled: true,
  uid: "",
  resolution: null,
  error: null,
};

function safe(value: unknown) {
  return String(value ?? "").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function emitSavedListsChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function applyCloudStateToLocal(cloudState: Record<string, unknown> | null) {
  if (typeof window === "undefined" || !isRecord(cloudState)) return;

  const maybeCoreState = cloudState.coreState;
  if (isRecord(maybeCoreState)) {
    writeState(maybeCoreState as never);
  }

  if ("savedLists" in cloudState) {
    const maybeSavedLists = cloudState.savedLists;

    if (Array.isArray(maybeSavedLists)) {
      window.localStorage.setItem(SAVED_LISTS_STORAGE_KEY, JSON.stringify(maybeSavedLists));
    } else {
      window.localStorage.removeItem(SAVED_LISTS_STORAGE_KEY);
    }

    emitSavedListsChange();
  }
}

function buildApplySignature(uid: string, resolution: UserBootstrapResolution) {
  if (!resolution.hasCloudData || !isRecord(resolution.cloudState)) {
    return "";
  }

  const updatedAt = safe(resolution.cloudState.updatedAt);
  return `${uid}:${updatedAt}`;
}

export function useUserBootstrap(): UserBootstrapState {
  const session = useAuthSession();
  const [state, setState] = useState<UserBootstrapState>(INITIAL_STATE);
  const appliedSignatureRef = useRef("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const uid = safe(session.user?.uid);

      if (session.status === "loading") {
        setState({
          status: "loading",
          authStatus: session.status,
          enabled: session.enabled,
          uid,
          resolution: null,
          error: session.error,
        });
        return;
      }

      try {
        const resolution = await resolveUserBootstrap(uid);

        if (cancelled) return;

        if (session.status === "authenticated" && resolution.hasCloudData) {
          const signature = buildApplySignature(uid, resolution);

          if (signature && signature !== appliedSignatureRef.current) {
            applyCloudStateToLocal(resolution.cloudState);
            appliedSignatureRef.current = signature;
          }
        }

        if (session.status !== "authenticated") {
          appliedSignatureRef.current = "";
        }

        setState({
          status: "ready",
          authStatus: session.status,
          enabled: session.enabled,
          uid: resolution.uid,
          resolution,
          error: session.error || resolution.error,
        });
      } catch (error) {
        if (cancelled) return;

        setState({
          status: "error",
          authStatus: session.status,
          enabled: session.enabled,
          uid,
          resolution: null,
          error: error instanceof Error ? error.message : "User bootstrap error",
        });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [session.enabled, session.error, session.status, session.user?.uid]);

  return state;
}
