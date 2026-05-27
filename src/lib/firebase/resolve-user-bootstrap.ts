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
  error: string | null;
  workspaceType: WorkspaceType;
  familyId: string | null;
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function resolveFamilyMembership(
  cloudState: UserBootstrapCloudState,
): { familyId: string | null; isActive: boolean } {
  const root = asRecord(cloudState);
  const membership = asRecord(root?.familyMembership);

  if (!membership) {
    return {
      familyId: null,
      isActive: false,
    };
  }

  const familyId = safe(membership.familyId) || null;
  const status = safe(membership.status).toLowerCase();

  return {
    familyId,
    isActive: Boolean(familyId) && status === "active",
  };
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
      workspaceType: "individual",
      familyId: null,
    };
  }

  try {
    const rawIndividualCloudState = await loadUserData(normalizedUid);
    const individualCloudState = asRecord(rawIndividualCloudState);
    const { familyId, isActive } = resolveFamilyMembership(individualCloudState);

    let workspaceType: WorkspaceType = "individual";
    let cloudState: UserBootstrapCloudState = individualCloudState;

    if (isActive && familyId) {
      const rawFamilyCloudState = await loadUserData({
        uid: normalizedUid,
        workspaceType: "family",
        familyId,
      });
      const familyCloudState = asRecord(rawFamilyCloudState);

      if (familyCloudState) {
        workspaceType = "family";
        cloudState = familyCloudState;
      }
    }

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
      workspaceType,
      familyId: workspaceType === "family" ? familyId : null,
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
      workspaceType: "individual",
      familyId: null,
    };
  }
}
