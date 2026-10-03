"use client";

import React from "react";
import { detectVoiceDevicePlatform, type VoiceDevicePlatform } from "@/lib/voice/device-platform";
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
import * as mcStorage from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import { useAuthSession } from "@/lib/firebase/auth-context";
import { resetPasswordForUser, signInUser, signOutUser, signUpUser } from "@/lib/firebase/auth-actions";
import { resolveUserBootstrap } from "@/lib/firebase/resolve-user-bootstrap";
import { saveUserData } from "@/lib/firebase/save-user-data";
import {
  acceptFamilyInvite,
  createFamily,
  getFamilyById,
  getFamilyByOwnerUid,
  getFamilyMembers,
  getFamilyPendingInvites,
  getPendingFamilyInviteForEmail,
  getUserFamilyMembership,
  inviteFamilyMember,
  removeFamilyMember,
  revokeFamilyInvite,
} from "@/lib/firebase/shared-list-actions";
import { withOperationTimeout } from "@/lib/firebase/operation-timeout";
import type { FamilyInviteRecord, FamilyMemberRecord, FamilyRecord } from "@/lib/firebase/shared-list-types";
import { SEED_GENERAL_ITEMS } from "@/lib/mindercart/seed-items";
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

type PendingFamilyInviteMatch = {
  familyId: string;
  familyName: string;
  invite: FamilyInviteRecord;
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

function getSeedItemKey(seedItem: unknown) {
  if (!seedItem || typeof seedItem !== "object") return "";

  const record = seedItem as Record<string, unknown>;
  return typeof record.itemKey === "string" ? record.itemKey.trim() : "";
}

function getSeedItemNames(seedItem: unknown) {
  if (!seedItem || typeof seedItem !== "object") return [] as string[];

  const record = seedItem as Record<string, unknown>;
  const label = record.label && typeof record.label === "object" ? (record.label as Record<string, unknown>) : null;

  return [
    record.name,
    record.nameEs,
    record.nameEn,
    typeof record.label === "string" ? record.label : "",
    label?.default,
    label?.es,
    label?.en,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

const SEED_ITEM_KEYS = new Set(
  SEED_GENERAL_ITEMS.map((item) => getSeedItemKey(item)).filter(Boolean)
);

const SEED_ITEM_NAMES = new Set(
  SEED_GENERAL_ITEMS.flatMap((item) => getSeedItemNames(item))
    .map((value) => normalizeText(value))
    .filter(Boolean)
);

function matchesCustomItemTarget(
  candidate: Pick<ItemMaster, "itemKey" | "name"> | { itemKey?: unknown; name?: unknown },
  target: Pick<ItemMaster, "itemKey" | "name">
) {
  const candidateItemKey = String(candidate.itemKey ?? "").trim();
  const candidateName = normalizeText(candidate.name);
  const targetItemKey = String(target.itemKey ?? "").trim() || makeCustomItemKey(target.name);
  const targetName = normalizeText(target.name);

  if (candidateItemKey && targetItemKey && candidateItemKey === targetItemKey) return true;
  if (candidateName && targetName && candidateName === targetName) return true;
  if (candidateItemKey && targetName && candidateItemKey === makeCustomItemKey(targetName)) return true;
  if (candidateName && targetItemKey && makeCustomItemKey(candidateName) === targetItemKey) return true;

  return false;
}

function isSeedItemRecord(record: Pick<ItemMaster, "itemKey" | "name"> | { itemKey?: unknown; name?: unknown }) {
  const itemKey = String(record.itemKey ?? "").trim();
  const normalizedName = normalizeText(record.name);

  if (itemKey && SEED_ITEM_KEYS.has(itemKey)) return true;
  if (normalizedName && SEED_ITEM_NAMES.has(normalizedName)) return true;

  return false;
}

function normalizeCustomItemsCandidate(candidate: unknown) {
  if (!Array.isArray(candidate)) return [] as ItemMaster[];

  return candidate.filter((entry): entry is ItemMaster => {
    if (!entry || typeof entry !== "object") return false;

    const record = entry as Record<string, unknown>;
    if (typeof record.name !== "string" || !record.name.trim()) return false;

    return !isSeedItemRecord({
      itemKey: record.itemKey,
      name: record.name,
    });
  });
}

function sortCustomItemsAlphabetically(items: ItemMaster[]) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
      numeric: true,
    })
  );
}

function listCustomItemsCompat() {
  const storageWithCustomItems = mcStorage as typeof mcStorage & {
    listCustomItems?: () => ItemMaster[];
  };

  if (typeof storageWithCustomItems.listCustomItems === "function") {
    try {
      const result = storageWithCustomItems.listCustomItems();
      return Array.isArray(result) ? sortCustomItemsAlphabetically(result) : [];
    } catch {
      return [];
    }
  }

  const state = mcStorage.readState();
  return sortCustomItemsAlphabetically(normalizeCustomItemsCandidate(state.itemsMaster));
}

function removeCustomItemCompat(item: Pick<ItemMaster, "itemKey" | "name">) {
  const storageWithCustomItems = mcStorage as typeof mcStorage & {
    removeCustomItem?: (payload: { itemKey: string; name: string }) => void;
  };

  if (typeof storageWithCustomItems.removeCustomItem === "function") {
    storageWithCustomItems.removeCustomItem({
      itemKey: item.itemKey,
      name: item.name,
    });

    return true;
  }

  const state = mcStorage.readState();
  const nextItemsMaster = state.itemsMaster.filter((entry) => !matchesCustomItemTarget(entry, item));

  if (nextItemsMaster.length === state.itemsMaster.length) return false;

  mcStorage.writeState({
    ...state,
    itemsMaster: nextItemsMaster,
    generalListItems: state.generalListItems.filter((entry) => !matchesCustomItemTarget(entry, item)),
    activeShoppingListItems: state.activeShoppingListItems.filter((entry) => !matchesCustomItemTarget(entry, item)),
  });

  return true;
}


