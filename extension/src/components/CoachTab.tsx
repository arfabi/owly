import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Volume2,
  Mic,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
} from "lucide-react";

interface CoachTabProps {
  isVaultUnlocked: boolean;
}

export function CoachTab({ isVaultUnlocked }: CoachTabProps) {
  const { t } = useLanguage();
  const c = t.coach;

  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [snipActive, setSnipActive] = useState(false);

  const handleVoiceToggle = () => {
    if (voiceStatus === "idle") {
      setVoiceStatus("listening");
      setTimeout(() => setVoiceStatus("thinking"), 1600);
      setTimeout(() => setVoiceStatus("speaking"), 3200);
      setTimeout(() => setVoiceStatus("idle"), 5800);
    } else {
      setVoiceStatus("idle");
    }
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* Active Field Focus Banner */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-blue-700 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{c.activeFieldTitle}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {c.activeFieldDesc}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 shrink-0">
          {c.badgeOfficial}
        </span>
      </div>

      {/* 4-Element Guidance Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
        {/* 1. Arti Istilah */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {c.secMeaning}
          </span>
          <p className="text-slate-800 font-medium mt-0.5 leading-snug">
            {c.secMeaningText}
          </p>
        </div>

        {/* 2. Cara Mengisi */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {c.secHowTo}
          </span>
          <p className="text-slate-700 mt-0.5 leading-snug">
            {c.secHowToText}
          </p>
        </div>

        {/* 3. Contoh Valid */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {c.secExample}
          </span>
          <code className="text-blue-700 font-mono font-bold text-xs mt-0.5 block">
            {c.secExampleText}
          </code>
        </div>

        {/* 4. Jebakan Umum */}
        <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            {c.secPitfall}
          </span>
          <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
            {c.secPitfallText}
          </p>
        </div>

        {/* Source Footer Citation */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span>{c.sourceText}</span>
          <span className="text-blue-600 font-semibold">Meta Vector Store</span>
        </div>
      </div>

      {/* Single-Field Autofill Button */}
      <button
        onClick={() => setHasAutofilled(!hasAutofilled)}
        disabled={!isVaultUnlocked}
        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
          !isVaultUnlocked
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : hasAutofilled
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
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

      {/* Handsfree Voicebot Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>{c.voicebotTitle}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">Silero VAD</span>
        </div>

        {/* Dynamic Voice Waveform Visualizer */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 h-6 mb-1.5">
            {[4, 12, 18, 24, 16, 8, 20, 14, 6].map((h, i) => (
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
                style={{ height: voiceStatus !== "idle" ? `${h}px` : "6px" }}
              />
            ))}
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            {voiceStatus === "listening" && c.voiceStatusListening}
            {voiceStatus === "thinking" && c.voiceStatusThinking}
            {voiceStatus === "speaking" && c.voiceStatusSpeaking}
            {voiceStatus === "idle" && "Tekan tombol untuk bicara bebas genggam"}
          </div>
        </div>

        <button
          onClick={handleVoiceToggle}
          className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Mic className="w-3.5 h-3.5 text-blue-600" />
          <span>{c.btnAskVoice}</span>
        </button>
      </div>

      {/* Explain This Snip Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
        <div className="text-left">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-purple-600" />
            <span>{c.btnExplainThis}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 max-w-[210px] leading-tight">
            {c.explainDesc}
          </p>
        </div>
        <button
          onClick={() => setSnipActive(!snipActive)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            snipActive
              ? "bg-purple-600 text-white"
              : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
          }`}
        >
          {snipActive ? "Mode Snip Aktif" : "Mulai Snip"}
        </button>
      </div>
    </div>
  );
}
