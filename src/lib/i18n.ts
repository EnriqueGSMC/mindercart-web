import type { Lang } from "@/components/LangProvider";

// Helper: acepta string o {es,en}
export function tt(lang: Lang, v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return String(v[lang] ?? v.es ?? v.en ?? "");
  return String(v);
}