import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { Accessibility, MoreVertical, Globe, User, LogOut, Check } from "lucide-react";

interface HeaderProps {
  onOpenAccessibilityHub?: () => void;
  currentUser?: { name: string; email: string } | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export function Header({
  onOpenAccessibilityHub,
  currentUser,
  onOpenAuthModal,
  onLogout,
}: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
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

      {/* Right Icons: Accessibility HUB & 3-Dots Menu */}
      <div className="flex items-center gap-1" ref={menuRef}>
        {/* Accessibility HUB Button */}
        <button
          onClick={onOpenAccessibilityHub}
          className="p-1.5 rounded-lg text-slate-500 hover:text-savvy-blue hover:bg-slate-100 transition-colors"
          title="Accessibility HUB (14 Tools)"
        >
          <Accessibility className="w-4 h-4" />
        </button>

        {/* 3-Dots Button */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`p-1.5 rounded-lg transition-colors ${
            isMenuOpen
              ? "text-savvy-blue bg-blue-50"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title="Opsi Menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown 3 Opsi */}
        {isMenuOpen && (
          <div className="absolute right-3 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Opsi 1: Pilih Bahasa */}
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>Pilih Bahasa</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    setLanguage("id");
                    setIsMenuOpen(false);
                  }}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    language === "id"
                      ? "bg-savvy-blue text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {language === "id" && <Check className="w-3 h-3" />}
                  <span>Indonesia</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage("en");
                    setIsMenuOpen(false);
                  }}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    language === "en"
                      ? "bg-savvy-blue text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {language === "en" && <Check className="w-3 h-3" />}
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Opsi 2: Account */}
            <button
              onClick={() => {
                onOpenAuthModal?.();
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <div className="min-w-0 flex-1 truncate">
                <span>Account</span>
                {currentUser && (
                  <span className="text-[10px] text-slate-400 block truncate">
                    {currentUser.name}
                  </span>
                )}
              </div>
            </button>

            {/* Opsi 3: Logout */}
            <button
              onClick={() => {
                onLogout?.();
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
