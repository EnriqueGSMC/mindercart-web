"use client";

import {
  buildInitialCloudBootstrapPayload,
  getLocalStateSummary,
  type InitialCloudBootstrapPayload,
  type LocalStateMigrationSummary,
} from "@/lib/mindercart/storage";
import { loadUserData } from "@/lib/firebase/load-user-data";

export type UserBootstrapCloudState = Record<string, unknown> | null;
export type WorkspaceType = "individual" | "family";

export type UserBootstrapResolution = {
  uid: string;
  hasUid: boolean;
  workspaceType: WorkspaceType;
  familyId: string | null;
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

function getRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getActiveFamilyId(cloudState: UserBootstrapCloudState): string | null {
  const rootMembership = getRecord(cloudState?.familyMembership);
  const rootFamilyId = safe(rootMembership?.familyId);
  const rootStatus = safe(rootMembership?.status).toLowerCase();

  if (rootFamilyId && rootStatus === "active") {
    return rootFamilyId;
  }

  const userRecord = getRecord(cloudState?.user);
  const nestedMembership = getRecord(userRecord?.familyMembership);
  const nestedFamilyId = safe(nestedMembership?.familyId);
  const nestedStatus = safe(nestedMembership?.status).toLowerCase();

  if (nestedFamilyId && nestedStatus === "active") {
    return nestedFamilyId;
  }

  return null;
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
      workspaceType: "individual",
      familyId: null,
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
    const rawIndividualCloudState = await loadUserData({
      uid: normalizedUid,
      workspaceType: "individual",
    });

    const individualCloudState =
      rawIndividualCloudState && typeof rawIndividualCloudState === "object"
        ? (rawIndividualCloudState as Record<string, unknown>)
        : null;

    const activeFamilyId = getActiveFamilyId(individualCloudState);

    if (activeFamilyId) {
      const rawFamilyCloudState = await loadUserData({
        uid: normalizedUid,
        workspaceType: "family",
        familyId: activeFamilyId,
      });

      const familyCloudState =
        rawFamilyCloudState && typeof rawFamilyCloudState === "object"
          ? (rawFamilyCloudState as Record<string, unknown>)
          : null;

      if (familyCloudState) {
        return {
          uid: normalizedUid,
          hasUid: true,
          workspaceType: "family",
          familyId: activeFamilyId,
          cloudState: familyCloudState,
          hasCloudData: true,
          localSummary,
          hasLocalDataToMigrate,
          shouldOfferInitialMigration: false,
          bootstrapPayload,
          error: null,
        };
      }
    }

    const hasCloudData = individualCloudState !== null;

    return {
      uid: normalizedUid,
      hasUid: true,
      workspaceType: "individual",
      familyId: null,
      cloudState: individualCloudState,
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
      workspaceType: "individual",
      familyId: null,
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
