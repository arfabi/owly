// OWLY.AI Web — 14 Supported Languages Matching Extension

export type SupportedLanguage =
  | "en" // English (US - American English, Default)
  | "id" // Bahasa Indonesia
  | "es" // Español (Spanish)
  | "zh" // 中文 (Chinese Simplified)
  | "ar" // العربية (Arabic)
  | "ja" // 日本語 (Japanese)
  | "fr" // Français (French)
  | "de" // Deutsch (German)
  | "pt" // Português (Portuguese)
  | "hi" // हिन्दी (Hindi)
  | "ko" // 한국어 (Korean)
  | "ms" // Bahasa Melayu (Malay)
  | "vi" // Tiếng Việt (Vietnamese)
  | "th"; // ไทย (Thai)

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGE_METADATA: LanguageMeta[] = [
  { code: "en", name: "English (US)", nativeName: "American English" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
];

