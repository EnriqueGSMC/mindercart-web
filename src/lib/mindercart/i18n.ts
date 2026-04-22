export type AppLanguage = "es" | "en";

const messages = {
  es: {
    appName: "MinderCart",
    brandTagline: "Nunca olvides qué comprar",
    myListTitle: "Mi Lista",
    myListSubtitle: "Agrega artículos a tu lista de compras",
    cartTitle: "Carrito",
    cartSubtitle: "Revisa y completa tu lista de compras",
    shoppingTitle: "De Compras",
    shoppingSubtitle: "Organiza y realiza tus compras por tienda",
    historyTitle: "Historial",
    historySubtitle: "Compras realizadas por tienda",
    settingsTitle: "Configuración",
    settingsSubtitle: "Idioma, tienda y tamaño de letra",
    item: "Artículo",
    cartSection: "Carrito",
    noItemsYet: "Todavía no hay artículos.",
    remove: "Quitar",
    add: "Agregar",
    addedToList: "agregado a la lista",
    loading: "Cargando…",
    cartNow: "Tu carrito actual",
    itemsLabel: "artículos",
    pending: "Pendientes",
    completed: "Comprados",
    addChecked: "Agregar seleccionados",
    alreadyInList: "Ya está",
    noHistory: "No hay compras en el historial.",
    back: "Regresar",
    language: "Idioma",
    preferredStore: "Tienda preferida",
    save: "Guardar",
    saved: "Guardado",
    fontSize: "Tamaño de letra",
    fontNormal: "Normal",
    fontLarge: "Grande",
    fontXLarge: "Muy grande",
    stores: "Tiendas",
    finishPurchase: "Terminar compra",
    whatsApp: "WhatsApp",
    pdf: "PDF",
    useItem: "Usar",
    reviewAndAdd: "Revisa y agrega.",
    category: "Categoría",
    unit: "Unidad",
    quantity: "Cantidad",
    store: "Tienda",
    menuBack: "Regresar",
    myListMenu: "Mi Lista",
    cartMenu: "Carrito",
    shoppingMenu: "De Compras",
    historyMenu: "Historial",
    settingsMenu: "Configuración",
  },
  en: {
    appName: "MinderCart",
    brandTagline: "Never Forget what to buy",
    myListTitle: "My List",
    myListSubtitle: "Add items to your shopping list",
    cartTitle: "Cart",
    cartSubtitle: "Review and complete your shopping list",
    shoppingTitle: "Shopping",
    shoppingSubtitle: "Organize and shop by store",
    historyTitle: "History",
    historySubtitle: "Completed shopping by store",
    settingsTitle: "Settings",
    settingsSubtitle: "Language, store and text size",
    item: "Item",
    cartSection: "Cart",
    noItemsYet: "No items yet.",
    remove: "Remove",
    add: "Add",
    addedToList: "added to the list",
    loading: "Loading…",
    cartNow: "Your current cart",
    itemsLabel: "items",
    pending: "Pending",
    completed: "Completed",
    addChecked: "Add selected",
    alreadyInList: "Already added",
    noHistory: "No shopping history yet.",
    back: "Back",
    language: "Language",
    preferredStore: "Preferred store",
    save: "Save",
    saved: "Saved",
    fontSize: "Text size",
    fontNormal: "Normal",
    fontLarge: "Large",
    fontXLarge: "Very large",
    stores: "Stores",
    finishPurchase: "Finish purchase",
    whatsApp: "WhatsApp",
    pdf: "PDF",
    useItem: "Use",
    reviewAndAdd: "Review and add.",
    category: "Category",
    unit: "Unit",
    quantity: "Quantity",
    store: "Store",
    menuBack: "Back",
    myListMenu: "My List",
    cartMenu: "Cart",
    shoppingMenu: "Shopping",
    historyMenu: "History",
    settingsMenu: "Settings",
  },
} as const;

const unitMap: Record<string, { es: string; en: string }> = {
  ea: { es: "pza", en: "ea" },
  pza: { es: "pza", en: "pc" },
  dozen: { es: "docena", en: "dozen" },
  gal: { es: "gal", en: "gal" },
  lb: { es: "lb", en: "lb" },
  bag: { es: "bolsa", en: "bag" },
  bottle: { es: "botella", en: "bottle" },
  loaf: { es: "barra", en: "loaf" },
  pack: { es: "paquete", en: "pack" },
  pkg: { es: "paquete", en: "pkg" },
  roll: { es: "rollo", en: "roll" },
};

const categoryMap: Record<string, { es: string; en: string }> = {
  pantry: { es: "Despensa", en: "Pantry" },
  produce: { es: "Frutas y verduras", en: "Produce" },
  dairy: { es: "Lácteos", en: "Dairy" },
  "meat & seafood": { es: "Carnes y mariscos", en: "Meat & Seafood" },
  frozen: { es: "Congelados", en: "Frozen" },
  beverages: { es: "Bebidas", en: "Beverages" },
  snacks: { es: "Botanas", en: "Snacks" },
  bakery: { es: "Panadería", en: "Bakery" },
  cleaning: { es: "Limpieza", en: "Cleaning" },
  "personal care": { es: "Cuidado personal", en: "Personal Care" },
  "pet care": { es: "Mascotas", en: "Pet Care" },
  hogar: { es: "Hogar", en: "Home" },
  general: { es: "General", en: "General" },
};

export function t(lang: AppLanguage, key: keyof typeof messages.es): string {
  return messages[lang]?.[key] ?? messages.es[key];
}

export function unitLabel(lang: AppLanguage, unit: string): string {
  const key = String(unit || "").trim().toLowerCase();
  const row = unitMap[key];
  if (!row) return unit || "";
  return lang === "en" ? row.en : row.es;
}

export function categoryLabel(lang: AppLanguage, category: string): string {
  const key = String(category || "").trim().toLowerCase();
  const row = categoryMap[key];
  if (!row) return category || "";
  return lang === "en" ? row.en : row.es;
}

export function formatDateTime(value: number, lang: AppLanguage): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
