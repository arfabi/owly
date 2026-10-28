"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { SupportedLanguage } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200/80 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          language === "id"
            ? "bg-white text-blue-600 shadow-2xs font-bold"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Bahasa Indonesia"
      >
        <span>🇮🇩</span>
        <span className="text-[11px]">ID</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          language === "en"
            ? "bg-white text-blue-600 shadow-2xs font-bold"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span className="text-[11px]">EN</span>
      </button>
    </div>
  );
}
