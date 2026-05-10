"use client";

import React from "react";
import {
  AppShell,
  MC_NAVY,
  MC_NAVY_LINE,
  MC_NAVY_MUTED,
  MC_NAVY_SOFT,
  QtyUnitText,
  cardStyle,
  scalePx,
} from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import {
  buildShoppingListHtmlForStore,
  closeShoppingForStore,
  groupByStore,
  readState,
  toggleActiveItemChecked,
  writeState,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";

type RemoveAction = {
  id: string;
  name: string;
} | null;

type AddFlowStep = "search" | "editor";

type CatalogSuggestion = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  store: string;
};

type DraftPurchaseItem = {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  store: string;
};

type DisplayListItem = {
  id: string;
  name: string;
  quantity: string | number;
  unit: string;
  category?: string;
  sourceListName?: string | null;
};

const OFFICIAL_CATEGORIES = [
  "Frutas y Verduras",
  "Carnes, Pollo y Pescados",
  "Jamón y Salchichonería",
  "Lácteos y Refrigerados",
  "Panadería y Tortillería",
  "Abarrotes",
  "Bebidas",
  "Vinos y Licores",
  "Congelados",
  "Limpieza y Hogar",
  "Farmacia, Bebé y Cuidado Personal",
  "Mascotas",
  "Ferretería y Autos",
  "Cajas y Salida",
  "Otro / Temporal",
] as const;

const CATEGORY_LABELS_EN: Record<(typeof OFFICIAL_CATEGORIES)[number], string> = {
  "Frutas y Verduras": "Fruits and Vegetables",
  "Carnes, Pollo y Pescados": "Meat, Poultry and Seafood",
  "Jamón y Salchichonería": "Deli Meats and Cold Cuts",
  "Lácteos y Refrigerados": "Dairy and Chilled",
  "Panadería y Tortillería": "Bakery and Tortilleria",
  Abarrotes: "Pantry and Groceries",
  Bebidas: "Beverages",
  "Vinos y Licores": "Wine and Spirits",
  Congelados: "Frozen",
  "Limpieza y Hogar": "Cleaning and Home",
  "Farmacia, Bebé y Cuidado Personal": "Pharmacy, Baby and Personal Care",
  Mascotas: "Pet Care",
  "Ferretería y Autos": "Hardware and Auto",
  "Cajas y Salida": "Checkout and Front Area",
  "Otro / Temporal": "Other / Seasonal",
};


const OFFICIAL_UNITS = [
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

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(18,36,94,0.24)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: "max(16px, env(safe-area-inset-top))",
  paddingRight: 16,
  paddingBottom: "max(16px, calc(16px + env(safe-area-inset-bottom)))",
  paddingLeft: 16,
  zIndex: 120,
};

const modalCardStyle: React.CSSProperties = {
  width: "min(420px, 100%)",
  maxHeight: "min(320px, calc(100dvh - 56px))",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 22,
  border: `1px solid ${MC_NAVY_LINE}`,
  padding: 14,
  boxShadow: "0 16px 40px rgba(18,36,94,0.18)",
};

