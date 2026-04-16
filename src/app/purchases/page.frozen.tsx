// FILE: src/app/purchases/page.frozen.tsx
"use client";

// FROZEN = alias estable hacia experimental para que el build no se rompa.
// No cambia el flujo real (tú usas NEXT_PUBLIC_PURCHASES_MODE=experimental).
export { default } from "./page.experimental";