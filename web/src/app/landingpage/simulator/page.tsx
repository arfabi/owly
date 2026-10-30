"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DemoAuthButton } from "@/components/DemoAuthButton";
import {
  Compass,
  Lock,
  Unlock,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Volume2,
  Mic,
  Camera,
  Layers,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  FileCheck2,
  Copy,
  Check,
  RefreshCw,
  Upload,
  Eye,
  Type,
  Pause,
  Contrast,
  Maximize2,
  Minimize2,
  FileText,
  Zap,
} from "lucide-react";

export default function SimulatorPage() {
  const { t, language } = useLanguage();

  // Mode View: Docked in Browser vs Side Panel Only
  const [viewMode, setViewMode] = useState<"docked" | "sidepanel">("docked");

  // Shared Form State (Left Panel)
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [essay, setEssay] = useState("");
  const [toefl, setToefl] = useState("");
  const [activeField, setActiveField] = useState<"nik" | "nama" | "tgl" | "toefl" | "photo" | "essay">("nik");
  const [auditResult, setAuditResult] = useState<{
    status: "idle" | "green" | "yellow" | "red";
    message: string;
  }>({ status: "idle", message: "" });

  // Dynamic Live API States
  const [coachCard, setCoachCard] = useState<{
    meaning: string;
    how_to_fill: string;
    example: string;
    pitfalls: string;
    confirmation_ref: string;
    source_type: string;
    cached?: boolean;
  }>({
    meaning: "Nomor identitas kependudukan tunggal 16 digit yang diterbitkan oleh Dinas Dukcapil.",
    how_to_fill: "Ketik 16 digit angka tanpa spasi atau tanda strip. Wajib sesuai fisik e-KTP terbaru.",
    example: "3271041908980002",
    pitfalls: "Jangan gunakan NIK lama pada fotokopi Kartu Keluarga jika Anda baru saja pindah domisili.",
    confirmation_ref: "Buku Panduan LPDP 2026, Bab IV, Hlm. 14",
    source_type: "official"
  });
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [voiceReplyText, setVoiceReplyText] = useState("");
  const [isEssayLoading, setIsEssayLoading] = useState(false);

  // Extension Side Panel State (Right Panel)
  const [activeTab, setActiveTab] = useState<"coach" | "vault" | "audit" | "a11y">("coach");
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(true);
  const [activeProfile, setActiveProfile] = useState<"pribadi" | "pasangan" | "pekerjaan">("pribadi");
  const [showUndoBar, setShowUndoBar] = useState(false);
  const [previousFormSnapshot, setPreviousFormSnapshot] = useState<{
    nik: string;
    nama: string;
    tglLahir: string;
    essay: string;
  } | null>(null);

  // Coach Tab States
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [snipActive, setSnipActive] = useState(false);

  // Efek Panggilan API Cerdas /api/coach/field saat kolom aktif berubah
  React.useEffect(() => {
    if (activeField === "photo") return;

    const fieldKeyMap: Record<string, { key: string; name: string }> = {
      nik: { key: "nik", name: "Nomor Induk Kependudukan (NIK)" },
      nama: { key: "nama", name: "Nama Lengkap Sesuai KTP & Ijazah" },
      tgl: { key: "tglLahir", name: "Tanggal Lahir" },
      toefl: { key: "toefl", name: "Sertifikat Kemampuan Bahasa Inggris (TOEFL/IELTS)" },
      essay: { key: "essay", name: "Esai Komitmen Kembali ke Indonesia & Rencana Kontribusi" }
    };

    const current = fieldKeyMap[activeField] || { key: activeField, name: activeField };

    async function fetchCoach() {
      setIsCoachLoading(true);
      try {
        const res = await fetch("/api/coach/field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portalDomain: "beasiswalpdp.kemenkeu.go.id",
            fieldKey: current.key,
            fieldName: current.name,
            language: language === "en" ? "en" : "id"
          })
        });
        if (res.ok) {
          const data = await res.json();
          setCoachCard(data);
        }
      } catch (err) {
        console.error("Gagal memuat Field Coach live:", err);
      } finally {
        setIsCoachLoading(false);
      }
    }

    fetchCoach();
  }, [activeField, language]);

  // Vault Tab States
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "done">("idle");
  const [essayDraft, setEssayDraft] = useState("");
  const [copied, setCopied] = useState(false);

  // Auditor Tab States
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [photoFixed, setPhotoFixed] = useState(false);

  // A11y Hub States (14 Tools)
  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({
    spotlight: true,
    tts: false,
    contrast: false,
    links: false,
    textSize: false,
    textSpacing: false,
    pauseAnim: false,
    hideImages: false,
    dyslexiaFont: false,
    bigCursor: false,
    liveTooltips: false,
    lineHeight: false,
    textAlign: false,
    colorSat: false,
  });

  const toggleTool = (id: string) => {
    setActiveTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetTools = () => {
    setActiveTools({
      spotlight: false,
      tts: false,
      contrast: false,
      links: false,
      textSize: false,
      textSpacing: false,
      pauseAnim: false,
      hideImages: false,
      dyslexiaFont: false,
      bigCursor: false,
      liveTooltips: false,
      lineHeight: false,
      textAlign: false,
      colorSat: false,
    });
  };

  // Actions
  const handleSingleAutofill = () => {
    setNik("3271041908980002");
  };

  const handleBatchAutofill = () => {
    setPreviousFormSnapshot({ nik, nama, tglLahir, essay });
    setNik("3271041908980002");
    setNama("Budi Santoso");
    setTglLahir("1998-08-19");
    setEssay(
      language === "en"
        ? "Upon completing my Master of Public Policy, my strategic plan is to serve at Bappenas to lead green economy research initiatives."
        : "Pasca menyelesaikan studi Magister Kebijakan Publik, rencana strategis saya adalah kembali mengabdi di Badan Perencanaan Pembangunan Nasional (Bappenas) untuk memimpin riset kebijakan ekonomi hijau."
    );
    setShowUndoBar(true);
  };

  const handleUndo = () => {
    if (previousFormSnapshot) {
      setNik(previousFormSnapshot.nik);
      setNama(previousFormSnapshot.nama);
      setTglLahir(previousFormSnapshot.tglLahir);
      setEssay(previousFormSnapshot.essay);
    } else {
      setNik("");
      setNama("");
      setTglLahir("");
      setEssay("");
    }
    setShowUndoBar(false);
  };

  const handleVoiceToggle = async () => {
    if (voiceStatus !== "idle") {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceStatus("idle");
      return;
    }

    setVoiceStatus("listening");
    const fieldKeyMap: Record<string, string> = {
      nik: "Nomor Induk Kependudukan (NIK)",
      nama: "Nama Lengkap",
      tgl: "Tanggal Lahir",
      toefl: "Sertifikat TOEFL atau IELTS",
      essay: "Esai Komitmen Kontribusi"
    };
    const currentFieldName = fieldKeyMap[activeField] || "kolom formulir ini";
    const userPrompt = `Jelaskan secara singkat aturan resmi untuk ${currentFieldName} di LPDP 2026.`;

    setTimeout(async () => {
      setVoiceStatus("thinking");
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userPrompt,
            portalDomain: "beasiswalpdp.kemenkeu.go.id"
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.reply || "";
          setVoiceReplyText(reply);
          setVoiceStatus("speaking");

          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(reply.substring(0, 180));
            utterance.lang = language === "en" ? "en-US" : "id-ID";
            utterance.rate = 1.05;
            utterance.onend = () => setVoiceStatus("idle");
            utterance.onerror = () => setVoiceStatus("idle");
            window.speechSynthesis.speak(utterance);
          } else {
            setTimeout(() => setVoiceStatus("idle"), 5000);
          }
        } else {
          setVoiceStatus("idle");
        }
      } catch (err) {
        console.error("Voice chat error:", err);
        setVoiceStatus("idle");
      }
    }, 800);
  };

  const handleSimulateOcr = () => {
    setOcrStatus("processing");
    setTimeout(() => {
      setOcrStatus("done");
      setIsVaultUnlocked(true);
    }, 1200);
  };

  const handleGenerateEssay = async () => {
    setIsEssayLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Susun 1 paragraf draf esai komitmen kontribusi LPDP yang padat, terstruktur, akademik dan formal dari 3 poin ini: 1) Lulusan teknik elektro dengan minat energi baru terbarukan, 2) Riset baterai surya untuk daerah tertinggal, 3) Rencana pasca studi mengabdi di BRIN atau Bappenas.",
          portalDomain: "beasiswalpdp.kemenkeu.go.id"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEssayDraft(data.reply || "");
      }
    } catch (err) {
      console.error("Gagal generate esai live:", err);
    } finally {
      setIsEssayLoading(false);
    }
  };

  const handleCopyEssay = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScanPhoto = () => {
    setIsScanningPhoto(true);
    setTimeout(() => {
      setIsScanningPhoto(false);
      setPhotoFixed(true);
    }, 1500);
  };

  const handleAudit = () => {
    if (!nik || !nama || !tglLahir || !essay) {
      setAuditResult({
        status: "red",
        message: language === "en" ? "Audit Failed (Red): Required fields remain unfilled." : "Audit Gagal (Lampu Merah): Masih ada kolom wajib yang belum diisi.",
      });
      return;
    }
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      setAuditResult({
        status: "red",
        message: language === "en" ? "Audit Failed (Red): NIK must be exactly 16 numeric digits." : "Audit Gagal (Lampu Merah): NIK wajib tepat 16 digit angka.",
      });
      return;
    }
    setAuditResult({
      status: "green",
      message: language === "en" ? "Audit Cleared (Green Light): All fields valid per LPDP 2026 Guidelines. Ready to submit!" : "Audit Berhasil (Lampu Hijau): Semua field valid sesuai Juknis LPDP 2026. Siap dikirim!",
    });
  };

  const activeA11yCount = Object.values(activeTools).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/20">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Savvy.AI Logo"
              className="w-6 h-6 object-contain drop-shadow-xs"
            />
            <span className="font-extrabold text-sm tracking-tight text-white">
              Savvy<span className="text-[#398CF5]">.AI</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#398CF5]/10 text-[#398CF5] text-[10px] font-bold border border-[#398CF5]/20">
              Interactive Simulator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px] font-bold">
            <button
              onClick={() => setViewMode("docked")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "docked"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Simulasi Browser Portal</span>
            </button>
            <button
              onClick={() => setViewMode("sidepanel")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "sidepanel"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Minimize2 className="w-3 h-3" />
              <span>Side Panel Saja</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <DemoAuthButton />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Simulator Workspace */}
      <main className="flex-1 flex overflow-hidden p-3 sm:p-5 justify-center items-center">
        {viewMode === "sidepanel" ? (
          /* Standalone Side Panel View */
          <div className="w-[390px] h-[720px] bg-slate-50 border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left text-slate-800">
            {renderSidePanelContent()}
          </div>
        ) : (
          /* Docked Browser Simulator (Left: Mock Form, Right: Savvy Extension) */
          <div className="max-w-6xl w-full h-[760px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Browser Chrome URL Bar */}
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center gap-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 max-w-lg mx-auto bg-slate-950 rounded-md px-3 py-1 text-xs text-slate-400 font-mono flex items-center gap-2 border border-slate-800">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300 text-[11px] truncate">
                  https://beasiswalpdp.kemenkeu.go.id/pendaftaran/form
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800">
                Ekstensi Aktif di Side Panel
              </span>
            </div>

            {/* Browser Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Interactive Simulated Form Portal */}
              <div className="flex-1 bg-[#f8fafc] text-slate-800 p-6 overflow-y-auto text-left relative">
                <div className="max-w-xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                      Portal Simulasi Resmi
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      Pendaftaran Beasiswa LPDP 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Klik kolom di bawah untuk memicu respon cerdas dari Side Panel Savvy di sebelah kanan.
                    </p>
                  </div>

                  {/* Field NIK with Beacon Spotlight */}
                  <div
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      activeField === "nik"
                        ? "bg-blue-50/50 border-2 border-blue-500 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      setActiveField("nik");
                      setActiveTab("coach");
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-900">
                        Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                      </label>
                      {activeField === "nik" && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          Spotlight Aktif
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      placeholder="16 digit angka sesuai e-KTP"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {nik && nik.length === 16 && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                        ✓ Format 16 digit valid
                      </span>
                    )}
                  </div>

                  {/* Field Nama Lengkap */}
                  <div
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      activeField === "nama"
                        ? "bg-blue-50/50 border-2 border-blue-500 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      setActiveField("nama");
                      setActiveTab("coach");
                    }}
                  >
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Nama Lengkap (Sesuai Ijazah &amp; KTP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Field Tanggal Lahir */}
                  <div
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      activeField === "tgl"
                        ? "bg-blue-50/50 border-2 border-blue-500 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      setActiveField("tgl");
                      setActiveTab("coach");
                    }}
                  >
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tglLahir}
                      onChange={(e) => setTglLahir(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Field Kemampuan Bahasa Inggris (TOEFL / IELTS) */}
                  <div
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      activeField === "toefl"
                        ? "bg-blue-50/50 border-2 border-blue-500 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      setActiveField("toefl");
                      setActiveTab("coach");
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        Sertifikat Bahasa Inggris (TOEFL/IELTS) <span className="text-red-500">*</span>
                      </label>
                      {activeField === "toefl" && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          Spotlight Aktif
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={toefl}
                      onChange={(e) => setToefl(e.target.value)}
                      placeholder="Contoh: IELTS 7.0 atau TOEFL iBT 95"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Field Upload Pasfoto */}
                  <div
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      activeField === "photo"
                        ? "bg-blue-50/50 border-2 border-blue-500 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      setActiveField("photo");
                      setActiveTab("audit");
                    }}
                  >
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Unggah Pasfoto Biometrik 2x2 Inci <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-500">
                      Format 35x45 mm berlatar polos (klik untuk uji audit pasfoto di side panel)
                    </div>
                  </div>

                  {/* Field Esai */}
                  <div
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      activeField === "essay"
                        ? "bg-blue-50/50 border-2 border-blue-500 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      setActiveField("essay");
                      setActiveTab("vault");
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        Esai Komitmen Kembali &amp; Kontribusi <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {essay.split(/\s+/).filter(Boolean).length} kata
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={essay}
                      onChange={(e) => setEssay(e.target.value)}
                      placeholder="Deskripsikan rencana kontribusi pasca-studi..."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Audit Alert */}
                  {auditResult.status !== "idle" && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
                        auditResult.status === "green"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {auditResult.status === "green" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>{auditResult.message}</div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 border-t flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleAudit}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Uji Pre-Submit Audit</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed"
                    >
                      Kirim (Submit)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Savvy Chrome Side Panel */}
              <div className="w-[390px] border-l border-slate-800 bg-slate-900 flex flex-col justify-center items-center p-2">
                <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-700 flex flex-col overflow-hidden text-left text-slate-800">
                  {renderSidePanelContent()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  // Helper render side panel content (Used in both docked & standalone)
  function renderSidePanelContent() {
    return (
      <>
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Savvy.AI"
                className="w-7 h-7 object-contain drop-shadow-xs"
              />
              <div>
                <span className="font-extrabold text-xs text-slate-900 tracking-tight">
                  Savvy<span className="text-[#398CF5]">.AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 truncate max-w-[170px]" title="Your AI Browser Companion for Forms & Web">
                  Your AI Browser Companion for Forms & Web
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsVaultUnlocked(!isVaultUnlocked)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                isVaultUnlocked
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isVaultUnlocked ? (
                <>
                  <Unlock className="w-2.5 h-2.5" />
                  <span>Vault Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5" />
                  <span>Buka Vault</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-mono truncate max-w-[180px]">
              beasiswalpdp.kemenkeu.go.id
            </span>
            <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              🎯 LPDP 2026
            </span>
          </div>
        </div>

        {/* 4 Tabs */}
        <div className="grid grid-cols-4 bg-white border-b border-slate-200 text-xs font-bold text-center">
          {[
            { id: "coach", label: "Field Coach", icon: Compass },
            { id: "vault", label: "Vault & Esai", icon: Lock },
            { id: "audit", label: "Pre-Audit", icon: ShieldCheck },
            { id: "a11y", label: "A11y (14)", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 transition-all border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          {/* TAB 1: FIELD COACH */}
          {activeTab === "coach" && (
            <div className="space-y-3">
              {/* Active Field Banner */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-blue-800 font-bold text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>
                      {activeField === "nik" && "Nomor Induk Kependudukan (NIK)"}
                      {activeField === "nama" && "Nama Lengkap (KTP & Ijazah)"}
                      {activeField === "tgl" && "Tanggal Lahir"}
                      {activeField === "toefl" && "Sertifikat Bahasa Inggris (TOEFL/IELTS)"}
                      {activeField === "photo" && "Pasfoto Biometrik 2x2 Inci"}
                      {activeField === "essay" && "Esai Komitmen Kontribusi"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Kolom aktif yang sedang disorot Spotlight
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 shrink-0">
                  {coachCard.source_type === "official" ? "🟢 Resmi LPDP" : "💡 Panduan AI"}
                </span>
              </div>

              {/* 4-Element Card (Live Baseten / Two-Tier Cache) */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 relative">
                {isCoachLoading && (
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs rounded-xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Muse Spark menalar juknis...</span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Arti Istilah:
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5 leading-snug">
                    {coachCard.meaning}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Cara Mengisi:
                  </span>
                  <p className="text-slate-700 mt-0.5 leading-snug">
                    {coachCard.how_to_fill}
                  </p>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Contoh Valid:
                  </span>
                  <code className="text-blue-700 font-mono font-bold text-xs mt-0.5 block">
                    {coachCard.example}
                  </code>
                </div>

                <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Jebakan Umum (Pitfall):
                  </span>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
                    {coachCard.pitfalls}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[210px]" title={coachCard.confirmation_ref}>
                    {coachCard.confirmation_ref}
                  </span>
                  <span className="text-blue-600 font-semibold shrink-0">
                    {coachCard.cached ? "L1/L2 Cache (0ms)" : "Baseten Muse Spark"}
                  </span>
                </div>
              </div>

              {/* Single-Field Autofill Button */}
              <button
                onClick={handleSingleAutofill}
                disabled={!isVaultUnlocked}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                  !isVaultUnlocked
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : nik === "3271041908980002"
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {nik === "3271041908980002" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Telah Terisi dari Vault</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Isi Kolom Ini dari Vault</span>
                  </>
                )}
              </button>

              {/* Handsfree Voicebot */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Handsfree Voicebot (Web Speech)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Native TTS</span>
                </div>

                {/* Waveform */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 h-5 mb-1">
                    {[4, 10, 16, 22, 14, 8, 18, 12, 6].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          voiceStatus === "listening"
                            ? "bg-emerald-500 animate-pulse"
                            : voiceStatus === "thinking"
                            ? "bg-amber-500 animate-bounce"
                            : voiceStatus === "speaking"
                            ? "bg-blue-600 animate-pulse"
                            : "bg-slate-300"
                        }`}
                        style={{ height: voiceStatus !== "idle" ? `${h}px` : "5px" }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600">
                    {voiceStatus === "listening" && "Mendengarkan ucapan Anda..."}
                    {voiceStatus === "thinking" && "Muse Spark sedang menalar juknis di Baseten..."}
                    {voiceStatus === "speaking" && "Menjelaskan aturan suara..."}
                    {voiceStatus === "idle" && "Klik tombol di bawah untuk bertanya pada Savvy"}
                  </div>
                  {voiceReplyText && (
                    <div className="mt-2 p-2 bg-blue-50/80 border border-blue-200/80 rounded-lg text-[11px] text-blue-900 text-left leading-snug">
                      <strong className="text-blue-700 block text-[10px] mb-0.5">Savvy Voice:</strong>
                      {voiceReplyText}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleVoiceToggle}
                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Mic className="w-3 h-3 text-blue-600" />
                  <span>Bicara dengan Savvy</span>
                </button>
              </div>

              {/* Explain This Snip */}
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    <span>Explain This (Vision Snip)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Sensor otomatis DOM Masking lokal
                  </p>
                </div>
                <button
                  onClick={() => setSnipActive(!snipActive)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    snipActive
                      ? "bg-purple-600 text-white"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  {snipActive ? "Aktif" : "Mulai Snip"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VAULT & ESSAY */}
          {activeTab === "vault" && (
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Multiple Vault (AES-256)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Zero-Knowledge
                  </span>
                </div>

                {/* Profiles */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                  {(["pribadi", "pasangan", "pekerjaan"] as const).map((prof) => (
                    <button
                      key={prof}
                      onClick={() => setActiveProfile(prof)}
                      className={`flex-1 py-1 rounded-md transition-all capitalize ${
                        activeProfile === prof
                          ? "bg-white text-blue-600 shadow-2xs font-extrabold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {prof}
                    </button>
                  ))}
                </div>

                {/* Stored Credentials */}
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-400 font-sans font-bold">NIK:</span>
                    <span className="font-bold text-slate-900">{isVaultUnlocked ? "3271041908980002" : "••••••••••••••••"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-400 font-sans font-bold">Nama:</span>
                    <span className="font-bold text-slate-900">{isVaultUnlocked ? "Budi Santoso" : "•••••••••••••"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-400 font-sans font-bold">Tgl Lahir:</span>
                    <span className="font-bold text-slate-900">{isVaultUnlocked ? "19-08-1998" : "••-••-••••"}</span>
                  </div>
                </div>

                {/* Batch Autofill */}
                <button
                  onClick={handleBatchAutofill}
                  disabled={!isVaultUnlocked}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    isVaultUnlocked
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Autofill Semua Kolom</span>
                </button>
              </div>

              {/* UndoBar */}
              {showUndoBar && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-xs">
                  <span className="font-bold text-emerald-800 text-[11px]">
                    ✓ 4 kolom diisi dari Vault
                  </span>
                  <button
                    onClick={handleUndo}
                    className="px-2 py-0.5 bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded font-bold text-[10px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                </div>
              )}

              {/* OCR KTP Upload */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Multimodal KTP Extractor</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Muse Spark Open in-RAM (Zero Retention)
                  </p>
                </div>
                <button
                  onClick={handleSimulateOcr}
                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {ocrStatus === "processing"
                      ? "Mengekstrak KTP..."
                      : ocrStatus === "done"
                      ? "✓ Data KTP Masuk ke Vault"
                      : "Uji Coba Ekstraksi KTP"}
                  </span>
                </button>
              </div>

              {/* Essay Coach */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Essay Coach (3-Bullet Drafting)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Merapikan fakta kasar menjadi esai formal tanpa halusinasi
                  </p>
                </div>
                <button
                  onClick={handleGenerateEssay}
                  disabled={isEssayLoading}
                  className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-75"
                >
                  {isEssayLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Muse Spark Merumuskan Esai...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rancang Draf Narasi Esai (Live AI)</span>
                    </>
                  )}
                </button>

                {essayDraft && (
                  <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-left space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-purple-800">
                      <span>Draf Narasi (Siap Salin):</span>
                      <button
                        onClick={handleCopyEssay}
                        className="flex items-center gap-1 text-purple-700 hover:text-purple-900"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Tersalin" : "Salin"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-800 leading-snug">
                      {essayDraft}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDITOR */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              {/* Traffic Light Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Traffic Light Auditor</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Pre-Submit FSM</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                    <span className="text-[10px] font-bold text-emerald-800 block">3 Siap</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mx-auto mb-0.5" />
                    <span className="text-[10px] font-bold text-amber-800 block">1 Ambigu</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 mx-auto mb-0.5" />
                    <span className="text-[10px] font-bold text-red-800 block">
                      {photoFixed ? "0 Fatal" : "1 Fatal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Compliance Inspector */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Audit Pasfoto (ICAO 9303)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      In-memory sharp deterministik (0% manipulasi piksel)
                    </p>
                  </div>
                </div>

                {/* Simulated Photo Box with Border Beam */}
                <div className="relative mx-auto w-24 h-24 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden">
                  <div className="w-16 h-20 rounded-full border border-dashed border-blue-400 flex flex-col items-center justify-center text-[9px] text-slate-500 font-bold bg-white/40">
                    <span>2x2 Inci</span>
                    <span className="text-[8px] text-blue-600">58% Head</span>
                  </div>
                  {isScanningPhoto && (
                    <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 animate-ping rounded-lg pointer-events-none" />
                  )}
                </div>

                {/* Chips */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Rasio 2x2 Inci: Sah</span>
                    </span>
                    <span className="text-[9px] font-mono">1:1 Ratio</span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-1.5 rounded border ${
                      photoFixed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      {photoFixed ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span>{photoFixed ? "Ketajaman Laplacian: Baik" : "Blur Rendah (48 < 100)"}</span>
                    </span>
                    <span className="text-[9px] font-mono">
                      {photoFixed ? "Var: 142" : "Gagal ICAO"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={handleScanPhoto}
                    disabled={isScanningPhoto}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningPhoto ? "animate-spin text-blue-600" : ""}`} />
                    <span>Pindai Foto</span>
                  </button>
                  <button
                    onClick={() => setPhotoFixed(true)}
                    className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                  >
                    Perbaiki
                  </button>
                </div>
              </div>

              {/* Consistency Checker */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1.5 text-left">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Consistency Checker Agent</span>
                </div>
                <p className="text-[10px] text-slate-600">
                  Nama di Form ('Budi Santoso') vs Nama di Paspor ('BUDI SANTOSO')
                </p>
                <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Konsistensi Data: 100% Selaras</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY HUB (14 TOOLS) */}
          {activeTab === "a11y" && (
            <div className="space-y-2.5">
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Accessibility HUB (14 Tools)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {activeA11yCount} Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-700 font-mono font-semibold">
                    0 Token LLM • Instan &lt;10ms
                  </span>
                  <button
                    onClick={resetTools}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-0.5 font-bold"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* 14 Tools Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: "spotlight", title: "Reading Spotlight", icon: Eye },
                  { id: "tts", title: "Text to Speech (TTS)", icon: Volume2 },
                  { id: "contrast", title: "Contrast Mode", icon: Contrast },
                  { id: "links", title: "Highlight Links", icon: ArrowRight },
                  { id: "textSize", title: "Bigger Text Size", icon: Type },
                  { id: "textSpacing", title: "Text Spacing", icon: Sliders },
                  { id: "pauseAnim", title: "Pause Animations", icon: Pause },
                  { id: "hideImages", title: "Hide All Images", icon: Layers },
                  { id: "dyslexiaFont", title: "Dyslexia Font", icon: Type },
                  { id: "bigCursor", title: "Big Cursor", icon: Maximize2 },
                  { id: "liveTooltips", title: "Live Tooltips", icon: FileText },
                  { id: "lineHeight", title: "Line Height", icon: Sliders },
                  { id: "textAlign", title: "Text Alignment", icon: Type },
                  { id: "colorSat", title: "Color Saturation", icon: Contrast },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTools[tool.id];
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 shadow-2xs ${
                        isActive
                          ? "bg-blue-50 border-blue-400 text-blue-900"
                          : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isActive ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="font-bold text-[11px] leading-tight line-clamp-1 mt-0.5">
                        {tool.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Ribbon */}
        <div className="bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Manifest V3</span>
          </span>
          <span>Closed Shadow DOM Active</span>
        </div>
      </>
    );
  }
}
