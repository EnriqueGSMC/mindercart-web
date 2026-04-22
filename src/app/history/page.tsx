"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppShell, QtyUnitText, cardStyle, scalePx } from "@/components/mindercart/Shell";
import { formatDateTime, t } from "@/lib/mindercart/i18n";
import { useMinderCartState } from "@/lib/mindercart/hooks";

export default function HistoryPage() {
  const router = useRouter();
  const { shoppingHistory, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!hydrated) {
    return (
      <AppShell
        title={t("es", "historyTitle")}
        darkHero
        subtitle={t("es", "historySubtitle")}
        showCart={false}
        footerActions={[
          {
            label: t("es", "back"),
            primary: true,
            onClick: () => {
              if (window.history.length > 1) router.back();
              else router.push("/in-store");
            },
          },
        ]}
      >
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: s(14), color: "#6b7280" }}>{t("es", "loading")}</div>
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
      footerActions={[
        {
          label: t(lang, "back"),
          primary: true,
          onClick: () => {
            if (window.history.length > 1) router.back();
            else router.push("/in-store");
          },
        },
      ]}
    >
      {shoppingHistory.length === 0 ? (
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontWeight: 900, fontSize: s(15) }}>{t(lang, "noHistory")}</div>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {shoppingHistory.map((row) => {
            const expanded = expandedId === row.id;
            return (
              <section key={row.id} style={{ ...cardStyle(), padding: 14 }}>
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
                    fontSize: s(15),
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
                            borderRadius: 16,
                            padding: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div style={{ flex: 1, fontSize: s(17), fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: s(15), color: "#6b7280", flexShrink: 0 }}>
                            <QtyUnitText quantity={item.quantity} unit={item.unit} />
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
                        fontSize: s(14),
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
