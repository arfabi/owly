import React, { useState, useEffect } from "react";
import {
  WELCOME_LANGUAGES,
  getWelcomeI18n,
  WelcomeLanguageItem,
} from "./welcomeI18n";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Volume2,
  Mic,
  Crop,
  CheckCircle2,
  ExternalLink,
  Bot,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
  Sliders,
  FileText,
  AlertTriangle,
  Pin,
  Laptop,
} from "lucide-react";

export function WelcomeApp() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<string>("en");

  // Step 3 Sub-tabs (Voice vs Snip)
  const [step3Tab, setStep3Tab] = useState<"voice" | "snip">("voice");
  // Step 4 Sub-slides (Analyze -> Summary -> Badges)
  const [step4Slide, setStep4Slide] = useState<number>(1);
  // Step 6 Sub-tabs (Card vs Full Viewport)
  const [step6Tab, setStep6Tab] = useState<"card" | "full">("card");

  // Load existing language preference on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["savvy_preferred_language"], (res: { [key: string]: any }) => {
        if (res && typeof res.savvy_preferred_language === "string") {
          setSelectedLang(res.savvy_preferred_language);
        }
      });
    }
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLang(langCode);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ savvy_preferred_language: langCode }).catch(() => {});
    }
  };

  const handleOpenSidePanel = () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" }).catch((err) => {
        console.warn("[Welcome] Could not open sidepanel:", err);
      });
    }
  };

  const handleOpenSimulator = () => {
    window.open("https://owly-ai.vercel.app/simulator", "_blank");
  };

  const t = getWelcomeI18n(selectedLang);
  const currentLangObj = WELCOME_LANGUAGES.find((l) => l.code === selectedLang) || WELCOME_LANGUAGES[0];

  const totalSteps = 7;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Header Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/owly.png" alt="Owly.AI" className="w-8 h-8 object-contain drop-shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Owly.AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">{t.header.badge}</p>
          </div>
        </div>

        {/* Current Language Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <span>{currentLangObj.flag}</span>
            <span className="font-semibold">{currentLangObj.nativeName}</span>
          </div>
        </div>
      </header>

      {/* 2. Stepper Progress Bar */}
      <div className="border-b border-slate-800/60 bg-slate-900/30 px-6 py-3 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 min-w-[620px]">
          {[
            { num: 1, label: t.stepper.step1 },
            { num: 2, label: t.stepper.step2 },
            { num: 3, label: t.stepper.step3 },
            { num: 4, label: t.stepper.step4 },
            { num: 5, label: t.stepper.step5 },
            { num: 6, label: t.stepper.step6 },
            { num: 7, label: t.stepper.step7 },
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : isCompleted
                    ? "text-emerald-400 hover:bg-slate-800/60"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? "bg-white text-blue-600"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dynamic Step Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-10 flex flex-col justify-center">
        {/* ================================================================= */}
        {/* STEP 1: LANGUAGE SELECTION (14 LANGUAGES)                          */}
        {/* ================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
                <span>🌐 Step 1 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step1.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step1.subtitle}</p>
            </div>

            {/* 14 Language Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              {WELCOME_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="font-bold text-xs text-white leading-snug">{lang.nativeName}</p>
                        <p className="text-[10px] text-slate-400 leading-snug">{lang.name}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center max-w-md mx-auto text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{t.step1.activeNotice}</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: MEET OWLY (INTRO, TECH & HOW TO LAUNCH)                    */}
        {/* ================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
                <span>🦉 Step 2 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step2.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step2.subtitle}</p>
            </div>

            {/* Hero Cover Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl max-w-2xl mx-auto">
              <img
                src="/screenshots/owly_cover.png"
                alt="Owly.AI Cover Banner"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* 3 Overview Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  {t.step2.whatIs}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{t.step2.whatIsDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-purple-400 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {t.step2.whoFor}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{t.step2.whoForDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t.step2.poweredBy}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{t.step2.poweredByDesc}</p>
              </div>
            </div>

            {/* How to Launch / Pin Screenshot */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-900/40 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 space-y-2 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  {t.step2.howToOpen}
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 font-bold text-[10px] flex items-center justify-center">1</span>
                    {t.step2.stepPin}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 font-bold text-[10px] flex items-center justify-center">2</span>
                    {t.step2.stepSidePanel}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 font-bold text-[10px] flex items-center justify-center">3</span>
                    {t.step2.stepShortcut}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-56 shrink-0 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                <img
                  src="/screenshots/pin_extension.png"
                  alt="Pin Extension to Chrome Toolbar"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: ASK OWLY (VOICE COMPANION & SNIP EXPLAIN)                  */}
        {/* ================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
                <span>🎙️ Step 3 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step3.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step3.subtitle}</p>
            </div>

            {/* Tab Switcher: Voice vs Snip */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setStep3Tab("voice")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step3Tab === "voice"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.step3.tabVoice}</span>
              </button>
              <button
                onClick={() => setStep3Tab("snip")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step3Tab === "snip"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>{t.step3.tabSnip}</span>
              </button>
            </div>

            {/* Tab Content: Voice Companion */}
            {step3Tab === "voice" && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 p-2 text-center">
                    <p className="text-[11px] font-bold text-slate-400 mb-2">Push-to-Talk (PTT)</p>
                    <img
                      src="/screenshots/voice_ptt.png"
                      alt="Voice PTT"
                      className="w-full h-72 object-contain rounded-lg"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 p-2 text-center">
                    <p className="text-[11px] font-bold text-slate-400 mb-2">Live Talk (Hands-Free)</p>
                    <img
                      src="/screenshots/voice_live_talk.png"
                      alt="Voice Live Talk"
                      className="w-full h-72 object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-left">
                  <span className="text-xs font-bold text-blue-400">{t.step3.voiceTitle}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.step3.voiceDesc}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2 mt-2">
                    ⚡ {t.step3.voiceHighlight}
                  </p>
                </div>
              </div>
            )}

            {/* Tab Content: Snip Explain */}
            {step3Tab === "snip" && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 p-2 text-center">
                    <p className="text-[11px] font-bold text-slate-400 mb-2">1. Drag & Crop Any Clause</p>
                    <img
                      src="/screenshots/snip_1_crop.png"
                      alt="Snip Crop"
                      className="w-full h-56 object-cover rounded-lg"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 p-2 text-center">
                    <p className="text-[11px] font-bold text-slate-400 mb-2">2. Instant 5-Pillar Plain Breakdown</p>
                    <img
                      src="/screenshots/snip_2_explain.png"
                      alt="Snip Explain"
                      className="w-full h-56 object-cover rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-left">
                  <span className="text-xs font-bold text-purple-400">{t.step3.snipTitle}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.step3.snipDesc}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2 mt-2">
                    🧠 {t.step3.snipHighlight}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: FORMS GUIDE (3-STEP CAROUSEL)                              */}
        {/* ================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
                <span>🎯 Step 4 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step4.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step4.subtitle}</p>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
              {[
                { num: 1, label: t.step4.slide1, desc: t.step4.slide1Desc, img: "/screenshots/forms_guide_1_analyze.png" },
                { num: 2, label: t.step4.slide2, desc: t.step4.slide2Desc, img: "/screenshots/forms_guide_2_summary.png" },
                { num: 3, label: t.step4.slide3, desc: t.step4.slide3Desc, img: "/screenshots/forms_guide_3_result.png" },
              ].map((slide) => {
                const isActive = step4Slide === slide.num;
                return (
                  <button
                    key={slide.num}
                    onClick={() => setStep4Slide(slide.num)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="font-bold text-xs leading-snug">{slide.label}</p>
                    <p className="text-[10px] opacity-80 truncate">{slide.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Screenshot Display */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-w-3xl mx-auto bg-slate-900">
              <img
                src={
                  step4Slide === 1
                    ? "/screenshots/forms_guide_1_analyze.png"
                    : step4Slide === 2
                    ? "/screenshots/forms_guide_2_summary.png"
                    : "/screenshots/forms_guide_3_result.png"
                }
                alt="Forms Guide Walkthrough"
                className="w-full h-auto object-cover max-h-[380px]"
              />
            </div>

            {/* 4 Pillars Summary Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-3xl mx-auto space-y-2 text-left">
              <span className="text-xs font-bold text-emerald-400">{t.step4.cardPillarsTitle}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step4.pillarMeaning}
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step4.pillarHowTo}
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step4.pillarExample}
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step4.pillarPitfall}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: 1-CLICK AUTOFILL & PRIVATE VAULT                           */}
        {/* ================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
                <span>🔐 Step 5 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step5.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step5.subtitle}</p>
            </div>

            {/* Architecture SVG Diagram */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl max-w-2xl mx-auto bg-slate-900/80 p-4">
              <img
                src="/screenshots/meta_tooling.svg"
                alt="Zero-Knowledge Architecture"
                className="w-full h-auto object-contain max-h-[300px]"
              />
            </div>

            {/* 3 Vault & Privacy Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {t.step5.vaultTitle}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{t.step5.vaultDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  {t.step5.privacyPromise}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{t.step5.privacyPromiseDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-purple-400 font-bold text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  {t.step5.autofillTitle}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{t.step5.autofillDesc}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 6: PRE-SUBMIT FORM AUDITOR                                    */}
        {/* ================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
                <span>🚦 Step 6 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step6.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step6.subtitle}</p>
            </div>

            {/* Toggle: Traffic Light Card vs Full Viewport */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setStep6Tab("card")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step6Tab === "card"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{t.step6.tabCard}</span>
              </button>
              <button
                onClick={() => setStep6Tab("full")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step6Tab === "full"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{t.step6.tabFull}</span>
              </button>
            </div>

            {/* Screenshot View */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-w-3xl mx-auto bg-slate-900 p-2">
              <img
                src={step6Tab === "card" ? "/screenshots/audit_card.png" : "/screenshots/audit_full.png"}
                alt="Form Auditor Showcase"
                className="w-full h-auto object-contain max-h-[360px] rounded-lg"
              />
            </div>

            {/* 4 Layers Breakdown Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-3xl mx-auto space-y-2 text-left">
              <span className="text-xs font-bold text-amber-400">{t.step6.fourLayersTitle}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step6.layer1}
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step6.layer2}
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step6.layer3}
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  {t.step6.layer4}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2 mt-1">
                🧠 {t.step6.metaReasoning}
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 7: READY TO LAUNCH & TEST CTA                                 */}
        {/* ================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
                <span>🎉 Step 7 of 7 — Ready!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t.step7.title}
              </h2>
              <p className="text-sm text-slate-400">{t.step7.subtitle}</p>
            </div>

            {/* Launch Banner */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-w-2xl mx-auto">
              <img
                src="/screenshots/owly_cover.png"
                alt="Owly Ready to Launch"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Two Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
              <button
                onClick={handleOpenSimulator}
                className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4" />
                  <span>{t.step7.ctaSimulator}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-blue-100 font-normal">{t.step7.ctaSimulatorDesc}</p>
              </button>

              <button
                onClick={handleOpenSidePanel}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-white font-bold text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>{t.step7.ctaSidePanel}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">{t.step7.ctaSidePanelDesc}</p>
              </button>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center max-w-md mx-auto text-xs text-blue-300">
              📌 {t.step7.pinReminder}
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Navigation Controls Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky bottom-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === 1
                ? "opacity-30 cursor-not-allowed text-slate-500"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.controls.back}</span>
          </button>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps && (
              <button
                onClick={() => setCurrentStep(totalSteps)}
                className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
              >
                {t.controls.skip}
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <span>{t.controls.next}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleOpenSimulator}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <span>{t.controls.finish}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
