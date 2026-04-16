// FILE: src/app/deliveries/page.tsx
import * as React from "react";
import DeliveriesClient from "./DeliveriesClient";

export default function DeliveriesPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <DeliveriesClient />
    </React.Suspense>
  );
}