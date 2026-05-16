import type { Language } from "@/lib/mindercart/types";

export type CatalogLanguage = Language;
export type LocalizedLabel = {
  es: string;
  en: string;
};

export type UnitLabelFormat =
  | "short"
  | "long"
  | "long_with_short"
  | "short_with_long";

type CatalogEntryBase = {
  id: string;
  aliases: readonly string[];
  active: boolean;
};

export type UnitCatalogEntry = CatalogEntryBase & {
  legacyValue: string;
  labels: LocalizedLabel;
  shortLabels: LocalizedLabel;
};

export type CategoryCatalogEntry = CatalogEntryBase & {
  legacyValue: string;
  labels: LocalizedLabel;
};

export type StoreSeedCatalogEntry = CatalogEntryBase & {
  value: string;
  label: string;
};

export type CatalogOption = {
  id: string;
  value: string;
  label: string;
};

export const DEFAULT_UNIT_ID = "piece";
export const DEFAULT_UNIT_VALUE = "pza";
export const DEFAULT_CATEGORY_ID = "other_seasonal";
export const DEFAULT_CATEGORY_VALUE = "Otro / Temporal";

export const UNIT_CATALOG: readonly UnitCatalogEntry[] = [
  {
    id: "piece",
    legacyValue: "pza",
    labels: { es: "Pieza", en: "Piece" },
    shortLabels: { es: "pza", en: "pc" },
    aliases: [
      "pza",
      "pzas",
      "pieza",
      "piezas",
      "unidad",
      "unidades",
      "ea",
      "each",
      "pc",
      "pcs",
      "unit",
      "units",
      "barra",
      "cabeza",
      "tubo",
    ],
    active: true,
  },
  {
    id: "pack",
    legacyValue: "paquete",
    labels: { es: "Paquete", en: "Pack" },
    shortLabels: { es: "paquete", en: "pack" },
    aliases: ["paquete", "paquetes", "pack", "packs"],
    active: true,
  },
  {
    id: "box",
    legacyValue: "caja",
    labels: { es: "Caja", en: "Box" },
    shortLabels: { es: "caja", en: "box" },
    aliases: ["caja", "cajas", "box", "boxes"],
    active: true,
  },
  {
    id: "can",
    legacyValue: "lata",
    labels: { es: "Lata", en: "Can" },
    shortLabels: { es: "lata", en: "can" },
    aliases: ["lata", "latas", "can", "cans"],
    active: true,
  },
  {
    id: "bottle",
    legacyValue: "botella",
    labels: { es: "Botella", en: "Bottle" },
    shortLabels: { es: "botella", en: "bottle" },
    aliases: ["botella", "botellas", "bottle", "bottles"],
    active: true,
  },
  {
    id: "jar",
    legacyValue: "frasco",
    labels: { es: "Frasco", en: "Jar" },
    shortLabels: { es: "frasco", en: "jar" },
    aliases: ["frasco", "frascos", "jar", "jars"],
    active: true,
  },
  {
    id: "tub",
    legacyValue: "bote",
    labels: { es: "Bote", en: "Tub" },
    shortLabels: { es: "bote", en: "tub" },
    aliases: ["bote", "botes", "tub", "tubs"],
    active: true,
  },
  {
    id: "packet",
    legacyValue: "sobre",
    labels: { es: "Sobre", en: "Packet" },
    shortLabels: { es: "sbre.", en: "pkt" },
    aliases: ["sobre", "sobres", "sbre", "sbre.", "packet", "packets", "pkt"],
    active: true,
  },
  {
    id: "bag",
    legacyValue: "bolsa",
    labels: { es: "Bolsa", en: "Bag" },
    shortLabels: { es: "bolsa", en: "bag" },
    aliases: ["bolsa", "bolsas", "bag", "bags"],
    active: true,
  },
  {
    id: "roll",
    legacyValue: "rollo",
    labels: { es: "Rollo", en: "Roll" },
    shortLabels: { es: "rollo", en: "roll" },
    aliases: ["rollo", "rollos", "roll", "rolls"],
    active: true,
  },
  {
    id: "dozen",
    legacyValue: "docena",
    labels: { es: "Docena", en: "Dozen" },
    shortLabels: { es: "docena", en: "dozen" },
    aliases: ["docena", "docenas", "dozen", "dozens"],
    active: true,
  },
  {
    id: "gram",
    legacyValue: "g",
    labels: { es: "Gramo", en: "Gram" },
    shortLabels: { es: "g", en: "g" },
    aliases: ["g", "gr", "grs", "gramo", "gramos", "gram", "grams"],
    active: true,
  },
  {
    id: "kilogram",
    legacyValue: "kg",
    labels: { es: "Kilogramo", en: "Kilogram" },
    shortLabels: { es: "kg", en: "kg" },
    aliases: ["kg", "kilo", "kilos", "kilogramo", "kilogramos", "kilogram", "kilograms"],
    active: true,
  },
  {
    id: "ounce",
    legacyValue: "oz",
    labels: { es: "Onza", en: "Ounce" },
    shortLabels: { es: "oz", en: "oz" },
    aliases: ["oz", "onza", "onzas", "ounce", "ounces"],
    active: true,
  },
  {
    id: "pound",
    legacyValue: "lb",
    labels: { es: "Libra", en: "Pound" },
    shortLabels: { es: "lb", en: "lb" },
    aliases: ["lb", "libra", "libras", "pound", "pounds"],
    active: true,
  },
  {
    id: "milliliter",
    legacyValue: "ml",
    labels: { es: "Mililitro", en: "Milliliter" },
    shortLabels: { es: "ml", en: "ml" },
    aliases: ["ml", "mililitro", "mililitros", "milliliter", "milliliters"],
    active: true,
  },
  {
    id: "liter",
    legacyValue: "l",
    labels: { es: "Litro", en: "Liter" },
    shortLabels: { es: "l", en: "l" },
    aliases: ["l", "lt", "lts", "litro", "litros", "liter", "liters"],
    active: true,
  },
  {
    id: "gallon",
    legacyValue: "gal",
    labels: { es: "Galón", en: "Gallon" },
    shortLabels: { es: "gal", en: "gal" },
    aliases: ["gal", "galon", "galones", "gallon", "gallons"],
    active: true,
  },
] as const;

