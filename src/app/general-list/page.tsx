// FILE: src/app/general-list/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import {
  addGeneralSelections,
  buildShoppingListHtml,
  buildShoppingListText,
  groupByStore,
  itemKey,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";

export default function GeneralListPage() {
  const { generalListItems, activeShoppingListItems, settings } = useMinderCartState();
  const lang = settings.language;
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState("");

  const activeKeySet = React.useMemo(
    () => new Set(activeShoppingListItems.map((item) => itemKey(item))),
    [activeShoppingListItems]
  );

  const groups = groupByStore(activeShoppingListItems);
  const hasActiveItems = activeShoppingListItems.length > 0;

  function onAddSelected() {
    const ids = Object.entries(selected)
      .filter(([, value]) => value)
      .map(([id]) => id);

    if (ids.length === 0) return;
    addGeneralSelections(ids);
    setSelected({});
    setMessage("✅ OK");
  }

  function onWhatsApp() {
    const text = buildShoppingListText();
    if (!text) return;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function onPdf() {
    const html = buildShoppingListHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <AppShell title={t(lang, "shoppingTitle")} subtitle={t(lang, "shoppingSubtitle")}>
      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 10 }}>{t(lang, "currentList")}</div>

        {groups.length === 0 ? (
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {groups.map((group) => (
              <div key={group.store}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  {group.store} · {group.items.length} item(s)
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #f0f0f0",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{item.name}</div>
                      <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                        {item.quantity} · {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 8 }}>{t(lang, "frequentItems")}</div>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 12 }}>
          {t(lang, "reviewHelp")}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {generalListItems
            .filter((item) => item.active !== false)
            .map((item) => {
              const inActiveList = activeKeySet.has(itemKey(item));

              return (
                <label
                  key={item.id}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 14,
                    padding: 12,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[item.id]}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))
                    }
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900 }}>{item.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                      {item.quantity} · {item.unit} · {item.store}
                    </div>
                  </div>

                  {inActiveList ? (
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "#f3f4f6",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {t(lang, "alreadyInList")}
                    </div>
                  ) : null}
                </label>
              );
            })}
        </div>

        <button
          type="button"
          onClick={onAddSelected}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
          }}
        >
          {t(lang, "addChecked")}
        </button>

        {message ? <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div> : null}
      </section>

      {hasActiveItems ? (
        <section
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 20,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 18,
            padding: 12,
            boxShadow: "0 -2px 10px rgba(0,0,0,0.06)",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 900 }}>Siguiente paso</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onWhatsApp}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
              }}
            >
              {t(lang, "sendWhatsApp")}
            </button>

            <button
              type="button"
              onClick={onPdf}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
                background: "#fff",
                color: "#111",
                fontWeight: 900,
              }}
            >
              {t(lang, "exportPdf")}
            </button>

            <a
              href="/in-store"
              style={{
                flex: 1,
                minWidth: 140,
                textAlign: "center",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
                background: "#fff",
                color: "#111",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              {t(lang, "navInStore")}
            </a>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}