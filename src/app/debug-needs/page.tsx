"use client";

import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

async function apiFetch(user: User, path: string) {
  const token = await user.getIdToken();
  return fetch(path, { headers: { authorization: `Bearer ${token}` } });
}

export default function DebugNeedsPage() {
  const r = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [json, setJson] = React.useState<any>(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth(), (u) => {
      if (!u) return r.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [r]);

  React.useEffect(() => {
    if (!user) return;
    setErr("");
    (async () => {
      const res = await apiFetch(user, "/api/debug/needs-latest?branch=sucursal-a");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Error");
      setJson(j);
    })().catch((e) => setErr(String(e?.message || e)));
  }, [user]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <h2>Debug Needs (últimos 10)</h2>
      {err ? <div style={{ color: "crimson" }}>⚠ {err}</div> : null}
      <pre style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 12, borderRadius: 10 }}>
        {json ? JSON.stringify(json, null, 2) : "Cargando…"}
      </pre>
    </main>
  );
}