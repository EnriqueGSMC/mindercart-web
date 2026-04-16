// FILE: src/app/history/page.tsx
"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { readState } from "@/lib/mindercart/storage";
import type { ShoppingHistoryEntry } from "@/lib/mindercart/types";

function formatDate(ms: number) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return String(ms);
  }
}

export default function HistoryPage() {
  const [rows, setRows] = React.useState<ShoppingHistoryEntry[]>([]);

  React.useEffect(() => {
    const state = readState();
    setRows(state.shoppingHistory);
  }, []);

  return (
    <AppShell
      title="History"
      subtitle="Historial de compras cerradas"
    >
      <section style={{ display: "grid", gap: 12 }}>
        {rows.length === 0 ? (
          <div style={cardStyle()}>
            <div style={{ fontWeight: 900 }}>No hay historial todavía.</div>
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} style={cardStyle()}>
              <div style={{ fontWeight: 900 }}>
                {formatDate(row.closedAt)} · {row.store} · {row.items.length} items
              </div>
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.75 }}>
                {row.items.map((item) => item.name).join(", ")}
              </div>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}