"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AppShell,
  MC_NAVY,
  MC_NAVY_LINE,
  MC_NAVY_MUTED,
  cardStyle,
  scalePx,
} from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import { saveSettings } from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { FontScale, Language } from "@/lib/mindercart/types";

function withMenuOpen(pathname: string) {
  return pathname.includes("?") ? `${pathname}&menu=1` : `${pathname}?menu=1`;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { settings, hydrated } = useMinderCartState();
  const [language, setLanguage] = React.useState<Language>(settings.language);
  const [preferredStore, setPreferredStore] = React.useState(settings.preferredStore);
  const [fontScale, setFontScale] = React.useState<FontScale>(settings.fontScale);

  React.useEffect(() => {
    setLanguage(settings.language);
    setPreferredStore(settings.preferredStore);
    setFontScale(settings.fontScale);
  }, [settings.language, settings.preferredStore, settings.fontScale]);

  const s = (px: number) => scalePx(fontScale, px);

  if (!hydrated) {
    return (
      <AppShell title={t("es", "settingsTitle")} darkHero subtitle={t("es", "settingsSubtitle")} showCart={false}>
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: 14, color: MC_NAVY_MUTED }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ language, preferredStore, fontScale });
    router.push(withMenuOpen(returnTo));
  }

  return (
    <AppShell title={t(language, "settingsTitle")} darkHero subtitle={t(language, "settingsSubtitle")} showCart={false}>
      <section style={{ ...cardStyle(), padding: 14 }}>
        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(15) }}>{t(language, "language")}</div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value === "en" ? "en" : "es")}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                fontSize: s(15),
                boxSizing: "border-box",
              }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(15) }}>{t(language, "preferredStore")}</div>
            <input
              type="text"
              value={preferredStore}
              onChange={(e) => setPreferredStore(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                boxSizing: "border-box",
                fontSize: s(15),
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(15) }}>{t(language, "fontSize")}</div>
            <select
              value={fontScale}
              onChange={(e) =>
                setFontScale(
                  e.target.value === "large" || e.target.value === "xlarge" ? e.target.value : "normal"
                )
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                fontSize: s(15),
                boxSizing: "border-box",
              }}
            >
              <option value="normal">{t(language, "fontNormal")}</option>
              <option value="large">{t(language, "fontLarge")}</option>
              <option value="xlarge">{t(language, "fontXLarge")}</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${MC_NAVY}`,
              background: MC_NAVY,
              color: "#fff",
              fontWeight: 900,
              fontSize: s(15),
            }}
          >
            {t(language, "save")}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
