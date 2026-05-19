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
import { listStoreProfiles, saveSettings, upsertStoreProfile } from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { FontScale, Language, StoreProfile } from "@/lib/mindercart/types";

function withMenuOpen(pathname: string) {
  return pathname.includes("?") ? `${pathname}&menu=1` : `${pathname}?menu=1`;
}

type StoreDraft = {
  previousName: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  notes: string;
  preferred: boolean;
};

function emptyStoreDraft(name = ""): StoreDraft {
  return {
    previousName: "",
    name,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
    preferred: false,
  };
}

function draftFromProfile(profile: StoreProfile, preferredStore: string): StoreDraft {
  return {
    previousName: profile.name,
    name: profile.name,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    state: profile.state,
    postalCode: profile.postalCode,
    country: profile.country,
    phone: profile.phone,
    notes: profile.notes,
    preferred: profile.name.trim().toLowerCase() === preferredStore.trim().toLowerCase(),
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { settings, hydrated } = useMinderCartState();
  const [language, setLanguage] = React.useState<Language>(settings.language);
  const [preferredStore, setPreferredStore] = React.useState(settings.preferredStore);
  const [fontScale, setFontScale] = React.useState<FontScale>(settings.fontScale);
  const [storeProfiles, setStoreProfiles] = React.useState<StoreProfile[]>([]);
  const [storeEditorOpen, setStoreEditorOpen] = React.useState(false);
  const [storeError, setStoreError] = React.useState("");
  const [storeDraft, setStoreDraft] = React.useState<StoreDraft>(emptyStoreDraft(settings.preferredStore));
  const storeEditorScrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setLanguage(settings.language);
    setPreferredStore(settings.preferredStore);
    setFontScale(settings.fontScale);
    setStoreProfiles(listStoreProfiles());
    setStoreDraft(emptyStoreDraft(settings.preferredStore));
  }, [settings.language, settings.preferredStore, settings.fontScale]);

  const filteredStoreProfiles = React.useMemo(() => storeProfiles, [storeProfiles]);

  const storeEditorHasContent =
    !!storeDraft.name.trim() ||
    !!storeDraft.addressLine1.trim() ||
    !!storeDraft.addressLine2.trim() ||
    !!storeDraft.city.trim() ||
    !!storeDraft.state.trim() ||
    !!storeDraft.postalCode.trim() ||
    !!storeDraft.country.trim() ||
    !!storeDraft.phone.trim() ||
    !!storeDraft.notes.trim();

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


  function keepStoreFieldVisible(target: HTMLInputElement | HTMLTextAreaElement) {
    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 180);
  }

  function openNewStore() {
    setStoreDraft(emptyStoreDraft(""));
    setStoreError("");
    setStoreEditorOpen(true);
  }

  function onChooseStore(value: string) {
    if (!value) return;

    if (value === "__add__") {
      openNewStore();
      return;
    }

    setPreferredStore(value);
    setStoreError("");
    setStoreEditorOpen(false);
  }

  function closeStoreModal() {
    setStoreEditorOpen(false);
    setStoreError("");
  }

  function onSaveStoreProfile() {
    if (!storeDraft.name.trim()) {
      setStoreError(t(language, "storeNameRequired"));
      return;
    }

    const confirmed = window.confirm(language === "en" ? "Save store?" : "¿Guardar tienda?");

    if (!confirmed) return;

    const next = upsertStoreProfile({
      previousName: storeDraft.previousName,
      name: storeDraft.name,
      addressLine1: storeDraft.addressLine1,
      addressLine2: storeDraft.addressLine2,
      city: storeDraft.city,
      state: storeDraft.state,
      postalCode: storeDraft.postalCode,
      country: storeDraft.country,
      phone: storeDraft.phone,
      notes: storeDraft.notes,
      makePreferred: storeDraft.preferred,
    });

    setStoreProfiles(next.storeProfiles);
    setPreferredStore(next.settings.preferredStore);
    closeStoreModal();
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ language, preferredStore, fontScale });
    router.push(withMenuOpen(returnTo));
  }

  return (
    <AppShell title={t(language, "settingsTitle")} darkHero subtitle={t(language, "settingsSubtitle")} showCart={false}>
      <section style={{ ...cardStyle(), padding: 14, paddingBottom: "max(108px, env(safe-area-inset-bottom, 0px) + 88px)" }}>
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
            <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(15) }}>{language === "en" ? "Stores" : "Tiendas"}</div>
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  fontSize: s(15),
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 800, color: MC_NAVY }}>
                  {preferredStore || t(language, "preferredStorePlaceholder")}
                </div>
                <div style={{ marginTop: 4, fontSize: s(13), color: MC_NAVY_MUTED }}>
                  {t(language, "choosePreferredStore")}
                </div>
              </div>
              <select
                value={preferredStore}
                onChange={(e) => onChooseStore(e.target.value)}
                aria-label={language === "en" ? "Store" : "Tienda"}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              >
                {filteredStoreProfiles.map((profile) => (
                  <option key={profile.id} value={profile.name}>
                    {profile.name}
                  </option>
                ))}
                <option value="__add__">{language === "en" ? "Add" : "Agregar"}</option>
              </select>
            </div>
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

      {storeEditorOpen ? (
        <div
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 144px)",
            right: 0,
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 78px)",
            left: 0,
            background: "rgba(0, 0, 0, 0.35)",
            padding: 12,
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              height: "100%",
              maxHeight: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 18,
              background: "#fff",
              border: `1px solid ${MC_NAVY_LINE}`,
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.16)",
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom: `1px solid ${MC_NAVY_LINE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: s(16), color: MC_NAVY }}>
                {language === "en" ? "Stores" : "Tiendas"}
              </div>
              <button
                type="button"
                onClick={storeEditorHasContent ? onSaveStoreProfile : closeStoreModal}
                style={{
                  border: `1px solid ${MC_NAVY_LINE}`,
                  background: "#fff",
                  color: MC_NAVY,
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontWeight: 800,
                  fontSize: s(13),
                }}
              >
                {storeEditorHasContent ? (language === "en" ? "Save" : "Guardar") : t(language, "close")}
              </button>
            </div>

            <div
              ref={storeEditorScrollRef}
              style={{
                padding: 14,
                paddingBottom: "max(28px, env(safe-area-inset-bottom, 0px) + 12px)",
                display: "grid",
                gap: 12,
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                scrollPaddingTop: 96,
                scrollPaddingBottom: 160,
              }}
            >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: s(14) }}>{t(language, "storeName")}</div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: s(13),
                        fontWeight: 800,
                        color: MC_NAVY,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={storeDraft.preferred}
                        onChange={(e) =>
                          setStoreDraft((prev) => ({ ...prev, preferred: e.target.checked }))
                        }
                      />
                      <span>{language === "en" ? "Preferred store" : "Tienda preferida"}</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={storeDraft.name}
                    onChange={(e) => setStoreDraft((prev) => ({ ...prev, name: e.target.value }))}
                    onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                  <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "streetAddress")}</div>
                  <input
                    type="text"
                    value={storeDraft.addressLine1}
                    onChange={(e) => setStoreDraft((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                  <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "addressLine2")}</div>
                  <input
                    type="text"
                    value={storeDraft.addressLine2}
                    onChange={(e) => setStoreDraft((prev) => ({ ...prev, addressLine2: e.target.value }))}
                    onFocus={(e) => keepStoreFieldVisible(e.target)}
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

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "city")}</div>
                    <input
                      type="text"
                      value={storeDraft.city}
                      onChange={(e) => setStoreDraft((prev) => ({ ...prev, city: e.target.value }))}
                      onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                    <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "stateProvince")}</div>
                    <input
                      type="text"
                      value={storeDraft.state}
                      onChange={(e) => setStoreDraft((prev) => ({ ...prev, state: e.target.value }))}
                      onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                    <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "postalCode")}</div>
                    <input
                      type="text"
                      value={storeDraft.postalCode}
                      onChange={(e) => setStoreDraft((prev) => ({ ...prev, postalCode: e.target.value }))}
                      onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                    <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "country")}</div>
                    <input
                      type="text"
                      value={storeDraft.country}
                      onChange={(e) => setStoreDraft((prev) => ({ ...prev, country: e.target.value }))}
                      onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                    <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "phone")}</div>
                    <input
                      type="text"
                      value={storeDraft.phone}
                      onChange={(e) => setStoreDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      onFocus={(e) => keepStoreFieldVisible(e.target)}
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
                    <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "notes")}</div>
                    <textarea
                      value={storeDraft.notes}
                      onChange={(e) => setStoreDraft((prev) => ({ ...prev, notes: e.target.value }))}
                      onFocus={(e) => keepStoreFieldVisible(e.target)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        boxSizing: "border-box",
                        fontSize: s(15),
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                {storeError ? (
                  <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{storeError}</div>
                ) : null}

                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    type="button"
                    onClick={onSaveStoreProfile}
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
                    {t(language, "saveStore")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStoreEditorOpen(false);
                      setStoreError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                      fontWeight: 900,
                      fontSize: s(15),
                    }}
                  >
                    {t(language, "cancel")}
                  </button>
                </div>
              </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
