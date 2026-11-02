import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, SupportedLanguage, ExtensionTranslations } from "./translations";

interface LanguageContextProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isFirstInstall: boolean;
  completeOnboarding: (lang: SupportedLanguage) => void;
  t: ExtensionTranslations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default language is American English ("en")
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [isFirstInstall, setIsFirstInstall] = useState<boolean>(false);

  useEffect(() => {
    // Check onboarding and saved language from chrome.storage.local or localStorage
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(
        ["owly_preferred_lang", "preferred_language", "owly_onboarding_completed"],
        (res) => {
          const saved = res.owly_preferred_lang || res.preferred_language;
          const hasCompleted = res.owly_onboarding_completed === true;

          if (typeof saved === "string" && saved in translations) {
            setLanguageState(saved as SupportedLanguage);
            setIsFirstInstall(false);
          } else if (!hasCompleted) {
            // First install: user must choose language
            setIsFirstInstall(true);
          }
        }
      );
    } else {
      const saved = localStorage.getItem("owly_preferred_lang");
      const hasCompleted = localStorage.getItem("owly_onboarding_completed") === "true";

      if (typeof saved === "string" && saved in translations) {
        setLanguageState(saved as SupportedLanguage);
        setIsFirstInstall(false);
      } else if (!hasCompleted) {
        setIsFirstInstall(true);
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

  const completeOnboarding = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setIsFirstInstall(false);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        owly_preferred_lang: lang,
        preferred_language: lang,
        owly_onboarding_completed: true,
      });
    } else {
      localStorage.setItem("owly_preferred_lang", lang);
      localStorage.setItem("owly_onboarding_completed", "true");
    }
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isFirstInstall, completeOnboarding, t }}
    >
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
