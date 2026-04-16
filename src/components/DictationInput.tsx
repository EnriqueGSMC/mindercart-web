"use client";

import React from "react";

type DictationMode = "search" | "number" | "text";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  lang?: "es" | "en";
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
  autoComplete?: string;
  disabled?: boolean;

  /** NUEVO: ayuda al dictado (y al FAB global) */
  dictation?: DictationMode;
  /** NUEVO: cuando dicta, reemplaza el valor en vez de concatenar */
  dictationReplace?: boolean;
};

function getSR(): any | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function stripTrailingPunct(s: string) {
  return String(s || "").replace(/[.,!?;:]+$/g, "").trim();
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

  // Si trae dígitos, usa el primer número limpio
  const digits = s0.replace(/[^0-9.,]/g, "");
  if (digits) {
    const m = digits.match(/[0-9]+([.,][0-9]+)?/);
    if (m?.[0]) return m[0].replace(",", ".");
  }

  // Palabras -> número simple
  const parts = s0.split(/\s+/).filter(Boolean);
  let total = 0;
  let current = 0;

  for (const p of parts) {
    const n = ES_NUM[p];
    if (typeof n !== "number") continue;
    if (n === 100) current = current === 0 ? 100 : current * 100;
    else current += n;
  }
  total += current;

  return total ? String(total) : "";
}

export function DictationInput({
  value,
  onChange,
  placeholder,
  textarea,
  lang = "es",
  type = "text",
  inputMode,
  enterKeyHint,
  autoComplete,
  disabled,
  dictation = "text",
  dictationReplace,
}: Props) {
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const recRef = React.useRef<any>(null);

  React.useEffect(() => setSupported(Boolean(getSR())), []);

  const stop = React.useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {}
    recRef.current = null;
    setListening(false);
  }, []);

  const start = React.useCallback(() => {
    if (disabled) return;
    const SR = getSR();
    if (!SR) return;

    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang === "en" ? "en-US" : "es-MX";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const raw = String(e?.results?.[0]?.[0]?.transcript || "");

      if (dictation === "number") {
        const n = normalizeNumberTranscript(raw);
        if (!n) return;
        onChange(n); // SIEMPRE reemplaza en número
        return;
      }

      const txt = dictation === "search" ? stripTrailingPunct(raw) : stripTrailingPunct(raw);
      if (!txt) return;

      const mustReplace = Boolean(dictationReplace) || dictation === "search";
      onChange(mustReplace ? txt : value ? `${value} ${txt}` : txt);
    };

    rec.onerror = () => stop();
    rec.onend = () => stop();

    setListening(true);
    rec.start();
  }, [dictation, dictationReplace, disabled, lang, onChange, stop, value]);

  const Field: any = textarea ? "textarea" : "input";

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Field
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...(!textarea ? { type, inputMode, enterKeyHint, autoComplete } : {})}
        // ✅ Para FAB global (y para debug):
        data-dictation={dictation}
        data-dictation-replace={dictationReplace ? "true" : "false"}
        style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #ccc" }}
      />

      {supported ? (
        <button
          type="button"
          onClick={() => (listening ? stop() : start())}
          disabled={disabled}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            fontWeight: 900,
            border: "1px solid #111",
            background: listening ? "#111" : "white",
            color: listening ? "white" : "#111",
          }}
          title={listening ? "Dictando…" : "Dictar"}
        >
          {listening ? "🎤…" : "🎤"}
        </button>
      ) : null}
    </div>
  );
}