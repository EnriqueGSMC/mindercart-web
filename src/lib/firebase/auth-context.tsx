"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

export type AuthStatus = "loading" | "guest" | "authenticated";

export type AuthSession = {
  enabled: boolean;
  status: AuthStatus;
  user: User | null;
  error: string | null;
  retry?: () => void;
};

const AuthContext = createContext<AuthSession | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const [session, setSession] = useState<AuthSession>({
    enabled: true,
    status: "loading",
    user: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;
    setSession((current) => ({ ...current, enabled: true, error: null }));
    const authTimeout = window.setTimeout(() => {
      if (!active) return;
      setSession((current) => current.status === "loading"
        ? {
            ...current,
            error: "auth/check-delayed",
          }
        : current);
    }, 8000);

    try {
      const auth = clientAuth();

      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (!active) return;
          window.clearTimeout(authTimeout);
          setSession({
            enabled: true,
            status: user ? "authenticated" : "guest",
            user,
            error: null,
          });
        },
        () => {
          if (!active) return;
          window.clearTimeout(authTimeout);
          setSession((current) => ({
            ...current,
            error: "auth/check-failed",
          }));
        }
      );
    } catch {
      window.clearTimeout(authTimeout);
      setSession({
        enabled: false,
        status: "loading",
        user: null,
        error: "auth/check-failed",
      });
    }

    return () => {
      active = false;
      window.clearTimeout(authTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [attempt]);

  useEffect(() => {
    if (!session.error) return;
    const recover = () => {
      if (document.visibilityState === "visible") retry();
    };
    window.addEventListener("online", recover);
    window.addEventListener("focus", recover);
    document.addEventListener("visibilitychange", recover);
    return () => {
      window.removeEventListener("online", recover);
      window.removeEventListener("focus", recover);
      document.removeEventListener("visibilitychange", recover);
    };
  }, [session.error, retry]);

  const value = useMemo(() => ({ ...session, retry }), [session, retry]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuthSession must be used within <AuthProvider>");
  }

  return value;
}
