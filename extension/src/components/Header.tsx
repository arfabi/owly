import React from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { Lock, Unlock, Globe, Compass, Target } from "lucide-react";

interface HeaderProps {
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (val: boolean) => void;
}

export function Header({ isVaultUnlocked, setIsVaultUnlocked }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="bg-white border-b border-slate-200 p-3.5 space-y-2.5">
      {/* Top Bar: Brand, Language, Vault Lock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-xs">
            S
          </div>
          <div>
            <div className="font-extrabold text-sm leading-none text-slate-900 tracking-tight">
              Savvy<span className="text-blue-600">.AI</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Meta Muse Spark 1.3
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[10px] font-bold">
            <button
              onClick={() => setLanguage("id")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                language === "id"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                language === "en"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              EN
            </button>
          </div>

          {/* Vault Lock/Unlock Toggle */}
          <button
            onClick={() => setIsVaultUnlocked(!isVaultUnlocked)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
              isVaultUnlocked
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
            title="Toggle Status Kunci Vault"
          >
            {isVaultUnlocked ? (
              <>
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>{t.header.vaultUnlocked}</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-slate-500" />
                <span>{t.header.btnUnlock}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Goal & Active Portal Badge */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 font-mono truncate max-w-[190px]">
          <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{t.header.portalDetected}</span>
        </div>
        <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[10px] shrink-0">
          {t.header.targetGoal}
        </div>
      </div>
    </div>
  );
}
