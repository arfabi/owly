import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { LANGUAGE_METADATA, SupportedLanguage } from "../lib/i18n/types";
import { translations } from "../lib/i18n/translations";
import { Sparkles, Check, Globe, Shield, Volume2 } from "lucide-react";
import { agentLog } from "../lib/agentLogger";
import { FlagIcon } from "./FlagIcon";

export function WelcomeModal() {
  const { isFirstInstall, completeOnboarding } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("en");

  if (!isFirstInstall) return null;

  // Use the translations of the currently previewed/selected language
  const previewT = translations[selectedLang] || translations.en;
  const currentMeta =
    LANGUAGE_METADATA.find((m) => m.code === selectedLang) || LANGUAGE_METADATA[0];

  const handleConfirm = () => {
    agentLog.planner(
      `🎉 User completed first-install onboarding. Primary language locked to: ${currentMeta.name} (${selectedLang}).`
    );
    completeOnboarding(selectedLang);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden text-left relative">
        {/* Glow accent in top right */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Mascot & Header */}
        <div className="flex flex-col items-center text-center pb-3 border-b border-slate-100 shrink-0">
          <div className="relative mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
              <img
                src="owly.png"
                alt="Owly Mascot"
                className="w-12 h-12 object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 bg-white rounded-full items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            </span>
          </div>

          <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
            {previewT.welcome.title}
          </h2>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 max-w-[280px]">
            {previewT.welcome.subtitle}
          </p>
        </div>

        {/* Language Selection Header */}
        <div className="pt-3 pb-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
            <Globe className="w-3.5 h-3.5 text-savvy-blue" />
            <span>{previewT.welcome.selectPrompt}</span>
          </div>
          <span className="text-[10px] text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1.5">
            <FlagIcon code={selectedLang} className="w-3.5 h-2.5" />
            <span>{selectedLang.toUpperCase()}</span>
          </span>
        </div>

        {/* 14 Supported Languages Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 my-1.5 space-y-1.5">
          {LANGUAGE_METADATA.map((meta) => {
            const isSelected = selectedLang === meta.code;
            return (
              <button
                key={meta.code}
                onClick={() => setSelectedLang(meta.code)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-600 shadow-2xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FlagIcon code={meta.code} className="w-5 h-3.5" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-slate-900 block leading-tight">
                      {meta.nativeName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {meta.name} • {meta.speechCode}
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

        {/* Footer Actions & Strict Guardrail Info */}
        <div className="pt-2 border-t border-slate-100 shrink-0 space-y-2">
          {/* Guardrail badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-700">Fixed Language Guardrail</span>
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Voice Matched</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{previewT.welcome.btnConfirm}</span>
            <span className="text-sm">➔</span>
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-tight">
            {previewT.welcome.footerNote}
          </p>
        </div>
      </div>
    </div>
  );
}
