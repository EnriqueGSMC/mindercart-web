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
  };
}

function draftFromProfile(profile: StoreProfile): StoreDraft {
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
  const [storePickerOpen, setStorePickerOpen] = React.useState(false);
  const [storeEditorOpen, setStoreEditorOpen] = React.useState(false);
  const [storeSearch, setStoreSearch] = React.useState("");
  const [storeError, setStoreError] = React.useState("");
  const [storeDraft, setStoreDraft] = React.useState<StoreDraft>(emptyStoreDraft(settings.preferredStore));

  React.useEffect(() => {
    setLanguage(settings.language);
    setPreferredStore(settings.preferredStore);
    setFontScale(settings.fontScale);
    setStoreProfiles(listStoreProfiles());
    setStoreDraft(emptyStoreDraft(settings.preferredStore));
  }, [settings.language, settings.preferredStore, settings.fontScale]);

  const filteredStoreProfiles = React.useMemo(() => {
    const query = storeSearch.trim().toLowerCase();
    if (!query) return storeProfiles;

    return storeProfiles.filter((profile) =>
      [
        profile.name,
        profile.addressLine1,
        profile.addressLine2,
        profile.city,
        profile.state,
        profile.postalCode,
        profile.country,
        profile.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [storeProfiles, storeSearch]);

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

  function openStorePicker() {
    setStoreProfiles(listStoreProfiles());
    setStoreSearch("");
    setStoreError("");
    setStorePickerOpen(true);
    setStoreEditorOpen(false);
  }

  function openNewStore() {
    setStoreDraft(emptyStoreDraft(preferredStore));
    setStoreError("");
    setStoreEditorOpen(true);
  }

  function openExistingStore(profile: StoreProfile) {
    setStoreDraft(draftFromProfile(profile));
    setStoreError("");
    setStoreEditorOpen(true);
  }

  function closeStoreModal() {
    setStorePickerOpen(false);
    setStoreEditorOpen(false);
    setStoreSearch("");
    setStoreError("");
  }

  function onSaveStoreProfile() {
    if (!storeDraft.name.trim()) {
      setStoreError(t(language, "storeNameRequired"));
      return;
    }

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
            <button
              type="button"
              onClick={openStorePicker}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                background: "#fff",
                boxSizing: "border-box",
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
            </button>
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

      {storePickerOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.35)",
            display: "grid",
            placeItems: "center",
            padding: 12,
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "78vh",
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
                {storeEditorOpen ? t(language, "editStore") : t(language, "preferredStore")}
              </div>
              <button
                type="button"
                onClick={closeStoreModal}
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
                {t(language, "close")}
              </button>
            </div>

            {!storeEditorOpen ? (
              <div style={{ padding: 14, display: "grid", gap: 12, maxHeight: "calc(78vh - 76px)", overflowY: "auto" }}>
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder={t(language, "searchStore")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(15),
                  }}
                />

                <div style={{ display: "grid", gap: 10 }}>
                  {filteredStoreProfiles.length ? (
                    filteredStoreProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => openExistingStore(profile)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 14,
                          border: `1px solid ${MC_NAVY_LINE}`,
                          background: "#fff",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ fontWeight: 900, fontSize: s(15), color: MC_NAVY }}>{profile.name}</div>
                        <div style={{ marginTop: 4, fontSize: s(13), color: MC_NAVY_MUTED }}>
                          {[profile.addressLine1, profile.city, profile.phone].filter(Boolean).join(" • ") || " "}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t(language, "noStores")}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openNewStore}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY}`,
                    background: "#fff",
                    color: MC_NAVY,
                    fontWeight: 900,
                    fontSize: s(15),
                  }}
                >
                  + {t(language, "addStore")}
                </button>
              </div>
            ) : (
              <div style={{ padding: 14, display: "grid", gap: 12, maxHeight: "calc(78vh - 76px)", overflowY: "auto" }}>
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(14) }}>{t(language, "storeName")}</div>
                  <input
                    type="text"
                    value={storeDraft.name}
                    onChange={(e) => setStoreDraft((prev) => ({ ...prev, name: e.target.value }))}
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
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
