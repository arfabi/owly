import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { Accessibility, Globe, X, Check } from "lucide-react";

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

export function EnglishFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-[2px] border border-slate-200 shadow-2xs shrink-0 overflow-hidden`}
      viewBox="0 0 60 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <clipPath id="uk-flag-clip-header">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-header)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2" />
        <path d="M30 0 v30 M0 15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

interface HeaderProps {
  onOpenAccessibilityHub?: () => void;
}

export function Header({ onOpenAccessibilityHub }: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between relative shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <img
            src="logo.png"
            alt="Savvy.AI Logo"
            className="w-7 h-7 object-contain drop-shadow-xs"
          />
          <div>
            <h1 className="font-extrabold text-sm leading-none text-savvy-navy tracking-tight">
              Savvy<span className="text-savvy-blue">.AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Your AI Browser Companion for Forms & Web
            </p>
          </div>
        </div>

        {/* Right Icons: Accessibility HUB & Language Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Accessibility HUB Button */}
          <button
            onClick={onOpenAccessibilityHub}
            className="flex items-center justify-center p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs group"
            title="Accessibility HUB (14 Tools)"
            aria-label="Accessibility HUB"
          >
            <Accessibility className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors stroke-[2.2]" />
          </button>

          {/* Language Switcher Button (Replaced 3-Dots) */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg text-slate-600 hover:text-savvy-blue hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title={language === "id" ? "Ganti Bahasa" : "Change Language"}
          >
            {language === "id" ? <IndonesiaFlag /> : <EnglishFlag />}
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
                  {language === "id" ? "Pilih Bahasa" : "Select Language"}
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
              {/* Option 1: Bahasa Indonesia */}
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
                      Bahasa Indonesia
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Indonesia (ID)
                    </span>
                  </div>
                </div>
                {language === "id" && (
                  <div className="w-5 h-5 rounded-full bg-savvy-blue text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Option 2: English */}
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
                  <EnglishFlag className="w-6 h-4" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-slate-900 block leading-tight">
                      English
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      United Kingdom / International (EN)
                    </span>
                  </div>
                </div>
                {language === "en" && (
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
