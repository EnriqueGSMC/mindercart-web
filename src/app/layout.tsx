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
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Mi Lista",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M3 4h2l1.2 6.2A2 2 0 0 0 8.16 12H18a2 2 0 0 0 1.94-1.53L21 6H7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="19" r="1.75" fill="currentColor" />
        <circle cx="17" cy="19" r="1.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/general-list",
    label: "Carrito",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M3 4h2l1.2 6.2A2 2 0 0 0 8.16 12H18a2 2 0 0 0 1.94-1.53L21 6H7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="19" r="1.75" fill="currentColor" />
        <circle cx="17" cy="19" r="1.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/in-store",
    label: "De Compras",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M6 4v3m12-3v3M5 9h14m-9 4h4m-4 4h6M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Historial",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M3 12a9 9 0 1 0 3-6.71M3 4v5h5m4-5v6l4 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Configuración",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.7 1.7 0 1 1-3.4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.7 1.7 0 1 1 0-3.4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.7 1.7 0 1 1 3.4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1.7 1.7 0 1 1 0 3.4h-.2a1 1 0 0 0-.9.6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        background: "var(--cc-primary)",
        borderTop: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 -12px 30px rgba(18,36,94,0.18)",
        padding: "8px 10px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            data-nav-link="true"
            data-href={item.href}
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 4px",
              borderRadius: 16,
              color: "rgba(255,255,255,0.74)",
              transition: "background .18s ease, color .18s ease, transform .18s ease",
            }}
          >
            <span style={{ display: "inline-flex", lineHeight: 0 }}>{item.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.01em",
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                var path = window.location.pathname || "/";
                var links = document.querySelectorAll('[data-nav-link="true"]');
                links.forEach(function (link) {
                  var href = link.getAttribute('data-href') || '/';
                  var isActive = href === '/' ? path === '/' : path === href || path.indexOf(href + '/') === 0;
                  if (isActive) {
                    link.style.color = '#ffffff';
                    link.style.background = 'rgba(255,255,255,0.14)';
                    link.style.transform = 'translateY(-1px)';
                  } else {
                    link.style.color = 'rgba(255,255,255,0.74)';
                    link.style.background = 'transparent';
                    link.style.transform = 'none';
                  }
                });
              } catch (error) {}
            })();
          `,
        }}
      />
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            paddingBottom: "calc(84px + env(safe-area-inset-bottom))",
            background: "var(--cc-bg)",
          }}
        >
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
