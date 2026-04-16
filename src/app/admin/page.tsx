// FILE: src/app/admin/page.tsx
import * as React from "react";

import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <AdminClient />
    </React.Suspense>
  );
}