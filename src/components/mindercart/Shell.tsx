"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { t } from "@/lib/mindercart/i18n";
import { useMinderCartState } from "@/lib/mindercart/hooks";

function navLinkStyle(active = false): React.CSSProperties {
  return {
    flex: 1,
    minWidth: 120,
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    textDecoration: "none",
    fontWeight: 900,
  };
}

export function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid #eee",
    borderRadius: 18,
    padding: 14,
    background: "#fff",
    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
  };
}

export function shellStyle(): React.CSSProperties {
  return {
    maxWidth: 860,
    margin: "0 auto",
    padding: 14,
    paddingBottom: 120,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#111",
  };
}

export function AppShell(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings } = useMinderCartState();
  const lang = settings.language;

  const navItems = [
    { href: "/", label: t(lang, "navNeeds") },
    { href: "/general-list", label: t(lang, "navCart") },
    { href: "/in-store", label: t(lang, "navShopping") },
    { href: "/history", label: t(lang, "navHistory") },
    { href: "/settings", label: t(lang, "navSettings") },
  ];

  return (
    <main style={shellStyle()}>
      <div style={{ display: "grid", gap: 14 }}>
        <header style={cardStyle()}>
          <div style={{ fontSize: 26, fontWeight: 1000 }}>{props.title}</div>
          {props.subtitle ? (
            <div style={{ marginTop: 6, opacity: 0.75 }}>{props.subtitle}</div>
          ) : null}
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={navLinkStyle(pathname === item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {props.children}
      </div>
    </main>
  );
}
