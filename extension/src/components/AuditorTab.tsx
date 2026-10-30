import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Camera,
  RefreshCw,
  Sparkles,
  Eye,
  FileCheck2,
  Search,
  ScanLine,
} from "lucide-react";
import { auditFormData, AuditReport } from "../lib/audit/rules";
import { agentLog } from "../lib/agentLogger";

export function AuditorTab() {
  const { t, language } = useLanguage();
  const isId = language === "id";
  const a = t.audit;

  const [isScanning, setIsScanning] = useState(false);
  const [photoFixed, setPhotoFixed] = useState(false);
  const [auditRunDone, setAuditRunDone] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);

  const handleScanPhoto = () => {
    agentLog.action("📷 Photo Audit: Inspecting aspect ratio, format, and photo background contrast.");
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setPhotoFixed(true);
      agentLog.reasoning("✅ Photo Audit passed: Red background verified, 4x6 aspect ratio compliant.");
    }, 1400);
  };

  const handleRunFullAudit = () => {
    const sampleFormData = {
      nik: "3271041908980002",
      nama: "Budi Santoso",
      email: "budi.santoso@alumni.ui.ac.id",
      tanggal_lahir: "1998-08-19",
      kategori: "Beasiswa Reguler",
      toefl_ielts: "550",
    };
    const res = auditFormData(sampleFormData);
    setReport(res);
    setAuditRunDone(true);
    agentLog.reasoning("🔍 Pre-Submit Traffic Light Audit complete.", {
      score: res.score,
      status: res.overallStatus,
      passed: res.passedCount,
      warning: res.warningCount,
      danger: res.dangerCount,
    });
    setTimeout(() => setAuditRunDone(false), 5000);
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* Traffic Light Overview Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-savvy-green" />
            <span>{a.summaryTitle}</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            FSM Guardrails
          </span>
        </div>

        {/* Traffic Light Counters */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] font-extrabold text-emerald-800 block">
              {a.greenCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
            <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <span className="text-[11px] font-extrabold text-amber-800 block">
              {a.yellowCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80">
            <AlertCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <span className="text-[11px] font-extrabold text-red-800 block">
              {photoFixed ? (isId ? "0 Fatal" : "0 Fatal") : a.redCount}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Compliance Inspector (PhotoAuditCard) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 text-left">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-savvy-blue" />
              <span>{a.photoTitle}</span>
            </h4>
            <span className="text-[10px] font-bold text-savvy-purple bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-mono">
              sharp C++
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
            {a.photoSubtitle}
          </p>
        </div>

        {/* Photo Box with Scanning Simulation */}
        <div className="relative mx-auto w-32 h-32 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shadow-inner">
          <div className="w-20 h-24 rounded-full border-2 border-dashed border-savvy-blue/80 flex flex-col items-center justify-center text-[10px] text-slate-500 font-semibold bg-white/50 text-center px-1">
            <span>2x2 Biometrik</span>
            <span className="text-[9px] text-savvy-blue font-bold mt-1">58% Head Ratio</span>
          </div>

          {isScanning && (
            <div className="absolute inset-0 border-2 border-savvy-blue animate-ping rounded-2xl pointer-events-none" />
          )}

          {isScanning && (
            <div className="absolute inset-0 bg-savvy-blue/30 backdrop-blur-xs flex items-center justify-center text-xs font-extrabold text-white">
              {isId ? "Memindai..." : "Scanning..."}
            </div>
          )}
        </div>

        {/* Status Chips */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{a.chipRatio}</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">1:1 Ratio</span>
          </div>

          <div
            className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
              photoFixed
                ? "bg-emerald-50 border-emerald-200/80 text-emerald-800"
                : "bg-red-50 border-red-200/80 text-red-800"
            }`}
          >
            <span className="text-[11px] font-bold flex items-center gap-1.5">
              {photoFixed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>{photoFixed ? a.chipBlur : (isId ? "Ketajaman Blur: Rendah (48 < 100)" : "Blur: Low (48 < 100)")}</span>
            </span>
            <span className="text-[10px] font-mono font-bold">
              {photoFixed ? "Var: 142" : "Gagal ICAO"}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{a.chipBiometric}</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">ICAO 9303</span>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleScanPhoto}
            disabled={isScanning}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin text-savvy-blue" : ""}`} />
            <span>{a.btnScanPhoto}</span>
          </button>
          <button
            onClick={() => setPhotoFixed(true)}
            className="py-2 px-3 rounded-xl bg-savvy-gradient text-white text-xs font-bold hover:opacity-95 transition-all shadow-xs"
          >
            {a.btnFixPhoto}
          </button>
        </div>
      </div>

      {/* Consistency Checker Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2 text-left">
        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-savvy-blue" />
          <span>{a.consistencyTitle}</span>
        </h4>
        <p className="text-[11px] text-slate-600 leading-snug">
          {a.consistencyDesc}
        </p>
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{a.consistencyMatch}</span>
        </div>
      </div>

      {/* Run Full Audit Button */}
      <button
        onClick={handleRunFullAudit}
        className="w-full py-3 px-4 rounded-xl bg-savvy-gradient text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-savvy-blue/20 hover:opacity-95 transition-all"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{a.btnRunFullAudit}</span>
      </button>

      {auditRunDone && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-extrabold text-center border border-emerald-300 animate-in fade-in">
          {a.auditCompleteToast}
        </div>
      )}
    </div>
  );
}