export const CATEGORY_CATALOG: readonly CategoryCatalogEntry[] = [
  {
    id: "fruits_and_vegetables",
    legacyValue: "Frutas y Verduras",
    labels: { es: "Frutas y Verduras", en: "Fruits and Vegetables" },
    aliases: [
      "frutas y verduras",
      "frutas",
      "verduras",
      "produce",
      "fruits & vegetables",
      "fruits and vegetables",
    ],
    active: true,
  },
  {
    id: "meat_poultry_and_seafood",
    legacyValue: "Carnes, Pollo y Pescados",
    labels: { es: "Carnes, Pollo y Pescados", en: "Meat, Poultry and Seafood" },
    aliases: [
      "carnes, pollo y pescados",
      "carnes y mariscos",
      "carnes",
      "pollo",
      "pescados",
      "mariscos",
      "meat & seafood",
      "meat, poultry & seafood",
      "meat, poultry and seafood",
    ],
    active: true,
  },
  {
    id: "deli_meats_and_cold_cuts",
    legacyValue: "Jamón y Salchichonería",
    labels: { es: "Jamón y Salchichonería", en: "Deli Meats and Cold Cuts" },
    aliases: [
      "jamon y salchichoneria",
      "jamón y salchichonería",
      "jamon",
      "jamón",
      "salchichoneria",
      "salchichonería",
      "deli",
      "cold cuts",
      "deli meats and cold cuts",
      "deli meats & cold cuts",
    ],
    active: true,
  },
  {
    id: "dairy_and_chilled",
    legacyValue: "Lácteos y Refrigerados",
    labels: { es: "Lácteos y Refrigerados", en: "Dairy and Chilled" },
    aliases: [
      "lacteos y refrigerados",
      "lácteos y refrigerados",
      "lacteos",
      "lácteos",
      "refrigerados",
      "dairy",
      "refrigerated",
      "dairy & refrigerated",
      "dairy and chilled",
    ],
    active: true,
  },
  {
    id: "bakery_and_tortilleria",
    legacyValue: "Panadería y Tortillería",
    labels: { es: "Panadería y Tortillería", en: "Bakery and Tortilleria" },
    aliases: [
      "panaderia y tortilleria",
      "panadería y tortillería",
      "panaderia",
      "panadería",
      "tortilleria",
      "tortillería",
      "bakery",
      "bakery & tortillas",
      "bakery and tortilleria",
    ],
    active: true,
  },
  {
    id: "pantry_and_groceries",
    legacyValue: "Abarrotes",
    labels: { es: "Abarrotes", en: "Pantry and Groceries" },
    aliases: [
      "abarrotes",
      "despensa",
      "pantry",
      "pantry staples",
      "snacks",
      "botanas",
      "grocery staples",
      "pantry and groceries",
    ],
    active: true,
  },
  {
    id: "beverages",
    legacyValue: "Bebidas",
    labels: { es: "Bebidas", en: "Beverages" },
    aliases: ["bebidas", "beverages"],
    active: true,
  },
  {
    id: "wine_and_spirits",
    legacyValue: "Vinos y Licores",
    labels: { es: "Vinos y Licores", en: "Wine and Spirits" },
    aliases: [
      "vinos y licores",
      "vinos",
      "licores",
      "wine",
      "wines",
      "spirits",
      "liquor",
      "wine and spirits",
      "wine & spirits",
    ],
    active: true,
  },
  {
    id: "frozen",
    legacyValue: "Congelados",
    labels: { es: "Congelados", en: "Frozen" },
    aliases: ["congelados", "frozen"],
    active: true,
  },
  {
    id: "cleaning_and_home",
    legacyValue: "Limpieza y Hogar",
    labels: { es: "Limpieza y Hogar", en: "Cleaning and Home" },
    aliases: [
      "limpieza y hogar",
      "limpieza",
      "hogar",
      "home",
      "cleaning",
      "household",
      "cleaning & home",
      "cleaning and home",
    ],
    active: true,
  },
  {
    id: "pharmacy_baby_and_personal_care",
    legacyValue: "Farmacia, Bebé y Cuidado Personal",
    labels: { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby and Personal Care" },
    aliases: [
      "farmacia, bebe y cuidado personal",
      "farmacia, bebé y cuidado personal",
      "farmacia",
      "bebe",
      "bebé",
      "cuidado personal",
      "personal care",
      "pharmacy",
      "baby",
      "pharmacy, baby & personal care",
      "pharmacy, baby and personal care",
    ],
    active: true,
  },
  {
    id: "pet_care",
    legacyValue: "Mascotas",
    labels: { es: "Mascotas", en: "Pet Care" },
    aliases: ["mascotas", "pet care", "pets"],
    active: true,
  },
  {
    id: "hardware_and_auto",
    legacyValue: "Ferretería y Autos",
    labels: { es: "Ferretería y Autos", en: "Hardware and Auto" },
    aliases: [
      "ferreteria y autos",
      "ferretería y autos",
      "hardware & auto",
      "hardware and auto",
      "hardware",
      "auto",
      "autos",
    ],
    active: true,
  },
  {
    id: "checkout_and_front_area",
    legacyValue: "Cajas y Salida",
    labels: { es: "Cajas y Salida", en: "Checkout and Front Area" },
    aliases: [
      "cajas y salida",
      "cajas",
      "salida",
      "checkout",
      "front end",
      "checkout & front end",
      "checkout and front area",
    ],
    active: true,
  },
  {
    id: DEFAULT_CATEGORY_ID,
    legacyValue: DEFAULT_CATEGORY_VALUE,
    labels: { es: "Otro / Temporal", en: "Other / Seasonal" },
    aliases: [
      "otro / temporal",
      "otro/temporal",
      "otro",
      "temporal",
      "general",
      "other / seasonal",
      "other/seasonal",
    ],
    active: true,
  },
] as const;

export const STORE_SEED_CATALOG: readonly StoreSeedCatalogEntry[] = [
  {
    id: "heb",
    value: "HEB",
    label: "HEB",
    aliases: ["heb"],
    active: true,
  },
  {
    id: "costco",
    value: "Costco",
    label: "Costco",
    aliases: ["costco"],
    active: true,
  },
  {
    id: "sams",
    value: "Sam's",
    label: "Sam's",
    aliases: ["sam's", "sams", "sam´s"],
    active: true,
  },
] as const;

const normalizeCatalogKey = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

function buildLookup<T extends { id: string; aliases: readonly string[] }>(
  rows: readonly T[],
  getKeys: (row: T) => readonly string[]
) {
  const map = new Map<string, T>();

  for (const row of rows) {
    for (const key of getKeys(row)) {
      const normalized = normalizeCatalogKey(key);
      if (!normalized || map.has(normalized)) continue;
      map.set(normalized, row);
    }
  }

  return map;
}

const unitLookup = buildLookup(UNIT_CATALOG, (row) => [
  row.id,
  row.legacyValue,
  row.labels.es,
  row.labels.en,
  row.shortLabels.es,
  row.shortLabels.en,
  ...row.aliases,
]);

const categoryLookup = buildLookup(CATEGORY_CATALOG, (row) => [
  row.id,
  row.legacyValue,
  row.labels.es,
  row.labels.en,
  ...row.aliases,
]);

const storeSeedLookup = buildLookup(STORE_SEED_CATALOG, (row) => [
  row.id,
  row.value,
  row.label,
  ...row.aliases,
]);

function sortOptionsByLabel<T extends CatalogOption>(rows: readonly T[]) {
  return [...rows].sort((left, right) => left.label.localeCompare(right.label, "es", { sensitivity: "base" }));
}

function formatUnitLabel(
  lang: CatalogLanguage,
  row: UnitCatalogEntry,
  format: UnitLabelFormat
) {
  const longLabel = lang === "en" ? row.labels.en : row.labels.es;
  const shortLabel = lang === "en" ? row.shortLabels.en : row.shortLabels.es;

  if (format === "long") return longLabel;
  if (format === "long_with_short") return `${longLabel} (${shortLabel})`;
  if (format === "short_with_long") return `${shortLabel} (${longLabel})`;
  return shortLabel;
}

export { normalizeCatalogKey };

export function resolveUnitCatalogEntry(value: unknown) {
  const normalized = normalizeCatalogKey(value);
  return unitLookup.get(normalized) || null;
}

export function resolveCategoryCatalogEntry(value: unknown) {
  const normalized = normalizeCatalogKey(value);
  return categoryLookup.get(normalized) || null;
}

export function resolveStoreSeedCatalogEntry(value: unknown) {
  const normalized = normalizeCatalogKey(value);
  return storeSeedLookup.get(normalized) || null;
}

export function canonicalUnitValue(value: unknown) {
  return resolveUnitCatalogEntry(value)?.legacyValue || DEFAULT_UNIT_VALUE;
}

export function canonicalCategoryValue(value: unknown) {
  return resolveCategoryCatalogEntry(value)?.legacyValue || DEFAULT_CATEGORY_VALUE;
}

export function unitCatalogLabel(
  lang: CatalogLanguage,
  value: unknown,
  format: UnitLabelFormat = "short"
) {
  const resolved = resolveUnitCatalogEntry(value);
  if (!resolved) return String(value ?? "").trim();
  return formatUnitLabel(lang, resolved, format);
}

export function categoryCatalogLabel(lang: CatalogLanguage, value: unknown) {
  const resolved = resolveCategoryCatalogEntry(value);
  if (!resolved) return String(value ?? "").trim();
  return lang === "en" ? resolved.labels.en : resolved.labels.es;
}

export function getUnitCatalogOptions(
  lang: CatalogLanguage,
  format: UnitLabelFormat = "short"
): CatalogOption[] {
  return sortOptionsByLabel(
    UNIT_CATALOG.filter((row) => row.active).map((row) => ({
      id: row.id,
      value: row.legacyValue,
      label: formatUnitLabel(lang, row, format),
    }))
  );
}

export function getCategoryCatalogOptions(lang: CatalogLanguage): CatalogOption[] {
  return sortOptionsByLabel(
    CATEGORY_CATALOG.filter((row) => row.active).map((row) => ({
      id: row.id,
      value: row.legacyValue,
      label: lang === "en" ? row.labels.en : row.labels.es,
    }))
  );
}

export function getStoreSeedCatalogOptions(): CatalogOption[] {
  return sortOptionsByLabel(
    STORE_SEED_CATALOG.filter((row) => row.active).map((row) => ({
      id: row.id,
      value: row.value,
      label: row.label,
    }))
  );
}

export const UNIT_LEGACY_VALUES = UNIT_CATALOG.map((row) => row.legacyValue);
export const CATEGORY_LEGACY_VALUES = CATEGORY_CATALOG.map((row) => row.legacyValue);
export const STORE_SEED_VALUES = STORE_SEED_CATALOG.map((row) => row.value);
