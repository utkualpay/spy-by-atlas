"use client";
import { useState, useEffect } from "react";
import { t as T, getLang, setLang as setLangFn, LANGS } from "./i18n";

// Hook: use live-updating language in any client component
// Usage: const { t, lang, setLang } = useTranslation();
export function useTranslation() {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    setLangState(getLang());
    const handler = () => setLangState(getLang());
    window.addEventListener("langchange", handler);
    return () => window.removeEventListener("langchange", handler);
  }, []);

  // Also sync <html lang="..."> for SEO + accessibility
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  return {
    t: (key) => T(key, lang),
    lang,
    setLang: (code) => { setLangFn(code); setLangState(code); },
    LANGS,
  };
}
