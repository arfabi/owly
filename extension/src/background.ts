// ============================================================================
// SAVVY.AI — Background Service Worker (Chrome Manifest V3)
// Mengelola Side Panel Lifecycle, Tab Context, & Bridge Messaging
// ============================================================================

import { agentLog } from "./lib/agentLogger";

// 1. Konfigurasi Side Panel agar terbuka otomatis saat toolbar icon diklik
chrome.runtime.onInstalled.addListener(() => {
  agentLog.planner("Background Service Worker installed & initialized.", undefined, false);
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn("[Savvy.AI Background] sidePanel.setPanelBehavior error:", err);
    });
  }
});

// Icon definitions for ON (active) and OFF (inactive) states
const ON_ICONS = {
  16: "icons/icon-on-16.png",
  32: "icons/icon-on-32.png",
  48: "icons/icon-on-48.png",
  128: "icons/icon-on-128.png",
};

const OFF_ICONS = {
  16: "icons/icon-off-16.png",
  32: "icons/icon-off-32.png",
  48: "icons/icon-off-48.png",
  128: "icons/icon-off-128.png",
};

// Track active side panel connections across windows
let activeSidePanelConnections = 0;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "savvy-sidepanel") {
    activeSidePanelConnections++;
    agentLog.planner("Side Panel session connected (Active icon ON).", { connections: activeSidePanelConnections }, false);
    chrome.action.setIcon({ path: ON_ICONS }).catch(() => {});

    port.onDisconnect.addListener(() => {
      activeSidePanelConnections = Math.max(0, activeSidePanelConnections - 1);
      agentLog.planner("Side Panel session disconnected.", { remaining: activeSidePanelConnections }, false);
      if (activeSidePanelConnections === 0) {
        chrome.action.setIcon({ path: OFF_ICONS }).catch(() => {});
      }
    });
  }
});

// 2. Listener Tab Update untuk mendeteksi portal resmi
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isPublicPortal =
      tab.url.includes("lpdp.kemenkeu.go.id") ||
      tab.url.includes("m-paspor") ||
      tab.url.includes("oss.go.id") ||
      tab.url.includes("bkn.go.id") ||
      tab.url.includes("mock-portal");

    if (isPublicPortal) {
      agentLog.perception(`Public bureaucracy portal detected: ${tab.url}`, { tabId }, false);
      chrome.action.setBadgeText({ tabId, text: "AI" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#398CF5" });
    } else {
      chrome.action.setBadgeText({ tabId, text: "" });
    }
  }
});

// 3. Message Broker antar Content Script dan Side Panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Log event untuk debugging ekstensi
  // console.log("[Savvy.AI Background] Message received:", message.type, "from tab:", sender.tab?.id);

  if (message.type === "FIELD_FOCUSED") {
    // Forward info field yang sedang aktif ke sidepanel via storage atau runtime broadcast
    chrome.storage.local.set({
      activeField: {
        id: message.fieldId,
        name: message.fieldName,
        label: message.label,
        tagName: message.tagName,
        inputType: message.inputType,
        currentValue: message.value,
        timestamp: Date.now(),
        tabId: sender.tab?.id,
      },
    });
    sendResponse({ status: "acknowledged" });
  }

  if (message.type === "GET_ACTIVE_TAB_ID") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tabId: tabs[0]?.id });
    });
    return true; // Keep channel open for async response
  }

  return true;
});
