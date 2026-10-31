import React, { useState, useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  RotateCcw,
  Accessibility,
  Undo2,
} from "lucide-react";

import { agentLog } from "../lib/agentLogger";
import { sendTabMessage } from "../lib/tabMessenger";
import { A11Y_PROFILES } from "../lib/a11y/registry";

interface ToolItem {
  id: string;
  title: string;
  icon: string | React.ReactNode;
  options: string[];
}

export function AccessibilityHubTab() {
  const { t, language } = useLanguage();
  const isId = language === "id";

  // Level index for each tool (0 = Normal / Off)
  const [toolLevels, setToolLevels] = useState<Record<string, number>>({
    spotlight: 0,
    tts: 0,
    contrast: 0,
    links: 0,
    textSize: 0,
    textSpacing: 0,
    pauseAnim: 0,
    hideImages: 0,
    dyslexiaFont: 0,
    bigCursor: 0,
    liveTooltips: 0,
    lineHeight: 0,
    textAlign: 0,
    colorSat: 0,
  });

  const [activeProfile, setActiveProfile] = useState<string | null>(null);

  // Undo History Stack (up to 20 snapshots)
  const [undoStack, setUndoStack] = useState<
    Array<{ levels: Record<string, number>; profile: string | null }>
  >([]);

  // Restore persistent settings on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(
        ["savvy_a11y_levels", "savvy_a11y_profile"],
        (res: Record<string, any>) => {
          if (res?.savvy_a11y_levels && typeof res.savvy_a11y_levels === "object") {
            setToolLevels(res.savvy_a11y_levels as Record<string, number>);
          }
          if (res?.savvy_a11y_profile) {
            setActiveProfile(String(res.savvy_a11y_profile));
          }
        }
      );
    }
  }, []);

  // 14 Deterministic Tools with Multi-level Options
  const tools: ToolItem[] = [
    {
      id: "spotlight",
      title: "Reading Spotlight",
      icon: <span className="text-3xl drop-shadow-xs select-none">🔦</span>,
      options: ["Off", "On"],
    },
    {
      id: "tts",
      title: "Text to Speech (TTS)",
      icon: <span className="text-3xl drop-shadow-xs select-none">🔊</span>,
      options: ["Off", "On"],
    },
    {
      id: "contrast",
      title: "Contrast Mode",
      icon: <span className="text-3xl drop-shadow-xs select-none">🌗</span>,
      options: ["Normal", "High", "Invert", "Monochrome"],
    },
    {
      id: "links",
      title: "Highlight Links",
      icon: <span className="text-3xl drop-shadow-xs select-none">🔗</span>,
      options: ["Off", "Highlight", "Underline", "High Contrast"],
    },
    {
      id: "textSize",
      title: "Bigger Text Size",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white font-black text-[10px] flex flex-col items-center justify-center leading-none shadow-xs select-none">
          <span className="tracking-tighter">AB</span>
          <span className="tracking-tighter">CD</span>
        </div>
      ),
      options: ["Normal", "+25%", "+50%", "+75%", "+100%"],
    },
    {
      id: "textSpacing",
      title: "Text Spacing",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white font-black text-lg flex items-center justify-center shadow-xs select-none">
          ↔
        </div>
      ),
      options: ["Normal", "Light (+10%)", "Medium (+25%)", "Heavy (+50%)"],
    },
    {
      id: "pauseAnim",
      title: "Pause Animations",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white font-black text-sm flex items-center justify-center shadow-xs select-none">
          ⏸
        </div>
      ),
      options: ["Normal", "Paused"],
    },
    {
      id: "hideImages",
      title: "Hide All Images",
      icon: <span className="text-3xl drop-shadow-xs select-none">🖼️</span>,
      options: ["Normal", "Hidden", "Grayscale"],
    },
    {
      id: "dyslexiaFont",
      title: "Dyslexia Friendly Font",
      icon: (
        <span className="text-3xl font-extrabold text-slate-900 select-none tracking-tight font-sans">
          Df
        </span>
      ),
      options: ["Off", "On"],
    },
    {
      id: "bigCursor",
      title: "Big Cursor",
      icon: <span className="text-3xl drop-shadow-xs select-none">🖱️</span>,
      options: ["Normal", "Large (Black)", "Large (White)", "Highlighter"],
    },
    {
      id: "liveTooltips",
      title: "Live Explanatory Tooltips",
      icon: <span className="text-3xl drop-shadow-xs select-none">💬</span>,
      options: ["Off", "On"],
    },
    {
      id: "lineHeight",
      title: "Line Height Spacing",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white font-black text-lg flex items-center justify-center shadow-xs select-none">
          ↕
        </div>
      ),
      options: ["Normal", "1.5x", "1.8x", "2.2x"],
    },
    {
      id: "textAlign",
      title: "Text Alignment",
      icon: <span className="text-3xl drop-shadow-xs select-none">📄</span>,
      options: ["Normal", "Left", "Center", "Justify"],
    },
    {
      id: "colorSat",
      title: "Color Saturation",
      icon: <span className="text-3xl drop-shadow-xs select-none">💧</span>,
      options: ["Normal", "High (+50%)", "Low (-50%)", "Monochrome"],
    },
  ];

  // Helper to persist to storage
  const persistSettings = (levels: Record<string, number>, profile: string | null) => {
    const settingsMap: Record<string, { value: string; level: number; enabled: boolean }> = {};
    tools.forEach((t) => {
      const lvl = levels[t.id] || 0;
      settingsMap[t.id] = {
        value: t.options[lvl] || t.options[0],
        level: lvl,
        enabled: lvl > 0,
      };
    });
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({
        savvy_a11y_settings: settingsMap,
        savvy_a11y_levels: levels,
        savvy_a11y_profile: profile,
      });
    }
  };

  // Dispatch all tools to content script
  const dispatchAllLevels = (levels: Record<string, number>) => {
    tools.forEach((tool) => {
      const lvl = levels[tool.id] || 0;
      const val = tool.options[lvl] || tool.options[0];
      sendTabMessage({
        type: "SET_A11Y_FEATURE",
        feature: tool.id,
        value: val,
        level: lvl,
        enabled: lvl > 0,
      });
    });
  };

  // Push to Undo Stack
  const pushUndo = (prevLevels: Record<string, number>, prevProfile: string | null) => {
    setUndoStack((prev) => [...prev.slice(-19), { levels: { ...prevLevels }, profile: prevProfile }]);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    setToolLevels(last.levels);
    setActiveProfile(last.profile);
    persistSettings(last.levels, last.profile);
    dispatchAllLevels(last.levels);
    agentLog.action("👓 A11y changes undone.");
  };

  // Manual Toggle Tool
  const toggleTool = (id: string, options: string[]) => {
    pushUndo(toolLevels, activeProfile);
    setActiveProfile(null);

    setToolLevels((prev) => {
      const currentIdx = prev[id] || 0;
      const nextIdx = (currentIdx + 1) % options.length;
      const nextVal = options[nextIdx];
      const isEnabled = nextIdx > 0;

      agentLog.action(`👓 A11y feature '${id}' set to: ${nextVal} (level ${nextIdx})`);

      sendTabMessage({
        type: "SET_A11Y_FEATURE",
        feature: id,
        value: nextVal,
        level: nextIdx,
        enabled: isEnabled,
      });

      const updated = {
        ...prev,
        [id]: nextIdx,
      };
      persistSettings(updated, null);
      return updated;
    });
  };

  // Apply Predefined Profile
  const applyProfile = (profileKey: "adhd" | "dyslexia" | "low_vision" | "senior") => {
    pushUndo(toolLevels, activeProfile);

    if (activeProfile === profileKey) {
      resetAll();
      return;
    }

    setActiveProfile(profileKey);
    const baseLevels: Record<string, number> = {};
    tools.forEach((t) => (baseLevels[t.id] = 0));

    const profilePreset = A11Y_PROFILES[profileKey];
    const newLevels = { ...baseLevels, ...profilePreset.levels };

    setToolLevels(newLevels);
    persistSettings(newLevels, profileKey);
    dispatchAllLevels(newLevels);
    agentLog.action(`👓 Applied Quick Accessibility Profile: ${profileKey.toUpperCase()}`, newLevels);
  };

  // Reset All
  const resetAll = () => {
    pushUndo(toolLevels, activeProfile);
    agentLog.action("👓 A11y features reset to default.");
    setActiveProfile(null);

    const resetLevels: Record<string, number> = {};
    tools.forEach((t) => (resetLevels[t.id] = 0));

    setToolLevels(resetLevels);
    persistSettings(resetLevels, null);
    dispatchAllLevels(resetLevels);
  };

  const activeCount = Object.values(toolLevels).filter((lvl) => lvl > 0).length;

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800 pb-20">
      {/* ==================================================================== */}
      {/* 1. WELCOME CARD (Clean & Elegant) */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-savvy-soft-blue flex items-center justify-center text-savvy-blue shrink-0">
            <Accessibility className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
            {t.a11y.welcomeTitle}
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {t.a11y.welcomeDesc}
        </p>
      </div>

      {/* ==================================================================== */}
      {/* 2. QUICK ACCESSIBILITY PROFILES */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
            {t.a11y.quickProfilesTitle}
          </span>
          {activeCount > 0 && (
            <button
              onClick={resetAll}
              className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.a11y.resetBtn}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Profile 1: ADHD Friendly */}
          <button
            onClick={() => applyProfile("adhd")}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              activeProfile === "adhd"
                ? "border-purple-400 bg-purple-50 text-purple-900 shadow-2xs font-bold"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
            }`}
          >
            <span className="text-lg select-none">🧠</span>
            <span className="text-[11px] font-bold leading-tight">{t.a11y.profileAdhd}</span>
          </button>

          {/* Profile 2: Dyslexia Friendly */}
          <button
            onClick={() => applyProfile("dyslexia")}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              activeProfile === "dyslexia"
                ? "border-blue-400 bg-blue-50 text-blue-900 shadow-2xs font-bold"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
            }`}
          >
            <span className="text-lg select-none">📖</span>
            <span className="text-[11px] font-bold leading-tight">{t.a11y.profileDyslexia}</span>
          </button>

          {/* Profile 3: Low Vision / High Contrast */}
          <button
            onClick={() => applyProfile("low_vision")}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              activeProfile === "low_vision"
                ? "border-amber-400 bg-amber-50 text-amber-900 shadow-2xs font-bold"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
            }`}
          >
            <span className="text-lg select-none">👁️</span>
            <span className="text-[11px] font-bold leading-tight">{t.a11y.profileLowVision}</span>
          </button>

          {/* Profile 4: Senior Friendly */}
          <button
            onClick={() => applyProfile("senior")}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
              activeProfile === "senior"
                ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-2xs font-bold"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800"
            }`}
          >
            <span className="text-lg select-none">👴</span>
            <span className="text-[11px] font-bold leading-tight">{t.a11y.profileSenior}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 14 DETERMINISTIC TOOLS GRID WITH MULTI-LEVEL OPTIONS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {tools.map((tool) => {
          const currentLevel = toolLevels[tool.id] || 0;
          const currentStatus = tool.options[currentLevel] || tool.options[0];
          const isActive = currentLevel > 0;

          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id, tool.options)}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 shadow-2xs cursor-pointer ${
                isActive
                  ? "bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs"
                  : "bg-white border-slate-200/90 text-slate-800 hover:border-blue-300 hover:bg-slate-50/60"
              }`}
              title={`Click to cycle options: ${tool.options.join(" → ")}`}
            >
              {/* Large Centered Icon */}
              <div className="flex items-center justify-center h-9">{tool.icon}</div>

              {/* Title */}
              <div className="font-bold text-[11.5px] leading-tight text-slate-800 text-center px-1">
                {tool.title}
              </div>

              {/* Status Pill Badge underneath */}
              <span
                className={`text-[9.5px] font-bold px-3 py-0.5 rounded-full transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-500 border border-slate-200/60"
                }`}
              >
                {currentStatus}
              </span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 4. STICKY BOTTOM ACTION BAR (UNDO & RESET) */}
      {/* ==================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between gap-2 shadow-lg z-30">
        <div className="text-[11px] font-semibold text-slate-500">
          <span className="text-blue-600 font-bold">{activeCount}</span> {t.a11y.activeCountSuffix}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{t.a11y.undoBtn}</span>
          </button>

          {/* Reset All Button */}
          <button
            onClick={resetAll}
            disabled={activeCount === 0}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.a11y.resetBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
