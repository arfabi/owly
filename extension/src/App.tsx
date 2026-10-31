import React, { useState, useEffect } from "react";
import { useLanguage } from "./lib/i18n/LanguageContext";
import { Header } from "./components/Header";
import { AiAssistantTab } from "./components/AiAssistantTab";
import { FormsGuideTab } from "./components/FormsGuideTab";
import { VaultTab } from "./components/VaultTab";
import { AuditorTab } from "./components/AuditorTab";
import { AccessibilityHubTab } from "./components/AccessibilityHubTab";
import { LogConsoleModal } from "./components/LogConsoleModal";
import {
  Bot,
  FileText,
  Zap,
  ShieldCheck,
  X,
  Compass,
  BookOpen,
  Sparkles,
} from "lucide-react";

import { agentLog, logAgent, AgentDomain } from "./lib/agentLogger";

export function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"guide" | "vault" | "audit">("guide");
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(true);
  const [isFormAnalyzed, setIsFormAnalyzed] = useState(false);
  const [activeTabUrl, setActiveTabUrl] = useState<string>("");
  const [activeTabTitle, setActiveTabTitle] = useState<string>("");
  const [a11yModalOpen, setA11yModalOpen] = useState(false);
  const [isLogConsoleOpen, setIsLogConsoleOpen] = useState(false);

  // Connect to background script & log initial session
  useEffect(() => {
    agentLog.planner("Side Panel UI initialized and active.");

    // Mirror content script logs into side panel console
    const messageListener = (msg: any) => {
      if (msg?.type === "AGENT_LOG_EVENT" && msg?.event) {
        const { domain, message, data } = msg.event;
        logAgent(domain as AgentDomain, `[Page ➔ Panel] ${message}`, data, false);
      }
    };

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    if (typeof chrome !== "undefined" && chrome.runtime?.connect) {
      try {
        const port = chrome.runtime.connect({ name: "savvy-sidepanel" });

        const handleCleanupA11y = () => {
          if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({}, (tabs) => {
              tabs.forEach((tab) => {
                if (tab.id) {
                  chrome.tabs.sendMessage(tab.id, { type: "CLEAR_ALL_A11Y" }).catch(() => {});
                }
              });
            });
          }
          if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.remove([
              "savvy_a11y_settings",
              "savvy_a11y_levels",
              "savvy_a11y_profile",
              "savvy_sidepanel_open",
            ]).catch(() => {});
          }
        };

        window.addEventListener("beforeunload", handleCleanupA11y);

        return () => {
          handleCleanupA11y();
          window.removeEventListener("beforeunload", handleCleanupA11y);
          try {
            port.disconnect();
          } catch (e) {}
          if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
            chrome.runtime.onMessage.removeListener(messageListener);
          }
        };
      } catch (err) {
        console.warn("[Savvy.AI] Failed to connect sidepanel port:", err);
      }
    }
  }, []);

  // Sync real active tab URL & Title in Chrome Extension context dynamically
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;

    const syncCurrentTab = () => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        let tab = tabs?.[0];
        if (!tab || !tab.url) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs2) => {
            tab = tabs2?.[0];
            if (tab) {
              if (tab.url) setActiveTabUrl(tab.url);
              if (tab.title) setActiveTabTitle(tab.title || "");
            }
          });
          return;
        }
        if (tab.url) setActiveTabUrl(tab.url);
        if (tab.title) setActiveTabTitle(tab.title || "");
      });
    };

    // Initial sync
    syncCurrentTab();

    // Listener saat pengguna berpindah tab (tab switch)
    const handleActivated = (activeInfo: { tabId: number; windowId: number }) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab) {
          if (tab.url) setActiveTabUrl(tab.url);
          if (tab.title) setActiveTabTitle(tab.title || "");
        }
      });
    };

    // Listener saat tab aktif berganti URL / loading selesai
    const handleUpdated = (_tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
      if (tab.active && (changeInfo.url || changeInfo.title || changeInfo.status === "complete")) {
        if (tab.url) setActiveTabUrl(tab.url);
        if (tab.title) setActiveTabTitle(tab.title || "");
      }
    };

    // Listener saat window focus berganti
    const handleWindowFocus = (windowId: number) => {
      if (typeof chrome !== "undefined" && chrome.windows && windowId !== chrome.windows.WINDOW_ID_NONE) {
        syncCurrentTab();
      }
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);
    if (chrome.windows?.onFocusChanged) {
      chrome.windows.onFocusChanged.addListener(handleWindowFocus);
    }

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      if (chrome.windows?.onFocusChanged) {
        chrome.windows.onFocusChanged.removeListener(handleWindowFocus);
      }
    };
  }, []);

  const tabs = [
    { id: "guide", label: t.tabs.guide, icon: Sparkles },
    { id: "vault", label: t.tabs.vault, icon: Zap },
    { id: "audit", label: t.tabs.audit, icon: ShieldCheck },
  ] as const;

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden text-left font-sans antialiased select-none">
      {/* Extension Header */}
      <Header
        onOpenAccessibilityHub={() => setA11yModalOpen(true)}
        onOpenLogConsole={() => setIsLogConsoleOpen(true)}
      />

      {/* Clean Capsule Top Navigation Tabs (3 Tabs) */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 shrink-0">
        <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-xl gap-1 text-center font-bold text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  agentLog.planner(`Switched active tab to: ${tab.id.toUpperCase()} (${tab.label})`);
                  setActiveTab(tab.id);
                }}
                className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? "bg-white text-savvy-blue shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Body */}
      <div className="flex-1 overflow-y-auto relative">
        {activeTab === "guide" && (
          <AiAssistantTab
            isVaultUnlocked={isVaultUnlocked}
            isFormAnalyzed={isFormAnalyzed}
            currentUrl={activeTabUrl}
            currentTitle={activeTabTitle}
            onAnalyzeForm={() => setIsFormAnalyzed(true)}
            onResetFormAnalysis={() => setIsFormAnalyzed(false)}
            onNavigateTab={(tab) => {
              if (tab === "guide" || tab === "vault" || tab === "audit") {
                setActiveTab(tab);
              }
            }}
            onOpenAccessibilityHub={() => setA11yModalOpen(true)}
          />
        )}
        {activeTab === "vault" && (
          <VaultTab
            isVaultUnlocked={isVaultUnlocked}
            setIsVaultUnlocked={setIsVaultUnlocked}
            isFormAnalyzed={isFormAnalyzed}
            onAnalyzeForm={() => setIsFormAnalyzed(true)}
          />
        )}
        {activeTab === "audit" && (
          <AuditorTab onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {/* Accessibility Hub Slide-Over Modal */}
        {a11yModalOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-savvy-blue" />
                <h3 className="font-extrabold text-xs text-slate-900">
                  {t.a11y.title}
                </h3>
              </div>
              <button
                onClick={() => setA11yModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AccessibilityHubTab />
            </div>
          </div>
        )}

        {/* Live Execution Log Console Modal */}
        <LogConsoleModal
          isOpen={isLogConsoleOpen}
          onClose={() => setIsLogConsoleOpen(false)}
        />
      </div>

      {/* Footer: Privacy Notice */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-center text-[10px] text-slate-500 font-medium shrink-0 gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-savvy-blue shrink-0" />
        <span>{t.common.privacyFooter}</span>
      </div>
    </div>
  );
}

export default App;
