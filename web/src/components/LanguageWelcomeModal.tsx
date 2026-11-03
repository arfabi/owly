"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGE_METADATA, SupportedLanguage } from "@/lib/i18n/types";
import { FlagIcon } from "./FlagIcon";
import { Sparkles, Globe, Check, ArrowRight } from "lucide-react";

export function LanguageWelcomeModal() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SupportedLanguage>(language);

  useEffect(() => {
    try {
      const hasChosen = localStorage.getItem("savvy_web_lang_chosen");
      if (!hasChosen) {
        setIsOpen(true);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  if (!isOpen) return null;

  const handleSelect = (code: SupportedLanguage) => {
    setSelected(code);
  };

  const handleConfirm = () => {
    setLanguage(selected);
    try {
      localStorage.setItem("savvy_web_lang_chosen", "true");
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  const currentMeta =
    LANGUAGE_METADATA.find((m) => m.code === selected) || LANGUAGE_METADATA[0];

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Top-Right */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Mascot & Header */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 shrink-0">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
              <img
                src="/owly.png"
                alt="Owly Mascot"
                className="w-13 h-13 object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 bg-white rounded-full items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Welcome to Owly<span className="text-blue-600">.AI</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 max-w-sm">
            Choose your preferred language / Pilih bahasa Anda untuk pengalaman bimbingan formulir cerdas terbaik.
          </p>
        </div>

        {/* Header Indicator */}
        <div className="pt-3 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Select Language (14 Global)</span>
          </div>
          <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1.5">
            <FlagIcon code={selected} className="w-3.5 h-2.5" />
            <span>{currentMeta.nativeName}</span>
          </span>
        </div>

        {/* 14 Languages List */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-1.5 max-h-[320px]">
          {LANGUAGE_METADATA.map((meta) => {
            const isSelected = selected === meta.code;
            return (
              <button
                key={meta.code}
                type="button"
                onClick={() => handleSelect(meta.code)}
                className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/90 border-blue-600 shadow-2xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FlagIcon code={meta.code} className="w-6 h-4" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-slate-900 block leading-tight">
                      {meta.nativeName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {meta.name} • {meta.code.toUpperCase()}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm Action Button */}
        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue / Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

