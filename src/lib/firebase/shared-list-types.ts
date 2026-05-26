// FILE: src/lib/firebase/shared-list-types.ts

export type FamilyPlanType = "family";
export type FamilyStatus = "active" | "paused" | "canceled";
export type FamilyMemberRole = "owner" | "member";
export type FamilyMemberStatus = "invited" | "active" | "removed";
export type FamilyInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type SharedListRecord = {
  id: string;
  familyId: string;
  name: string;
  createdByUid: string;
  updatedByUid: string;
  archived: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SharedListItemRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  store: string;
  checked: boolean;
  createdByUid: string;
  updatedByUid: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyRecord = {
  id: string;
  ownerUid: string;
  name: string;
  planType: FamilyPlanType;
  maxMembers: 5;
  status: FamilyStatus;
  createdAt: string;
  updatedAt: string;
};

export type FamilyMemberRecord = {
  uid: string;
  email: string;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
  joinedAt: string | null;
  updatedAt: string;
};

export type FamilyInviteRecord = {
  id: string;
  email: string;
  invitedByUid: string;
  status: FamilyInviteStatus;
  createdAt: string;
  expiresAt: string;
};

export type UserFamilyMembershipRecord = {
  familyId: string;
  role: FamilyMemberRole;
  status: Extract<FamilyMemberStatus, "invited" | "active">;
};

export type CreateFamilyInput = {
  ownerUid: string;
  ownerEmail: string;
  familyName: string;
};

export type CreateFamilyInviteInput = {
  familyId: string;
  email: string;
  invitedByUid: string;
  expiresAt: string;
};

export type CreateSharedListInput = {
  familyId: string;
  name: string;
  createdByUid: string;
};

export type CopyPersonalListItemInput = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  store: string;
  checked: boolean;
};

export type CopyPersonalListToSharedListInput = {
  familyId: string;
  sharedListId: string;
  copiedByUid: string;
  items: CopyPersonalListItemInput[];
};

export type SharedListSummary = Pick<
  SharedListRecord,
  "id" | "familyId" | "name" | "archived" | "itemCount" | "updatedAt"
>;
