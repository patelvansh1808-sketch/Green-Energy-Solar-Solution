import { createContext, useContext, useMemo, useState } from "react";
import translations from "../i18n/translations";

const I18nContext = createContext(null);

const getNested = (obj, path) => {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );

  const t = useMemo(() => {
    return (key, fallback) => {
      const value = getNested(translations[language], key);
      if (value !== undefined) return value;
      const english = getNested(translations.en, key);
      if (english !== undefined) return english;
      return fallback || key;
    };
  }, [language]);

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const value = useMemo(
    () => ({ language, setLanguage: updateLanguage, t }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
};
