import React, { useState, useEffect } from "react";
import {
  WELCOME_LANGUAGES,
  getWelcomeI18n,
} from "./welcomeI18n";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Volume2,
  Crop,
  CheckCircle2,
  ExternalLink,
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* SkyAgent Style Light Ambient Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="fixed top-[600px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[120px] pointer-events-none -z-10" />

      {/* Subtle Dot Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <img src="/owly.png" alt="Owly.AI" className="w-8 h-8 object-contain drop-shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">Owly.AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5">{t.header.badge}</p>
          </div>
        </div>

        {/* Current Language Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-2xs">
            <span>{currentLangObj.flag}</span>
            <span className="font-semibold">{currentLangObj.nativeName}</span>
          </div>
        </div>
      </header>

      {/* 2. Stepper Progress Bar */}
      <div className="border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-sm px-6 py-3 overflow-x-auto">
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : isCompleted
                    ? "text-emerald-700 hover:bg-emerald-50/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? "bg-white text-blue-600"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🌐 Step 1 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step1.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step1.subtitle}</p>
            </div>

            {/* 14 Language Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              {WELCOME_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group shadow-2xs ${
                      isSelected
                        ? "bg-blue-50/90 border-blue-600 text-slate-900 ring-2 ring-blue-500/20 shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="font-bold text-xs text-slate-900 leading-snug">{lang.nativeName}</p>
                        <p className="text-[10px] text-slate-500 leading-snug">{lang.name}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center max-w-md mx-auto text-xs text-emerald-700 flex items-center justify-center gap-2 shadow-2xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🦉 Step 2 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step2.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step2.subtitle}</p>
            </div>

            {/* Hero Cover Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl max-w-2xl mx-auto bg-white">
              <img
                src="/screenshots/owly_cover.png"
                alt="Owly.AI Cover Banner"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* 3 Overview Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5 shadow-2xs">
                <span className="text-blue-700 font-bold text-xs flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-600" />
                  {t.step2.whatIs}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step2.whatIsDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 shadow-2xs">
                <span className="text-purple-700 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  {t.step2.whoFor}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step2.whoForDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5 shadow-2xs">
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {t.step2.poweredBy}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step2.poweredByDesc}</p>
              </div>
            </div>

            {/* How to Launch / Pin Screenshot */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <div className="flex-1 space-y-2 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  {t.step2.howToOpen}
                </span>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span className="font-medium">{t.step2.stepPin}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span className="font-medium">{t.step2.stepSidePanel}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span className="font-medium">{t.step2.stepShortcut}</span>
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-56 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🎙️ Step 3 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step3.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step3.subtitle}</p>
            </div>

            {/* Tab Switcher: Voice vs Snip */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setStep3Tab("voice")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  step3Tab === "voice"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.step3.tabVoice}</span>
              </button>
              <button
                onClick={() => setStep3Tab("snip")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  step3Tab === "snip"
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50/80 p-2.5 text-center shadow-xs">
                    <p className="text-[11px] font-bold text-slate-600 mb-2">Push-to-Talk (PTT)</p>
                    <img
                      src="/screenshots/voice_ptt.png"
                      alt="Voice PTT"
                      className="w-full h-72 object-contain rounded-lg border border-slate-200/60 bg-white"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50/80 p-2.5 text-center shadow-xs">
                    <p className="text-[11px] font-bold text-slate-600 mb-2">Live Talk (Hands-Free)</p>
                    <img
                      src="/screenshots/voice_live_talk.png"
                      alt="Voice Live Talk"
                      className="w-full h-72 object-contain rounded-lg border border-slate-200/60 bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 text-left shadow-xs">
                  <span className="text-xs font-bold text-blue-700">{t.step3.voiceTitle}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.step3.voiceDesc}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-2">
                    ⚡ {t.step3.voiceHighlight}
                  </p>
                </div>
              </div>
            )}

            {/* Tab Content: Snip Explain */}
            {step3Tab === "snip" && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50/80 p-2.5 text-center shadow-xs">
                    <p className="text-[11px] font-bold text-slate-600 mb-2">1. Drag & Crop Any Clause</p>
                    <img
                      src="/screenshots/snip_1_crop.png"
                      alt="Snip Crop"
                      className="w-full h-56 object-cover rounded-lg border border-slate-200/60 bg-white"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50/80 p-2.5 text-center shadow-xs">
                    <p className="text-[11px] font-bold text-slate-600 mb-2">2. Instant 5-Pillar Plain Breakdown</p>
                    <img
                      src="/screenshots/snip_2_explain.png"
                      alt="Snip Explain"
                      className="w-full h-56 object-cover rounded-lg border border-slate-200/60 bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 text-left shadow-xs">
                  <span className="text-xs font-bold text-purple-700">{t.step3.snipTitle}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.step3.snipDesc}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-2">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🎯 Step 4 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step4.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step4.subtitle}</p>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
              {[
                { num: 1, label: t.step4.slide1, desc: t.step4.slide1Desc },
                { num: 2, label: t.step4.slide2, desc: t.step4.slide2Desc },
                { num: 3, label: t.step4.slide3, desc: t.step4.slide3Desc },
              ].map((slide) => {
                const isActive = step4Slide === slide.num;
                return (
                  <button
                    key={slide.num}
                    onClick={() => setStep4Slide(slide.num)}
                    className={`p-2.5 rounded-xl border text-left transition-all shadow-2xs ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold text-xs leading-snug">{slide.label}</p>
                    <p className="text-[10px] opacity-80 truncate">{slide.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Screenshot Display */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl max-w-3xl mx-auto bg-slate-50">
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
            <div className="p-4 rounded-xl bg-white border border-slate-200 max-w-3xl mx-auto space-y-2 text-left shadow-xs">
              <span className="text-xs font-bold text-emerald-700">{t.step4.cardPillarsTitle}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step4.pillarMeaning}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step4.pillarHowTo}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step4.pillarExample}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🔐 Step 5 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step5.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step5.subtitle}</p>
            </div>

            {/* Architecture SVG Diagram */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl max-w-2xl mx-auto bg-white p-4">
              <img
                src="/screenshots/meta_tooling.svg"
                alt="Zero-Knowledge Architecture"
                className="w-full h-auto object-contain max-h-[300px]"
              />
            </div>

            {/* 3 Vault & Privacy Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5 shadow-2xs">
                <span className="text-blue-700 font-bold text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {t.step5.vaultTitle}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step5.vaultDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5 shadow-2xs">
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  {t.step5.privacyPromise}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step5.privacyPromiseDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 shadow-2xs">
                <span className="text-purple-700 font-bold text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                  {t.step5.autofillTitle}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step5.autofillDesc}</p>
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🚦 Step 6 of 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step6.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step6.subtitle}</p>
            </div>

            {/* Toggle: Traffic Light Card vs Full Viewport */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setStep6Tab("card")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  step6Tab === "card"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{t.step6.tabCard}</span>
              </button>
              <button
                onClick={() => setStep6Tab("full")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  step6Tab === "full"
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{t.step6.tabFull}</span>
              </button>
            </div>

            {/* Screenshot View */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl max-w-3xl mx-auto bg-slate-50 p-2.5">
              <img
                src={step6Tab === "card" ? "/screenshots/audit_card.png" : "/screenshots/audit_full.png"}
                alt="Form Auditor Showcase"
                className="w-full h-auto object-contain max-h-[360px] rounded-lg border border-slate-200/60 bg-white"
              />
            </div>

            {/* 4 Layers Breakdown Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 max-w-3xl mx-auto space-y-2 text-left shadow-xs">
              <span className="text-xs font-bold text-amber-700">{t.step6.fourLayersTitle}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step6.layer1}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step6.layer2}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step6.layer3}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  {t.step6.layer4}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-1">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-1 shadow-2xs">
                <span>🎉 Step 7 of 7 — Ready!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.step7.title}
              </h2>
              <p className="text-sm text-slate-600">{t.step7.subtitle}</p>
            </div>

            {/* Launch Banner */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl max-w-2xl mx-auto bg-white">
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
                className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex flex-col items-center justify-center gap-1.5 group"
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
                className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>{t.step7.ctaSidePanel}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">{t.step7.ctaSidePanelDesc}</p>
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-center max-w-md mx-auto text-xs text-blue-700 font-medium shadow-2xs">
              📌 {t.step7.pinReminder}
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Navigation Controls Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 sticky bottom-0 z-50 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentStep === 1
                ? "opacity-30 cursor-not-allowed text-slate-400"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.controls.back}</span>
          </button>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps && (
              <button
                onClick={() => setCurrentStep(totalSteps)}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
              >
                {t.controls.skip}
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
              >
                <span>{t.controls.next}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleOpenSimulator}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
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
