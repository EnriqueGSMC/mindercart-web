"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell, MC_NAVY, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { categoryLabel, t } from "@/lib/mindercart/i18n";
import {
  STORE_OPTIONS,
  addGeneralSelections,
  addQuickNeed,
  itemKey,
  removeActiveItem,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { ActiveShoppingListItem, GeneralListItem, ItemMaster } from "@/lib/mindercart/types";

const MODAL_TOP_OFFSET = "calc(env(safe-area-inset-top) + 148px)";
const MODAL_BOTTOM_OFFSET = "calc(env(safe-area-inset-bottom) + 84px)";
const CATEGORY_FOOTER_INSET = 112;
const CHECKED_ROW_BG = "#EAF1FF";
const CHECKED_ROW_BORDER = "#C9D8FF";
const ADD_STORE_VALUE = "__ADD_STORE__";

const CATEGORY_ORDER = [
  "Frutas y Verduras",
  "Carnes, Pollo y Pescados",
  "Lácteos y Refrigerados",
  "Panadería y Tortillería",
  "Abarrotes",
  "Jamón y Salchichonería",
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

const CATEGORY_ALIASES: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  "frutas y verduras": "Frutas y Verduras",
  produce: "Frutas y Verduras",
  "carnes, pollo y pescados": "Carnes, Pollo y Pescados",
  "meat, poultry and seafood": "Carnes, Pollo y Pescados",
  "lácteos y refrigerados": "Lácteos y Refrigerados",
  "lacteos y refrigerados": "Lácteos y Refrigerados",
  "dairy and refrigerated": "Lácteos y Refrigerados",
  "panadería y tortillería": "Panadería y Tortillería",
  "panaderia y tortilleria": "Panadería y Tortillería",
  "bakery and tortilla shop": "Panadería y Tortillería",
  abarrotes: "Abarrotes",
  groceries: "Abarrotes",
  "jamón y salchichonería": "Jamón y Salchichonería",
  "jamon y salchichoneria": "Jamón y Salchichonería",
  "deli meats and cold cuts": "Jamón y Salchichonería",
  bebidas: "Bebidas",
  beverages: "Bebidas",
  "vinos y licores": "Vinos y Licores",
  "wine and spirits": "Vinos y Licores",
  congelados: "Congelados",
  frozen: "Congelados",
  "limpieza y hogar": "Limpieza y Hogar",
  "household and cleaning": "Limpieza y Hogar",
  "farmacia, bebé y cuidado personal": "Farmacia, Bebé y Cuidado Personal",
  "farmacia, bebe y cuidado personal": "Farmacia, Bebé y Cuidado Personal",
  "pharmacy, baby and personal care": "Farmacia, Bebé y Cuidado Personal",
  mascotas: "Mascotas",
  pets: "Mascotas",
  "ferretería y autos": "Ferretería y Autos",
  "ferreteria y autos": "Ferretería y Autos",
  "hardware and auto": "Ferretería y Autos",
  "cajas y salida": "Cajas y Salida",
  checkout: "Cajas y Salida",
  "otro / temporal": "Otro / Temporal",
  other: "Otro / Temporal",
};



const FIXED_UNIT_OPTIONS = [
  "pza",
  "paquete",
  "caja",
  "lata",
  "botella",
  "frasco",
  "bote",
  "sobre",
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

const UNIT_OPTION_META: Record<
  (typeof FIXED_UNIT_OPTIONS)[number],
  { labelEs: string; labelEn: string; abbrEs: string; abbrEn: string }
> = {
  pza: { labelEs: "Pieza", labelEn: "Piece", abbrEs: "pza", abbrEn: "pc" },
  paquete: { labelEs: "Paquete", labelEn: "Pack", abbrEs: "paq.", abbrEn: "pack" },
  caja: { labelEs: "Caja", labelEn: "Box", abbrEs: "caja", abbrEn: "box" },
  lata: { labelEs: "Lata", labelEn: "Can", abbrEs: "lata", abbrEn: "can" },
  botella: { labelEs: "Botella", labelEn: "Bottle", abbrEs: "bot.", abbrEn: "btl" },
  frasco: { labelEs: "Frasco", labelEn: "Jar", abbrEs: "fras.", abbrEn: "jar" },
  bote: { labelEs: "Bote", labelEn: "Tub", abbrEs: "bote", abbrEn: "tub" },
  sobre: { labelEs: "Sobre", labelEn: "Packet", abbrEs: "sbre.", abbrEn: "pkt" },
  bolsa: { labelEs: "Bolsa", labelEn: "Bag", abbrEs: "bolsa", abbrEn: "bag" },
  rollo: { labelEs: "Rollo", labelEn: "Roll", abbrEs: "rollo", abbrEn: "roll" },
  docena: { labelEs: "Docena", labelEn: "Dozen", abbrEs: "doc.", abbrEn: "doz" },
  g: { labelEs: "Gramo", labelEn: "Gram", abbrEs: "g", abbrEn: "g" },
  kg: { labelEs: "Kilogramo", labelEn: "Kilogram", abbrEs: "kg", abbrEn: "kg" },
  oz: { labelEs: "Onza", labelEn: "Ounce", abbrEs: "oz", abbrEn: "oz" },
  lb: { labelEs: "Libra", labelEn: "Pound", abbrEs: "lb", abbrEn: "lb" },
  ml: { labelEs: "Mililitro", labelEn: "Milliliter", abbrEs: "mL", abbrEn: "mL" },
  l: { labelEs: "Litro", labelEn: "Liter", abbrEs: "L", abbrEn: "L" },
  gal: { labelEs: "Galón", labelEn: "Gallon", abbrEs: "gal", abbrEn: "gal" },
};

type CatalogCategoryItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: string;
  store: string;
};

type CatalogCategoryGroup = {
  category: string;
  items: CatalogCategoryItem[];
};

type ActiveCategoryItem = ActiveShoppingListItem & {
  normalizedCategory: string;
};

type ActiveCategoryGroup = {
  category: string;
  items: ActiveCategoryItem[];
};

type ActiveItemEditDraft = {
  original: ActiveShoppingListItem;
  category: string;
  unit: string;
  quantity: string;
  store: string;
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: MODAL_TOP_OFFSET,
  right: 0,
  bottom: MODAL_BOTTOM_OFFSET,
  left: 0,
  padding: "0 12px 0",
  zIndex: 30,
  pointerEvents: "none",
};

const modalCardStyle: React.CSSProperties = {
  width: "min(860px, 100%)",
  maxHeight: "100%",
  margin: "0 auto",
  background: "#fff",
  borderRadius: 24,
  border: "1px solid #dbe3ff",
  boxShadow: "0 16px 40px rgba(18,36,94,0.14)",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
  pointerEvents: "auto",
};

function normalizeValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    )
  );
}


