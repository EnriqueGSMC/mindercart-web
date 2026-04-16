// FILE: src/components/LanguageToggle.tsx
"use client";

import React from "react";
import { getLang, toggleLang, type Lang, t } from "@/lib/lang";

export function LanguageToggle({ compact }: { compact?: boolean }) {
  const [lang, setLangState] = React.useState<Lang>("es");

  React.useEffect(() => {
    setLangState(getLang());
  }, []);

  const label = t(lang, "langEsEn");

  return (
    <button
      type="button"
      className={compact ? "cc-btn" : "cc-btn cc-btn--primary"}
      onClick={() => {
        const next = toggleLang();
        setLangState(next);
      }}
      title={label}
      aria-label={label}
      style={{
        padding: compact ? "6px 10px" : undefined,
        fontWeight: 900,
      }}
    >
      {label}
    </button>
  );
}