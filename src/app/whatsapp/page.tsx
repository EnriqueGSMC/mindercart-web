// FILE: src/app/whatsapp/page.tsx
import * as React from "react";
import WhatsAppClient from "./WhatsAppClient";

export default function WhatsAppPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Cargando…</div>}>
      <WhatsAppClient />
    </React.Suspense>
  );
}