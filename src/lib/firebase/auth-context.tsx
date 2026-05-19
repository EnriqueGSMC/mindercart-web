"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

export type AuthStatus = "loading" | "guest" | "authenticated";

export type AuthSession = {
  enabled: boolean;
  status: AuthStatus;
  user: User | null;
  error: string | null;
};

const AuthContext = createContext<AuthSession | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    enabled: true,
    status: "loading",
    user: null,
    error: null,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      const auth = clientAuth();

      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setSession({
            enabled: true,
            status: user ? "authenticated" : "guest",
            user,
            error: null,
          });
        },
        (error) => {
          setSession({
            enabled: true,
            status: "guest",
            user: null,
            error: error instanceof Error ? error.message : "Auth error",
          });
        }
      );
    } catch (error) {
      setSession({
        enabled: false,
        status: "guest",
        user: null,
        error: error instanceof Error ? error.message : "Firebase auth unavailable",
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo(() => session, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuthSession must be used within <AuthProvider>");
  }

  return value;
}
