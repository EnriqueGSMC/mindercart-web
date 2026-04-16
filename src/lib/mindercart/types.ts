// FILE: src/lib/mindercart/types.ts
export type Language = "es" | "en";

export type ItemMaster = {
  id: string;
  name: string;
  unit: string;
  defaultStore: string;
  active: boolean;
  createdAt: number;
};

export type GeneralListItem = {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  store: string;
  active: boolean;
  lastUsedAt: number | null;
};

export type ActiveShoppingListItem = {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  store: string;
  checked: boolean;
  sourceTypes: string[];
  sourceRefs: string[];
  createdAt: number;
};

export type ShoppingHistoryEntry = {
  id: string;
  closedAt: number;
  store: string;
  items: ActiveShoppingListItem[];
};

export type MinderCartSettings = {
  language: Language;
  preferredStore: string;
};

export type MinderCartState = {
  itemsMaster: ItemMaster[];
  generalListItems: GeneralListItem[];
  activeShoppingListItems: ActiveShoppingListItem[];
  shoppingHistory: ShoppingHistoryEntry[];
  settings: MinderCartSettings;
}