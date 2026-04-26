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
  width: 28,
  height: 28,
  stroke: "currentColor",
  strokeWidth: 2.4,
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
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 4.5h6" />
        <path d="M9 9h1.5" />
        <path d="M9 13h1.5" />
        <path d="M9 17h1.5" />
        <path d="M12 9h3" />
        <path d="M12 13h3" />
        <path d="M12 17h3" />
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
        <path d="M4 5h2l2.2 9h8.8l2-7H7.2" />
      </svg>
    ),
  },
  {
    href: "/in-store",
    label: "De Compras",
    match: ["/in-store"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <path d="M7 8V6a5 5 0 0 1 10 0v2" />
        <path d="M5.5 8h13l-1 11h-11z" />
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
        <path d="M12 8v4l2.5 2.5" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Configuración",
    match: ["/settings"],
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
        <circle cx="12" cy="12" r="3.25" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0L4.4 18a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3.6a1 1 0 0 1-1-1v-1.6a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4L5.6 4a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V3.2a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0L19.6 5a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.8.7 1 1 0 0 0 0 1.1z" />
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
          box-shadow: 0 -10px 28px rgba(9, 22, 61, 0.18);
          padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
        }
        .mc-bottom-nav__grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          max-width: 980px;
          margin: 0 auto;
        }
        .mc-bottom-nav__item {
          min-height: 78px;
          border-radius: 14px;
          background: #ffffff;
          color: #2b4fb8;
          box-shadow: 0 8px 20px rgba(8, 18, 49, 0.18);
          border: 1px solid rgba(215, 223, 245, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 8px 6px 9px;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }
        .mc-bottom-nav__inner {
          display: grid;
          justify-items: center;
          gap: 6px;
        }
        .mc-bottom-nav__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2b4fb8;
        }
        .mc-bottom-nav__label {
          font-size: 11px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #12245e;
          white-space: nowrap;
        }
        .mc-bottom-nav__item:hover {
          transform: translateY(-1px);
        }
        .mc-bottom-nav__item.is-active {
          background: #eaf0ff;
          box-shadow: 0 10px 24px rgba(8, 18, 49, 0.22);
        }
        .mc-app-frame {
          min-height: 100dvh;
          padding-bottom: calc(102px + env(safe-area-inset-bottom));
        }
        @media (max-width: 430px) {
          .mc-bottom-nav__grid { gap: 6px; }
          .mc-bottom-nav__item { min-height: 74px; border-radius: 12px; padding: 7px 4px 8px; }
          .mc-bottom-nav__label { font-size: 10px; }
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
