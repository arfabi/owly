"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SupportedLanguage, LANGUAGE_METADATA } from "@/lib/i18n/types";
import { FlagIcon } from "./FlagIcon";
import { ChevronDown, Check, Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMeta =
    LANGUAGE_METADATA.find((m) => m.code === language) || LANGUAGE_METADATA[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FlagIcon code={language} className="w-4 h-3 rounded-xs" />
        <span className="uppercase text-[11px] tracking-wider font-extrabold text-slate-800">
          {language}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* 14 Languages Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200/90 p-2 z-[100] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Language (14)</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {currentMeta.name.split(" ")[0]}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 mt-1.5 space-y-1">
            {LANGUAGE_METADATA.map((meta) => {
              const isSelected = language === meta.code;
              return (
                <button
                  key={meta.code}
                  type="button"
                  onClick={() => {
                    setLanguage(meta.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 font-bold text-blue-700 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlagIcon code={meta.code} className="w-4 h-3 rounded-xs" />
                    <div>
                      <span className="block text-xs leading-none font-bold">
                        {meta.nativeName}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                        {meta.name} • {meta.code.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
