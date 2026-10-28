// ============================================================================
// SAVVY.AI — Background Service Worker (Chrome Manifest V3)
// Mengelola Side Panel Lifecycle, Tab Context, & Bridge Messaging
// ============================================================================

// 1. Konfigurasi Side Panel agar terbuka otomatis saat toolbar icon diklik
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Savvy.AI Background] Installed successfully.");
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn("[Savvy.AI Background] sidePanel.setPanelBehavior error:", err);
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
      chrome.action.setBadgeText({ tabId, text: "AI" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563EB" });
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