function openPdf(html: string) {
  if (!html) return;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function normalizeValue(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDisplayItemName(item: Pick<DisplayListItem, "name" | "sourceListName">) {
  const sourceListName = String(item.sourceListName ?? "").trim();
  return sourceListName ? `${item.name} (${sourceListName})` : item.name;
}

function renderDisplayItemName(item: Pick<DisplayListItem, "name" | "sourceListName">, baseFontSize: number) {
  const sourceListName = String(item.sourceListName ?? "").trim();
  if (!sourceListName) return item.name;

  return (
    <>
      <span>{item.name}</span>{" "}
      <span
        style={{
          fontSize: Math.max(baseFontSize - 3, 12),
          fontWeight: 400,
          color: MC_NAVY_MUTED,
        }}
      >
        ({sourceListName})
      </span>
    </>
  );
}

function deleteItemEverywhere(id: string) {
  const state = readState();
  const target = state.activeShoppingListItems.find((item) => item.id === id);
  if (!target) return state;

  const sameGeneralItem = (item: { name: string; unit: string; store: string }) =>
    normalizeValue(item.name) === normalizeValue(target.name) &&
    normalizeValue(item.unit) === normalizeValue(target.unit) &&
    normalizeValue(item.store) === normalizeValue(target.store);

  const next = {
    ...state,
    activeShoppingListItems: state.activeShoppingListItems.filter((item) => item.id !== id),
    generalListItems: state.generalListItems.filter((item) => !sameGeneralItem(item)),
  };

  writeState(next);
  return next;
}


function toSafeText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toSafePositiveNumber(value: unknown, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildCatalogSuggestions(store: string): CatalogSuggestion[] {
  const state = readState();
  const itemsMaster = Array.isArray(state.itemsMaster) ? state.itemsMaster : [];
  const generalListItems = Array.isArray(state.generalListItems) ? state.generalListItems : [];
  const activeShoppingListItems = Array.isArray(state.activeShoppingListItems) ? state.activeShoppingListItems : [];
  const catalog = new Map<string, CatalogSuggestion>();

  const register = (item: {
    name?: unknown;
    quantity?: unknown;
    unit?: unknown;
    defaultUnit?: unknown;
    category?: unknown;
    store?: unknown;
    defaultStore?: unknown;
  }) => {
    const name = toSafeText(item.name);
    if (!name) return;

    const unit = toSafeText(item.unit ?? item.defaultUnit, "pza");
    const category = toSafeText(item.category, "Abarrotes");
    const targetStore = toSafeText(item.store ?? item.defaultStore, store);
    const key = normalizeValue(`${name}|${unit}|${category}|${targetStore}`);

    if (catalog.has(key)) return;

    catalog.set(key, {
      name,
      quantity: toSafePositiveNumber(item.quantity, 1),
      unit,
      category,
      store: targetStore,
    });
  };

  itemsMaster.forEach(register);
  generalListItems.forEach(register);
  activeShoppingListItems.forEach(register);

  return Array.from(catalog.values()).sort((left, right) => left.name.localeCompare(right.name, "es"));
}

function createDraftPurchaseItem(store: string, seed?: Partial<CatalogSuggestion>): DraftPurchaseItem {
  return {
    name: toSafeText(seed?.name),
    quantity: String(toSafePositiveNumber(seed?.quantity, 1)),
    unit: toSafeText(seed?.unit, "pza"),
    category: toSafeText(seed?.category, "Abarrotes"),
    store,
  };
}


function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `mc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sameCatalogIdentity(
  item: {
    name?: unknown;
    unit?: unknown;
    defaultUnit?: unknown;
    store?: unknown;
    defaultStore?: unknown;
  },
  target: {
    name: string;
    unit: string;
    store: string;
  }
) {
  return (
    normalizeValue(item.name) === normalizeValue(target.name) &&
    normalizeValue(item.unit ?? item.defaultUnit) === normalizeValue(target.unit) &&
    normalizeValue(item.store ?? item.defaultStore) === normalizeValue(target.store)
  );
}

function normalizeCategory(value: unknown): (typeof OFFICIAL_CATEGORIES)[number] {
  const normalizedCategory = normalizeValue(value);
  const foundCategory = OFFICIAL_CATEGORIES.find(
    (category) => normalizeValue(category) === normalizedCategory
  );

  return foundCategory ?? "Otro / Temporal";
}

function sortItemsByName<T extends { name?: unknown }>(items: T[]) {
  return [...items].sort((left, right) =>
    toSafeText(left.name).localeCompare(toSafeText(right.name), "es", {
      sensitivity: "base",
    })
  );
}

function groupItemsByCategory<T extends { name?: unknown; category?: unknown }>(items: T[]) {
  const itemsByCategory = new Map<(typeof OFFICIAL_CATEGORIES)[number], T[]>();

  items.forEach((item) => {
    const category = normalizeCategory(item.category);
    const currentItems = itemsByCategory.get(category) ?? [];
    currentItems.push(item);
    itemsByCategory.set(category, currentItems);
  });

  return OFFICIAL_CATEGORIES.map((category) => ({
    category,
    items: sortItemsByName(itemsByCategory.get(category) ?? []),
  })).filter((group) => group.items.length > 0);
}

function translateCategoryLabel(category: string, language: string) {
  if (language !== "en") return category;
  return CATEGORY_LABELS_EN[normalizeCategory(category)] ?? category;
}


const WHATSAPP_UNIT_META = {
  pza: { esSingular: "pieza", esPlural: "piezas", enSingular: "piece", enPlural: "pieces" },
  paquete: { esSingular: "paquete", esPlural: "paquetes", enSingular: "pack", enPlural: "packs" },
  caja: { esSingular: "caja", esPlural: "cajas", enSingular: "box", enPlural: "boxes" },
  lata: { esSingular: "lata", esPlural: "latas", enSingular: "can", enPlural: "cans" },
  botella: { esSingular: "botella", esPlural: "botellas", enSingular: "bottle", enPlural: "bottles" },
  frasco: { esSingular: "frasco", esPlural: "frascos", enSingular: "jar", enPlural: "jars" },
  bote: { esSingular: "bote", esPlural: "botes", enSingular: "tub", enPlural: "tubs" },
  sobre: { esSingular: "sobre", esPlural: "sobres", enSingular: "packet", enPlural: "packets" },
  bolsa: { esSingular: "bolsa", esPlural: "bolsas", enSingular: "bag", enPlural: "bags" },
  rollo: { esSingular: "rollo", esPlural: "rollos", enSingular: "roll", enPlural: "rolls" },
  docena: { esSingular: "docena", esPlural: "docenas", enSingular: "dozen", enPlural: "dozens" },
  g: { esSingular: "g", esPlural: "g", enSingular: "g", enPlural: "g" },
  kg: { esSingular: "kg", esPlural: "kg", enSingular: "kg", enPlural: "kg" },
  oz: { esSingular: "oz", esPlural: "oz", enSingular: "oz", enPlural: "oz" },
  lb: { esSingular: "lb", esPlural: "lb", enSingular: "lb", enPlural: "lb" },
  ml: { esSingular: "ml", esPlural: "ml", enSingular: "ml", enPlural: "ml" },
  l: { esSingular: "l", esPlural: "l", enSingular: "l", enPlural: "l" },
  gal: { esSingular: "gal", esPlural: "gal", enSingular: "gal", enPlural: "gal" },
} as const;

function normalizeWhatsAppUnit(value: unknown): keyof typeof WHATSAPP_UNIT_META | "" {
  const raw = normalizeValue(value);
  if (!raw) return "";

  if (["pza", "pzas", "pieza", "piezas", "unidad", "unidades", "ea", "each", "unit", "units", "pc", "pcs", "piece", "pieces"].includes(raw)) return "pza";
  if (["paquete", "paquetes", "pack", "packs", "pk", "pks"].includes(raw)) return "paquete";
  if (["caja", "cajas", "box", "boxes"].includes(raw)) return "caja";
  if (["lata", "latas", "can", "cans"].includes(raw)) return "lata";
  if (["botella", "botellas", "bottle", "bottles", "btl", "btls"].includes(raw)) return "botella";
  if (["frasco", "frascos", "jar", "jars"].includes(raw)) return "frasco";
  if (["bote", "botes", "tub", "tubs"].includes(raw)) return "bote";
  if (["sobre", "sobres", "packet", "packets", "pkt", "pkts"].includes(raw)) return "sobre";
  if (["bolsa", "bolsas", "bag", "bags"].includes(raw)) return "bolsa";
  if (["rollo", "rollos", "roll", "rolls"].includes(raw)) return "rollo";
  if (["docena", "docenas", "dozen", "dozens", "doz"].includes(raw)) return "docena";
  if (["g", "gr", "grs", "gramo", "gramos", "gram", "grams"].includes(raw)) return "g";
  if (["kg", "kilo", "kilos", "kilogramo", "kilogramos", "kilogram", "kilograms"].includes(raw)) return "kg";
  if (["oz", "onza", "onzas", "ounce", "ounces"].includes(raw)) return "oz";
  if (["lb", "libra", "libras", "pound", "pounds"].includes(raw)) return "lb";
  if (["ml", "mililitro", "mililitros", "milliliter", "milliliters"].includes(raw)) return "ml";
  if (["l", "lt", "lts", "litro", "litros", "liter", "liters"].includes(raw)) return "l";
  if (["gal", "galon", "galones", "gallon", "gallons"].includes(raw)) return "gal";

  return "";
}

function formatWhatsAppUnit(value: unknown, quantity: unknown, language: string) {
  const canonicalUnit = normalizeWhatsAppUnit(value);
  if (!canonicalUnit) return toSafeText(value);

  const meta = WHATSAPP_UNIT_META[canonicalUnit];
  const numericQuantity = Number(String(quantity ?? "").replace(",", "."));
  const usePlural = Number.isFinite(numericQuantity) ? Math.abs(numericQuantity) !== 1 : false;

  if (language === "en") {
    return usePlural ? meta.enPlural : meta.enSingular;
  }

  return usePlural ? meta.esPlural : meta.esSingular;
}

function formatWhatsAppItemLine(item: Pick<DisplayListItem, "name" | "quantity" | "unit">, language: string) {
  const quantity = toSafeText(item.quantity);
  const unit = formatWhatsAppUnit(item.unit, item.quantity, language);
  const details = [quantity, unit].filter(Boolean).join(" ");

  return details ? `- ${item.name} (${details})` : `- ${item.name}`;
}

function buildStoreWhatsAppText(
  store: string,
  items: Pick<DisplayListItem, "name" | "quantity" | "unit" | "category">[],
  language: string
) {
  const groupedItems = groupItemsByCategory(items);
  if (!store || groupedItems.length === 0) return store;

  const groupedText = groupedItems
    .map((group) =>
      [
        translateCategoryLabel(group.category, language),
        ...group.items.map((item) => formatWhatsAppItemLine(item, language)),
      ].join("\n")
    )
    .join("\n\n");

  return `${store}\n\n${groupedText}`.trim();
}

function sideActionButtonStyle(fontSize: number): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${MC_NAVY_LINE}`,
    background: "#fff",
    color: MC_NAVY,
    fontWeight: 800,
    fontSize,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}

function circleBadgeStyle(active: boolean, fontSize: number): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: active ? MC_NAVY : MC_NAVY_SOFT,
    color: active ? "#fff" : MC_NAVY,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize,
    fontWeight: 900,
    flexShrink: 0,
  };
}

