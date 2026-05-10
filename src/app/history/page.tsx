"use client";

import React from "react";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import { addQuickNeed } from "@/lib/mindercart/storage";

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function makeActiveKey(input: { itemKey?: string; name: string; unit: string; store: string; sourceListName?: string }) {
  const baseIdentity = normalize(input.itemKey || input.name);
  const sourceIdentity = normalize(input.sourceListName);
  return [baseIdentity, sourceIdentity, normalize(input.unit), normalize(input.store)].join("|");
}

function formatDateOnly(value: string | number | Date, lang: "es" | "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getSourceListName(item: Record<string, unknown>) {
  const raw = item.sourceListName ?? item.savedListName ?? item.originListName ?? item.listName;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "";
}


type HistoryLikeItem = {
  name: string;
  category: string;
  unit: string;
  quantity?: string;
  store?: string;
  itemKey?: string;
  sourceListName?: string;
  savedListName?: string;
  originListName?: string;
  listName?: string;
};

function buildQuickNeedPayload(item: HistoryLikeItem, fallbackStore: string) {
  const sourceListName = getSourceListName(item as unknown as Record<string, unknown>);
  return {
    name: item.name,
    category: item.category,
    unit: item.unit,
    quantity: item.quantity || "1",
    store: item.store || fallbackStore,
    ...(typeof item.itemKey === "string" && item.itemKey.trim() ? { itemKey: item.itemKey.trim() } : {}),
    ...(sourceListName
      ? {
          sourceListName,
          savedListName: sourceListName,
          originListName: sourceListName,
          listName: sourceListName,
        }
      : {}),
  } as Parameters<typeof addQuickNeed>[0];
}

