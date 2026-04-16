// FILE: src/app/needs/page.tsx
import * as React from "react";
import NeedsClient from "./NeedsClient";

export default function NeedsPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <NeedsClient />
    </React.Suspense>
  );
}