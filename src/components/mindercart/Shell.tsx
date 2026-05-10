"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import { t } from "@/lib/mindercart/i18n";

export const MC_NAVY = "#12245E";
export const MC_NAVY_TEXT = "#172554";
export const MC_NAVY_SOFT = "#EEF2FF";
export const MC_NAVY_LINE = "#D7DFF5";
export const MC_NAVY_MUTED = "#5C6EA6";
const NAVY_BORDER = "rgba(255,255,255,0.18)";

type FooterAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
};

function actionButtonStyle(): React.CSSProperties {
  return {
    padding: "10px 13px",
    borderRadius: 14,
    border: `1px solid ${NAVY_BORDER}`,
    background: "#fff",
    color: MC_NAVY_TEXT,
    fontWeight: 800,
    fontSize: 13,
    textDecoration: "none",
    whiteSpace: "nowrap",
  };
}

function plainIconButtonStyle(): React.CSSProperties {
  return {
    minWidth: 34,
    height: 34,
    border: "none",
    background: "transparent",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    padding: 0,
  };
}

function cartIconStyle(): React.CSSProperties {
  return {
    minWidth: 40,
    height: 34,
    border: "none",
    background: "transparent",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    padding: 0,
    gap: 4,
  };
}

function footerButtonStyle(
  primary: boolean,
  disabled: boolean,
  fontSize: number
): React.CSSProperties {
  return {
    width: "100%",
    minHeight: 48,
    padding: "12px 10px",
    borderRadius: 16,
    border: `1px solid ${primary ? MC_NAVY : MC_NAVY_LINE}`,
    background: disabled ? "#E7ECFF" : primary ? MC_NAVY : "#fff",
    color: disabled ? MC_NAVY_MUTED : primary ? "#fff" : MC_NAVY_TEXT,
    fontWeight: 900,
    fontSize,
    textAlign: "center",
    textDecoration: "none",
    opacity: disabled ? 0.68 : 1,
    pointerEvents: disabled ? "none" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: primary && !disabled ? "0 8px 20px rgba(18,36,94,0.18)" : "none",
  };
}

function CartIcon() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5h1.4l1.7 8.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L18.2 8H7.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="18.5" r="1.4" fill="currentColor" />
      <circle cx="16.5" cy="18.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function MenuListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4.75h6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="M9.25 3.5h5.5A1.25 1.25 0 0 1 16 4.75v.75h.75A2.25 2.25 0 0 1 19 7.75v10A2.25 2.25 0 0 1 16.75 20h-9.5A2.25 2.25 0 0 1 5 17.75v-10A2.25 2.25 0 0 1 7.25 5.5H8v-.75A1.25 1.25 0 0 1 9.25 3.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m8.75 10 1.2 1.2 2.15-2.15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8.75 14 1.2 1.2 2.15-2.15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 10.5h2.25" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M13.5 14.5h2.25" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function MenuCartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="18.5" r="1.25" fill="currentColor" />
      <circle cx="17" cy="18.5" r="1.25" fill="currentColor" />
      <path d="M3.75 5h2l1.9 8h9l2-6.5H7.25" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 16h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function MenuBagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 8V7a4 4 0 1 1 8 0v1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M6 8.5h12l-1 10H7L6 8.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuHistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.35-5.65" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 5v4h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4l2.75 2.75" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuSettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.05 3.6a1 1 0 0 1 1-.85h1.9a1 1 0 0 1 1 .85l.25 1.65c.6.16 1.17.4 1.7.7l1.36-.98a1 1 0 0 1 1.29.1l1.35 1.35a1 1 0 0 1 .1 1.29l-.98 1.36c.3.53.54 1.1.7 1.7l1.65.25a1 1 0 0 1 .85 1v1.9a1 1 0 0 1-.85 1l-1.65.25c-.16.6-.4 1.17-.7 1.7l.98 1.36a1 1 0 0 1-.1 1.29l-1.35 1.35a1 1 0 0 1-1.29.1l-1.36-.98c-.53.3-1.1.54-1.7.7l-.25 1.65a1 1 0 0 1-1 .85h-1.9a1 1 0 0 1-1-.85l-.25-1.65a7.9 7.9 0 0 1-1.7-.7l-1.36.98a1 1 0 0 1-1.29-.1L3.8 18.2a1 1 0 0 1-.1-1.29l.98-1.36a7.9 7.9 0 0 1-.7-1.7l-1.65-.25a1 1 0 0 1-.85-1v-1.9a1 1 0 0 1 .85-1l1.65-.25c.16-.6.4-1.17.7-1.7L3.7 7.19a1 1 0 0 1 .1-1.29L5.15 4.55a1 1 0 0 1 1.29-.1l1.36.98c.53-.3 1.1-.54 1.7-.7l.25-1.65Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function scaleFactor(fontScale: unknown) {
  if (fontScale === "large") return 1.08;
  if (fontScale === "xlarge") return 1.14;
  return 1;
}