export default function HistoryPage() {
  const { shoppingHistory, activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [repurchaseModeByEntry, setRepurchaseModeByEntry] = React.useState<Record<string, boolean>>({});
  const [selectedByEntry, setSelectedByEntry] = React.useState<Record<string, Record<string, boolean>>>({});
  const [statusByEntry, setStatusByEntry] = React.useState<Record<string, string>>({});
  const [busyEntryId, setBusyEntryId] = React.useState<string | null>(null);

  const copy = React.useMemo(
    () =>
      lang === "en"
        ? {
            loading: "Loading...",
            selectedSuffix: "selected",
            addSelected: "Add selected to My List",
            reuseAll: "Complete repurchase",
            confirmReuseAll: "Do you want to complete this repurchase and add all missing items to My List?",
            buyAgain: "Buy again",
            alreadyInList: "Already in My List",
            addedSummary: (count: number) => `${count} item${count === 1 ? "" : "s"} added to My List`,
            reusedAllSummary: (count: number) => `${count} item${count === 1 ? "" : "s"} added from this purchase`,
            nothingNewToAdd: "Everything is already in My List",
            backToHistory: "← Back to History",
            purchaseLabel: "Purchase",
            instruction: "Mark the items you want to buy again",
          }
        : {
            loading: "Cargando...",
            selectedSuffix: "seleccionados",
            addSelected: "Agregar seleccionados a Mi Lista",
            reuseAll: "Realizar recompra completa",
            confirmReuseAll: "¿Quieres realizar esta recompra completa y agregar a Mi Lista todos los artículos faltantes?",
            buyAgain: "Comprar de nuevo",
            alreadyInList: "Ya está en Mi Lista",
            addedSummary: (count: number) => `${count} artículo${count === 1 ? "" : "s"} agregado${count === 1 ? "" : "s"} a Mi Lista`,
            reusedAllSummary: (count: number) => `${count} artículo${count === 1 ? "" : "s"} agregado${count === 1 ? "" : "s"} desde esta compra`,
            nothingNewToAdd: "Todo ya está en Mi Lista",
            backToHistory: "← Regresar a Historial",
            purchaseLabel: "Compra",
            instruction: "Marca los artículos que quieras volver a comprar",
          },
    [lang]
  );

  const activeKeySet = React.useMemo(
    () =>
      new Set(
        activeShoppingListItems.map((item) =>
          makeActiveKey({
            ...item,
            sourceListName: getSourceListName(item as unknown as Record<string, unknown>),
          })
        )
      ),
    [activeShoppingListItems]
  );

  const toggleExpanded = (entryId: string) => {
    setExpandedId((current) => {
      const next = current === entryId ? null : entryId;
      if (next === null) {
        setRepurchaseModeByEntry((prev) => ({ ...prev, [entryId]: false }));
      }
      return next;
    });
    setStatusByEntry((current) => ({ ...current, [entryId]: "" }));
  };

  const enterRepurchaseMode = (entryId: string) => {
    setRepurchaseModeByEntry((current) => ({ ...current, [entryId]: true }));
    setStatusByEntry((current) => ({ ...current, [entryId]: "" }));
  };

  const toggleSelected = (entryId: string, itemId: string) => {
    setSelectedByEntry((current) => ({
      ...current,
      [entryId]: {
        ...(current[entryId] || {}),
        [itemId]: !(current[entryId] || {})[itemId],
      },
    }));
  };

  const selectedCountFor = (entryId: string) =>
    Object.values(selectedByEntry[entryId] || {}).filter(Boolean).length;

  const getUniqueItemsToAdd = React.useCallback(
    (entryId: string, mode: "selected" | "all") => {
      const entry = shoppingHistory.find((row) => row.id === entryId);
      if (!entry) return [];

      const selectedIds =
        mode === "selected"
          ? new Set(
              Object.entries(selectedByEntry[entryId] || {})
                .filter(([, checked]) => checked)
                .map(([itemId]) => itemId)
            )
          : null;

      const seen = new Set<string>();
      return entry.items.filter((item) => {
        if (selectedIds && !selectedIds.has(item.id)) return false;
        const key = makeActiveKey({
          ...item,
          sourceListName: getSourceListName(item as unknown as Record<string, unknown>),
        });
        if (activeKeySet.has(key)) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [activeKeySet, selectedByEntry, shoppingHistory]
  );

  const addItemsFromEntry = async (entryId: string, mode: "selected" | "all") => {
    const entry = shoppingHistory.find((row) => row.id === entryId);
    if (!entry) return;

    if (mode === "all" && typeof window !== "undefined") {
      const confirmed = window.confirm(copy.confirmReuseAll);
      if (!confirmed) return;
    }

    const itemsToAdd = getUniqueItemsToAdd(entryId, mode);
    if (itemsToAdd.length === 0) {
      setStatusByEntry((current) => ({
        ...current,
        [entryId]: copy.nothingNewToAdd,
      }));
      setExpandedId(null);
      setRepurchaseModeByEntry((current) => ({ ...current, [entryId]: false }));
      return;
    }

    setBusyEntryId(entryId);

    try {
      itemsToAdd.forEach((item) => {
        addQuickNeed(buildQuickNeedPayload(item, entry.store || settings.preferredStore));
      });

      setSelectedByEntry((current) => ({
        ...current,
        [entryId]: {},
      }));
      setStatusByEntry((current) => ({
        ...current,
        [entryId]:
          mode === "all" ? copy.reusedAllSummary(itemsToAdd.length) : copy.addedSummary(itemsToAdd.length),
      }));
      setExpandedId(null);
      setRepurchaseModeByEntry((current) => ({ ...current, [entryId]: false }));
    } finally {
      setBusyEntryId(null);
    }
  };

  if (!hydrated) {
    return (
      <AppShell
        title={t("es", "historyTitle")}
        darkHero
        subtitle={t("es", "historySubtitle")}
        showCart={false}
        footerActions={[]}
      >
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: s(14), color: "#6b7280" }}>{copy.loading}</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t(lang, "historyTitle")}
      darkHero
      subtitle={t(lang, "historySubtitle")}
      showCart={false}
      footerActions={[]}
    >
      {shoppingHistory.length === 0 ? (
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontWeight: 900, fontSize: s(15) }}>{t(lang, "noHistory")}</div>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {shoppingHistory.map((row) => {
            const expanded = expandedId === row.id;
            const repurchaseMode = Boolean(repurchaseModeByEntry[row.id]);
            const selectedCount = selectedCountFor(row.id);

            return (
              <section key={row.id} style={{ ...cardStyle(), padding: 14 }}>
                {!expanded ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(row.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 0,
                      border: 0,
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 900,
                      fontSize: s(15),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <span>
                      {formatDateOnly(row.closedAt, lang)} · {row.store} · {row.items.length} {t(lang, "itemsLabel")}
                    </span>
                    <span style={{ color: "#0f4c81", fontSize: s(13), flexShrink: 0 }}>+</span>
                  </button>
                ) : null}

                {!expanded && statusByEntry[row.id] ? (
                  <div style={{ marginTop: 8, fontSize: s(13), color: "#0f766e", fontWeight: 800 }}>
                    {statusByEntry[row.id]}
                  </div>
                ) : null}

                {expanded ? (
                  <div style={{ display: "grid", gap: 12, paddingBottom: 120 }}>
                    <div
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        paddingBottom: 10,
                        display: "grid",
                        gap: 4,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpanded(row.id)}
                        style={{
                          border: 0,
                          background: "transparent",
                          padding: 0,
                          margin: 0,
                          textAlign: "left",
                          color: "#0f4c81",
                          fontWeight: 800,
                          fontSize: s(13),
                          cursor: "pointer",
                        }}
                      >
                        {copy.backToHistory}
                      </button>
                      <div style={{ fontSize: s(18), fontWeight: 900, lineHeight: 1.2, color: "#111827" }}>
                        {copy.purchaseLabel} · {formatDateOnly(row.closedAt, lang)}
                      </div>
                      {repurchaseMode ? (
                        <div style={{ fontSize: s(13), color: "#6b7280", lineHeight: 1.2 }}>{copy.instruction}</div>
                      ) : null}
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      {row.items.map((item) => {
                        const alreadyInMyList = activeKeySet.has(
                          makeActiveKey({
                            ...item,
                            sourceListName: getSourceListName(item as unknown as Record<string, unknown>),
                          })
                        );
                        const checked = repurchaseMode && (alreadyInMyList || Boolean(selectedByEntry[row.id]?.[item.id]));
                        const sourceListName = getSourceListName(item as unknown as Record<string, unknown>);

                        const rowContent = (
                          <>
                            {repurchaseMode ? (
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={alreadyInMyList}
                                onChange={() => toggleSelected(row.id, item.id)}
                                style={{ width: 20, height: 20, margin: 0, flexShrink: 0, accentColor: "#5aa8ff" }}
                              />
                            ) : null}
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: s(16),
                                  fontWeight: 500,
                                  lineHeight: 1.2,
                                  color: alreadyInMyList && repurchaseMode ? "#0f766e" : "#111827",
                                }}
                              >
                                {item.name}
                                {sourceListName ? (
                                  <span
                                    style={{
                                      marginLeft: 4,
                                      fontSize: s(12),
                                      fontWeight: 500,
                                      color: "#6b7280",
                                    }}
                                  >
                                    ({sourceListName})
                                  </span>
                                ) : null}
                              </div>
                              <div
                                style={{
                                  flexShrink: 0,
                                  fontSize: s(14),
                                  color: alreadyInMyList && repurchaseMode ? "#0f766e" : "#6b7280",
                                  fontWeight: alreadyInMyList && repurchaseMode ? 800 : 500,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <QtyUnitText quantity={item.quantity} unit={item.unit} />
                              </div>
                            </div>
                          </>
                        );

                        const sharedStyle: React.CSSProperties = {
                          border: checked ? "1px solid #dbe7fb" : "1px solid #f0f0f0",
                          background: checked ? "#eef5ff" : "#fff",
                          borderRadius: 16,
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        };

                        return repurchaseMode ? (
                          <label
                            key={item.id}
                            style={{
                              ...sharedStyle,
                              cursor: alreadyInMyList ? "default" : "pointer",
                            }}
                          >
                            {rowContent}
                          </label>
                        ) : (
                          <div key={item.id} style={sharedStyle}>
                            {rowContent}
                          </div>
                        );
                      })}
                    </div>

                    {repurchaseMode ? (
                      <div
                        style={{
                          position: "sticky",
                          bottom: 84,
                          zIndex: 2,
                          background: "#fff",
                          borderTop: "1px solid #eef2f7",
                          paddingTop: 10,
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ fontSize: s(13), color: "#6b7280" }}>
                            {selectedCount} {copy.selectedSuffix}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => addItemsFromEntry(row.id, "all")}
                              disabled={busyEntryId === row.id}
                              style={{
                                border: "1px solid #0f4c81",
                                borderRadius: 999,
                                padding: "10px 16px",
                                background: "#fff",
                                color: "#0f4c81",
                                fontWeight: 900,
                                cursor: busyEntryId === row.id ? "not-allowed" : "pointer",
                              }}
                            >
                              {copy.reuseAll}
                            </button>
                            <button
                              type="button"
                              onClick={() => addItemsFromEntry(row.id, "selected")}
                              disabled={selectedCount === 0 || busyEntryId === row.id}
                              style={{
                                border: 0,
                                borderRadius: 999,
                                padding: "10px 16px",
                                background: selectedCount === 0 || busyEntryId === row.id ? "#cbd5e1" : "#0f4c81",
                                color: "#fff",
                                fontWeight: 900,
                                cursor:
                                  selectedCount === 0 || busyEntryId === row.id ? "not-allowed" : "pointer",
                              }}
                            >
                              {copy.addSelected}
                            </button>
                          </div>
                        </div>

                        {statusByEntry[row.id] ? (
                          <div style={{ fontSize: s(13), color: "#0f766e", fontWeight: 800 }}>
                            {statusByEntry[row.id]}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        style={{
                          position: "sticky",
                          bottom: 84,
                          zIndex: 2,
                          background: "#fff",
                          borderTop: "1px solid #eef2f7",
                          paddingTop: 10,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => enterRepurchaseMode(row.id)}
                          style={{
                            width: "100%",
                            border: "1px solid #0f4c81",
                            borderRadius: 999,
                            padding: "10px 16px",
                            background: "#fff",
                            color: "#0f4c81",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          {copy.buyAgain}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
