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
} from "lucide-react";

export function AuditorTab() {
  const { t } = useLanguage();
  const a = t.audit;

  const [isScanning, setIsScanning] = useState(false);
  const [photoFixed, setPhotoFixed] = useState(false);
  const [auditRunDone, setAuditRunDone] = useState(false);

  const handleScanPhoto = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setPhotoFixed(true);
    }, 1500);
  };

  const handleRunFullAudit = () => {
    setAuditRunDone(true);
    setTimeout(() => setAuditRunDone(false), 4000);
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* Traffic Light Overview Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{a.summaryTitle}</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-500">
            FSM Guardrail
          </span>
        </div>

        {/* Traffic Light Counters */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-emerald-800 block">
              {a.greenCount}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-amber-800 block">
              {a.yellowCount}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-red-800 block">
              {photoFixed ? "0 Fatal" : a.redCount}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Compliance Inspector (PhotoAuditCard) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="text-left">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>{a.photoTitle}</span>
            </h4>
            <span className="text-[10px] font-semibold text-slate-400">sharp C++</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {a.photoSubtitle}
          </p>
        </div>

        {/* Photo Box with Border Beam Simulation */}
        <div className="relative mx-auto w-32 h-32 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shadow-inner">
          {/* Simulated Face Outline */}
          <div className="w-20 h-24 rounded-full border-2 border-dashed border-blue-400/80 flex flex-col items-center justify-center text-[10px] text-slate-500 font-semibold bg-white/40">
            <span>2x2 Biometrik</span>
            <span className="text-[9px] text-blue-600 mt-1">58% Head Ratio</span>
          </div>

          {/* Border Beam Scanning Animation */}
          {isScanning && (
            <div className="absolute inset-0 border-2 border-blue-500 animate-ping rounded-xl pointer-events-none" />
          )}

          {isScanning && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-900">
              Sedang Memindai...
            </div>
          )}
        </div>

        {/* 3 StatusChips (Triple Encoding) */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{a.chipRatio}</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">1:1 Ratio</span>
          </div>

          <div
            className={`flex items-center justify-between p-2 rounded-lg border ${
              photoFixed
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span className="text-[11px] font-bold flex items-center gap-1.5">
              {photoFixed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>{photoFixed ? a.chipBlur : "Ketajaman Blur: Rendah (48 < 100)"}</span>
            </span>
            <span className="text-[10px] font-mono">
              {photoFixed ? "Var: 142" : "Gagal ICAO"}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{a.chipBiometric}</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">ICAO 9303</span>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleScanPhoto}
            disabled={isScanning}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin text-blue-600" : ""}`} />
            <span>{a.btnScanPhoto}</span>
          </button>
          <button
            onClick={() => setPhotoFixed(true)}
            className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
          >
            {a.btnFixPhoto}
          </button>
        </div>
      </div>

      {/* Consistency Checker Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 text-left">
        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{a.consistencyTitle}</span>
        </h4>
        <p className="text-[11px] text-slate-600 leading-snug">
          {a.consistencyDesc}
        </p>
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{a.consistencyMatch}</span>
        </div>
      </div>

      {/* Run Full Audit Button */}
      <button
        onClick={handleRunFullAudit}
        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{a.btnRunFullAudit}</span>
      </button>

      {auditRunDone && (
        <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold text-center border border-emerald-300 animate-fade-in">
          {a.auditCompleteToast}
        </div>
      )}
    </div>
  );
}
