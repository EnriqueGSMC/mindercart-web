// ================================
// FILE: src/app/purchases/page.tsx
// (reemplázalo completo por este)
// ================================
import type { ComponentType } from "react";
import type { SearchParams } from "@/lib/modes";
import { resolvePurchasesMode } from "@/lib/modes";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const mode = resolvePurchasesMode(sp);

  const mod =
    mode === "experimental"
      ? await import("./page.experimental")
      : await import("./page.frozen");

  const Component = mod.default as ComponentType;
  return <Component />;
}