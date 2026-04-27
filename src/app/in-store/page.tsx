"use client";

import React from "react";
import {
  AppShell,
  MC_NAVY,
  MC_NAVY_LINE,
  MC_NAVY_MUTED,
  MC_NAVY_SOFT,
  QtyUnitText,
  cardStyle,
  scalePx,
} from "@/components/mindercart/Shell";
import { t } from "@/lib/mindercart/i18n";
import {
  buildShoppingListHtmlForStore,
  buildShoppingListTextForStore,
  closeShoppingForStore,
  groupByStore,
  readState,
  toggleActiveItemChecked,
  writeState,
} from "@/lib/mindercart/storage";
import { useMinderCartState } from "@/lib/mindercart/hooks";

type RemoveAction = {
  id: string;
  name: string;
} | null;

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(18,36,94,0.24)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: "max(16px, env(safe-area-inset-top))",
  paddingRight: 16,
  paddingBottom: "max(16px, calc(16px + env(safe-area-inset-bottom)))",
  paddingLeft: 16,
  zIndex: 120,
};

const modalCardStyle: React.CSSProperties = {
  width: "min(420px, 100%)",
  maxHeight: "min(320px, calc(100dvh - 56px))",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 22,
  border: `1px solid ${MC_NAVY_LINE}`,
  padding: 14,
  boxShadow: "0 16px 40px rgba(18,36,94,0.18)",
};

