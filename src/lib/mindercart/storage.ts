import { categoryLabel, unitLabel } from "@/lib/mindercart/i18n";
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
    const fallback = defaultState();
    writeState(fallback);
    return fallback;
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


const MINDERCART_AVATAR_PDF = "data:image/png;base64,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";

export function buildShoppingListHtmlForStore(storeName: string, lang: Language = "en") {
  const store = safe(storeName);
  const state = readState();
  const catalogMap = new Map(state.itemsMaster.map((item) => [item.itemKey, item]));
  const rows = pendingOnly(state.activeShoppingListItems)
    .filter((item) => safe(item.store) === store)
    .map((item) => localizeRowName(item, catalogMap, lang));

  const title = lang === "en" ? "Shopping List" : "Lista de Compras";
  const printLabel = lang === "en" ? "Print" : "Imprimir";
  const backLabel = lang === "en" ? "Back" : "Regresar";
  const emptyLabel = lang === "en" ? "No items." : "No hay artículos.";
  const displayDate = escapeHtml(formatDisplayDate(lang));
  const categoryOrder = new Map(CATEGORY_OPTIONS.map((category, index) => [normalize(category), index]));

  const groupedRows = [...rows]
    .map((item) => ({
      ...item,
      category: canonicalizeCategory((item as { category?: string }).category),
    }))
    .sort((a, b) => safe(a.name).localeCompare(safe(b.name), lang === "en" ? "en" : "es", { sensitivity: "base" }))
    .reduce<Array<{ category: string; items: typeof rows }>>((groups, item) => {
      const category = canonicalizeCategory(item.category);
      const existing = groups.find((group) => normalize(group.category) === normalize(category));
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ category, items: [item] });
      }
      return groups;
    }, [])
    .sort((a, b) => {
      const orderA = categoryOrder.get(normalize(a.category)) ?? Number.MAX_SAFE_INTEGER;
      const orderB = categoryOrder.get(normalize(b.category)) ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.category.localeCompare(b.category, lang === "en" ? "en" : "es", { sensitivity: "base" });
    });

  const totalItems = rows.length;
  const storeLine = `${escapeHtml(store)}${totalItems ? ` (${totalItems})` : ""}`;

  const renderRows = (mode: "screen" | "print") =>
    groupedRows
      .map((group) => {
        const items = group.items
          .map((item) => {
            const quantity = escapeHtml(item.quantity);
            const unit = escapeHtml(unitLabel(lang, item.unit));
            const qtyText = [quantity, unit].filter(Boolean).join(" ").trim();

            return `
              <div class="mc-${mode}-row">
                <span class="mc-${mode}-checkbox"></span>
                <div class="mc-${mode}-name">${escapeHtml(item.name)}</div>
                <div class="mc-${mode}-qty">${qtyText}</div>
              </div>
            `;
          })
          .join("");

        return `
          <section class="mc-${mode}-section">
            <div class="mc-${mode}-section-title">${escapeHtml(categoryLabel(lang, group.category))}</div>
            <div class="mc-${mode}-section-body">${items}</div>
          </section>
        `;
      })
      .join("");

  const screenBody = renderRows("screen");
  const printBody = renderRows("print");

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
            --mc-line: #D8E2FF;
            --mc-soft: #EEF3FF;
            --mc-bg: #F5F7FF;
            --mc-text: #12245E;
            --mc-muted: #64739B;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: var(--mc-bg);
            color: var(--mc-text);
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
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
            padding: 14px 14px calc(96px + env(safe-area-inset-bottom));
          }

          .mc-screen-header {
            background: var(--mc-navy);
            color: #fff;
            border-radius: 18px;
            padding: 12px 14px;
          }

          .mc-screen-header-grid,
          .mc-print-header-grid {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: start;
          }

          .mc-screen-left,
          .mc-print-left {
            display: grid;
            grid-template-columns: 46px minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            min-width: 0;
          }

          .mc-screen-avatar,
          .mc-print-avatar {
            width: 46px;
            height: 46px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.12);
            overflow: hidden;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
          }

          .mc-screen-avatar img,
          .mc-print-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .mc-screen-title,
          .mc-print-title {
            font-size: 16px;
            line-height: 1.1;
            font-weight: 800;
            margin: 0;
          }

          .mc-screen-store,
          .mc-print-store {
            font-size: 13px;
            line-height: 1.2;
            font-weight: 600;
            margin-top: 4px;
            opacity: 0.96;
          }

          .mc-screen-right,
          .mc-print-right {
            text-align: right;
            min-width: 0;
          }

          .mc-screen-brand,
          .mc-print-brand {
            font-size: 14px;
            line-height: 1.1;
            font-weight: 800;
            margin: 0;
          }

          .mc-screen-date,
          .mc-print-date {
            font-size: 12px;
            line-height: 1.2;
            margin-top: 4px;
            opacity: 0.96;
          }

          .mc-screen-list {
            margin-top: 12px;
            display: grid;
            gap: 10px;
          }

          .mc-screen-section,
          .mc-print-section {
            background: #fff;
            border: 1px solid var(--mc-line);
            border-radius: 14px;
            overflow: hidden;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .mc-screen-section-title {
            padding: 8px 12px;
            background: var(--mc-soft);
            border-bottom: 1px solid var(--mc-line);
            font-size: 14px;
            line-height: 1.15;
            font-weight: 800;
          }

          .mc-screen-section-body {
            padding: 2px 10px;
          }

          .mc-screen-row {
            display: grid;
            grid-template-columns: 16px minmax(0, 1fr) auto;
            gap: 10px;
            align-items: center;
            padding: 9px 2px;
            border-bottom: 1px solid #EEF3FF;
          }

          .mc-screen-row:last-child {
            border-bottom: 0;
          }

          .mc-screen-checkbox,
          .mc-print-checkbox {
            width: 12px;
            height: 12px;
            border: 1.6px solid var(--mc-navy);
            border-radius: 3px;
            display: inline-block;
            background: #fff;
          }

          .mc-screen-name {
            font-size: 15px;
            line-height: 1.2;
            font-weight: 700;
            min-width: 0;
          }

          .mc-screen-qty {
            font-size: 13px;
            line-height: 1.2;
            color: var(--mc-muted);
            white-space: nowrap;
          }

          .mc-screen-empty,
          .mc-print-empty {
            background: #fff;
            border: 1px solid var(--mc-line);
            border-radius: 14px;
            padding: 12px;
            font-size: 14px;
            color: var(--mc-muted);
          }

          .mc-screen-controls {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
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
            min-height: 46px;
            padding: 12px 10px;
            border-radius: 14px;
            font-size: 15px;
            font-weight: 800;
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
            background: #fff;
            color: #111827;
          }

          .mc-print-sheet-inner {
            padding: 0;
          }

          .mc-print-header {
            background: var(--mc-navy);
            color: #fff;
            padding: 6.5mm 7mm;
            border-radius: 3mm;
          }

          .mc-print-left {
            grid-template-columns: 18mm minmax(0, 1fr);
            gap: 4mm;
          }

          .mc-print-avatar {
            width: 18mm;
            height: 18mm;
            border-radius: 3.2mm;
            background: rgba(255, 255, 255, 0.12);
          }

          .mc-print-title {
            font-size: 11pt;
          }

          .mc-print-store {
            font-size: 9pt;
            margin-top: 1mm;
          }

          .mc-print-brand {
            font-size: 10pt;
          }

          .mc-print-date {
            font-size: 8.5pt;
            margin-top: 1mm;
          }

          .mc-print-list {
            margin-top: 4mm;
            display: grid;
            gap: 2.4mm;
          }

          .mc-print-section {
            border-radius: 3mm;
          }

          .mc-print-section-title {
            padding: 2.3mm 3mm;
            background: #EEF3FF;
            border-bottom: 0.3mm solid #D8E2FF;
            font-size: 8.8pt;
            line-height: 1.1;
            font-weight: 800;
            color: #12245E;
          }

          .mc-print-section-body {
            padding: 0.4mm 2.8mm;
          }

          .mc-print-row {
            display: grid;
            grid-template-columns: 4.5mm minmax(0, 1fr) auto;
            gap: 2.5mm;
            align-items: center;
            padding: 1.7mm 0;
            border-bottom: 0.25mm solid #EEF3FF;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .mc-print-row:last-child {
            border-bottom: 0;
          }

          .mc-print-checkbox {
            width: 3.2mm;
            height: 3.2mm;
            border-width: 0.35mm;
            border-radius: 0.55mm;
          }

          .mc-print-name {
            font-size: 8.8pt;
            line-height: 1.15;
            font-weight: 700;
            min-width: 0;
          }

          .mc-print-qty {
            font-size: 8.2pt;
            line-height: 1.1;
            color: #4B5A8A;
            white-space: nowrap;
            text-align: right;
          }

          @page {
            size: auto;
            margin: 8mm;
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
                  <div class="mc-screen-avatar">
                    <img src="${MINDERCART_AVATAR_PDF}" alt="MinderCart" />
                  </div>
                  <div>
                    <div class="mc-screen-title">${title}</div>
                    <div class="mc-screen-store">${storeLine}</div>
                  </div>
                </div>
                <div class="mc-screen-right">
                  <div class="mc-screen-brand">MinderCart</div>
                  <div class="mc-screen-date">${displayDate}</div>
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
          <div class="mc-print-sheet-inner">
            <div class="mc-print-header">
              <div class="mc-print-header-grid">
                <div class="mc-print-left">
                  <div class="mc-print-avatar">
                    <img src="${MINDERCART_AVATAR_PDF}" alt="MinderCart" />
                  </div>
                  <div>
                    <div class="mc-print-title">${title}</div>
                    <div class="mc-print-store">${storeLine}</div>
                  </div>
                </div>
                <div class="mc-print-right">
                  <div class="mc-print-brand">MinderCart</div>
                  <div class="mc-print-date">${displayDate}</div>
                </div>
              </div>
            </div>

            <div class="mc-print-list">
              ${printBody || `<div class="mc-print-empty">${emptyLabel}</div>`}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
