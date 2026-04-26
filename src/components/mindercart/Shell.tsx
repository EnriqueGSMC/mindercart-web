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

function CartIcon(props: { active?: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5h1.4l1.7 8.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L18.2 8H7.2"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "1.9"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="18.5" r="1.4" fill="currentColor" />
      <circle cx="16.5" cy="18.5" r="1.4" fill="currentColor" />
    </svg>
  );
}


function MyListIcon(props: { active?: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7h10M8 12h10M8 17h10M4.8 7h.01M4.8 12h.01M4.8 17h.01"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoreIcon(props: { active?: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 5.6 5h12.8L20 10.5M5 10.5h14v8.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 14h6"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HistoryIcon(props: { active?: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.8 12a8.2 8.2 0 1 0 2.4-5.8M3.8 4.8v4h4"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v4.2l2.8 1.8"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon(props: { active?: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
      />
      <path
        d="M19.4 13.1a1.2 1.2 0 0 0 .24 1.32l.04.04a1.45 1.45 0 0 1-2.05 2.05l-.04-.04a1.2 1.2 0 0 0-1.32-.24 1.2 1.2 0 0 0-.72 1.1V17.5a1.45 1.45 0 0 1-2.9 0v-.06a1.2 1.2 0 0 0-.78-1.13 1.2 1.2 0 0 0-1.3.27l-.04.04a1.45 1.45 0 1 1-2.05-2.05l.04-.04a1.2 1.2 0 0 0 .24-1.32 1.2 1.2 0 0 0-1.1-.72H6.5a1.45 1.45 0 0 1 0-2.9h.06a1.2 1.2 0 0 0 1.13-.78 1.2 1.2 0 0 0-.27-1.3l-.04-.04a1.45 1.45 0 1 1 2.05-2.05l.04.04a1.2 1.2 0 0 0 1.32.24 1.2 1.2 0 0 0 .72-1.1V6.5a1.45 1.45 0 0 1 2.9 0v.06a1.2 1.2 0 0 0 .78 1.13 1.2 1.2 0 0 0 1.3-.27l.04-.04a1.45 1.45 0 1 1 2.05 2.05l-.04.04a1.2 1.2 0 0 0-.24 1.32 1.2 1.2 0 0 0 1.1.72h.06a1.45 1.45 0 0 1 0 2.9h-.06a1.2 1.2 0 0 0-1.13.78Z"
        stroke="currentColor"
        strokeWidth={props.active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

export function QtyUnitText(props: { quantity: string; unit: string }) {
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const update = () => setCompact(window.innerWidth <= 390);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return <>{props.quantity}{compact ? "" : ` ${props.unit}`}</>;
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
  footerActions?: FooterAction[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeShoppingListItems, settings } = useMinderCartState();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(searchParams.get("menu") === "1");
  }, [searchParams]);

  const cartCount = activeShoppingListItems.length;
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
    { href: "/", label: t(lang, "myListMenu") },
    { href: "/general-list", label: t(lang, "cartMenu") },
    { href: "/in-store", label: t(lang, "shoppingMenu") },
    { href: "/history", label: t(lang, "historyMenu") },
    { href: settingsHref, label: t(lang, "settingsMenu") },
  ];

  const bottomNavItems = [
    { href: "/", label: t(lang, "myListMenu"), icon: MyListIcon },
    { href: "/general-list", label: t(lang, "cartMenu"), icon: CartIcon },
    { href: "/in-store", label: t(lang, "shoppingMenu"), icon: StoreIcon },
    { href: "/history", label: t(lang, "historyMenu"), icon: HistoryIcon },
    { href: "/settings", label: t(lang, "settingsMenu"), icon: SettingsIcon },
  ] as const;

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
            {props.secondaryAction ? (
              <Link href={props.secondaryAction.href} style={actionButtonStyle()}>
                {props.secondaryAction.label}
              </Link>
            ) : null}

            {showCart ? (
              <Link href="/general-list" style={cartIconStyle()} aria-label="Cart">
                <CartIcon />
                {cartCount > 0 ? (
                  <span
                    style={{
                      color: "#fff",
                      fontSize: s(13),
                      fontWeight: 800,
                      lineHeight: 1,
                      marginLeft: -1,
                    }}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

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
        <div style={{ display: "grid", gap: 18, padding: 16, paddingBottom: "calc(104px + env(safe-area-inset-bottom))" }}>
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
                    }}
                  >
                    {item.label}
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

      <nav
        aria-label="Primary"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 860,
          zIndex: 60,
          padding: "8px 10px calc(10px + env(safe-area-inset-bottom))",
          background: MC_NAVY,
          borderTop: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 -12px 28px rgba(18,36,94,0.24)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 4,
            alignItems: "stretch",
          }}
        >
          {bottomNavItems.map((item) => {
            const active = item.href === "/settings" ? pathname === "/settings" : pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "8px 4px 6px",
                  borderRadius: 14,
                  color: active ? "#fff" : "rgba(255,255,255,0.72)",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  textDecoration: "none",
                  fontWeight: active ? 900 : 800,
                  boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.12)" : "none",
                }}
                aria-current={active ? "page" : undefined}
              >
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                  <Icon active={active} />
                </div>
                <span
                  style={{
                    fontSize: s(11),
                    lineHeight: 1.05,
                    textAlign: "center",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </main>
  );
}
