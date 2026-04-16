// FILE: src/app/general-list/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { addGeneralSelections, readState } from "@/lib/mindercart/storage";
import type { GeneralListItem } from "@/lib/mindercart/types";

function normalizedActiveKeys() {
  const state = readState();
  return new Set(
    state.activeShoppingListItems.map(
      (item) =>
        `${item.name.toLowerCase().trim()}__${item.unit.toLowerCase().trim()}__${item.store.toLowerCase().trim()}`
    )
  );
}

export default function GeneralListPage() {
  const [items, setItems] = React.useState<GeneralListItem[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState("");

  function reload() {
    const state = readState();
    const activeKeys = normalizedActiveKeys();

    const nextSelected: Record<string, boolean> = {};
    for (const item of state.generalListItems.filter((row) => row.active !== false)) {
      const key = `${item.name.toLowerCase().trim()}__${item.unit.toLowerCase().trim()}__${item.store.toLowerCase().trim()}`;
      nextSelected[item.id] = activeKeys.has(key);
    }

    setItems(state.generalListItems.filter((row) => row.active !== false));
    setSelected(nextSelected);
  }

  React.useEffect(() => {
    reload();
  }, []);

  function onAddSelected() {
    const ids = Object.entries(selected)
      .filter(([, value]) => value)
      .map(([id]) => id);

    addGeneralSelections(ids);
    setMessage("✅ Selección agregada a la lista abierta");
    reload();
  }

  return (
    <AppShell
      title="General List"
      subtitle="Memoria habitual del hogar con checkbox"
    >
      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 8 }}>
          Review before shopping
        </div>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 12 }}>
          Aquí la usuaria revisa artículos frecuentes y marca lo que quiere agregar a la lista abierta.
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
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
              <div>
                <div style={{ fontWeight: 900 }}>{item.name}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                  qty: {item.quantity} · unit: {item.unit} · store: {item.store}
                </div>
              </div>
            </label>
          ))}
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
          Add checked to active list
        </button>

        {message ? <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div> : null}
      </section>
    </AppShell>
  );
}