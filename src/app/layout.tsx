// ============================================================================
// FILE: src/app/layout.tsx
// TRACE PATCH V51
// ============================================================================
import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compras",
  description: "Control de compras",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            background: "#b91c1c",
            color: "#ffffff",
            fontWeight: 900,
            textAlign: "center",
            padding: "10px 12px",
            letterSpacing: "0.04em",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          TRACE LAYOUT V51
        </div>
        <div style={{ paddingTop: 44 }}>{children}</div>
      </body>
    </html>
  );
}
