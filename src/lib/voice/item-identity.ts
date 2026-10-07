// Notes belong to list rows, not to the shared product catalog.
export function voiceItemIdentity(item: { itemKey?: unknown; note?: unknown; unit?: unknown; store?: unknown }) {
  const safe = (value: unknown) => String(value ?? "").trim();
  const note = safe(item.note).toLowerCase().replace(/\s+/g, " ");
  return JSON.stringify([safe(item.itemKey), note, safe(item.unit), safe(item.store)]);
}
