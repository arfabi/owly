"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DemoAuthButton } from "@/components/DemoAuthButton";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Layers,
  ArrowRight,
  ExternalLink,
  Bot,
  Sliders,
  Type,
  Maximize2,
  Pause,
  Contrast,
  Compass,
  FileText,
  BadgeAlert,
  ChevronRight,
  Sparkle,
} from "lucide-react";

export default function Home() {
  const { t, language } = useLanguage();
  const isId = language === "id";

  const toolIcons = [
    Eye,
    Volume2,
    Contrast,
    ArrowRight,
    Type,
    Sliders,
    Pause,
    Layers,
    Type,
    Maximize2,
    FileText,
    Sliders,
    Type,
    Contrast,
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500/15 selection:text-blue-700 relative overflow-hidden">
      {/* SkyAgent Style Light Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[120px] pointer-events-none -z-10" />

      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Floating Pill Navbar with LanguageSwitcher */}
      <header className="sticky top-5 z-50 max-w-5xl mx-auto px-4">
        <nav className="magic-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Savvy.AI Logo"
              className="w-8 h-8 object-contain drop-shadow-xs"
            />
            <span className="font-extrabold text-lg tracking-tight text-savvy-navy">
              Savvy<span className="text-savvy-blue">.AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#bento" className="hover:text-blue-600 transition-colors">
              {t.nav.pillars}
            </a>
            <a href="#accessibility" className="hover:text-blue-600 transition-colors">
              {t.nav.accessibility}
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              {t.nav.howItWorks}
            </a>
            <Link href="/mock-portal" className="hover:text-blue-600 transition-colors">
              {t.nav.mockPortal}
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              {isId ? "Keamanan & Privasi" : "Privacy & Security"}
            </Link>
            <Link
              href="/simulator"
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>{t.nav.simulator}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DemoAuthButton />
            <LanguageSwitcher />

            <Link
              href="/simulator"
              className="hidden sm:flex text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-all items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>{t.nav.simulator}</span>
            </Link>
            <Link
              href="/mock-portal"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>{t.nav.demo}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 max-w-5xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkle className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>{t.hero.hackathonBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-savvy-navy leading-[1.12] mb-6">
          {t.hero.titleLine1}
          <br />
          <span className="text-savvy-gradient font-black">
            {t.hero.titleHighlight}
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          {t.hero.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <Link
            href="/mock-portal"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all group"
          >
            <span>{t.hero.ctaMockPortal}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/simulator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm border border-blue-200/80 flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{t.nav.simulator} (Live Mockup)</span>
          </Link>
          <a
            href="#bento"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-sm border border-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{t.hero.ctaLearnSecurity}</span>
          </a>
        </div>

        {/* Clean Light Browser Frame Mockup */}
        <div className="relative mx-auto rounded-2xl bg-white shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden text-left">
          {/* Top Browser Chrome Bar */}
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-white rounded-md px-3 py-1 text-xs text-slate-500 flex items-center gap-2 border border-slate-200 shadow-2xs">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span className="text-slate-700 font-mono text-[11px]">
                https://beasiswalpdp.kemenkeu.go.id/pendaftaran/form
              </span>
            </div>
          </div>

          {/* Simulated Browser Webpage Content & Savvy Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-white">
            {/* Left: Simulated Portal Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 relative bg-[#fafafa]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.browserMockup.formTitle}</h3>
                  <p className="text-xs text-slate-500">{t.browserMockup.formSubtitle}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t.browserMockup.portalDetected}
                </span>
              </div>

              {/* Form Input with Beacon Spotlight */}
              <div className="space-y-4">
                <div className="relative p-4 rounded-xl bg-blue-50/40 border-2 border-blue-500 shadow-xs transition-all">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-900">
                      {t.browserMockup.nikLabel} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      {t.browserMockup.fieldActive}
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled
                    value="3271041908980002"
                    className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 shadow-2xs outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t.browserMockup.nikValidStatus}
                    </span>
                    <span className="text-slate-500 text-[10px]">{t.browserMockup.autofillBadge}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {t.browserMockup.statementLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50/60">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-700 font-medium">{t.browserMockup.pdfFormatNotice}</p>
                    <p className="text-[10px] text-slate-500">{t.browserMockup.legalizedNotice}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Savvy.AI Floating Side Panel */}
            <div className="lg:col-span-5 p-5 bg-white flex flex-col justify-between border-l border-slate-100">
              <div>
                {/* Agent Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="Savvy.AI"
                      className="w-6 h-6 object-contain drop-shadow-xs"
                    />
                    <span className="text-xs font-bold text-savvy-navy">{t.browserMockup.fieldCoachHeader}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t.browserMockup.officialBadge}
                  </span>
                </div>

                {/* 4-Element Guidance Card */}
                <div className="magic-card p-4 space-y-3 text-xs text-left mb-3 bg-slate-50/70 border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {t.browserMockup.officialRuleTitle}
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5 leading-snug">
                      {t.browserMockup.officialRuleDesc}
                    </p>
                  </div>
                  <div className="bg-blue-50/60 rounded-lg p-2.5 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 block">
                      {t.browserMockup.pitfallTitle}
                    </span>
                    <p className="text-[11px] text-blue-900 mt-0.5 leading-snug">
                      {t.browserMockup.pitfallDesc}
                    </p>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                    <span>{t.browserMockup.sourceCitation}</span>
                    <span className="text-blue-600 font-semibold">{t.browserMockup.vectorStoreLabel}</span>
                  </div>
                </div>

                {/* Single-Field Autofill Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.browserMockup.btnAutofillSingle}</span>
                </button>
              </div>

              {/* Bottom Assistant Status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-[11px]">{t.browserMockup.voicebotReady}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t.browserMockup.auditStatusValid}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Portals Marquee */}
      <section className="py-10 border-y border-slate-200 bg-slate-50/70 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
          {t.marquee.title}
        </p>
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex items-center gap-8 text-slate-700 font-semibold text-xs whitespace-nowrap">
            {t.marquee.portals.map((name, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Bento Grid Section */}
      <section id="bento" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {t.pillars.tag}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mt-3 mb-4">
            {t.pillars.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t.pillars.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: UNDERSTAND */}
          <div className="magic-card p-7 flex flex-col justify-between border-t-4 border-t-blue-600">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                {t.pillars.pillar1.tag}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                {t.pillars.pillar1.title}
              </h3>
              <p className="text-slate-500 text-xs italic mb-4">
                {t.pillars.pillar1.quote}
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar1.point1Title}</strong> {t.pillars.pillar1.point1Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar1.point2Title}</strong> {t.pillars.pillar1.point2Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar1.point3Title}</strong> {t.pillars.pillar1.point3Desc}
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              {t.pillars.pillar1.footer}
            </div>
          </div>

          {/* Card 2: FILL */}
          <div className="magic-card p-7 flex flex-col justify-between border-t-4 border-t-indigo-600">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                {t.pillars.pillar2.tag}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                {t.pillars.pillar2.title}
              </h3>
              <p className="text-slate-500 text-xs italic mb-4">
                {t.pillars.pillar2.quote}
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar2.point1Title}</strong> {t.pillars.pillar2.point1Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar2.point2Title}</strong> {t.pillars.pillar2.point2Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar2.point3Title}</strong> {t.pillars.pillar2.point3Desc}
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              {t.pillars.pillar2.footer}
            </div>
          </div>

          {/* Card 3: AUDIT */}
          <div className="magic-card p-7 flex flex-col justify-between border-t-4 border-t-emerald-600">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                {t.pillars.pillar3.tag}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                {t.pillars.pillar3.title}
              </h3>
              <p className="text-slate-500 text-xs italic mb-4">
                {t.pillars.pillar3.quote}
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar3.point1Title}</strong> {t.pillars.pillar3.point1Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar3.point2Title}</strong> {t.pillars.pillar3.point2Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t.pillars.pillar3.point3Title}</strong> {t.pillars.pillar3.point3Desc}
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              {t.pillars.pillar3.footer}
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility HUB 14 Tools Showcase */}
      <section id="accessibility" className="py-20 px-4 max-w-6xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.accessibility.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            {t.accessibility.title}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-3">
            {t.accessibility.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {t.accessibility.tools.map((tool, idx) => {
            const Icon = toolIcons[idx % toolIcons.length];
            return (
              <div
                key={idx}
                className="magic-card p-3.5 text-center flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{tool.title}</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {tool.status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works: 4 Easy Steps */}
      <section id="how-it-works" className="py-20 px-4 max-w-5xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {t.howItWorks.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3">
            {t.howItWorks.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {t.howItWorks.steps.map((item, idx) => (
            <div key={idx} className="magic-card p-6 relative">
              <span className="text-4xl font-black text-slate-200 block mb-3">{item.step}</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SkyAgent Call to Action Banner */}
      <section id="install" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[90px] pointer-events-none -z-10" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t.ctaBanner.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            {t.ctaBanner.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/mock-portal"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{t.ctaBanner.btnDemo}</span>
              <ExternalLink className="w-4 h-4 text-white" />
            </Link>
            <a
              href="https://github.com/arfabi/savvy"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{t.ctaBanner.btnDocs}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
        <p>{t.footer.copyright}</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-slate-600 font-medium">
          <Link href="/privacy" className="text-blue-600 font-bold hover:underline">
            {isId ? "Keamanan & Kebijakan Privasi (/privacy)" : "Security & Privacy Policy (/privacy)"}
          </Link>
          <span>•</span>
          <Link href="/mock-portal" className="hover:text-blue-600">
            Mock Portal
          </Link>
          <span>•</span>
          <Link href="/simulator" className="hover:text-blue-600">
            Simulator
          </Link>
        </div>
        <p className="mt-2 text-slate-400">{t.footer.subline}</p>
      </footer>
    </div>
  );
}
