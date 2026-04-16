// FILE: src/app/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { addQuickNeed, readState } from "@/lib/mindercart/storage";

export default function HomePage() {
  const [name, setName] = React.useState("");
  const [unit, setUnit] = React.useState("pza");
  const [quantity, setQuantity] = React.useState("1");
  const [store, setStore] = React.useState("Walmart");
  const [message, setMessage] = React.useState("");
  const [activeCount, setActiveCount] = React.useState(0);

  React.useEffect(() => {
    const state = readState();
    setStore(state.settings.preferredStore || "Walmart");
    setActiveCount(state.activeShoppingListItems.length);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const state = addQuickNeed({ name, unit, quantity, store });
      setMessage(`✅ ${name} agregado a la lista abierta`);
      setName("");
      setQuantity("1");
      setActiveCount(state.activeShoppingListItems.length);
    } catch (e: any) {
      setMessage(`⚠ ${String(e?.message || e)}`);
    }
  }

  return (
    <AppShell
      title="MinderCart"
      subtitle="Home / Quick Add · ES / EN"
    >
      <section style={cardStyle()}>
        <div style={{ fontWeight: 1000, marginBottom: 10 }}>
          ¿Qué necesitas? / What do you need?
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Artículo / Item</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. leche / milk"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #ddd",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Unidad / Unit</div>
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
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Cantidad / Qty</div>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
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
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Tienda / Store</div>
              <input
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="Walmart"
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
            Add / Agregar
          </button>
        </form>

        {message ? (
          <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div>
        ) : null}

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
          Lista abierta actual: {activeCount} artículo(s)
        </div>
      </section>
    </AppShell>
  );
}