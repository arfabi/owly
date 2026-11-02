"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Navbar } from "@/components/Navbar";
import {
  Download,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Laptop,
  Play,
  Volume2,
  VolumeX,
  Clock,
} from "lucide-react";

export default function DownloadPage() {
  const { t, language } = useLanguage();
  const isId = language === "id";
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSeek = (timeStr: string) => {
    if (!videoRef.current) return;
    const parts = timeStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    videoRef.current.currentTime = seconds;
    videoRef.current.play().catch(() => {});
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500/15 selection:text-blue-700 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[120px] pointer-events-none -z-10" />

      {/* Subtle Dot Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Unified Navbar */}
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-12 px-4 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
          <Laptop className="w-3.5 h-3.5" />
          <span>{t.downloadSection.chromiumBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-savvy-navy leading-[1.15] mb-5">
          {t.downloadSection.title}
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          {t.downloadSection.subtitle}
        </p>

        {/* Big Download ZIP Card */}
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-blue-50/50 border-2 border-blue-200 shadow-xl shadow-blue-500/5 text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Download className="w-8 h-8 animate-bounce" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Owly.AI Extension Package
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {isId
              ? "Paket siap pasang berisi manifest.json, background worker, dan AI sidepanel bundle."
              : "Ready-to-load bundle containing manifest.json, background worker, and AI sidepanel."}
          </p>

          <a
            href="/owly-extension.zip"
            download="owly-extension.zip"
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-5 h-5" />
            <span>{t.downloadSection.btnDownloadZip}</span>
          </a>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Manifest V3
            </span>
            <span>•</span>
            <span>Size: ~6.3 MB</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              {isId ? "100% Bebas Malware" : "100% Clean & Safe"}
            </span>
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3 shadow-2xs">
            <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            <span>{t.downloadSection.videoBadge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            {t.downloadSection.videoTitle}
          </h2>

          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.downloadSection.videoSubtitle}
          </p>
        </div>

        {/* Video Player Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl bg-slate-950 overflow-hidden relative group">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/20 blur-[100px] pointer-events-none" />

          {/* Window / Player Title Bar */}
          <div className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-300 font-medium hidden sm:inline">
                owly-install-tutorial.mp4
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title={isMuted ? (isId ? "Nyalakan Suara" : "Unmute") : (isId ? "Bisukan Suara" : "Mute")}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isId ? "Suara Mati" : "Muted"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isId ? "Suara Hidup" : "Unmuted"}</span>
                  </>
                )}
              </button>

              <a
                href="https://www.youtube.com/watch?v=vfNBFFgfblg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors"
                title={isId ? "Tonton di YouTube" : "Watch on YouTube"}
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">YouTube</span>
              </a>

              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Autoplay
              </span>
            </div>
          </div>

          {/* The Video Element */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/owly-install-tutorial.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Video Timestamps Jump Bar */}
          {t.downloadSection.videoTimestamps && t.downloadSection.videoTimestamps.length > 0 && (
            <div className="bg-slate-900/90 border-t border-slate-800/80 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{isId ? "Lompat ke Langkah:" : "Jump to Step:"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.downloadSection.videoTimestamps.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSeek(item.time)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500/50 text-xs text-slate-200 transition-all cursor-pointer group/btn text-left"
                  >
                    <span className="font-mono text-[11px] text-blue-400 font-bold group-hover/btn:text-blue-300">
                      {item.time}
                    </span>
                    <span className="text-slate-300 group-hover/btn:text-white">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Browser Compatibility & Quick Links */}
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {isId ? "Pilih Browser Anda" : "Supported Chromium Browsers"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isId
              ? "Salin URL ekstensi di bawah ini lalu buka di tab baru browser Anda"
              : "Copy the extension manager URL below and open it in a new tab"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {t.downloadSection.browsers.map((browser, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">{browser.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{browser.note}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded truncate flex-1">
                  {browser.url}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(browser.url)}
                  title="Copy URL"
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                >
                  {copiedUrl === browser.url ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {isId ? "Instalasi Cepat" : "Fast Installation"}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            {t.downloadSection.guideTitle}
          </h2>
        </div>

        <div className="space-y-4">
          {t.downloadSection.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-blue-300 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-extrabold text-lg flex items-center justify-center shrink-0">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                {step.tip && (
                  <div className="mt-2 text-[11px] font-semibold text-blue-700 bg-blue-50/70 px-3 py-1 rounded-md inline-block">
                    💡 {step.tip}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live AI Reasoning & Developer Callout */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[100px] pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              {t.agentConsole.badge}
            </span>
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-3">
            {t.agentConsole.title}
          </h3>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl">
            {t.agentConsole.desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {t.agentConsole.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>
              {isId
                ? "💡 Cara buka: Klik icon Terminal [ >_ ] di navbar kanan header ekstensi Owly."
                : "💡 How to open: Click the Terminal [ >_ ] icon in the top-right header of Owly extension."}
            </span>
          </div>
        </div>
      </section>

      {/* Ready to Test CTA */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
          {isId ? "Sudah Pasang Ekstensi? Uji Coba Sekarang!" : "Extension Installed? Test It Live!"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-8">
          {isId
            ? "Buka Simulator LPDP untuk melihat Owly.AI mendeteksi formulir, menganalisis syarat, autofill dari Vault, dan menjalankan audit pra-kirim."
            : "Launch the LPDP Simulator to watch Owly.AI detect forms, profile requirements, autofill from Vault, and perform pre-submit auditing."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/simulator"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{isId ? "Buka Simulator LPDP" : "Open LPDP Simulator"}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{isId ? "Kembali ke Beranda" : "Back to Home"}</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
        <p>{t.footer.copyright}</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-slate-600 font-medium">
          <Link href="/privacy" className="text-blue-600 font-bold hover:underline">
            {isId ? "Keamanan & Privasi (/privacy)" : "Security & Privacy (/privacy)"}
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
