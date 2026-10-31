"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Sparkles, Sliders, Laptop, ShieldCheck, Download } from "lucide-react";

export function Navbar() {
  const { t, language } = useLanguage();
  const isId = language === "id";

  return (
    <header className="sticky top-5 z-50 max-w-5xl mx-auto px-4 w-full">
      <nav className="magic-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-xs">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/owly.png"
            alt="Owly.AI Logo"
            className="w-8 h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-lg tracking-tight text-savvy-navy">
            Owly<span className="text-savvy-blue">.AI</span>
          </span>
        </Link>

        {/* Navigation Links with Lucide Icons */}
        <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
          <a href="/#bento" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.nav.pillars}</span>
          </a>
          <a href="/#accessibility" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.nav.accessibility}</span>
          </a>
          <Link href="/simulator" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.nav.simulator}</span>
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>{isId ? "Privasi" : "Privacy"}</span>
          </Link>
        </div>

        {/* Right Action: Language Switcher & Download Button */}
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />

          <Link
            href="/download"
            className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isId ? "Unduh" : "Download"}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