export default function ShoppingPage() {
  const { activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);
  const [message, setMessage] = React.useState("");
  const [openStore, setOpenStore] = React.useState<string | null>(null);
  const [removeAction, setRemoveAction] = React.useState<RemoveAction>(null);
  const [deferredIdsByStore, setDeferredIdsByStore] = React.useState<Record<string, string[]>>({});
  const [isAddToPurchaseOpen, setIsAddToPurchaseOpen] = React.useState(false);
  const [addFlowStep, setAddFlowStep] = React.useState<AddFlowStep>("search");
  const [addSearchValue, setAddSearchValue] = React.useState("");
  const [draftPurchaseItem, setDraftPurchaseItem] = React.useState<DraftPurchaseItem | null>(null);
  const addSearchInputRef = React.useRef<HTMLInputElement | null>(null);

  const groups = groupByStore(activeShoppingListItems);
  const selectedStoreGroup = groups.find((group) => group.store === openStore) ?? null;
  const hiddenIds = selectedStoreGroup ? new Set(deferredIdsByStore[selectedStoreGroup.store] ?? []) : new Set<string>();
  const visibleStoreItems = selectedStoreGroup
    ? selectedStoreGroup.items.filter((item) => !hiddenIds.has(item.id))
    : [];
  const pendingItems = selectedStoreGroup ? visibleStoreItems.filter((item) => !item.checked) : [];
  const addedItems = selectedStoreGroup ? visibleStoreItems.filter((item) => item.checked) : [];
  const catalogSuggestions = React.useMemo(() => {
    if (!hydrated || !selectedStoreGroup) return [];
    return buildCatalogSuggestions(selectedStoreGroup.store);
  }, [hydrated, selectedStoreGroup, activeShoppingListItems]);
  const normalizedAddSearch = normalizeValue(addSearchValue);
  const matchedSuggestions = React.useMemo(() => {
    if (normalizedAddSearch.length < 2) return [];
    return catalogSuggestions
      .filter((item) => normalizeValue(item.name).includes(normalizedAddSearch))
      .slice(0, 8);
  }, [catalogSuggestions, normalizedAddSearch]);
  const groupedPendingItems = React.useMemo(
    () => groupItemsByCategory(pendingItems as DisplayListItem[]),
    [pendingItems]
  );
  const groupedAddedItems = React.useMemo(
    () => groupItemsByCategory(addedItems as DisplayListItem[]),
    [addedItems]
  );

  if (!hydrated) {
    return (
      <AppShell
        title={t("es", "shoppingTitle")}
        darkHero
        subtitle={t("es", "shoppingSubtitle")}
        showCart={false}
        footerActions={[]}
      >
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  function onWhatsAppStore(store: string) {
    const text = buildStoreWhatsAppText(store, visibleStoreItems as DisplayListItem[], lang);
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function onPdfStore(store: string) {
    openPdf(buildShoppingListHtmlForStore(store, lang));
  }

  function closeRemoveMenu() {
    setRemoveAction(null);
  }

  function onMoveToLater() {
    if (!removeAction || !selectedStoreGroup) return;
    toggleActiveItemChecked(removeAction.id, false);
    setDeferredIdsByStore((current) => ({
      ...current,
      [selectedStoreGroup.store]: Array.from(
        new Set([...(current[selectedStoreGroup.store] ?? []), removeAction.id])
      ),
    }));
    setMessage(
      lang === "en"
        ? `${removeAction.name} stays pending in My List.`
        : `${removeAction.name} sigue pendiente en Mi Lista.`
    );
    closeRemoveMenu();
  }

  function onDeleteItem() {
    if (!removeAction) return;
    deleteItemEverywhere(removeAction.id);
    setMessage(
      lang === "en"
        ? `${removeAction.name} removed from My List and Shopping.`
        : `${removeAction.name} se eliminó de Mi Lista y De Compras.`
    );
    closeRemoveMenu();
  }

  function openAddToPurchase() {
    if (!selectedStoreGroup) return;
    setAddSearchValue("");
    setDraftPurchaseItem(createDraftPurchaseItem(selectedStoreGroup.store));
    setAddFlowStep("search");
    setIsAddToPurchaseOpen(true);
  }

  function closeAddToPurchase() {
    setIsAddToPurchaseOpen(false);
    setAddFlowStep("search");
    setAddSearchValue("");
    setDraftPurchaseItem(null);
  }

  function openDraftEditor(seed?: Partial<CatalogSuggestion>) {
    if (!selectedStoreGroup) return;
    addSearchInputRef.current?.blur();
    setDraftPurchaseItem(createDraftPurchaseItem(selectedStoreGroup.store, seed));
    setAddFlowStep("editor");
  }

  function updateDraftPurchaseItem<K extends keyof DraftPurchaseItem>(field: K, value: DraftPurchaseItem[K]) {
    setDraftPurchaseItem((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  function onSaveAddToPurchase() {
    if (!draftPurchaseItem || !selectedStoreGroup) return;

    const articleName = toSafeText(draftPurchaseItem.name);
    if (!articleName) {
      setMessage(lang === "en" ? "Enter an item name." : "Escribe el nombre del artículo.");
      return;
    }

    const quantity = String(toSafePositiveNumber(draftPurchaseItem.quantity, 1));
    const unit = toSafeText(draftPurchaseItem.unit, "pza");
    const category = toSafeText(draftPurchaseItem.category, "Abarrotes");
    const store = selectedStoreGroup.store;
    const state = readState();

    const activeShoppingListItems = Array.isArray(state.activeShoppingListItems)
      ? [...(state.activeShoppingListItems as Array<Record<string, unknown>>)]
      : [];
    const generalListItems = Array.isArray(state.generalListItems)
      ? [...(state.generalListItems as Array<Record<string, unknown>>)]
      : [];

    const existingActiveIndex = activeShoppingListItems.findIndex((item) =>
      sameCatalogIdentity(item, {
        name: articleName,
        unit,
        store,
      })
    );

    const activeBaseItem =
      existingActiveIndex >= 0 ? activeShoppingListItems[existingActiveIndex] : null;

    const nextActiveItem: Record<string, unknown> = {
      ...(activeBaseItem ?? {}),
      id: String(activeBaseItem?.id ?? createClientId()),
      itemKey:
        typeof activeBaseItem?.itemKey === "string" && activeBaseItem.itemKey
          ? activeBaseItem.itemKey
          : normalizeValue(articleName),
      sourceTypes: Array.isArray(activeBaseItem?.sourceTypes) ? activeBaseItem.sourceTypes : [],
      sourceRefs: Array.isArray(activeBaseItem?.sourceRefs) ? activeBaseItem.sourceRefs : [],
      createdAt:
        typeof activeBaseItem?.createdAt === "number" ? activeBaseItem.createdAt : Date.now(),
      name: articleName,
      quantity,
      unit,
      category,
      store,
      checked: false,
    };

    const nextActiveShoppingListItems =
      existingActiveIndex >= 0
        ? activeShoppingListItems.map((item, index) =>
            index === existingActiveIndex ? nextActiveItem : item
          )
        : [...activeShoppingListItems, nextActiveItem];

    const existingGeneralIndex = generalListItems.findIndex((item) =>
      sameCatalogIdentity(item, {
        name: articleName,
        unit,
        store,
      })
    );

    const generalBaseItem =
      existingGeneralIndex >= 0 ? generalListItems[existingGeneralIndex] : null;

    const nextGeneralItem: Record<string, unknown> = {
      ...(generalBaseItem ?? {}),
      id: String(generalBaseItem?.id ?? createClientId()),
      name: articleName,
      quantity,
      unit,
      category,
      store,
      active: true,
      lastUsedAt: Date.now(),
    };

    const nextGeneralListItems =
      existingGeneralIndex >= 0
        ? generalListItems.map((item, index) =>
            index === existingGeneralIndex ? nextGeneralItem : item
          )
        : [...generalListItems, nextGeneralItem];

    writeState({
      ...state,
      activeShoppingListItems: nextActiveShoppingListItems as any,
      generalListItems: nextGeneralListItems as any,
    });

    setDeferredIdsByStore((current) => {
      const hiddenIds = current[store] ?? [];
      const activeId = String(nextActiveItem.id ?? "");
      if (!activeId || hiddenIds.length === 0 || !hiddenIds.includes(activeId)) {
        return current;
      }

      return {
        ...current,
        [store]: hiddenIds.filter((id) => id !== activeId),
      };
    });

    setMessage(
      lang === "en"
        ? `Added "${articleName}" to this shopping trip.`
        : `Se agregó "${articleName}" a esta compra.`
    );
    closeAddToPurchase();
  }

  function onCloseStore(store: string) {
    const storeItems = activeShoppingListItems.filter((item) => item.store === store);
    const boughtCount = storeItems.filter((item) => item.checked).length;
    const pendingCount = storeItems.filter((item) => !item.checked).length;
    const ok = window.confirm(
      lang === "en"
        ? `${boughtCount} purchased item(s) will be sent to History and ${pendingCount} item(s) will remain pending in ${store}.`
        : `${boughtCount} artículo(s) comprado(s) se enviarán a Historial y ${pendingCount} artículo(s) seguirán pendientes en ${store}.`
    );
    if (!ok) return;

    closeShoppingForStore(store);
    setMessage(
      lang === "en"
        ? `${store}: ${boughtCount} item(s) sent to History, ${pendingCount} pending.`
        : `${store}: ${boughtCount} artículo(s) enviados a Historial, ${pendingCount} pendiente(s).`
    );
    setOpenStore(null);
  }

  function renderCategoryHeading(category: string) {
    return (
      <div
        style={{
          padding: "9px 12px",
          borderRadius: 12,
          border: `1px solid ${MC_NAVY_LINE}`,
          background: MC_NAVY_SOFT,
          color: MC_NAVY,
          fontSize: s(13),
          fontWeight: 900,
        }}
      >
        {translateCategoryLabel(category, lang)}
      </div>
    );
  }

  function renderStoreItemRow(
    item: DisplayListItem,
    options: {
      rowBackground: string;
      badgeLabel: string;
      badgeActive: boolean;
      badgeFontSize: number;
      onToggle: () => void;
    }
  ) {
    return (
      <div
        key={item.id}
        style={{
          width: "100%",
          border: `1px solid ${MC_NAVY_LINE}`,
          borderRadius: 16,
          padding: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: options.rowBackground,
          color: MC_NAVY,
        }}
      >
        <button
          type="button"
          onClick={options.onToggle}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            gap: 12,
            alignItems: "center",
            border: "none",
            background: "transparent",
            padding: 0,
            textAlign: "left",
            color: "inherit",
          }}
        >
          <div style={circleBadgeStyle(options.badgeActive, s(options.badgeFontSize))}>
            {options.badgeLabel}
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: s(17), fontWeight: 500 }}>
            {renderDisplayItemName(item, s(17))}
          </div>
          <div style={{ fontSize: s(15), color: MC_NAVY_MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>
            <QtyUnitText quantity={String(item.quantity)} unit={item.unit} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRemoveAction({ id: item.id, name: getDisplayItemName(item) })}
          style={sideActionButtonStyle(s(14))}
        >
          {lang === "en" ? "Remove" : "Quitar"}
        </button>
      </div>
    );
  }

  return (
    <AppShell
      title={t(lang, "shoppingTitle")}
      darkHero
      subtitle={t(lang, "shoppingSubtitle")}
      showCart={false}
      footerInset={selectedStoreGroup ? 88 : 0}
      footerActions={
        selectedStoreGroup
          ? [
              {
                label: t(lang, "whatsApp"),
                primary: true,
                disabled: false,
                onClick: () => onWhatsAppStore(selectedStoreGroup.store),
              },
              {
                label: t(lang, "pdf"),
                disabled: false,
                onClick: () => onPdfStore(selectedStoreGroup.store),
              },
            ]
          : []
      }
    >
      {!selectedStoreGroup ? (
        <section style={{ ...cardStyle(), padding: 14 }}>
          <div style={{ fontSize: s(16), fontWeight: 800, marginBottom: 10 }}>{t(lang, "stores")}</div>

          {groups.length === 0 ? (
            <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t(lang, "noItemsYet")}</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {groups.map((group) => {
                const hiddenIdsForStore = new Set(deferredIdsByStore[group.store] ?? []);
                const pendingCount = group.items.filter(
                  (item) => !item.checked && !hiddenIdsForStore.has(item.id)
                ).length;
                return (
                  <button
                    key={group.store}
                    type="button"
                    onClick={() => setOpenStore(group.store)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: s(15) }}>{group.store}</span>
                    <span style={{ fontWeight: 400, fontSize: s(15) }}>
                      {" "}
                      · {pendingCount} {t(lang, "itemsLabel")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          <section style={{ ...cardStyle(), padding: 14 }}>
            <button
              type="button"
              onClick={() => setOpenStore(null)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                marginBottom: 10,
                color: MC_NAVY,
                fontSize: s(14),
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <span aria-hidden="true">←</span>
              <span>{lang === "en" ? "Back to stores" : "Regresar a tiendas"}</span>
            </button>
            <div style={{ fontSize: s(16), fontWeight: 800, color: MC_NAVY }}>
              {lang === "en" ? "Your Shopping Cart" : "Tu Carrito de Compras"}
            </div>
            <div style={{ marginTop: 4, fontSize: s(20), fontWeight: 900 }}>{selectedStoreGroup.store}</div>
            <div style={{ marginTop: 8, fontSize: s(14), color: MC_NAVY_MUTED }}>
              {lang === "en"
                ? "Select what you are adding to your cart."
                : "Selecciona lo que vas agregando a tu carrito"}
            </div>
          </section>


          <section style={{ ...cardStyle(), padding: 14 }}>
            <div style={{ fontSize: s(15), fontWeight: 800, marginBottom: 10 }}>
              {lang === "en" ? "To add right now" : "Para agregar ahorita"}
            </div>

            {pendingItems.length === 0 ? (
              <div
                style={{
                  border: `1px solid ${MC_NAVY_LINE}`,
                  borderRadius: 16,
                  padding: 14,
                  background: MC_NAVY_SOFT,
                  color: MC_NAVY_MUTED,
                  fontSize: s(14),
                }}
              >
                {lang === "en"
                  ? "You already added everything from this store."
                  : "Ya agregaste todo lo de esta tienda."}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {groupedPendingItems.map((group) => (
                  <div key={`pending-${group.category}`} style={{ display: "grid", gap: 8 }}>
                    {renderCategoryHeading(group.category)}
                    <div style={{ display: "grid", gap: 10 }}>
                      {group.items.map((item) =>
                        renderStoreItemRow(item, {
                          rowBackground: "#fff",
                          badgeLabel: "+",
                          badgeActive: false,
                          badgeFontSize: 18,
                          onToggle: () => toggleActiveItemChecked(item.id, true),
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ ...cardStyle(), padding: 14 }}>
            <div style={{ fontSize: s(15), fontWeight: 800, marginBottom: 10 }}>
              {lang === "en" ? "Already in your cart" : "Ya en tu carrito"}
            </div>

            {addedItems.length === 0 ? (
              <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>
                {lang === "en"
                  ? "Nothing added yet from this store."
                  : "Todavía no agregas nada de esta tienda."}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {groupedAddedItems.map((group) => (
                  <div key={`added-${group.category}`} style={{ display: "grid", gap: 8 }}>
                    {renderCategoryHeading(group.category)}
                    <div style={{ display: "grid", gap: 10 }}>
                      {group.items.map((item) =>
                        renderStoreItemRow(item, {
                          rowBackground: MC_NAVY_SOFT,
                          badgeLabel: "✓",
                          badgeActive: true,
                          badgeFontSize: 14,
                          onToggle: () => toggleActiveItemChecked(item.id, false),
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={openAddToPurchase}
              style={{
                marginTop: 14,
                width: "100%",
                minHeight: 50,
                padding: "13px 14px",
                borderRadius: 16,
                border: `1px solid ${MC_NAVY_LINE}`,
                background: "#fff",
                color: MC_NAVY,
                fontWeight: 900,
                fontSize: s(14),
              }}
            >
              {lang === "en" ? "Add to this purchase" : "Agregar a esta compra"}
            </button>


            <button
              type="button"
              onClick={() => onCloseStore(selectedStoreGroup.store)}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "13px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY}`,
                background: MC_NAVY,
                color: "#fff",
                fontWeight: 900,
                fontSize: s(14),
              }}
            >
              {t(lang, "finishPurchase")}
            </button>
          </section>
        </>
      )}

      {message ? (
        <section style={{ ...cardStyle(), padding: 14 }}>
          <div style={{ fontSize: s(14), color: MC_NAVY }}>{message}</div>
        </section>
      ) : null}

      {isAddToPurchaseOpen && selectedStoreGroup ? (
        <div style={modalOverlayStyle} onClick={closeAddToPurchase}>
          <div
            style={{
              ...modalCardStyle,
              width: "min(440px, 100%)",
              maxHeight: "min(640px, calc(100dvh - 40px))",
              padding: 16,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ fontSize: s(18), fontWeight: 900, color: MC_NAVY }}>
              {lang === "en" ? "Add to this purchase" : "Agregar a esta compra"}
            </div>

            {addFlowStep === "search" ? (
              <>
                <label style={{ marginTop: 14, display: "grid", gap: 6 }}>
                  <span style={{ fontSize: s(13), fontWeight: 800, color: MC_NAVY }}>
                    {lang === "en" ? "Item" : "Artículo"}
                  </span>

                  <input
                  ref={addSearchInputRef}
                  value={addSearchValue}
                  onChange={(event) => setAddSearchValue(event.target.value)}
                  placeholder={lang === "en" ? "Item name" : "Nombre del artículo"}
                  autoFocus
                  style={{
                    width: "100%",
                    minHeight: 48,
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    padding: "12px 14px",
                    fontSize: s(16),
                    outline: "none",
                    color: MC_NAVY,
                  }}
                />
                </label>

                {normalizedAddSearch.length >= 2 ? (
                  matchedSuggestions.length > 0 ? (
                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                      {matchedSuggestions.map((item) => (
                        <button
                          key={`${item.name}-${item.unit}-${item.category}-${item.store}`}
                          type="button"
                          onClick={() => openDraftEditor(item)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            borderRadius: 16,
                            border: `1px solid ${MC_NAVY_LINE}`,
                            background: "#fff",
                            padding: 14,
                            color: MC_NAVY,
                          }}
                        >
                          <div style={{ fontSize: s(16), fontWeight: 900 }}>{item.name}</div>
                          <div style={{ marginTop: 4, fontSize: s(13), color: MC_NAVY_MUTED }}>
                            {item.category} · {item.unit}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openDraftEditor({
                          name: addSearchValue.trim(),
                          quantity: 1,
                          unit: "pza",
                          category: "Abarrotes",
                          store: selectedStoreGroup.store,
                        })
                      }
                      style={{
                        marginTop: 12,
                        width: "100%",
                        minHeight: 48,
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: `1px solid ${MC_NAVY}`,
                        background: MC_NAVY,
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: s(14),
                      }}
                    >
                      {lang === "en" ? "Add item" : "Agregar artículo"}
                    </button>
                  )
                ) : null}

                <button
                  type="button"
                  onClick={closeAddToPurchase}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    minHeight: 46,
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    background: "#fff",
                    color: MC_NAVY,
                    fontWeight: 900,
                    fontSize: s(14),
                  }}
                >
                  {lang === "en" ? "Cancel" : "Cancelar"}
                </button>
              </>
            ) : draftPurchaseItem ? (
              <>
                <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: s(13), fontWeight: 800, color: MC_NAVY }}>
                      {lang === "en" ? "Item" : "Artículo"}
                    </span>
                    <input
                      value={draftPurchaseItem.name}
                      onChange={(event) => updateDraftPurchaseItem("name", event.target.value)}
                      style={{
                        width: "100%",
                        minHeight: 48,
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        padding: "12px 14px",
                        fontSize: s(16),
                        outline: "none",
                        color: MC_NAVY,
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: s(13), fontWeight: 800, color: MC_NAVY }}>
                      {lang === "en" ? "Quantity" : "Cantidad"}
                    </span>
                    <input
                      value={draftPurchaseItem.quantity}
                      onChange={(event) => updateDraftPurchaseItem("quantity", event.target.value)}
                      inputMode="decimal"
                      style={{
                        width: "100%",
                        minHeight: 48,
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        padding: "12px 14px",
                        fontSize: s(16),
                        outline: "none",
                        color: MC_NAVY,
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: s(13), fontWeight: 800, color: MC_NAVY }}>
                      {lang === "en" ? "Unit" : "Unidad"}
                    </span>
                    <select
                      value={draftPurchaseItem.unit}
                      onChange={(event) => updateDraftPurchaseItem("unit", event.target.value)}
                      style={{
                        width: "100%",
                        minHeight: 48,
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        padding: "12px 14px",
                        fontSize: s(16),
                        outline: "none",
                        color: MC_NAVY,
                        background: "#fff",
                      }}
                    >
                      {OFFICIAL_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: s(13), fontWeight: 800, color: MC_NAVY }}>
                      {lang === "en" ? "Category" : "Categoría"}
                    </span>
                    <select
                      value={draftPurchaseItem.category}
                      onChange={(event) => updateDraftPurchaseItem("category", event.target.value)}
                      style={{
                        width: "100%",
                        minHeight: 48,
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        padding: "12px 14px",
                        fontSize: s(16),
                        outline: "none",
                        color: MC_NAVY,
                        background: "#fff",
                      }}
                    >
                      {OFFICIAL_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={onSaveAddToPurchase}
                    style={{
                      width: "100%",
                      minHeight: 48,
                      padding: "12px 14px",
                      borderRadius: 16,
                      border: `1px solid ${MC_NAVY}`,
                      background: MC_NAVY,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: s(14),
                    }}
                  >
                    {lang === "en" ? "Add to this purchase" : "Agregar a esta compra"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddFlowStep("search")}
                    style={{
                      width: "100%",
                      minHeight: 46,
                      padding: "12px 14px",
                      borderRadius: 16,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                      fontWeight: 900,
                      fontSize: s(14),
                    }}
                  >
                    {lang === "en" ? "Back" : "Regresar"}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {removeAction ? (
        <div style={modalOverlayStyle} onClick={closeRemoveMenu}>
          <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ fontSize: s(16), fontWeight: 900, color: MC_NAVY }}>
              {lang === "en" ? "Remove item" : "Quitar artículo"}
            </div>
            <div style={{ marginTop: 6, fontSize: s(14), color: MC_NAVY_MUTED }}>
              {removeAction.name}
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={onMoveToLater}
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: `1px solid ${MC_NAVY_LINE}`,
                  background: "#fff",
                  color: MC_NAVY,
                  fontWeight: 900,
                  fontSize: s(14),
                }}
              >
                {lang === "en" ? "For later" : "Para Después"}
              </button>

              <button
                type="button"
                onClick={onDeleteItem}
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: `1px solid ${MC_NAVY}`,
                  background: MC_NAVY,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: s(14),
                }}
              >
                {lang === "en" ? "Delete" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