function normalizeUnitOptionValue(value: string) {
  const raw = normalizeValue(value);
  if (!raw) return "";

  if (["pza", "pzas", "pieza", "piezas", "unidad", "unidades", "ea", "each", "unit", "units"].includes(raw)) return "pza";
  if (["paquete", "paquetes", "pack", "packs"].includes(raw)) return "paquete";
  if (["caja", "cajas", "box", "boxes"].includes(raw)) return "caja";
  if (["lata", "latas", "can", "cans"].includes(raw)) return "lata";
  if (["botella", "botellas", "bottle", "bottles"].includes(raw)) return "botella";
  if (["frasco", "frascos", "jar", "jars"].includes(raw)) return "frasco";
  if (["bote", "botes", "tub", "tubs"].includes(raw)) return "bote";
  if (["sobre", "sobres", "packet", "packets", "pkt"].includes(raw)) return "sobre";
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

  return "";
}

function formatUnitOptionLabel(value: string, lang: "es" | "en") {
  const canonicalValue = normalizeUnitOptionValue(value);
  const meta = canonicalValue ? UNIT_OPTION_META[canonicalValue as keyof typeof UNIT_OPTION_META] : null;
  if (!meta) return value;

  return lang === "en" ? `${meta.labelEn} (${meta.abbrEn})` : `${meta.labelEs} (${meta.abbrEs})`;
}

