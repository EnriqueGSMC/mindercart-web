import { createHash, randomBytes, randomUUID } from "node:crypto";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SEED_GENERAL_ITEMS } from "@/lib/mindercart/seed-items";
import { parseVoiceUtterance, normalizeVoiceText, type VoiceCatalogItem } from "./parse-utterance";
import { voiceItemIdentity } from "./item-identity";

const VOICE_TOKEN_PREFIX = "mc_voice_";
const VOICE_TOKEN_COLLECTION = "voiceAccessTokens";

function safe(value: unknown) {
  return String(value ?? "").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function requireFirebaseUser(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");
  return adminAuth().verifyIdToken(token);
}

export async function createVoiceAccess(uid: string) {
  const db = adminDb();
  const integrationRef = db.collection("voiceIntegrations").doc(uid);
  const previous = await integrationRef.get();
  const previousHash = safe(previous.data()?.tokenHash);
  const token = `${VOICE_TOKEN_PREFIX}${randomBytes(24).toString("base64url")}`;
  const tokenHash = hash(token);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    if (previousHash) transaction.delete(db.collection(VOICE_TOKEN_COLLECTION).doc(previousHash));
    transaction.set(db.collection(VOICE_TOKEN_COLLECTION).doc(tokenHash), {
      uid,
      enabled: true,
      createdAt: now,
      lastUsedAt: null,
    });
    transaction.set(integrationRef, { tokenHash, enabled: true, createdAt: now }, { merge: true });
  });

  return { token, createdAt: now };
}

export async function getVoiceAccessStatus(uid: string) {
  const snap = await adminDb().collection("voiceIntegrations").doc(uid).get();
  return { enabled: snap.exists && snap.data()?.enabled === true };
}

export async function revokeVoiceAccess(uid: string) {
  const db = adminDb();
  const ref = db.collection("voiceIntegrations").doc(uid);
  const snap = await ref.get();
  const tokenHash = safe(snap.data()?.tokenHash);

  await db.runTransaction(async (transaction) => {
    if (tokenHash) transaction.delete(db.collection(VOICE_TOKEN_COLLECTION).doc(tokenHash));
    transaction.set(ref, { enabled: false, tokenHash: null, revokedAt: Date.now() }, { merge: true });
  });
}