export function scalePx(fontScale: unknown, px: number): number {
  return Math.round(px * scaleFactor(fontScale));
}

export function cardStyle(): React.CSSProperties {
  return {
    border: `1px solid ${MC_NAVY_LINE}`,
    borderRadius: 20,
    background: "#fff",
    boxShadow: "0 4px 18px rgba(18,36,94,0.06)",
  };
}

export function shellStyle(): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: 860,
    margin: "0 auto",
    color: MC_NAVY_TEXT,
    background: "#F6F8FF",
    minHeight: "100dvh",
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  };
}

function normalizeUnitKey(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const UNIT_ALIAS_TO_CANONICAL: Record<string, string> = {
  pieza: "piece",
  piezas: "piece",
  pza: "piece",
  pzas: "piece",
  piece: "piece",
  pieces: "piece",
  unidad: "unit",
  unidades: "unit",
  unit: "unit",
  units: "unit",
  bolsa: "bag",
  bolsas: "bag",
  bag: "bag",
  bags: "bag",
  paquete: "pack",
  paquetes: "pack",
  pack: "pack",
  packs: "pack",
  docena: "dozen",
  docenas: "dozen",
  dozen: "dozen",
  dozens: "dozen",
  botella: "bottle",
  botellas: "bottle",
  bottle: "bottle",
  bottles: "bottle",
  caja: "box",
  cajas: "box",
  box: "box",
  boxes: "box",
  lata: "can",
  latas: "can",
  can: "can",
  cans: "can",
  bote: "jar",
  botes: "jar",
  jar: "jar",
  jars: "jar",
  sobre: "sachet",
  sobres: "sachet",
  sachet: "sachet",
  sachets: "sachet",
  carton: "carton",
  cartón: "carton",
  cartones: "carton",
  cartons: "carton",
  rollo: "roll",
  rollos: "roll",
  roll: "roll",
  rolls: "roll",
  charola: "tray",
  charolas: "tray",
  tray: "tray",
  trays: "tray",
  kilo: "kilogram",
  kilos: "kilogram",
  kilogramo: "kilogram",
  kilogramos: "kilogram",
  kilogram: "kilogram",
  kilograms: "kilogram",
  kg: "kg",
  gramo: "gram",
  gramos: "gram",
  gram: "gram",
  grams: "gram",
  g: "g",
  litro: "liter",
  litros: "liter",
  liter: "liter",
  liters: "liter",
  l: "l",
  mililitro: "milliliter",
  mililitros: "milliliter",
  milliliter: "milliliter",
  milliliters: "milliliter",
  ml: "ml",
  libra: "pound",
  libras: "pound",
  pound: "pound",
  pounds: "pound",
  lb: "lb",
  lbs: "lb",
  onza: "ounce",
  onzas: "ounce",
  ounce: "ounce",
  ounces: "ounce",
  oz: "oz",
  galon: "gallon",
  galón: "gallon",
  galones: "gallon",
  gallon: "gallon",
  gallons: "gallon",
};

const UNIT_DISPLAY: Record<
  string,
  { singular: { es: string; en: string }; plural: { es: string; en: string } }
> = {
  piece: { singular: { es: "pieza", en: "piece" }, plural: { es: "piezas", en: "pieces" } },
  unit: { singular: { es: "unidad", en: "unit" }, plural: { es: "unidades", en: "units" } },
  bag: { singular: { es: "bolsa", en: "bag" }, plural: { es: "bolsas", en: "bags" } },
  pack: { singular: { es: "paquete", en: "pack" }, plural: { es: "paquetes", en: "packs" } },
  dozen: { singular: { es: "docena", en: "dozen" }, plural: { es: "docenas", en: "dozens" } },
  bottle: { singular: { es: "botella", en: "bottle" }, plural: { es: "botellas", en: "bottles" } },
  box: { singular: { es: "caja", en: "box" }, plural: { es: "cajas", en: "boxes" } },
  can: { singular: { es: "lata", en: "can" }, plural: { es: "latas", en: "cans" } },
  jar: { singular: { es: "bote", en: "jar" }, plural: { es: "botes", en: "jars" } },
  sachet: { singular: { es: "sobre", en: "sachet" }, plural: { es: "sobres", en: "sachets" } },
  carton: { singular: { es: "cartón", en: "carton" }, plural: { es: "cartones", en: "cartons" } },
  roll: { singular: { es: "rollo", en: "roll" }, plural: { es: "rollos", en: "rolls" } },
  tray: { singular: { es: "charola", en: "tray" }, plural: { es: "charolas", en: "trays" } },
  kilogram: { singular: { es: "kilogramo", en: "kilogram" }, plural: { es: "kilogramos", en: "kilograms" } },
  gram: { singular: { es: "gramo", en: "gram" }, plural: { es: "gramos", en: "grams" } },
  liter: { singular: { es: "litro", en: "liter" }, plural: { es: "litros", en: "liters" } },
  milliliter: { singular: { es: "mililitro", en: "milliliter" }, plural: { es: "mililitros", en: "milliliters" } },
  pound: { singular: { es: "libra", en: "pound" }, plural: { es: "libras", en: "pounds" } },
  ounce: { singular: { es: "onza", en: "ounce" }, plural: { es: "onzas", en: "ounces" } },
  gallon: { singular: { es: "galón", en: "gallon" }, plural: { es: "galones", en: "gallons" } },
};

function shouldUsePlural(quantity: string): boolean {
  const parsed = Number(String(quantity).replace(",", "."));
  return Number.isFinite(parsed) && parsed !== 1;
}

function formatLocalizedUnit(unit: string, quantity: string, language: string): string {
  const lang = language === "en" ? "en" : "es";
  const normalized = normalizeUnitKey(unit);
  const canonical = UNIT_ALIAS_TO_CANONICAL[normalized];

  if (!canonical) {
    return unit;
  }

  if (canonical === "kg" || canonical === "g" || canonical === "l" || canonical === "ml" || canonical === "lb" || canonical === "oz") {
    return canonical;
  }

  const labels = UNIT_DISPLAY[canonical];

  if (!labels) {
    return unit;
  }

  return shouldUsePlural(quantity) ? labels.plural[lang] : labels.singular[lang];
}

export function QtyUnitText(props: { quantity: string; unit: string }) {
  const { settings } = useMinderCartState();
  const [compact, setCompact] = React.useState(false);
  const language = settings?.language === "en" ? "en" : "es";
  const localizedUnit = React.useMemo(
    () => formatLocalizedUnit(props.unit, props.quantity, language),
    [language, props.quantity, props.unit]
  );

  React.useEffect(() => {
    const update = () => setCompact(window.innerWidth <= 390);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return <>{props.quantity}{compact ? "" : ` ${localizedUnit}`}</>;
}

function FooterActionButton(props: {
  action: FooterAction;
  fontSize: number;
}) {
  const primary = !!props.action.primary;
  const disabled = !!props.action.disabled;
  const style = footerButtonStyle(primary, disabled, props.fontSize);

  if (props.action.href && !disabled) {
    return (
      <Link href={props.action.href} style={style}>
        {props.action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={props.action.onClick}
      disabled={disabled}
      style={style}
    >
      {props.action.label}
    </button>
  );
}

export function AppShell(props: {
  title?: string;
  subtitle?: string;
  sectionLabel?: string;
  secondaryAction?: { label: string; href: string };
  darkHero?: boolean;
  showCart?: boolean;
  footerInset?: number;
  footerActions?: FooterAction[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { settings } = useMinderCartState();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(searchParams.get("menu") === "1");
  }, [searchParams]);

  const showCart = props.showCart !== false;
  const s = (px: number) => scalePx(settings?.fontScale, px);
  const lang = settings.language;

  const fallbackTitle =
    pathname === "/"
      ? t(lang, "myListTitle")
      : pathname === "/general-list"
        ? t(lang, "cartTitle")
        : pathname === "/in-store"
          ? t(lang, "shoppingTitle")
          : pathname === "/history"
            ? t(lang, "historyTitle")
            : pathname === "/settings"
              ? t(lang, "settingsTitle")
              : t(lang, "appName");

  const title = props.title || props.sectionLabel || fallbackTitle;
  const settingsHref = `/settings?returnTo=${encodeURIComponent(pathname || "/")}`;

  const menuItems = [
    { href: "/", label: t(lang, "myListMenu"), icon: <MenuListIcon /> },
    { href: "/general-list", label: t(lang, "cartMenu"), icon: <MenuCartIcon /> },
    { href: "/in-store", label: t(lang, "shoppingMenu"), icon: <MenuBagIcon /> },
    { href: "/history", label: t(lang, "historyMenu"), icon: <MenuHistoryIcon /> },
    { href: settingsHref, label: t(lang, "settingsMenu"), icon: <MenuSettingsIcon /> },
  ];

  const footerActions = props.footerActions ?? [];

  return (
    <main style={shellStyle()}>
      <header
        style={{
          position: "relative",
          zIndex: 40,
          background: props.darkHero ? MC_NAVY : "#fff",
          color: props.darkHero ? "#fff" : MC_NAVY_TEXT,
          boxShadow: props.darkHero ? "0 6px 20px rgba(18,36,94,0.12)" : "none",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "calc(12px + env(safe-area-inset-top)) 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: MC_NAVY,
          }}
        >
          <div style={{ minWidth: 0, display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 15,
                background: "#fff",
                overflow: "hidden",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
            >
              <Image
                src="/mindercart-avatar.png"
                alt="MinderCart avatar"
                width={52}
                height={52}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                priority
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: s(19),
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                {t(lang, "appName")}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: s(12),
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {t(lang, "brandTagline")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              style={plainIconButtonStyle()}
              aria-label="Menu"
            >
              <span style={{ fontSize: s(27), lineHeight: 1 }}>☰</span>
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "12px 16px 14px",
            background: MC_NAVY,
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: s(21),
                  lineHeight: 1.08,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                {title}
              </div>

              {props.subtitle ? (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: s(14),
                    color: "rgba(255,255,255,0.92)",
                    textAlign: "left",
                  }}
                >
                  {props.subtitle}
                </div>
              ) : null}
            </div>

            {props.secondaryAction ? (
              <Link href={props.secondaryAction.href} style={actionButtonStyle()}>
                {props.secondaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <div style={{ display: "grid", gap: 18, padding: 16, paddingBottom: 18 }}>
          {menuOpen ? (
            <section
              style={{
                ...cardStyle(),
                padding: 12,
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      textDecoration: "none",
                      color: pathname === item.href ? "#fff" : MC_NAVY_TEXT,
                      background: pathname === item.href ? MC_NAVY : "#fff",
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: `1px solid ${pathname === item.href ? MC_NAVY : MC_NAVY_LINE}`,
                      fontWeight: 800,
                      fontSize: s(15),
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "currentColor",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    textAlign: "left",
                    color: MC_NAVY_TEXT,
                    background: MC_NAVY_SOFT,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: `1px solid ${MC_NAVY_LINE}`,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: s(15),
                  }}
                >
                  {t(lang, "menuBack")}
                </button>
              </div>
            </section>
          ) : (
            props.children
          )}
        </div>
      </div>

      {footerActions.length > 0 && !menuOpen ? (
        <footer
          style={{
            flexShrink: 0,
            padding: `10px 16px calc(${10 + 0}px + env(safe-area-inset-bottom) + ${props.footerInset ?? 0}px)`,
            borderTop: `1px solid ${MC_NAVY_LINE}`,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 -10px 28px rgba(18,36,94,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${footerActions.length}, minmax(0, 1fr))`,
              gap: 10,
            }}
          >
            {footerActions.map((action) => (
              <FooterActionButton
                key={`${action.label}_${action.href || "action"}`}
                action={action}
                fontSize={s(14)}
              />
            ))}
          </div>
        </footer>
      ) : null}
    </main>
  );
}
