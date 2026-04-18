"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import { saveSettings } from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { Language } from "@/lib/mindercart/types";

export default function SettingsPage() {
  const { settings, hydrated } = useMinderCartState();
  const [language, setLanguage] = React.useState<Language>(settings.language);
  const [preferredStore, setPreferredStore] = React.useState(settings.preferredStore);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setLanguage(settings.language);
    setPreferredStore(settings.preferredStore);
  }, [settings.language, settings.preferredStore]);

  if (!hydrated) {
    return (
      <AppShell title={t("es", "settingsTitle")} subtitle={t("es", "settingsSubtitle")}>
        <section style={cardStyle()}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ language, preferredStore });
    setMessage(`✅ ${t(language, "saved")}`);
  }

  return (
    <AppShell title={t(language, "settingsTitle")} subtitle={t(language, "settingsSubtitle")}>
      <section style={cardStyle()}>
        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(language, "language")}</div>
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
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(language, "preferredStore")}</div>
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
            {t(language, "save")}
          </button>
        </form>

        {message ? <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div> : null}
      </section>
    </AppShell>
  );
}
