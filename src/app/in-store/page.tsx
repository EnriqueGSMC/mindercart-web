"use client";

import React from "react";
import { AppShell, cardStyle } from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import { closeShoppingForStore, groupByStore, toggleActiveItemChecked } from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";

export default function ShoppingPage() {
  const { activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const [message, setMessage] = React.useState("");
  const [openStore, setOpenStore] = React.useState<string | null>(null);

  if (!hydrated) {
    return (
      <AppShell title={t("es", "shoppingTitle")} subtitle={t("es", "shoppingSubtitle")}>
        <section style={cardStyle()}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  const groups = groupByStore(activeShoppingListItems);

  function onCloseStore(store: string) {
    const storeItems = activeShoppingListItems.filter((item) => item.store === store);
    const boughtCount = storeItems.filter((item) => item.checked).length;
    const pendingCount = storeItems.filter((item) => !item.checked).length;

    const confirmMsg =
      lang === "en"
        ? boughtCount === 0
          ? `There are no purchased items marked for ${store}. Nothing will be sent to History and ${pendingCount} item(s) will remain pending. Do you want to close this store visit?`
          : pendingCount > 0
            ? `${boughtCount} purchased item(s) will be sent to History and ${pendingCount} item(s) will remain pending in ${store}. Do you want to finish this store purchase?`
            : `${boughtCount} purchased item(s) will be sent to History for ${store}. Do you want to finish this store purchase?`
        : boughtCount === 0
          ? `No hay artículos marcados como comprados en ${store}. No se enviará nada a Historial y ${pendingCount} artículo(s) seguirán pendientes. ¿Deseas cerrar esta visita a la tienda?`
          : pendingCount > 0
            ? `${boughtCount} artículo(s) comprado(s) se enviarán a Historial y ${pendingCount} artículo(s) seguirán pendientes en ${store}. ¿Deseas terminar esta compra de tienda?`
            : `${boughtCount} artículo(s) comprado(s) se enviarán a Historial de ${store}. ¿Deseas terminar esta compra de tienda?`;

    const ok = window.confirm(confirmMsg);
    if (!ok) return;

    closeShoppingForStore(store);

    setMessage(
      lang === "en"
        ? `${store}: ${boughtCount} item(s) sent to History, ${pendingCount} pending.`
        : `${store}: ${boughtCount} artículo(s) enviados a Historial, ${pendingCount} pendiente(s).`
    );

    setOpenStore(null);
  }

  return (
    <AppShell title={t(lang, "shoppingTitle")} subtitle={t(lang, "shoppingSubtitle")}>
      {groups.length === 0 ? (
        <section style={cardStyle()}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>{t(lang, "noItemsYet")}</div>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {groups.map((group) => {
            const pending = group.items.filter((item) => !item.checked);
            const completed = group.items.filter((item) => item.checked);
            const expanded = openStore === group.store;

            return (
              <section key={group.store} style={cardStyle()}>
                <button
                  type="button"
                  onClick={() => setOpenStore(expanded ? null : group.store)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 1000,
                    fontSize: 18,
                  }}
                >
                  {group.store} · {pending.length} {t(lang, "pending").toLowerCase()}
                </button>

                {expanded ? (
                  <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        {t(lang, "pending")}
                      </div>

                      {pending.length === 0 ? (
                        <div style={{ fontSize: 14, opacity: 0.75 }}>
                          {t(lang, "noPending")}
                        </div>
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
                                onChange={(e) =>
                                  toggleActiveItemChecked(item.id, e.target.checked)
                                }
                              />
                              <div>
                                <div style={{ fontWeight: 900 }}>{item.name}</div>
                                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                                  {item.quantity} · {item.unit}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        {t(lang, "completed")}
                      </div>

                      {completed.length === 0 ? (
                        <div style={{ fontSize: 14, opacity: 0.75 }}>
                          {t(lang, "noCompleted")}
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                          {completed.map((item) => (
                            <label
                              key={item.id}
                              style={{
                                border: "1px solid #f0f0f0",
                                borderRadius: 14,
                                padding: 12,
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                opacity: 0.7,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(e) =>
                                  toggleActiveItemChecked(item.id, e.target.checked)
                                }
                              />
                              <div>
                                <div style={{ fontWeight: 900 }}>{item.name}</div>
                                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                                  {item.quantity} · {item.unit}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onCloseStore(group.store)}
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
                      {t(lang, "finishStorePurchase")}
                    </button>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      {message ? (
        <section style={cardStyle()}>
          <div style={{ fontSize: 14 }}>{message}</div>
        </section>
      ) : null}
    </AppShell>
  );
}
