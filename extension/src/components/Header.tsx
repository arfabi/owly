import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { LANGUAGE_METADATA } from "../lib/i18n/types";
import { Accessibility, Globe, X, Check, Terminal } from "lucide-react";

interface HeaderProps {
  onOpenAccessibilityHub?: () => void;
  onOpenLogConsole?: () => void;
}

export function Header({ onOpenAccessibilityHub, onOpenLogConsole }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const currentMeta =
    LANGUAGE_METADATA.find((m) => m.code === language) || LANGUAGE_METADATA[0];

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between relative shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <img
            src="owly.png"
            alt="Owly.AI Logo"
            className="w-7 h-7 object-contain drop-shadow-xs"
          />
          <div>
            <h1 className="font-extrabold text-sm leading-none text-savvy-navy tracking-tight">
              Owly<span className="text-savvy-blue">.AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              {t.header.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Icons: Accessibility HUB, Log Console, & Language Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Log Console Button */}
          <button
            onClick={onOpenLogConsole}
            className="flex items-center justify-center p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition-all cursor-pointer shadow-2xs group relative"
            title={t.header.logConsoleTooltip}
            aria-label="Log Console"
          >
            <Terminal className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Accessibility HUB Button */}
          <button
            onClick={onOpenAccessibilityHub}
            className="flex items-center justify-center p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs group"
            title={t.header.accessibilityTooltip}
            aria-label="Accessibility HUB"
          >
            <Accessibility className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors stroke-[2.2]" />
          </button>

          {/* Language Switcher Button */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg text-slate-600 hover:text-savvy-blue hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title={t.header.changeLanguage}
          >
            <span className="text-sm leading-none shrink-0">{currentMeta.flag}</span>
            <span className="text-[11px] font-extrabold uppercase">{language}</span>
          </button>
        </div>
      </div>

      {/* Language Switcher Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 relative text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-savvy-blue" />
                <h3 className="font-extrabold text-xs text-slate-900">
                  {t.header.selectLanguage}
                </h3>
              </div>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Options with 14 Supported Languages */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {LANGUAGE_METADATA.map((meta) => {
                const isSelected = language === meta.code;
                return (
                  <button
                    key={meta.code}
                    onClick={() => {
                      setLanguage(meta.code);
                      setIsLangModalOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 border-savvy-blue shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg leading-none shrink-0">{meta.flag}</span>
                      <div className="text-left">
                        <span className="font-bold text-xs text-slate-900 block leading-tight">
                          {meta.nativeName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {meta.name} • {meta.code.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-savvy-blue text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
