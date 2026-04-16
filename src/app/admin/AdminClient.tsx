// FILE: src/app/admin/AdminClient.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

// ✅ Pega aquí el contenido actual de tu /admin/page.tsx que usa useSearchParams()
export default function AdminClient() {
  const sp = useSearchParams();

  // ...tu código actual...
  return <div>{/* ... */}</div>;
}