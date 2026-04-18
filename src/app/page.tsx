"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import {
  CATEGORY_OPTIONS,
  addQuickNeed,
  buildSuggestions,
  groupByStore,
  removeActiveItem,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import type { Suggestion } from "@/lib/mindercart/types";

export default function NeedsPage() {
  const { activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [unit, setUnit] = React.useState("pza");
  const [quantity, setQuantity] = React.useState("1");
  const [store, setStore] = React.useState(settings.preferredStore || "Walmart");
  const [message, setMessage] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);

  React.useEffect(() => {
    if (!hydrated) return;
    setStore(settings.preferredStore || "Walmart");
  }, [hydrated, settings.preferredStore]);

  React.useEffect(() => {
    if (!hydrated) return;
    setSuggestions(buildSuggestions(name));
  }, [hydrated, name]);

  function applySuggestion(suggestion: Suggestion) {
    setName(suggestion.name);
    setCategory(suggestion.category || "General");
    setUnit(suggestion.unit || "pza");
    setStore(suggestion.store || settings.preferredStore || "Walmart");
    setSuggestions([]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      addQuickNeed({ name, category, unit, quantity, store });
      setMessage(`✅ ${name} ${t(lang, "addedToList")}`);
      setName("");
      setQuantity("1");
      setSuggestions([]);
    } catch (e: any) {
      setMessage(`⚠ ${String(e?.message || e)}`);
    }
  }

  if (!hydrated) {
    return (
      <AppShell title="¿Qué necesito?" subtitle="Agrega lo que hace falta para tu próxima compra">
        <section style={cardStyle()}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  const groups = groupByStore(activeShoppingListItems);

  return (
    <AppShell title={t(lang, "needsTitle")} subtitle={t(lang, "needsSubtitle")}>
      <section style={cardStyle()}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(lang, "item")}</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === "en" ? "e.g. milk" : "ej. leche"}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #ddd",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />

            {name.trim().length >= 2 ? (
              <div
                style={{
                  marginTop: 8,
                  border: "1px solid #eee",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {suggestions.length === 0 ? (
                  <div style={{ padding: 12, fontSize: 14, opacity: 0.75 }}>
                    {t(lang, "noSuggestions")}
                  </div>
                ) : (
                  suggestions.map((row) => (
                    <button
                      key={`${row.source}_${row.id}`}
                      type="button"
                      onClick={() => applySuggestion(row)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: 12,
                        border: 0,
                        borderBottom: "1px solid #f2f2f2",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{row.name}</div>
                      <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                        {row.category} · {row.unit} · {row.store}
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(lang, "category")}</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                }}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(lang, "unit")}</div>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                }}
              >
                <option value="pza">pza</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lt">lt</option>
                <option value="ml">ml</option>
                <option value="caja">caja</option>
                <option value="paquete">paquete</option>
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(lang, "quantity")}</div>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{t(lang, "store")}</div>
              <input
                value={store}
                onChange={(e) => setStore(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            {t(lang, "add")}
          </button>
        </form>

        {message ? <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div> : null}
      </section>

      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 10 }}>{t(lang, "whatIHave")}</div>

        {groups.length === 0 ? (
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t(lang, "noItemsYet")}</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {groups.map((group) => (
              <div key={group.store}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  {group.store} · {group.items.filter((item) => !item.checked).length}{" "}
                  {t(lang, "pending").toLowerCase()}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #f0f0f0",
                        borderRadius: 14,
                        padding: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900 }}>{item.name}</div>
                        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                          {item.category} · {item.quantity} · {item.unit}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeActiveItem(item.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          background: "#fff",
                          fontWeight: 900,
                        }}
                      >
                        {t(lang, "remove")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