function openPdf(html: string) {
  if (!html) return;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function normalizeValue(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deleteItemEverywhere(id: string) {
  const state = readState();
  const target = state.activeShoppingListItems.find((item) => item.id === id);
  if (!target) return state;

  const sameGeneralItem = (item: { name: string; unit: string; store: string }) =>
    normalizeValue(item.name) === normalizeValue(target.name) &&
    normalizeValue(item.unit) === normalizeValue(target.unit) &&
    normalizeValue(item.store) === normalizeValue(target.store);

  const sameMasterItem = (item: { name: string; unit: string; defaultStore: string }) =>
    normalizeValue(item.name) === normalizeValue(target.name) &&
    normalizeValue(item.unit) === normalizeValue(target.unit) &&
    normalizeValue(item.defaultStore) === normalizeValue(target.store);

  const next = {
    ...state,
    activeShoppingListItems: state.activeShoppingListItems.filter((item) => item.id !== id),
    generalListItems: state.generalListItems.filter((item) => !sameGeneralItem(item)),
    itemsMaster: state.itemsMaster.filter((item) => !sameMasterItem(item)),
  };

  writeState(next);
  return next;
}


function sideActionButtonStyle(fontSize: number): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${MC_NAVY_LINE}`,
    background: "#fff",
    color: MC_NAVY,
    fontWeight: 800,
    fontSize,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}

function circleBadgeStyle(active: boolean, fontSize: number): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: active ? MC_NAVY : MC_NAVY_SOFT,
    color: active ? "#fff" : MC_NAVY,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize,
    fontWeight: 900,
    flexShrink: 0,
  };
}

export default function ShoppingPage() {
  const { activeShoppingListItems, settings, hydrated } = useMinderCartState();
  const lang = settings.language;
  const s = (px: number) => scalePx(settings.fontScale, px);
  const [message, setMessage] = React.useState("");
  const [openStore, setOpenStore] = React.useState<string | null>(null);
  const [removeAction, setRemoveAction] = React.useState<RemoveAction>(null);
  const [deferredIdsByStore, setDeferredIdsByStore] = React.useState<Record<string, string[]>>({});

  if (!hydrated) {
    return (
      <AppShell
        title={t("es", "shoppingTitle")}
        darkHero
        subtitle={t("es", "shoppingSubtitle")}
        showCart={false}
        footerActions={[
          { label: t("es", "whatsApp"), disabled: true, primary: true },
          { label: t("es", "pdf"), disabled: true },
          { label: t("es", "back"), href: "/general-list" },
        ]}
      >
        <section style={{ ...cardStyle(), padding: 18 }}>
          <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t("es", "loading")}</div>
        </section>
      </AppShell>
    );
  }

  const groups = groupByStore(activeShoppingListItems);
  const selectedStoreGroup = groups.find((group) => group.store === openStore) ?? null;
  const hiddenIds = selectedStoreGroup ? new Set(deferredIdsByStore[selectedStoreGroup.store] ?? []) : new Set<string>();
  const visibleStoreItems = selectedStoreGroup
    ? selectedStoreGroup.items.filter((item) => !hiddenIds.has(item.id))
    : [];
  const pendingItems = selectedStoreGroup ? visibleStoreItems.filter((item) => !item.checked) : [];
  const addedItems = selectedStoreGroup ? visibleStoreItems.filter((item) => item.checked) : [];

  function onWhatsAppStore(store: string) {
    const text = buildShoppingListTextForStore(store);
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function onPdfStore(store: string) {
    openPdf(buildShoppingListHtmlForStore(store, lang));
  }

  function closeRemoveMenu() {
    setRemoveAction(null);
  }

  function onMoveToLater() {
    if (!removeAction || !selectedStoreGroup) return;
    toggleActiveItemChecked(removeAction.id, false);
    setDeferredIdsByStore((current) => ({
      ...current,
      [selectedStoreGroup.store]: Array.from(
        new Set([...(current[selectedStoreGroup.store] ?? []), removeAction.id])
      ),
    }));
    setMessage(
      lang === "en"
        ? `${removeAction.name} stays pending in My List.`
        : `${removeAction.name} sigue pendiente en Mi Lista.`
    );
    closeRemoveMenu();
  }

  function onDeleteItem() {
    if (!removeAction) return;
    deleteItemEverywhere(removeAction.id);
    setMessage(
      lang === "en"
        ? `${removeAction.name} removed from My List and Shopping.`
        : `${removeAction.name} se eliminó de Mi Lista y De Compras.`
    );
    closeRemoveMenu();
  }

  function onCloseStore(store: string) {
    const storeItems = activeShoppingListItems.filter((item) => item.store === store);
    const boughtCount = storeItems.filter((item) => item.checked).length;
    const pendingCount = storeItems.filter((item) => !item.checked).length;
    const ok = window.confirm(
      lang === "en"
        ? `${boughtCount} purchased item(s) will be sent to History and ${pendingCount} item(s) will remain pending in ${store}.`
        : `${boughtCount} artículo(s) comprado(s) se enviarán a Historial y ${pendingCount} artículo(s) seguirán pendientes en ${store}.`
    );
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
    <AppShell
      title={t(lang, "shoppingTitle")}
      darkHero
      subtitle={t(lang, "shoppingSubtitle")}
      showCart={false}
      footerActions={[
        {
          label: t(lang, "whatsApp"),
          primary: true,
          disabled: !selectedStoreGroup,
          onClick: selectedStoreGroup ? () => onWhatsAppStore(selectedStoreGroup.store) : undefined,
        },
        {
          label: t(lang, "pdf"),
          disabled: !selectedStoreGroup,
          onClick: selectedStoreGroup ? () => onPdfStore(selectedStoreGroup.store) : undefined,
        },
        selectedStoreGroup
          ? { label: t(lang, "back"), onClick: () => setOpenStore(null) }
          : { label: t(lang, "back"), href: "/general-list" },
      ]}
    >
      {!selectedStoreGroup ? (
        <section style={{ ...cardStyle(), padding: 14 }}>
          <div style={{ fontSize: s(16), fontWeight: 800, marginBottom: 10 }}>{t(lang, "stores")}</div>

          {groups.length === 0 ? (
            <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>{t(lang, "noItemsYet")}</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {groups.map((group) => {
                const hiddenIdsForStore = new Set(deferredIdsByStore[group.store] ?? []);
                const pendingCount = group.items.filter(
                  (item) => !item.checked && !hiddenIdsForStore.has(item.id)
                ).length;
                return (
                  <button
                    key={group.store}
                    type="button"
                    onClick={() => setOpenStore(group.store)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: `1px solid ${MC_NAVY_LINE}`,
                      background: "#fff",
                      color: MC_NAVY,
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: s(15) }}>{group.store}</span>
                    <span style={{ fontWeight: 400, fontSize: s(15) }}>
                      {" "}
                      · {pendingCount} {t(lang, "itemsLabel")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          <section style={{ ...cardStyle(), padding: 14 }}>
            <button
              type="button"
              onClick={() => setOpenStore(null)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                marginBottom: 10,
                color: MC_NAVY,
                fontSize: s(14),
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <span aria-hidden="true">←</span>
              <span>{lang === "en" ? "Back to stores" : "Regresar a tiendas"}</span>
            </button>
            <div style={{ fontSize: s(16), fontWeight: 800, color: MC_NAVY }}>
              {lang === "en" ? "Your Shopping Cart" : "Tu Carrito de Compras"}
            </div>
            <div style={{ marginTop: 4, fontSize: s(20), fontWeight: 900 }}>{selectedStoreGroup.store}</div>
            <div style={{ marginTop: 8, fontSize: s(14), color: MC_NAVY_MUTED }}>
              {lang === "en"
                ? "Select what you are adding to your cart."
                : "Selecciona lo que vas agregando a tu carrito"}
            </div>
          </section>

          <section style={{ ...cardStyle(), padding: 14 }}>
            <div style={{ fontSize: s(15), fontWeight: 800, marginBottom: 10 }}>
              {lang === "en" ? "To add right now" : "Para agregar ahorita"}
            </div>

            {pendingItems.length === 0 ? (
              <div
                style={{
                  border: `1px solid ${MC_NAVY_LINE}`,
                  borderRadius: 16,
                  padding: 14,
                  background: MC_NAVY_SOFT,
                  color: MC_NAVY_MUTED,
                  fontSize: s(14),
                }}
              >
                {lang === "en"
                  ? "You already added everything from this store."
                  : "Ya agregaste todo lo de esta tienda."}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      width: "100%",
                      border: `1px solid ${MC_NAVY_LINE}`,
                      borderRadius: 16,
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      background: "#fff",
                      color: MC_NAVY,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleActiveItemChecked(item.id, true)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        textAlign: "left",
                        color: "inherit",
                      }}
                    >
                      <div style={circleBadgeStyle(false, s(18))}>+</div>
                      <div style={{ flex: 1, minWidth: 0, fontSize: s(17), fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: s(15), color: MC_NAVY_MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>
                        <QtyUnitText quantity={item.quantity} unit={item.unit} />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRemoveAction({ id: item.id, name: item.name })}
                      style={sideActionButtonStyle(s(14))}
                    >
                      {lang === "en" ? "Remove" : "Quitar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{ ...cardStyle(), padding: 14 }}>
            <div style={{ fontSize: s(15), fontWeight: 800, marginBottom: 10 }}>
              {lang === "en" ? "Already in your cart" : "Ya en tu carrito"}
            </div>

            {addedItems.length === 0 ? (
              <div style={{ fontSize: s(14), color: MC_NAVY_MUTED }}>
                {lang === "en"
                  ? "Nothing added yet from this store."
                  : "Todavía no agregas nada de esta tienda."}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {addedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      width: "100%",
                      border: `1px solid ${MC_NAVY_LINE}`,
                      borderRadius: 16,
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      background: MC_NAVY_SOFT,
                      color: MC_NAVY,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleActiveItemChecked(item.id, false)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        textAlign: "left",
                        color: "inherit",
                      }}
                    >
                      <div style={circleBadgeStyle(true, s(14))}>✓</div>
                      <div style={{ flex: 1, minWidth: 0, fontSize: s(17), fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: s(15), color: MC_NAVY_MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>
                        <QtyUnitText quantity={item.quantity} unit={item.unit} />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRemoveAction({ id: item.id, name: item.name })}
                      style={sideActionButtonStyle(s(14))}
                    >
                      {lang === "en" ? "Remove" : "Quitar"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => onCloseStore(selectedStoreGroup.store)}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "13px 14px",
                borderRadius: 14,
                border: `1px solid ${MC_NAVY}`,
                background: MC_NAVY,
                color: "#fff",
                fontWeight: 900,
                fontSize: s(14),
              }}
            >
              {t(lang, "finishPurchase")}
            </button>
          </section>
        </>
      )}

      {message ? (
        <section style={{ ...cardStyle(), padding: 14 }}>
          <div style={{ fontSize: s(14), color: MC_NAVY }}>{message}</div>
        </section>
      ) : null}

      {removeAction ? (
        <div style={modalOverlayStyle} onClick={closeRemoveMenu}>
          <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ fontSize: s(16), fontWeight: 900, color: MC_NAVY }}>
              {lang === "en" ? "Remove item" : "Quitar artículo"}
            </div>
            <div style={{ marginTop: 6, fontSize: s(14), color: MC_NAVY_MUTED }}>
              {removeAction.name}
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={onMoveToLater}
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: `1px solid ${MC_NAVY_LINE}`,
                  background: "#fff",
                  color: MC_NAVY,
                  fontWeight: 900,
                  fontSize: s(14),
                }}
              >
                {lang === "en" ? "For later" : "Para Después"}
              </button>

              <button
                type="button"
                onClick={onDeleteItem}
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: `1px solid ${MC_NAVY}`,
                  background: MC_NAVY,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: s(14),
                }}
              >
                {lang === "en" ? "Delete" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
