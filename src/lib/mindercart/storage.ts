// FILE: src/lib/mindercart/storage.ts
import type {
  GeneralListItem,
  ItemMaster,
  MinderCartState,
  ShoppingHistoryEntry,
} from "@/lib/mindercart/types";

const STORAGE_KEY = "mindercart_state_v1";

function now() {
  return Date.now();
}

function safe(v: unknown) {
  return String(v ?? "").trim();
}

function normalize(v: unknown) {
  return safe(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uid() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const SEED_GENERAL_ITEMS: GeneralListItem[] = [
  {
    id: uid(),
    name: "Leche",
    unit: "pza",
    quantity: "1",
    store: "Walmart",
    active: true,
    lastUsedAt: null,
  },
  {
    id: uid(),
    name: "Huevos",
    unit: "pza",
    quantity: "1",
    store: "Walmart",
    active: true,
    lastUsedAt: null,
  },
  {
    id: uid(),
    name: "Tortillas",
    unit: "pza",
    quantity: "1",
    store: "Walmart",
    active: true,
    lastUsedAt: null,
  },
  {
    id: uid(),
    name: "Papel higiénico",
    unit: "pza",
    quantity: "1",
    store: "Costco",
    active: true,
    lastUsedAt: null,
  },
  {
    id: uid(),
    name: "Detergente",
    unit: "pza",
    quantity: "1",
    store: "Costco",
    active: true,
    lastUsedAt: null,
  },
];

function defaultState(): MinderCartState {
  const itemsMaster: ItemMaster[] = SEED_GENERAL_ITEMS.map((item) => ({
    id: uid(),
    name: item.name,
    unit: item.unit,
    defaultStore: item.store,
    active: true,
    createdAt: now(),
  }));

  return {
    itemsMaster,
    generalListItems: SEED_GENERAL_ITEMS,
    activeShoppingListItems: [],
    shoppingHistory: [],
    settings: {
      language: "es",
      preferredStore: "Walmart",
    },
  };
}

export function readState(): MinderCartState {
  if (typeof window === "undefined") return defaultState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = defaultState();
      writeState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as MinderCartState;
    return {
      itemsMaster: Array.isArray(parsed.itemsMaster) ? parsed.itemsMaster : [],
      generalListItems: Array.isArray(parsed.generalListItems) ? parsed.generalListItems : [],
      activeShoppingListItems: Array.isArray(parsed.activeShoppingListItems) ? parsed.activeShoppingListItems : [],
      shoppingHistory: Array.isArray(parsed.shoppingHistory) ? parsed.shoppingHistory : [],
      settings: {
        language: parsed.settings?.language === "en" ? "en" : "es",
        preferredStore: safe(parsed.settings?.preferredStore) || "Walmart",
      },
    };
  } catch {
    const initial = defaultState();
    writeState(initial);
    return initial;
  }
}

export function writeState(state: MinderCartState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function numericSum(a: string, b: string) {
  const na = Number(String(a).replace(",", "."));
  const nb = Number(String(b).replace(",", "."));
  if (Number.isFinite(na) && Number.isFinite(nb)) return String(na + nb);
  return safe(b) || safe(a) || "1";
}

function activeKey(item: { name: string; unit: string; store: string }) {
  return `${normalize(item.name)}__${normalize(item.unit)}__${normalize(item.store)}`;
}

function upsertItemMaster(
  itemsMaster: ItemMaster[],
  input: { name: string; unit: string; store: string }
): ItemMaster[] {
  const key = `${normalize(input.name)}__${normalize(input.unit)}`;
  const existing = itemsMaster.find(
    (item) => `${normalize(item.name)}__${normalize(item.unit)}` === key
  );

  if (existing) {
    return itemsMaster.map((item) =>
      item.id === existing.id
        ? {
            ...item,
            defaultStore: safe(input.store) || item.defaultStore,
            active: true,
          }
        : item
    );
  }

  return [
    {
      id: uid(),
      name: safe(input.name),
      unit: safe(input.unit),
      defaultStore: safe(input.store),
      active: true,
      createdAt: now(),
    },
    ...itemsMaster,
  ];
}

function upsertGeneralListItem(
  generalListItems: GeneralListItem[],
  input: { name: string; unit: string; quantity: string; store: string }
): GeneralListItem[] {
  const key = `${normalize(input.name)}__${normalize(input.unit)}`;
  const existing = generalListItems.find(
    (item) => `${normalize(item.name)}__${normalize(item.unit)}` === key
  );

  if (existing) {
    return generalListItems.map((item) =>
      item.id === existing.id
        ? {
            ...item,
            quantity: safe(input.quantity) || item.quantity,
            store: safe(input.store) || item.store,
            active: true,
            lastUsedAt: now(),
          }
        : item
    );
  }

  return [
    {
      id: uid(),
      name: safe(input.name),
      unit: safe(input.unit),
      quantity: safe(input.quantity) || "1",
      store: safe(input.store),
      active: true,
      lastUsedAt: now(),
    },
    ...generalListItems,
  ];
}

export function addQuickNeed(input: {
  name: string;
  unit: string;
  quantity: string;
  store: string;
}) {
  const state = readState();

  const name = safe(input.name);
  const unit = safe(input.unit) || "pza";
  const quantity = safe(input.quantity) || "1";
  const store = safe(input.store) || state.settings.preferredStore || "Walmart";

  if (!name) {
    throw new Error("Artículo requerido");
  }

  const key = activeKey({ name, unit, store });
  const existing = state.activeShoppingListItems.find((item) => activeKey(item) === key);

  const activeShoppingListItems = existing
    ? state.activeShoppingListItems.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              quantity: numericSum(item.quantity, quantity),
              sourceTypes: Array.from(new Set([...item.sourceTypes, "quick_add"])),
            }
          : item
      )
    : [
        {
          id: uid(),
          name,
          unit,
          quantity,
          store,
          checked: false,
          sourceTypes: ["quick_add"],
          sourceRefs: [],
          createdAt: now(),
        },
        ...state.activeShoppingListItems,
      ];

  const next: MinderCartState = {
    ...state,
    itemsMaster: upsertItemMaster(state.itemsMaster, { name, unit, store }),
    generalListItems: upsertGeneralListItem(state.generalListItems, {
      name,
      unit,
      quantity,
      store,
    }),
    activeShoppingListItems,
  };

  writeState(next);
  return next;
}

