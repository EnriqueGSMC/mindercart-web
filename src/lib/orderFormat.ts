// ============================================================================
// FILE: src/lib/orderFormat.ts   (NUEVO)
// - Consolidar items repetidos + texto WhatsApp con 4 renglones fijos.
// ============================================================================
export type OrderLine = {
  productId?: string;
  productName: string;
  qty: string | number;
  unitCapture?: string;
  note?: string;
};

export type SupplierInfo = {
  name: string;
  addressLine?: string; // "3601 FM 1488, The Woodlands, TX 77384"
};

function num(v: any): number {
  const s = String(v ?? "").trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function consolidateLines(lines: OrderLine[]) {
  const map = new Map<string, { name: string; unit: string; qty: number; notes: string[] }>();

  for (const l of lines) {
    const key = String(l.productId || l.productName).toLowerCase().trim();
    const name = String(l.productName || "").trim();
    const unit = String(l.unitCapture || "").trim();
    const q = num(l.qty);
    const note = String(l.note || "").trim();

    const cur = map.get(key) || { name, unit, qty: 0, notes: [] };
    cur.name = cur.name || name;
    cur.unit = cur.unit || unit;
    cur.qty += q || 0;
    if (note) cur.notes.push(note);
    map.set(key, cur);
  }

  return Array.from(map.values())
    .filter((x) => x.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildWhatsAppText(params: {
  lang: "es" | "en";
  supplier: SupplierInfo;
  orderNo: string; // "26-00001"
  lines: OrderLine[];
}) {
  const { lang, supplier, orderNo } = params;
  const header = lang === "en" ? "Purchases Carnitas El Cliente" : "Compras Carnitas El Cliente";

  const cons = consolidateLines(params.lines);

  const out: string[] = [];
  out.push(header); // 1
  out.push(supplier.name); // 2
  if (supplier.addressLine) out.push(supplier.addressLine); // 3
  out.push(`${lang === "en" ? "Order #" : "Orden #"} ${orderNo}`); // 4

  out.push(""); // espacio
  for (const x of cons) {
    const qtyTxt = x.qty ? String(x.qty) : "1";
    // formato simple: "Aceite 5 botella"
    const unitTxt = x.unit ? ` ${x.unit}` : "";
    out.push(`${x.name} ${qtyTxt}${unitTxt}`);
  }

  return out.join("\n");
}
