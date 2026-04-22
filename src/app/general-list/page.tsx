"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { categoryLabel, t } from "@/lib/mindercart/i18n";
import {
  addGeneralSelections,
  groupByStore,
  groupGeneralListByCategory,
  itemKey,
  removeActiveItem,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";

const MODAL_TOP_OFFSET = "calc(env(safe-area-inset-top) + 148px)";
const MODAL_BOTTOM_OFFSET = "calc(env(safe-area-inset-bottom) + 84px)";
const CHECKED_ROW_BG = "#EAF1FF";
const CHECKED_ROW_BORDER = "#C9D8FF";

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

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { generalListItems, activeShoppingListItems, settings, hydrated } = useMinderCartState();
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

  const activeKeySet = React.useMemo(
    () => new Set(activeShoppingListItems.map((item) => itemKey(item))),
    [activeShoppingListItems]
  );

  const activeIdByKey = React.useMemo(
    () => new Map(activeShoppingListItems.map((item) => [itemKey(item), item.id])),
    [activeShoppingListItems]
  );

  function onToggleCategoryItem(itemId: string, isChecked: boolean) {
    const item = generalListItems.find((row) => row.id === itemId);
    if (!item) return;

    const key = itemKey(item);
    const activeId = activeIdByKey.get(key);

    if (isChecked) {
      addGeneralSelections([itemId]);
      return;
    }

    if (activeId) {
      removeActiveItem(activeId);
    }
  }

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

  const groups = groupByStore(activeShoppingListItems);
  const categoryGroups = groupGeneralListByCategory(generalListItems.filter((item) => item.active !== false));
  const selectedCategoryGroup = categoryGroups.find((group) => group.category === openCategory) ?? null;
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

        {groups.length === 0 ? (
          <div style={{ fontSize: s(15), color: "#6b7280" }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {groups.map((group) => (
              <div key={group.store}>
                <div style={{ fontSize: s(15), fontWeight: 800, marginBottom: 8 }}>
                  {group.store} · {group.items.length} {t(lang, "itemsLabel")}
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
          {categoryGroups.map((group) => {
            const availableCount = group.items.filter((item) => !activeKeySet.has(itemKey(item))).length;
            return (
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
                <span style={{ fontWeight: 900, fontSize: s(15) }}>{categoryLabel(lang, group.category)}</span>
                <span style={{ fontWeight: 400, fontSize: s(15) }}> · {availableCount} {t(lang, "itemsLabel")}</span>
              </button>
            );
          })}
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
                {categoryLabel(lang, selectedCategoryGroup.category)}
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
                const isChecked = activeKeySet.has(itemKey(item));
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
                      onChange={(e) => onToggleCategoryItem(item.id, e.target.checked)}
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
