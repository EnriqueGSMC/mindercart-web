"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { categoryLabel, t } from "@/lib/mindercart/i18n";
import {
  addGeneralSelections,
  addQuickNeed,
  itemKey,
  removeActiveItem,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { ActiveShoppingListItem, GeneralListItem, ItemMaster } from "@/lib/mindercart/types";

const MODAL_TOP_OFFSET = "calc(env(safe-area-inset-top) + 148px)";
const MODAL_BOTTOM_OFFSET = "calc(env(safe-area-inset-bottom) + 84px)";
const CHECKED_ROW_BG = "#EAF1FF";
const CHECKED_ROW_BORDER = "#C9D8FF";

const CATEGORY_ORDER = [
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
  "Otro / Temporal",
] as const;

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

function catalogKey(item: { name: string; unit: string }) {
  return `${normalizeValue(item.name)}__${normalizeValue(item.unit)}`;
}

function preferredStoreFor(item: Pick<ItemMaster, "defaultStore">, preferredStore: string) {
  return item.defaultStore || preferredStore || "HEB";
}

function normalizeCategoryName(value: unknown) {
  const category = String(value ?? "").trim();
  return CATEGORY_ORDER.includes(category as (typeof CATEGORY_ORDER)[number]) ? category : "Otro / Temporal";
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

  const activeCatalogKeySet = React.useMemo(
    () => new Set(activeShoppingListItems.map((item: ActiveShoppingListItem) => catalogKey(item))),
    [activeShoppingListItems]
  );

  const myListCatalogKeySet = React.useMemo(
    () => new Set(generalListItems.map((item: GeneralListItem) => catalogKey(item))),
    [generalListItems]
  );

  const checkedCatalogKeySet = React.useMemo(
    () => new Set([...activeCatalogKeySet, ...myListCatalogKeySet]),
    [activeCatalogKeySet, myListCatalogKeySet]
  );

  const activeIdByCatalogKey = React.useMemo(
    () =>
      new Map(
        activeShoppingListItems.map((item: ActiveShoppingListItem) => [catalogKey(item), item.id] as const)
      ),
    [activeShoppingListItems]
  );

  const generalListIdByCatalogKey = React.useMemo(
    () =>
      new Map(
        generalListItems.map((item: GeneralListItem) => [catalogKey(item), item.id] as const)
      ),
    [generalListItems]
  );

  const generalListQuantityByCatalogKey = React.useMemo(
    () =>
      new Map(
        generalListItems.map((item: GeneralListItem) => [catalogKey(item), item.quantity || "1"] as const)
      ),
    [generalListItems]
  );

  const categoryByCatalogKey = React.useMemo(() => {
    const map = new Map<string, string>();

    itemsMaster.forEach((item: ItemMaster) => {
      const category = String(item.category ?? "").trim();
      if (category) map.set(catalogKey(item), category);
    });

    generalListItems.forEach((item: GeneralListItem) => {
      const category = String(item.category ?? "").trim();
      if (category && !map.has(catalogKey(item))) map.set(catalogKey(item), category);
    });

    activeShoppingListItems.forEach((item: ActiveShoppingListItem) => {
      const category = String(item.category ?? "").trim();
      if (category && !map.has(catalogKey(item))) map.set(catalogKey(item), category);
    });

    return map;
  }, [activeShoppingListItems, generalListItems, itemsMaster]);

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
      const category = item.category || "Otro / Temporal";
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

  const activeCategoryGroups = React.useMemo<
    Array<{ category: string; items: ActiveShoppingListItem[] }>
  >(() => {
    const grouped = new Map<string, ActiveShoppingListItem[]>();

    for (const item of activeShoppingListItems) {
      const key = catalogKey(item);
      const category = normalizeCategoryName(item.category || categoryByCatalogKey.get(key) || "");
      const current = grouped.get(category) || [];
      current.push(item);
      grouped.set(category, current);
    }

    const ordered: Array<{ category: string; items: ActiveShoppingListItem[] }> = [];

    for (const category of CATEGORY_ORDER) {
      const items = grouped.get(category) || [];
      if (items.length === 0) continue;

      ordered.push({
        category,
        items: [...items].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, { sensitivity: "base" })
        ),
      });
      grouped.delete(category);
    }

    for (const [category, items] of [...grouped.entries()].sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: "base" })
    )) {
      if (items.length === 0) continue;
      ordered.push({
        category,
        items: [...items].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, { sensitivity: "base" })
        ),
      });
    }

    return ordered;
  }, [activeShoppingListItems, categoryByCatalogKey]);


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

  const currentCartCategoryGroups = React.useMemo(() => {
    const grouped = new Map<string, ActiveShoppingListItem[]>();

    activeShoppingListItems.forEach((item: ActiveShoppingListItem) => {
      const resolvedCategory = normalizeCategoryName(categoryByCatalogKey.get(catalogKey(item)) || item.category);
      const current = grouped.get(resolvedCategory) || [];
      current.push(item);
      grouped.set(resolvedCategory, current);
    });

    return CATEGORY_ORDER.map((category) => ({
      category,
      items: [...(grouped.get(category) || [])].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      ),
    })).filter((group) => group.items.length > 0);
  }, [activeShoppingListItems, categoryByCatalogKey]);


  if (!hydrated) {
    return (
      <AppShell
        title={t("es", "cartTitle")}
        darkHero
        subtitle={t("es", "cartSubtitle")}
        showCart={false}
        footerActions={[
          { href: "/in-store", label: t("es", "shoppingTitle"), primary: true },
          { href: "/", label: t("es", "back") },
        ]}
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
    : [
        { href: "/in-store", label: t(lang, "shoppingTitle"), primary: true },
        { href: "/", label: t(lang, "back") },
      ];

  return (
    <AppShell
      title={t(lang, "cartTitle")}
      darkHero
      subtitle={t(lang, "cartSubtitle")}
      showCart={false}
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

        {currentCartCategoryGroups.length === 0 ? (
          <div style={{ fontSize: s(15), color: "#6b7280" }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {currentCartCategoryGroups.map((group) => (
              <div key={group.category}>
                <div
                  style={{
                    fontSize: s(14),
                    fontWeight: 900,
                    marginBottom: 8,
                    padding: "8px 12px",
                    borderRadius: 14,
                    background: "#EEF3FF",
                    color: "#12245E",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {categoryLabel(lang, group.category)}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: s(17), fontWeight: 500, minWidth: 0 }}>{item.name}</div>
                      <div style={{ fontSize: s(15), color: "#6b7280", flexShrink: 0 }}>
                        <QtyUnitText quantity={item.quantity} unit={item.unit} />
                      </div>
                    </div>
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
