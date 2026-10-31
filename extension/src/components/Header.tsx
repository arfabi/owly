import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { Accessibility, Globe, X, Check, Terminal } from "lucide-react";

// SVG Flag Components
export function IndonesiaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-[2px] border border-slate-200 shadow-2xs shrink-0 overflow-hidden`}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="8" fill="#E70011" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
    </svg>
  );
}

export function AmericanFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-[2px] border border-slate-200 shadow-2xs shrink-0 overflow-hidden`}
      viewBox="0 0 190 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 13 Stripes */}
      <rect width="190" height="100" fill="#B22234" />
      <path
        d="M0,7.7 h190 M0,23.1 h190 M0,38.5 h190 M0,53.8 h190 M0,69.2 h190 M0,84.6 h190"
        stroke="#FFFFFF"
        strokeWidth="7.69"
      />
      {/* Blue Canton */}
      <rect width="76" height="53.8" fill="#3C3B6E" />
      {/* Star Grid dots */}
      <g fill="#FFFFFF">
        <circle cx="12" cy="9" r="2.5" />
        <circle cx="25" cy="9" r="2.5" />
        <circle cx="38" cy="9" r="2.5" />
        <circle cx="51" cy="9" r="2.5" />
        <circle cx="64" cy="9" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <circle cx="31" cy="18" r="2.5" />
        <circle cx="44" cy="18" r="2.5" />
        <circle cx="57" cy="18" r="2.5" />
        <circle cx="12" cy="27" r="2.5" />
        <circle cx="25" cy="27" r="2.5" />
        <circle cx="38" cy="27" r="2.5" />
        <circle cx="51" cy="27" r="2.5" />
        <circle cx="64" cy="27" r="2.5" />
        <circle cx="18" cy="36" r="2.5" />
        <circle cx="31" cy="36" r="2.5" />
        <circle cx="44" cy="36" r="2.5" />
        <circle cx="57" cy="36" r="2.5" />
        <circle cx="12" cy="45" r="2.5" />
        <circle cx="25" cy="45" r="2.5" />
        <circle cx="38" cy="45" r="2.5" />
        <circle cx="51" cy="45" r="2.5" />
        <circle cx="64" cy="45" r="2.5" />
      </g>
    </svg>
  );
}

interface HeaderProps {
  onOpenAccessibilityHub?: () => void;
  onOpenLogConsole?: () => void;
}

export function Header({ onOpenAccessibilityHub, onOpenLogConsole }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

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
            {language === "id" ? <IndonesiaFlag /> : <AmericanFlag />}
            <span className="text-[11px] font-extrabold uppercase">{language}</span>
          </button>
        </div>
      </div>

      {/* Language Switcher Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xs w-full p-4 shadow-xl border border-slate-200 relative text-left">
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

            {/* Language Options with Country Flag SVGs */}
            <div className="space-y-2">
              {/* Option 1: American English (Default) */}
              <button
                onClick={() => {
                  setLanguage("en");
                  setIsLangModalOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-blue-50/70 border-savvy-blue shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AmericanFlag className="w-6 h-4" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-slate-900 block leading-tight">
                      {t.header.langEnglishUs}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {t.header.langEnSubtitle}
                    </span>
                  </div>
                </div>
                {language === "en" && (
                  <div className="w-5 h-5 rounded-full bg-savvy-blue text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Option 2: Bahasa Indonesia */}
              <button
                onClick={() => {
                  setLanguage("id");
                  setIsLangModalOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  language === "id"
                    ? "bg-blue-50/70 border-savvy-blue shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <IndonesiaFlag className="w-6 h-4" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-slate-900 block leading-tight">
                      {t.header.langIndonesian}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {t.header.langIdSubtitle}
                    </span>
                  </div>
                </div>
                {language === "id" && (
                  <div className="w-5 h-5 rounded-full bg-savvy-blue text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
