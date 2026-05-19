"use client";

import { useEffect, useState } from "react";
import { useAuthSession, type AuthStatus } from "@/lib/firebase/auth-context";
import {
  resolveUserBootstrap,
  type UserBootstrapResolution,
} from "@/lib/firebase/resolve-user-bootstrap";

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

export function useUserBootstrap(): UserBootstrapState {
  const session = useAuthSession();
  const [state, setState] = useState<UserBootstrapState>(INITIAL_STATE);

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
