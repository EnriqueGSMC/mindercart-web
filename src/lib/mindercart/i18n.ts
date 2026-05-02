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
    preferredStorePlaceholder: "Selecciona o agrega una tienda",
    choosePreferredStore: "Toca para elegir o editar una tienda",
    searchStore: "Buscar tienda",
    addStore: "Dar de alta nueva tienda",
    editStore: "Editar tienda",
    newStore: "Nueva tienda",
    storeName: "Nombre de la tienda",
    streetAddress: "Dirección",
    addressLine2: "Colonia / referencia",
    city: "Ciudad",
    stateProvince: "Estado / provincia",
    postalCode: "Código postal",
    country: "País",
    phone: "Teléfono",
    notes: "Notas",
    close: "Cerrar",
    cancel: "Cancelar",
    saveStore: "Guardar tienda",
    noStores: "No hay tiendas registradas.",
    storeNameRequired: "Escribe el nombre de la tienda",
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
    brandTagline: "Never forget what to buy",
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
    preferredStorePlaceholder: "Select or add a store",
    choosePreferredStore: "Tap to choose or edit a store",
    searchStore: "Search store",
    addStore: "Add new store",
    editStore: "Edit store",
    newStore: "New store",
    storeName: "Store name",
    streetAddress: "Address",
    addressLine2: "Neighborhood / reference",
    city: "City",
    stateProvince: "State / province",
    postalCode: "Postal code",
    country: "Country",
    phone: "Phone",
    notes: "Notes",
    close: "Close",
    cancel: "Cancel",
    saveStore: "Save store",
    noStores: "No stores yet.",
    storeNameRequired: "Enter the store name",
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

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const unitMap: Record<string, { es: string; en: string }> = {
  pza: { es: "pza", en: "pc" },
  pc: { es: "pza", en: "pc" },
  pieza: { es: "pza", en: "pc" },
  piezas: { es: "pza", en: "pc" },
  ea: { es: "pza", en: "pc" },
  each: { es: "pza", en: "pc" },

  paquete: { es: "paquete", en: "pack" },
  paquetes: { es: "paquete", en: "pack" },
  pack: { es: "paquete", en: "pack" },
  packs: { es: "paquete", en: "pack" },

  caja: { es: "caja", en: "box" },
  cajas: { es: "caja", en: "box" },
  box: { es: "caja", en: "box" },
  boxes: { es: "caja", en: "box" },

  lata: { es: "lata", en: "can" },
  latas: { es: "lata", en: "can" },
  can: { es: "lata", en: "can" },
  cans: { es: "lata", en: "can" },

  botella: { es: "botella", en: "bottle" },
  botellas: { es: "botella", en: "bottle" },
  bottle: { es: "botella", en: "bottle" },
  bottles: { es: "botella", en: "bottle" },

  frasco: { es: "frasco", en: "jar" },
  frascos: { es: "frasco", en: "jar" },
  jar: { es: "frasco", en: "jar" },
  jars: { es: "frasco", en: "jar" },

  bolsa: { es: "bolsa", en: "bag" },
  bolsas: { es: "bolsa", en: "bag" },
  bag: { es: "bolsa", en: "bag" },
  bags: { es: "bolsa", en: "bag" },

  rollo: { es: "rollo", en: "roll" },
  rollos: { es: "rollo", en: "roll" },
  roll: { es: "rollo", en: "roll" },
  rolls: { es: "rollo", en: "roll" },

  docena: { es: "docena", en: "dozen" },
  docenas: { es: "docena", en: "dozen" },
  dozen: { es: "docena", en: "dozen" },
  dozens: { es: "docena", en: "dozen" },

  g: { es: "g", en: "g" },
  kg: { es: "kg", en: "kg" },
  oz: { es: "oz", en: "oz" },
  lb: { es: "lb", en: "lb" },
  ml: { es: "ml", en: "ml" },
  l: { es: "l", en: "l" },
  gal: { es: "gal", en: "gal" },
};

