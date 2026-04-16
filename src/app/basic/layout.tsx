// FILE: src/app/basic/layout.tsx
import React from "react";
import Link from "next/link";

export default function BasicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>BASIC</div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/basic/recibir" className="action-link">Compras / Recibir</Link>
        </nav>
      </header>

      <div className="hr" style={{ margin: "14px 0" }} />
      {children}
    </div>
  );
}

