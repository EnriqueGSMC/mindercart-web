"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { formatDateTime, t } from "@/lib/mindercart/i18n";
import { useMinderCartState } from "@/lib/mindercart/hooks";

export default function HistoryPage() {
  const { shoppingHistory, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!hydrated) {
    return (
      <AppShell title={t("es", "historyTitle")} subtitle={t("es", "historySubtitle")}>
        <section style={cardStyle()}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title={t(lang, "historyTitle")} subtitle={t(lang, "historySubtitle")}>
      {shoppingHistory.length === 0 ? (
        <section style={cardStyle()}>
          <div style={{ fontWeight: 900 }}>{t(lang, "noHistory")}</div>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {shoppingHistory.map((row) => {
            const expanded = expandedId === row.id;

            return (
              <section key={row.id} style={cardStyle()}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  {formatDateTime(row.closedAt, lang)} · {row.store} · {row.items.length} {t(lang, "itemsLabel")}
                </button>

                {expanded ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "grid", gap: 10 }}>
                      {row.items.map((item) => (
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
                            {item.quantity} · {item.unit} · {item.store}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      style={{
                        marginTop: 12,
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #ddd",
                        background: "#fff",
                        color: "#111",
                        fontWeight: 900,
                      }}
                    >
                      {t(lang, "back")}
                    </button>
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
