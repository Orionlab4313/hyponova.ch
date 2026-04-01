"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, DEFAULT_LANGUAGE, getTranslations } from "./translations";

type Translations = ReturnType<typeof getTranslations>;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  t: getTranslations(DEFAULT_LANGUAGE),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = document.cookie.match(/hyponova-lang=(\w+)/)?.[1] as Language | undefined;
    if (saved === "de" || saved === "en") setLangState(saved);
  }, []);

  function setLang(newLang: Language) {
    setLangState(newLang);
    document.cookie = `hyponova-lang=${newLang};path=/;max-age=${60 * 60 * 24 * 365}`;
  }

  const t = getTranslations(lang);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
