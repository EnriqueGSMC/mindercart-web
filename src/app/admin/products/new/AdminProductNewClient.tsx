import * as React from "react";
import AdminProductNewClient from "./AdminProductNewClient";

export default function AdminProductNewPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <AdminProductNewClient />
    </React.Suspense>
  );
}