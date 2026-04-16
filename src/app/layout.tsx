// ============================================================================
// FILE: src/app/layout.tsx
// Reemplaza este archivo tal cual.
// ============================================================================
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}