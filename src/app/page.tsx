"use client";

import React from "react";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { categoryLabel, t } from "@/lib/mindercart/i18n";
import {
  CATEGORY_OPTIONS,
  STORE_OPTIONS,
  addQuickNeed,
  buildSuggestions,
  readState,
  removeActiveItem,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { Suggestion } from "@/lib/mindercart/types";

type DraftItem = {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  store: string;
};

type DraftSelectOptions = {
  categories: string[];
  units: string[];
  stores: string[];
};

const ADD_STORE_VALUE = "__ADD_STORE__";

const MC_NAVY = "#12245E";
const MC_NAVY_SOFT = "#EEF3FF";
const MC_NAVY_LINE = "#D8E2FF";
const MC_NAVY_MUTED = "#5D6B98";

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(17,24,39,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "calc(14px + env(safe-area-inset-top)) 12px calc(14px + env(safe-area-inset-bottom))",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  zIndex: 120,
};

const modalCardStyle: React.CSSProperties = {
  width: "min(520px, 100%)",
  maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 28px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  background: "#fff",
  borderRadius: 22,
  border: `1px solid ${MC_NAVY_LINE}`,
  padding: 14,
  boxShadow: "0 16px 40px rgba(18,36,94,0.14)",
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    )
  );
}


const FIXED_UNIT_OPTIONS = [
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

const FALLBACK_CATEGORY = "Otro / Temporal";
const ORDERED_CATEGORIES = CATEGORY_OPTIONS.includes(FALLBACK_CATEGORY)
  ? [...CATEGORY_OPTIONS]
  : [...CATEGORY_OPTIONS, FALLBACK_CATEGORY];

function normalizeCategory(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim();
  return ORDERED_CATEGORIES.includes(trimmed) ? trimmed : FALLBACK_CATEGORY;
}

function groupItemsByCategory<T extends { name: string; category?: string | null }>(items: T[]) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const category = normalizeCategory(item.category);
    const bucket = grouped.get(category);
    if (bucket) {
      bucket.push(item);
    } else {
      grouped.set(category, [item]);
    }
  }

  return ORDERED_CATEGORIES.flatMap((category) => {
    const categoryItems = grouped.get(category);
    if (!categoryItems || categoryItems.length === 0) return [];

    return [
      {
        category,
        items: [...categoryItems].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "es", {
          sensitivity: "base",
        })),
      },
    ];
  });
}

function normalizeUnit(value: string) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "pza";

  if (["pza", "pzas", "pieza", "piezas", "unidad", "unidades", "ea", "each", "unit", "units"].includes(raw)) return "pza";
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

