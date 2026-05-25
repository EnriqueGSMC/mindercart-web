/* FILE: src/app/layout.tsx */
import type { Metadata } from "next";
import Script from "next/script";
import React from "react";
import { AuthProvider } from "@/lib/firebase/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compras",
  description: "Control de compras",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NavItem = {
  href: string;
  labelEs: string;
  labelEn: string;
  match: string[];
  icon: React.ReactNode;
};

const iconStyle = {
  width: 23,
  height: 23,
  stroke: "currentColor",
  strokeWidth: 2,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CartFooterIcon() {
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


const navItems: NavItem[] = [
  {
    href: "/",
    labelEs: "Mi Lista",
    labelEn: "My List",
    match: ["/"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M9 4.75h6" />
        <path d="M9.25 3.5h5.5A1.25 1.25 0 0 1 16 4.75v.75h.75A2.25 2.25 0 0 1 19 7.75v10A2.25 2.25 0 0 1 16.75 20h-9.5A2.25 2.25 0 0 1 5 17.75v-10A2.25 2.25 0 0 1 7.25 5.5H8v-.75A1.25 1.25 0 0 1 9.25 3.5Z" />
        <path d="m8.75 10 1.2 1.2 2.15-2.15" />
        <path d="m8.75 14 1.2 1.2 2.15-2.15" />
        <path d="M13.5 10.5h2.25" />
        <path d="M13.5 14.5h2.25" />
      </svg>
    ),
  },
  {
    href: "/general-list",
    labelEs: "Carrito",
    labelEn: "Cart",
    match: ["/general-list", "/shopping-list"],
    icon: <CartFooterIcon />,
  },
  {
    href: "/in-store",
    labelEs: "De Compras",
    labelEn: "Shopping",
    match: ["/in-store"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M8 8V7a4 4 0 1 1 8 0v1" />
        <path d="M6 8.5h12l-1 10H7L6 8.5Z" />
      </svg>
    ),
  },
  {
    href: "/history",
    labelEs: "Historial",
    labelEn: "History",
    match: ["/history"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M4 12a8 8 0 1 0 2.35-5.65" />
        <path d="M4 5v4h4" />
        <path d="M12 8v4l2.75 2.75" />
      </svg>
    ),
  },
  {
    href: "/settings",
    labelEs: "Configuración",
    labelEn: "Settings",
    match: ["/settings"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M10.05 3.6a1 1 0 0 1 1-.85h1.9a1 1 0 0 1 1 .85l.25 1.65c.6.16 1.17.4 1.7.7l1.36-.98a1 1 0 0 1 1.29.1l1.35 1.35a1 1 0 0 1 .1 1.29l-.98 1.36c.3.53.54 1.1.7 1.7l1.65.25a1 1 0 0 1 .85 1v1.9a1 1 0 0 1-.85 1l-1.65.25c-.16.6-.4 1.17-.7 1.7l.98 1.36a1 1 0 0 1-.1 1.29l-1.35 1.35a1 1 0 0 1-1.29.1l-1.36-.98c-.53.3-1.1.54-1.7.7l-.25 1.65a1 1 0 0 1-1 .85h-1.9a1 1 0 0 1-1-.85l-.25-1.65a7.9 7.9 0 0 1-1.7-.7l-1.36.98a1 1 0 0 1-1.29-.1L3.8 18.2a1 1 0 0 1-.1-1.29l.98-1.36a7.9 7.9 0 0 1-.7-1.7l-1.65-.25a1 1 0 0 1-.85-1v-1.9a1 1 0 0 1 .85-1l1.65-.25c.16-.6.4-1.17.7-1.7L3.7 7.19a1 1 0 0 1 .1-1.29L5.15 4.55a1 1 0 0 1 1.29-.1l1.36.98c.53-.3 1.1-.54 1.7-.7l.25-1.65Z" />
        <circle cx="12" cy="12" r="3.1" />
      </svg>
    ),
  },
];

function BottomNavigation() {
  return (
    <>
      <style>{`
        .mc-bottom-nav {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: #12245e;
          border-top: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 -8px 18px rgba(6, 13, 36, 0.16);
          padding: 8px 10px max(12px, env(safe-area-inset-bottom));
        }

        .mc-bottom-nav__grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 4px;
          max-width: 980px;
          margin: 0 auto;
        }

        .mc-bottom-nav__item {
          position: relative;
          min-height: 62px;
          width: 100%;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6px 6px 8px;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
          transition: color .15s ease, transform .15s ease;
          overflow: visible;
        }

        .mc-bottom-nav__item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          border-radius: 999px;
          background: #ffffff;
          opacity: 0;
          z-index: 2;
          transition: width .15s ease, opacity .15s ease;
        }

        .mc-bottom-nav__item:hover {
          transform: translateY(-1px);
        }

        .mc-bottom-nav__item.is-active {
          color: #ffffff;
        }

        .mc-bottom-nav__item.is-active::before {
          width: 26px;
          opacity: 1;
        }

        .mc-bottom-nav__inner {
          position: relative;
          z-index: 1;
          display: grid;
          width: 100%;
          justify-items: center;
          align-content: start;
          gap: 4px;
          transform: translateY(-1px);
          pointer-events: none;
        }

        .mc-bottom-nav__icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: currentColor;
          min-height: 27px;
          min-width: 30px;
          pointer-events: none;
        }

        .mc-bottom-nav__icon--cart {
          min-width: 34px;
        }

        .mc-bottom-nav__cart-count {
          position: absolute;
          top: -5px;
          right: -9px;
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.26);
          font-size: 12px;
          line-height: 1;
          font-weight: 800;
          color: #ffffff;
          opacity: 0;
          transform: scale(.92);
          transition: opacity .15s ease, transform .15s ease;
          pointer-events: none;
        }

        .mc-bottom-nav__cart-count.has-count {
          opacity: 1;
          transform: scale(1);
        }

        .mc-bottom-nav__item.is-active .mc-bottom-nav__cart-count {
          background: rgba(255, 255, 255, 0.24);
          border-color: rgba(255, 255, 255, 0.38);
        }

        .mc-bottom-nav__label {
          font-size: 10.5px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: currentColor;
          white-space: nowrap;
          pointer-events: none;
        }

        .mc-bottom-nav__item svg {
          pointer-events: none;
        }

        .mc-app-frame {
          min-height: 100dvh;
          padding-bottom: calc(78px + env(safe-area-inset-bottom));
        }

        @media (max-width: 430px) {
          .mc-bottom-nav {
            padding: 9px 8px max(14px, env(safe-area-inset-bottom));
          }
          .mc-bottom-nav__grid {
            gap: 3px;
          }
          .mc-bottom-nav__item {
            min-height: 64px;
            padding: 6px 2px 8px;
          }
          .mc-bottom-nav__inner {
            gap: 3px;
            transform: translateY(-2px);
          }
          .mc-bottom-nav__cart-count {
            top: -4px;
            right: -8px;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 11px;
          }
          .mc-bottom-nav__label {
            font-size: 10px;
          }
        }
      `}</style>

      <nav className="mc-bottom-nav" aria-label="Navegación principal">
        <div className="mc-bottom-nav__grid">
          {navItems.map((item) => {
            const isCartItem = item.href === "/general-list";

            return (
              <a
                key={item.href}
                href={item.href}
                className="mc-bottom-nav__item"
                data-nav-href={item.href}
                data-nav-match={item.match.join("|")}
                data-label-es={item.labelEs}
                data-label-en={item.labelEn}
              >
                <span className="mc-bottom-nav__inner">
                  <span
                    className={
                      isCartItem ? "mc-bottom-nav__icon mc-bottom-nav__icon--cart" : "mc-bottom-nav__icon"
                    }
                  >
                    {item.icon}
                    {isCartItem ? (
                      <span className="mc-bottom-nav__cart-count" data-cart-count aria-hidden="true">
                        0
                      </span>
                    ) : null}
                  </span>
                  <span className="mc-bottom-nav__label">{item.labelEs}</span>
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      <Script id="mc-bottom-nav-sync" strategy="afterInteractive">{`

            (function () {
              var STORAGE_KEY = "mindercart_state_v15";
              var CHANGE_EVENT = "mindercart:changed";
              var scheduled = false;
              var observer = null;

              function getLanguage() {
                try {
                  var raw = window.localStorage.getItem(STORAGE_KEY);
                  if (!raw) return "es";
                  var parsed = JSON.parse(raw);
                  return parsed && parsed.settings && parsed.settings.language === "en" ? "en" : "es";
                } catch (error) {
                  return "es";
                }
              }

              function getMyListCount() {
                try {
                  var raw = window.localStorage.getItem(STORAGE_KEY);
                  if (!raw) return 0;
                  var parsed = JSON.parse(raw);
                  var items = parsed && Array.isArray(parsed.activeShoppingListItems)
                    ? parsed.activeShoppingListItems
                    : [];
                  return items.length;
                } catch (error) {
                  return 0;
                }
              }

              function syncFooterLanguage() {
                var lang = getLanguage();
                var items = document.querySelectorAll(".mc-bottom-nav__item");
                items.forEach(function (node) {
                  var labelNode = node.querySelector(".mc-bottom-nav__label");
                  if (!labelNode) return;
                  var nextLabel = lang === "en"
                    ? node.getAttribute("data-label-en")
                    : node.getAttribute("data-label-es");
                  if (nextLabel) {
                    labelNode.textContent = nextLabel;
                  }
                });
              }

              function syncFooterCartCount() {
                var count = getMyListCount();
                var countNode = document.querySelector("[data-cart-count]");
                if (!countNode) return;
                countNode.textContent = String(count);
                if (count > 0) {
                  countNode.classList.add("has-count");
                } else {
                  countNode.classList.remove("has-count");
                }
              }

              function syncActivePath() {
                var path = window.location.pathname || "/";
                var items = document.querySelectorAll("[data-nav-match]");
                items.forEach(function (node) {
                  var matches = (node.getAttribute("data-nav-match") || "").split("|").filter(Boolean);
                  var active = matches.some(function (value) {
                    return value === "/" ? path === "/" : path === value || path.indexOf(value + "/") === 0;
                  });
                  node.classList.toggle("is-active", active);
                  if (active) {
                    node.setAttribute("aria-current", "page");
                  } else {
                    node.removeAttribute("aria-current");
                  }
                });
              }

              function syncFooterNow() {
                scheduled = false;
                syncFooterLanguage();
                syncFooterCartCount();
                syncActivePath();
              }

              function scheduleSync() {
                if (scheduled) return;
                scheduled = true;
                window.requestAnimationFrame(syncFooterNow);
              }

              function installObserver() {
                if (observer) return;
                observer = new MutationObserver(function () {
                  scheduleSync();
                });
                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ["class"]
                });
              }

              scheduleSync();
              setTimeout(scheduleSync, 0);
              setTimeout(scheduleSync, 120);
              setTimeout(scheduleSync, 360);
              installObserver();

              window.addEventListener("storage", scheduleSync);
              window.addEventListener(CHANGE_EVENT, scheduleSync);
              window.addEventListener("popstate", scheduleSync);
              window.addEventListener("hashchange", scheduleSync);
              window.addEventListener("pageshow", scheduleSync);
              document.addEventListener("visibilitychange", scheduleSync);

              document.addEventListener("click", function (event) {
                var target = event.target;
                if (!target || !target.closest) return;
                if (target.closest(".mc-bottom-nav__item")) {
                  setTimeout(scheduleSync, 0);
                  setTimeout(scheduleSync, 120);
                }
              }, true);
            })();
          
        `}</Script>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="mc-app-frame">{children}</div>
          <BottomNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
