import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Lock,
  Unlock,
  Shield,
  Upload,
  Zap,
  RotateCcw,
  Sparkles,
  FileCheck2,
  Copy,
  Check,
} from "lucide-react";

interface VaultTabProps {
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (val: boolean) => void;
}

export function VaultTab({ isVaultUnlocked, setIsVaultUnlocked }: VaultTabProps) {
  const { t } = useLanguage();
  const v = t.vault;

  const [activeProfile, setActiveProfile] = useState<"pribadi" | "pasangan" | "pekerjaan">("pribadi");
  const [showUndoBar, setShowUndoBar] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "done">("idle");
  const [essayDraft, setEssayDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSimulateOcr = () => {
    setOcrStatus("processing");
    setTimeout(() => {
      setOcrStatus("done");
      setIsVaultUnlocked(true);
    }, 1200);
  };

  const handleBatchAutofill = () => {
    setShowUndoBar(true);
  };

  const handleGenerateEssay = () => {
    setEssayDraft(
      "Pasca menyelesaikan studi Magister Kebijakan Publik, rencana strategis saya adalah kembali mengabdi di Badan Perencanaan Pembangunan Nasional (Bappenas). Saya akan memimpin perancangan program hilirisasi ekonomi hijau berbasis riset kebijakan tepat guna guna memperkuat ketahanan ekonomi nasional dalam 5 tahun ke depan."
    );
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* Vault Status & Multiple Profile Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>{v.title}</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              {v.subtitle}
            </p>
          </div>
          <button
            onClick={() => setIsVaultUnlocked(!isVaultUnlocked)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              isVaultUnlocked
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-600 text-white"
            }`}
          >
            {isVaultUnlocked ? "Terkunci" : "Buka Kunci"}
          </button>
        </div>

        {/* Multi-Profile Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-semibold">
          {(["pribadi", "pasangan", "pekerjaan"] as const).map((prof) => (
            <button
              key={prof}
              onClick={() => setActiveProfile(prof)}
              className={`flex-1 py-1 rounded-md transition-all ${
                activeProfile === prof
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {prof === "pribadi" && v.profilePribadi}
              {prof === "pasangan" && v.profilePasangan}
              {prof === "pekerjaan" && v.profilePekerjaan}
            </button>
          ))}
        </div>

        {/* Stored Credentials List */}
        <div className="space-y-1.5 pt-1 text-xs font-mono">
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-sans font-bold">{v.nikLabel}</span>
            <span className="font-bold text-slate-900">
              {isVaultUnlocked ? "3271041908980002" : "•••• •••• •••• ••••"}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-sans font-bold">{v.namaLabel}</span>
            <span className="font-bold text-slate-900">
              {isVaultUnlocked ? "Budi Santoso" : "•••••••••••••"}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-sans font-bold">{v.tglLabel}</span>
            <span className="font-bold text-slate-900">
              {isVaultUnlocked ? "19-08-1998" : "••-••-••••"}
            </span>
          </div>
        </div>

        {/* Batch Autofill Button */}
        <button
          onClick={handleBatchAutofill}
          disabled={!isVaultUnlocked}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
            isVaultUnlocked
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{v.btnBatchAutofill}</span>
        </button>
      </div>

      {/* Safe UndoBar Alert */}
      {showUndoBar && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <span className="text-xs font-bold text-emerald-800">
            {v.undoBarText}
          </span>
          <button
            onClick={() => setShowUndoBar(false)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{v.btnUndo}</span>
          </button>
        </div>
      )}

      {/* OCR KTP Upload Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
        <div className="text-left">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>{v.ocrUploadTitle}</span>
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {v.ocrUploadDesc}
          </p>
        </div>

        <button
          onClick={handleSimulateOcr}
          className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {ocrStatus === "processing"
              ? "Memindai KTP on-device..."
              : ocrStatus === "done"
              ? "✅ KTP Berhasil Diekstrak ke Vault"
              : v.btnSimulateOcr}
          </span>
        </button>
      </div>

      {/* Essay Coach Smart Drafting */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
        <div className="text-left">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{v.essayTitle}</span>
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {v.essaySubtitle}
          </p>
        </div>

        <div className="space-y-1.5 text-xs">
          <input
            type="text"
            placeholder={v.essayBullet1Placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder={v.essayBullet2Placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder={v.essayBullet3Placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={handleGenerateEssay}
          className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{v.btnGenerateEssay}</span>
        </button>

        {essayDraft && (
          <div className="mt-2.5 p-3 rounded-lg bg-purple-50/70 border border-purple-200 text-left space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-purple-800">
              <span>{v.essayResultLabel}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Tersalin" : "Salin"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
              {essayDraft}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
