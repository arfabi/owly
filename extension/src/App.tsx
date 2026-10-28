import React, { useState, useEffect } from "react";
import { useLanguage } from "./lib/i18n/LanguageContext";
import { Header } from "./components/Header";
import { CoachTab } from "./components/CoachTab";
import { VaultTab } from "./components/VaultTab";
import { AuditorTab } from "./components/AuditorTab";
import { AccessibilityHubTab } from "./components/AccessibilityHubTab";
import {
  Compass,
  Lock,
  ShieldCheck,
  Sliders,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";

export function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"coach" | "vault" | "audit" | "a11y">("coach");
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [activePortalTitle, setActivePortalTitle] = useState("Portal LPDP 2026");

  // Sync active tab URL & Title in Chrome Extension context
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.title) {
          setActivePortalTitle(tab.title);
        }
      });
    }
  }, []);

  const tabs = [
    { id: "coach", label: t.tabs.coach, icon: Compass },
    { id: "vault", label: t.tabs.vault, icon: Lock },
    { id: "audit", label: t.tabs.audit, icon: ShieldCheck },
    { id: "a11y", label: t.tabs.a11y, icon: Sliders },
  ] as const;

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden text-left font-sans antialiased select-none">
      {/* Extension Header */}
      <Header
        isVaultUnlocked={isVaultUnlocked}
        setIsVaultUnlocked={setIsVaultUnlocked}
      />

      {/* 4 Core Navigation Tabs matching PRD */}
      <div className="grid grid-cols-4 bg-white border-b border-slate-200 text-xs font-bold text-center shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-all border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] truncate max-w-[80px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Scrollable Tab Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "coach" && <CoachTab isVaultUnlocked={isVaultUnlocked} />}
        {activeTab === "vault" && (
          <VaultTab
            isVaultUnlocked={isVaultUnlocked}
            setIsVaultUnlocked={setIsVaultUnlocked}
          />
        )}
        {activeTab === "audit" && <AuditorTab />}
        {activeTab === "a11y" && <AccessibilityHubTab />}
      </div>

      {/* Bottom Status Ribbon (Manifest V3 + Privacy Guarantee) */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-600">Savvy Side Panel MV3</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <Bot className="w-3 h-3" />
            <span>Muse Spark 1.3</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-mono">Zero Cloud PII</span>
        </div>
      </div>
    </div>
  );
}

export default App;
