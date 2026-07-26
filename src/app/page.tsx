"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { categoryLabel, t } from "@/lib/mindercart/i18n";
import {
  CATEGORY_OPTIONS,
  STORE_OPTIONS,
  addQuickNeed,
  addQuickNeeds,
  buildSuggestions,
  readState,
  removeActiveItem,
  syncSavedListItemsToCatalog,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { Suggestion } from "@/lib/mindercart/types";

type DraftItem = {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  store: string;
  note?: string;
};

type DraftSelectOptions = {
  categories: string[];
  units: string[];
  stores: string[];
};

type SavedListDraftItem = DraftItem & {
  id: string;
};

type SavedListRecord = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: SavedListDraftItem[];
};

const ADD_STORE_VALUE = "__ADD_STORE__";
const SAVED_LISTS_STORAGE_KEY = "mindercart.savedLists.v1";

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
  pza: { labelEs: "Pieza", labelEn: "Piece", abbrEs: "pza.", abbrEn: "pc" },
  paquete: { labelEs: "Paquete", labelEn: "Pack", abbrEs: "paq.", abbrEn: "pk" },
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

function formatUnitOptionLabel(value: string, lang: "es" | "en") {
  const meta = UNIT_OPTION_META[value as keyof typeof UNIT_OPTION_META];
  if (!meta) return value;
  return lang === "en"
    ? `${meta.labelEn} (${meta.abbrEn})`
    : `${meta.labelEs} (${meta.abbrEs})`;
}

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
        items: [...categoryItems].sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""), "es", { sensitivity: "base" })
        ),
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

  return "pza";
}

function buildLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeItemKey(name: string, category: string) {
  return `${String(name ?? "").trim().toLocaleLowerCase("es")}|${normalizeCategory(category).toLocaleLowerCase("es")}`;
}

function readSavedListsFromBrowser() {
  if (typeof window === "undefined") return [] as SavedListRecord[];

  try {
    const raw = window.localStorage.getItem(SAVED_LISTS_STORAGE_KEY);
    if (!raw) return [] as SavedListRecord[];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [] as SavedListRecord[];

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;

        const record = entry as Partial<SavedListRecord> & { items?: unknown };
        const name = String(record.name ?? "").trim();
        if (!name) return null;

        const items = Array.isArray(record.items)
          ? record.items
              .map((item) => {
                if (!item || typeof item !== "object") return null;
                const row = item as Partial<SavedListDraftItem>;
                const itemName = String(row.name ?? "").trim();
                if (!itemName) return null;

                return {
                  id: String(row.id ?? buildLocalId("saved-list-item")),
                  name: itemName,
                  category: normalizeCategory(String(row.category ?? FALLBACK_CATEGORY)),
                  unit: normalizeUnit(String(row.unit ?? "pza")),
                  quantity: String(row.quantity ?? "1").trim() || "1",
                  store: String(row.store ?? "HEB").trim() || "HEB",
                } satisfies SavedListDraftItem;
              })
              .filter((item): item is SavedListDraftItem => item !== null)
          : [];

        return {
          id: String(record.id ?? buildLocalId("saved-list")),
          name,
          createdAt: String(record.createdAt ?? new Date().toISOString()),
          updatedAt: String(record.updatedAt ?? new Date().toISOString()),
          items,
        } satisfies SavedListRecord;
      })
      .filter((record): record is SavedListRecord => record !== null);
  } catch {
    return [] as SavedListRecord[];
  }
}

function writeSavedListsToBrowser(savedLists: SavedListRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_LISTS_STORAGE_KEY, JSON.stringify(savedLists));
}

