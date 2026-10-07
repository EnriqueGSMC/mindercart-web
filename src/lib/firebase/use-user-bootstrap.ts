"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthSession, type AuthStatus } from "@/lib/firebase/auth-context";
import {
  resolveUserBootstrap,
  type UserBootstrapResolution,
} from "@/lib/firebase/resolve-user-bootstrap";
import { saveUserData } from "@/lib/firebase/save-user-data";
import { watchPendingVoiceItems } from "@/lib/firebase/load-user-data";
import { voiceItemIdentity } from "@/lib/voice/item-identity";
import { CHANGE_EVENT, readState, writeState } from "@/lib/mindercart/storage";

const SAVED_LISTS_STORAGE_KEY = "mindercart.savedLists.v1";
const PENDING_CLOUD_SYNC_STORAGE_PREFIX = "mindercart.pendingCloudSync.v1.";

export type UserBootstrapHookStatus = "loading" | "ready" | "error";

export type UserBootstrapState = {
  status: UserBootstrapHookStatus;
  authStatus: AuthStatus;
  enabled: boolean;
  uid: string;
  resolution: UserBootstrapResolution | null;
  error: string | null;
};

const INITIAL_STATE: UserBootstrapState = {
  status: "loading",
  authStatus: "loading",
  enabled: true,
  uid: "",
  resolution: null,
  error: null,
};

type SettingsSnapshot = ReturnType<typeof readState>["settings"];
type SettingsOverride = Partial<SettingsSnapshot>;

