// FILE: src/lib/firebase/shared-list-actions.ts

import {
  type CreateFamilyInput,
  type CreateFamilyInviteInput,
  type CreateSharedListInput,
  type CopyPersonalListToSharedListInput,
  type FamilyInviteRecord,
  type FamilyMemberRecord,
  type FamilyRecord,
  type SharedListItemRecord,
  type SharedListRecord,
  type UserFamilyMembershipRecord,
} from "./shared-list-types";
import { clientApp } from "./client";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const FAMILY_MAX_MEMBERS = 5;
const ACTIVE_FAMILY_STATUS = "active";
const INVITE_EXPIRATION_DAYS = 7;

type AcceptFamilyInviteInput = {
  familyId: string;
  inviteId: string;
  uid: string;
  email: string;
};

export type PendingFamilyInviteMatch = {
  familyId: string;
  familyName: string;
  invite: FamilyInviteRecord;
};

type GetFamilyByOwnerUidResult = FamilyRecord | null;
type GetFamilyListsResult = SharedListRecord[];

function db() {
  return getFirestore(clientApp());
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function requireNonEmpty(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  return trimmed;
}

function buildInviteExpiryIso(days: number = INVITE_EXPIRATION_DAYS): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function usersDoc(uid: string) {
  return doc(db(), "users", uid);
}

function familiesDoc(familyId: string) {
  return doc(db(), "families", familyId);
}

function familiesCollection() {
  return collection(db(), "families");
}

function membersCollection(familyId: string) {
  return collection(db(), "families", familyId, "members");
}

function invitesCollection(familyId: string) {
  return collection(db(), "families", familyId, "invites");
}

function listsCollection(familyId: string) {
  return collection(db(), "families", familyId, "lists");
}

function workspaceCoreDoc(familyId: string) {
  return doc(db(), "families", familyId, "workspace", "core");
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (typeof value === "object") {
    const candidate = value as {
      seconds?: unknown;
      nanoseconds?: unknown;
      toDate?: () => Date;
    };
    if (typeof candidate.toDate === "function") {
      return candidate.toDate().getTime();
    }
    if (typeof candidate.seconds === "number") {
      const nanos = typeof candidate.nanoseconds === "number" ? candidate.nanoseconds : 0;
      return candidate.seconds * 1000 + Math.floor(nanos / 1_000_000);
    }
  }
  return 0;
}

function sortByNewest<T>(items: T[], pickValue: (item: T) => unknown): T[] {
  return [...items].sort((a, b) => toMillis(pickValue(b)) - toMillis(pickValue(a)));
}

async function requireFamilyExists(familyId: string): Promise<FamilyRecord> {
  const familySnap = await getDoc(familiesDoc(familyId));
  if (!familySnap.exists()) {
    throw new Error("Family not found");
  }

  return familySnap.data() as FamilyRecord;
}

async function getActiveMemberCount(familyId: string): Promise<number> {
  const memberSnaps = await getDocs(membersCollection(familyId));
  return memberSnaps.docs.filter((snap) => {
    const member = snap.data() as FamilyMemberRecord;
    return member.status === "active" || member.status === "invited";
  }).length;
}

async function ensureFamilyHasCapacity(familyId: string): Promise<void> {
  const count = await getActiveMemberCount(familyId);
  if (count >= FAMILY_MAX_MEMBERS) {
    throw new Error("Family member limit reached");
  }
}

function membershipRecord(familyId: string, role: UserFamilyMembershipRecord["role"]): UserFamilyMembershipRecord {
  return {
    familyId,
    role,
    status: "active",
  };
}

function buildFamilyWorkspaceSeed(
  ownerData: Record<string, unknown> | null,
  familyId: string,
  ownerUid: string,
) {
  const seed = ownerData ? { ...ownerData } : {};

  delete seed.familyMembership;

  return {
    ...seed,
    workspaceType: "family",
    familyId,
    ownerUid,
    updatedByUid: ownerUid,
    updatedAt: serverTimestamp(),
  };
}

function toSharedListItemRecord(
  input: CopyPersonalListToSharedListInput["items"][number],
  copiedByUid: string,
): SharedListItemRecord {
  const timestamp = nowIso();

  return {
    id: requireNonEmpty(input.id, "item.id"),
    name: requireNonEmpty(input.name, "item.name"),
    quantity: Number.isFinite(input.quantity) ? input.quantity : 1,
    unit: input.unit?.trim() ?? "",
    category: input.category?.trim() ?? "",
    store: input.store?.trim() ?? "",
    checked: Boolean(input.checked),
    createdByUid: copiedByUid,
    updatedByUid: copiedByUid,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createFamily(input: CreateFamilyInput): Promise<FamilyRecord> {
  const ownerUid = requireNonEmpty(input.ownerUid, "ownerUid");
  const ownerEmail = normalizeEmail(requireNonEmpty(input.ownerEmail, "ownerEmail"));
  const familyName = requireNonEmpty(input.familyName, "familyName");

  const familyRef = doc(collection(db(), "families"));
  const timestamp = nowIso();
  const ownerUserSnap = await getDoc(usersDoc(ownerUid));
  const ownerWorkspaceSeed = ownerUserSnap.exists()
    ? (ownerUserSnap.data() as Record<string, unknown>)
    : null;

  const record: FamilyRecord = {
    id: familyRef.id,
    ownerUid,
    name: familyName,
    planType: "family",
    maxMembers: FAMILY_MAX_MEMBERS,
    status: ACTIVE_FAMILY_STATUS,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const ownerMember: FamilyMemberRecord = {
    uid: ownerUid,
    email: ownerEmail,
    role: "owner",
    status: "active",
    joinedAt: timestamp,
    updatedAt: timestamp,
  };

  const batch = writeBatch(db());
  batch.set(familyRef, {
    ...record,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  batch.set(doc(membersCollection(record.id), ownerUid), {
    ...ownerMember,
    updatedAt: serverTimestamp(),
  });
  batch.set(
    workspaceCoreDoc(record.id),
    buildFamilyWorkspaceSeed(ownerWorkspaceSeed, record.id, ownerUid),
    { merge: true },
  );
  batch.set(
    usersDoc(ownerUid),
    {
      familyMembership: membershipRecord(record.id, "owner"),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  return record;
}

export async function getFamilyById(familyId: string): Promise<FamilyRecord | null> {
  const normalizedFamilyId = requireNonEmpty(familyId, "familyId");
  const snap = await getDoc(familiesDoc(normalizedFamilyId));
  return snap.exists() ? (snap.data() as FamilyRecord) : null;
}

export async function getFamilyByOwnerUid(ownerUid: string): Promise<GetFamilyByOwnerUidResult> {
  const normalizedOwnerUid = requireNonEmpty(ownerUid, "ownerUid");
  const q = query(
    familiesCollection(),
    where("ownerUid", "==", normalizedOwnerUid),
    limit(10),
  );

  const snap = await getDocs(q);
  const matches = snap.docs
    .map((docSnap) => docSnap.data() as FamilyRecord)
    .filter((family) => family.status === ACTIVE_FAMILY_STATUS);

  return matches[0] ?? null;
}

export async function getUserFamilyMembership(uid: string): Promise<UserFamilyMembershipRecord | null> {
  const normalizedUid = requireNonEmpty(uid, "uid");
  const userSnap = await getDoc(usersDoc(normalizedUid));

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data() as { familyMembership?: UserFamilyMembershipRecord | null };
  return data.familyMembership ?? null;
}

export async function getFamilyMembers(familyId: string): Promise<FamilyMemberRecord[]> {
  const normalizedFamilyId = requireNonEmpty(familyId, "familyId");
  const snap = await getDocs(membersCollection(normalizedFamilyId));
  const members = snap.docs.map((docSnap) => docSnap.data() as FamilyMemberRecord);

  return [...members].sort((a, b) => {
    if (a.role === "owner" && b.role !== "owner") {
      return -1;
    }
    if (b.role === "owner" && a.role !== "owner") {
      return 1;
    }
    return toMillis(b.joinedAt ?? b.updatedAt) - toMillis(a.joinedAt ?? a.updatedAt);
  });
}

export async function getFamilyPendingInvites(familyId: string): Promise<FamilyInviteRecord[]> {
  const normalizedFamilyId = requireNonEmpty(familyId, "familyId");
  const q = query(invitesCollection(normalizedFamilyId), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const invites = snap.docs.map((docSnap) => docSnap.data() as FamilyInviteRecord);
  return sortByNewest(invites, (invite) => invite.createdAt);
}

export async function getPendingFamilyInviteForEmail(email: string): Promise<PendingFamilyInviteMatch | null> {
  const normalizedEmail = normalizeEmail(requireNonEmpty(email, "email"));
  const familiesSnap = await getDocs(familiesCollection());

  const activeFamilies = familiesSnap.docs
    .map((docSnap) => docSnap.data() as FamilyRecord)
    .filter((family) => family.status === ACTIVE_FAMILY_STATUS);

  let bestMatch: PendingFamilyInviteMatch | null = null;
  let bestTimestamp = 0;

  for (const family of activeFamilies) {
    const inviteSnap = await getDocs(
      query(invitesCollection(family.id), where("email", "==", normalizedEmail), limit(10)),
    );

    for (const docSnap of inviteSnap.docs) {
      const invite = docSnap.data() as FamilyInviteRecord;
      if (invite.status !== "pending") {
        continue;
      }
      const stamp = toMillis(invite.createdAt);
      if (!bestMatch || stamp > bestTimestamp) {
        bestMatch = {
          familyId: family.id,
          familyName: family.name,
          invite,
        };
        bestTimestamp = stamp;
      }
    }
  }

  return bestMatch;
}

export async function inviteFamilyMember(input: CreateFamilyInviteInput): Promise<FamilyInviteRecord> {
  const familyId = requireNonEmpty(input.familyId, "familyId");
  const email = normalizeEmail(requireNonEmpty(input.email, "email"));
  const invitedByUid = requireNonEmpty(input.invitedByUid, "invitedByUid");

  const family = await requireFamilyExists(familyId);
  if (family.status !== ACTIVE_FAMILY_STATUS) {
    throw new Error("Family is not active");
  }

  await ensureFamilyHasCapacity(familyId);

  const existingMembers = await getDocs(
    query(membersCollection(familyId), where("email", "==", email), limit(10)),
  );
  if (
    existingMembers.docs.some((snap) => {
      const member = snap.data() as FamilyMemberRecord;
      return member.email === email && member.status === "active";
    })
  ) {
    throw new Error("This email is already a family member");
  }

  const existingInvites = await getDocs(
    query(invitesCollection(familyId), where("email", "==", email), limit(10)),
  );
  if (
    existingInvites.docs.some((snap) => {
      const invite = snap.data() as FamilyInviteRecord;
      return invite.email === email && invite.status === "pending";
    })
  ) {
    throw new Error("There is already a pending invite for this email");
  }

  const inviteRef = doc(invitesCollection(familyId));
  const createdAt = nowIso();
  const expiresAt = input.expiresAt?.trim() || buildInviteExpiryIso();

  const record: FamilyInviteRecord = {
    id: inviteRef.id,
    email,
    invitedByUid,
    status: "pending",
    createdAt,
    expiresAt,
  };

  await setDoc(inviteRef, {
    ...record,
    createdAt: serverTimestamp(),
  });

  return record;
}

export async function revokeFamilyInvite(familyId: string, inviteId: string): Promise<void> {
  const normalizedFamilyId = requireNonEmpty(familyId, "familyId");
  const normalizedInviteId = requireNonEmpty(inviteId, "inviteId");

  await requireFamilyExists(normalizedFamilyId);

  const inviteRef = doc(invitesCollection(normalizedFamilyId), normalizedInviteId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error("Invite not found");
  }

  const invite = inviteSnap.data() as FamilyInviteRecord;
  if (invite.status !== "pending") {
    throw new Error("Invite is not pending");
  }

  await updateDoc(inviteRef, {
    status: "revoked",
    updatedAt: serverTimestamp(),
  });
}

export async function acceptFamilyInvite(input: AcceptFamilyInviteInput): Promise<FamilyMemberRecord> {
  const familyId = requireNonEmpty(input.familyId, "familyId");
  const inviteId = requireNonEmpty(input.inviteId, "inviteId");
  const uid = requireNonEmpty(input.uid, "uid");
  const email = normalizeEmail(requireNonEmpty(input.email, "email"));

  await requireFamilyExists(familyId);
  await ensureFamilyHasCapacity(familyId);

  const inviteRef = doc(invitesCollection(familyId), inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) {
    throw new Error("Invite not found");
  }

  const invite = inviteSnap.data() as FamilyInviteRecord;
  if (invite.status !== "pending") {
    throw new Error("Invite is not pending");
  }
  if (normalizeEmail(invite.email) !== email) {
    throw new Error("Invite email does not match current user");
  }

  const timestamp = nowIso();
  const member: FamilyMemberRecord = {
    uid,
    email,
    role: "member",
    status: "active",
    joinedAt: timestamp,
    updatedAt: timestamp,
  };

  const batch = writeBatch(db());
  batch.set(doc(membersCollection(familyId), uid), {
    ...member,
    updatedAt: serverTimestamp(),
  });
  batch.update(inviteRef, {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });
  batch.set(
    usersDoc(uid),
    {
      familyMembership: membershipRecord(familyId, "member"),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );


  await batch.commit();
  return member;
}

export async function removeFamilyMember(familyId: string, memberUid: string): Promise<void> {
  const normalizedFamilyId = requireNonEmpty(familyId, "familyId");
  const normalizedMemberUid = requireNonEmpty(memberUid, "memberUid");

  const family = await requireFamilyExists(normalizedFamilyId);
  const memberRef = doc(membersCollection(normalizedFamilyId), normalizedMemberUid);
  const memberSnap = await getDoc(memberRef);

  if (!memberSnap.exists()) {
    throw new Error("Family member not found");
  }

  const member = memberSnap.data() as FamilyMemberRecord;
  if (member.role === "owner" || family.ownerUid === normalizedMemberUid) {
    throw new Error("Owner cannot be removed");
  }

  const batch = writeBatch(db());
  batch.delete(memberRef);
  batch.set(
    usersDoc(normalizedMemberUid),
    {
      familyMembership: deleteField(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
}

export async function createSharedList(input: CreateSharedListInput): Promise<SharedListRecord> {
  const familyId = requireNonEmpty(input.familyId, "familyId");
  const createdByUid = requireNonEmpty(input.createdByUid, "createdByUid");
  const name = requireNonEmpty(input.name, "name");

  await requireFamilyExists(familyId);

  const listRef = doc(listsCollection(familyId));
  const timestamp = nowIso();

  const record: SharedListRecord = {
    id: listRef.id,
    familyId,
    name,
    createdByUid,
    updatedByUid: createdByUid,
    archived: false,
    itemCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(listRef, {
    ...record,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return record;
}

export async function copyPersonalListToSharedList(
  input: CopyPersonalListToSharedListInput,
): Promise<{ itemCount: number }> {
  const familyId = requireNonEmpty(input.familyId, "familyId");
  const sharedListId = requireNonEmpty(input.sharedListId, "sharedListId");
  const copiedByUid = requireNonEmpty(input.copiedByUid, "copiedByUid");

  await requireFamilyExists(familyId);

  const listRef = doc(listsCollection(familyId), sharedListId);
  const listSnap = await getDoc(listRef);
  if (!listSnap.exists()) {
    throw new Error("Shared list not found");
  }

  const batch = writeBatch(db());
  const sanitizedItems = input.items.map((item) => toSharedListItemRecord(item, copiedByUid));

  for (const item of sanitizedItems) {
    batch.set(doc(collection(listRef, "items"), item.id), item);
  }

  batch.update(listRef, {
    itemCount: sanitizedItems.length,
    updatedByUid: copiedByUid,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return { itemCount: sanitizedItems.length };
}

export async function getFamilyLists(familyId: string): Promise<GetFamilyListsResult> {
  const normalizedFamilyId = requireNonEmpty(familyId, "familyId");
  const q = query(listsCollection(normalizedFamilyId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => docSnap.data() as SharedListRecord);
}
