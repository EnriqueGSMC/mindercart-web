export type Language = "es" | "en";
export type FontScale = "normal" | "large" | "xlarge";

export type SourceListMetadata = {
  sourceListName?: string;
  savedListName?: string;
  originListName?: string;
  listName?: string;
};

export type ItemMaster = {
  id: string;
  itemKey: string;
  name: string;
  nameEs?: string;
  nameEn?: string;
  category: string;
  unit: string;
  defaultStore: string;
  active: boolean;
  createdAt: number;
};

export type GeneralListItem = SourceListMetadata & {
  id: string;
  itemKey?: string;
  name: string;
  category: string;
  unit: string;
  quantity: string;
  store: string;
  active: boolean;
  lastUsedAt: number | null;
};

export type ActiveShoppingListItem = SourceListMetadata & {
  id: string;
  itemKey?: string;
  name: string;
  category: string;
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

export type StoreProfile = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  notes: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type MinderCartSettings = {
  language: Language;
  preferredStore: string;
  fontScale: FontScale;
};

export type MinderCartState = {
  itemsMaster: ItemMaster[];
  generalListItems: GeneralListItem[];
  activeShoppingListItems: ActiveShoppingListItem[];
  shoppingHistory: ShoppingHistoryEntry[];
  storeProfiles: StoreProfile[];
  settings: MinderCartSettings;
};

export type Suggestion = SourceListMetadata & {
  id: string;
  itemKey?: string;
  name: string;
  category: string;
  unit: string;
  quantity?: string;
  store: string;
  source: "items_master" | "general_list";
};
