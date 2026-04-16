// FILE: src/app/shopping-list/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { readState, removeActiveItem } from "@/lib/mindercart/storage";
import type { ActiveShoppingListItem } from "@/lib/mindercart/types";

export default function ShoppingListPage() {
  const [items, setItems] = React.useState<ActiveShoppingListItem[]>([]);

  function reload() {
    const state = readState();
    setItems(state.activeShoppingListItems);
  }

  React.useEffect(() => {
    reload();
  }, []);

  return (
    <AppShell
      title="Shopping List"
      subtitle="Lista vigente consolidada"
    >
      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 10 }}>
          Lista abierta / Active shopping list
        </div>

        {items.length === 0 ? (
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            No hay artículos todavía.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((item) => (
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
                    qty: {item.quantity} · unit: {item.unit} · store: {item.store}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeActiveItem(item.id);
                    reload();
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                    fontWeight: 900,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Share WhatsApp
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#111",
              fontWeight: 900,
            }}
          >
            Export PDF
          </button>
        </div>
      </section>
    </AppShell>
  );
}