export default function NeedsPage() {
  const { activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);

  const isSavedListsView = searchParams.get("view") === "saved-lists";
  const savedListMode = searchParams.get("saved-list-mode");
  const isNewSavedListView = savedListMode === "new";
  const isEditSavedListView = savedListMode === "edit";
  const isOpenSavedListView = savedListMode === "open";
  const isSavedListEditorView = isSavedListsView && (isNewSavedListView || isEditSavedListView);
  const selectedSavedListId = String(searchParams.get("saved-list-id") ?? "");

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

  const [savedLists, setSavedLists] = React.useState<SavedListRecord[]>([]);
  const [savedListsLoaded, setSavedListsLoaded] = React.useState(false);
  const [savedListName, setSavedListName] = React.useState("");
  const [savedListItemsDraft, setSavedListItemsDraft] = React.useState<SavedListDraftItem[]>([]);
  const [editingSavedListItemId, setEditingSavedListItemId] = React.useState<string | null>(null);
  const [editingActiveItemId, setEditingActiveItemId] = React.useState<string | null>(null);
  const [editingActiveItemSourceListName, setEditingActiveItemSourceListName] = React.useState<string | null>(null);
  const [savedListsMessage, setSavedListsMessage] = React.useState("");
  const [selectedOpenSavedListItemIds, setSelectedOpenSavedListItemIds] = React.useState<string[]>([]);
  const [savedListNameEditUnlocked, setSavedListNameEditUnlocked] = React.useState(false);
  const [removingActiveItemId, setRemovingActiveItemId] = React.useState<string | null>(null);
  const savedListNameInputRef = React.useRef<HTMLInputElement | null>(null);
  const removeActiveItemLockRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated) return;
    setSuggestions(buildSuggestions(name));
  }, [hydrated, name]);

  React.useEffect(() => {
    if (!hydrated) return;
    setSavedLists(readSavedListsFromBrowser());
    setSavedListsLoaded(true);
  }, [hydrated]);

  React.useEffect(() => {
    if (!hydrated || !savedListsLoaded || savedLists.length === 0) return;
    syncSavedListItemsToCatalog(savedLists.flatMap((entry) => entry.items));
  }, [hydrated, savedListsLoaded, savedLists]);

  React.useEffect(() => {
    if (!isSavedListEditorView || !savedListsLoaded) return;

    setMessage("");
    closeDraft();

    if (isNewSavedListView) {
      setSavedListName("");
      setSavedListItemsDraft([]);
      setSavedListsMessage("");
      setSavedListNameEditUnlocked(true);
      return;
    }

    setSavedListNameEditUnlocked(false);
    const existing = savedLists.find((entry) => entry.id === selectedSavedListId);
    if (!existing) {
      setSavedListName("");
      setSavedListItemsDraft([]);
      setSavedListsMessage(lang === "en" ? "Saved list not found." : "No se encontró la lista guardada.");
      return;
    }

    setSavedListName(existing.name);
    setSavedListItemsDraft(existing.items.map((item) => ({ ...item })));
    setSavedListsMessage("");
  }, [isSavedListEditorView, isNewSavedListView, savedListsLoaded, savedLists, selectedSavedListId, lang]);


  const confirmSavedListNameEdit = React.useCallback(() => {
    if (!isEditSavedListView || savedListNameEditUnlocked) return true;

    const allowEdit = window.confirm(
      lang === "en" ? "Do you want to change this list name?" : "¿Quieres modificar el nombre de esta lista?"
    );

    if (allowEdit) {
      setSavedListNameEditUnlocked(true);
      setSavedListsMessage("");
      window.setTimeout(() => {
        savedListNameInputRef.current?.focus();
        savedListNameInputRef.current?.select();
      }, 0);
    }

    return allowEdit;
  }, [isEditSavedListView, lang, savedListNameEditUnlocked]);

  React.useEffect(() => {
    if (!isOpenSavedListView) {
      setSelectedOpenSavedListItemIds([]);
      return;
    }
    setSelectedOpenSavedListItemIds([]);
    setSavedListsMessage("");
  }, [isOpenSavedListView, selectedSavedListId]);

  React.useEffect(() => {
    if (!removingActiveItemId) return;

    const itemStillExists = activeShoppingListItems.some(
      (item) => item.id === removingActiveItemId
    );

    if (itemStillExists) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        removeActiveItemLockRef.current = false;
        setRemovingActiveItemId(null);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [activeShoppingListItems, removingActiveItemId]);

  const trimmedName = name.trim();
  const normalizedDraftName = trimmedName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
  const hasExactSuggestionMatch = suggestions.some(
    (suggestion) =>
      suggestion.name
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es") === normalizedDraftName
  );
  const showSuggestions = trimmedName.length >= 2 && suggestions.length > 0;
  const canOpenCustomDraft = trimmedName.length >= 3 && !hasExactSuggestionMatch;

  const draftSelectOptions = React.useMemo<DraftSelectOptions>(() => {
    const state = readState();

    return {
      categories: uniqueValues([
        ...CATEGORY_OPTIONS,
        ...state.itemsMaster.map((item) => normalizeCategory(item.category)),
        ...state.generalListItems.map((item) => normalizeCategory(item.category)),
        ...state.activeShoppingListItems.map((item) => normalizeCategory(item.category)),
      ]).sort((a, b) =>
        categoryLabel(lang, a).localeCompare(categoryLabel(lang, b), lang, { sensitivity: "base" })
      ),
      units: [...FIXED_UNIT_OPTIONS].sort((a, b) =>
        formatUnitOptionLabel(a, lang).localeCompare(formatUnitOptionLabel(b, lang), lang, {
          sensitivity: "base",
        })
      ),
      stores: uniqueValues([
        settings.preferredStore,
        ...STORE_OPTIONS,
        ...state.itemsMaster.map((item) => item.defaultStore),
        ...state.generalListItems.map((item) => item.store),
        ...state.activeShoppingListItems.map((item) => item.store),
        ...customStores,
      ]).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
    };
  }, [customStores, lang, settings.preferredStore]);

  const groupedActiveShoppingListItems = React.useMemo(
    () => groupItemsByCategory(activeShoppingListItems),
    [activeShoppingListItems]
  );

  const groupedSavedListItemsDraft = React.useMemo(
    () => groupItemsByCategory(savedListItemsDraft),
    [savedListItemsDraft]
  );

  const activeShoppingListItemKeys = React.useMemo(
    () => new Set(activeShoppingListItems.map((item) => normalizeItemKey(item.name, item.category))),
    [activeShoppingListItems]
  );

  const openedSavedList = React.useMemo(
    () => savedLists.find((entry) => entry.id === selectedSavedListId) ?? null,
    [savedLists, selectedSavedListId]
  );

  const groupedOpenedSavedListItems = React.useMemo(
    () => groupItemsByCategory(openedSavedList?.items ?? []),
    [openedSavedList]
  );

  const selectableOpenedSavedListItems = React.useMemo(
    () => (openedSavedList?.items ?? []).filter((item) => !isSavedListItemAlreadyInMyList(item)),
    [openedSavedList, activeShoppingListItems]
  );

  const allOpenedSavedListItemsSelected =
    selectableOpenedSavedListItems.length > 0
    && selectableOpenedSavedListItems.every((item) => selectedOpenSavedListItemIds.includes(item.id));

  function resetInput() {
    setName("");
    setSuggestions([]);
  }

  function closeDraft() {
    setDraft(null);
    setEditingSavedListItemId(null);
    setEditingActiveItemId(null);
    setEditingActiveItemSourceListName(null);
    setAddingStore(false);
    setNewStoreName("");
    resetInput();
  }

  function openDraft(input: DraftItem, options?: { savedListItemId?: string | null }) {
    setEditingSavedListItemId(options?.savedListItemId ?? null);
    setEditingActiveItemId(null);
    setEditingActiveItemSourceListName(null);
    setDraft({
      name: input.name,
      category: normalizeCategory(input.category),
      unit: normalizeUnit(input.unit),
      quantity: input.quantity || "1",
      store: input.store || settings.preferredStore || "HEB",
      note: input.note ?? "",
    });
  }

  function openActiveItemDraft(item: {
    id: string;
    name: string;
    category: string;
    unit: string;
    quantity: string;
    store: string;
    sourceListName?: string;
    note?: string;
  }) {
    setEditingSavedListItemId(null);
    setEditingActiveItemId(item.id);
    setEditingActiveItemSourceListName(item.sourceListName ?? null);
    setDraft({
      name: item.name,
      category: normalizeCategory(item.category),
      unit: normalizeUnit(item.unit),
      quantity: item.quantity || "1",
      store: item.store || settings.preferredStore || "HEB",
      note: item.note ?? "",
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

  function persistSavedLists(next: SavedListRecord[]) {
    setSavedLists(next);
    writeSavedListsToBrowser(next);
  }

  function removeSavedListDraftItem(itemId: string) {
    setSavedListItemsDraft((prev) => prev.filter((item) => item.id !== itemId));
    setSavedListsMessage("");
  }

  function deleteSavedList(savedListId: string) {
    const target = savedLists.find((entry) => entry.id === savedListId);
    if (!target) return false;

    const confirmationText =
      lang === "en" ? `Delete "${target.name}"?` : `¿Eliminar "${target.name}"?`;

    if (typeof window !== "undefined" && !window.confirm(confirmationText)) return false;

    activeShoppingListItems
      .filter((item) => item.sourceListName === target.name)
      .forEach((item) => removeActiveItem(item.id));

    persistSavedLists(savedLists.filter((entry) => entry.id !== savedListId));
    setSavedListsMessage(lang === "en" ? "Saved list deleted." : "Lista guardada eliminada.");
    return true;
  }

  function saveSavedListDraft() {
    const trimmedListName = savedListName.trim();

    if (!trimmedListName) {
      setSavedListsMessage(lang === "en" ? "Enter a name for the list." : "Escribe un nombre para la lista.");
      return;
    }

    if (savedListItemsDraft.length === 0) {
      setSavedListsMessage(lang === "en" ? "Add at least one item." : "Agrega al menos un artículo.");
      return;
    }

    const now = new Date().toISOString();
    const existing = savedLists.find((entry) => entry.id === selectedSavedListId);
    const nextRecord: SavedListRecord = {
      id: isEditSavedListView && existing ? existing.id : buildLocalId("saved-list"),
      name: trimmedListName,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      items: savedListItemsDraft.map((item) => ({ ...item })),
    };

    const next = isEditSavedListView && existing
      ? savedLists.map((entry) => (entry.id === existing.id ? nextRecord : entry))
      : [nextRecord, ...savedLists];

    persistSavedLists(next);
    syncSavedListItemsToCatalog(nextRecord.items);
    setSavedListsMessage(
      lang === "en"
        ? isEditSavedListView
          ? "Saved list updated."
          : "Saved list created."
        : isEditSavedListView
          ? "Lista guardada actualizada."
          : "Lista guardada creada."
    );
    router.push(`/?view=saved-lists&saved-list-mode=open&saved-list-id=${encodeURIComponent(nextRecord.id)}`);
  }

  function isSavedListItemAlreadyInMyList(item: SavedListDraftItem) {
    if (!openedSavedList) return false;

    const normalizedKey = normalizeItemKey(item.name, item.category);

    return activeShoppingListItems.some(
      (activeItem) =>
        normalizeItemKey(activeItem.name, activeItem.category) === normalizedKey
        && (activeItem.sourceListName ?? null) === openedSavedList.name
    );
  }

  function toggleOpenedSavedListItem(itemId: string) {
    const item = openedSavedList?.items.find((entry) => entry.id === itemId);
    if (!item || isSavedListItemAlreadyInMyList(item)) return;

    setSelectedOpenSavedListItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((entry) => entry !== itemId) : [...prev, itemId]
    );
    setSavedListsMessage("");
  }

  function toggleAllOpenedSavedListItems() {
    if (selectableOpenedSavedListItems.length === 0) return;

    setSelectedOpenSavedListItemIds(
      allOpenedSavedListItemsSelected ? [] : selectableOpenedSavedListItems.map((item) => item.id)
    );
    setSavedListsMessage("");
  }

  function addSelectedSavedListItemsToMyList() {
    if (!openedSavedList) return;

    const selectedItems = openedSavedList.items.filter(
      (item) => selectedOpenSavedListItemIds.includes(item.id) && !isSavedListItemAlreadyInMyList(item)
    );

    if (selectedItems.length === 0) {
      setSavedListsMessage(lang === "en" ? "Select at least one item." : "Selecciona al menos un artículo.");
      return;
    }

    try {
      addQuickNeeds(
        selectedItems.map((item) => ({
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          store: item.store,
          sourceListName: openedSavedList.name,
        }))
      );

      setSelectedOpenSavedListItemIds([]);
      setSavedListsMessage(
        lang === "en"
          ? `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} added to My List.`
          : `${selectedItems.length} artículo${selectedItems.length === 1 ? "" : "s"} agregado${selectedItems.length === 1 ? "" : "s"} a Mi Lista.`
      );
    } catch (e: unknown) {
      setSavedListsMessage(`⚠ ${String((e as { message?: string })?.message || e)}`);
    }
  }

  function handleRemoveActiveItem(itemId: string) {
    if (removeActiveItemLockRef.current) return;

    removeActiveItemLockRef.current = true;
    setRemovingActiveItemId(itemId);

    try {
      removeActiveItem(itemId);
    } catch (e: unknown) {
      removeActiveItemLockRef.current = false;
      setRemovingActiveItemId(null);
      setMessage(`⚠ ${String((e as { message?: string })?.message || e)}`);
    }
  }

  function confirmDraft() {
    if (!draft) return;

    if (isSavedListEditorView) {
      const normalizedKey = normalizeItemKey(draft.name, draft.category);
      const existingIndex = editingSavedListItemId
        ? savedListItemsDraft.findIndex((item) => item.id === editingSavedListItemId)
        : savedListItemsDraft.findIndex((item) => normalizeItemKey(item.name, item.category) === normalizedKey);
      const nextItem: SavedListDraftItem = {
        id: existingIndex >= 0 ? savedListItemsDraft[existingIndex].id : buildLocalId("saved-list-item"),
        name: draft.name.trim(),
        category: normalizeCategory(draft.category),
        unit: normalizeUnit(draft.unit),
        quantity: String(draft.quantity ?? "1").trim() || "1",
        store: draft.store || settings.preferredStore || "HEB",
      };

      const nextSavedListItemsDraft = existingIndex >= 0
        ? savedListItemsDraft.map((item, index) => (index === existingIndex ? nextItem : item))
        : [...savedListItemsDraft, nextItem];

      setSavedListItemsDraft(nextSavedListItemsDraft);

      if (isEditSavedListView) {
        const existingSavedList = savedLists.find((entry) => entry.id === selectedSavedListId);

        if (existingSavedList) {
          const nextSavedListRecord: SavedListRecord = {
            ...existingSavedList,
            updatedAt: new Date().toISOString(),
            items: nextSavedListItemsDraft.map((item) => ({ ...item })),
          };

          const nextSavedLists = savedLists.map((entry) =>
            entry.id === existingSavedList.id ? nextSavedListRecord : entry
          );

          persistSavedLists(nextSavedLists);
          syncSavedListItemsToCatalog(nextSavedListRecord.items);
        }
      }

      setMessage(
        `✅ ${draft.name} ${lang === "en" ? "updated in this saved list." : "actualizado en esta lista guardada."}`
      );
      closeDraft();
      return;
    }

    if (editingActiveItemId) {
      try {
        removeActiveItem(editingActiveItemId);
        addQuickNeed({
          ...draft,
          ...(editingActiveItemSourceListName ? { sourceListName: editingActiveItemSourceListName } : {}),
        });
        setMessage(`✅ ${draft.name} ${lang === "en" ? "updated in My List." : "actualizado en Mi Lista."}`);
        closeDraft();
      } catch (e: unknown) {
        setMessage(`⚠ ${String((e as { message?: string })?.message || e)}`);
      }
      return;
    }

    try {
      addQuickNeed(draft);
      setMessage(`✅ ${draft.name} ${t(lang, "addedToList")}`);
      closeDraft();
    } catch (e: unknown) {
      setMessage(`⚠ ${String((e as { message?: string })?.message || e)}`);
    }
  }

  const draftModal = draft ? (
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
                  {categoryLabel(lang, option)}
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
                  {formatUnitOptionLabel(option, lang)}
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
            <div style={{ fontSize: s(12), fontWeight: 700, marginBottom: 5 }}>{t(lang, "store")}</div>
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

          {!isSavedListEditorView ? (
            <div>
              <div style={{ fontSize: s(12), fontWeight: 700, marginBottom: 5 }}>
                {lang === "en" ? "Note or preference (optional)" : "Nota o preferencia (opcional)"}
              </div>
              <input
                value={draft.note ?? ""}
                maxLength={80}
                onChange={(e) => updateDraftField("note", e.target.value)}
                placeholder={
                  lang === "en"
                    ? "e.g. Cherry, sugar-free, preferred brand"
                    : "ej. Cherry, sin azúcar, marca preferida"
                }
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
          ) : null}
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
  ) : null;

  if (!hydrated) {
    return (
      <AppShell title={t("es", "myListTitle")} darkHero subtitle={t("es", "myListSubtitle")}>
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: 14, color: MC_NAVY_MUTED }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  if (isSavedListsView) {
    const savedListsTitle = lang === "en" ? "My Lists" : "Mis Listas";
    const savedListsSubtitle =
      lang === "en"
        ? "Create, edit and reuse your saved lists."
        : "Crea, edita y reutiliza tus listas guardadas.";
    const newListLabel = lang === "en" ? "New list" : "Nueva lista";
    const backToMyListLabel = lang === "en" ? "← Back to My List" : "← Regresar a Mi Lista";
    const backToSavedListsLabel = lang === "en" ? "← Back to My Lists" : "← Regresar a Mis Listas";
    const emptyTitle = lang === "en" ? "You do not have saved lists yet." : "Aún no tienes listas guardadas.";
    const emptyText =
      lang === "en"
        ? "Here you will keep lists like Monthly List, Paella List or BBQ List."
        : "Aquí podrás guardar listas como Lista Mensual, Lista Paella o Lista Carne Asada.";
    const editListTitle = lang === "en" ? "Edit list" : "Editar lista";
    const draftTitle = lang === "en" ? "New list" : "Nueva lista";
    const listNameLabel = lang === "en" ? "List name" : "Nombre de la lista";
    const listNamePlaceholder = lang === "en" ? "e.g. Paella List" : "ej. Lista Paella";
    const saveListLabel = lang === "en" ? "Save list" : "Guardar lista";
    const savedItemsTitle = lang === "en" ? "List items" : "Artículos de la lista";
    const noDraftItemsLabel = lang === "en" ? "No items in this list yet." : "Aún no hay artículos en esta lista.";
    const editLabel = lang === "en" ? "Edit" : "Editar";
    const deleteLabel = lang === "en" ? "Delete" : "Borrar";
    const addSelectedLabel = lang === "en" ? "Add selected to My List" : "Agregar seleccionados a Mi Lista";
    const selectAllLabel = lang === "en" ? "Select all" : "Seleccionar todo";
    const deselectAllLabel = lang === "en" ? "Deselect all" : "Deseleccionar todo";
    const openListNotFoundLabel = lang === "en" ? "Saved list not found." : "No se encontró la lista guardada.";
    const openListHelpText =
      lang === "en"
        ? "Mark the items you want to add."
        : "Selecciona los artículos que quieras agregar.";
    const itemsCountLabel = (count: number) =>
      lang === "en" ? `${count} item${count === 1 ? "" : "s"}` : `${count} artículo${count === 1 ? "" : "s"}`;

    return (
      <AppShell title={savedListsTitle} darkHero subtitle={savedListsSubtitle}>
        {isSavedListEditorView ? (
          <>
            <section style={{ ...cardStyle(), padding: "14px 14px" }}>
              <Link
                href="/?view=saved-lists"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: MC_NAVY,
                  fontSize: s(14),
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                {backToSavedListsLabel}
              </Link>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: s(19), fontWeight: 900, lineHeight: 1.15 }}>
                  {isEditSavedListView ? editListTitle : draftTitle}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {isEditSavedListView ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (deleteSavedList(selectedSavedListId)) {
                          router.push("/?view=saved-lists");
                        }
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 14,
                        border: `1px solid ${MC_NAVY_LINE}`,
                        background: "#fff",
                        color: MC_NAVY,
                        fontWeight: 800,
                        fontSize: s(14),
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {deleteLabel}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={saveSavedListDraft}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY}`,
                      background: MC_NAVY,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: s(14),
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {saveListLabel}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                <div style={{ fontSize: s(13), fontWeight: 700 }}>{listNameLabel}</div>
                <input
                  ref={savedListNameInputRef}
                  value={savedListName}
                  readOnly={isEditSavedListView && !savedListNameEditUnlocked}
                  onMouseDown={(event) => {
                    if (isEditSavedListView && !savedListNameEditUnlocked) {
                      event.preventDefault();
                      confirmSavedListNameEdit();
                    }
                  }}
                  onChange={(e) => {
                    setSavedListName(e.target.value);
                    setSavedListsMessage("");
                  }}
                  placeholder={listNamePlaceholder}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    boxSizing: "border-box",
                    fontSize: s(16),
                    background: isEditSavedListView && !savedListNameEditUnlocked ? MC_NAVY_SOFT : "#fff",
                  }}
                />
              </div>

              {savedListsMessage ? (
                <div style={{ marginTop: 10, fontSize: s(14), color: MC_NAVY }}>{savedListsMessage}</div>
              ) : null}
            </section>

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
                ) : null}

                {message ? <div style={{ fontSize: s(14), color: MC_NAVY }}>{message}</div> : null}
              </div>
            </section>

            <section style={{ ...cardStyle(), padding: 14, paddingBottom: "calc(122px + env(safe-area-inset-bottom))" }}>
              <div style={{ fontSize: s(16), fontWeight: 800, marginBottom: 10 }}>{savedItemsTitle}</div>

              {groupedSavedListItemsDraft.length === 0 ? (
                <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{noDraftItemsLabel}</div>
              ) : (
                <div style={{ display: "grid", gap: 14, paddingBottom: 8 }}>
                  {groupedSavedListItemsDraft.map((section) => (
                    <div key={categoryLabel(lang, section.category)} style={{ display: "grid", gap: 8 }}>
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
                            onClick={() => openDraft(item, { savedListItemId: item.id })}
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 12px",
                              borderBottom: index === section.items.length - 1 ? "none" : "1px solid #f3f4f6",
                              cursor: "pointer",
                              touchAction: "manipulation",
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1, fontSize: s(18), fontWeight: 500 }}>{item.name}</div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                              <div style={{ fontSize: s(15), color: MC_NAVY_MUTED }}>
                                <QtyUnitText quantity={String(item.quantity)} unit={item.unit} />
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSavedListDraftItem(item.id);
                                }}
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
          </>
        ) : isOpenSavedListView ? (
          <>
            <section
              style={{
                ...cardStyle(),
                padding: "12px 14px",
                boxSizing: "border-box",
                overflow: "hidden",
                position: "sticky",
                top: 0,
                zIndex: 20,
                background: "#fff",
                boxShadow: "0 8px 22px rgba(18,36,94,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 5, minWidth: 0, flex: 1 }}>
                  <Link
                    href="/?view=saved-lists"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: MC_NAVY,
                      fontSize: s(14),
                      fontWeight: 800,
                      textDecoration: "none",
                      lineHeight: 1.15,
                    }}
                  >
                    <span>← </span>
                    <span style={{ textDecoration: "underline" }}>{backToSavedListsLabel.replace(/^←\s*/, "")}</span>
                  </Link>

                  <div style={{ fontSize: s(19), fontWeight: 900, color: MC_NAVY, lineHeight: 1.15 }}>
                    {openedSavedList?.name ?? savedListsTitle}
                  </div>

                </div>

                {openedSavedList ? (
                  <Link
                    href={`/?view=saved-lists&saved-list-mode=edit&saved-list-id=${encodeURIComponent(openedSavedList.id)}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      border: `1px solid ${MC_NAVY}`,
                      background: "#fff",
                      color: MC_NAVY,
                      fontWeight: 800,
                      fontSize: s(14),
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {editLabel}
                  </Link>
                ) : null}
              </div>

              {savedListsMessage ? (
                <div style={{ marginTop: 8, fontSize: s(14), color: MC_NAVY }}>{savedListsMessage}</div>
              ) : null}
            </section>

            {!openedSavedList ? (
              <section style={{ ...cardStyle(), padding: 18 }}>
                <div style={{ fontSize: s(15), color: MC_NAVY_MUTED }}>{openListNotFoundLabel}</div>
              </section>
            ) : (
              <>
                <section
                  style={{
                    ...cardStyle(),
                    padding: 10,
                    paddingBottom: "calc(22px + env(safe-area-inset-bottom))",
                    width: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: s(12),
                        color: MC_NAVY_MUTED,
                        lineHeight: 1.2,
                        fontWeight: 400,
                      }}
                    >
                      {openListHelpText}
                    </div>

                    {selectableOpenedSavedListItems.length > 0 ? (
                      <button
                        type="button"
                        onClick={toggleAllOpenedSavedListItems}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: `1px solid ${MC_NAVY_LINE}`,
                          background: "#fff",
                          color: MC_NAVY,
                          fontSize: s(12),
                          fontWeight: 800,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {allOpenedSavedListItemsSelected ? deselectAllLabel : selectAllLabel}
                      </button>
                    ) : null}
                  </div>

                  {groupedOpenedSavedListItems.length === 0 ? (
                    <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{noDraftItemsLabel}</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10, paddingBottom: 14 }}>
                      {groupedOpenedSavedListItems.map((section) => (
                        <div key={categoryLabel(lang, section.category)} style={{ display: "grid", gap: 6 }}>
                          <div
                            style={{
                              padding: "7px 10px",
                              borderRadius: 10,
                              border: `1px solid ${MC_NAVY_LINE}`,
                              background: MC_NAVY_SOFT,
                              color: MC_NAVY,
                              fontSize: s(12),
                              fontWeight: 900,
                              lineHeight: 1.15,
                            }}
                          >
                            {categoryLabel(lang, section.category)}
                          </div>

                          <div
                            style={{
                              border: `1px solid ${MC_NAVY_SOFT}`,
                              borderRadius: 14,
                              overflow: "hidden",
                              background: "#fff",
                            }}
                          >
                            {section.items.map((item, index) => {
                              const alreadyInMyList = isSavedListItemAlreadyInMyList(item);
                              const isChecked = alreadyInMyList || selectedOpenSavedListItemIds.includes(item.id);

                              return (
                                <label
                                  key={item.id}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "20px minmax(0, 1fr) auto",
                                    gap: 9,
                                    alignItems: "center",
                                    minHeight: 46,
                                    padding: "8px 10px",
                                    borderBottom: index === section.items.length - 1 ? "none" : "1px solid #f3f4f6",
                                    cursor: alreadyInMyList ? "default" : "pointer",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    overflow: "hidden",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={alreadyInMyList}
                                    onChange={() => toggleOpenedSavedListItem(item.id)}
                                    style={{
                                      width: 18,
                                      height: 18,
                                      margin: 0,
                                      accentColor: MC_NAVY,
                                      flexShrink: 0,
                                    }}
                                  />

                                  <div
                                    title={item.name}
                                    style={{
                                      minWidth: 0,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontSize: s(16),
                                      fontWeight: 500,
                                      lineHeight: 1.15,
                                    }}
                                  >
                                    {item.name}
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-end",
                                      gap: 7,
                                      minWidth: 0,
                                      maxWidth: "48vw",
                                      color: MC_NAVY_MUTED,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <div
                                      style={{
                                        minWidth: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        fontSize: s(12),
                                        lineHeight: 1.15,
                                      }}
                                    >
                                      <QtyUnitText quantity={String(item.quantity)} unit={item.unit} />
                                      {item.store ? ` · ${item.store}` : ""}
                                    </div>

                                    {alreadyInMyList ? (
                                      <div
                                        style={{
                                          padding: "3px 6px",
                                          borderRadius: 999,
                                          background: MC_NAVY_SOFT,
                                          color: MC_NAVY,
                                          fontSize: s(10),
                                          fontWeight: 800,
                                          lineHeight: 1,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {lang === "en" ? "In My List" : "En Mi Lista"}
                                      </div>
                                    ) : null}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section
                  style={{
                    ...cardStyle(),
                    padding: 12,
                    position: "sticky",
                    bottom: "calc(92px + env(safe-area-inset-bottom))",
                    zIndex: 8,
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={addSelectedSavedListItemsToMyList}
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
                    {addSelectedLabel}
                  </button>
                </section>
              </>
            )}
          </>
        ) : (
          <>
            <section style={{ ...cardStyle(), padding: "14px 14px", boxSizing: "border-box", overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    minWidth: 0,
                    flex: 1,
                    paddingTop: 1,
                    paddingBottom: 1,
                  }}
                >
                  <Link
                    href="/"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: MC_NAVY,
                      fontSize: s(14),
                      fontWeight: 800,
                      textDecoration: "none",
                      lineHeight: 1.1,
                    }}
                  >
                    <span>← </span>
                    <span style={{ textDecoration: "underline" }}>{backToMyListLabel.replace(/^←\s*/, "")}</span>
                  </Link>

                  <div style={{ fontSize: s(17), fontWeight: 800, lineHeight: 1.18, paddingTop: 1 }}>
                    {savedListsTitle}
                  </div>
                </div>

                <Link
                  href="/?view=saved-lists&saved-list-mode=new"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY}`,
                    background: MC_NAVY,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: s(14),
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    alignSelf: "center",
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: 44,
                  }}
                >
                  {newListLabel}
                </Link>
              </div>

            </section>

            <section style={{ ...cardStyle(), padding: 18 }}>
              {savedLists.length === 0 ? (
                <>
                  <div style={{ fontSize: s(18), fontWeight: 900 }}>{emptyTitle}</div>
                  <div style={{ marginTop: 6, fontSize: s(14), color: MC_NAVY_MUTED }}>{emptyText}</div>
                </>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {savedLists.map((savedList) => (
                    <Link
                      key={savedList.id}
                      href={`/?view=saved-lists&saved-list-mode=open&saved-list-id=${encodeURIComponent(savedList.id)}`}
                      style={{
                        border: `1px solid ${MC_NAVY_LINE}`,
                        borderRadius: 18,
                        padding: 14,
                        background: "#fff",
                        display: "block",
                        textDecoration: "none",
                        color: MC_NAVY,
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: s(17), fontWeight: 900, color: MC_NAVY }}>{savedList.name}</div>
                        <div style={{ fontSize: s(13), color: MC_NAVY_MUTED }}>
                          {itemsCountLabel(savedList.items.length)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {draftModal}
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t(lang, "myListTitle")}
      darkHero
      subtitle={t(lang, "myListSubtitle")}
      secondaryAction={{ label: lang === "en" ? "My Lists" : "Mis Listas", href: "/?view=saved-lists" }}
    >
      <section style={{ ...cardStyle(), padding: 14 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: s(16), fontWeight: 700 }}>{lang === "en" ? "I need" : "Necesito"}</div>

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
          ) : null}

          {message ? <div style={{ fontSize: s(14), color: MC_NAVY }}>{message}</div> : null}
        </div>
      </section>

      <section style={{ ...cardStyle(), padding: 14, paddingBottom: "calc(122px + env(safe-area-inset-bottom))" }}>
        <div style={{ fontSize: s(16), fontWeight: 800, marginBottom: 10 }}>{t(lang, "cartSection")}</div>

        {groupedActiveShoppingListItems.length === 0 ? (
          <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 14, paddingBottom: 8 }}>
            {groupedActiveShoppingListItems.map((section) => (
              <div key={categoryLabel(lang, section.category)} style={{ display: "grid", gap: 8 }}>
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
                      onClick={() => openActiveItemDraft(item)}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 12px",
                        borderBottom: index === section.items.length - 1 ? "none" : "1px solid #f3f4f6",
                        cursor: "pointer",
                        touchAction: "manipulation",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: s(18), fontWeight: 500 }}>
                          {item.name}
                          {item.sourceListName ? (
                            <span style={{ fontSize: s(14), fontWeight: 400, color: MC_NAVY_MUTED }}>
                              {" "}({item.sourceListName})
                            </span>
                          ) : null}
                        </div>
                        {item.note ? (
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: s(13),
                              fontWeight: 400,
                              color: MC_NAVY_MUTED,
                              lineHeight: 1.25,
                            }}
                          >
                            {item.note}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <div style={{ fontSize: s(15), color: MC_NAVY_MUTED }}>
                          <QtyUnitText quantity={String(item.quantity)} unit={item.unit} />
                        </div>

                        <button
                          type="button"
                          disabled={removingActiveItemId !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveActiveItem(item.id);
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            border: `1px solid ${MC_NAVY_LINE}`,
                            background: "#fff",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            fontSize: s(14),
                            cursor: removingActiveItemId !== null ? "default" : "pointer",
                            opacity: removingActiveItemId !== null && removingActiveItemId !== item.id ? 0.55 : 1,
                          }}
                        >
                          {removingActiveItemId === item.id
                            ? lang === "en"
                              ? "Removing…"
                              : "Quitando…"
                            : t(lang, "remove")}
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

      {draftModal}
    </AppShell>
  );
}