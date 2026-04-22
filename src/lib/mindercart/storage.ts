import { unitLabel } from "@/lib/mindercart/i18n";
import { SEED_GENERAL_ITEMS } from "@/lib/mindercart/seed-items";
import type {
  FontScale,
  GeneralListItem,
  ItemMaster,
  Language,
  MinderCartState,
  Suggestion,
} from "@/lib/mindercart/types";

export const CHANGE_EVENT = "mindercart:changed";
const STORAGE_KEY = "mindercart_state_v13";

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

export const CATEGORY_OPTIONS = [
  "Despensa",
  "Produce",
  "Refrigerados",
  "Bebidas",
  "Limpieza",
  "Cuidado personal",
  "Mascotas",
  "Hogar",
  "General",
] as const;

function defaultState(): MinderCartState {
  const generalListItems: GeneralListItem[] = SEED_GENERAL_ITEMS.map((item) => ({
    id: uid(),
    name: item.name,
    category: item.category,
    unit: item.unit,
    quantity: item.quantity,
    store: item.store,
    active: item.active,
    lastUsedAt: null,
  }));

  const itemsMaster: ItemMaster[] = generalListItems.map((item) => ({
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
    generalListItems,
    activeShoppingListItems: [],
    shoppingHistory: [],
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

    return {
      itemsMaster: Array.isArray(parsed.itemsMaster) ? parsed.itemsMaster : [],
      generalListItems: Array.isArray(parsed.generalListItems) ? parsed.generalListItems : [],
      activeShoppingListItems: Array.isArray(parsed.activeShoppingListItems)
        ? parsed.activeShoppingListItems
        : [],
      shoppingHistory: Array.isArray(parsed.shoppingHistory) ? parsed.shoppingHistory : [],
      settings: {
        language: parsed.settings?.language === "en" ? "en" : "es",
        preferredStore: safe(parsed.settings?.preferredStore) || "HEB",
        fontScale:
          parsed.settings?.fontScale === "large" || parsed.settings?.fontScale === "xlarge"
            ? parsed.settings.fontScale
            : "normal",
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
  const unit = safe(input.unit) || "ea";
  const quantity = safe(input.quantity) || "1";
  const store = safe(input.store) || state.settings.preferredStore || "HEB";

  if (!name) throw new Error("Artículo requerido");

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

export function deleteActiveItemEverywhere(id: string) {
  const state = readState();
  const target = state.activeShoppingListItems.find((item) => item.id === id);
  if (!target) return state;

  const sourceRefSet = new Set(target.sourceRefs || []);
  const targetName = normalize(target.name);
  const targetUnit = normalize(target.unit);

  const next: MinderCartState = {
    ...state,
    activeShoppingListItems: state.activeShoppingListItems.filter((item) => item.id !== id),
    generalListItems: state.generalListItems.map((item) => {
      const sameSource = sourceRefSet.size > 0 && sourceRefSet.has(item.id);
      const sameItem = normalize(item.name) === targetName && normalize(item.unit) === targetUnit;
      return sameSource || sameItem ? { ...item, active: false } : item;
    }),
    itemsMaster: state.itemsMaster.map((item) => {
      const sameItem = normalize(item.name) === targetName && normalize(item.unit) === targetUnit;
      return sameItem ? { ...item, active: false } : item;
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
  const next: MinderCartState = {
    ...state,
    settings: {
      language: input.language === "en" ? "en" : "es",
      preferredStore: safe(input.preferredStore) || "HEB",
      fontScale:
        input.fontScale === "large" || input.fontScale === "xlarge" ? input.fontScale : "normal",
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
    ...state.itemsMaster
      .filter((item) => item.active !== false)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || "General",
        unit: item.unit,
        quantity: "1",
        store: item.defaultStore,
        source: "items_master" as const,
      })),
    ...state.generalListItems
      .filter((item) => item.active !== false)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || "General",
        unit: item.unit,
        quantity: item.quantity || "1",
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
  const groups = groupByStore(pendingOnly(readState().activeShoppingListItems));
  return groups
    .map((group) =>
      [group.store, ...group.items.map((item) => `${item.name} ${item.quantity} ${item.unit}`)].join("\n")
    )
    .join("\n\n")
    .trim();
}

export function buildShoppingListTextForStore(storeName: string) {
  const store = safe(storeName);
  const rows = pendingOnly(readState().activeShoppingListItems).filter(
    (item) => safe(item.store) === store
  );
  if (rows.length === 0) return "";
  return [store, ...rows.map((item) => `${item.name} ${item.quantity} ${item.unit}`)].join("\n").trim();
}

export function buildShoppingListHtml(lang: Language = "en") {
  const groups = groupByStore(pendingOnly(readState().activeShoppingListItems));
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
  const rows = pendingOnly(readState().activeShoppingListItems).filter(
    (item) => safe(item.store) === store
  );

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

