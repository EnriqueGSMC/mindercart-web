"use client";

import {
  buildInitialCloudBootstrapPayload,
  getLocalStateSummary,
  type InitialCloudBootstrapPayload,
  type LocalStateMigrationSummary,
} from "@/lib/mindercart/storage";
import { loadUserData } from "@/lib/firebase/load-user-data";

export type UserBootstrapCloudState = Record<string, unknown> | null;

export type UserBootstrapResolution = {
  uid: string;
  hasUid: boolean;
  cloudState: UserBootstrapCloudState;
  hasCloudData: boolean;
  localSummary: LocalStateMigrationSummary;
  hasLocalDataToMigrate: boolean;
  shouldOfferInitialMigration: boolean;
  bootstrapPayload: InitialCloudBootstrapPayload | null;
  error: string | null;
};

const EMPTY_LOCAL_SUMMARY: LocalStateMigrationSummary = {
  storageKey: "mindercart_state_v15",
  exists: false,
  parseable: false,
  hasDataToMigrate: false,
  hasSettingsChanges: false,
  itemsMasterCount: 0,
  customItemsMasterCount: 0,
  generalListItemsCount: 0,
  activeShoppingListItemsCount: 0,
  shoppingHistoryGroupsCount: 0,
  shoppingHistoryItemsCount: 0,
  storeProfilesCount: 0,
  customStoreProfilesCount: 0,
  language: "es",
  preferredStore: "HEB",
  fontScale: "normal",
};

function safe(value: unknown) {
  return String(value ?? "").trim();
}

function readLocalSummarySafely() {
  try {
    return getLocalStateSummary();
  } catch {
    return EMPTY_LOCAL_SUMMARY;
  }
}

function buildBootstrapPayloadSafely(hasLocalDataToMigrate: boolean) {
  if (!hasLocalDataToMigrate) return null;

  try {
    return buildInitialCloudBootstrapPayload();
  } catch {
    return null;
  }
}

export async function resolveUserBootstrap(uid: string): Promise<UserBootstrapResolution> {
  const normalizedUid = safe(uid);
  const localSummary = readLocalSummarySafely();
  const hasLocalDataToMigrate = localSummary.hasDataToMigrate;
  const bootstrapPayload = buildBootstrapPayloadSafely(hasLocalDataToMigrate);

  if (!normalizedUid) {
    return {
      uid: "",
      hasUid: false,
      cloudState: null,
      hasCloudData: false,
      localSummary,
      hasLocalDataToMigrate,
      shouldOfferInitialMigration: false,
      bootstrapPayload,
      error: null,
    };
  }

  try {
    const rawCloudState = await loadUserData(normalizedUid);
    const cloudState =
      rawCloudState && typeof rawCloudState === "object"
        ? (rawCloudState as Record<string, unknown>)
        : null;
    const hasCloudData = cloudState !== null;

    return {
      uid: normalizedUid,
      hasUid: true,
      cloudState,
      hasCloudData,
      localSummary,
      hasLocalDataToMigrate,
      shouldOfferInitialMigration: !hasCloudData && hasLocalDataToMigrate,
      bootstrapPayload,
      error: null,
    };
  } catch (error) {
    return {
      uid: normalizedUid,
      hasUid: true,
      cloudState: null,
      hasCloudData: false,
      localSummary,
      hasLocalDataToMigrate,
      shouldOfferInitialMigration: false,
      bootstrapPayload,
      error: error instanceof Error ? error.message : "Cloud bootstrap error",
    };
  }
}
