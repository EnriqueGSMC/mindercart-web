import type {
  GeneralListItem,
  ItemMaster,
  MinderCartState,
  ShoppingHistoryEntry,
  Suggestion,
} from "@/lib/mindercart/types";

export const CHANGE_EVENT = "mindercart:changed";
const STORAGE_KEY = "mindercart_state_v1";

function now() {
  return Date.now();
}

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
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

function escapeHtml(value: unknown) {
  return safe(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const CATEGORY_OPTIONS = [
  "Abarrotes",
  "Bebidas",
  "Condimentos",
  "Frutas",
  "Higiene",
  "Lácteos",
  "Limpieza",
  "Panadería",
  "Verduras",
  "General",
] as const;

const SEED_GENERAL_ITEMS: GeneralListItem[] = [
  { id: uid(), name: "Leche", category: "Lácteos", unit: "pza", quantity: "1", store: "Walmart", active: true, lastUsedAt: null },
  { id: uid(), name: "Huevos", category: "Abarrotes", unit: "pza", quantity: "1", store: "Walmart", active: true, lastUsedAt: null },
  { id: uid(), name: "Tortillas", category: "Abarrotes", unit: "pza", quantity: "1", store: "Walmart", active: true, lastUsedAt: null },
  { id: uid(), name: "Papel higiénico", category: "Higiene", unit: "pza", quantity: "1", store: "Costco", active: true, lastUsedAt: null },
  { id: uid(), name: "Detergente", category: "Limpieza", unit: "pza", quantity: "1", store: "Costco", active: true, lastUsedAt: null },
];

function defaultState(): MinderCartState {
  const itemsMaster: ItemMaster[] = SEED_GENERAL_ITEMS.map((item) => ({
    id: uid(),
    name: item.name,
    category: item.category,
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

    const parsed = JSON.parse(raw) as Partial<MinderCartState>;

    return {
      itemsMaster: Array.isArray(parsed.itemsMaster) ? parsed.itemsMaster : [],
      generalListItems: Array.isArray(parsed.generalListItems) ? parsed.generalListItems : [],
      activeShoppingListItems: Array.isArray(parsed.activeShoppingListItems)
        ? parsed.activeShoppingListItems
        : [],
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
  emitChange();
}

function numericSum(a: string, b: string) {
  const na = Number(String(a).replace(",", "."));
  const nb = Number(String(b).replace(",", "."));

  if (Number.isFinite(na) && Number.isFinite(nb)) {
    return String(na + nb);
  }

  return safe(b) || safe(a) || "1";
}

export function itemKey(item: { name: string; unit: string; store: string }) {
  return `${normalize(item.name)}__${normalize(item.unit)}__${normalize(item.store)}`;
}

function upsertItemMaster(
  itemsMaster: ItemMaster[],
  input: { name: string; category: string; unit: string; store: string }
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
            category: safe(input.category) || item.category,
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
      category: safe(input.category) || "General",
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
  input: { name: string; category: string; unit: string; quantity: string; store: string }
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
            category: safe(input.category) || item.category,
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
      category: safe(input.category) || "General",
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
  category: string;
  unit: string;
  quantity: string;
  store: string;
}) {
  const state = readState();

  const name = safe(input.name);
  const category = safe(input.category) || "General";
  const unit = safe(input.unit) || "pza";
  const quantity = safe(input.quantity) || "1";
  const store = safe(input.store) || state.settings.preferredStore || "Walmart";

  if (!name) {
    throw new Error("Artículo requerido");
  }

  const key = itemKey({ name, unit, store });
  const existing = state.activeShoppingListItems.find((item) => itemKey(item) === key);

  const activeShoppingListItems = existing
    ? state.activeShoppingListItems.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              category,
              quantity: numericSum(item.quantity, quantity),
              sourceTypes: Array.from(new Set([...item.sourceTypes, "quick_add"])),
            }
          : item
      )
    : [
        {
          id: uid(),
          name,
          category,
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
    itemsMaster: upsertItemMaster(state.itemsMaster, { name, category, unit, store }),
    generalListItems: upsertGeneralListItem(state.generalListItems, {
      name,
      category,
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
    const key = itemKey(item);
    const existing = activeShoppingListItems.find((row) => itemKey(row) === key);

    if (existing) {
      activeShoppingListItems = activeShoppingListItems.map((row) =>
        row.id === existing.id
          ? {
              ...row,
              category: item.category || row.category,
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
          category: item.category || "General",
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

export function closeShoppingForStore(storeName: string) {
  const state = readState();
  const store = safe(storeName);

  if (!store) return state;

  const storeItems = state.activeShoppingListItems.filter(
    (item) => safe(item.store) === store
  );

  if (storeItems.length === 0) return state;

  const boughtItems = storeItems.filter((item) => item.checked);
  const nextHistory =
    boughtItems.length > 0
      ? [
          {
            id: uid(),
            closedAt: now(),
            store,
            items: boughtItems,
          },
          ...state.shoppingHistory,
        ]
      : state.shoppingHistory;

  const next: MinderCartState = {
    ...state,
    shoppingHistory: nextHistory,
    activeShoppingListItems: state.activeShoppingListItems.filter(
      (item) => safe(item.store) !== store || !item.checked
    ),
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

export function buildSuggestions(query: string): Suggestion[] {
  const state = readState();
  const q = normalize(query);

  if (q.length < 2) return [];

  const raw: Suggestion[] = [
    ...state.itemsMaster.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category || "General",
      unit: item.unit,
      store: item.defaultStore,
      source: "items_master" as const,
    })),
    ...state.generalListItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category || "General",
      unit: item.unit,
      store: item.store,
      source: "general_list" as const,
    })),
  ];

  const starts = raw.filter((item) => normalize(item.name).startsWith(q));
  const includes = raw.filter(
    (item) => !normalize(item.name).startsWith(q) && normalize(item.name).includes(q)
  );

  const merged = [...starts, ...includes];
  const seen = new Set<string>();

  return merged
    .filter((item) => {
      const key = `${normalize(item.name)}__${normalize(item.unit)}__${normalize(item.store)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

export function groupByStore<T extends { store: string }>(rows: T[]) {
  const map = new Map<string, T[]>();

  for (const row of rows) {
    const store = safe(row.store) || "Sin tienda";
    const current = map.get(store) || [];
    current.push(row);
    map.set(store, current);
  }

  return [...map.entries()]
    .map(([store, items]) => ({ store, items }))
    .sort((a, b) => a.store.localeCompare(b.store));
}

export function groupGeneralListByCategory(rows: GeneralListItem[]) {
  const map = new Map<string, GeneralListItem[]>();

  for (const row of rows) {
    const category = safe(row.category) || "General";
    const current = map.get(category) || [];
    current.push(row);
    map.set(category, current);
  }

  return [...map.entries()]
    .map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) => safe(a.name).localeCompare(safe(b.name))),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function buildShoppingListText() {
  const state = readState();
  const groups = groupByStore(state.activeShoppingListItems);

  return groups
    .map((group) =>
      [group.store, ...group.items.map((item) => `${item.name} ${item.quantity}`)].join("\n")
    )
    .join("\n\n")
    .trim();
}

export function buildShoppingListHtml() {
  const state = readState();
  const groups = groupByStore(state.activeShoppingListItems);

  const body = groups
    .map((group) => {
      const rows = group.items
        .map(
          (item) => `
            <div style="padding:8px 0;border-bottom:1px solid #eee;">
              <div style="font-weight:700;">${escapeHtml(item.name)}</div>
              <div style="font-size:12px;color:#555;">${escapeHtml(item.quantity)} ${escapeHtml(item.unit)}</div>
            </div>
          `
        )
        .join("");

      return `
        <section style="margin-bottom:20px;">
          <div style="font-size:20px;font-weight:800;margin-bottom:8px;">${escapeHtml(group.store)}</div>
          ${rows}
        </section>
      `;
    })
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>MinderCart PDF</title>
      </head>
      <body style="font-family:Arial,sans-serif;padding:24px;color:#111;">
        <div style="font-size:28px;font-weight:900;margin-bottom:16px;">Carrito</div>
        ${body || '<div>No hay artículos.</div>'}
      </body>
    </html>
  `;
}