function catalogKey(item: { name: string; unit: string }) {
  return `${normalizeValue(item.name)}__${normalizeValue(item.unit)}`;
}

function preferredStoreFor(item: Pick<ItemMaster, "defaultStore">, preferredStore: string) {
  return item.defaultStore || preferredStore || "HEB";
}

function getSourceListName(item: unknown) {
  if (!item || typeof item !== "object" || !("sourceListName" in item)) return "";
  const value = (item as { sourceListName?: string | null }).sourceListName;
  return String(value ?? "").trim();
}

function isRowActive(item: unknown) {
  if (!item || typeof item !== "object" || !("active" in item)) return true;
  return (item as { active?: boolean | null }).active !== false;
}

function normalizeCategory(value: string | null | undefined) {
  const normalized = normalizeValue(value);
  return CATEGORY_ALIASES[normalized] || "Otro / Temporal";
}

function groupActiveItemsByCategory(items: ActiveShoppingListItem[]) {
  const grouped = new Map<string, ActiveCategoryItem[]>();

  for (const item of items) {
    const normalizedCategory = normalizeCategory(item.category);
    const current = grouped.get(normalizedCategory) || [];
    current.push({ ...item, normalizedCategory });
    grouped.set(normalizedCategory, current);
  }

  const orderedGroups: ActiveCategoryGroup[] = [];

  for (const category of CATEGORY_ORDER) {
    const categoryItems = grouped.get(category) || [];
    if (categoryItems.length === 0) continue;
    orderedGroups.push({
      category,
      items: [...categoryItems].sort((a, b) => a.name.localeCompare(b.name)),
    });
    grouped.delete(category);
  }

  for (const [category, categoryItems] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    orderedGroups.push({
      category,
      items: [...categoryItems].sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return orderedGroups;
}

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    generalListItems,
    activeShoppingListItems,
    itemsMaster,
    settings,
    hydrated,
  } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);
  const [openCategory, setOpenCategory] = React.useState<string | null>(null);
  const [activeItemDraft, setActiveItemDraft] = React.useState<ActiveItemEditDraft | null>(null);
  const [customStores, setCustomStores] = React.useState<string[]>([]);
  const [addingStore, setAddingStore] = React.useState(false);
  const [newStoreName, setNewStoreName] = React.useState("");

  React.useEffect(() => {
    setOpenCategory(searchParams.get("category"));
  }, [searchParams]);

  function setCategory(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    const q = params.toString();
    router.replace(q ? `/general-list?${q}` : "/general-list", { scroll: false });
  }

  const activePlainShoppingListItems = React.useMemo(
    () => activeShoppingListItems.filter((item: ActiveShoppingListItem) => !getSourceListName(item)),
    [activeShoppingListItems]
  );

  const plainGeneralListItems = React.useMemo(
    () => generalListItems.filter((item: GeneralListItem) => isRowActive(item) && !getSourceListName(item)),
    [generalListItems]
  );

  const activeCatalogKeySet = React.useMemo(
    () => new Set(activePlainShoppingListItems.map((item: ActiveShoppingListItem) => catalogKey(item))),
    [activePlainShoppingListItems]
  );

  const checkedCatalogKeySet = React.useMemo(
    () => new Set(activeCatalogKeySet),
    [activeCatalogKeySet]
  );

  const activeCategoryGroups = React.useMemo<ActiveCategoryGroup[]>(
    () => groupActiveItemsByCategory(activeShoppingListItems),
    [activeShoppingListItems]
  );

  const activeIdByCatalogKey = React.useMemo(
    () =>
      new Map(
        activePlainShoppingListItems.map((item: ActiveShoppingListItem) => [catalogKey(item), item.id] as const)
      ),
    [activePlainShoppingListItems]
  );

  const generalListIdByCatalogKey = React.useMemo(
    () =>
      new Map(
        plainGeneralListItems.map((item: GeneralListItem) => [catalogKey(item), item.id] as const)
      ),
    [plainGeneralListItems]
  );

  const generalListQuantityByCatalogKey = React.useMemo(
    () =>
      new Map(
        plainGeneralListItems.map((item: GeneralListItem) => [catalogKey(item), item.quantity || "1"] as const)
      ),
    [plainGeneralListItems]
  );

  const catalogItems = React.useMemo<CatalogCategoryItem[]>(() => {
    const deduped = new Map<string, CatalogCategoryItem>();

    itemsMaster
      .filter((item: ItemMaster) => item.active !== false)
      .forEach((item: ItemMaster) => {
        const key = catalogKey(item);
        if (deduped.has(key)) return;

        deduped.set(key, {
          id: item.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: generalListQuantityByCatalogKey.get(key) || "1",
          store: preferredStoreFor(item, settings.preferredStore),
        });
      });

    return [...deduped.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [generalListQuantityByCatalogKey, itemsMaster, settings.preferredStore]);

  const categoryGroups = React.useMemo<CatalogCategoryGroup[]>(() => {
    const groups: CatalogCategoryGroup[] = [{ category: "Compras frecuentes", items: [] }];
    const grouped = new Map<string, CatalogCategoryItem[]>();

    for (const item of catalogItems) {
      const category = normalizeCategory(item.category);
      const current = grouped.get(category) || [];
      current.push(item);
      grouped.set(category, current);
    }

    for (const category of CATEGORY_ORDER) {
      const items = grouped.get(category) || [];
      groups.push({
        category,
        items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
      });
      grouped.delete(category);
    }

    for (const [category, items] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      groups.push({
        category,
        items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
      });
    }

    return groups;
  }, [catalogItems]);

  const selectedCategoryGroup =
    categoryGroups.find((group) => group.category === openCategory) ?? null;

  function onToggleCategoryItem(item: CatalogCategoryItem, isChecked: boolean) {
    const key = catalogKey(item);
    const activeId = activeIdByCatalogKey.get(key);

    if (isChecked) {
      const generalListId = generalListIdByCatalogKey.get(key);
      if (generalListId) {
        addGeneralSelections([generalListId]);
      } else {
        addQuickNeed({
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity || "1",
          store: item.store || settings.preferredStore || "HEB",
        });
      }
      return;
    }

    if (activeId) {
      removeActiveItem(activeId);
    }
  }

  const categoryOptions = React.useMemo(
    () =>
      CATEGORY_ORDER.filter((category) => category !== "Otro / Temporal").sort((a, b) =>
        categoryLabel(lang, a).localeCompare(categoryLabel(lang, b), lang, { sensitivity: "base" })
      ),
    [lang]
  );

  const unitOptions = React.useMemo(() => {
    const values: string[] = [...FIXED_UNIT_OPTIONS];
    const currentUnit = String(activeItemDraft?.unit ?? "").trim();

    if (currentUnit && !values.some((option) => normalizeValue(option) === normalizeValue(currentUnit))) {
      values.push(currentUnit);
    }

    return values.sort((a, b) =>
      formatUnitOptionLabel(a, lang).localeCompare(formatUnitOptionLabel(b, lang), lang, {
        sensitivity: "base",
      })
    );
  }, [activeItemDraft?.unit, lang]);

  const storeOptions = React.useMemo(() => {
    return uniqueValues([
      settings.preferredStore,
      ...STORE_OPTIONS,
      ...itemsMaster.map((item: ItemMaster) => item.defaultStore),
      ...generalListItems.map((item: GeneralListItem) => item.store),
      ...activeShoppingListItems.map((item: ActiveShoppingListItem) => item.store),
      ...customStores,
      activeItemDraft?.store,
    ]).sort((a, b) => a.localeCompare(b));
  }, [activeItemDraft?.store, activeShoppingListItems, customStores, generalListItems, itemsMaster, settings.preferredStore]);

  function openActiveItemDraft(item: ActiveShoppingListItem) {
    setAddingStore(false);
    setNewStoreName("");
    setActiveItemDraft({
      original: item,
      category: item.category,
      unit: item.unit,
      quantity: String(item.quantity || "1"),
      store: item.store || settings.preferredStore || "HEB",
    });
  }

  function openAddStore() {
    setAddingStore(true);
    setNewStoreName("");
  }

  function closeAddStore() {
    setAddingStore(false);
    setNewStoreName("");
  }

  function closeActiveItemDraft() {
    closeAddStore();
    setActiveItemDraft(null);
  }

  function saveNewStore() {
    const trimmed = newStoreName.trim();
    if (!trimmed) return;

    setCustomStores((current) => (current.some((store) => normalizeValue(store) === normalizeValue(trimmed)) ? current : [...current, trimmed]));
    setActiveItemDraft((current) => (current ? { ...current, store: trimmed } : current));
    closeAddStore();
  }

  function saveActiveItemDraft() {
    if (!activeItemDraft) return;

    const { original, category, unit, quantity, store } = activeItemDraft;
    const { id: originalId, ...rest } = original as ActiveShoppingListItem & Record<string, unknown>;

    removeActiveItem(originalId);

    addQuickNeed({
      ...(rest as Record<string, unknown>),
      name: original.name,
      category,
      unit,
      quantity,
      store,
    } as Parameters<typeof addQuickNeed>[0]);

    closeActiveItemDraft();
  }

  if (!hydrated) {
    return (
      <AppShell
        title={t("es", "cartTitle")}
        darkHero
        subtitle={t("es", "cartSubtitle")}
        showCart={false}
        footerActions={[]}
      >
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: s(14), color: "#6b7280" }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  const footerActions = selectedCategoryGroup
    ? [
        {
          label: lang === "en" ? "Finish this category" : "Terminar con esta Categoría",
          onClick: () => setCategory(null),
          primary: true,
        },
      ]
    : [];

  return (
    <AppShell
      title={t(lang, "cartTitle")}
      darkHero
      subtitle={t(lang, "cartSubtitle")}
      showCart={false}
      footerInset={selectedCategoryGroup ? CATEGORY_FOOTER_INSET : 0}
      footerActions={footerActions}
    >
      <section style={{ ...cardStyle(), padding: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: s(16), fontWeight: 800 }}>{t(lang, "cartNow")}</div>
        </div>

        {activeCategoryGroups.length === 0 ? (
          <div style={{ fontSize: s(15), color: "#6b7280" }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {activeCategoryGroups.map((group) => (
              <div key={group.category} style={{ display: "grid", gap: 8 }}>
                <div
                  style={{
                    padding: "9px 12px",
                    borderRadius: 12,
                    border: `1px solid ${CHECKED_ROW_BORDER}`,
                    background: CHECKED_ROW_BG,
                    color: MC_NAVY,
                    fontSize: s(13),
                    fontWeight: 900,
                  }}
                >
                  {categoryLabel(lang, group.category)}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openActiveItemDraft(item)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        background: "#fff",
                        color: "#111827",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: s(17), fontWeight: 500, minWidth: 0 }}>
                        {item.name}
                        {item.sourceListName ? (
                          <span style={{ fontSize: s(14), fontWeight: 400, color: "#5b6b9a" }}>
                            {" "}({item.sourceListName})
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: s(15), color: "#6b7280", flexShrink: 0 }}>
                        <QtyUnitText quantity={String(item.quantity)} unit={item.unit} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ ...cardStyle(), padding: 14 }}>
        <div style={{ fontSize: s(18), fontWeight: 900, marginBottom: 8 }}>
          {lang === "en" ? "Anything missing?" : "¿Algo te hace falta?"}
        </div>
        <div style={{ fontSize: s(14), color: "#6b7280", marginBottom: 12 }}>
          {lang === "en"
            ? "Open a category and select the items you still need to complete your list."
            : "Abre una categoría y selecciona los artículos que te hacen falta para completar tu lista."}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {categoryGroups.map((group) => (
            <button
              key={group.category}
              type="button"
              onClick={() => setCategory(group.category)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#111827",
              }}
            >
              <span style={{ fontWeight: 900, fontSize: s(15) }}>
                {group.category === "Compras frecuentes"
                  ? lang === "en"
                    ? "Frequent purchases"
                    : "Compras frecuentes"
                  : categoryLabel(lang, group.category)}
              </span>
              <span style={{ fontWeight: 400, fontSize: s(15) }}>
                {" "}
                · {group.items.length} {t(lang, "itemsLabel")}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeItemDraft ? (
        <div style={modalOverlayStyle}>
          <section style={modalCardStyle}>
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#fff",
                borderBottom: "1px solid #e6ecff",
                padding: "16px 16px 14px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: s(20), fontWeight: 900 }}>
                  {activeItemDraft.original.name}
                  {activeItemDraft.original.sourceListName ? (
                    <span style={{ fontSize: s(14), fontWeight: 400, color: "#5b6b9a" }}>
                      {" "}({activeItemDraft.original.sourceListName})
                    </span>
                  ) : null}
                </div>
                <div style={{ marginTop: 6, fontSize: s(14), color: "#5b6b9a" }}>
                  {lang === "en"
                    ? "Update category, unit, quantity, or store for this item."
                    : "Actualiza categoría, unidad, cantidad o tienda de este artículo."}
                </div>
              </div>

              <button
                type="button"
                onClick={closeActiveItemDraft}
                style={{
                  border: "1px solid #dbe3ff",
                  background: "#fff",
                  color: MC_NAVY,
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontWeight: 800,
                }}
              >
                {lang === "en" ? "Close" : "Cerrar"}
              </button>
            </div>

            <div
              style={{
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
                padding: 16,
                display: "grid",
                gap: 14,
                maxHeight: "min(58vh, 100%)",
              }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: s(13), fontWeight: 800, color: "#374151" }}>
                  {lang === "en" ? "Category" : "Categoría"}
                </span>
                <select
                  value={activeItemDraft.category}
                  onChange={(e) =>
                    setActiveItemDraft((current) => (current ? { ...current, category: e.target.value } : current))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    border: "1px solid #dbe3ff",
                    padding: "12px 14px",
                    fontSize: s(16),
                    background: "#fff",
                  }}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabel(lang, category)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: s(13), fontWeight: 800, color: "#374151" }}>
                  {lang === "en" ? "Unit" : "Unidad"}
                </span>
                <select
                  value={activeItemDraft.unit}
                  onChange={(e) =>
                    setActiveItemDraft((current) => (current ? { ...current, unit: e.target.value } : current))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    border: "1px solid #dbe3ff",
                    padding: "12px 14px",
                    fontSize: s(16),
                    background: "#fff",
                  }}
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {formatUnitOptionLabel(unit, lang)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: s(13), fontWeight: 800, color: "#374151" }}>
                  {lang === "en" ? "Quantity" : "Cantidad"}
                </span>
                <input
                  value={activeItemDraft.quantity}
                  onChange={(e) =>
                    setActiveItemDraft((current) => (current ? { ...current, quantity: e.target.value } : current))
                  }
                  inputMode="decimal"
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    border: "1px solid #dbe3ff",
                    padding: "12px 14px",
                    fontSize: s(16),
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: s(13), fontWeight: 800, color: "#374151" }}>
                  {lang === "en" ? "Store" : "Tienda"}
                </span>
                <select
                  value={activeItemDraft.store}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === ADD_STORE_VALUE) {
                      openAddStore();
                      return;
                    }
                    closeAddStore();
                    setActiveItemDraft((current) => (current ? { ...current, store: value } : current));
                  }}
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    border: "1px solid #dbe3ff",
                    padding: "12px 14px",
                    fontSize: s(16),
                    background: "#fff",
                  }}
                >
                  {storeOptions.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                  <option value={ADD_STORE_VALUE}>{lang === "en" ? "Add" : "Agregar"}</option>
                </select>
              </label>
            </div>

            <div
              style={{
                borderTop: "1px solid #e6ecff",
                padding: 16,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={closeActiveItemDraft}
                style={{
                  border: "1px solid #dbe3ff",
                  background: "#fff",
                  color: MC_NAVY,
                  borderRadius: 999,
                  padding: "10px 14px",
                  fontWeight: 800,
                }}
              >
                {lang === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={saveActiveItemDraft}
                style={{
                  border: "none",
                  background: MC_NAVY,
                  color: "#fff",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontWeight: 900,
                }}
              >
                {lang === "en" ? "Save" : "Guardar"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {addingStore && activeItemDraft ? (
        <div
          style={{
            ...modalOverlayStyle,
            zIndex: 40,
            background: "rgba(17,24,39,0.22)",
            pointerEvents: "auto",
          }}
          onClick={closeAddStore}
        >
          <section
            style={{
              ...modalCardStyle,
              width: "min(420px, 100%)",
              maxHeight: "none",
              margin: "auto",
              padding: 14,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: s(20), fontWeight: 900 }}>
              {lang === "en" ? "New store" : "Nueva tienda"}
            </div>
            <div style={{ marginTop: 4, fontSize: s(13), color: "#5b6b9a" }}>
              {lang === "en" ? "Add the store for this item." : "Agrega la tienda para este artículo."}
            </div>

            <input
              autoFocus
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder={lang === "en" ? "New store" : "Nueva tienda"}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #dbe3ff",
                boxSizing: "border-box",
                fontSize: s(15),
                background: "#fff",
              }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={closeAddStore}
                style={{
                  flex: 1,
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid #dbe3ff",
                  background: "#fff",
                  color: MC_NAVY,
                  fontWeight: 800,
                  fontSize: s(13),
                }}
              >
                {lang === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button
                type="button"
                onClick={saveNewStore}
                disabled={!newStoreName.trim()}
                style={{
                  flex: 1,
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: `1px solid ${newStoreName.trim() ? MC_NAVY : "#dbe3ff"}`,
                  background: newStoreName.trim() ? MC_NAVY : "#fff",
                  color: newStoreName.trim() ? "#fff" : "#5b6b9a",
                  fontWeight: 900,
                  fontSize: s(13),
                }}
              >
                {lang === "en" ? "Save" : "Guardar"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedCategoryGroup ? (
        <div style={modalOverlayStyle}>
          <section style={modalCardStyle}>
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#fff",
                borderBottom: "1px solid #e6ecff",
                padding: "16px 16px 14px",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: s(20), fontWeight: 900 }}>
                {selectedCategoryGroup.category === "Compras frecuentes"
                  ? lang === "en"
                    ? "Frequent purchases"
                    : "Compras frecuentes"
                  : categoryLabel(lang, selectedCategoryGroup.category)}
              </div>
              <div style={{ marginTop: 6, fontSize: s(14), color: "#5b6b9a" }}>
                {lang === "en"
                  ? "Check what is still missing in this category."
                  : "Marca lo que todavía te hace falta en esta categoría."}
              </div>
            </div>

            <div
              style={{
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
                padding: 16,
                display: "grid",
                gap: 10,
                maxHeight: "min(52vh, 100%)",
              }}
            >
              {selectedCategoryGroup.items.map((item) => {
                const isChecked = checkedCatalogKeySet.has(catalogKey(item));
                return (
                  <label
                    key={item.id}
                    style={{
                      border: `1px solid ${isChecked ? CHECKED_ROW_BORDER : "#E3E8F7"}`,
                      borderRadius: 16,
                      padding: 12,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      background: isChecked ? CHECKED_ROW_BG : "#fff",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => onToggleCategoryItem(item, e.target.checked)}
                      style={{ width: 18, height: 18, flexShrink: 0 }}
                    />

                    <div style={{ flex: 1, minWidth: 0, fontSize: s(17), fontWeight: 500 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: s(15), color: "#5b6b9a", flexShrink: 0 }}>
                      <QtyUnitText quantity={item.quantity} unit={item.unit} />
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