function bearerToken(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function sameListItem(a: Record<string, unknown>, item: { itemKey: string; note: string; unit: string; store: string }) {
  const currentKey = safe(a.itemKey) || normalizeVoiceText(a.name).replace(/\s+/g, "-");
  return voiceItemIdentity({ ...a, itemKey: currentKey }) === voiceItemIdentity(item) && !safe(a.sourceListName);
}

export async function addVoiceItems(req: Request, utterance: string) {
  const token = bearerToken(req);
  if (!token.startsWith(VOICE_TOKEN_PREFIX)) throw new Error("UNAUTHORIZED");

  const db = adminDb();
  const tokenHash = hash(token);
  const tokenRef = db.collection(VOICE_TOKEN_COLLECTION).doc(tokenHash);
  const now = Date.now();

  return db.runTransaction(async (transaction) => {
    const tokenSnap = await transaction.get(tokenRef);
    const tokenData = tokenSnap.data();
    if (!tokenSnap.exists || tokenData?.enabled !== true || !safe(tokenData.uid)) {
      throw new Error("UNAUTHORIZED");
    }

    const uid = safe(tokenData.uid);
    const userRef = db.collection("users").doc(uid);
    const userSnap = await transaction.get(userRef);
    const userData = userSnap.data() || {};
    const membership = isRecord(userData.familyMembership) ? userData.familyMembership : null;
    const useFamily = safe(membership?.status).toLowerCase() === "active" && safe(membership?.familyId);
    const targetRef = useFamily
      ? db.collection("families").doc(safe(membership?.familyId)).collection("workspace").doc("core")
      : userRef;
    const targetSnap = targetRef.path === userRef.path ? userSnap : await transaction.get(targetRef);
    const targetData = targetSnap.data() || {};
    const coreState = isRecord(targetData.coreState) ? targetData.coreState : {};
    const itemsMaster = Array.isArray(coreState.itemsMaster)
      ? coreState.itemsMaster.filter(isRecord)
      : [];
    const catalog: VoiceCatalogItem[] = itemsMaster.map((item) => ({
      itemKey: safe(item.itemKey),
      name: safe(item.name),
      nameEs: safe(item.nameEs),
      nameEn: safe(item.nameEn),
      category: safe(item.category),
      unit: safe(item.unit),
      defaultStore: safe(item.defaultStore),
    }));

    {
      const existingKeys = new Set(catalog.map((item) => item.itemKey));
      catalog.push(...SEED_GENERAL_ITEMS.filter((item) => !existingKeys.has(item.itemKey)).map((item) => ({
        itemKey: item.itemKey,
        name: item.nameEs,
        nameEs: item.nameEs,
        nameEn: item.nameEn,
        category: item.category,
        unit: item.unit,
        defaultStore: item.store,
      })));
    }

    const settings = isRecord(coreState.settings) ? coreState.settings : {};
    const parsed = parseVoiceUtterance(utterance, catalog, safe(settings.preferredStore));
    if (!parsed.length) throw new Error("NO_ITEMS");

    let nextMaster = [...itemsMaster];
    let nextActive = Array.isArray(coreState.activeShoppingListItems)
      ? coreState.activeShoppingListItems.filter(isRecord)
      : [];
    let nextGeneral = Array.isArray(coreState.generalListItems)
      ? coreState.generalListItems.filter(isRecord)
      : [];

    for (const item of parsed) {
      if (item.isCustom && !nextMaster.some((entry) => safe(entry.itemKey) === item.itemKey)) {
        nextMaster = [{
          id: randomUUID(),
          itemKey: item.itemKey,
          name: item.name,
          nameEs: item.name,
          nameEn: item.name,
          category: item.category,
          unit: item.unit,
          defaultStore: item.store,
          active: true,
          createdAt: now,
        }, ...nextMaster];
      }

      const existingIndex = nextGeneral.findIndex((entry) => sameListItem(entry, item));
      const nextItem = {
        ...(existingIndex >= 0 ? nextGeneral[existingIndex] : {}),
        id: existingIndex >= 0 ? safe(nextGeneral[existingIndex].id) || randomUUID() : randomUUID(),
        itemKey: item.itemKey,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        store: item.store,
        note: item.note,
        active: true,
        lastUsedAt: now,
      };

      nextGeneral = existingIndex >= 0
        ? nextGeneral.map((entry, index) => index === existingIndex ? nextItem : entry)
        : [nextItem, ...nextGeneral];

      const activeIndex = nextActive.findIndex((entry) =>
        sameListItem(entry, item)
        && safe(entry.unit) === item.unit
        && safe(entry.store) === item.store
      );
      const previousActive = activeIndex >= 0 ? nextActive[activeIndex] : {};
      const activeItem = {
        ...previousActive,
        id: safe(previousActive.id) || randomUUID(),
        itemKey: item.itemKey,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        store: item.store,
        note: item.note,
        checked: false,
        sourceTypes: Array.from(new Set([
          ...(Array.isArray(previousActive.sourceTypes) ? previousActive.sourceTypes : []),
          "voice",
        ])),
        sourceRefs: Array.isArray(previousActive.sourceRefs) ? previousActive.sourceRefs : [],
        createdAt: Number(previousActive.createdAt) || now,
      };
      nextActive = activeIndex >= 0
        ? nextActive.map((entry, index) => index === activeIndex ? activeItem : entry)
        : [activeItem, ...nextActive];
    }

    const previousPending = Array.isArray(targetData.pendingVoiceItems)
      ? targetData.pendingVoiceItems.filter(isRecord)
      : [];
    const pendingByKey = new Map(previousPending.map((item) => [voiceItemIdentity(item), item]));
    parsed.forEach((item) => pendingByKey.set(voiceItemIdentity(item), { ...item, voiceAddedAt: now }));

    transaction.set(targetRef, {
      coreState: {
        ...coreState,
        itemsMaster: nextMaster,
        generalListItems: nextGeneral,
        activeShoppingListItems: nextActive,
      },
      updatedAt: now,
      voiceUpdatedAt: now,
      pendingVoiceItems: Array.from(pendingByKey.values()),
    }, { merge: true });
    transaction.update(tokenRef, { lastUsedAt: now });

    return {
      added: parsed.map(({ itemKey, name, quantity, unit, category, store, note, isCustom }) => ({
        itemKey, name, quantity, unit, category, store, note, isCustom,
      })),
      message: parsed.length === 1
        ? `Listo. Agregué ${parsed[0].name} a Mi Lista.`
        : `Listo. Agregué ${parsed.length} artículos a Mi Lista.`,
      updatedAt: now,
    };
  });
}
