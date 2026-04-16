/* =========================================================
 * FILE: src/components/DebugOnly.tsx
 * ========================================================= */
"use client";

import * as React from "react";

const SHOW_ORDER_DEBUG = process.env.NEXT_PUBLIC_SHOW_ORDER_DEBUG === "1";

export function DebugOnly({ children }: { children: React.ReactNode }) {
  if (!SHOW_ORDER_DEBUG) return null;
  return <>{children}</>;
}