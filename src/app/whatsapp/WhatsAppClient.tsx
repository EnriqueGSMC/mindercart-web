// FILE: src/app/whatsapp/page.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function WhatsAppBridgePage() {
  const sp = useSearchParams();
  const text = sp.get("text") ?? "";
  const ret = sp.get("return") ?? "/purchases";

  const [phase, setPhase] = React.useState<"opening" | "returning">("opening");

  React.useEffect(() => {
    const msg = String(text || "");
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

    const onVis = () => {
      if (document.visibilityState === "visible") {
        setPhase("returning");
        window.location.replace(ret);
      }
    };

    document.addEventListener("visibilitychange", onVis);

    // Give Safari a beat to paint the "Abriendo..." message.
    const t = window.setTimeout(() => {
      window.location.href = waUrl;
    }, 50);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearTimeout(t);
    };
  }, [text, ret]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>
        {phase === "opening" ? "Abriendo WhatsApp…" : "Regresando a la app…"}
      </div>
      <div style={{ marginTop: 8, opacity: 0.75, fontSize: 13 }}>
        Si no abre automáticamente, revisa que WhatsApp esté instalado.
      </div>
      <div style={{ marginTop: 12 }}>
        <a href={`https://wa.me/?text=${encodeURIComponent(String(text || ""))}`} style={{ fontWeight: 900 }}>
          Abrir WhatsApp
        </a>
      </div>
      <div style={{ marginTop: 10 }}>
        <a href={ret} style={{ fontWeight: 900 }}>
          Volver a la app
        </a>
      </div>
    </div>
  );
}
