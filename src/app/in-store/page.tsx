// FILE: src/app/in-store/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import {
  closeActiveShoppingList,
  readState,
  toggleActiveItemChecked,
} from "@/lib/mindercart/storage";
import type { ActiveShoppingListItem } from "@/lib/mindercart/types";

export default function InStorePage() {
  const [items, setItems] = React.useState<ActiveShoppingListItem[]>([]);
  const [message, setMessage] = React.useState("");

  function reload() {
    const state = readState();
    setItems(state.activeShoppingListItems);
  }

  React.useEffect(() => {
    reload();
  }, []);

  const pending = items.filter((item) => !item.checked);
  const completed = items.filter((item) => item.checked);

  return (
    <AppShell
      title="In Store"
      subtitle="Checklist de compra"
    >
      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 10 }}>Pending</div>

        {pending.length === 0 ? (
          <div style={{ fontSize: 14, opacity: 0.75 }}>Nada pendiente.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pending.map((item) => (
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
                  checked={item.checked}
                  onChange={(e) => {
                    toggleActiveItemChecked(item.id, e.target.checked);
                    reload();
                  }}
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
        )}
      </section>

      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 10 }}>Bought / Completed</div>

        {completed.length === 0 ? (
          <div style={{ fontSize: 14, opacity: 0.75 }}>Nada comprado todavía.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {completed.map((item) => (
              <label
                key={item.id}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 14,
                  padding: 12,
                  opacity: 0.7,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => {
                    toggleActiveItemChecked(item.id, e.target.checked);
                    reload();
                  }}
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
        )}

        <button
          type="button"
          onClick={() => {
            closeActiveShoppingList();
            setMessage("✅ Lista cerrada y enviada a History");
            reload();
          }}
          disabled={items.length === 0}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #111",
            background: items.length === 0 ? "#f4f4f4" : "#111",
            color: items.length === 0 ? "#999" : "#fff",
            fontWeight: 900,
          }}
        >
          Close shopping trip
        </button>

        {message ? <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div> : null}
      </section>
    </AppShell>
  );
}