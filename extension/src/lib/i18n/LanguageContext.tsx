import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, SupportedLanguage, ExtensionTranslations } from "./translations";

interface LanguageContextProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: ExtensionTranslations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default language is American English ("en")
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    // Load preferred language from chrome.storage.local or localStorage
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["owly_preferred_lang", "preferred_language"], (res) => {
        const saved = res.owly_preferred_lang || res.preferred_language;
        if (saved && (saved === "id" || saved === "en")) {
          setLanguageState(saved as SupportedLanguage);
        }
      });
    } else {
      const saved = localStorage.getItem("owly_preferred_lang") as SupportedLanguage;
      if (saved && (saved === "id" || saved === "en")) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ owly_preferred_lang: lang, preferred_language: lang });
    } else {
      localStorage.setItem("owly_preferred_lang", lang);
    }
  };

  const t = translations[language] || translations.en;

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