export function addGeneralSelections(ids: string[]) {
  const state = readState();
  const selected = state.generalListItems.filter((item) => ids.includes(item.id));

  let activeShoppingListItems = [...state.activeShoppingListItems];
  let generalListItems = [...state.generalListItems];

  for (const item of selected) {
    const key = activeKey(item);
    const existing = activeShoppingListItems.find((row) => activeKey(row) === key);

    if (existing) {
      activeShoppingListItems = activeShoppingListItems.map((row) =>
        row.id === existing.id
          ? {
              ...row,
              quantity: numericSum(row.quantity, item.quantity),
              sourceTypes: Array.from(new Set([...row.sourceTypes, "general_list"])),
              sourceRefs: Array.from(new Set([...row.sourceRefs, item.id])),
            }
          : row
      );
    } else {
      activeShoppingListItems = [
        {
          id: uid(),
          name: item.name,
          unit: item.unit,
          quantity: item.quantity || "1",
          store: item.store || state.settings.preferredStore,
          checked: false,
          sourceTypes: ["general_list"],
          sourceRefs: [item.id],
          createdAt: now(),
        },
        ...activeShoppingListItems,
      ];
    }

    generalListItems = generalListItems.map((row) =>
      row.id === item.id ? { ...row, lastUsedAt: now() } : row
    );
  }

  const next: MinderCartState = {
    ...state,
    activeShoppingListItems,
    generalListItems,
  };

  writeState(next);
  return next;
}

export function toggleActiveItemChecked(id: string, checked: boolean) {
  const state = readState();

  const next: MinderCartState = {
    ...state,
    activeShoppingListItems: state.activeShoppingListItems.map((item) =>
      item.id === id ? { ...item, checked } : item
    ),
  };

  writeState(next);
  return next;
}

export function removeActiveItem(id: string) {
  const state = readState();

  const next: MinderCartState = {
    ...state,
    activeShoppingListItems: state.activeShoppingListItems.filter((item) => item.id !== id),
  };

  writeState(next);
  return next;
}

export function closeActiveShoppingList() {
  const state = readState();
  if (state.activeShoppingListItems.length === 0) return state;

  const store =
    state.activeShoppingListItems[0]?.store || state.settings.preferredStore || "Walmart";

  const entry: ShoppingHistoryEntry = {
    id: uid(),
    closedAt: now(),
    store,
    items: state.activeShoppingListItems,
  };

  const next: MinderCartState = {
    ...state,
    shoppingHistory: [entry, ...state.shoppingHistory],
    activeShoppingListItems: [],
  };

  writeState(next);
  return next;
}

export function saveSettings(input: { language: "es" | "en"; preferredStore: string }) {
  const state = readState();

  const next: MinderCartState = {
    ...state,
    settings: {
      language: input.language === "en" ? "en" : "es",
      preferredStore: safe(input.preferredStore) || "Walmart",
    },
  };

  writeState(next);
  return next;
}