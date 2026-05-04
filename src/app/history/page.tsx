"use client";

import React from "react";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { formatDateTime, t } from "@/lib/mindercart/i18n";
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

function makeActiveKey(input: { itemKey?: string; name: string; unit: string; store: string }) {
  return [normalize(input.itemKey || input.name), normalize(input.unit), normalize(input.store)].join("|");
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

export default function HistoryPage() {
  const { shoppingHistory, activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
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
            alreadyInList: "Already in My List",
            addedSummary: (count: number) => `${count} item${count === 1 ? "" : "s"} added to My List`,
            backToHistory: "← Back to History",
            purchaseLabel: "Purchase",
            instruction: "Select the items you want to add.",
          }
        : {
            loading: "Cargando...",
            selectedSuffix: "seleccionados",
            addSelected: "Agregar seleccionados a Mi Lista",
            alreadyInList: "Ya está en Mi Lista",
            addedSummary: (count: number) => `${count} artículo${count === 1 ? "" : "s"} agregado${count === 1 ? "" : "s"} a Mi Lista`,
            backToHistory: "← Regresar a Historial",
            purchaseLabel: "Compra",
            instruction: "Marca los artículos que quieras agregar.",
          },
    [lang]
  );

  const activeKeySet = React.useMemo(
    () => new Set(activeShoppingListItems.map((item) => makeActiveKey(item))),
    [activeShoppingListItems]
  );

  const toggleExpanded = (entryId: string) => {
    setExpandedId((current) => (current === entryId ? null : entryId));
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

  const addSelectedToMyList = async (entryId: string) => {
    const entry = shoppingHistory.find((row) => row.id === entryId);
    if (!entry) return;

    const selectedIds = Object.entries(selectedByEntry[entryId] || {})
      .filter(([, checked]) => checked)
      .map(([itemId]) => itemId);

    if (selectedIds.length === 0) return;

    const selectedItems = entry.items.filter((item) => selectedIds.includes(item.id));
    if (selectedItems.length === 0) return;

    setBusyEntryId(entryId);

    try {
      selectedItems.forEach((item) => {
        addQuickNeed({
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity || "1",
          store: item.store || entry.store || settings.preferredStore,
        });
      });

      setSelectedByEntry((current) => ({
        ...current,
        [entryId]: {},
      }));
      setStatusByEntry((current) => ({
        ...current,
        [entryId]: copy.addedSummary(selectedItems.length),
      }));
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
            const selectedCount = selectedCountFor(row.id);

            return (
              <section key={row.id} style={{ ...cardStyle(), padding: 14 }}>
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
                  <span style={{ color: "#0f4c81", fontSize: s(13), flexShrink: 0 }}>{expanded ? "−" : "+"}</span>
                </button>

                {expanded ? (
                  <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
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
                      <div style={{ fontSize: s(13), color: "#6b7280", lineHeight: 1.2 }}>{copy.instruction}</div>
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      {row.items.map((item) => {
                        const checked = Boolean(selectedByEntry[row.id]?.[item.id]);
                        const alreadyInMyList = activeKeySet.has(makeActiveKey(item));
                        const sourceListName = getSourceListName(item as unknown as Record<string, unknown>);

                        return (
                          <label
                            key={item.id}
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: 16,
                              padding: "10px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelected(row.id, item.id)}
                              style={{ width: 20, height: 20, margin: 0, flexShrink: 0 }}
                            />
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
                                  color: alreadyInMyList ? "#0f766e" : "#111827",
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
                                  color: alreadyInMyList ? "#0f766e" : "#6b7280",
                                  fontWeight: alreadyInMyList ? 800 : 500,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <QtyUnitText quantity={item.quantity} unit={item.unit} />
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                        paddingTop: 6,
                      }}
                    >
                      <div style={{ fontSize: s(13), color: "#6b7280" }}>
                        {selectedCount} {copy.selectedSuffix}
                      </div>
                      <button
                        type="button"
                        onClick={() => addSelectedToMyList(row.id)}
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

                    {statusByEntry[row.id] ? (
                      <div style={{ fontSize: s(13), color: "#0f766e", fontWeight: 800 }}>
                        {statusByEntry[row.id]}
                      </div>
                    ) : null}
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
