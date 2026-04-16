import * as React from "react";
import ScanClient from "./ScanClient";

export default function Page() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <ScanClient />
    </React.Suspense>
  );
}
