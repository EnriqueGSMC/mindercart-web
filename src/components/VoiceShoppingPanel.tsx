"use client";

import React from "react";
import { DictationInput } from "./DictationInput";
import { readState, addQuickNeeds } from "@/lib/mindercart/storage";
import { SEED_GENERAL_ITEMS } from "@/lib/mindercart/seed-items";
import { parseVoiceUtterance, type ParsedVoiceItem, type VoiceCatalogItem } from "@/lib/voice/parse-utterance";

export function VoiceShoppingPanel({ lang }: { lang: "es" | "en" }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [preview, setPreview] = React.useState<ParsedVoiceItem[]>([]);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const submitted = React.useRef(false);
  const buttonStyle: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, border: "1px solid #D8E2FF", background: "#fff", color: "#12245E", fontWeight: 800 };

  function review() {
    const state = readState();
    const catalog: VoiceCatalogItem[] = state.itemsMaster.map((item) => ({ ...item, name: item.nameEs || item.name }));
    const keys = new Set(catalog.map((item) => item.itemKey));
    catalog.push(...SEED_GENERAL_ITEMS.filter((item) => !keys.has(item.itemKey)).map((item) => ({ ...item, name: item.nameEs, defaultStore: item.store })));
    const items = parseVoiceUtterance(text, catalog, state.settings.preferredStore);
    setPreview(items);
    submitted.current = false;
    setError(items.length ? "" : lang === "en" ? "Say or type at least one product." : "Dicta o escribe al menos un producto.");
  }

  function confirm() {
    if (!preview.length || submitted.current) return;
    submitted.current = true;
    try {
      addQuickNeeds(preview);
      setMessage(lang === "en" ? `Added ${preview.length} items. Existing matches add to their quantities.` : `Agregados ${preview.length} artículos. Si ya estaban, se suman las cantidades.`);
      setPreview([]);
      setText("");
      setError("");
    } catch {
      submitted.current = false;
      setError(lang === "en" ? "Could not save. Your list has not been confirmed." : "No se pudo guardar. La lista no quedó confirmada.");
    }
  }

  return <div style={{ display: "grid", gap: 10 }}>
    <button type="button" style={buttonStyle} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? (lang === "en" ? "Close voice entry" : "Cerrar entrada por voz") : (lang === "en" ? "Add by voice" : "Agregar por voz")}</button>
    {open ? <div style={{ display: "grid", gap: 10, padding: 12, borderRadius: 14, background: "#f7faff", color: "#12245E" }}>
      <label htmlFor="voice-shopping-text">{lang === "en" ? "What do you need?" : "¿Qué necesitas?"}</label>
      <p style={{ margin: 0, fontSize: 13 }}>{lang === "en" ? "Tap the microphone next to the field, or tap the field and use your keyboard microphone. You can also type. Nothing is added until you confirm." : "Toca el micrófono junto al campo o toca el campo y usa el micrófono del teclado. También puedes escribir. No se agrega nada hasta confirmar."}</p>
      <DictationInput id="voice-shopping-text" textarea lang={lang} value={text} dictationReplace onDictationError={() => setError(lang === "en" ? "Dictation is unavailable. Use your keyboard microphone or type here." : "No se pudo iniciar o completar el dictado. Usa el micrófono del teclado o escribe aquí.")} onChange={(value) => { setText(value.slice(0, 2000)); setPreview([]); setMessage(""); setError(""); }} placeholder="Leche, huevos y arroz" />
      <p style={{ margin: 0, fontSize: 13 }}>{lang === "en" ? "For notes, use the Spanish markers: agua mineral nota naranja, siguiente artículo agua mineral nota toronja." : "Con notas: agua mineral nota naranja, siguiente artículo agua mineral nota toronja."}</p>
      <button type="button" style={buttonStyle} disabled={!text.trim()} onClick={review}>{lang === "en" ? "Review products" : "Revisar productos"}</button>
      {preview.length ? <>
        <ul style={{ paddingLeft: 20, margin: 0 }}>{preview.map((item, index) => <li key={index} style={{ marginBottom: 10 }}>
          <span>{item.name} — {item.quantity} {item.unit} · {item.store}{item.note ? ` · ${item.note}` : ""}</span>{" "}
          <button type="button" style={buttonStyle} onClick={() => setPreview(preview.filter((_, i) => i !== index))} aria-label={`${lang === "en" ? "Exclude" : "Excluir"} ${item.name}`}>{lang === "en" ? "Exclude" : "Excluir"}</button>
        </li>)}</ul>
        <p style={{ margin: 0, fontSize: 13 }}>{lang === "en" ? "Check names, notes and quantities. Edit the text and review again to correct them. At most 20 products per batch." : "Revisa nombres, notas y cantidades. Para corregirlos, edita el texto y vuelve a revisar. Máximo 20 productos por tanda."}</p>
        <button type="button" style={{ ...buttonStyle, background: "#12245E", color: "#fff" }} onClick={confirm}>{lang === "en" ? "Confirm and add" : "Confirmar y agregar"}</button>
      </> : null}
      {error ? <p role="alert" style={{ color: "#b42318", margin: 0 }}>{error}</p> : null}
    </div> : null}
    {message ? <p role="status" style={{ margin: 0, color: "#027a48" }}>{message}</p> : null}
  </div>;
}