const categoryMap: Record<string, { es: string; en: string }> = {
  "frutas y verduras": { es: "Frutas y Verduras", en: "Fruits & Vegetables" },
  "fruits & vegetables": { es: "Frutas y Verduras", en: "Fruits & Vegetables" },
  produce: { es: "Frutas y Verduras", en: "Fruits & Vegetables" },

  "carnes, pollo y pescados": { es: "Carnes, Pollo y Pescados", en: "Meat, Poultry & Seafood" },
  "meat, poultry & seafood": { es: "Carnes, Pollo y Pescados", en: "Meat, Poultry & Seafood" },
  "meat & seafood": { es: "Carnes, Pollo y Pescados", en: "Meat, Poultry & Seafood" },
  carnes: { es: "Carnes, Pollo y Pescados", en: "Meat, Poultry & Seafood" },

  "lacteos y refrigerados": { es: "Lácteos y Refrigerados", en: "Dairy & Refrigerated" },
  "dairy & refrigerated": { es: "Lácteos y Refrigerados", en: "Dairy & Refrigerated" },
  dairy: { es: "Lácteos y Refrigerados", en: "Dairy & Refrigerated" },
  refrigerated: { es: "Lácteos y Refrigerados", en: "Dairy & Refrigerated" },

  "panaderia y tortilleria": { es: "Panadería y Tortillería", en: "Bakery & Tortillas" },
  "bakery & tortillas": { es: "Panadería y Tortillería", en: "Bakery & Tortillas" },
  bakery: { es: "Panadería y Tortillería", en: "Bakery & Tortillas" },

  abarrotes: { es: "Abarrotes", en: "Grocery Staples" },
  "grocery staples": { es: "Abarrotes", en: "Grocery Staples" },
  pantry: { es: "Abarrotes", en: "Grocery Staples" },
  despensa: { es: "Abarrotes", en: "Grocery Staples" },

  bebidas: { es: "Bebidas", en: "Beverages" },
  beverages: { es: "Bebidas", en: "Beverages" },

  congelados: { es: "Congelados", en: "Frozen" },
  frozen: { es: "Congelados", en: "Frozen" },

  "limpieza y hogar": { es: "Limpieza y Hogar", en: "Cleaning & Home" },
  "cleaning & home": { es: "Limpieza y Hogar", en: "Cleaning & Home" },
  cleaning: { es: "Limpieza y Hogar", en: "Cleaning & Home" },
  household: { es: "Limpieza y Hogar", en: "Cleaning & Home" },
  hogar: { es: "Limpieza y Hogar", en: "Cleaning & Home" },

  "farmacia, bebe y cuidado personal": { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby & Personal Care" },
  "pharmacy, baby & personal care": { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby & Personal Care" },
  pharmacy: { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby & Personal Care" },
  "personal care": { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby & Personal Care" },
  bebe: { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby & Personal Care" },
  baby: { es: "Farmacia, Bebé y Cuidado Personal", en: "Pharmacy, Baby & Personal Care" },

  mascotas: { es: "Mascotas", en: "Pets" },
  pets: { es: "Mascotas", en: "Pets" },
  "pet care": { es: "Mascotas", en: "Pets" },

  "cajas y salida": { es: "Cajas y Salida", en: "Checkout & Front End" },
  "checkout & front end": { es: "Cajas y Salida", en: "Checkout & Front End" },
  checkout: { es: "Cajas y Salida", en: "Checkout & Front End" },
  "front end": { es: "Cajas y Salida", en: "Checkout & Front End" },

  "otro / temporal": { es: "Otro / Temporal", en: "Other / Seasonal" },
  "other / seasonal": { es: "Otro / Temporal", en: "Other / Seasonal" },
  general: { es: "Otro / Temporal", en: "Other / Seasonal" },
};

export function t(lang: AppLanguage, key: keyof typeof messages.es): string {
  return messages[lang]?.[key] ?? messages.es[key];
}

export function unitLabel(lang: AppLanguage, unit: string): string {
  const row = unitMap[normalizeKey(unit)];
  if (!row) return unit || "";
  return lang === "en" ? row.en : row.es;
}

export function categoryLabel(lang: AppLanguage, category: string): string {
  const row = categoryMap[normalizeKey(category)];
  if (!row) return category || "";
  return lang === "en" ? row.en : row.es;
}

export function formatDateTime(value: number, lang: AppLanguage): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
