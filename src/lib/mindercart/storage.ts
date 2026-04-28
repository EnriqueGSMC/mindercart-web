import { unitLabel } from "@/lib/mindercart/i18n";
import { SEED_GENERAL_ITEMS } from "@/lib/mindercart/seed-items";
import type {
  FontScale,
  GeneralListItem,
  ItemMaster,
  Language,
  MinderCartState,
  StoreProfile,
  Suggestion,
} from "@/lib/mindercart/types";

export const CHANGE_EVENT = "mindercart:changed";
const STORAGE_KEY = "mindercart_state_v15";

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

function formatDisplayDate(lang: Language) {
  try {
    return new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString();
  }
}

function escapeHtml(value: unknown) {
  return safe(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pendingOnly<T extends { checked?: boolean }>(rows: T[]) {
  return rows.filter((row) => !row.checked);
}

const DEFAULT_CATEGORY = "Otro / Temporal";

export const CATEGORY_OPTIONS = [
  "Frutas y Verduras",
  "Carnes, Pollo y Pescados",
  "Lácteos y Refrigerados",
  "Panadería y Tortillería",
  "Abarrotes",
  "Bebidas",
  "Congelados",
  "Limpieza y Hogar",
  "Farmacia, Bebé y Cuidado Personal",
  "Mascotas",
  "Cajas y Salida",
  DEFAULT_CATEGORY,
] as const;

export const UNIT_OPTIONS = [
  "pza",
  "paquete",
  "caja",
  "lata",
  "botella",
  "frasco",
  "bolsa",
  "rollo",
  "docena",
  "g",
  "kg",
  "oz",
  "lb",
  "ml",
  "l",
  "gal",
] as const;

export const STORE_OPTIONS = ["HEB", "Costco", "Sam\'s"] as const;

function emptyStoreProfile(name = ""): StoreProfile {
  return {
    id: uid(),
    name: safe(name),
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
    active: true,
    createdAt: now(),
    updatedAt: now(),
  };
}

function normalizeStoreProfile(input: Partial<StoreProfile> & { name?: unknown }, fallbackName = ""): StoreProfile {
  const base = emptyStoreProfile(fallbackName);

  return {
    id: safe(input.id) || base.id,
    name: safe(input.name) || safe(fallbackName),
    addressLine1: safe(input.addressLine1),
    addressLine2: safe(input.addressLine2),
    city: safe(input.city),
    state: safe(input.state),
    postalCode: safe(input.postalCode),
    country: safe(input.country),
    phone: safe(input.phone),
    notes: safe(input.notes),
    active: input.active !== false,
    createdAt: typeof input.createdAt === "number" ? input.createdAt : base.createdAt,
    updatedAt: typeof input.updatedAt === "number" ? input.updatedAt : now(),
  };
}

function collectKnownStoreNames(
  source: Partial<MinderCartState> & { storeProfiles?: StoreProfile[] }
): string[] {
  const names = [
    ...STORE_OPTIONS,
    safe(source.settings?.preferredStore),
    ...((source.storeProfiles || []).map((profile) => profile.name)),
    ...((source.itemsMaster || []).map((item) => item.defaultStore)),
    ...((source.generalListItems || []).map((item) => item.store)),
    ...((source.activeShoppingListItems || []).map((item) => item.store)),
    ...((source.shoppingHistory || []).flatMap((group) => [
      group.store,
      ...(Array.isArray(group.items) ? group.items.map((item) => item.store) : []),
    ])),
  ];

  const map = new Map<string, string>();

  for (const name of names) {
    const cleaned = safe(name);
    const key = normalize(cleaned);
    if (!cleaned || !key || map.has(key)) continue;
    map.set(key, cleaned);
  }

  return Array.from(map.values());
}

function mergeStoreProfiles(profiles: StoreProfile[], fallbackNames: string[]): StoreProfile[] {
  const map = new Map<string, StoreProfile>();

  for (const profile of profiles) {
    const normalizedName = normalize(profile.name);
    if (!normalizedName) continue;
    map.set(normalizedName, normalizeStoreProfile(profile, profile.name));
  }

  for (const name of fallbackNames) {
    const normalizedName = normalize(name);
    if (!normalizedName || map.has(normalizedName)) continue;
    map.set(normalizedName, normalizeStoreProfile({ name }, name));
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function renameStoreReferences(state: MinderCartState, previousName: string, nextName: string): MinderCartState {
  const from = safe(previousName);
  const to = safe(nextName);

  if (!from || !to || normalize(from) === normalize(to)) return state;

  const matchesPrevious = (value: unknown) => normalize(value) === normalize(from);

  return {
    ...state,
    itemsMaster: state.itemsMaster.map((item) =>
      matchesPrevious(item.defaultStore) ? { ...item, defaultStore: to } : item
    ),
    generalListItems: state.generalListItems.map((item) =>
      matchesPrevious(item.store) ? { ...item, store: to } : item
    ),
    activeShoppingListItems: state.activeShoppingListItems.map((item) =>
      matchesPrevious(item.store) ? { ...item, store: to } : item
    ),
    shoppingHistory: state.shoppingHistory.map((group) => ({
      ...group,
      store: matchesPrevious(group.store) ? to : group.store,
      items: group.items.map((item) => (matchesPrevious(item.store) ? { ...item, store: to } : item)),
    })),
    settings: {
      ...state.settings,
      preferredStore: matchesPrevious(state.settings.preferredStore) ? to : state.settings.preferredStore,
    },
  };
}


const SEED_BY_ITEM_KEY = new Map(SEED_GENERAL_ITEMS.map((item) => [item.itemKey, item]));
const SEED_BY_NAME = new Map<string, (typeof SEED_GENERAL_ITEMS)[number]>();

for (const item of SEED_GENERAL_ITEMS) {
  SEED_BY_NAME.set(normalize(item.nameEs), item);
  SEED_BY_NAME.set(normalize(item.nameEn), item);
}

function makeItemKey(value: unknown) {
  const normalized = normalize(value).replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  return normalized || "custom-item";
}

function getSeedItem(value: { itemKey?: unknown; name?: unknown } | string) {
  if (typeof value === "string") return SEED_BY_NAME.get(normalize(value)) || null;

  const directKey = safe(value.itemKey);
  if (directKey && SEED_BY_ITEM_KEY.has(directKey)) return SEED_BY_ITEM_KEY.get(directKey) || null;

  const byName = safe(value.name);
  if (byName && SEED_BY_NAME.has(normalize(byName))) return SEED_BY_NAME.get(normalize(byName)) || null;

  return null;
}

function localizedMasterName(
  item: Pick<ItemMaster, "name" | "nameEs" | "nameEn">,
  lang: Language
) {
  const localized = lang === "en" ? safe(item.nameEn) || safe(item.name) : safe(item.nameEs) || safe(item.name);
  return localized || safe(item.name);
}

function itemSearchTerms(item: Pick<ItemMaster, "itemKey" | "name" | "nameEs" | "nameEn">) {
  return [...new Set([item.itemKey, item.name, item.nameEs, item.nameEn].map(normalize).filter(Boolean))];
}

function localizeRowName<T extends { itemKey?: string; name: string }>(
  row: T,
  catalogMap: Map<string, ItemMaster>,
  lang: Language
): T {
  const itemKey = safe(row.itemKey);
  if (!itemKey) return row;

  const master = catalogMap.get(itemKey);
  if (!master) return row;

  return {
    ...row,
    name: localizedMasterName(master, lang),
  };
}

function enrichItemMaster(item: ItemMaster): ItemMaster {
  const seed = getSeedItem({ itemKey: item.itemKey, name: item.name });
  const fallbackKey = safe(item.itemKey) || seed?.itemKey || makeItemKey(item.name);

  return {
    ...normalizeGeneralListItem(item),
    itemKey: fallbackKey,
    nameEs: seed?.nameEs || safe(item.nameEs) || safe(item.name),
    nameEn: seed?.nameEn || safe(item.nameEn) || safe(item.name),
    name: safe(item.name) || seed?.nameEs || "",
  };
}

function enrichTrackedRow<
  T extends { itemKey?: string; name: string; category?: string | null; unit?: string | null; store?: string | null }
>(row: T): T {
  const seed = getSeedItem({ itemKey: row.itemKey, name: row.name });
  return {
    ...normalizeGeneralListItem(row),
    itemKey: safe(row.itemKey) || seed?.itemKey || "",
    name: safe(row.name) || seed?.nameEs || "",
  };
}

function resolveCatalogMatch(itemsMaster: ItemMaster[], name: string) {
  const key = normalize(name);
  return itemsMaster.find((item) => itemSearchTerms(item).includes(key)) || getSeedItem(name);
}


const CATEGORY_ALIASES: Record<string, string> = {
  "frutas y verduras": "Frutas y Verduras",
  frutas: "Frutas y Verduras",
  verduras: "Frutas y Verduras",
  produce: "Frutas y Verduras",
  "fruits & vegetables": "Frutas y Verduras",

  "carnes, pollo y pescados": "Carnes, Pollo y Pescados",
  "carnes y mariscos": "Carnes, Pollo y Pescados",
  carnes: "Carnes, Pollo y Pescados",
  pollo: "Carnes, Pollo y Pescados",
  pescados: "Carnes, Pollo y Pescados",
  mariscos: "Carnes, Pollo y Pescados",
  "meat & seafood": "Carnes, Pollo y Pescados",
  "meat, poultry & seafood": "Carnes, Pollo y Pescados",

  "lacteos y refrigerados": "Lácteos y Refrigerados",
  lacteos: "Lácteos y Refrigerados",
  refrigerados: "Lácteos y Refrigerados",
  dairy: "Lácteos y Refrigerados",
  refrigerated: "Lácteos y Refrigerados",
  "dairy & refrigerated": "Lácteos y Refrigerados",

  "panaderia y tortilleria": "Panadería y Tortillería",
  panaderia: "Panadería y Tortillería",
  panadería: "Panadería y Tortillería",
  tortilleria: "Panadería y Tortillería",
  tortillería: "Panadería y Tortillería",
  bakery: "Panadería y Tortillería",
  "bakery & tortillas": "Panadería y Tortillería",

  abarrotes: "Abarrotes",
  despensa: "Abarrotes",
  pantry: "Abarrotes",
  "pantry staples": "Abarrotes",
  snacks: "Abarrotes",
  botanas: "Abarrotes",
  "grocery staples": "Abarrotes",

  bebidas: "Bebidas",
  beverages: "Bebidas",

  congelados: "Congelados",
  frozen: "Congelados",

  "limpieza y hogar": "Limpieza y Hogar",
  limpieza: "Limpieza y Hogar",
  hogar: "Limpieza y Hogar",
  home: "Limpieza y Hogar",
  cleaning: "Limpieza y Hogar",
  household: "Limpieza y Hogar",
  "cleaning & home": "Limpieza y Hogar",

  "farmacia, bebe y cuidado personal": "Farmacia, Bebé y Cuidado Personal",
  "farmacia, bebé y cuidado personal": "Farmacia, Bebé y Cuidado Personal",
  farmacia: "Farmacia, Bebé y Cuidado Personal",
  bebe: "Farmacia, Bebé y Cuidado Personal",
  bebé: "Farmacia, Bebé y Cuidado Personal",
  "cuidado personal": "Farmacia, Bebé y Cuidado Personal",
  "personal care": "Farmacia, Bebé y Cuidado Personal",
  pharmacy: "Farmacia, Bebé y Cuidado Personal",
  baby: "Farmacia, Bebé y Cuidado Personal",
  "pharmacy, baby & personal care": "Farmacia, Bebé y Cuidado Personal",

  mascotas: "Mascotas",
  "pet care": "Mascotas",
  pets: "Mascotas",

  "cajas y salida": "Cajas y Salida",
  cajas: "Cajas y Salida",
  salida: "Cajas y Salida",
  checkout: "Cajas y Salida",
  "front end": "Cajas y Salida",
  "checkout & front end": "Cajas y Salida",

  "otro / temporal": DEFAULT_CATEGORY,
  "otro/temporal": DEFAULT_CATEGORY,
  otro: DEFAULT_CATEGORY,
  temporal: DEFAULT_CATEGORY,
  general: DEFAULT_CATEGORY,
  "other / seasonal": DEFAULT_CATEGORY,
  "other/seasonal": DEFAULT_CATEGORY,
};

function canonicalizeCategory(value: unknown) {
  const clean = safe(value);
  if (!clean) return DEFAULT_CATEGORY;
  return CATEGORY_ALIASES[normalize(clean)] || clean;
}

function canonicalizeUnit(value: unknown) {
  const raw = normalize(value);
  if (!raw) return "pza";
  if (["pza", "pzas", "pieza", "piezas", "unidad", "unidades", "ea", "each", "pc", "pcs", "unit", "units", "barra", "bote", "cabeza", "tubo"].includes(raw)) return "pza";
  if (["paquete", "paquetes", "pack", "packs"].includes(raw)) return "paquete";
  if (["caja", "cajas", "box", "boxes"].includes(raw)) return "caja";
  if (["lata", "latas", "can", "cans"].includes(raw)) return "lata";
  if (["botella", "botellas", "bottle", "bottles"].includes(raw)) return "botella";
  if (["frasco", "frascos", "jar", "jars"].includes(raw)) return "frasco";
  if (["bolsa", "bolsas", "bag", "bags"].includes(raw)) return "bolsa";
  if (["rollo", "rollos", "roll", "rolls"].includes(raw)) return "rollo";
  if (["docena", "docenas", "dozen", "dozens"].includes(raw)) return "docena";
  if (["g", "gr", "grs", "gramo", "gramos", "gram", "grams"].includes(raw)) return "g";
  if (["kg", "kilo", "kilos", "kilogramo", "kilogramos", "kilogram", "kilograms"].includes(raw)) return "kg";
  if (["oz", "onza", "onzas", "ounce", "ounces"].includes(raw)) return "oz";
  if (["lb", "libra", "libras", "pound", "pounds"].includes(raw)) return "lb";
  if (["ml", "mililitro", "mililitros", "milliliter", "milliliters"].includes(raw)) return "ml";
  if (["l", "lt", "lts", "litro", "litros", "liter", "liters"].includes(raw)) return "l";
  if (["gal", "galon", "galones", "gallon", "gallons"].includes(raw)) return "gal";
  return "pza";
}

function cleanStore(value: unknown) {
  return safe(value);
}

function normalizeGeneralListItem<T extends { category?: string | null; unit?: string | null; store?: string | null }>(item: T): T {
  const next = {
    ...item,
    category: canonicalizeCategory(item.category),
  } as T & { unit?: string; store?: string };

  if ("unit" in item) next.unit = canonicalizeUnit((item as { unit?: string | null }).unit);
  if ("store" in item) next.store = cleanStore((item as { store?: string | null }).store);

  return next as T;
}

function defaultState(): MinderCartState {
  const itemsMaster: ItemMaster[] = SEED_GENERAL_ITEMS.map((item) => ({
    id: uid(),
    itemKey: item.itemKey,
    name: item.nameEs,
    nameEs: item.nameEs,
    nameEn: item.nameEn,
    category: canonicalizeCategory(item.category),
    unit: canonicalizeUnit(item.unit),
    defaultStore: "",
    active: true,
    createdAt: now(),
  }));

  return {
    itemsMaster,
    generalListItems: [],
    activeShoppingListItems: [],
    shoppingHistory: [],
    storeProfiles: mergeStoreProfiles([], [...STORE_OPTIONS]),
    settings: {
      language: "es",
      preferredStore: "HEB",
      fontScale: "normal",
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
    const base = defaultState();

    const language: Language = parsed.settings?.language === "en" ? "en" : "es";
    const itemsMasterBase =
      Array.isArray(parsed.itemsMaster) && parsed.itemsMaster.length > 0
        ? parsed.itemsMaster.map((item) => enrichItemMaster(item as ItemMaster))
        : base.itemsMaster.map((item) => enrichItemMaster(item));

    const catalogMap = new Map(itemsMasterBase.map((item) => [item.itemKey, item]));

    const generalListItems = Array.isArray(parsed.generalListItems)
      ? parsed.generalListItems.map((item) => localizeRowName(enrichTrackedRow(item), catalogMap, language))
      : [];

    const activeShoppingListItems = Array.isArray(parsed.activeShoppingListItems)
      ? parsed.activeShoppingListItems.map((item) => localizeRowName(enrichTrackedRow(item), catalogMap, language))
      : [];

    const shoppingHistory = Array.isArray(parsed.shoppingHistory)
      ? parsed.shoppingHistory.map((group) => ({
          ...group,
          items: Array.isArray(group?.items)
            ? group.items.map((item) => localizeRowName(enrichTrackedRow(item), catalogMap, language))
            : [],
        }))
      : [];

    const preferredStore = safe(parsed.settings?.preferredStore) || "HEB";
    const fontScale =
      parsed.settings?.fontScale === "large" || parsed.settings?.fontScale === "xlarge"
        ? parsed.settings.fontScale
        : "normal";

    const storeProfiles = mergeStoreProfiles(
      Array.isArray((parsed as Partial<MinderCartState>).storeProfiles)
        ? (((parsed as Partial<MinderCartState>).storeProfiles || []) as StoreProfile[])
        : [],
      collectKnownStoreNames({
        itemsMaster: itemsMasterBase,
        generalListItems,
        activeShoppingListItems,
        shoppingHistory,
        settings: {
          language,
          preferredStore,
          fontScale,
        },
      })
    );

    return {
      itemsMaster: itemsMasterBase.map((item) => ({
        ...item,
        name: localizedMasterName(item, language),
      })),
      generalListItems,
      activeShoppingListItems,
      shoppingHistory,
      storeProfiles,
      settings: {
        language,
        preferredStore,
        fontScale,
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
  if (Number.isFinite(na) && Number.isFinite(nb)) return String(na + nb);
  return safe(b) || safe(a) || "1";
}

export function itemKey(item: { itemKey?: string; name: string; unit: string; store: string }) {
  return `${safe(item.itemKey) || normalize(item.name)}__${normalize(item.unit)}__${normalize(item.store)}`;
}

function upsertItemMaster(
  itemsMaster: ItemMaster[],
  input: { name: string; category: string; unit: string; store: string }
): ItemMaster[] {
  const match = resolveCatalogMatch(itemsMaster, input.name);
  const nextItemKey = "itemKey" in (match || {}) ? safe((match as { itemKey?: string }).itemKey) : "";
  const seed = getSeedItem({ itemKey: nextItemKey, name: input.name });
  const itemKeyValue = nextItemKey || seed?.itemKey || makeItemKey(input.name);

  const existing = itemsMaster.find((item) => safe(item.itemKey) === itemKeyValue);

  if (existing) {
    return itemsMaster.map((item) =>
      item.id === existing.id
        ? {
            ...item,
            name: safe(input.name) || item.name,
            nameEs: seed?.nameEs || safe(item.nameEs) || safe(item.name),
            nameEn: seed?.nameEn || safe(item.nameEn) || safe(item.name),
            category: canonicalizeCategory(input.category) || item.category,
            unit: canonicalizeUnit(input.unit),
            defaultStore: cleanStore(input.store) || item.defaultStore,
            active: true,
          }
        : item
    );
  }

  return [
    {
      id: uid(),
      itemKey: itemKeyValue,
      name: seed?.nameEs || safe(input.name),
      nameEs: seed?.nameEs || safe(input.name),
      nameEn: seed?.nameEn || safe(input.name),
      category: canonicalizeCategory(input.category) || DEFAULT_CATEGORY,
      unit: canonicalizeUnit(input.unit),
      defaultStore: cleanStore(input.store),
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
  const match = resolveCatalogMatch(readState().itemsMaster, input.name);
  const nextItemKey = "itemKey" in (match || {}) ? safe((match as { itemKey?: string }).itemKey) : "";
  const itemKeyValue = nextItemKey || makeItemKey(input.name);

  const existing = generalListItems.find(
    (item) => (safe(item.itemKey) || `${normalize(item.name)}__${normalize(item.unit)}`) === (itemKeyValue || `${normalize(input.name)}__${normalize(input.unit)}`)
  );

  if (existing) {
    return generalListItems.map((item) =>
      item.id === existing.id
        ? {
            ...item,
            itemKey: itemKeyValue,
            name: safe(input.name) || item.name,
            category: canonicalizeCategory(input.category) || item.category,
            unit: canonicalizeUnit(input.unit),
            quantity: safe(input.quantity) || item.quantity,
            store: cleanStore(input.store) || item.store,
            active: true,
            lastUsedAt: now(),
          }
        : item
    );
  }

  return [
    {
      id: uid(),
      itemKey: itemKeyValue,
      name: safe(input.name),
      category: canonicalizeCategory(input.category) || DEFAULT_CATEGORY,
      unit: canonicalizeUnit(input.unit),
      quantity: safe(input.quantity) || "1",
      store: cleanStore(input.store),
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
  const category = canonicalizeCategory(input.category) || DEFAULT_CATEGORY;
  const unit = canonicalizeUnit(input.unit);
  const quantity = safe(input.quantity) || "1";
  const store = safe(input.store) || state.settings.preferredStore || "HEB";
  const catalogMatch = resolveCatalogMatch(state.itemsMaster, name);
  const catalogItemKey =
    "itemKey" in (catalogMatch || {}) ? safe((catalogMatch as { itemKey?: string }).itemKey) : "";
  const trackedItemKey = catalogItemKey || makeItemKey(name);

  if (!name) throw new Error("Artículo requerido");

  const key = itemKey({ itemKey: trackedItemKey, name, unit, store });
  const existing = state.activeShoppingListItems.find((item) => itemKey(item) === key);

  const activeShoppingListItems = existing
    ? state.activeShoppingListItems.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              itemKey: trackedItemKey,
              category,
              quantity: numericSum(item.quantity, quantity),
              sourceTypes: Array.from(new Set([...item.sourceTypes, "quick_add"])),
            }
          : item
      )
    : [
        {
          id: uid(),
          itemKey: trackedItemKey,
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
              itemKey: safe(item.itemKey) || row.itemKey,
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
          itemKey: safe(item.itemKey),
          name: item.name,
          category: canonicalizeCategory(item.category) || DEFAULT_CATEGORY,
          unit: canonicalizeUnit(item.unit),
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

export function deleteActiveItemEverywhere(id: string) {
  const state = readState();
  const target = state.activeShoppingListItems.find((item) => item.id === id);
  if (!target) return state;

  const sourceRefSet = new Set(target.sourceRefs || []);
  const targetItemKey = safe(target.itemKey);
  const targetName = normalize(target.name);
  const targetUnit = normalize(target.unit);

  const next: MinderCartState = {
    ...state,
    activeShoppingListItems: state.activeShoppingListItems.filter((item) => item.id !== id),
    generalListItems: state.generalListItems.map((item) => {
      const sameSource = sourceRefSet.size > 0 && sourceRefSet.has(item.id);
      const sameItemKey = targetItemKey && safe(item.itemKey) === targetItemKey;
      const sameItem = normalize(item.name) === targetName && normalize(item.unit) === targetUnit;
      return sameSource || sameItemKey || sameItem ? { ...item, active: false } : item;
    }),
    itemsMaster: state.itemsMaster.map((item) => {
      const sameItemKey = targetItemKey && safe(item.itemKey) === targetItemKey;
      const sameItem = normalize(item.name) === targetName && normalize(item.unit) === targetUnit;
      return sameItemKey || sameItem ? { ...item, active: false } : item;
    }),
  };

  writeState(next);
  return next;
}

export function closeShoppingForStore(storeName: string) {
  const state = readState();
  const store = safe(storeName);
  if (!store) return state;

  const storeItems = state.activeShoppingListItems.filter((item) => safe(item.store) === store);
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

export function saveSettings(input: {
  language: Language;
  preferredStore: string;
  fontScale: FontScale;
}) {
  const state = readState();
  const preferredStore = safe(input.preferredStore) || "HEB";

  const next: MinderCartState = {
    ...state,
    storeProfiles: mergeStoreProfiles(state.storeProfiles, [preferredStore]),
    settings: {
      language: input.language === "en" ? "en" : "es",
      preferredStore,
      fontScale:
        input.fontScale === "large" || input.fontScale === "xlarge" ? input.fontScale : "normal",
    },
  };

  writeState(next);
  return next;
}

export function listStoreProfiles() {
  return readState().storeProfiles;
}

export function upsertStoreProfile(input: {
  previousName?: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  notes: string;
  makePreferred?: boolean;
}) {
  const state = readState();
  const previousName = safe(input.previousName);
  const nextName = safe(input.name);

  const existing = state.storeProfiles.find((profile) =>
    normalize(profile.name) === normalize(previousName || nextName)
  );

  const nextProfile = normalizeStoreProfile(
    {
      ...existing,
      ...input,
      id: existing?.id,
      createdAt: existing?.createdAt,
      updatedAt: now(),
      active: true,
    },
    nextName
  );

  let nextState = renameStoreReferences(state, previousName, nextProfile.name);

  const previousKeys = new Set(
    [previousName, nextProfile.name].map((value) => normalize(value)).filter(Boolean)
  );

  const shouldMakePreferred =
    input.makePreferred === true ||
    normalize(state.settings.preferredStore) === normalize(previousName);

  nextState = {
    ...nextState,
    storeProfiles: mergeStoreProfiles(
      [
        ...nextState.storeProfiles.filter((profile) => !previousKeys.has(normalize(profile.name))),
        nextProfile,
      ],
      collectKnownStoreNames({
        ...nextState,
        settings: {
          ...nextState.settings,
          preferredStore: shouldMakePreferred ? nextProfile.name : nextState.settings.preferredStore,
        },
      })
    ),
    settings: {
      ...nextState.settings,
      preferredStore: shouldMakePreferred ? nextProfile.name : nextState.settings.preferredStore,
    },
  };

  writeState(nextState);
  return nextState;
}

export function buildSuggestions(query: string): Suggestion[] {
  const state = readState();
  const lang = state.settings.language;
  const q = normalize(query);
  if (q.length < 2) return [];

  const catalogMap = new Map(state.itemsMaster.map((item) => [item.itemKey, item]));

  const raw = [
    ...state.itemsMaster
      .filter((item) => item.active !== false)
      .map((item) => ({
        id: item.id,
        itemKey: item.itemKey,
        name: localizedMasterName(item, lang),
        category: canonicalizeCategory(item.category) || DEFAULT_CATEGORY,
        unit: canonicalizeUnit(item.unit),
        quantity: "1",
        store: item.defaultStore,
        source: "items_master" as const,
        searchTerms: itemSearchTerms(item),
      })),
    ...state.generalListItems
      .filter((item) => item.active !== false)
      .map((item) => {
        const localized = localizeRowName(item, catalogMap, lang);
        const catalogItem = safe(item.itemKey) ? catalogMap.get(safe(item.itemKey)) : null;

        return {
          id: item.id,
          itemKey: safe(item.itemKey),
          name: localized.name,
          category: canonicalizeCategory(item.category) || DEFAULT_CATEGORY,
          unit: canonicalizeUnit(item.unit),
          quantity: item.quantity || "1",
          store: item.store,
          source: "general_list" as const,
          searchTerms: [
            normalize(localized.name),
            normalize(item.name),
            ...(catalogItem ? itemSearchTerms(catalogItem) : []),
          ].filter(Boolean),
        };
      }),
  ];

  const starts = raw.filter((item) => item.searchTerms.some((term) => term.startsWith(q)));
  const includes = raw.filter(
    (item) =>
      !item.searchTerms.some((term) => term.startsWith(q)) &&
      item.searchTerms.some((term) => term.includes(q))
  );

  const merged = [...starts, ...includes];
  const seen = new Set<string>();

  return merged
    .filter((item) => {
      const key = `${safe(item.itemKey) || normalize(item.name)}__${normalize(item.unit)}__${normalize(item.store)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map(({ searchTerms: _searchTerms, ...item }) => item);
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
    .map(([store, items]) => ({
      store,
      items: [...items].sort((a, b) =>
        safe((a as { name?: string }).name).localeCompare(safe((b as { name?: string }).name))
      ),
    }))
    .sort((a, b) => a.store.localeCompare(b.store));
}

export function groupGeneralListByCategory(rows: GeneralListItem[]) {
  const map = new Map<string, GeneralListItem[]>();
  for (const row of rows) {
    const category = canonicalizeCategory(row.category) || DEFAULT_CATEGORY;
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
  const lang = state.settings.language;
  const catalogMap = new Map(state.itemsMaster.map((item) => [item.itemKey, item]));
  const groups = groupByStore(pendingOnly(state.activeShoppingListItems)).map((group) => ({
    ...group,
    items: group.items.map((item) => localizeRowName(item, catalogMap, lang)),
  }));

  return groups
    .map((group) =>
      [group.store, ...group.items.map((item) => `${item.name} ${item.quantity} ${unitLabel(lang, item.unit)}`)].join("\n")
    )
    .join("\n\n")
    .trim();
}

export function buildShoppingListTextForStore(storeName: string) {
  const state = readState();
  const lang = state.settings.language;
  const store = safe(storeName);
  const catalogMap = new Map(state.itemsMaster.map((item) => [item.itemKey, item]));
  const rows = pendingOnly(state.activeShoppingListItems)
    .filter((item) => safe(item.store) === store)
    .map((item) => localizeRowName(item, catalogMap, lang));

  if (rows.length === 0) return "";
  return [store, ...rows.map((item) => `${item.name} ${item.quantity} ${unitLabel(lang, item.unit)}`)]
    .join("\n")
    .trim();
}

export function buildShoppingListHtml(lang: Language = "en") {
  const state = readState();
  const catalogMap = new Map(state.itemsMaster.map((item) => [item.itemKey, item]));
  const groups = groupByStore(pendingOnly(state.activeShoppingListItems)).map((group) => ({
    ...group,
    items: group.items.map((item) => localizeRowName(item, catalogMap, lang)),
  }));
  const title = lang === "en" ? "Your Shopping Cart" : "Tu Carrito de Compras";
  const slogan = lang === "en" ? "Never Forget what to buy" : "Nunca olvides qué comprar";

  const body = groups
    .map((group) => {
      const rows = group.items
        .map(
          (item) => `
            <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eee;">
              <div style="font-weight:700;">${escapeHtml(item.name)}</div>
              <div style="font-size:12px;color:#555;white-space:nowrap;">${escapeHtml(item.quantity)} ${escapeHtml(unitLabel(lang, item.unit))}</div>
            </div>
          `
        )
        .join("");

      return `
        <section style="margin-bottom:22px;">
          <div style="font-size:20px;font-weight:800;margin-bottom:8px;">${escapeHtml(group.store)}</div>
          ${rows}
        </section>
      `;
    })
    .join("");

  return `
    <html>
      <head><meta charset="utf-8" /><title>MinderCart PDF</title></head>
      <body style="font-family:Arial,sans-serif;padding:24px;color:#111;">
        <div style="background:#12245E;color:#fff;padding:18px 20px;border-radius:16px;margin-bottom:20px;">
          <div style="font-size:24px;font-weight:900;">MinderCart</div>
          <div style="font-size:12px;opacity:.9;margin-top:4px;">${slogan}</div>
          <div style="font-size:18px;font-weight:800;margin-top:12px;">${title}</div>
        </div>
        ${body || `<div>${lang === "es" ? "No hay artículos." : "No items."}</div>`}
      </body>
    </html>
  `;
}

export function buildShoppingListHtmlForStore(storeName: string, lang: Language = "en") {
  const store = safe(storeName);
  const state = readState();
  const catalogMap = new Map(state.itemsMaster.map((item) => [item.itemKey, item]));
  const rows = pendingOnly(state.activeShoppingListItems)
    .filter((item) => safe(item.store) === store)
    .map((item) => localizeRowName(item, catalogMap, lang));

  const title = lang === "en" ? "Your Shopping Cart" : "Tu Carrito de Compras";
  const slogan = lang === "en" ? "Never Forget what to buy" : "Nunca olvides qué comprar";
  const printLabel = lang === "en" ? "Print" : "Imprimir";
  const backLabel = lang === "en" ? "Back" : "Regresar";
  const emptyLabel = lang === "en" ? "No items." : "No hay artículos.";
  const printedOn = lang === "en" ? "Date" : "Fecha";
  const displayDate = escapeHtml(formatDisplayDate(lang));

  const screenBody = rows
    .map(
      (item) => `
        <div class="mc-screen-row">
          <div class="mc-screen-name">${escapeHtml(item.name)}</div>
          <div class="mc-screen-qty">${escapeHtml(item.quantity)} ${escapeHtml(unitLabel(lang, item.unit))}</div>
        </div>
      `
    )
    .join("");

  const printBody = rows
    .map(
      (item) => `
        <div class="mc-print-row">
          <div class="mc-print-name">${escapeHtml(item.name)}</div>
          <div class="mc-print-qty">${escapeHtml(item.quantity)} ${escapeHtml(unitLabel(lang, item.unit))}</div>
        </div>
      `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>${escapeHtml(store)} PDF</title>
        <style>
          :root {
            color-scheme: light;
            --mc-navy: #12245E;
            --mc-navy-soft: #EAF0FF;
            --mc-line: #D8E2FF;
            --mc-muted: #5D6B98;
            --mc-bg: #F5F7FF;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            background: var(--mc-bg);
            color: var(--mc-navy);
          }

          body {
            -webkit-text-size-adjust: 100%;
          }

          .mc-screen {
            min-height: 100dvh;
            background: var(--mc-bg);
          }

          .mc-screen-shell {
            max-width: 560px;
            min-height: 100dvh;
            margin: 0 auto;
            padding: 16px 16px calc(104px + env(safe-area-inset-bottom));
          }

          .mc-screen-header {
            background: var(--mc-navy);
            color: #fff;
            border-radius: 18px;
            padding: 18px 18px 16px;
          }

          .mc-screen-header-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
          }

          .mc-screen-left,
          .mc-screen-right {
            min-width: 0;
          }

          .mc-screen-right {
            text-align: right;
          }

          .mc-screen-title {
            font-size: 21px;
            line-height: 1.1;
            font-weight: 900;
          }

          .mc-screen-store {
            margin-top: 8px;
            font-size: 18px;
            line-height: 1.15;
            font-weight: 800;
          }

          .mc-screen-date,
          .mc-screen-slogan {
            margin-top: 8px;
            font-size: 13px;
            line-height: 1.35;
            opacity: 0.94;
          }

          .mc-screen-list {
            display: grid;
            gap: 12px;
            margin-top: 16px;
          }

          .mc-screen-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border: 1px solid var(--mc-line);
            border-radius: 18px;
            background: #fff;
          }

          .mc-screen-name {
            font-size: 18px;
            line-height: 1.2;
            font-weight: 800;
            color: var(--mc-navy);
          }

          .mc-screen-qty {
            font-size: 15px;
            line-height: 1.25;
            color: var(--mc-muted);
            white-space: nowrap;
          }

          .mc-screen-empty {
            background: #fff;
            border: 1px solid var(--mc-line);
            border-radius: 18px;
            padding: 18px;
            font-size: 17px;
            color: var(--mc-muted);
          }

          .mc-screen-controls {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(12px);
            border-top: 1px solid var(--mc-line);
          }

          .mc-screen-controls-inner {
            max-width: 560px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .mc-btn {
            min-height: 48px;
            padding: 14px 12px;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 900;
          }

          .mc-btn-primary {
            border: 1px solid var(--mc-navy);
            background: var(--mc-navy);
            color: #fff;
          }

          .mc-btn-secondary {
            border: 1px solid var(--mc-line);
            background: #fff;
            color: var(--mc-navy);
          }

          .mc-print-sheet {
            display: none;
            color: #111827;
            background: #fff;
          }

          .mc-print-header {
            background: var(--mc-navy);
            color: #fff;
            padding: 12mm 12mm 9mm;
            border-radius: 4mm;
          }

          .mc-print-header-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10mm;
          }

          .mc-print-left,
          .mc-print-right {
            min-width: 0;
            flex: 1 1 0;
          }

          .mc-print-right {
            text-align: right;
          }

          .mc-print-title-left,
          .mc-print-title-right {
            font-size: 16pt;
            line-height: 1.1;
            font-weight: 800;
          }

          .mc-print-store {
            margin-top: 3mm;
            font-size: 12pt;
            font-weight: 700;
            line-height: 1.2;
          }

          .mc-print-date,
          .mc-print-slogan {
            margin-top: 2.5mm;
            font-size: 9.5pt;
            line-height: 1.35;
          }

          .mc-print-list {
            margin-top: 7mm;
          }

          .mc-print-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8mm;
            align-items: start;
            padding: 3.5mm 0;
            border-bottom: 0.35mm solid #D8E2FF;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .mc-print-name {
            font-size: 12pt;
            line-height: 1.3;
            font-weight: 700;
            padding-right: 4mm;
          }

          .mc-print-qty {
            font-size: 10.5pt;
            line-height: 1.3;
            white-space: nowrap;
            color: #4B5A8A;
            text-align: right;
          }

          .mc-print-empty {
            padding: 4mm 0;
            font-size: 11pt;
            color: #4B5A8A;
          }

          @page {
            size: auto;
            margin: 12mm;
          }

          @media print {
            html,
            body {
              background: #fff !important;
              color: #111827 !important;
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .mc-screen,
            .mc-screen-controls {
              display: none !important;
              visibility: hidden !important;
            }

            .mc-print-sheet {
              display: block !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="mc-screen">
          <div class="mc-screen-shell">
            <div class="mc-screen-header">
              <div class="mc-screen-header-grid">
                <div class="mc-screen-left">
                  <div class="mc-screen-title">${title}</div>
                  <div class="mc-screen-store">${escapeHtml(store)}</div>
                  <div class="mc-screen-date">${printedOn}: ${displayDate}</div>
                </div>
                <div class="mc-screen-right">
                  <div class="mc-screen-title">MinderCart</div>
                  <div class="mc-screen-slogan">${slogan}</div>
                </div>
              </div>
            </div>

            <div class="mc-screen-list">
              ${screenBody || `<div class="mc-screen-empty">${emptyLabel}</div>`}
            </div>
          </div>

          <div class="mc-screen-controls">
            <div class="mc-screen-controls-inner">
              <button type="button" onclick="window.print()" class="mc-btn mc-btn-primary">${printLabel}</button>
              <button type="button" onclick="if (window.opener) { window.close(); } else if (window.history.length > 1) { window.history.back(); }" class="mc-btn mc-btn-secondary">${backLabel}</button>
            </div>
          </div>
        </div>

        <div class="mc-print-sheet">
          <div class="mc-print-header">
            <div class="mc-print-header-grid">
              <div class="mc-print-left">
                <div class="mc-print-title-left">${title}</div>
                <div class="mc-print-store">${escapeHtml(store)}</div>
                <div class="mc-print-date">${printedOn}: ${displayDate}</div>
              </div>
              <div class="mc-print-right">
                <div class="mc-print-title-right">MinderCart</div>
                <div class="mc-print-slogan">${slogan}</div>
              </div>
            </div>
          </div>

          <div class="mc-print-list">
            ${printBody || `<div class="mc-print-empty">${emptyLabel}</div>`}
          </div>
        </div>
      </body>
    </html>
  `;
}

