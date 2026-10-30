// ============================================================================
// SAVVY.AI — Robust Tab Messenger & Dynamic Content Script Injector
// Handles Chrome MV3 connection lifecycle without 'Receiving end does not exist'
// ============================================================================

import { agentLog } from "./agentLogger";

export async function sendTabMessage<T = any>(message: any): Promise<{ success: boolean; data?: T; reason?: string }> {
  if (typeof chrome === "undefined" || !chrome.tabs?.query) {
    return { success: false, reason: "Chrome tabs API unavailable" };
  }

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        resolve({ success: false, reason: "No active tab found" });
        return;
      }

      const tabId = activeTab.id;
      const url = activeTab.url || "";

      // 1. Guard against restricted browser internal URLs (content scripts forbidden)
      if (
        url.startsWith("chrome://") ||
        url.startsWith("edge://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("about:") ||
        url.startsWith("view-source:")
      ) {
        agentLog.perception(`⚠️ Halaman '${url.substring(0, 30)}...' adalah halaman internal browser. Silakan buka halaman web biasa (http/https).`);
        resolve({ success: false, reason: "Restricted browser page" });
        return;
      }

      // 2. Attempt sending message to existing Content Script
      chrome.tabs.sendMessage(tabId, message, async (res) => {
        const initialError = chrome.runtime.lastError;

        if (initialError) {
          // Error: "Could not establish connection. Receiving end does not exist."
          // Artinya halaman ini dimuat sebelum ekstensi di-reload.
          // Kita otomatis injeksikan content.js menggunakan chrome.scripting!
          if (chrome.scripting && chrome.scripting.executeScript) {
            try {
              agentLog.perception(`Menginjeksikan Content Script ke tab #${tabId} secara otomatis...`);
              await chrome.scripting.executeScript({
                target: { tabId },
                files: ["content.js"],
              });

              // Beri jeda 150ms agar content script selesai inisialisasi listener
              setTimeout(() => {
                chrome.tabs.sendMessage(tabId, message, (retryRes) => {
                  const retryError = chrome.runtime.lastError;
                  if (retryError) {
                    agentLog.perception(`⚠️ Gagal menghubungi tab setelah injeksi: ${retryError.message}`);
                    resolve({ success: false, reason: retryError.message });
                  } else {
                    resolve({ success: true, data: retryRes });
                  }
                });
              }, 150);
              return;
            } catch (injectErr: any) {
              agentLog.perception(`⚠️ Injeksi script gagal: ${injectErr?.message || injectErr}`);
              resolve({ success: false, reason: injectErr?.message || String(injectErr) });
              return;
            }
          }

          resolve({ success: false, reason: initialError.message });
          return;
        }

        resolve({ success: true, data: res });
      });
    });
  });
}
