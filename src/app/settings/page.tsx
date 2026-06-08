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
import { listCustomItems, listStoreProfiles, readState, removeCustomItem, saveSettings, upsertStoreProfile } from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import { useAuthSession } from "@/lib/firebase/auth-context";
import { signInUser, signOutUser, signUpUser } from "@/lib/firebase/auth-actions";
import { resolveUserBootstrap } from "@/lib/firebase/resolve-user-bootstrap";
import { saveUserData } from "@/lib/firebase/save-user-data";
import {
  createFamily,
  getFamilyByOwnerUid,
  getFamilyMembers,
  getFamilyPendingInvites,
  inviteFamilyMember,
  revokeFamilyInvite,
} from "@/lib/firebase/shared-list-actions";
import type { FamilyInviteRecord, FamilyMemberRecord, FamilyRecord } from "@/lib/firebase/shared-list-types";
import type { FontScale, ItemMaster, Language, StoreProfile } from "@/lib/mindercart/types";

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


const SAVED_LISTS_STORAGE_KEY = "mindercart.savedLists.v1";

function readSavedListsForMigration() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_LISTS_STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedListsForMigration(savedLists: unknown[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_LISTS_STORAGE_KEY, JSON.stringify(savedLists));
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function makeCustomItemKey(value: unknown) {
  return normalizeText(value).replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

function removeCustomItemFromSavedLists(item: Pick<ItemMaster, "itemKey" | "name">) {
  const savedLists = readSavedListsForMigration();
  if (!Array.isArray(savedLists) || savedLists.length === 0) return 0;

  const targetItemKey = String(item.itemKey ?? "").trim() || makeCustomItemKey(item.name);
  const targetName = normalizeText(item.name);
  let removedCount = 0;

  const nextSavedLists = savedLists.map((entry) => {
    if (!entry || typeof entry !== "object") return entry;

    const record = entry as { items?: unknown[]; updatedAt?: string };
    const currentItems = Array.isArray(record.items) ? record.items : [];

    const nextItems = currentItems.filter((rawItem) => {
      if (!rawItem || typeof rawItem !== "object") return true;

      const candidate = rawItem as { name?: unknown };
      const candidateName = String(candidate.name ?? "").trim();
      if (!candidateName) return true;

      const matches =
        makeCustomItemKey(candidateName) === targetItemKey || normalizeText(candidateName) === targetName;

      if (matches) removedCount += 1;
      return !matches;
    });

    if (nextItems.length === currentItems.length) return entry;

    return {
      ...record,
      items: nextItems,
      updatedAt: new Date().toISOString(),
    };
  });

  if (removedCount > 0) {
    writeSavedListsForMigration(nextSavedLists);
  }

  return removedCount;
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
  const [customItems, setCustomItems] = React.useState<ItemMaster[]>([]);
  const [customItemsExpanded, setCustomItemsExpanded] = React.useState(false);
  const [customItemsBusyId, setCustomItemsBusyId] = React.useState<string | null>(null);
  const [customItemsMessage, setCustomItemsMessage] = React.useState("");
  const [storeEditorOpen, setStoreEditorOpen] = React.useState(false);
  const [storeError, setStoreError] = React.useState("");
  const [storeDraft, setStoreDraft] = React.useState<StoreDraft>(emptyStoreDraft(settings.preferredStore));
  const storeEditorScrollRef = React.useRef<HTMLDivElement | null>(null);
  const session = useAuthSession();
  const [accountEmail, setAccountEmail] = React.useState("");
  const [accountPassword, setAccountPassword] = React.useState("");
  const [accountPasswordVisible, setAccountPasswordVisible] = React.useState(false);
  const [accountBusy, setAccountBusy] = React.useState(false);
  const [accountError, setAccountError] = React.useState("");
  const [migrationBusy, setMigrationBusy] = React.useState(false);
  const [migrationError, setMigrationError] = React.useState("");
  const [migrationMessage, setMigrationMessage] = React.useState("");
  const [migrationAvailable, setMigrationAvailable] = React.useState(false);
  const [migrationLocalItemsCount, setMigrationLocalItemsCount] = React.useState(0);
  const [migrationBootstrapPayload, setMigrationBootstrapPayload] = React.useState<unknown | null>(null);
  const [familyBusy, setFamilyBusy] = React.useState(false);
  const [familyError, setFamilyError] = React.useState("");
  const [familyMessage, setFamilyMessage] = React.useState("");
  const [familyRecord, setFamilyRecord] = React.useState<FamilyRecord | null>(null);
  const [familyInviteEmail, setFamilyInviteEmail] = React.useState("");
  const [familyInviteBusy, setFamilyInviteBusy] = React.useState(false);
  const [familyInviteOpen, setFamilyInviteOpen] = React.useState(false);
  const [familyMembersOpen, setFamilyMembersOpen] = React.useState(false);
  const [familyMembersBusy, setFamilyMembersBusy] = React.useState(false);
  const [familyRevokeInviteBusyId, setFamilyRevokeInviteBusyId] = React.useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMemberRecord[]>([]);
  const [familyPendingInvites, setFamilyPendingInvites] = React.useState<FamilyInviteRecord[]>([]);

  React.useEffect(() => {
    setLanguage(settings.language);
    setPreferredStore(settings.preferredStore);
    setFontScale(settings.fontScale);
    setStoreProfiles(listStoreProfiles());
    setCustomItems(listCustomItems());
    setStoreDraft(emptyStoreDraft(settings.preferredStore));
  }, [settings.language, settings.preferredStore, settings.fontScale]);


  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (session.status !== "authenticated" || !session.user?.uid) {
        setMigrationAvailable(false);
        setMigrationLocalItemsCount(0);
        setMigrationBootstrapPayload(null);
        setMigrationError("");
        setMigrationMessage("");
        return;
      }

      try {
        const resolution = await resolveUserBootstrap(session.user.uid);

        if (cancelled) return;

        setMigrationAvailable(resolution.shouldOfferInitialMigration);
        setMigrationLocalItemsCount(
          resolution.localSummary.generalListItemsCount + resolution.localSummary.activeShoppingListItemsCount
        );
        setMigrationBootstrapPayload(resolution.bootstrapPayload ?? null);
      } catch {
        if (cancelled) return;

        setMigrationAvailable(false);
        setMigrationLocalItemsCount(0);
        setMigrationBootstrapPayload(null);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [session.status, session.user?.uid]);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (session.status !== "authenticated" || !session.user?.uid) {
        setFamilyRecord(null);
        setFamilyInviteOpen(false);
        setFamilyMembersOpen(false);
        setFamilyMembers([]);
        setFamilyPendingInvites([]);
        setFamilyError("");
        setFamilyMessage("");
        return;
      }

      try {
        const family = await getFamilyByOwnerUid(session.user.uid);

        if (cancelled) return;

        setFamilyRecord(family);
        setFamilyError("");
        setFamilyInviteOpen(false);
        setFamilyMembersOpen(false);
        if (!family) {
          setFamilyMembers([]);
          setFamilyPendingInvites([]);
        }
      } catch (error) {
        if (cancelled) return;

        setFamilyRecord(null);
        setFamilyMembers([]);
        setFamilyPendingInvites([]);
        setFamilyMembersOpen(false);
        setFamilyError(
          error instanceof Error
            ? error.message
            : language === "en"
              ? "Could not load family status"
              : "No se pudo cargar el estado familiar"
        );
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [language, session.status, session.user?.uid]);

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

  function onRemoveCustomItem(item: ItemMaster) {
    const confirmed = window.confirm(
      language === "en"
        ? `Delete "${item.name}" from your custom items?`
        : `¿Eliminar "${item.name}" de tus artículos personalizados?`
    );

    if (!confirmed) return;

    setCustomItemsBusyId(item.id);
    setCustomItemsMessage("");

    try {
      removeCustomItem({ itemKey: item.itemKey, name: item.name });
      const removedFromSavedLists = removeCustomItemFromSavedLists(item);
      setCustomItems(listCustomItems());
      setCustomItemsMessage(
        removedFromSavedLists > 0
          ? language === "en"
            ? `"${item.name}" was deleted from your custom items and saved lists.`
            : `"${item.name}" se eliminó de tus artículos personalizados y de Mis Listas.`
          : language === "en"
            ? `"${item.name}" was deleted from your custom items.`
            : `"${item.name}" se eliminó de tus artículos personalizados.`
      );
    } finally {
      setCustomItemsBusyId(null);
    }
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ language, preferredStore, fontScale });
    router.push(withMenuOpen(returnTo));
  }

  async function onSignIn() {
    setAccountError("");

    try {
      setAccountBusy(true);
      await signInUser(accountEmail, accountPassword);
      setAccountPassword("");
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Sign in failed"
            : "No se pudo iniciar sesión"
      );
    } finally {
      setAccountBusy(false);
    }
  }

  async function onSignUp() {
    setAccountError("");

    try {
      setAccountBusy(true);
      await signUpUser(accountEmail, accountPassword);
      setAccountPassword("");
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Sign up failed"
            : "No se pudo crear la cuenta"
      );
    } finally {
      setAccountBusy(false);
    }
  }

  async function onSignOut() {
    setAccountError("");

    try {
      setAccountBusy(true);
      await signOutUser();
      setAccountPassword("");
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Sign out failed"
            : "No se pudo cerrar sesión"
      );
    } finally {
      setAccountBusy(false);
    }
  }


  async function onMigrateLocalData() {
    if (!session.user?.uid) return;

    setMigrationError("");
    setMigrationMessage("");

    try {
      setMigrationBusy(true);

      const currentCoreState = readState();
      const currentSavedLists = JSON.parse(JSON.stringify(readSavedListsForMigration()));

      await saveUserData({
        uid: session.user.uid,
        data: {
          coreState: currentCoreState,
        },
        bootstrapPayload: migrationBootstrapPayload as never,
      });

      await saveUserData({
        uid: session.user.uid,
        data: {
          savedLists: currentSavedLists,
        },
      });

      setMigrationAvailable(false);
      setMigrationMessage(
        language === "en" ? "Local data migrated to your account." : "Los datos locales se migraron a tu cuenta."
      );
    } catch (error) {
      setMigrationError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not migrate local data"
            : "No se pudieron migrar los datos locales"
      );
    } finally {
      setMigrationBusy(false);
    }
  }

  async function onCreateFamily() {
    if (!session.user?.uid || !session.user?.email) return;

    setFamilyError("");
    setFamilyMessage("");

    try {
      setFamilyBusy(true);

      const existingFamily = await getFamilyByOwnerUid(session.user.uid);
      if (existingFamily) {
        setFamilyRecord(existingFamily);
        setFamilyInviteOpen(false);
        setFamilyMessage(language === "en" ? "Family already created." : "La familia ya fue creada.");
        return;
      }

      const createdFamily = await createFamily({
        ownerUid: session.user.uid,
        ownerEmail: session.user.email,
        familyName: language === "en" ? "My Family" : "Mi familia",
      });

      setFamilyRecord(createdFamily);
      setFamilyInviteOpen(false);
      setFamilyMessage(language === "en" ? "Family created successfully." : "La familia se creó correctamente.");
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not create family"
            : "No se pudo crear la familia"
      );
    } finally {
      setFamilyBusy(false);
    }
  }

  async function onInviteFamilyMember() {
    if (!familyRecord?.id || !session.user?.uid) return;

    const normalizedEmail = familyInviteEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setFamilyError(language === "en" ? "Enter an email to invite" : "Escribe un correo para invitar");
      setFamilyMessage("");
      return;
    }

    setFamilyError("");
    setFamilyMessage("");

    try {
      setFamilyInviteBusy(true);

      await inviteFamilyMember({
        familyId: familyRecord.id,
        email: normalizedEmail,
        invitedByUid: session.user.uid,
        expiresAt: "",
      });

      setFamilyInviteEmail("");
      setFamilyInviteOpen(false);

      if (familyMembersOpen) {
        const [members, invites] = await Promise.all([
          getFamilyMembers(familyRecord.id),
          getFamilyPendingInvites(familyRecord.id),
        ]);
        setFamilyMembers(members);
        setFamilyPendingInvites(invites);
      }

      setFamilyMessage(
        language === "en"
          ? "Invitation created successfully."
          : "La invitación se creó correctamente."
      );
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not create invitation"
            : "No se pudo crear la invitación"
      );
    } finally {
      setFamilyInviteBusy(false);
    }
  }


  async function onToggleFamilyMembers() {
    if (!familyRecord?.id) return;

    if (familyMembersOpen) {
      setFamilyMembersOpen(false);
      return;
    }

    setFamilyError("");
    setFamilyMessage("");

    try {
      setFamilyMembersBusy(true);

      const [members, invites] = await Promise.all([
        getFamilyMembers(familyRecord.id),
        getFamilyPendingInvites(familyRecord.id),
      ]);

      setFamilyMembers(members);
      setFamilyPendingInvites(invites);
      setFamilyMembersOpen(true);
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not load family members"
            : "No se pudieron cargar los miembros de la familia"
      );
    } finally {
      setFamilyMembersBusy(false);
    }
  }

  async function onRevokeFamilyInvite(inviteId: string) {
    if (!familyRecord?.id) return;

    const confirmed = window.confirm(
      language === "en"
        ? "Do you want to revoke this invitation?"
        : "¿Quieres revocar esta invitación?"
    );

    if (!confirmed) return;

    try {
      setFamilyRevokeInviteBusyId(inviteId);
      setFamilyError("");
      setFamilyMessage("");

      await revokeFamilyInvite(familyRecord.id, inviteId);

      if (familyMembersOpen) {
        const [members, invites] = await Promise.all([
          getFamilyMembers(familyRecord.id),
          getFamilyPendingInvites(familyRecord.id),
        ]);
        setFamilyMembers(members);
        setFamilyPendingInvites(invites);
      }

      setFamilyMessage(
        language === "en"
          ? "Invitation revoked successfully."
          : "La invitación se revocó correctamente."
      );
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not revoke invitation"
            : "No se pudo revocar la invitación"
      );
    } finally {
      setFamilyRevokeInviteBusyId(null);
    }
  }


  return (
    <AppShell title={t(language, "settingsTitle")} darkHero subtitle={t(language, "settingsSubtitle")} showCart={false}>
      <section style={{ ...cardStyle(), padding: 14, paddingBottom: "max(108px, env(safe-area-inset-bottom, 0px) + 88px)" }}>
        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 14,
              borderRadius: 14,
              border: `1px solid ${MC_NAVY_LINE}`,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: s(15), color: MC_NAVY }}>
              {language === "en" ? "Account" : "Cuenta"}
            </div>

            <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
              {!session.enabled
                ? language === "en"
                  ? "Firebase auth is not available in this environment."
                  : "Firebase auth no está disponible en este entorno."
                : session.status === "loading"
                  ? language === "en"
                    ? "Checking session..."
                    : "Revisando sesión..."
                  : session.status === "authenticated"
                    ? language === "en"
                      ? "Signed in"
                      : "Sesión iniciada"
                    : language === "en"
                      ? "Not signed in"
                      : "No has iniciado sesión"}
            </div>

            {session.status === "authenticated" ? (
              <div style={{ fontSize: s(14), color: MC_NAVY }}>
                {session.user?.email || (language === "en" ? "Authenticated user" : "Usuario autenticado")}
              </div>
            ) : null}


            {session.status === "authenticated" && migrationAvailable ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 12,
                  borderRadius: 14,
                  border: `1px solid ${MC_NAVY_LINE}`,
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: s(13), color: MC_NAVY }}>
                  {language === "en"
                    ? `Local data detected on this device (${migrationLocalItemsCount} items). Do you want to migrate it to this account?`
                    : `Se detectaron datos locales en este dispositivo (${migrationLocalItemsCount} artículos). ¿Quieres migrarlos a esta cuenta?`}
                </div>

                <button
                  type="button"
                  onClick={onMigrateLocalData}
                  disabled={migrationBusy || accountBusy || !session.enabled}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY}`,
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity: migrationBusy || accountBusy || !session.enabled ? 0.6 : 1,
                  }}
                >
                  {language === "en" ? "Migrate local data" : "Migrar datos locales"}
                </button>
              </div>
            ) : null}

            {migrationError ? (
              <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{migrationError}</div>
            ) : null}

            {migrationMessage ? (
              <div style={{ fontSize: s(13), color: MC_NAVY, fontWeight: 800 }}>{migrationMessage}</div>
            ) : null}

            {session.status === "loading" ? null : session.status === "authenticated" ? (
              <button
                type="button"
                onClick={onSignOut}
                disabled={accountBusy || !session.enabled}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1px solid ${MC_NAVY_LINE}`,
                  background: "#fff",
                  color: MC_NAVY,
                  fontWeight: 900,
                  fontSize: s(15),
                  opacity: accountBusy || !session.enabled ? 0.6 : 1,
                }}
              >
                {language === "en" ? "Sign out" : "Cerrar sesión"}
              </button>
            ) : (
              <>
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder={language === "en" ? "Email" : "Correo"}
                  autoComplete="email"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(15),
                  }}
                />

                <div style={{ position: "relative" }}>
                  <input
                    type={accountPasswordVisible ? "text" : "password"}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder={language === "en" ? "Password" : "Contraseña"}
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      padding: "12px 88px 12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      boxSizing: "border-box",
                      fontSize: s(15),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setAccountPasswordVisible((current) => !current)}
                    aria-label={accountPasswordVisible ? (language === "en" ? "Hide password" : "Ocultar contraseña") : (language === "en" ? "Show password" : "Mostrar contraseña")}
                    title={accountPasswordVisible ? (language === "en" ? "Hide" : "Ocultar") : (language === "en" ? "Show" : "Mostrar")}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: 12,
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: MC_NAVY,
                      fontWeight: 800,
                      fontSize: s(13),
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {accountPasswordVisible ? (language === "en" ? "Hide" : "Ocultar") : (language === "en" ? "Show" : "Mostrar")}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  }}
                >
                  <button
                    type="button"
                    onClick={onSignIn}
                    disabled={accountBusy || !session.enabled}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY}`,
                      background: MC_NAVY,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: s(15),
                      opacity: accountBusy || !session.enabled ? 0.6 : 1,
                    }}
                  >
                    {language === "en" ? "Sign in" : "Iniciar sesión"}
                  </button>

                  <button
                    type="button"
                    onClick={onSignUp}
                    disabled={accountBusy || !session.enabled}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                      fontWeight: 900,
                      fontSize: s(15),
                      opacity: accountBusy || !session.enabled ? 0.6 : 1,
                    }}
                  >
                    {language === "en" ? "Create account" : "Crear cuenta"}
                  </button>
                </div>
              </>
            )}

            {accountError ? (
              <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{accountError}</div>
            ) : null}

            {session.error ? (
              <div style={{ fontSize: s(12), color: MC_NAVY_MUTED }}>{session.error}</div>
            ) : null}
          </div>

          {session.status === "authenticated" ? (
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                background: familyRecord ? "#fff" : "#eef4ff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: s(15), color: MC_NAVY }}>
                  {language === "en" ? "Family Plan" : "Plan Familiar"}
                </div>
              </div>

              <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                {familyRecord
                  ? language === "en"
                    ? `Owner: ${familyRecord.name}`
                    : `Titular: ${familyRecord.name}`
                  : language === "en"
                    ? "Create your Family space here. Later you will be able to invite up to 4 more members and manage Shared Lists from one place."
                    : "Crea aquí tu espacio Familiar. Después podrás invitar hasta 4 miembros más y administrar Shared Lists desde un solo lugar."}
              </div>

              {familyMessage ? (
                <div style={{ fontSize: s(13), color: "#027a48", fontWeight: 800 }}>{familyMessage}</div>
              ) : null}

              {familyError ? (
                <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{familyError}</div>
              ) : null}

              {familyRecord ? (
                familyInviteOpen ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontWeight: 900, fontSize: s(13), color: MC_NAVY }}>
                      {language === "en" ? "Member email" : "Correo del miembro"}
                    </div>
                    <input
                      type="email"
                      value={familyInviteEmail}
                      onChange={(e) => setFamilyInviteEmail(e.target.value)}
                      placeholder={language === "en" ? "name@email.com" : "nombre@correo.com"}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        fontSize: s(15),
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#eef4ff",
                      color: MC_NAVY,
                      fontSize: s(13),
                      fontWeight: 700,
                    }}
                  >
                    {language === "en"
                      ? "Invite a member to your Family plan."
                      : "Invita a un miembro a tu plan Familiar."}
                  </div>
                )
              ) : null}


              {familyRecord ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => void onToggleFamilyMembers()}
                    disabled={familyMembersBusy}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#f7faff",
                      color: MC_NAVY,
                      fontWeight: 900,
                      fontSize: s(15),
                      opacity: familyMembersBusy ? 0.6 : 1,
                    }}
                  >
                    {familyMembersBusy
                      ? language === "en"
                        ? "Loading group..."
                        : "Cargando grupo..."
                      : familyMembersOpen
                        ? language === "en"
                          ? "Hide family group"
                          : "Ocultar grupo familiar"
                        : language === "en"
                          ? "View family group"
                          : "Ver grupo familiar"}
                  </button>

                  {familyMembersOpen ? (
                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        background: "#f7faff",
                      }}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 900, fontSize: s(13), color: MC_NAVY }}>
                          {language === "en" ? "Members" : "Miembros"}
                        </div>

                        {familyMembers.length ? (
                          familyMembers.map((member) => (
                            <div
                              key={member.uid}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "center",
                                padding: "10px 12px",
                                borderRadius: 12,
                                background: "#fff",
                                border: `1px solid ${MC_NAVY_LINE}`,
                              }}
                            >
                              <div style={{ display: "grid", gap: 2 }}>
                                <div style={{ fontWeight: 800, fontSize: s(13), color: MC_NAVY }}>
                                  {member.email}
                                </div>
                                <div style={{ fontSize: s(12), color: MC_NAVY_MUTED }}>
                                  {member.role === "owner"
                                    ? language === "en"
                                      ? "Owner"
                                      : "Titular"
                                    : language === "en"
                                      ? "Member"
                                      : "Miembro"}
                                </div>
                              </div>

                              <div
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 999,
                                  background: "#eef4ff",
                                  color: MC_NAVY,
                                  fontSize: s(12),
                                  fontWeight: 800,
                                }}
                              >
                                {member.status === "active"
                                  ? language === "en"
                                    ? "Active"
                                    : "Activo"
                                  : language === "en"
                                    ? "Invited"
                                    : "Invitado"}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                            {language === "en" ? "No family members yet." : "Todavía no hay miembros en la familia."}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 900, fontSize: s(13), color: MC_NAVY }}>
                          {language === "en" ? "Pending invites" : "Invitaciones pendientes"}
                        </div>

                        {familyPendingInvites.length ? (
                          familyPendingInvites.map((invite) => (
                            <div
                              key={invite.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "center",
                                padding: "10px 12px",
                                borderRadius: 12,
                                background: "#fff",
                                border: `1px solid ${MC_NAVY_LINE}`,
                              }}
                            >
                              <div style={{ display: "grid", gap: 2 }}>
                                <div style={{ fontWeight: 800, fontSize: s(13), color: MC_NAVY }}>
                                  {invite.email}
                                </div>
                                <div style={{ fontSize: s(12), color: MC_NAVY_MUTED }}>
                                  {language === "en" ? "Pending acceptance" : "Pendiente de aceptar"}
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => void onRevokeFamilyInvite(invite.id)}
                                  disabled={familyRevokeInviteBusyId === invite.id}
                                  style={{
                                    border: `1px solid ${MC_NAVY_LINE}`,
                                    background: "#fff",
                                    color: MC_NAVY,
                                    borderRadius: 999,
                                    padding: "6px 10px",
                                    fontSize: s(12),
                                    fontWeight: 800,
                                    cursor: familyRevokeInviteBusyId === invite.id ? "default" : "pointer",
                                    opacity: familyRevokeInviteBusyId === invite.id ? 0.6 : 1,
                                  }}
                                >
                                  {familyRevokeInviteBusyId === invite.id
                                    ? language === "en"
                                      ? "Revoking..."
                                      : "Revocando..."
                                    : language === "en"
                                      ? "Revoke"
                                      : "Revocar"}
                                </button>

                                <div
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: "#fff7ed",
                                    color: "#b54708",
                                    fontSize: s(12),
                                    fontWeight: 800,
                                  }}
                                >
                                  {language === "en" ? "Pending" : "Pendiente"}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                            {language === "en"
                              ? "There are no pending invites."
                              : "No hay invitaciones pendientes."}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                <button
                  type="button"
                  onClick={() => void onCreateFamily()}
                  disabled={familyBusy || !!familyRecord || !session.enabled}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid transparent",
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity: familyBusy || !!familyRecord || !session.enabled ? 0.6 : 1,
                  }}
                >
                  {familyBusy
                    ? language === "en"
                      ? "Creating..."
                      : "Creando..."
                    : language === "en"
                      ? "Create family"
                      : "Crear familia"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!familyRecord) return;
                    if (!familyInviteOpen) {
                      setFamilyInviteOpen(true);
                      setFamilyError("");
                      setFamilyMessage("");
                      return;
                    }
                    void onInviteFamilyMember();
                  }}
                  disabled={
                    !familyRecord || familyInviteBusy || (familyInviteOpen && !familyInviteEmail.trim())
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    background: "#fff",
                    color: MC_NAVY,
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity:
                      !familyRecord || familyInviteBusy || (familyInviteOpen && !familyInviteEmail.trim())
                        ? 0.6
                        : 1,
                  }}
                >
                  {familyInviteBusy
                    ? language === "en"
                      ? "Inviting..."
                      : "Invitando..."
                    : !familyInviteOpen
                      ? language === "en"
                        ? "Invite member"
                        : "Invitar miembro"
                      : language === "en"
                        ? "Send invite"
                        : "Enviar invitación"}
                </button>
              </div>
            </div>
          ) : null}

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
            <button
              type="button"
              onClick={() => setCustomItemsExpanded((current) => !current)}
              aria-expanded={customItemsExpanded}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                background: "#fff",
                color: MC_NAVY,
                fontSize: s(15),
                fontWeight: 900,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>{language === "en" ? "Custom items" : "Artículos personalizados"}</span>
              <span
                aria-hidden="true"
                style={{
                  fontSize: s(13),
                  color: MC_NAVY_MUTED,
                  whiteSpace: "nowrap",
                }}
              >
                {customItemsExpanded
                  ? language === "en"
                    ? "Hide"
                    : "Ocultar"
                  : language === "en"
                    ? "View"
                    : "Ver"}
              </span>
            </button>

            {customItemsExpanded ? (
              <>
                <div
                  style={{
                    marginTop: 8,
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  {customItems.length === 0 ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        fontSize: s(14),
                        color: MC_NAVY_MUTED,
                      }}
                    >
                      {language === "en"
                        ? "You have no custom items."
                        : "No tienes artículos personalizados."}
                    </div>
                  ) : (
                    customItems.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) auto",
                          gap: 12,
                          alignItems: "center",
                          padding: "12px 14px",
                          borderTop: index === 0 ? "none" : `1px solid ${MC_NAVY_LINE}`,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              color: MC_NAVY,
                              fontSize: s(15),
                              wordBreak: "break-word",
                            }}
                          >
                            {item.name}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveCustomItem(item)}
                          disabled={customItemsBusyId === item.id}
                          style={{
                            border: `1px solid ${MC_NAVY_LINE}`,
                            background: "#fff",
                            color: MC_NAVY,
                            borderRadius: 12,
                            padding: "8px 12px",
                            fontWeight: 800,
                            fontSize: s(13),
                            cursor: customItemsBusyId === item.id ? "default" : "pointer",
                            opacity: customItemsBusyId === item.id ? 0.7 : 1,
                          }}
                        >
                          {customItemsBusyId === item.id
                            ? language === "en"
                              ? "Deleting..."
                              : "Eliminando..."
                            : language === "en"
                              ? "Delete"
                              : "Eliminar"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {customItemsMessage ? (
                  <div style={{ marginTop: 6, fontSize: s(13), color: MC_NAVY_MUTED }}>{customItemsMessage}</div>
                ) : null}
              </>
            ) : null}
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