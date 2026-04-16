// FILE: src/app/deliveries/page.tsx
import * as React from "react";
import DeliveriesClient from "./DeliveriesClient";

// Prevent prerender issues for auth-gated pages (optional but safe)
export const dynamic = "force-dynamic";

export default function DeliveriesPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <DeliveriesClient />
    </React.Suspense>
  );
}
