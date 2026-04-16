// ============================================================================
// FILE: src/components/VoiceDictationFab.tsx   (REEMPLAZA COMPLETO)
// - Dictado global: limpia puntuación final para búsquedas
// - Para números: reemplaza el valor (no concatena), elimina '.' y espacios.
// - Control por atributos:
//    data-dictation="search|number|text"
//    data-dictation-replace="true"
// ============================================================================
"use client";

import React from "react";

function getSpeechRecognition(): any | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function getActiveEditableEl(): HTMLInputElement | HTMLTextAreaElement | null {
  const el = document.activeElement as any;
  if (!el) return null;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    if (el.disabled || el.readOnly) return null;
    return el;
  }
  return null;
}

function stripTrailingPunct(s: string) {
  return s.replace(/[.,!?;:]+$/g, "").trim();
}

function normalizeForSearch(s: string) {
  return stripTrailingPunct(s);
}

const ES_NUM: Record<string, number> = {
  cero: 0,
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  dieciséis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
};

function normalizeNumberTranscript(raw: string): string {
  const s0 = stripTrailingPunct(raw).toLowerCase().trim();
  if (!s0) return "";

  // 1) Si trae dígitos, extrae el primer número "limpio"
  const digits = s0.replace(/[^0-9.,]/g, "");
  if (digits) {
    // quita separadores raros, deja 10 o 10.5
    const m = digits.match(/[0-9]+([.,][0-9]+)?/);
    if (m?.[0]) return m[0].replace(",", ".");
  }

  // 2) Mapea palabras básicas (hasta 100, simple)
  const parts = s0.split(/\s+/).filter(Boolean);
  if (!parts.length) return "";

  let total = 0;
  let current = 0;

  for (const p of parts) {
    const n = ES_NUM[p];
    if (typeof n !== "number") continue;
    if (n === 100) {
      current = current === 0 ? 100 : current * 100;
    } else if (n >= 20 && n % 10 === 0) {
      current += n;
    } else {
      current += n;
    }
  }
  total += current;

  return total ? String(total) : "";
}

function replaceValue(el: HTMLInputElement | HTMLTextAreaElement, next: string) {
  el.value = next;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function insertText(el: HTMLInputElement | HTMLTextAreaElement, text: string) {
  const t = String(text || "").trim();
  if (!t) return;

  const start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
  const end = typeof el.selectionEnd === "number" ? el.selectionEnd : el.value.length;

  const before = el.value.slice(0, start);
  const after = el.value.slice(end);

  const sep = before && !before.endsWith(" ") ? " " : "";
  const next = `${before}${sep}${t}${after ? " " + after.trimStart() : ""}`.trimEnd();

  replaceValue(el, next);
}

function inferMode(el: HTMLInputElement | HTMLTextAreaElement): "search" | "number" | "text" {
  const ds = (el as any).dataset || {};
  const m = String(ds.dictation || "").toLowerCase();
  if (m === "search" || m === "number" || m === "text") return m;

  const input = el as HTMLInputElement;
  const type = String((input as any).type || "").toLowerCase();
  const im = String((input as any).inputMode || "").toLowerCase();
  if (type === "number" || im === "numeric" || im === "decimal") return "number";

  return "text";
}

function shouldReplace(el: HTMLInputElement | HTMLTextAreaElement, mode: "search" | "number" | "text") {
  const ds = (el as any).dataset || {};
  if (String(ds.dictationReplace || "") === "true") return true;
  if (mode === "number") return true;

  // Heurística: si el valor es exactamente "1" y el campo es cantidad, conviene reemplazar
  const aria = String((el as any).getAttribute?.("aria-label") || "").toLowerCase();
  if (aria.includes("cantidad") && el.value.trim() === "1") return true;

  return false;
}

export function VoiceDictationFab() {
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const recRef = React.useRef<any>(null);

  React.useEffect(() => setSupported(Boolean(getSpeechRecognition())), []);

  const stop = React.useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {}
    recRef.current = null;
    setListening(false);
  }, []);

  const start = React.useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    const rec = new SR();
    recRef.current = rec;

    const lang = (localStorage.getItem("lang") || "es").toLowerCase();
    rec.lang = lang.startsWith("en") ? "en-US" : "es-MX";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const raw = String(e?.results?.[0]?.[0]?.transcript || "");
      const el = getActiveEditableEl();
      if (!el) return;

      const mode = inferMode(el);
      const replace = shouldReplace(el, mode);

      if (mode === "search") {
        const txt = normalizeForSearch(raw);
        if (!txt) return;
        replace ? replaceValue(el, txt) : insertText(el, txt);
        return;
      }

      if (mode === "number") {
        const n = normalizeNumberTranscript(raw);
        if (!n) return;
        replaceValue(el, n); // SIEMPRE reemplaza en number
        return;
      }

      // text
      const txt = stripTrailingPunct(raw);
      if (!txt) return;
      replace ? replaceValue(el, txt) : insertText(el, txt);
    };

    rec.onerror = () => stop();
    rec.onend = () => stop();

    setListening(true);
    rec.start();
  }, [stop]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : start())}
      style={{
        position: "fixed",
        right: 14,
        bottom: 14,
        zIndex: 9999,
        width: 56,
        height: 56,
        borderRadius: 999,
        border: "1px solid #111",
        background: listening ? "#111" : "white",
        color: listening ? "white" : "#111",
        fontWeight: 900,
        fontSize: 18,
        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
      }}
      aria-label={listening ? "Detener dictado" : "Dictar"}
      title={listening ? "Dictando…" : "Dictar"}
    >
      {listening ? "🎤…" : "🎤"}
    </button>
  );
}