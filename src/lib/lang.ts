// FILE: src/lib/lang.ts
export type Lang = "es" | "en";

const KEY = "lang";

// Diccionario mínimo para las keys que aparecen en src/app/needs/page.tsx
const ES: Record<string, string> = {
  needs: "Necesidades",
  deliveries: "Entregas",
  logout: "Logout",
  newNeed: "Nueva necesidad",
  searchArticle: "Buscar artículo",
  searching: "Buscando…",
  qty: "Cant.",
  unit: "Unidad",
  barcode: "Código de barras",
  noteOptional: "Nota (opcional)",
  addNeed: "Agregar necesidad",
  pending: "Pendientes",
  noResults: "Sin resultados",
  note: "Nota",
  delete: "Eliminar",
  confirmDeleteTitle: "Confirmar eliminación",
  back: "Regresar",
  yesDelete: "Sí, eliminar",
  cancel: "Cancelar",
  quickAdd: "Alta rápida",
  name: "Nombre",
  supplier: "Proveedor",
  noSupplier: "Sin proveedor",
  category: "Categoría",
  noCategory: "Sin categoría",
  creating: "Creando…",
  create: "Crear",
};

const EN: Record<string, string> = {
  needs: "Needs",
  deliveries: "Deliveries",
  logout: "Logout",
  newNeed: "New need",
  searchArticle: "Search item",
  searching: "Searching…",
  qty: "Qty",
  unit: "Unit",
  barcode: "Barcode",
  noteOptional: "Note (optional)",
  addNeed: "Add need",
  pending: "Pending",
  noResults: "No results",
  note: "Note",
  delete: "Delete",
  confirmDeleteTitle: "Confirm delete",
  back: "Back",
  yesDelete: "Yes, delete",
  cancel: "Cancel",
  quickAdd: "Quick add",
  name: "Name",
  supplier: "Supplier",
  noSupplier: "No supplier",
  category: "Category",
  noCategory: "No category",
  creating: "Creating…",
  create: "Create",
};

export function getLang(): Lang {
  if (typeof window === "undefined") return "es";
  const v = (localStorage.getItem(KEY) || "es").toLowerCase();
  return v === "en" ? "en" : "es";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, lang);
}

// Overloads:
// 1) Key-based: t(lang, "needs")
// 2) Direct strings: t(lang, "Nombre requerido", "Name required")
export function t(lang: Lang, key: string): string;
export function t(lang: Lang, esText: string, enText: string): string;
export function t(lang: Lang, a: string, b?: string): string {
  // Direct ES/EN string mode
  if (typeof b === "string") return lang === "en" ? b : a;

  // Dictionary key mode
  const dict = lang === "en" ? EN : ES;
  return dict[a] ?? a; // fallback: devuelve la key si no existe
}

export function toggleLang(): Lang {
  const next: Lang = getLang() === "en" ? "es" : "en";
  setLang(next);
  return next;
}








