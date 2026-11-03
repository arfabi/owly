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

function clearAccessibilityGlobally() {
  chrome.storage.local.set({ savvy_sidepanel_open: false }).catch(() => {});
  chrome.storage.local.remove(["savvy_a11y_settings", "savvy_a11y_levels", "savvy_a11y_profile"]).catch(() => {});

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "CLEAR_ALL_A11Y" }).catch(() => {});
      }
    });
  });
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "savvy-sidepanel") {
    activeSidePanelConnections++;
    chrome.storage.local.set({ savvy_sidepanel_open: true }).catch(() => {});
    agentLog.planner("Side Panel session connected (Active icon ON).", { connections: activeSidePanelConnections }, false);
    chrome.action.setIcon({ path: ON_ICONS }).catch(() => {});

    port.onDisconnect.addListener(() => {
      activeSidePanelConnections = Math.max(0, activeSidePanelConnections - 1);
      agentLog.planner("Side Panel session disconnected.", { remaining: activeSidePanelConnections }, false);
      if (activeSidePanelConnections === 0) {
        chrome.action.setIcon({ path: OFF_ICONS }).catch(() => {});
        clearAccessibilityGlobally();
      }
    });
  }
});

// 2. Listener Tab Switch & Update untuk Sinkronisasi Global Accessibility Settings
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (activeSidePanelConnections <= 0) return;
  chrome.storage.local.get("savvy_a11y_settings", (res) => {
    if (res && res.savvy_a11y_settings) {
      chrome.tabs.sendMessage(activeInfo.tabId, {
        type: "APPLY_ALL_A11Y_SETTINGS",
        settings: res.savvy_a11y_settings,
      }).catch(() => {});
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (activeSidePanelConnections > 0 && (tab.url.startsWith("http") || tab.url.startsWith("file"))) {
      chrome.storage.local.get("savvy_a11y_settings", (res) => {
        if (res && res.savvy_a11y_settings) {
          chrome.tabs.sendMessage(tabId, {
            type: "APPLY_ALL_A11Y_SETTINGS",
            settings: res.savvy_a11y_settings,
          }).catch(() => {});
        }
      });
    }

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

  if (message.type === "OPEN_SIDEPANEL_REQUEST") {
    if ((chrome as any).sidePanel?.open) {
      const openOptions = sender.tab?.id ? { tabId: sender.tab.id } : { windowId: sender.tab?.windowId };
      (chrome as any).sidePanel.open(openOptions).catch((err: any) => {
        console.warn("[Owly Background] Primary sidePanel.open failed:", err);
        if (sender.tab?.windowId && openOptions.tabId) {
          (chrome as any).sidePanel.open({ windowId: sender.tab.windowId }).catch((fallbackErr: any) => {
            console.warn("[Owly Background] Fallback sidePanel.open with windowId also failed:", fallbackErr);
          });
        }
      });
    }
    sendResponse({ status: "opening" });
    return true;
  }

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

  if (message.type === "CAPTURE_VISIBLE_TAB") {
    const targetWinId = sender.tab?.windowId;
    const captureOptions = { format: "jpeg" as const, quality: 75 };

    const tryCapture = (winId?: number) => {
      const callback = (dataUrl?: string) => {
        const err = chrome.runtime.lastError;
        if (err || !dataUrl) {
          console.warn("[Savvy.AI Background] captureVisibleTab failed (winId: " + winId + "):", err?.message);
          if (winId !== undefined) {
            // Fallback retry without specifying winId
            tryCapture(undefined);
          } else {
            sendResponse({ success: false, error: err?.message || "Capture failed" });
          }
        } else {
          sendResponse({ success: true, dataUrl });
        }
      };

      try {
        if (winId !== undefined) {
          chrome.tabs.captureVisibleTab(winId, captureOptions, callback);
        } else {
          chrome.tabs.captureVisibleTab(captureOptions, callback);
        }
      } catch (e: any) {
        sendResponse({ success: false, error: e?.message || "Capture exception" });
      }
    };

    tryCapture(targetWinId);
    return true; // Keep channel open for async response
  }

  return true;
});
