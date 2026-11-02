// OWLY.AI — Multilingual Translations System
// Aggregated 14 Global & Regional Locales for Web Speech API Compatibility

import { SupportedLanguage, ExtensionTranslations } from "./types";
import { en } from "./locales/en";
import { id } from "./locales/id";
import { es } from "./locales/es";
import { zh } from "./locales/zh";
import { ar } from "./locales/ar";
import { ja } from "./locales/ja";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { hi } from "./locales/hi";
import { ko } from "./locales/ko";
import { ms } from "./locales/ms";
import { vi } from "./locales/vi";
import { th } from "./locales/th";

export * from "./types";

export const translations: Record<SupportedLanguage, ExtensionTranslations> = {
  en,
  id,
  es,
  zh,
  ar,
  ja,
  fr,
  de,
  pt,
  hi,
  ko,
  ms,
  vi,
  th,
};