export default function SettingsPage() {
  const [voiceDevice, setVoiceDevice] = React.useState<VoiceDevicePlatform>("unknown");
  const [testingShortcutAvailable, setTestingShortcutAvailable] = React.useState(false);
  React.useEffect(() => {
    setVoiceDevice(detectVoiceDevicePlatform(navigator.userAgent, navigator.maxTouchPoints));
    // This shared shortcut has a fixed testing endpoint. Never offer it on production.
    setTestingShortcutAvailable(window.location.hostname === "mindercart-web-git-testing-enrique-sanchezs-projects.vercel.app");
  }, []);
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
  const [accountMessage, setAccountMessage] = React.useState("");
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
  const [familyRole, setFamilyRole] = React.useState<"owner" | "member" | null>(null);
  const [familyInviteEmail, setFamilyInviteEmail] = React.useState("");
  const [familyInviteBusy, setFamilyInviteBusy] = React.useState(false);
  const [familyInviteOpen, setFamilyInviteOpen] = React.useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = React.useState(false);
  const [createGroupNameDraft, setCreateGroupNameDraft] = React.useState("");
  const [createGroupNameError, setCreateGroupNameError] = React.useState("");
  const [familyMembersOpen, setFamilyMembersOpen] = React.useState(false);
  const [familyMembersBusy, setFamilyMembersBusy] = React.useState(false);
  const [familyRevokeInviteBusyId, setFamilyRevokeInviteBusyId] = React.useState<string | null>(null);
  const [familyRemoveMemberBusyId, setFamilyRemoveMemberBusyId] = React.useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMemberRecord[]>([]);
  const [familyPendingInvites, setFamilyPendingInvites] = React.useState<FamilyInviteRecord[]>([]);
  const [pendingFamilyInvite, setPendingFamilyInvite] = React.useState<PendingFamilyInviteMatch | null>(null);
  const [familyAcceptInviteBusy, setFamilyAcceptInviteBusy] = React.useState(false);
  const [familyStatusState, setFamilyStatusState] = React.useState<"loading" | "ready" | "error">("loading");
  const [familyStatusRetryToken, setFamilyStatusRetryToken] = React.useState(0);
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);
  const [voiceToken, setVoiceToken] = React.useState("");
  const [voiceBusy, setVoiceBusy] = React.useState(false);
  const [voiceMessage, setVoiceMessage] = React.useState("");
  const [voiceError, setVoiceError] = React.useState("");

  const refreshSettingsDerivedState = React.useCallback(() => {
    setStoreProfiles(mcStorage.listStoreProfiles());
    setCustomItems(listCustomItemsCompat());
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;

    setLanguage(settings.language);
    setPreferredStore(settings.preferredStore);
    setFontScale(settings.fontScale);
    refreshSettingsDerivedState();
    setStoreDraft(emptyStoreDraft(settings.preferredStore));
  }, [hydrated, refreshSettingsDerivedState, settings.language, settings.preferredStore, settings.fontScale]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadVoiceStatus() {
      if (session.status !== "authenticated" || !session.user) {
        setVoiceEnabled(false);
        setVoiceToken("");
        return;
      }

      try {
        const idToken = await session.user.getIdToken();
        const response = await fetch("/api/voice/access", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!response.ok) return;
        const result = await response.json() as { enabled?: boolean };
        if (!cancelled) setVoiceEnabled(result.enabled === true);
      } catch {
        // Voice access is optional; do not interrupt the rest of Settings.
      }
    }

    void loadVoiceStatus();
    return () => { cancelled = true; };
  }, [session.status, session.user]);

  React.useEffect(() => {
    if (!hydrated) return;

    refreshSettingsDerivedState();

    const retryTimers = [250, 900, 1800].map((delay) =>
      window.setTimeout(() => {
        refreshSettingsDerivedState();
      }, delay)
    );

    const onWindowFocus = () => {
      refreshSettingsDerivedState();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSettingsDerivedState();
      }
    };

    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      retryTimers.forEach((timerId) => window.clearTimeout(timerId));
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hydrated, refreshSettingsDerivedState, session.status, session.user?.email, session.user?.uid]);


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
        setFamilyRole(null);
        setFamilyInviteOpen(false);
        setFamilyMembersOpen(false);
        setFamilyMembers([]);
        setFamilyPendingInvites([]);
        setPendingFamilyInvite(null);
        setFamilyAcceptInviteBusy(false);
        setFamilyError("");
        setFamilyMessage("");
        setFamilyStatusState("loading");
        return;
      }

      setFamilyStatusState("loading");
      setFamilyError("");

      const retryDelays = [0];

      for (const delay of retryDelays) {
        if (delay) {
          await new Promise((resolve) => window.setTimeout(resolve, delay));
        }

        if (cancelled) return;

        try {
          const ownerFamily = await withOperationTimeout(
            getFamilyByOwnerUid(session.user.uid),
            6000,
            "Check owned group",
          );

          if (cancelled) return;

          if (ownerFamily) {
            setFamilyRecord(ownerFamily);
            setFamilyRole("owner");
            setPendingFamilyInvite(null);
            setFamilyError("");
            setFamilyInviteOpen(false);
            setFamilyMembersOpen(false);
            setFamilyMembers([]);
            setFamilyPendingInvites([]);
            setFamilyStatusState("ready");
            return;
          }

          const membership = await withOperationTimeout(
            getUserFamilyMembership(session.user.uid),
            6000,
            "Check group membership",
          ).catch(() => null);

          if (cancelled) return;

          if (membership?.status === "active" && membership.familyId) {
            const memberFamily = await withOperationTimeout(
              getFamilyById(membership.familyId),
              6000,
              "Load member group",
            ).catch(() => null);

            if (cancelled) return;

            if (memberFamily) {
              setFamilyRecord(memberFamily);
              setFamilyRole(membership.role === "owner" ? "owner" : "member");
              setPendingFamilyInvite(null);
              setFamilyError("");
              setFamilyInviteOpen(false);
              setFamilyMembersOpen(false);
              setFamilyMembers([]);
              setFamilyPendingInvites([]);
              setFamilyStatusState("ready");
              return;
            }
          }

          let inviteMatch: PendingFamilyInviteMatch | null = null;

          if (session.user.email) {
            const pendingInvite = await withOperationTimeout(
              getPendingFamilyInviteForEmail(session.user.email),
              6000,
              "Check pending group invitation",
            );

            if (cancelled) return;

            if (pendingInvite) {
              inviteMatch = pendingInvite as PendingFamilyInviteMatch;
            }
          }

          setFamilyRecord(null);
          setFamilyRole(null);
          setPendingFamilyInvite(inviteMatch);
          setFamilyError("");
          setFamilyInviteOpen(false);
          setFamilyMembersOpen(false);
          setFamilyMembers([]);
          setFamilyPendingInvites([]);
          setFamilyStatusState("ready");
          return;
        } catch {
          // The card exposes an explicit retry action below.
        }
      }

      if (cancelled) return;

      setFamilyRecord(null);
      setFamilyRole(null);
      setPendingFamilyInvite(null);
      setFamilyMembers([]);
      setFamilyPendingInvites([]);
      setFamilyMembersOpen(false);
      setFamilyInviteOpen(false);
      setFamilyStatusState("error");
      setFamilyError(
        language === "en"
          ? "We couldn't verify your group right now. Try again in a moment."
          : "No pudimos verificar tu grupo en este momento. Intenta de nuevo en un momento."
      );
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [familyStatusRetryToken, language, session.status, session.user?.email, session.user?.uid]);


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
  const isFamilyOwner = familyRole === "owner";
  const isFamilyStatusLoading = familyStatusState === "loading";
  const isFamilyStatusError = familyStatusState === "error";
  const showCreateGroupAction = familyStatusState === "ready" && !familyRecord && !pendingFamilyInvite;
  const familyCardTitle = isFamilyStatusLoading && !familyRecord && !pendingFamilyInvite
    ? language === "en"
      ? "Group"
      : "Grupo"
    : isFamilyStatusError && !familyRecord && !pendingFamilyInvite
      ? language === "en"
        ? "Group"
        : "Grupo"
      : familyRecord
        ? language === "en"
          ? `Group: ${familyRecord.name}`
          : `Grupo: ${familyRecord.name}`
        : pendingFamilyInvite
          ? language === "en"
            ? "Group invitation"
            : "Invitación a grupo"
          : language === "en"
            ? "Group plan"
            : "Plan grupal";
  const familyCardDescription = isFamilyStatusLoading && !familyRecord && !pendingFamilyInvite
    ? language === "en"
      ? "Checking your group..."
      : "Verificando tu grupo..."
    : isFamilyStatusError && !familyRecord && !pendingFamilyInvite
      ? language === "en"
        ? "We couldn't verify your group yet. Try again in a moment."
        : "Todavía no pudimos verificar tu grupo. Intenta de nuevo en un momento."
      : familyRecord
        ? isFamilyOwner
          ? language === "en"
            ? "You manage this group."
            : "Administras este grupo."
          : language === "en"
            ? "You belong to this group."
            : "Perteneces a este grupo."
        : pendingFamilyInvite
          ? language === "en"
            ? `You have a pending invitation to join ${pendingFamilyInvite.familyName}.`
            : `Tienes una invitación pendiente para unirte a ${pendingFamilyInvite.familyName}.`
          : language === "en"
            ? "Create your shared group here. You can invite up to 4 more members and manage lists together."
            : "Crea aquí tu grupo compartido. Podrás invitar hasta 4 integrantes más y administrar listas entre todos.";

  if (!hydrated) {
    return (
      <AppShell title={t("es", "settingsTitle")} darkHero subtitle={t("es", "settingsSubtitle")} showCart={false}>
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: 14, color: MC_NAVY_MUTED }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  async function onAcceptFamilyInvite() {
    if (!pendingFamilyInvite || !session.user?.uid || !session.user?.email) return;

    setFamilyError("");
    setFamilyMessage("");

    try {
      setFamilyAcceptInviteBusy(true);

      await acceptFamilyInvite({
        familyId: pendingFamilyInvite.familyId,
        inviteId: pendingFamilyInvite.invite.id,
        uid: session.user.uid,
        email: session.user.email,
      });

      setPendingFamilyInvite(null);

      const [membership, members, invites] = await Promise.all([
        getUserFamilyMembership(session.user.uid).catch(() => null),
        getFamilyMembers(pendingFamilyInvite.familyId).catch(() => []),
        getFamilyPendingInvites(pendingFamilyInvite.familyId).catch(() => []),
      ]);

      const refreshedFamily =
        membership?.status === "active" && membership.familyId
          ? await getFamilyById(membership.familyId).catch(() => null)
          : null;

      setFamilyRecord(refreshedFamily ?? null);
      setFamilyRole(membership?.role === "owner" ? "owner" : membership ? "member" : null);
      setFamilyMembers(members);
      setFamilyPendingInvites(invites);
      setFamilyMembersOpen(!!refreshedFamily);
      setFamilyStatusState("ready");
      refreshSettingsDerivedState();

      setFamilyMessage(
        language === "en"
          ? "Invitation accepted successfully."
          : "La invitación se aceptó correctamente."
      );
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not accept invitation"
            : "No se pudo aceptar la invitación"
      );
    } finally {
      setFamilyAcceptInviteBusy(false);
    }
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
    persistPreferences({ preferredStore: value });
    setStoreError("");
    setStoreEditorOpen(false);
  }

  function closeStoreModal() {
    setStoreEditorOpen(false);
    setStoreError("");
  }

  function persistPreferences(next: Partial<{ language: Language; preferredStore: string; fontScale: FontScale }>) {
    mcStorage.saveSettings({
      language: next.language ?? language,
      preferredStore: next.preferredStore ?? preferredStore,
      fontScale: next.fontScale ?? fontScale,
    });
  }

  function onSaveStoreProfile() {
    if (!storeDraft.name.trim()) {
      setStoreError(t(language, "storeNameRequired"));
      return;
    }

    const confirmed = window.confirm(language === "en" ? "Save store?" : "¿Guardar tienda?");

    if (!confirmed) return;

    const next = mcStorage.upsertStoreProfile({
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
      const removedFromCoreState = removeCustomItemCompat({ itemKey: item.itemKey, name: item.name });
      const removedFromSavedLists = removeCustomItemFromSavedLists(item);
      setCustomItems(listCustomItemsCompat());
      setCustomItemsMessage(
        removedFromCoreState && removedFromSavedLists > 0
          ? language === "en"
            ? `"${item.name}" was deleted from your custom items and saved lists.`
            : `"${item.name}" se eliminó de tus artículos personalizados y de Mis Listas.`
          : removedFromCoreState
            ? language === "en"
              ? `"${item.name}" was deleted from your custom items.`
              : `"${item.name}" se eliminó de tus artículos personalizados.`
            : removedFromSavedLists > 0
              ? language === "en"
                ? `"${item.name}" was deleted from your saved lists.`
                : `"${item.name}" se eliminó de Mis Listas.`
              : language === "en"
                ? `Custom item deletion is not available in this build.`
                : `La eliminación de artículos personalizados no está disponible en esta compilación.`
      );
    } finally {
      setCustomItemsBusyId(null);
    }
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    persistPreferences({ language, preferredStore, fontScale });
    router.push(withMenuOpen(returnTo));
  }

  async function onSignIn() {
    setAccountError("");
    setAccountMessage("");

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
    setAccountMessage("");

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

  async function onResetPassword() {
    setAccountError("");
    setAccountMessage("");

    const email = accountEmail.trim();

    if (!email) {
      setAccountError(language === "en" ? "Enter your email to reset your password" : "Ingresa tu correo para recuperar tu contraseña");
      return;
    }

    try {
      setAccountBusy(true);
      await resetPasswordForUser(email);
      setAccountMessage(
        language === "en"
          ? "We sent you an email to reset your password"
          : "Te enviamos un correo para restablecer tu contraseña"
      );
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "We could not send the reset email"
            : "No se pudo enviar el correo de recuperación"
      );
    } finally {
      setAccountBusy(false);
    }
  }

  async function onSignOut() {
    setAccountError("");
    setAccountMessage("");

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

      const currentCoreState = mcStorage.readState();
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
      refreshSettingsDerivedState();
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

    const trimmedCreateGroupName = createGroupNameDraft.trim();

    if (!trimmedCreateGroupName) {
      setCreateGroupNameError(
        language === "en" ? "Enter a name for your group." : "Escribe un nombre para tu grupo."
      );
      return;
    }

    setCreateGroupNameError("");
    setFamilyError("");
    setFamilyMessage("");

    try {
      setFamilyBusy(true);

      const existingFamily = await getFamilyByOwnerUid(session.user.uid);
      if (existingFamily) {
        setFamilyRecord(existingFamily);
        setFamilyRole("owner");
        setFamilyInviteOpen(false);
        setCreateGroupModalOpen(false);
        setFamilyStatusState("ready");
        setFamilyMessage(language === "en" ? "Group already created." : "El grupo ya fue creado.");
        return;
      }

      const createdFamily = await createFamily({
        ownerUid: session.user.uid,
        ownerEmail: session.user.email,
        familyName: trimmedCreateGroupName,
      });

      setFamilyRecord(createdFamily);
      setFamilyRole("owner");
      setFamilyInviteOpen(false);
      setCreateGroupModalOpen(false);
      setFamilyStatusState("ready");
      setCreateGroupNameDraft("");
      setFamilyMessage(language === "en" ? "Your group was created successfully." : "Tu grupo se creó correctamente.");
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not create group"
            : "No se pudo crear el grupo"
      );
    } finally {
      setFamilyBusy(false);
    }
  }

  async function onInviteFamilyMember() {
    if (!familyRecord?.id || !session.user?.uid || !isFamilyOwner) return;

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
            ? "Could not load group members"
            : "No se pudieron cargar los integrantes del grupo"
      );
    } finally {
      setFamilyMembersBusy(false);
    }
  }

  async function onRevokeFamilyInvite(inviteId: string) {
    if (!familyRecord?.id || !isFamilyOwner) return;

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

  async function onRemoveFamilyMember(memberUid: string) {
    if (!familyRecord?.id || !isFamilyOwner) return;

    const confirmed = window.confirm(
      language === "en"
        ? "Do you want to remove this member from the group?"
        : "¿Quieres quitar a este integrante del grupo?"
    );

    if (!confirmed) return;

    try {
      setFamilyRemoveMemberBusyId(memberUid);
      setFamilyError("");
      setFamilyMessage("");

      await removeFamilyMember(familyRecord.id, memberUid);

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
          ? "Group member removed successfully."
          : "El miembro se quitó correctamente."
      );
    } catch (error) {
      setFamilyError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not remove group member"
            : "No se pudo quitar al integrante del grupo"
      );
    } finally {
      setFamilyRemoveMemberBusyId(null);
    }
  }

  async function onEnableVoiceAccess() {
    if (!session.user) return;

    try {
      setVoiceBusy(true);
      setVoiceError("");
      setVoiceMessage("");
      const idToken = await session.user.getIdToken();
      const response = await fetch("/api/voice/access", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await response.json() as { token?: string; error?: string; diagnostic?: string };
      if (!response.ok || !result.token) throw new Error(result.error || "Voice access error");

      setVoiceEnabled(true);
      setVoiceToken(result.token);
      setVoiceMessage(
        language === "en"
          ? "Siri access is ready. Copy the key now; it is only shown once."
          : "El acceso para Siri está listo. Copia la clave ahora; solo se muestra una vez."
      );
    } catch (error) {
      setVoiceError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Could not enable Siri access."
            : "No se pudo activar el acceso para Siri."
      );
    } finally {
      setVoiceBusy(false);
    }
  }

  async function onRevokeVoiceAccess() {
    if (!session.user) return;

    try {
      setVoiceBusy(true);
      setVoiceError("");
      const idToken = await session.user.getIdToken();
      const response = await fetch("/api/voice/access", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error("Voice access error");
      setVoiceEnabled(false);
      setVoiceToken("");
      setVoiceMessage(language === "en" ? "Siri access was revoked." : "El acceso para Siri fue revocado.");
    } catch {
      setVoiceError(language === "en" ? "Could not revoke Siri access." : "No se pudo revocar el acceso para Siri.");
    } finally {
      setVoiceBusy(false);
    }
  }

  async function copyVoiceValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setVoiceMessage(language === "en" ? `${label} copied.` : `${label} copiada.`);
    } catch {
      setVoiceError(language === "en" ? "Could not copy it." : "No se pudo copiar.");
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

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={onResetPassword}
                    disabled={accountBusy || !session.enabled}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: MC_NAVY,
                      fontWeight: 800,
                      fontSize: s(13),
                      padding: 0,
                      cursor: accountBusy || !session.enabled ? "default" : "pointer",
                      opacity: accountBusy || !session.enabled ? 0.6 : 1,
                    }}
                  >
                    {language === "en" ? "Reset password" : "Recuperar contraseña"}
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

            {accountMessage ? (
              <div style={{ fontSize: s(13), color: MC_NAVY, fontWeight: 800 }}>{accountMessage}</div>
            ) : null}

            {session.error ? (
              <div style={{ fontSize: s(12), color: MC_NAVY_MUTED }} role="status">
                {session.error === "auth/check-delayed"
                  ? (language === "en"
                    ? "Checking your session is taking longer than expected. You can retry without signing out."
                    : "La comprobación de tu sesión está tardando más de lo esperado. Puedes reintentar sin cerrar sesión.")
                  : (language === "en"
                    ? "We could not verify your session. Check your connection and retry."
                    : "No pudimos comprobar tu sesión. Revisa tu conexión y vuelve a intentar.")}
                <button type="button" onClick={session.retry} style={{ display: "block", marginTop: 8 }}>
                  {language === "en" ? "Retry session check" : "Reintentar comprobación"}
                </button>
              </div>
            ) : null}
          </div>

          <label style={{ display: "grid", gap: 8, color: MC_NAVY, fontSize: s(13) }}>
            {language === "en" ? "Voice setup: which device are you configuring?" : "Configurar voz: ¿qué dispositivo quieres configurar?"}
            <select value={voiceDevice} onChange={(event) => setVoiceDevice(event.target.value as VoiceDevicePlatform)} style={{ padding: 10, borderRadius: 10, border: `1px solid ${MC_NAVY_LINE}`, background: "#fff", color: MC_NAVY }}>
              <option value="unknown">{language === "en" ? "Choose a device" : "Elegir dispositivo"}</option>
              <option value="ios">iPhone / iPad</option>
              <option value="android">Android</option>
            </select>
          </label>

          {session.status === "authenticated" && voiceDevice === "ios" ? (
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                border: `1px solid ${MC_NAVY_LINE}`,
                background: "#f7faff",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: s(15), color: MC_NAVY }}>
                {language === "en" ? "Add with Siri (experimental)" : "Agregar con Siri (experimental)"}
              </div>
              <div style={{ fontSize: s(13), color: MC_NAVY_MUTED, lineHeight: 1.45 }}>
                {language === "en"
                  ? "Say several items in one phrase and add them directly to My List using an Apple Shortcut."
                  : "Di varios artículos en una sola frase y agrégalos directamente a Mi Lista mediante un Atajo de Apple."}
              </div>

              {!voiceEnabled ? (
                <button
                  type="button"
                  onClick={() => void onEnableVoiceAccess()}
                  disabled={voiceBusy}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY}`,
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity: voiceBusy ? 0.6 : 1,
                  }}
                >
                  {voiceBusy
                    ? language === "en" ? "Enabling..." : "Activando..."
                    : language === "en" ? "Enable Siri access" : "Activar acceso para Siri"}
                </button>
              ) : (
                <>
                  <div style={{ fontSize: s(13), color: "#027a48", fontWeight: 900 }}>
                    {language === "en" ? "Siri access enabled" : "Acceso para Siri activado"}
                  </div>

                  {voiceToken ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ fontSize: s(12), color: MC_NAVY_MUTED }}>
                        {language === "en"
                          ? "Private key (shown only this time)"
                          : "Clave privada (se muestra únicamente esta vez)"}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8 }}>
                        <input
                          readOnly
                          value={voiceToken}
                          aria-label={language === "en" ? "Private Siri key" : "Clave privada de Siri"}
                          style={{
                            minWidth: 0,
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: `1px solid ${MC_NAVY_LINE}`,
                            boxSizing: "border-box",
                            fontSize: s(12),
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void copyVoiceValue(voiceToken, language === "en" ? "Key" : "Clave")}
                          style={{
                            border: `1px solid ${MC_NAVY_LINE}`,
                            background: "#fff",
                            color: MC_NAVY,
                            borderRadius: 12,
                            padding: "10px 12px",
                            fontWeight: 900,
                          }}
                        >
                          {language === "en" ? "Copy" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {testingShortcutAvailable ? (
                    <div style={{ display: "grid", gap: 10, fontSize: s(13), color: MC_NAVY, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 900 }}>{language === "en" ? "iPhone: install the ready-made shortcut" : "iPhone: instalar el atajo listo"}</div>
                      <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                        <li>{language === "en" ? "Copy your connection using the button below. It is private; do not share it." : "Copia tu conexión con el botón de abajo. Es privada; no la compartas."}</li>
                        <li>{language === "en" ? "Tap Install English Siri shortcut (testing), then Configure Shortcut. Paste your connection in Text and tap Add Shortcut. Do not choose Skip Setup or paste the iCloud link." : "Toca Instalar para Siri en español (testing) y luego Configurar atajo. Pega tu conexión en Texto y toca Agregar atajo. No elijas Omitir configuración ni pegues el enlace de iCloud."}</li>
                        <li>{language === "en" ? "First test: open Shortcuts and tap the installed Shopping Voice tile, not its three dots. Allow speech recognition, connection and sending text to the MinderCart testing address when prompted. Say Milk note cold when it listens, wait silently, then check My List. You do not need to activate Siri for this first test." : "Primera prueba: abre Atajos y toca el recuadro instalado Agregar a MinderCart, no sus tres puntos. Autoriza reconocimiento de voz, conexión y envío de texto a la dirección de MinderCart testing cuando lo pida. Cuando escuche, di Leche nota fría, espera en silencio y revisa Mi Lista. En esta primera prueba no necesitas activar Siri."}</li>
                        <li>{language === "en" ? "The shortcut installs as Shopping Voice; no renaming or editing is needed. If you already have a working shortcut with this name, keep it rather than installing again." : "El atajo se instala con el nombre Agregar a MinderCart; no necesitas renombrarlo ni editarlo. Si ya tienes uno que funciona con ese nombre, consérvalo: no necesitas reinstalarlo ni revocar su acceso."}</li>
                      </ol>
                      {voiceToken ? (
                        <button type="button" onClick={() => void copyVoiceValue(`Bearer ${voiceToken}`, language === "en" ? "Connection" : "Conexión")} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${MC_NAVY_LINE}`, background: "#fff", color: MC_NAVY, fontWeight: 900 }}>
                          {language === "en" ? "Copy complete Authorization value" : "Copiar valor completo de Authorization"}
                        </button>
                      ) : (
                        <p style={{ margin: 0 }}>{language === "en" ? "If your shortcut already works, you do not need to install it again. Your connection is only displayed when access is enabled. To reuse it, copy the complete Authorization value from your existing shortcut; do not share it. Revoking access invalidates the old connection." : "Si tu atajo ya funciona, no necesitas instalarlo otra vez. Tu conexión solo se muestra al activar el acceso. Para reutilizarla, copia el valor completo de Authorization de tu atajo existente; no lo compartas. Revocar el acceso invalida la conexión anterior."}</p>
                      )}
                      <a href={language === "en" ? "https://www.icloud.com/shortcuts/ace6e4d0434f4efba7eda56db89376ea" : "https://www.icloud.com/shortcuts/850dfff0a8af4419bed750ad182534e0"} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "12px 14px", borderRadius: 12, background: MC_NAVY, color: "#fff", fontWeight: 900, textDecoration: "none" }}>
                        {language === "en" ? "Install English Siri shortcut (testing)" : "Instalar para Siri en español (testing)"}
                      </a>
                      <p style={{ margin: 0 }}>{language === "en" ? "This shortcut listens in English (US) and connects only to testing, not production. Changing MinderCart's language does not change an already installed shortcut. Never share a copy containing your connection." : "Este atajo dicta en español y se conecta solo a testing, no a producción. Cambiar el idioma de MinderCart no cambia un atajo ya instalado. Nunca compartas una copia que contenga tu conexión."}</p>
                    </div>
                  ) : null}

                  <details style={{ fontSize: s(13), color: MC_NAVY }}>
                    <summary style={{ cursor: "pointer", fontWeight: 900 }}>
                      {language === "en" ? "Technical help: manual shortcut setup" : "Ayuda técnica: configurar el atajo manualmente"}
                    </summary>
                    <ol style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 6, lineHeight: 1.4 }}>
                      <li>{language === "en" ? "Open Apple's Shortcuts app. Tap + and name the shortcut “Shopping Voice”." : "Abre la app Atajos de Apple. Toca + y ponle el nombre “Agregar a MinderCart”."}</li>
                      <li>{language === "en" ? "Add Dictate Text. Select your language and stop listening After Pause." : "Busca y agrega Dictar texto. Elige Español (México) y dejar de escuchar Después de la pausa."}</li>
                      <li>{language === "en" ? "Add Get Contents of URL. Paste the connection URL as fixed text, not as the Dictated Text variable. Expand the blue arrow and change GET to POST." : "Agrega Obtener contenido de URL. Pega la URL de conexión como texto fijo, no como la variable Texto dictado. Abre la flecha azul y cambia GET a POST."}</li>
                      <li>{language === "en" ? "Under Headers, add a header. Key: Authorization. Value: Bearer, one space, then your private key. The value is not a URL." : "En Encabezados, toca Agregar nuevo encabezado. Clave: Authorization. Valor: Bearer, un espacio y tu clave privada. El valor no es una URL."}</li>
                      <li>{language === "en" ? "Set Request Body to JSON. Add a Text field with the lowercase key utterance. For its value, select the variable produced by Dictate Text; do not type the words “Dictated Text”." : "En Solicitar cuerpo, elige JSON. Agrega un campo de tipo Texto con la clave utterance, en minúsculas. En el valor, selecciona la variable que sale de Dictar texto; no escribas las palabras “Texto dictado”."}</li>
                      <li>{language === "en" ? "For the first test, add Quick Look after the request, using Contents of URL. Run with ▶, dictate milk, and wait silently. If asked, allow sending text only to the MinderCart address you selected." : "Para la primera prueba, agrega Vista rápida después de la solicitud, usando Contenido de URL. Ejecuta con ▶, dicta leche y espera en silencio. Si pide permiso, permite enviar texto solo a la dirección de MinderCart que elegiste."}</li>
                    </ol>
                    <button
                      type="button"
                      onClick={() => void copyVoiceValue(`${window.location.origin}/api/voice/add-items`, "URL")}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        background: "#fff",
                        color: MC_NAVY,
                        fontWeight: 900,
                      }}
                    >
                      {language === "en" ? "Copy connection URL" : "Copiar URL de conexión"}
                    </button>
                    {voiceToken ? (
                      <button
                        type="button"
                        onClick={() => void copyVoiceValue(`Bearer ${voiceToken}`, language === "en" ? "Authorization value" : "Valor de Authorization")}
                        style={{ marginTop: 8, width: "100%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${MC_NAVY_LINE}`, background: "#fff", color: MC_NAVY, fontWeight: 900 }}
                      >
                        {language === "en" ? "Copy complete Authorization value" : "Copiar valor completo de Authorization"}
                      </button>
                    ) : (
                      <p>{language === "en" ? "The private key is not shown again. If your shortcut already works, keep it; do not revoke access. If you lost the key and need a new shortcut, revoking and enabling again will invalidate the old key." : "La clave privada no vuelve a mostrarse. Si tu atajo ya funciona, consérvalo; no revoques el acceso. Si perdiste la clave y necesitas un atajo nuevo, revocar y activar de nuevo invalida la clave anterior."}</p>
                    )}
                  </details>

                  <details style={{ fontSize: s(13), color: MC_NAVY, lineHeight: 1.5 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 900 }}>{language === "en" ? "iPhone: daily use and spoken notes" : "iPhone: uso diario y notas por voz"}</summary>
                    <p>{language === "en" ? "Daily use (after the first test): with Siri in English, activate Siri and say only “Shopping Voice”. Wait for “What's the text?”, then say “Milk note cold” and wait silently. Do not say the shortcut name and product together. You do not need to open Shortcuts each time. Do not press the red stop button: it cancels the shortcut. Return to My List in testing; allow a few seconds for syncing." : "Uso diario (con el atajo configurado como “Agregar a MinderCart”): activa Siri y di únicamente “Agregar a MinderCart”. Espera a que pida el texto; después di “Leche nota fría” y guarda silencio. Son dos pasos: no digas el nombre y el producto juntos. No necesitas abrir Atajos cada vez. No pulses el botón rojo de detener: cancela el atajo. Regresa a Mi Lista en testing. Espera hasta 20 segundos para sincronizar y revisa también los artículos al final de la lista antes de repetir el dictado. Si no aparece, actualiza una vez antes de reintentarlo."}</p>
                    <p>{language === "en" ? "MinderCart language, Siri language and the shortcut's dictation language are separate settings. This template dictates in English (US). If Siri cannot find the shortcut, check its name and Siri's language first." : "El idioma de MinderCart, el de Siri y el del dictado del atajo son ajustes distintos. El atajo dicta en español; si ya funciona, no necesitas cambiar el idioma de Siri. “Agregar a MinderCart” se probó con Siri en inglés. La plantilla enlazada no contiene claves ni Vista rápida técnica y ya lleva el nombre para invocarla con Siri."}</p>
                    <p>{language === "en" ? "Start with a short phrase: “Milk note cold”. For several products, say next item between them, for example:" : "Sin notas: “leche, huevos y arroz”. Con notas, di nota antes de la nota y siguiente artículo para empezar otro producto:"}</p>
                    <p style={{ fontWeight: 800 }}>{language === "en" ? "Milk note cold, next item eggs." : "Agua mineral nota naranja, siguiente artículo agua mineral nota toronja, siguiente artículo coca."}</p>
                    <p>{language === "en" ? "Words after note belong to that note until next item. Notes keep your dictated wording; they are not translated. The English template has no technical Quick Look screens. If nothing appears, do not immediately repeat the dictation: it may still be syncing." : "Esto agrega dos renglones de Agua Mineral con notas diferentes y Coca sin nota. Todo lo que digas después de nota pertenece a esa nota hasta siguiente artículo. Las notas conservan tus palabras; no se traducen."}</p>
                  </details>

                  <button
                    type="button"
                    onClick={() => void onRevokeVoiceAccess()}
                    disabled={voiceBusy}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                      fontWeight: 900,
                      opacity: voiceBusy ? 0.6 : 1,
                    }}
                  >
                    {language === "en" ? "Revoke Siri access" : "Revocar acceso para Siri"}
                  </button>
                </>
              )}

              {voiceMessage ? <div style={{ fontSize: s(13), color: "#027a48", fontWeight: 800 }}>{voiceMessage}</div> : null}
              {voiceError ? <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{voiceError}</div> : null}
            </div>
          ) : null}

          {voiceDevice === "android" ? <details open style={{ padding: 14, borderRadius: 14, border: `1px solid ${MC_NAVY_LINE}`, color: MC_NAVY, fontSize: s(13), lineHeight: 1.5 }}>
            <summary style={{ cursor: "pointer", fontWeight: 900 }}>{language === "en" ? "Android: basic voice typing" : "Android: dictado básico"}</summary>
            <p>{language === "en" ? "No Siri access, private key or Apple Shortcut is needed. There is currently no equivalent MinderCart integration with Google Assistant or Gemini." : "No necesitas activar Siri, una clave privada ni Atajos de Apple. Por ahora MinderCart no tiene una integración equivalente con Google Assistant o Gemini."}</p>
            <ol style={{ paddingLeft: 20 }}>
              <li>{language === "en" ? "Open My List and tap the product search field to show the keyboard." : "Abre Mi Lista y toca el campo para buscar un producto; aparecerá el teclado."}</li>
              <li>{language === "en" ? "If your keyboard supports voice typing (for example Gboard), tap its microphone and say one product name." : "Si tu teclado permite dictado (por ejemplo Gboard), toca su micrófono y di el nombre de un solo producto."}</li>
              <li>{language === "en" ? "Check the text and select/add the product as usual. To dictate a note, tap the product's note field and use the keyboard microphone there." : "Revisa el texto y selecciona o agrega el producto como siempre. Para dictar una nota, toca el campo de nota del producto y usa ahí el micrófono del teclado."}</li>
            </ol>
            <p>{language === "en" ? "Keyboard voice typing only fills the selected field; it does not submit a shopping list or interpret nota / siguiente artículo commands." : "El dictado del teclado solo llena el campo seleccionado; no envía una lista de compras ni interpreta los comandos nota / siguiente artículo."}</p>
            <a href={`https://support.google.com/gboard/answer/2781851?co=GENIE.Platform%3DAndroid&hl=${language === "en" ? "en" : "es"}`} target="_blank" rel="noopener noreferrer">{language === "en" ? "Google's voice typing guide" : "Ayuda de Google para dictar con el teclado"}</a>
          </details> : null}

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
              <div style={{ fontWeight: 900, fontSize: s(15), color: MC_NAVY }}>{familyCardTitle}</div>

              <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>{familyCardDescription}</div>

              {familyMessage ? (
                <div style={{ fontSize: s(13), color: "#027a48", fontWeight: 800 }}>{familyMessage}</div>
              ) : null}

              {familyError && !isFamilyStatusError ? (
                <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{familyError}</div>
              ) : null}

              {isFamilyStatusError && !familyRecord && !pendingFamilyInvite ? (
                <button
                  type="button"
                  onClick={() => {
                    setFamilyError("");
                    setFamilyStatusRetryToken((current) => current + 1);
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
                  {language === "en" ? "Retry" : "Reintentar"}
                </button>
              ) : null}

              {pendingFamilyInvite ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    background: "#f7faff",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: s(13), color: MC_NAVY }}>
                    {language === "en" ? "Pending invitation" : "Invitación pendiente"}
                  </div>
                  <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                    {language === "en"
                      ? `Accept the invitation to join ${pendingFamilyInvite.familyName}.`
                      : `Acepta la invitación para unirte a ${pendingFamilyInvite.familyName}.`}
                  </div>
                </div>
              ) : null}

              {familyRecord && isFamilyOwner ? (
                familyInviteOpen ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontWeight: 900, fontSize: s(13), color: MC_NAVY }}>
                      {language === "en" ? "Member email" : "Correo del integrante"}
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
                ) : null
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
                          ? "Hide group"
                          : "Ocultar grupo"
                        : language === "en"
                          ? "View group"
                          : "Ver grupo"}
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
                          {language === "en" ? "Members" : "Integrantes"}
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
                                      : "Integrante"}
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {isFamilyOwner && member.role !== "owner" ? (
                                  <button
                                    type="button"
                                    onClick={() => void onRemoveFamilyMember(member.uid)}
                                    disabled={familyRemoveMemberBusyId === member.uid}
                                    style={{
                                      border: `1px solid ${MC_NAVY_LINE}`,
                                      background: "#fff",
                                      color: MC_NAVY,
                                      borderRadius: 999,
                                      padding: "6px 10px",
                                      fontSize: s(12),
                                      fontWeight: 800,
                                      cursor: familyRemoveMemberBusyId === member.uid ? "default" : "pointer",
                                      opacity: familyRemoveMemberBusyId === member.uid ? 0.6 : 1,
                                    }}
                                  >
                                    {familyRemoveMemberBusyId === member.uid
                                      ? language === "en"
                                        ? "Removing..."
                                        : "Quitando..."
                                      : language === "en"
                                        ? "Remove"
                                        : "Quitar"}
                                  </button>
                                ) : null}

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
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                            {language === "en" ? "No members yet." : "Todavía no hay integrantes."}
                          </div>
                        )}
                      </div>

                      {isFamilyOwner ? (
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
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {pendingFamilyInvite ? (
                <button
                  type="button"
                  onClick={() => void onAcceptFamilyInvite()}
                  disabled={familyAcceptInviteBusy}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid transparent",
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity: familyAcceptInviteBusy ? 0.6 : 1,
                  }}
                >
                  {familyAcceptInviteBusy
                    ? language === "en"
                      ? "Accepting..."
                      : "Aceptando..."
                    : language === "en"
                      ? "Accept invitation"
                      : "Aceptar invitación"}
                </button>
              ) : showCreateGroupAction ? (
                <button
                  type="button"
                  onClick={() => {
                    setCreateGroupNameDraft("");
                    setCreateGroupNameError("");
                    setFamilyError("");
                    setFamilyMessage("");
                    setCreateGroupModalOpen(true);
                  }}
                  disabled={familyBusy || !session.enabled}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid transparent",
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity: familyBusy || !session.enabled ? 0.6 : 1,
                  }}
                >
                  {familyBusy
                    ? language === "en"
                      ? "Creating..."
                      : "Creando..."
                    : language === "en"
                      ? "Create group"
                      : "Crear grupo"}
                </button>
              ) : isFamilyOwner ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!familyInviteOpen) {
                      setFamilyInviteOpen(true);
                      setFamilyError("");
                      setFamilyMessage("");
                      return;
                    }
                    void onInviteFamilyMember();
                  }}
                  disabled={familyInviteBusy || (familyInviteOpen && !familyInviteEmail.trim())}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(15),
                    opacity: familyInviteBusy || (familyInviteOpen && !familyInviteEmail.trim()) ? 0.6 : 1,
                  }}
                >
                  {familyInviteBusy
                    ? language === "en"
                      ? "Inviting..."
                      : "Invitando..."
                    : !familyInviteOpen
                      ? language === "en"
                        ? "Invite member"
                        : "Invitar integrante"
                      : language === "en"
                        ? "Send invite"
                        : "Enviar invitación"}
                </button>
              ) : null}
            </div>
          ) : null}

          {createGroupModalOpen ? (
            <div
              style={{
                position: "fixed",
                top: "calc(env(safe-area-inset-top, 0px) + 144px)",
                right: 0,
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 78px)",
                left: 0,
                background: "rgba(0, 0, 0, 0.35)",
                padding: 12,
                zIndex: 70,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 560,
                  margin: "0 auto",
                  borderRadius: 18,
                  background: "#fff",
                  border: `1px solid ${MC_NAVY_LINE}`,
                  boxShadow: "0 18px 50px rgba(0, 0, 0, 0.16)",
                  padding: 16,
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 900, fontSize: s(16), color: MC_NAVY }}>
                    {language === "en" ? "Name your group" : "Ponle nombre a tu grupo"}
                  </div>
                  <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                    {language === "en" ? "Choose the name you want to see across the app." : "Escribe el nombre que quieres ver en toda la app."}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 900, fontSize: s(13), color: MC_NAVY }}>
                    {language === "en" ? "Group name" : "Nombre del grupo"}
                  </div>
                  <input
                    type="text"
                    value={createGroupNameDraft}
                    onChange={(e) => {
                      setCreateGroupNameDraft(e.target.value);
                      if (createGroupNameError) {
                        setCreateGroupNameError("");
                      }
                    }}
                    placeholder={
                      language === "en"
                        ? "E.g. Home, Mom\'s list, Office"
                        : "Ej. Casa, Lista de mamá, Oficina"
                    }
                    autoFocus
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

                {createGroupNameError ? (
                  <div style={{ fontSize: s(13), color: "#b42318", fontWeight: 800 }}>{createGroupNameError}</div>
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
                    onClick={() => {
                      setCreateGroupModalOpen(false);
                      setCreateGroupNameDraft("");
                      setCreateGroupNameError("");
                    }}
                    disabled={familyBusy}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                      fontWeight: 900,
                      fontSize: s(15),
                      opacity: familyBusy ? 0.6 : 1,
                    }}
                  >
                    {language === "en" ? "Cancel" : "Cancelar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void onCreateFamily()}
                    disabled={familyBusy}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: "1px solid transparent",
                      background: MC_NAVY,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: s(15),
                      opacity: familyBusy ? 0.6 : 1,
                    }}
                  >
                    {familyBusy
                      ? language === "en"
                        ? "Creating..."
                        : "Creando..."
                      : language === "en"
                        ? "Create group"
                        : "Crear grupo"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6, fontSize: s(15) }}>{t(language, "language")}</div>
            <select
              value={language}
              onChange={(e) => {
                const nextLanguage = e.target.value === "en" ? "en" : "es";
                setLanguage(nextLanguage);
                persistPreferences({ language: nextLanguage });
              }}
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
                              fontWeight: 400,
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
              onChange={(e) => {
                const nextFontScale =
                  e.target.value === "large" || e.target.value === "xlarge" ? e.target.value : "normal";
                setFontScale(nextFontScale);
                persistPreferences({ fontScale: nextFontScale });
              }}
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
