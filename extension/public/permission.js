// ============================================================================
// OWLY.AI — Microphone Permission Activation Script
// Multilingual support: American English (default) & Bahasa Indonesia
// ============================================================================

const PERM_I18N = {
  en: {
    pageTitle: "Microphone Activation — Owly.AI Voicebot",
    heading: "Activate Microphone Access",
    desc: 'Chrome requires microphone permission to be granted via a standard tab before it can be used in the Side Panel. Click the button below, then select <strong>"Allow"</strong> on the browser prompt at the top-left of the address bar.',
    btnIdle: "Allow Microphone Access",
    btnRequesting: "Requesting microphone permission from Chrome...",
    btnRetry: "Click to Allow Microphone Access",
    statusSuccess: '✅ <strong>Microphone permission granted successfully!</strong><br><span style="font-size:12px; font-weight:400; color:#047857">This tab will close automatically in 2 seconds. Please return to the Owly.AI Side Panel.</span>',
    statusError: '⚠️ <strong>Microphone permission is not active or was denied.</strong><br><span style="font-size:12px; font-weight:400; color:#B91C1C">Click the button above, then select <strong>"Allow"</strong> on the browser prompt at the top-left of the address bar.</span>',
    langToggle: "EN (Switch to ID)",
  },
  id: {
    pageTitle: "Aktivasi Mikrofon — Owly.AI Voicebot",
    heading: "Aktivasi Izin Mikrofon",
    desc: 'Chrome mewajibkan izin mikrofon disetujui melalui tab peramban biasa sebelum dapat digunakan di Side Panel. Klik tombol di bawah lalu pilih <strong>"Allow" / "Izinkan"</strong> pada popup peramban di kiri atas URL bar.',
    btnIdle: "Izinkan Akses Mikrofon",
    btnRequesting: "Meminta izin mikrofon ke Chrome...",
    btnRetry: "Klik untuk Beri Izin Mikrofon",
    statusSuccess: '✅ <strong>Izin mikrofon berhasil diberikan!</strong><br><span style="font-size:12px; font-weight:400; color:#047857">Tab ini akan otomatis ditutup dalam 2 detik. Silakan kembali ke Side Panel Owly.AI.</span>',
    statusError: '⚠️ <strong>Izin mikrofon belum aktif atau dibatalkan.</strong><br><span style="font-size:12px; font-weight:400; color:#B91C1C">Klik tombol di atas, lalu pilih <strong>"Allow"</strong> / <strong>"Izinkan"</strong> pada popup peramban di kiri atas URL bar.</span>',
    langToggle: "ID (Ganti ke EN)",
  },
};

let currentLang = "en"; // Default: American English

const btn = document.getElementById("btnGrant");
const btnText = document.getElementById("btnText");
const statusBox = document.getElementById("statusBox");
const pageTitle = document.getElementById("pageTitle");
const permHeading = document.getElementById("permHeading");
const permDesc = document.getElementById("permDesc");
const langBtn = document.getElementById("langBtn");
const langLabel = document.getElementById("langLabel");

function applyLanguage(lang) {
  currentLang = lang === "id" ? "id" : "en";
  const dict = PERM_I18N[currentLang];

  if (pageTitle) pageTitle.textContent = dict.pageTitle;
  if (permHeading) permHeading.textContent = dict.heading;
  if (permDesc) permDesc.innerHTML = dict.desc;
  if (btnText && (!btn.disabled || btnText.textContent === PERM_I18N.en.btnIdle || btnText.textContent === PERM_I18N.id.btnIdle)) {
    btnText.textContent = dict.btnIdle;
  }
  if (langLabel) {
    langLabel.textContent = currentLang === "en" ? "EN ⇄ ID" : "ID ⇄ EN";
  }
  document.documentElement.lang = currentLang;
}

function initLanguage() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["owly_preferred_lang", "preferred_language"], (res) => {
      const saved = res.owly_preferred_lang || res.preferred_language;
      if (saved === "id" || saved === "en") {
        applyLanguage(saved);
      } else {
        applyLanguage("en");
      }
    });
  } else {
    const saved = localStorage.getItem("owly_preferred_lang");
    if (saved === "id" || saved === "en") {
      applyLanguage(saved);
    } else {
      applyLanguage("en");
    }
  }
}

if (langBtn) {
  langBtn.addEventListener("click", () => {
    const nextLang = currentLang === "en" ? "id" : "en";
    applyLanguage(nextLang);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ owly_preferred_lang: nextLang, preferred_language: nextLang });
    } else {
      localStorage.setItem("owly_preferred_lang", nextLang);
    }
  });
}

async function requestMic() {
  if (!btn || !statusBox) return;
  const dict = PERM_I18N[currentLang] || PERM_I18N.en;

  btn.disabled = true;
  if (btnText) {
    btnText.textContent = dict.btnRequesting;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop tracks immediately after permission is confirmed
    stream.getTracks().forEach((track) => track.stop());

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        owly_mic_granted: true,
        savvy_mic_granted: true,
      });
    }

    statusBox.className = "status-box status-success";
    statusBox.style.display = "block";
    statusBox.innerHTML = dict.statusSuccess;
    btn.style.display = "none";

    setTimeout(() => {
      window.close();
    }, 2200);
  } catch (err) {
    console.warn("[Owly.AI] Microphone permission request error:", err);
    btn.disabled = false;
    if (btnText) {
      btnText.textContent = dict.btnRetry;
    }
    statusBox.className = "status-box status-error";
    statusBox.style.display = "block";
    statusBox.innerHTML = dict.statusError;
  }
}

if (btn) {
  btn.addEventListener("click", requestMic);
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  requestMic();
});
