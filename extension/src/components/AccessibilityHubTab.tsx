import React, { useState } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Eye,
  Volume2,
  Contrast,
  ArrowRight,
  Type,
  Sliders,
  Pause,
  Layers,
  Maximize2,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { agentLog } from "../lib/agentLogger";

export function AccessibilityHubTab() {
  const { t } = useLanguage();
  const a11y = t.a11y;

  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({
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

  const toggleTool = (id: string) => {
    setActiveTools((prev) => {
      const nextVal = !prev[id];
      agentLog.action(`👓 A11y feature '${id}' set to: ${nextVal ? "ENABLED" : "DISABLED"}`);

      // Dispatch to content script
      if (typeof chrome !== "undefined" && chrome.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "SET_A11Y_FEATURE",
              feature: id,
              enabled: nextVal,
            });
          }
        });
      }
      return {
        ...prev,
        [id]: nextVal,
      };
    });
  };

  const resetAll = () => {
    agentLog.action("👓 A11y features reset to default.");
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

  const getToolIcon = (id: string) => {
    switch (id) {
      case "spotlight":
        return Eye;
      case "tts":
        return Volume2;
      case "contrast":
      case "colorSat":
        return Contrast;
      case "links":
        return ArrowRight;
      case "textSize":
      case "dyslexiaFont":
      case "textAlign":
        return Type;
      case "textSpacing":
      case "lineHeight":
        return Sliders;
      case "pauseAnim":
        return Pause;
      case "hideImages":
        return Layers;
      case "bigCursor":
        return Maximize2;
      case "liveTooltips":
        return FileText;
      default:
        return Sliders;
    }
  };

  const activeCount = Object.values(activeTools).filter(Boolean).length;

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>{a11y.title}</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {activeCount} Aktif
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-snug">
          {a11y.subtitle}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            {a11y.zeroTokenBadge}
          </span>
          <button
            onClick={resetAll}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Semua</span>
          </button>
        </div>
      </div>

      {/* 14 Deterministic Tools Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {a11y.tools.map((tool) => {
          const Icon = getToolIcon(tool.id);
          const isActive = activeTools[tool.id];

          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 shadow-2xs ${
                isActive
                  ? "bg-blue-50/70 border-blue-400 text-blue-900 shadow-sm"
                  : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Status Switch/Indicator */}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isActive ? tool.statusOn : tool.statusOff}
                </span>
              </div>

              <div>
                <div className="font-bold text-[11px] leading-tight line-clamp-1">
                  {tool.title}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 line-clamp-1 leading-none">
                  {tool.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dual Trigger Notice */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 text-left space-y-1">
        <div className="font-bold text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Arsitektur Dual-Trigger (Lokal vs AI Reasoning):</span>
        </div>
        <p className="leading-snug">
          Pengguna dapat mengklik kartu di atas secara manual ($0 token), atau AI Agent memanggil kontrak fungsi <code>set_accessibility_feature</code> saat Anda mengeluh pusing di chat/voicebot.
        </p>
      </div>
    </div>
  );
}