export default function NeedsPage() {
  const { activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);

  const addArticleLabel = lang === "en" ? "Add item" : "Agregar artículo";
  const addArticleModalHelp =
    lang === "en"
      ? "It is not in the list. You can add it."
      : "No está en la lista. Puedes agregarlo.";
  const itemPlaceholder = lang === "en" ? "e.g. milk" : "ej. leche";

  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [draft, setDraft] = React.useState<DraftItem | null>(null);
  const [customStores, setCustomStores] = React.useState<string[]>([]);
  const [addingStore, setAddingStore] = React.useState(false);
  const [newStoreName, setNewStoreName] = React.useState("");

  React.useEffect(() => {
    if (!hydrated) return;
    setSuggestions(buildSuggestions(name));
  }, [hydrated, name]);

  const trimmedName = name.trim();
  const showSuggestions = trimmedName.length >= 2 && suggestions.length > 0;
  const canOpenCustomDraft = trimmedName.length >= 3 && suggestions.length === 0;

  const draftSelectOptions = React.useMemo<DraftSelectOptions>(() => {
    const state = readState();

    return {
      categories: uniqueValues([
        ...CATEGORY_OPTIONS,
        ...state.itemsMaster.map((item) => normalizeCategory(item.category)),
        ...state.generalListItems.map((item) => normalizeCategory(item.category)),
        ...state.activeShoppingListItems.map((item) => normalizeCategory(item.category)),
      ]),
      units: [...FIXED_UNIT_OPTIONS],
      stores: uniqueValues([
        settings.preferredStore,
        ...STORE_OPTIONS,
        ...state.itemsMaster.map((item) => item.defaultStore),
        ...state.generalListItems.map((item) => item.store),
        ...state.activeShoppingListItems.map((item) => item.store),
        ...customStores,
      ]),
    };
  }, [customStores, settings.preferredStore]);

  const groupedActiveShoppingListItems = React.useMemo(
    () => groupItemsByCategory(activeShoppingListItems),
    [activeShoppingListItems]
  );

    function resetInput() {
    setName("");
    setSuggestions([]);
  }

  function closeDraft() {
    setDraft(null);
    setAddingStore(false);
    setNewStoreName("");
    resetInput();
  }

  function openDraft(input: DraftItem) {
    setDraft({
      name: input.name,
      category: normalizeCategory(input.category),
      unit: normalizeUnit(input.unit),
      quantity: input.quantity || "1",
      store: input.store || settings.preferredStore || "HEB",
    });
  }

  function applySuggestion(suggestion: Suggestion) {
    setName(suggestion.name);
    setSuggestions([]);
    openDraft({
      name: suggestion.name,
      category: normalizeCategory(suggestion.category),
      unit: normalizeUnit(suggestion.unit),
      quantity: suggestion.quantity || "1",
      store: suggestion.store || settings.preferredStore || "HEB",
    });
  }

  function openCustomDraft() {
    if (!canOpenCustomDraft) return;
    setSuggestions([]);
    openDraft({
      name: trimmedName,
      category: FALLBACK_CATEGORY,
      unit: "pza",
      quantity: "1",
      store: settings.preferredStore || "HEB",
    });
  }

  function updateDraftField(field: keyof DraftItem, value: string) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function openAddStore() {
    setAddingStore(true);
    setNewStoreName("");
  }

  function closeAddStore() {
    setAddingStore(false);
    setNewStoreName("");
  }

  function saveNewStore() {
    const trimmed = newStoreName.trim();
    if (!trimmed) return;
    setCustomStores((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    updateDraftField("store", trimmed);
    closeAddStore();
  }

  function confirmDraft() {
    if (!draft) return;
    try {
      addQuickNeed(draft);
      setMessage(`✅ ${draft.name} ${t(lang, "addedToList")}`);
      closeDraft();
    } catch (e: unknown) {
      setMessage(`⚠ ${String((e as { message?: string })?.message || e)}`);
    }
  }

  if (!hydrated) {
    return (
      <AppShell title={t("es", "myListTitle")} darkHero subtitle={t("es", "myListSubtitle")}>
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: 14, color: MC_NAVY_MUTED }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title={t(lang, "myListTitle")} darkHero subtitle={t(lang, "myListSubtitle")}>
      <section style={{ ...cardStyle(), padding: 14 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: s(16), fontWeight: 700 }}>{t(lang, "item")}</div>

          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canOpenCustomDraft) {
                e.preventDefault();
                openCustomDraft();
              }
            }}
            placeholder={itemPlaceholder}
            style={{
              width: "100%",
              padding: "16px 18px",
              borderRadius: 18,
              border: `1px solid ${MC_NAVY_LINE}`,
              fontSize: s(18),
              boxSizing: "border-box",
            }}
          />

          {showSuggestions ? (
            <div
              style={{
                border: `1px solid ${MC_NAVY_LINE}`,
                borderRadius: 18,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {suggestions.map((row, index) => (
                <button
                  key={`${row.source}_${row.id}`}
                  type="button"
                  onClick={() => applySuggestion(row)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 16px",
                    border: 0,
                    borderBottom: index === suggestions.length - 1 ? "none" : `1px solid ${MC_NAVY_SOFT}`,
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: s(17), fontWeight: 500 }}>{row.name}</div>
                  <div style={{ fontSize: s(14), color: MC_NAVY_MUTED, whiteSpace: "nowrap" }}>{row.store}</div>
                </button>
              ))}
            </div>
          ) : null}

          {canOpenCustomDraft ? (
            <div style={{ display: "grid", gap: 10 }}>
              <button
                type="button"
                onClick={openCustomDraft}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: `1px solid ${MC_NAVY}`,
                  background: MC_NAVY,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: s(15),
                  cursor: "pointer",
                }}
              >
                {addArticleLabel}
              </button>
            </div>
          ) : null}

          {message ? <div style={{ fontSize: s(14), color: MC_NAVY }}>{message}</div> : null}
        </div>
      </section>

      <section style={{ ...cardStyle(), padding: 14 }}>
        <div style={{ fontSize: s(16), fontWeight: 800, marginBottom: 10 }}>{t(lang, "cartSection")}</div>

        {groupedActiveShoppingListItems.length === 0 ? (
          <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {groupedActiveShoppingListItems.map((section) => (
              <div key={categoryLabel(lang, section.category)} style={{ display: "grid", gap: 4 }}>
                <div
                  style={{
                    fontSize: s(13),
                    fontWeight: 900,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    color: MC_NAVY,
                  }}
                >
                  {categoryLabel(lang, section.category)}
                </div>

                <div
                  style={{
                    border: `1px solid ${MC_NAVY_SOFT}`,
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  {section.items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 12px",
                        borderBottom: index === section.items.length - 1 ? "none" : "1px solid #f3f4f6",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, fontSize: s(18), fontWeight: 500 }}>{item.name}</div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <div style={{ fontSize: s(15), color: MC_NAVY_MUTED }}>
                          <QtyUnitText quantity={String(item.quantity)} unit={item.unit} />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeActiveItem(item.id)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            border: `1px solid ${MC_NAVY_LINE}`,
                            background: "#fff",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            fontSize: s(14),
                          }}
                        >
                          {t(lang, "remove")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {draft ? (
        <div style={modalOverlayStyle} onClick={closeDraft}>
          <section style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: s(21), fontWeight: 900 }}>{draft.name}</div>
            <div style={{ marginTop: 4, fontSize: s(13), color: MC_NAVY_MUTED }}>{addArticleModalHelp}</div>

            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: s(12), fontWeight: 700, marginBottom: 5 }}>{t(lang, "category")}</div>
                <select
                  value={draft.category}
                  onChange={(e) => updateDraftField("category", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(15),
                    background: "#fff",
                  }}
                >
                  {draftSelectOptions.categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: s(12), fontWeight: 700, marginBottom: 5 }}>{t(lang, "unit")}</div>
                <select
                  value={draft.unit}
                  onChange={(e) => updateDraftField("unit", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(15),
                    background: "#fff",
                  }}
                >
                  {draftSelectOptions.units.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: s(12), fontWeight: 700, marginBottom: 5 }}>{t(lang, "quantity")}</div>
                <input
                  value={draft.quantity}
                  inputMode="numeric"
                  onChange={(e) => updateDraftField("quantity", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(15),
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 5,
                  }}
                >
                  <div style={{ fontSize: s(12), fontWeight: 700 }}>{t(lang, "store")}</div>

                </div>

                <select
                  value={draft.store}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === ADD_STORE_VALUE) {
                      openAddStore();
                      return;
                    }
                    closeAddStore();
                    updateDraftField("store", value);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(15),
                    background: "#fff",
                  }}
                >
                  {draftSelectOptions.stores.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value={ADD_STORE_VALUE}>{lang === "en" ? "Add" : "Agregar"}</option>
                </select>


              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={closeDraft}
                style={{
                  flex: 1,
                  padding: "13px 14px",
                  borderRadius: 14,
                  border: `1px solid ${MC_NAVY_LINE}`,
                  background: "#fff",
                  fontWeight: 800,
                  fontSize: s(14),
                }}
              >
                {t(lang, "back")}
              </button>
              <button
                type="button"
                onClick={confirmDraft}
                style={{
                  flex: 1,
                  padding: "13px 14px",
                  borderRadius: 14,
                  border: `1px solid ${MC_NAVY}`,
                  background: MC_NAVY,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: s(14),
                }}
              >
                {t(lang, "add")}
              </button>
            </div>

            {addingStore ? (
              <div
                style={{
                  ...modalOverlayStyle,
                  zIndex: 140,
                  background: "rgba(17,24,39,0.22)",
                }}
                onClick={closeAddStore}
              >
                <section
                  style={{
                    ...modalCardStyle,
                    width: "min(420px, 100%)",
                    padding: 14,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: s(20), fontWeight: 900 }}>
                    {lang === "en" ? "New store" : "Nueva tienda"}
                  </div>
                  <div style={{ marginTop: 4, fontSize: s(13), color: MC_NAVY_MUTED }}>
                    {lang === "en"
                      ? "Add the store for this item."
                      : "Agrega la tienda para este artículo."}
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
                      border: `1px solid ${MC_NAVY_LINE}`,
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
                        border: `1px solid ${MC_NAVY_LINE}`,
                        background: "#fff",
                        fontWeight: 800,
                        fontSize: s(13),
                      }}
                    >
                      {t(lang, "back")}
                    </button>
                    <button
                      type="button"
                      onClick={saveNewStore}
                      disabled={!newStoreName.trim()}
                      style={{
                        flex: 1,
                        padding: "12px 12px",
                        borderRadius: 12,
                        border: `1px solid ${newStoreName.trim() ? MC_NAVY : MC_NAVY_LINE}`,
                        background: newStoreName.trim() ? MC_NAVY : "#fff",
                        color: newStoreName.trim() ? "#fff" : MC_NAVY_MUTED,
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
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
