// FILE: src/lib/firebase/resolve-user-bootstrap.ts
"use client";

import {
  buildInitialCloudBootstrapPayload,
  getLocalStateSummary,
  type InitialCloudBootstrapPayload,
  type LocalStateMigrationSummary,
} from "@/lib/mindercart/storage";
import { loadUserData, type WorkspaceType } from "@/lib/firebase/load-user-data";

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
  workspaceType: WorkspaceType;
  familyId: string | null;
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
  if (!hasLocalDataToMigrate) {
    return null;
  }

  try {
    return buildInitialCloudBootstrapPayload();
  } catch {
    return null;
  }
}

function asCloudState(value: unknown): UserBootstrapCloudState {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function getActiveFamilyId(cloudState: UserBootstrapCloudState): string | null {
  if (!cloudState) {
    return null;
  }

  const membership =
    cloudState.familyMembership && typeof cloudState.familyMembership === "object"
      ? (cloudState.familyMembership as Record<string, unknown>)
      : null;

  if (!membership) {
    return null;
  }

  const familyId = safe(membership.familyId);
  const status = safe(membership.status).toLowerCase();

  if (!familyId || status !== "active") {
    return null;
  }

  return familyId;
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
      workspaceType: "individual",
      familyId: null,
      error: null,
    };
  }

  try {
    const rawIndividualState = await loadUserData({
      uid: normalizedUid,
      workspaceType: "individual",
    });
    const individualCloudState = asCloudState(rawIndividualState);
    const activeFamilyId = getActiveFamilyId(individualCloudState);

    if (activeFamilyId) {
      const rawFamilyState = await loadUserData({
        uid: normalizedUid,
        workspaceType: "family",
        familyId: activeFamilyId,
      });
      const familyCloudState = asCloudState(rawFamilyState);

      if (familyCloudState) {
        return {
          uid: normalizedUid,
          hasUid: true,
          cloudState: familyCloudState,
          hasCloudData: true,
          localSummary,
          hasLocalDataToMigrate,
          shouldOfferInitialMigration: false,
          bootstrapPayload,
          workspaceType: "family",
          familyId: activeFamilyId,
          error: null,
        };
      }
    }

    const hasCloudData = individualCloudState !== null;

    return {
      uid: normalizedUid,
      hasUid: true,
      cloudState: individualCloudState,
      hasCloudData,
      localSummary,
      hasLocalDataToMigrate,
      shouldOfferInitialMigration: !hasCloudData && hasLocalDataToMigrate,
      bootstrapPayload,
      workspaceType: "individual",
      familyId: activeFamilyId,
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
      workspaceType: "individual",
      familyId: null,
      error: error instanceof Error ? error.message : "Cloud bootstrap error",
    };
  }
}
