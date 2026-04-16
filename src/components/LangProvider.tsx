"use client";

import React from "react";

export type Lang = "es" | "en";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LangCtx = React.createContext<Ctx | null>(null);

function readLang(): Lang {
  try {
    const v = localStorage.getItem("cc_lang");
    return v === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

function writeLang(l: Lang) {
  try {
    localStorage.setItem("cc_lang", l);
  } catch {}
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANTÍSIMO: siempre inicia "es" para que el HTML del server y el 1er render del cliente coincidan.
  const [lang, setLangState] = React.useState<Lang>("es");

  React.useEffect(() => {
    setLangState(readLang());
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    writeLang(l);
  }, []);

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = React.useContext(LangCtx);
  if (!ctx) throw new Error("useLang debe usarse dentro de <LangProvider>");
  return ctx;
}