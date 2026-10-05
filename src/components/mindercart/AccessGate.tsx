"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/firebase/auth-context";
import { useMinderCartState } from "@/lib/mindercart/hooks";

const protectedPaths = ["/", "/settings", "/general-list", "/shopping-list", "/in-store", "/history"];

export function AccessGate({ children, navigation }: { children: React.ReactNode; navigation: React.ReactNode }) {
  const session = useAuthSession();
  const path = usePathname();
  const router = useRouter();
  const state = useMinderCartState();
  const en = state.settings.language === "en";
  const [welcome, setWelcome] = React.useState<boolean | null>(null);
  const protectedRoute = protectedPaths.some(p => p === "/" ? path === p : path === p || path.startsWith(p + "/"));
  React.useEffect(() => {
    try { setWelcome(!localStorage.getItem("mindercart.onboardingSeen.v1")); } catch { setWelcome(true); }
  }, []);
  React.useEffect(() => {
    if (protectedRoute && session.status === "guest" && welcome !== null && !(path === "/" && welcome)) router.replace("/auth");
  }, [protectedRoute, session.status, welcome, path, router]);
  if (!protectedRoute) return <>{children}</>;
  if (session.status === "authenticated") return <>{children}{navigation}</>;
  const start = () => {
    try { localStorage.setItem("mindercart.onboardingSeen.v1", "1"); } catch {}
    setWelcome(false);
    router.replace("/auth");
  };
  return <main style={{ maxWidth: 440, margin: "60px auto", padding: 24, color: "#12245e" }}>
    {session.status === "guest" && welcome && path === "/" ? <>
      <h1>{en ? "Welcome to MinderCart" : "Bienvenido a MinderCart"}</h1>
      <p>{en ? "Never forget what to buy. Sign in or create an account to start your list." : "Nunca olvides qué comprar. Inicia sesión o crea una cuenta para empezar tu lista."}</p>
      <button type="button" onClick={start}>{en ? "Get started" : "Empezar"}</button>
    </> : <p role="status">{en ? "Checking your session…" : "Comprobando tu sesión…"}</p>}
    {session.error ? <><p role="alert">{en ? "We could not check your session. Check your connection." : "No pudimos comprobar tu sesión. Revisa tu conexión."}</p><button onClick={session.retry}>{en ? "Retry" : "Reintentar"}</button></> : null}
  </main>;
}
