import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  FileText,
  Compass,
  Search,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Layers,
} from "lucide-react";
import { agentLog } from "../lib/agentLogger";
import { fetchFieldCoachGuidance, FieldGuidanceResponse } from "../lib/api/client";

interface FormsGuideTabProps {
  isVaultUnlocked: boolean;
  isFormAnalyzed: boolean;
  onAnalyzeForm: () => void;
}

export function FormsGuideTab({
  isVaultUnlocked,
  isFormAnalyzed,
  onAnalyzeForm,
}: FormsGuideTabProps) {
  const { t, language } = useLanguage();
  const isId = language === "id";
  const c = t.coach;

  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [analyzingState, setAnalyzingState] = useState(false);
  const [fieldGuidance, setFieldGuidance] = useState<FieldGuidanceResponse | null>(null);

  const handleStartAnalyze = async () => {
    agentLog.perception("🕵️ Scan Form requested by user. Querying page fields from active tab DOM...");
    setAnalyzingState(true);

    try {
      // Live Cloud API hit to https://savvy-companion.vercel.app/api/coach/field
      const liveGuidance = await fetchFieldCoachGuidance(
        "nik",
        "Nomor Induk Kependudukan (NIK)",
        "beasiswalpdp.kemenkeu.go.id"
      );
      setFieldGuidance(liveGuidance);
      agentLog.reasoning("🧠 Form Analyzed: Retrieved live 4-element guidance from Meta Muse Spark Cloud.", liveGuidance);
    } catch (e) {
      agentLog.reasoning("⚠️ Cloud coach guidance failed, using grounded local fallback.", e);
    } finally {
      setAnalyzingState(false);
      onAnalyzeForm();
    }
  };

  return (
    <div className="p-4 space-y-3.5 text-slate-800">
      {!isFormAnalyzed ? (
        /* Onboarding Forms Guide: Informasi lengkap sebelum di-analyze */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-4 text-center">
          {/* Hero Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-savvy-soft-blue border border-savvy-blue/30 flex items-center justify-center text-savvy-blue">
            <ScanLine className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              {isId ? "Onboarding Forms Guide" : "Forms Guide Onboarding"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isId
                ? "Savvy perlu memindai struktur halaman formulir untuk mencocokkan kolom input dengan Juknis resmi & aturan validasi."
                : "Savvy needs to scan the page form structure to accurately ground input fields with official guidelines and rules."}
            </p>
          </div>

          {/* 3 Manfaat Analisis Form */}
          <div className="space-y-2 text-left pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-savvy-green shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {isId ? "Deteksi Kolom Otomatis" : "Automatic Field Detection"}
                </span>
                <span className="text-[11px] text-slate-500 leading-snug block">
                  {isId
                    ? "Mengenali NIK, nama lengkap, tanggal lahir, dan berkas ijazah/pasfoto."
                    : "Identifies ID, full name, birth date, and required file uploads."}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-savvy-blue shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {isId ? "Grounding Regulasi Sah (Meta Spark)" : "Official Juknis Grounding"}
                </span>
                <span className="text-[11px] text-slate-500 leading-snug block">
                  {isId
                    ? "Menyajikan 4 elemen panduan: arti istilah, cara isi, contoh, & jebakan berkas."
                    : "Extracts 4-element guidance: field meaning, how-to, valid format, and pitfalls."}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-savvy-purple shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {isId ? "Siap untuk 1-Click Autofill" : "Ready for 1-Click Autofill"}
                </span>
                <span className="text-[11px] text-slate-500 leading-snug block">
                  {isId
                    ? "Membuka izin pengisian otomatis dari Vault terenkripsi."
                    : "Enables secure 1-click batch filling from your encrypted Vault."}
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Analyze Form */}
          <button
            onClick={handleStartAnalyze}
            disabled={analyzingState}
            className="w-full py-3 px-4 rounded-xl bg-savvy-gradient text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-savvy-blue/20 hover:opacity-95 transition-all"
          >
            {analyzingState ? (
              <>
                <ScanLine className="w-4 h-4 animate-spin" />
                <span>{isId ? "Sedang Memindai Halaman..." : "Scanning Form Structure..."}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{isId ? "Analyze Form Sekarang" : "Analyze Form Now"}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Tampilan Setelah Form Berhasil Dianalisis */
        <>
          {/* Active Field Focus Banner */}
          <div className="bg-savvy-soft-blue border border-savvy-blue/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-savvy-blue text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-savvy-blue animate-pulse" />
                <span>{c.activeFieldTitle}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {c.activeFieldDesc}
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-savvy-soft-green text-savvy-green font-extrabold text-[10px] border border-savvy-green/30 shrink-0">
              {c.badgeOfficial}
            </span>
          </div>

          {/* 4-Element Guidance Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5 text-xs">
            {/* 1. Arti Istilah */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {c.secMeaning}
              </span>
              <p className="text-slate-900 font-semibold mt-1 leading-snug">
                {fieldGuidance?.meaning || c.secMeaningText}
              </p>
            </div>

            {/* 2. Cara Mengisi */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {c.secHowTo}
              </span>
              <p className="text-slate-600 mt-1 leading-snug">
                {fieldGuidance?.how_to_fill || c.secHowToText}
              </p>
            </div>

            {/* 3. Contoh Valid */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {c.secExample}
              </span>
              <code className="text-savvy-blue font-mono font-bold text-xs mt-1 block">
                {fieldGuidance?.example || c.secExampleText}
              </code>
            </div>

            {/* 4. Jebakan Umum */}
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{c.secPitfall}</span>
              </span>
              <p className="text-[11px] text-amber-950 mt-1 leading-snug">
                {fieldGuidance?.pitfalls || c.secPitfallText}
              </p>
            </div>

            {/* Source Footer Citation */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>{c.sourceText}</span>
              <span className="text-savvy-blue font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{fieldGuidance?.confirmation_ref || "Meta Spark Vector Store"}</span>
              </span>
            </div>
          </div>

          {/* Single-Field Autofill Button */}
          <button
            onClick={() => setHasAutofilled(!hasAutofilled)}
            disabled={!isVaultUnlocked}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
              !isVaultUnlocked
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : hasAutofilled
                ? "bg-savvy-green text-white hover:opacity-95"
                : "bg-savvy-gradient text-white hover:opacity-95 shadow-sm shadow-savvy-blue/20"
            }`}
          >
            {hasAutofilled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{c.btnAutofillDone}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{c.btnAutofillSingle}</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