function safe(value: unknown) {
  return String(value ?? "").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasNewerPendingCloudSnapshot(
  uid: string,
  cloudState: Record<string, unknown> | null,
): boolean {
  if (typeof window === "undefined" || !uid) return false;

  try {
    const raw = window.localStorage.getItem(`${PENDING_CLOUD_SYNC_STORAGE_PREFIX}${uid}`);
    if (!raw) return false;

    const pending = JSON.parse(raw) as Record<string, unknown> | null;
    if (!pending || safe(pending.uid) !== uid) return false;

    const pendingCreatedAt = Number(pending.createdAt ?? 0);
    const cloudUpdatedAt = Number(cloudState?.updatedAt ?? 0);

    return Number.isFinite(pendingCreatedAt)
      && pendingCreatedAt > 0
      && (!Number.isFinite(cloudUpdatedAt) || pendingCreatedAt > cloudUpdatedAt);
  } catch {
    return false;
  }
}

function emitSavedListsChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function applyPendingVoiceItemsToLocal(
  cloudState: Record<string, unknown> | null,
): ReturnType<typeof readState> | null {
  if (typeof window === "undefined" || !isRecord(cloudState)) return null;

  const pending = Array.isArray(cloudState.pendingVoiceItems)
    ? cloudState.pendingVoiceItems.filter(isRecord)
    : [];
  const remoteCoreState = isRecord(cloudState.coreState) ? cloudState.coreState : null;
  if (!pending.length || !remoteCoreState) return null;

  const pendingKeys = new Set(
    pending.map((item) => safe(item.itemKey)).filter(Boolean),
  );
  if (!pendingKeys.size) return null;
  const pendingIdentities = new Set(pending.map(voiceItemIdentity));

  const localState = readState();
  const remoteActive = Array.isArray(remoteCoreState.activeShoppingListItems)
    ? remoteCoreState.activeShoppingListItems.filter(isRecord)
    : [];
  const voiceActive = remoteActive.filter((item) => pendingIdentities.has(voiceItemIdentity(item)));
  const voiceActiveIds = new Set(voiceActive.map((item) => safe(item.id)));
  const remoteGeneral = Array.isArray(remoteCoreState.generalListItems)
    ? remoteCoreState.generalListItems.filter(isRecord)
    : [];
  const remoteMaster = Array.isArray(remoteCoreState.itemsMaster)
    ? remoteCoreState.itemsMaster.filter(isRecord)
    : [];
  const voiceGeneral = remoteGeneral.filter((item) => pendingIdentities.has(voiceItemIdentity(item)));
  const voiceMaster = remoteMaster.filter((item) => pendingKeys.has(safe(item.itemKey)));

  if (!voiceGeneral.length) return null;

  const nextState = {
    ...localState,
    activeShoppingListItems: [
      ...voiceActive,
      ...localState.activeShoppingListItems.filter(
        (item) => !voiceActiveIds.has(safe(item.id)) && !pendingIdentities.has(voiceItemIdentity(item)),
      ),
    ],
    generalListItems: [
      ...voiceGeneral,
      ...localState.generalListItems.filter(
        (item) => !pendingIdentities.has(voiceItemIdentity(item)),
      ),
    ],
    itemsMaster: [
      ...voiceMaster,
      ...localState.itemsMaster.filter(
        (item) => !pendingKeys.has(safe(item.itemKey)),
      ),
    ],
  } as ReturnType<typeof readState>;

  writeState(nextState);
  return nextState;
}

function buildLiveSettingsOverride(
  settingsAtStart: SettingsSnapshot,
  settingsNow: SettingsSnapshot
): SettingsOverride {
  const override: SettingsOverride = {};

  if (settingsNow.language !== settingsAtStart.language) {
    override.language = settingsNow.language;
  }

  if (settingsNow.preferredStore !== settingsAtStart.preferredStore) {
    override.preferredStore = settingsNow.preferredStore;
  }

  if (settingsNow.fontScale !== settingsAtStart.fontScale) {
    override.fontScale = settingsNow.fontScale;
  }

  return override;
}

function applyCloudStateToLocal(
  cloudState: Record<string, unknown> | null,
  liveSettingsOverride: SettingsOverride = {}
) {
  if (typeof window === "undefined" || !isRecord(cloudState)) return;

  const maybeCoreState = cloudState.coreState;
  if (isRecord(maybeCoreState)) {
    const cloudSettings = isRecord(maybeCoreState.settings) ? maybeCoreState.settings : {};
    const nextCoreState =
      Object.keys(liveSettingsOverride).length > 0
        ? {
            ...maybeCoreState,
            settings: {
              ...cloudSettings,
              ...liveSettingsOverride,
            },
          }
        : maybeCoreState;

    writeState(nextCoreState as never);
  }

  if ("savedLists" in cloudState) {
    const maybeSavedLists = cloudState.savedLists;

    if (Array.isArray(maybeSavedLists)) {
      window.localStorage.setItem(SAVED_LISTS_STORAGE_KEY, JSON.stringify(maybeSavedLists));
    } else {
      window.localStorage.removeItem(SAVED_LISTS_STORAGE_KEY);
    }

    emitSavedListsChange();
  }
}

function buildApplySignature(uid: string, resolution: UserBootstrapResolution) {
  if (!resolution.hasCloudData || !isRecord(resolution.cloudState)) {
    return "";
  }

  const updatedAt = safe(resolution.cloudState.updatedAt);
  return `${uid}:${updatedAt}`;
}

export function useUserBootstrap(): UserBootstrapState {
  const session = useAuthSession();
  const [state, setState] = useState<UserBootstrapState>(INITIAL_STATE);
  const [refreshRevision, setRefreshRevision] = useState(0);
  const appliedSignatureRef = useRef("");

  const workspaceType = state.resolution?.workspaceType;
  const familyId = state.resolution?.familyId;
  useEffect(() => {
    const uid = safe(session.user?.uid);
    if (session.status !== "authenticated" || !uid || !workspaceType) return;
    return watchPendingVoiceItems({ uid, workspaceType, familyId }, (cloudState) => {
      // Apply the confirmed snapshot directly. Re-fetching bootstrap here can
      // race an older in-flight read and lose the only live notification.
      const merged = applyPendingVoiceItemsToLocal(cloudState);
      if (!merged) return;
      void saveUserData({ uid, data: { coreState: merged }, workspaceType, familyId }).catch(() => {
        // Bootstrap/focus refresh will retry unacknowledged additions.
      });
    });
  }, [session.status, session.user?.uid, workspaceType, familyId]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        setRefreshRevision((current) => current + 1);
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const uid = safe(session.user?.uid);

      if (session.status === "loading") {
        setState({
          status: "loading",
          authStatus: session.status,
          enabled: session.enabled,
          uid,
          resolution: null,
          error: session.error,
        });
        return;
      }

      try {
        const settingsAtStart = readState().settings;
        const resolution = await resolveUserBootstrap(uid);

        if (cancelled) return;

        if (
          session.status === "authenticated"
          && resolution.hasCloudData
        ) {
          const hasNewerLocalSnapshot = hasNewerPendingCloudSnapshot(
            uid,
            resolution.cloudState,
          );
          if (!hasNewerLocalSnapshot) {
            const signature = buildApplySignature(uid, resolution);

            if (signature && signature !== appliedSignatureRef.current) {
              const settingsNow = readState().settings;
              const liveSettingsOverride = buildLiveSettingsOverride(settingsAtStart, settingsNow);

              applyCloudStateToLocal(resolution.cloudState, liveSettingsOverride);
              appliedSignatureRef.current = signature;
            }
          }

          // Merge into the selected local/cloud baseline, then acknowledge it.
          const stateWithVoiceItems = applyPendingVoiceItemsToLocal(resolution.cloudState);
          if (stateWithVoiceItems) {
            void saveUserData({
              uid,
              data: { coreState: stateWithVoiceItems },
              workspaceType: resolution.workspaceType,
              familyId: resolution.familyId,
            }).catch(() => {
              // Retry pending voice items on the next refresh.
            });
          }
        }

        if (session.status !== "authenticated") {
          appliedSignatureRef.current = "";
        }

        setState({
          status: "ready",
          authStatus: session.status,
          enabled: session.enabled,
          uid: resolution.uid,
          resolution,
          error: session.error || resolution.error,
        });
      } catch (error) {
        if (cancelled) return;

        setState({
          status: "error",
          authStatus: session.status,
          enabled: session.enabled,
          uid,
          resolution: null,
          error: error instanceof Error ? error.message : "User bootstrap error",
        });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshRevision, session.enabled, session.error, session.status, session.user?.uid]);

  return state;
}
