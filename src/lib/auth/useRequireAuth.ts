// FILE: src/lib/auth/useRequireAuth.ts
"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { clientAuth } from "@/lib/firebase/client";

export function useRequireAuth(redirectTo = "/login") {
  const r = useRouter();
  const [user, setUser] = React.useState<User | null | undefined>(undefined);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      if (!u) r.replace(redirectTo);
      setUser(u);
    });
    return () => unsub();
  }, [r, redirectTo]);

  return {
    user: user ?? null,
    loading: user === undefined,
  };
}