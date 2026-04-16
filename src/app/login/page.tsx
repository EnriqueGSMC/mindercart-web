// ============================================================================
// FILE: src/app/login/page.tsx   (REEMPLAZA COMPLETO)
// - Selector de idioma SOLO aquí
// - Fuerza refresh de claims: getIdTokenResult(true)
// - Rol robusto: role | roles[0] | rol | purchaseRole | purchasesRole
// - Debug opcional: NEXT_PUBLIC_DEBUG_AUTH=1
// ============================================================================
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { getLang, setLang } from "@/lib/lang";

type Lang = "es" | "en";

function usernameToEmail(username: string) {
  return `${String(username || "").trim().toLowerCase()}@carnitas.local`;
}

function normalizeRole(raw: unknown): string {
  return String(raw ?? "").trim().toUpperCase();
}

function getRoleFromClaims(claims: any): string {
  const raw =
    claims?.role ??
    (Array.isArray(claims?.roles) ? claims.roles[0] : undefined) ??
    claims?.rol ??
    claims?.purchaseRole ??
    claims?.purchasesRole ??
    "";
  return normalizeRole(raw);
}

function getBranchIdFromClaims(claims: any): string {
  return String(claims?.branchId ?? claims?.branch ?? "sucursal-a");
}

function friendlyAuthError(e: any, lang: Lang): string {
  const code = String(e?.code || "");
  const msg = String(e?.message || e || "");

  const es = (s: string) => (lang === "es" ? s : "");
  const en = (s: string) => (lang === "en" ? s : "");

  if (code === "auth/network-request-failed") {
    return (
      es("Error de red al iniciar sesión. Revisa internet/VPN/firewall/adblock o prueba incógnito/otra red.") ||
      en("Network error signing in. Check internet/VPN/firewall/adblock or try incognito/another network.")
    );
  }
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return es("Contraseña incorrecta.") || en("Wrong password.");
  }
  if (code === "auth/user-not-found") {
    return es("Usuario no existe.") || en("User not found.");
  }
  if (code === "auth/too-many-requests") {
    return es("Demasiados intentos. Espera un momento y vuelve a intentar.") || en("Too many attempts. Try again later.");
  }
  if (code === "auth/unauthorized-domain") {
    return (
      es("Dominio no autorizado en Firebase Auth. Revisa Authorized domains en Firebase Console.") ||
      en("Unauthorized domain in Firebase Auth. Check Authorized domains in Firebase Console.")
    );
  }

  return msg;
}

export default function LoginPage() {
  const r = useRouter();

  const [mounted, setMounted] = React.useState(false);
  const [lang, setLangState] = React.useState<Lang>("es");

  const [u, setU] = React.useState("");
  const [p, setP] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const l = getLang();
    setLangState(l);
    setLang(l);
  }, []);

  const routeByClaims = async (user: any) => {
    const tok = await user.getIdTokenResult(true); // fuerza refresh del token/claims
    const role = getRoleFromClaims(tok.claims);
    const branchId = getBranchIdFromClaims(tok.claims);

    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === "1") {
      // eslint-disable-next-line no-console
      console.log("AUTH DEBUG", { uid: user.uid, email: user.email, role, claims: tok.claims });
    }

    const isPurchases = ["ADMIN", "BUYER", "PURCHASER"].includes(role);

    if (isPurchases) r.replace(`/purchases?branch=${encodeURIComponent(branchId)}&tab=NEEDS&sub=PENDING`);
    else r.replace(`/needs?branch=${encodeURIComponent(branchId)}`);
  };

  const submit = async () => {
    if (busy) return;

    const username = String(u || "").trim();
    const password = String(p || "");
    if (!username || !password) {
      setMsg(lang === "en" ? "Enter username and password." : "Ingresa usuario y contraseña.");
      return;
    }

    setMsg("");
    setBusy(true);

    const auth = clientAuth();
    const email = usernameToEmail(username);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await routeByClaims(cred.user);
    } catch (e: any) {
      if (String(e?.code || "") === "auth/network-request-failed") {
        try {
          await new Promise((x) => setTimeout(x, 600));
          const cred2 = await signInWithEmailAndPassword(auth, email, password);
          await routeByClaims(cred2.user);
          return;
        } catch (e2: any) {
          setMsg(friendlyAuthError(e2, lang));
        }
      } else {
        setMsg(friendlyAuthError(e, lang));
      }
    } finally {
      setBusy(false);
    }
  };

  const L = mounted ? lang : "es";

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 14, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Carnitas El Cliente - Compras</h2>

        <select
          value={lang}
          onChange={(e) => {
            const next = (e.target.value as Lang) || "es";
            setLangState(next);
            setLang(next);
          }}
          style={{ padding: 10, borderRadius: 12, border: "1px solid #ddd", fontWeight: 900 }}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <input
          placeholder={L === "en" ? "Username" : "Usuario"}
          value={u}
          onChange={(e) => setU(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          style={{ padding: 14, borderRadius: 14, border: "1px solid #ddd", fontSize: 16 }}
        />
        <input
          placeholder={L === "en" ? "Password" : "Contraseña"}
          type="password"
          value={p}
          onChange={(e) => setP(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          style={{ padding: 14, borderRadius: 14, border: "1px solid #ddd", fontSize: 16 }}
        />

        <button
          onClick={() => void submit()}
          disabled={busy}
          style={{
            padding: 14,
            borderRadius: 16,
            border: "0",
            background: "#111",
            color: "white",
            fontWeight: 1000,
            fontSize: 16,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? (L === "en" ? "Signing in..." : "Entrando...") : L === "en" ? "Sign in" : "Entrar"}
        </button>

        {msg ? <div style={{ color: "crimson", fontWeight: 700 }}>{msg}</div> : null}
      </div>
    </main>
  );
}