// FILE: src/app/settings/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { readState, saveSettings } from "@/lib/mindercart/storage";
import type { Language } from "@/lib/mindercart/types";

export default function SettingsPage() {
  const [language, setLanguage] = React.useState<Language>("es");
  const [preferredStore, setPreferredStore] = React.useState("Walmart");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const state = readState();
    setLanguage(state.settings.language);
    setPreferredStore(state.settings.preferredStore);
  }, []);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ language, preferredStore });
    setMessage("✅ Settings guardados");
  }

  return (
    <AppShell
      title="Settings"
      subtitle="Idioma, tienda preferida y preferencias básicas"
    >
      <section style={cardStyle()}>
        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Language / Idioma</div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value === "en" ? "en" : "es")}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
              }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              Preferred store / Tienda preferida
            </div>
            <input
              type="text"
              value={preferredStore}
              onChange={(e) => setPreferredStore(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Save
          </button>
        </form>

        {message ? <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div> : null}
      </section>
    </AppShell>
  );
}