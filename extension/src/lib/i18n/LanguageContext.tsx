import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, SupportedLanguage, ExtensionTranslations } from "./translations";

interface LanguageContextProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: ExtensionTranslations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("id");

  useEffect(() => {
    // Muat bahasa dari chrome.storage.local bila tersedia
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["preferred_language"], (res) => {
        if (res.preferred_language && (res.preferred_language === "id" || res.preferred_language === "en")) {
          setLanguageState(res.preferred_language as SupportedLanguage);
        }
      });
    } else {
      const saved = localStorage.getItem("savvy_preferred_lang") as SupportedLanguage;
      if (saved) setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ preferred_language: lang });
    } else {
      localStorage.setItem("savvy_preferred_lang", lang);
    }
  };

  const t = translations[language] || translations.id;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
