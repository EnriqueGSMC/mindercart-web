/* FILE: src/app/layout.tsx */
import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compras",
  description: "Control de compras",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NavItem = {
  href: string;
  label: string;
  match: string[];
  icon: React.ReactNode;
};

const iconStyle = {
  width: 30,
  height: 30,
  stroke: "currentColor",
  strokeWidth: 2.2,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Mi Lista",
    match: ["/"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M9 4.75h6" />
        <path d="M9.5 3.5h5a1.5 1.5 0 0 1 1.5 1.5v.5h1a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2h1V5A1.5 1.5 0 0 1 9.5 3.5Z" />
        <path d="m9 10 1.2 1.2L12.6 8.8" />
        <path d="m9 14 1.2 1.2 2.4-2.4" />
        <path d="M14.5 10.5H17" />
        <path d="M14.5 14.5H17" />
      </svg>
    ),
  },
  {
    href: "/general-list",
    label: "Carrito",
    match: ["/general-list", "/shopping-list"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <circle cx="9" cy="19" r="1.25" />
        <circle cx="17" cy="19" r="1.25" />
        <path d="M3.5 5.5h2.2l1.9 8h9.1l1.9-6.3H7.2" />
        <path d="M8.5 17.5h8.2" />
      </svg>
    ),
  },
  {
    href: "/in-store",
    label: "De Compras",
    match: ["/in-store"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M8 8V7a4 4 0 1 1 8 0v1" />
        <path d="M6 8.5h12l-1.1 10H7.1L6 8.5Z" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Historial",
    match: ["/history"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M4 12a8 8 0 1 0 2.3-5.7" />
        <path d="M4 5v4h4" />
        <path d="M12 8v4l2.7 2.7" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Configuración",
    match: ["/settings"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M10.05 3.6a1 1 0 0 1 1-.85h1.9a1 1 0 0 1 1 .85l.24 1.63a7.9 7.9 0 0 1 1.78.74l1.34-.96a1 1 0 0 1 1.3.1l1.34 1.34a1 1 0 0 1 .1 1.3l-.96 1.34c.3.57.55 1.16.73 1.79l1.64.23a1 1 0 0 1 .85 1v1.9a1 1 0 0 1-.85 1l-1.64.24a7.8 7.8 0 0 1-.73 1.78l.96 1.34a1 1 0 0 1-.1 1.3l-1.34 1.34a1 1 0 0 1-1.3.1l-1.34-.96c-.57.3-1.16.55-1.78.73l-.24 1.64a1 1 0 0 1-1 .85h-1.9a1 1 0 0 1-1-.85l-.24-1.64a7.8 7.8 0 0 1-1.78-.73l-1.34.96a1 1 0 0 1-1.3-.1L3.8 18.9a1 1 0 0 1-.1-1.3l.96-1.34a7.8 7.8 0 0 1-.73-1.78l-1.64-.24a1 1 0 0 1-.85-1v-1.9a1 1 0 0 1 .85-1l1.64-.23c.18-.63.43-1.22.73-1.79L3.7 7a1 1 0 0 1 .1-1.3l1.34-1.34a1 1 0 0 1 1.3-.1l1.34.96c.56-.3 1.15-.55 1.78-.74l.24-1.63Z" />
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
          padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
          box-shadow: 0 -12px 28px rgba(8, 18, 49, 0.22);
        }
        .mc-bottom-nav__grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          max-width: 980px;
          margin: 0 auto;
        }
        .mc-bottom-nav__item {
          min-height: 82px;
          border-radius: 16px;
          background: #1d367b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 9px 5px 10px;
          box-shadow:
            0 10px 20px rgba(5, 13, 39, 0.30),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }
        .mc-bottom-nav__item:hover {
          transform: translateY(-1px);
        }
        .mc-bottom-nav__item.is-active {
          background: #29499b;
          box-shadow:
            0 12px 24px rgba(5, 13, 39, 0.34),
            inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .mc-bottom-nav__inner {
          display: grid;
          justify-items: center;
          gap: 7px;
        }
        .mc-bottom-nav__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .mc-bottom-nav__label {
          font-size: 11px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #ffffff;
          white-space: nowrap;
        }
        .mc-app-frame {
          min-height: 100dvh;
          padding-bottom: calc(108px + env(safe-area-inset-bottom));
        }
        @media (max-width: 430px) {
          .mc-bottom-nav { padding-left: 8px; padding-right: 8px; }
          .mc-bottom-nav__grid { gap: 6px; }
          .mc-bottom-nav__item {
            min-height: 76px;
            border-radius: 14px;
            padding: 8px 4px 9px;
          }
          .mc-bottom-nav__label {
            font-size: 10px;
          }
        }
      `}</style>

      <nav className="mc-bottom-nav" aria-label="Navegación principal">
        <div className="mc-bottom-nav__grid">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mc-bottom-nav__item"
              data-nav-href={item.href}
              data-nav-match={item.match.join("|")}
            >
              <span className="mc-bottom-nav__inner">
                <span className="mc-bottom-nav__icon">{item.icon}</span>
                <span className="mc-bottom-nav__label">{item.label}</span>
              </span>
            </a>
          ))}
        </div>
      </nav>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var path = window.location.pathname || "/";
              var items = document.querySelectorAll("[data-nav-match]");
              items.forEach(function (node) {
                var matches = (node.getAttribute("data-nav-match") || "").split("|").filter(Boolean);
                var active = matches.some(function (value) {
                  return value === "/" ? path === "/" : path === value || path.indexOf(value + "/") === 0;
                });
                if (active) {
                  node.classList.add("is-active");
                } else {
                  node.classList.remove("is-active");
                }
              });
            })();
          `,
        }}
      />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="mc-app-frame">{children}</div>
        <BottomNavigation />
      </body>
    </html>
  );
}
