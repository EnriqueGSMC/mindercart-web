"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMinderCartState } from "@/lib/mindercart/hooks";

// Controls only the first-visit welcome. Authentication restores in the
// background; browsing the app does not require a confirmed session.
export function AccessGate({ children, navigation }: { children: React.ReactNode; navigation: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const state = useMinderCartState();
  const en = state.settings.language === "en";
  const [welcome, setWelcome] = React.useState(false);
  React.useEffect(() => {
    try { setWelcome(localStorage.getItem("mindercart.onboardingSeen.v1") !== "1"); } catch { setWelcome(true); }
  }, []);
  const start = () => {
    try { localStorage.setItem("mindercart.onboardingSeen.v1", "1"); } catch {}
    setWelcome(false);
    router.replace("/auth");
  };
  if (path === "/" && welcome) return <main style={{ height: "100dvh", overflowY: "auto", boxSizing: "border-box", padding: 24, color: "#12245e" }}>
    <section style={{ maxWidth: 440, margin: "36px auto" }}>
      <h1>{en ? "Welcome to MinderCart" : "Bienvenido a MinderCart"}</h1>
      <p>{en ? "Never forget what to buy." : "Nunca olvides qué comprar."}</p>
      <ol style={{ paddingLeft: 22, lineHeight: 1.4 }}>
        <li style={{ marginBottom: 16 }}><strong>{en ? "Add what you need in seconds" : "Agrega lo que necesitas en segundos"}</strong><div>{en ? "Capture items anytime, before you forget." : "Anota artículos en cualquier momento, antes de olvidarlos."}</div></li>
        <li style={{ marginBottom: 16 }}><strong>{en ? "Create and reuse your own lists" : "Crea y reutiliza tus propias listas"}</strong><div>{en ? "Save lists for weekly shopping, recipes, or special occasions." : "Guarda listas para compras semanales, recetas u ocasiones especiales."}</div></li>
        <li style={{ marginBottom: 16 }}><strong>{en ? "Shop faster, organized by category" : "Compra más rápido, organizado por categoría"}</strong><div>{en ? "Spend less time searching and backtracking through the store." : "Pasa menos tiempo buscando y regresando por los mismos pasillos."}</div></li>
      </ol>
      <button type="button" onClick={start}>{en ? "Get started" : "Empezar"}</button>
    </section>
  </main>;
  // The access screen remains independent, with its existing empty blue footer.
  const showNavigation = ["/", "/settings", "/general-list", "/shopping-list", "/in-store", "/history"]
    .some(p => p === "/" ? path === p : path === p || path.startsWith(p + "/"));
  return <>{children}{showNavigation ? navigation : null}</>;
}
