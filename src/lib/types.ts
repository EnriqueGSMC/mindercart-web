// FILE: src/lib/types.ts
export type PurchaseItem = {
  id: string;
  name: string;
  qty: number;
  unit?: string | null;
  purchaseStatus?: "C" | "NC";
  note?: string | null;
  received?: boolean;
};

export type ReceiptType = "FULL" | "PARTIAL";

export type PurchaseOrder = {
  id: string;

  supplierName: string;
  orderNumber?: string | null;

  // Recomendado: Firestore Timestamp. (en UI lo formateamos)
  closedAt?: any;
  receivedAt?: any;

  status: "CLOSED" | "RECEIVED" | "CLOSED_FINAL";

  deliveredByUserId?: string | null;
  deliveredByName?: string | null;

  receivedByUserId?: string | null;
  receivedByName?: string | null;

  receiptType?: ReceiptType;

  items: PurchaseItem[];
};

export type UserLite = {
  id: string;
  name: string;
  role?: string | null;
}