import React from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { Lock, Unlock, Globe, Compass, Target, User, Sparkles } from "lucide-react";

interface HeaderProps {
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (val: boolean) => void;
  currentUser?: { name: string; email: string } | null;
  onOpenAuthModal?: () => void;
}

export function Header({
  isVaultUnlocked,
  setIsVaultUnlocked,
  currentUser,
  onOpenAuthModal,
}: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="bg-white border-b border-slate-200 p-3.5 space-y-2.5">
      {/* Top Bar: Brand, Language, Auth, Vault Lock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="logo.png"
            alt="Savvy.AI Logo"
            className="w-8 h-8 object-contain drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm leading-none text-savvy-navy tracking-tight">
                Savvy<span className="text-savvy-blue">.AI</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold bg-savvy-soft-green text-savvy-green border border-savvy-green/30 tracking-wider">
                ON
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Meta Muse Spark 1.3
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* User Auth Button */}
          <button
            onClick={onOpenAuthModal}
            className={`p-1 rounded-full border transition-all ${
              currentUser
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            }`}
            title={currentUser ? currentUser.name : "Masuk Akun Juri"}
          >
            {currentUser ? (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>

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
