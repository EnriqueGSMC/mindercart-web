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

type BottomNavItem = {
  label: string;
  href: string;
  active: boolean;
  renderIcon: (active: boolean) => React.ReactNode;
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

function MyListNavIcon(props: { active: boolean }) {
  const color = props.active ? "#fff" : "rgba(255,255,255,0.78)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="3.5" width="12" height="17" rx="2.5" stroke={color} strokeWidth="1.9" />
      <path d="M9 7.5h6M9 11.5h6M9 15.5h4" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M9 3.5h6" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CartNavIcon(props: { active: boolean }) {
  const color = props.active ? "#fff" : "rgba(255,255,255,0.78)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5h1.4l1.7 8.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L18.2 8H7.2"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="18.5" r="1.4" fill={color} />
      <circle cx="16.5" cy="18.5" r="1.4" fill={color} />
    </svg>
  );
}

function ShoppingNavIcon(props: { active: boolean }) {
  const color = props.active ? "#fff" : "rgba(255,255,255,0.78)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8.5h10l-1 10a1.5 1.5 0 0 1-1.49 1.35h-5.02A1.5 1.5 0 0 1 8 18.5l-1-10Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M9.5 9V7a2.5 2.5 0 0 1 5 0v2" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function HistoryNavIcon(props: { active: boolean }) {
  const color = props.active ? "#fff" : "rgba(255,255,255,0.78)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 7.5V3.5M4.5 3.5h4M4.5 3.5l2.4 2.4" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 6.6a8 8 0 1 1-1.3 4.4" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M12 8.4v4.1l2.6 1.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsNavIcon(props: { active: boolean }) {
  const color = props.active ? "#fff" : "rgba(255,255,255,0.78)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 8.3a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Z"
        stroke={color}
        strokeWidth="1.9"
      />
      <path
        d="M19.1 13.5a7.9 7.9 0 0 0 .05-3l1.76-1.36-1.7-2.94-2.18.6a8.1 8.1 0 0 0-2.6-1.5L14.1 3h-3.4l-.34 2.35a8.1 8.1 0 0 0-2.6 1.5l-2.18-.6-1.7 2.94 1.76 1.36a7.9 7.9 0 0 0 .05 3L4.95 14.9l1.7 2.94 2.18-.6a8.1 8.1 0 0 0 2.6 1.5L10.7 21h3.4l.34-2.26a8.1 8.1 0 0 0 2.6-1.5l2.18.6 1.7-2.94-1.82-1.4Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function bottomNavItemStyle(active: boolean): React.CSSProperties {
  return {
    minWidth: 0,
    display: "grid",
    justifyItems: "center",
    gap: 4,
    padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
    textDecoration: "none",
    color: active ? "#fff" : "rgba(255,255,255,0.78)",
    fontWeight: active ? 900 : 700,
    fontSize: 11,
    lineHeight: 1.05,
    borderRadius: 14,
    background: active ? "rgba(255,255,255,0.08)" : "transparent",
  };
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

  const bottomNavItems: BottomNavItem[] = [
    {
      href: "/",
      label: t(lang, "myListMenu"),
      active: pathname === "/",
      renderIcon: (active) => <MyListNavIcon active={active} />,
    },
    {
      href: "/general-list",
      label: t(lang, "cartMenu"),
      active: pathname === "/general-list" || pathname === "/shopping-list",
      renderIcon: (active) => <CartNavIcon active={active} />,
    },
    {
      href: "/in-store",
      label: t(lang, "shoppingMenu"),
      active: pathname === "/in-store",
      renderIcon: (active) => <ShoppingNavIcon active={active} />,
    },
    {
      href: "/history",
      label: t(lang, "historyMenu"),
      active: pathname === "/history",
      renderIcon: (active) => <HistoryNavIcon active={active} />,
    },
    {
      href: "/settings",
      label: t(lang, "settingsMenu"),
      active: pathname === "/settings",
      renderIcon: (active) => <SettingsNavIcon active={active} />,
    },
  ];

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
        <div style={{ display: "grid", gap: 18, padding: 16, paddingBottom: 104 }}>
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

      <footer
        style={{
          position: "fixed",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: "min(100vw, 860px)",
          padding: "8px 10px 0",
          background: MC_NAVY,
          borderTop: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 -12px 28px rgba(18,36,94,0.24)",
          zIndex: 60,
        }}
      >
        <nav
          aria-label="Primary navigation"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 6,
            alignItems: "end",
          }}
        >
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={bottomNavItemStyle(item.active)}
              aria-current={item.active ? "page" : undefined}
            >
              {item.renderIcon(item.active)}
              <span
                style={{
                  display: "block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}
