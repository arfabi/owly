// ============================================================================
// SAVVY.AI — Content Script (Chrome Manifest V3)
// Injeksi Closed Shadow DOM, Field Detection, dan Accessibility Controller
// ============================================================================

(() => {
  // Cegah injeksi ganda jika script sudah aktif di halaman/frame ini
  if ((window as any).__SAVVY_CONTENT_SCRIPT_INITIALIZED__) {
    return;
  }
  (window as any).__SAVVY_CONTENT_SCRIPT_INITIALIZED__ = true;
  try {
    document.documentElement.dataset.owlyExtension = "installed";
    (window as any).__OWLY_EXTENSION_INSTALLED__ = true;
  } catch (_) {}

  // Web simulator communication bridge
  window.addEventListener("message", (event) => {
    if (event.data?.type === "OWLY_PING") {
      window.postMessage({ type: "OWLY_PONG", version: "1.0.0", installed: true }, "*");
    }
    if (event.data?.type === "OWLY_OPEN_SIDEPANEL") {
      try {
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL_REQUEST" }).catch(() => {});
        }
      } catch (_) {}
    }
  });

  // Bersihkan observer lama jika di-injeksi ulang setelah extension reload
  if ((window as any).__SAVVY_OBSERVER__) {
    try {
      (window as any).__SAVVY_OBSERVER__.disconnect();
    } catch (_) {}
  }

  // Inlined Logger: Menjamin content script 100% classic IIFE tanpa external ES module import
  const BADGE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
    PERCEPTION: { bg: "#398CF5", color: "#FFFFFF", icon: "👁️" },
    ACTION: { bg: "#F59E0B", color: "#000000", icon: "⚡" },
  };

  function logContentAgent(domain: "PERCEPTION" | "ACTION", message: string, data?: any) {
    const timestamp = new Date().toLocaleTimeString();
    const cfg = BADGE_STYLES[domain] || { bg: "#398CF5", color: "#FFFFFF", icon: "🤖" };
    const badgeStyle = `background: ${cfg.bg}; color: ${cfg.color}; font-weight: bold; border-radius: 4px; padding: 2px 6px; font-size: 11px;`;
    const timeStyle = `color: #64748B; font-size: 10px; margin-left: 4px;`;
    const msgStyle = `color: #0F172A; font-weight: 600; font-size: 12px;`;

    if (data !== undefined) {
      console.log(`%c${cfg.icon} [Savvy Agent: ${domain}]%c ${timestamp}%c ${message}`, badgeStyle, timeStyle, msgStyle, data);
    } else {
      console.log(`%c${cfg.icon} [Savvy Agent: ${domain}]%c ${timestamp}%c ${message}`, badgeStyle, timeStyle, msgStyle);
    }

    try {
      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: "AGENT_LOG_EVENT",
          event: { timestamp, domain, message, data: data ? JSON.parse(JSON.stringify(data)) : null },
        }).catch(() => {});
      }
    } catch (_) {}
  }

  const agentLog = {
    perception: (msg: string, data?: any) => logContentAgent("PERCEPTION", msg, data),
    action: (msg: string, data?: any) => logContentAgent("ACTION", msg, data),
  };

  // Content script translation dictionary
  const CONTENT_I18N = {
    en: {
      scannerTitle: "This Page is being scanned by Owly.AI",
      scannerSubtitle: "Please wait until finish...",
      snipTitle: "Owly Snip",
      snipInstruction: "Drag cursor over text or section to snip • ESC to cancel",
      snipExplainBtn: "Explain with Owly.AI",
      snipCopyBtn: "Copy Text",
      snipCopied: "Copied!",
      snipCancelTitle: "Cancel (ESC)",
      snipCapturing: "✓ Capturing screenshot...",
    },
    id: {
      scannerTitle: "Halaman ini sedang dipindai oleh Owly.AI",
      scannerSubtitle: "Mohon tunggu hingga selesai...",
      snipTitle: "Owly Snip",
      snipInstruction: "Seret kursor untuk memotong area teks • ESC untuk batal",
      snipExplainBtn: "Jelaskan dengan Owly.AI",
      snipCopyBtn: "Salin Teks",
      snipCopied: "Tersalin!",
      snipCancelTitle: "Batal (ESC)",
      snipCapturing: "✓ Mengambil tangkapan layar...",
    },
  };

  let contentLang: "en" | "id" = "en";
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.get(["owly_preferred_lang", "preferred_language"], (res) => {
      const saved = res.owly_preferred_lang || res.preferred_language;
      if (saved === "id" || saved === "en") {
        contentLang = saved;
      }
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        const newLang = changes.owly_preferred_lang?.newValue || changes.preferred_language?.newValue;
        if (newLang === "id" || newLang === "en") {
          contentLang = newLang;
        }
      }
    });
  }
  function getContentT() {
    return CONTENT_I18N[contentLang] || CONTENT_I18N.en;
  }

  agentLog.perception("Content Script activated. Closed Shadow DOM host initialized on page.");

  // 1. Injeksi Closed Shadow DOM untuk Beacon Spotlight & A11y Overlays
  // Bersihkan elemen host lama jika script di-injeksi ulang (misal: extension reload / SPA navigation)
  let shadowRoot: ShadowRoot;
  let hostContainer: HTMLElement | null = null;
  try {
    const existingHost = document.getElementById("savvy-root");
    if (existingHost) {
      try {
        existingHost.remove();
      } catch (_) {}
    }

    hostContainer = document.createElement("div");
    hostContainer.id = "savvy-root";
    hostContainer.style.position = "absolute";
    hostContainer.style.top = "0";
    hostContainer.style.left = "0";
    hostContainer.style.width = "100%";
    hostContainer.style.height = "100%";
    hostContainer.style.pointerEvents = "none";
    hostContainer.style.zIndex = "2147483647"; // Maksimum z-index
    (document.body || document.documentElement).appendChild(hostContainer);

    shadowRoot = hostContainer.attachShadow({ mode: "open" });
    (window as any).__SAVVY_SHADOW_ROOT__ = shadowRoot;
  } catch (err) {
    console.warn("[Savvy.AI] Shadow root attachment fallback:", err);
    shadowRoot = (window as any).__SAVVY_SHADOW_ROOT__ || (document.body as any);
  }

  // Style untuk elemen di dalam Closed Shadow DOM
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .savvy-spotlight {
      position: absolute;
      pointer-events: none;
      border: 2px solid #2563EB;
      background-color: rgba(37, 99, 235, 0.08);
      border-radius: 8px;
      transition: all 0.2s ease-out;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
      z-index: 10;
    }
    .savvy-spotlight-beacon {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 20px;
      height: 20px;
      background: #2563EB;
      color: white;
      font-size: 11px;
      font-weight: bold;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    /* Virtual AI Ghost Cursor Pointer (Show Me Agent) */
    .savvy-ghost-cursor {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 2147483647;
      transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
      will-change: transform, opacity;
      display: none;
      opacity: 0;
    }
    .savvy-ghost-cursor.visible {
      display: block;
      opacity: 1;
    }
    .savvy-ghost-cursor svg {
      filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.45));
      transform: rotate(-10deg);
      transition: transform 0.2s ease;
    }
    .savvy-ghost-cursor.clicking svg {
      transform: rotate(-10deg) scale(0.85);
    }
    .savvy-ghost-label {
      position: absolute;
      left: 22px;
      top: 14px;
      background: linear-gradient(135deg, #1e1b4b 0%, #2563eb 100%);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .savvy-ghost-pulse {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.45);
      border: 2px solid #60a5fa;
      transform: translate(-30%, -30%) scale(0);
      pointer-events: none;
      opacity: 0;
    }
    @keyframes savvy-ghost-ripple {
      0% { transform: translate(-30%, -30%) scale(0.3); opacity: 0.9; }
      50% { transform: translate(-30%, -30%) scale(2.8); opacity: 0.5; }
      100% { transform: translate(-30%, -30%) scale(4.8); opacity: 0; }
    }
    .savvy-ghost-pulse.active-pulse {
      animation: savvy-ghost-ripple 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }
    .savvy-reading-guide {
      position: fixed;
      left: 0;
      width: 100%;
      height: 48px;
      background: rgba(37, 99, 235, 0.12);
      border-top: 2px solid #2563EB;
      border-bottom: 2px solid #2563EB;
      pointer-events: none;
      z-index: 2147483646;
      display: none;
    }

    /* Scanner Laser Beam Animation */
    .savvy-scanner-overlay {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483646;
      overflow: hidden;
      transition: opacity 0.3s ease;
    }
    .savvy-scanner-overlay.fade-out {
      opacity: 0;
    }
    .savvy-scanner-backdrop {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0.45) 100%);
    }
    .savvy-laser-beam {
      position: absolute;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.8) 15%, #2563EB 50%, rgba(56, 189, 248, 0.8) 85%, transparent 100%);
      box-shadow: 0 0 16px #38BDF8, 0 0 32px #2563EB, 0 0 4px #FFFFFF;
      animation: savvyLaserSweep 2.6s ease-in-out infinite alternate;
    }
    .savvy-laser-trail {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 90px;
      background: linear-gradient(to top, rgba(37, 99, 235, 0.18), transparent);
      pointer-events: none;
    }
    @keyframes savvyLaserSweep {
      0% {
        top: 2%;
      }
      100% {
        top: 98%;
      }
    }
    .savvy-scanner-card {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 18px;
      padding: 20px 32px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 35px rgba(37, 99, 235, 0.25);
      text-align: center;
      color: #FFFFFF;
      z-index: 2147483647;
      pointer-events: auto;
      animation: savvyCardPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes savvyCardPop {
      0% { transform: translate(-50%, -46%) scale(0.95); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    .savvy-scanner-card-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .savvy-scanner-spinner {
      width: 18px;
      height: 18px;
      border: 2.5px solid rgba(56, 189, 248, 0.25);
      border-top-color: #38BDF8;
      border-radius: 50%;
      animation: savvySpin 0.8s linear infinite;
    }
    @keyframes savvySpin {
      to { transform: rotate(360deg); }
    }
    .savvy-scanner-title {
      font-size: 15px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.2px;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    .savvy-scanner-subtitle {
      font-size: 12px;
      color: #94A3B8;
      font-weight: 500;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    }

    /* Numbered Field Badges */
    .savvy-field-number-badge {
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #2563EB;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.45), 0 0 0 2px #FFFFFF;
      cursor: pointer;
      pointer-events: auto;
      z-index: 2147483647;
      transition: transform 0.15s ease, background 0.15s ease;
      user-select: none;
    }
    .savvy-field-number-badge:hover {
      background: #1D4ED8;
      transform: scale(1.22);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.55), 0 0 0 2px #FFFFFF;
    }
    .savvy-field-number-badge.active-badge {
      background: #10B981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4), 0 0 0 2px #FFFFFF;
      transform: scale(1.22);
    }
  `;
  shadowRoot.appendChild(styleEl);

  // Laser scanner overlay controller
  function startScanAnimation() {
    stopScanAnimation();
    const t = getContentT();
    const overlay = document.createElement("div");
    overlay.className = "savvy-scanner-overlay";
    overlay.innerHTML = `
      <div class="savvy-scanner-backdrop"></div>
      <div class="savvy-laser-beam">
        <div class="savvy-laser-trail"></div>
      </div>
      <div class="savvy-scanner-card">
        <div class="savvy-scanner-card-header">
          <span class="savvy-scanner-spinner"></span>
          <span class="savvy-scanner-title">${t.scannerTitle}</span>
        </div>
        <div class="savvy-scanner-subtitle">${t.scannerSubtitle}</div>
      </div>
    `;
    shadowRoot.appendChild(overlay);
    agentLog.action("✨ Laser scanner animation activated on page.");
  }

  function stopScanAnimation() {
    const existing = shadowRoot.querySelector(".savvy-scanner-overlay");
    if (existing) {
      existing.classList.add("fade-out");
      setTimeout(() => existing.remove(), 250);
      agentLog.action("✨ Laser scanner animation stopped.");
    }
  }

  // Clean label helper
  function cleanLabelText(raw: string): string {
    return raw
      .replace(/[\n\r\t]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[*:]+$/, "")
      .trim();
  }

  function isValidLabelText(txt: string | null | undefined): boolean {
    if (!txt) return false;
    const cleaned = cleanLabelText(txt);
    if (cleaned.length < 2 || cleaned.length > 70) return false;
    // Exclude pure format hints or placeholders (e.g. DD/MM/YYY, 08xx, ---)
    if (/^(dd[\/\-\.]mm|yyyy[\/\-\.]mm|mm[\/\-\.]dd|hh:mm|08x|\+62|contoh|e\.g\.|example|\.\.\.|---)/i.test(cleaned)) {
      return false;
    }
    return true;
  }

  // Enhanced Helper untuk mencari Label dari Form Element & Upload Trigger
  function findElementLabel(el: HTMLElement): string {
    // 1. Explicit ARIA label
    if (el.getAttribute("aria-label") && isValidLabelText(el.getAttribute("aria-label"))) {
      return cleanLabelText(el.getAttribute("aria-label")!);
    }
    const ariaLabelledby = el.getAttribute("aria-labelledby");
    if (ariaLabelledby) {
      const lblEl = document.getElementById(ariaLabelledby);
      if (lblEl && isValidLabelText(lblEl.textContent)) return cleanLabelText(lblEl.textContent);
    }

    // 2. Explicit label[for=id]
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label && isValidLabelText(label.textContent)) return cleanLabelText(label.textContent);
    }

    // 3. Enclosing label
    const parentLabel = el.closest("label");
    if (parentLabel && isValidLabelText(parentLabel.textContent)) {
      return cleanLabelText(parentLabel.textContent);
    }

    // 4. Ancestor & Column traversal (up to 5 levels)
    // Common layout: <div class="row"><div class="col-4"><label>Date of Issue</label></div><div class="col-8"><input></div></div>
    let curr: HTMLElement | null = el.parentElement;
    let depth = 0;
    while (curr && depth < 5 && curr.tagName !== "BODY" && curr.tagName !== "FORM") {
      // 4a. FIRST check inside current ancestor container (e.g. wrapper div containing this input and its label)
      const insideLabel = curr.querySelector("label, .form-label, .col-form-label, dt, th, legend, h3, h4, h5, h6, strong, b");
      if (insideLabel && !insideLabel.contains(el) && isValidLabelText(insideLabel.textContent)) {
        return cleanLabelText(insideLabel.textContent);
      }

      // 4b. Check preceding sibling of current ancestor container (e.g. left column div)
      let sib = curr.previousElementSibling;
      while (sib) {
        const cand = sib.querySelector("label, .form-label, .col-form-label, dt, th, legend, h3, h4, h5, h6, strong, b");
        if (cand && isValidLabelText(cand.textContent)) {
          return cleanLabelText(cand.textContent);
        }
        if (isValidLabelText(sib.textContent)) {
          return cleanLabelText(sib.textContent);
        }
        sib = sib.previousElementSibling;
      }

      // 4c. Table row
      if (curr.tagName === "TR") {
        const th = curr.querySelector("th, td:first-child");
        if (th && !th.contains(el) && isValidLabelText(th.textContent)) {
          return cleanLabelText(th.textContent);
        }
      }

      curr = curr.parentElement;
      depth++;
    }

    // 5. Immediate previous sibling elements of the input
    let prev = el.previousElementSibling;
    while (prev) {
      if (["LABEL", "H3", "H4", "H5", "H6", "P", "SPAN", "STRONG", "B", "DIV"].includes(prev.tagName)) {
        if (isValidLabelText(prev.textContent)) return cleanLabelText(prev.textContent);
      }
      prev = prev.previousElementSibling;
    }

    // 6. Geometric Proximity Search (Find nearest text element to the left or immediately above)
    try {
      const elRect = el.getBoundingClientRect();
      if (elRect.width > 0 && elRect.height > 0) {
        const candidates = Array.from(
          document.querySelectorAll("label, .form-label, .col-form-label, dt, th, legend, h4, h5, h6, strong, b, [class*='label']")
        ) as HTMLElement[];

        let bestCandidate: HTMLElement | null = null;
        let minDistance = 99999;

        for (const cand of candidates) {
          if (cand.contains(el) || el.contains(cand)) continue;
          if (!isValidLabelText(cand.textContent)) continue;

          const r = cand.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;

          // Candidate to the left on the same horizontal row
          const isLeftSameRow =
            r.right <= elRect.left + 25 &&
            r.left >= elRect.left - 450 &&
            Math.abs((r.top + r.bottom) / 2 - (elRect.top + elRect.bottom) / 2) < 28;

          // Candidate immediately above in same column
          const isDirectlyAbove =
            r.bottom <= elRect.top + 8 &&
            r.bottom >= elRect.top - 50 &&
            r.left < elRect.right &&
            r.right > elRect.left - 30;

          if (isLeftSameRow) {
            const dist = elRect.left - r.right;
            if (dist >= 0 && dist < minDistance) {
              minDistance = dist;
              bestCandidate = cand;
            }
          } else if (isDirectlyAbove) {
            const dist = (elRect.top - r.bottom) * 1.5;
            if (dist >= 0 && dist < minDistance) {
              minDistance = dist;
              bestCandidate = cand;
            }
          }
        }

        if (bestCandidate && bestCandidate.textContent) {
          return cleanLabelText(bestCandidate.textContent);
        }
      }
    } catch (_) {}

    // 7. Button text for upload triggers
    if (el.tagName === "BUTTON" || el.getAttribute("role") === "button") {
      const btnTxt = el.textContent?.trim();
      if (btnTxt && /^(upload|unggah|browse|pilih file|pilih berkas|choose file)$/i.test(btnTxt)) {
        const card = el.closest(".card, .panel, .upload-container, .form-group, [class*='upload'], div");
        if (card) {
          const heading = card.querySelector("h3, h4, h5, h6, label, .title, strong");
          if (heading && isValidLabelText(heading.textContent)) {
            return cleanLabelText(heading.textContent);
          }
        }
      }
      if (btnTxt) return cleanLabelText(btnTxt);
    }

    // 8. Placeholder (ONLY if it is NOT a format hint like DD/MM/YY)
    const placeholder = el.getAttribute("placeholder");
    if (placeholder && isValidLabelText(placeholder)) {
      return cleanLabelText(placeholder);
    }

    // 9. Name or ID attribute fallback, cleaned of prefixes
    const rawName = el.getAttribute("name") || el.id || "";
    if (rawName) {
      if (rawName === "_username" || rawName === "username") return "Email";
      if (rawName === "_password" || rawName === "password") return "Password";
      return cleanLabelText(rawName.replace(/[_\-]+/g, " "));
    }

    return "Kolom Form";
  }

  // Canonical Form Field Collector for 100% synchronized Scanning & Badging
  interface FormFieldItem {
    targetEl: HTMLElement;
    badgeTargetEl: HTMLElement;
    id: string;
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
    type: string;
  }

  function getInteractiveFormElements(): FormFieldItem[] {
    const result: FormFieldItem[] = [];
    const visitedEls = new Set<HTMLElement>();

    // 1. Gather all inputs, selects, textareas
    const inputs = Array.from(
      document.querySelectorAll("input, select, textarea")
    ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    inputs.forEach((el) => {
      if (el.type === "hidden" || el.type === "submit" || el.type === "reset") return;

      // Check if it's a file input
      if (el.type === "file") {
        const rect = el.getBoundingClientRect();
        const isDirectlyVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== "hidden";
        
        let badgeTarget: HTMLElement = el;
        if (!isDirectlyVisible) {
          const labelFor = el.id ? document.querySelector<HTMLElement>(`label[for="${el.id}"]`) : null;
          const parentLabel = el.closest<HTMLElement>("label");
          const parentContainer = el.closest<HTMLElement>(".form-group, .upload-container, div");
          const triggerBtn = parentContainer?.querySelector<HTMLElement>("button, .btn, [role='button'], label");

          const visibleTrigger = [labelFor, parentLabel, triggerBtn].find((candidate) => {
            if (!candidate) return false;
            const r = candidate.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && window.getComputedStyle(candidate).visibility !== "hidden";
          });

          if (visibleTrigger) {
            badgeTarget = visibleTrigger;
          } else {
            return;
          }
        }

        visitedEls.add(el);
        visitedEls.add(badgeTarget);

        result.push({
          targetEl: el,
          badgeTargetEl: badgeTarget,
          id: el.id || el.name || "",
          name: el.name || "",
          label: findElementLabel(badgeTarget) || findElementLabel(el) || "Upload File",
          placeholder: "",
          required: el.required,
          type: "file",
        });
        return;
      }

      // Normal input, select, textarea
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== "hidden";
      if (!isVisible) return;

      visitedEls.add(el);
      let label = findElementLabel(el);
      // For radios / checkboxes, include value or parent label text if available
      if (el.type === "radio" || el.type === "checkbox") {
        const parentLbl = el.closest("label")?.textContent?.trim();
        const val = (el as HTMLInputElement).value;
        if (parentLbl && !label.includes(parentLbl)) {
          label = `${label} (${parentLbl})`;
        } else if (val && val !== "on" && !label.includes(val)) {
          label = `${label} (${val})`;
        }
      }

      result.push({
        targetEl: el,
        badgeTargetEl: el,
        id: el.id || el.name || "",
        name: el.name || "",
        label,
        placeholder: (el as HTMLInputElement).placeholder || "",
        required: el.required,
        type: el.type || el.tagName.toLowerCase(),
      });
    });

    // 2. Standalone Upload buttons / labels matching upload keywords
    const buttonsAndLabels = Array.from(
      document.querySelectorAll("button, [role='button'], a.btn, label.btn, .upload-btn")
    ) as HTMLElement[];

    buttonsAndLabels.forEach((btn) => {
      if (visitedEls.has(btn)) return;
      const txt = (btn.textContent || "").trim().toLowerCase();
      const isUploadBtn =
        /^(upload|unggah|browse|pilih file|pilih berkas|choose file)/i.test(txt) ||
        btn.getAttribute("aria-label")?.toLowerCase().includes("upload");

      if (isUploadBtn) {
        const rect = btn.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(btn).visibility !== "hidden";
        if (!isVisible) return;

        visitedEls.add(btn);
        result.push({
          targetEl: btn,
          badgeTargetEl: btn,
          id: btn.id || "",
          name: btn.getAttribute("name") || "",
          label: findElementLabel(btn),
          placeholder: "",
          required: false,
          type: "file",
        });
      }
    });

    // Sort elements in visual reading order (top-to-bottom, left-to-right) so badges match exact page layout
    result.sort((a, b) => {
      const rectA = a.badgeTargetEl.getBoundingClientRect();
      const rectB = b.badgeTargetEl.getBoundingClientRect();
      if (Math.abs(rectA.top - rectB.top) > 12) {
        return rectA.top - rectB.top;
      }
      return rectA.left - rectB.left;
    });

    return result;
  }

  // Pre-Submit Form Audit Snapshot Extractor (Scrapes values, DOM constraints, surrounding cues, & file limits)
  function extractFormAuditSnapshot() {
    const detected = getInteractiveFormElements();
    const fields = detected.map((item) => {
      const el = item.targetEl as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);
      let val = "";
      if (el) {
        if (el.tagName === "SELECT") {
          const sel = el as HTMLSelectElement;
          val = sel.options[sel.selectedIndex]?.text || sel.value || "";
        } else if (el.type === "file") {
          const fileInput = el as HTMLInputElement;
          val = fileInput.files?.[0]?.name || "";
        } else if (el.type === "checkbox" || el.type === "radio") {
          const inputEl = el as HTMLInputElement;
          val = inputEl.checked ? (inputEl.value || "checked") : "";
        } else {
          val = (el as HTMLInputElement).value || "";
        }
      }

      // Check asterisk or required cues in label or siblings
      const parent = el.closest(".form-group, .mb-3, .form-row, tr, div") || el.parentElement;
      const parentText = parent?.textContent || "";
      const labelText = item.label || "";
      const hasAsterisk = labelText.includes("*") || parentText.includes("*") || el.getAttribute("aria-required") === "true";

      // Surrounding context (search for hints like (Contoh: ...) or format cues)
      const contextMatch = parentText.match(/\(([^)]+)\)/);
      const surroundingContext = contextMatch ? contextMatch[0] : "";

      const minLen = ("minLength" in el && typeof (el as any).minLength === "number" && (el as any).minLength > 0) ? (el as any).minLength : undefined;
      const maxLen = ("maxLength" in el && typeof (el as any).maxLength === "number" && (el as any).maxLength > 0) ? (el as any).maxLength : undefined;
      const pattern = el.getAttribute("pattern") || undefined;
      const inputMask = el.getAttribute("data-mask") || el.getAttribute("data-inputmask") || undefined;
      const accept = el.getAttribute("accept") || undefined;

      return {
        fieldId: item.id || el.id || item.name,
        name: item.name || el.name || item.id,
        label: item.label,
        currentValue: val.trim(),
        surroundingContext,
        rules: {
          isRequired: el.required || hasAsterisk,
          placeholder: item.placeholder || (el as any).placeholder || "",
          pattern,
          minLength: minLen,
          maxLength: maxLen,
          type: item.type || el.type || "text",
          inputMaskDetected: inputMask,
          accept,
        },
      };
    });

    // Extract page-wide upload & instruction cues from sidebars, alerts, footnotes
    const pageWideFileInstructions: string[] = [];
    const candidateTexts = Array.from(document.querySelectorAll("aside, .alert, .note, .keterangan, .sidebar, .info, footer, small, p, li"))
      .map((el) => el.textContent?.trim() || "")
      .filter((txt) => {
        const lower = txt.toLowerCase();
        return (
          (lower.includes("mb") || lower.includes("kb") || lower.includes("pdf") || lower.includes("jpg") || lower.includes("png")) &&
          (lower.includes("maksimal") || lower.includes("ukuran") || lower.includes("file") || lower.includes("berkas") || lower.includes("format"))
        );
      })
      .slice(0, 5);

    pageWideFileInstructions.push(...candidateTexts);

    // Extract attached files metadata
    const attachedFilesMetadata: Array<{
      fieldName: string;
      fileName: string;
      fileSizeKb: number;
      fileExtension: string;
    }> = [];

    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
    fileInputs.forEach((fi) => {
      if (fi.files && fi.files.length > 0) {
        const f = fi.files[0];
        const ext = f.name.includes(".") ? f.name.split(".").pop()?.toLowerCase() || "" : "";
        attachedFilesMetadata.push({
          fieldName: fi.name || fi.id || "file",
          fileName: f.name,
          fileSizeKb: Math.round(f.size / 1024),
          fileExtension: ext,
        });
      }
    });

    return {
      fields,
      pageUploadContext: {
        pageWideFileInstructions,
        attachedFilesMetadata,
      },
      meta: {
        url: window.location.href,
        domain: window.location.hostname,
        title: document.title,
      },
    };
  }

  // Numbered field badges controller
  let activeNumberedBadges: {
    badgeEl: HTMLElement;
    targetEl: HTMLElement;
    badgeTargetEl: HTMLElement;
    index: number;
  }[] = [];

  function updateBadgePositions() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    activeNumberedBadges.forEach(({ badgeEl, badgeTargetEl, targetEl }) => {
      const anchor = badgeTargetEl || targetEl;
      if (!document.body.contains(anchor)) {
        badgeEl.style.display = "none";
        return;
      }
      const rect = anchor.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        badgeEl.style.display = "none";
        return;
      }
      badgeEl.style.display = "flex";
      badgeEl.style.top = `${rect.top + scrollTop - 10}px`;
      badgeEl.style.left = `${rect.right + scrollLeft - 12}px`;
    });
  }

  function showFieldNumberBadges() {
    hideFieldNumberBadges();

    const detected = getInteractiveFormElements();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    detected.forEach((item, idx) => {
      const fieldIndex = idx + 1; // 1-based display
      const rect = item.badgeTargetEl.getBoundingClientRect();

      const badge = document.createElement("div");
      badge.className = "savvy-field-number-badge";
      badge.textContent = `${fieldIndex}`;
      badge.title = `Kolom #${fieldIndex}: ${item.label} (Klik untuk panduan)`;
      badge.style.top = `${rect.top + scrollTop - 10}px`;
      badge.style.left = `${rect.right + scrollLeft - 12}px`;

      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        item.targetEl.focus();
        item.badgeTargetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        showFieldSpotlight(item.badgeTargetEl);

        activeNumberedBadges.forEach((b, i) => {
          if (i === idx) b.badgeEl.classList.add("active-badge");
          else b.badgeEl.classList.remove("active-badge");
        });

        try {
          chrome.runtime.sendMessage({
            type: "FIELD_SELECTED_FROM_PAGE",
            fieldIndex: idx,
            fieldId: item.id || "",
            fieldName: item.name || "",
            label: item.label,
          }).catch(() => {});
        } catch (_) {}
      });

      shadowRoot.appendChild(badge);
      activeNumberedBadges.push({
        badgeEl: badge,
        targetEl: item.targetEl,
        badgeTargetEl: item.badgeTargetEl,
        index: idx,
      });
    });

    window.addEventListener("scroll", updateBadgePositions, { passive: true });
    window.addEventListener("resize", updateBadgePositions, { passive: true });
    agentLog.action(`🔢 Rendered numbered badges for ${detected.length} interactive fields.`);
  }

  function hideFieldNumberBadges() {
    activeNumberedBadges.forEach(({ badgeEl }) => badgeEl.remove());
    activeNumberedBadges = [];
    window.removeEventListener("scroll", updateBadgePositions);
    window.removeEventListener("resize", updateBadgePositions);
  }

  const spotlightEl = document.createElement("div");
  spotlightEl.className = "savvy-spotlight";
  spotlightEl.style.display = "none";
  spotlightEl.innerHTML = `<div class="savvy-spotlight-beacon">O</div>`;
  shadowRoot.appendChild(spotlightEl);

  // Virtual AI Ghost Cursor Pointer (Show Me Agent Visual Navigator)
  const ghostCursorEl = document.createElement("div");
  ghostCursorEl.className = "savvy-ghost-cursor";
  ghostCursorEl.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 3L11 20L14 13L21 10L4 3Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div class="savvy-ghost-pulse"></div>
    <div class="savvy-ghost-label">
      <span>✨</span> Owly
    </div>
  `;
  shadowRoot.appendChild(ghostCursorEl);

  let lastUserMousePos = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.3 };
  window.addEventListener("mousemove", (e) => {
    lastUserMousePos = { x: e.clientX, y: e.clientY };
  }, { passive: true });

  let ghostCursorTimeout: any = null;

  function animateGhostCursorToElement(target: HTMLElement) {
    if (ghostCursorTimeout) clearTimeout(ghostCursorTimeout);

    // 1. Smooth scroll ke arah target di halaman
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // 2. Beri jeda agar scrolling mulai berjalan, lalu luncurkan kursor virtual
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const targetX = rect.left + Math.min(Math.max(rect.width * 0.5, 12), rect.width - 8);
      const targetY = rect.top + Math.min(Math.max(rect.height * 0.5, 12), rect.height - 8);

      // Mulai kursor di posisi pointer mouse pengguna saat ini
      ghostCursorEl.style.transition = "none";
      ghostCursorEl.style.transform = `translate(${lastUserMousePos.x}px, ${lastUserMousePos.y}px)`;
      ghostCursorEl.classList.remove("clicking");
      const pulseEl = ghostCursorEl.querySelector(".savvy-ghost-pulse") as HTMLElement;
      if (pulseEl) pulseEl.classList.remove("active-pulse");

      ghostCursorEl.classList.add("visible");

      // Animasikan kursor meluncur secara smooth ke tombol/input target
      requestAnimationFrame(() => {
        ghostCursorEl.style.transition = "transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease";
        ghostCursorEl.style.transform = `translate(${targetX}px, ${targetY}px)`;

        // Ketika kursor tiba di target
        ghostCursorTimeout = setTimeout(() => {
          ghostCursorEl.classList.add("clicking");
          if (pulseEl) pulseEl.classList.add("active-pulse");

          // Tampilkan spotlight beacon di elemen target
          showFieldSpotlight(target);

          // Hilangkan kursor virtual setelah selesai menunjuk
          ghostCursorTimeout = setTimeout(() => {
            ghostCursorEl.classList.remove("visible");
            ghostCursorEl.classList.remove("clicking");
            if (pulseEl) pulseEl.classList.remove("active-pulse");
          }, 1800);
        }, 850);
      });
    }, 150);
  }

  let spotlightTimeout: any = null;

  function hideFieldSpotlight() {
    if (spotlightEl) {
      spotlightEl.style.display = "none";
    }
    if (spotlightTimeout) {
      clearTimeout(spotlightTimeout);
      spotlightTimeout = null;
    }
  }

  function showFieldSpotlight(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    spotlightEl.style.display = "block";
    spotlightEl.style.top = `${rect.top + scrollTop - 4}px`;
    spotlightEl.style.left = `${rect.left + scrollLeft - 4}px`;
    spotlightEl.style.width = `${rect.width + 8}px`;
    spotlightEl.style.height = `${rect.height + 8}px`;

    if (spotlightTimeout) clearTimeout(spotlightTimeout);
    spotlightTimeout = setTimeout(() => {
      spotlightEl.style.display = "none";
    }, 4000);
  }

  const readingGuideEl = document.createElement("div");
  readingGuideEl.className = "savvy-reading-guide";
  shadowRoot.appendChild(readingGuideEl);

  // 2. Tracking Mouse untuk Reading Guide (Spotlight Tool #1)
  window.addEventListener("mousemove", (e) => {
    if (readingGuideEl.style.display === "block") {
      readingGuideEl.style.top = `${e.clientY - 24}px`;
    }
  });

  // 3. Focus Listener untuk mendeteksi field aktif
  document.addEventListener("focusin", (e) => {
    const target = e.target as HTMLElement;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON")
    ) {
      const label = findElementLabel(target);
      agentLog.perception(`🎯 Field focused: '${target.id || target.getAttribute("name") || target.tagName.toLowerCase()}' (${label})`, {
        fieldId: target.id || "",
        tagName: target.tagName,
        inputType: (target as HTMLInputElement).type || "text",
        hasValue: !!(target as HTMLInputElement).value,
      });

      // Kirim metadata field ke background & sidepanel
      try {
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            type: "FIELD_FOCUSED",
            fieldId: target.id || "",
            fieldName: target.getAttribute("name") || "",
            label,
            tagName: target.tagName,
            inputType: (target as HTMLInputElement).type || "text",
            value: (target as HTMLInputElement).value || "",
          }).catch(() => {});

          // Jika badge nomor aktif, sinkronkan juga active badge dan notifikasi field terpilih ke sidepanel
          if (activeNumberedBadges.length > 0) {
            const matchIdx = activeNumberedBadges.findIndex(
              (b) => b.targetEl === target || b.badgeTargetEl === target
            );
            if (matchIdx !== -1) {
              activeNumberedBadges.forEach((b, i) => {
                if (i === matchIdx) b.badgeEl.classList.add("active-badge");
                else b.badgeEl.classList.remove("active-badge");
              });
              chrome.runtime.sendMessage({
                type: "FIELD_SELECTED_FROM_PAGE",
                fieldIndex: matchIdx,
                fieldId: target.id || "",
                fieldName: target.getAttribute("name") || "",
                label,
              }).catch(() => {});
            }
          }
        }
      } catch (_) {}
    }
  });

  document.addEventListener("focusout", () => {
    hideFieldSpotlight();
  });

  // 4b. MutationObserver & SPA Route Change Detection (multi_agents.md Section 8)
  let domChangeTimer: any = null;
  let lastFieldSignature = "";

  function computeFieldSignature(): string {
    const inputs = Array.from(document.querySelectorAll("input, select, textarea")) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];
    const visibleFields = inputs
      .filter((el) => el.type !== "hidden" && el.type !== "submit" && el.offsetParent !== null)
      .map((el) => {
        const ph = "placeholder" in el ? (el as HTMLInputElement).placeholder : "";
        return `${el.name || el.id || ph}:${el.type || el.tagName.toLowerCase()}`;
      });
    return visibleFields.join("|");
  }

  function onDomMutated() {
    clearTimeout(domChangeTimer);
    domChangeTimer = setTimeout(() => {
      const currentSignature = computeFieldSignature();
      if (currentSignature !== lastFieldSignature) {
        lastFieldSignature = currentSignature;
        const count = currentSignature ? currentSignature.split("|").length : 0;
        agentLog.perception(`🕵️ Dynamic DOM Mutation detected (${count} visible fields)`, {
          fieldCount: count,
          signature: currentSignature.substring(0, 80) + (currentSignature.length > 80 ? "..." : ""),
        });
        // Broadcast dynamic field mutation to side panel
        chrome.runtime.sendMessage({
          type: "FORM_DOM_MUTATED",
          signature: currentSignature,
          fieldCount: count,
        }).catch(() => {});
      }
    }, 400); // 400ms debounce
  }

  const domObserver = new MutationObserver((mutations) => {
    // Ignore mutations on savvy root container to prevent infinite feedback loops
    const hasExternalMutation = mutations.some((m) => {
      return hostContainer ? (m.target !== hostContainer && !hostContainer.contains(m.target as Node)) : true;
    });
    if (hasExternalMutation) {
      onDomMutated();
    }
  });

  (window as any).__SAVVY_OBSERVER__ = domObserver;
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "disabled", "aria-hidden", "style", "class"],
  });

  // SPA Route Change Listener
  window.addEventListener("popstate", onDomMutated);
  window.addEventListener("hashchange", onDomMutated);

  // ============================================================================
  // SHOW ME: Cascading Element Finder (Level 1 & Level 2)
  // ============================================================================
  const SYNONYM_DICTIONARY: Record<string, string[]> = {
    "bikin akun": ["sign up", "signup", "register", "daftar", "registrasi", "buat akun", "create account", "join"],
    "buat akun": ["sign up", "signup", "register", "daftar", "registrasi", "create account", "join"],
    "daftar": ["sign up", "signup", "register", "registrasi", "buat akun", "apply", "pendaftaran"],
    "masuk": ["login", "log in", "sign in", "signin", "masuk"],
    "login": ["log in", "sign in", "signin", "masuk"],
    "signup": ["sign up", "register", "daftar", "registrasi", "buat akun"],
    "keluar": ["logout", "log out", "sign out", "keluar"],
    "unggah": ["upload", "unggah", "pilih berkas", "pilih file", "choose file", "browse"],
    "upload": ["unggah", "pilih berkas", "pilih file", "choose file", "browse"],
    "unduh": ["download", "unduh", "unduh berkas", "ambil file"],
    "download": ["unduh", "unduh berkas", "ambil file"],
    "syarat": ["persyaratan", "kriteria", "ketentuan", "eligibility", "terms", "requirement"],
    "persyaratan": ["syarat", "kriteria", "ketentuan", "eligibility", "terms", "requirement"],
    "bantuan": ["help", "bantuan", "faq", "panduan", "hubungi kami", "contact", "support"],
    "biaya": ["tarif", "harga", "biaya", "fee", "cost", "pembayaran", "payment"],
    "kirim": ["submit", "kirim", "send", "ajukan", "lanjut", "next"],
    "submit": ["kirim", "send", "ajukan", "simpan", "save"],
    "simpan": ["save", "simpan", "submit"],
    "batal": ["cancel", "batal", "reset"],
  };

  function findAndHighlightDomElement(rawQuery: string): {
    success: boolean;
    level?: number;
    matchedText?: string;
    tag?: string;
    candidates?: Array<{ domIndex: number; tag: string; text: string; aria?: string; placeholder?: string }>;
  } {
    const q = rawQuery.toLowerCase().trim();
    if (!q) return { success: false };

    // Strip generic filler words: "tombol", "button", "bagian", "seksi", "kolom", "field", "link"
    const cleanQ = q
      .replace(/\b(tombol|button|bagian|seksi|kolom|field|link|halaman|menu)\b/gi, "")
      .trim();
    const effectiveQ = cleanQ.length >= 2 ? cleanQ : q;

    // Gather all visible interactive elements & key structural elements
    const selector = "button, a, input, select, textarea, [role='button'], [role='link'], [role='tab'], h1, h2, h3, h4, h5, h6, section, [id], label, dt, th";
    const all = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

    const visibleElements: HTMLElement[] = [];
    for (const el of all) {
      if (el.id === "savvy-root" || el.closest("#savvy-root")) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 4 || rect.height <= 4) continue;
      const style = window.getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue;
      visibleElements.push(el);
    }

    const getElText = (el: HTMLElement) => {
      const aria = el.getAttribute("aria-label") || "";
      const placeholder = (el as HTMLInputElement).placeholder || "";
      const text = el.textContent?.trim() || "";
      const title = el.getAttribute("title") || "";
      const val = (el as HTMLInputElement).value || "";
      return `${text} ${aria} ${placeholder} ${title} ${val}`.toLowerCase().replace(/\s+/g, " ").trim();
    };

    // LEVEL 1: Exact & Substring Match
    let bestEl: HTMLElement | null = null;
    let bestScore = 0;

    for (const el of visibleElements) {
      const elText = getElText(el);
      if (!elText) continue;

      const isInteractive = /^(button|a|input|select|textarea)$/i.test(el.tagName) || el.getAttribute("role") === "button" || el.getAttribute("role") === "link";
      let score = 0;

      if (elText === effectiveQ || elText === q) {
        score = isInteractive ? 100 : 85;
      } else if (elText.includes(effectiveQ)) {
        score = isInteractive ? 80 : 65;
      }

      if (score > bestScore) {
        bestScore = score;
        bestEl = el;
      }
    }

    if (bestEl && bestScore >= 65) {
      animateGhostCursorToElement(bestEl);
      agentLog.action(`🎯 [Show Me Level 1] Found exact/substring match for "${rawQuery}" -> <${bestEl.tagName.toLowerCase()}>`, { score: bestScore });
      return {
        success: true,
        level: 1,
        matchedText: bestEl.textContent?.trim().slice(0, 50) || bestEl.getAttribute("aria-label") || bestEl.tagName,
        tag: bestEl.tagName.toLowerCase(),
      };
    }

    // LEVEL 2: Synonym Heuristics
    for (const [key, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
      if (effectiveQ.includes(key) || key.includes(effectiveQ)) {
        for (const syn of synonyms) {
          for (const el of visibleElements) {
            const elText = getElText(el);
            if (elText.includes(syn)) {
              animateGhostCursorToElement(el);
              agentLog.action(`⚡ [Show Me Level 2] Found synonym match ("${key}" -> "${syn}") for "${rawQuery}" -> <${el.tagName.toLowerCase()}>`);
              return {
                success: true,
                level: 2,
                matchedText: el.textContent?.trim().slice(0, 50) || syn,
                tag: el.tagName.toLowerCase(),
              };
            }
          }
        }
      }
    }

    // LEVEL 3 Prep: No match in Level 1 & 2 -> Harvest top candidates for Meta Muse Spark
    const interactiveOnly = visibleElements.filter((el) => {
      const tag = el.tagName.toLowerCase();
      return tag === "button" || tag === "a" || tag === "input" || el.getAttribute("role") === "button" || el.getAttribute("role") === "link";
    });

    const candidatesPool = interactiveOnly.length >= 5 ? interactiveOnly : visibleElements;
    const topCandidates = candidatesPool.slice(0, 20);

    (window as any).__SAVVY_SHOW_ME_CANDIDATES__ = topCandidates;

    const candidatePayload = topCandidates.map((el, idx) => ({
      domIndex: idx,
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
      aria: el.getAttribute("aria-label") || "",
      placeholder: (el as HTMLInputElement).placeholder || "",
    })).filter((c) => c.text.length > 0 || c.aria.length > 0 || c.placeholder.length > 0);

    return {
      success: false,
      candidates: candidatePayload,
    };
  }

  // 5. Message Listener dari Side Panel
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // Show Me 4-Level Dispatchers
    if (message.type === "FIND_AND_HIGHLIGHT_ELEMENT") {
      const result = findAndHighlightDomElement(message.query || "");
      sendResponse(result);
      return;
    }

    if (message.type === "HIGHLIGHT_DOM_ELEMENT_BY_INDEX") {
      const idx = message.domIndex;
      const list = (window as any).__SAVVY_SHOW_ME_CANDIDATES__;
      if (list && list[idx]) {
        const el = list[idx] as HTMLElement;
        animateGhostCursorToElement(el);
        sendResponse({ success: true, text: el.textContent?.trim().slice(0, 50) });
        return;
      }
      sendResponse({ success: false, reason: "Element index not found in cache" });
      return;
    }

    if (message.type === "INJECT_VALUE") {
      const { fieldId, fieldName, fieldIndex, value } = message;
      let target: HTMLElement | null = null;
      if (typeof fieldIndex === "number" && activeNumberedBadges[fieldIndex]) {
        target = activeNumberedBadges[fieldIndex].targetEl;
      }
      if (!target && fieldId) target = document.getElementById(fieldId);
      if (!target && fieldName) target = document.querySelector(`[name="${fieldName}"]`);

      if (target && ("value" in target)) {
        (target as HTMLInputElement).value = value;
        // Trigger framework change events (React, Vue, dll)
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
        target.dispatchEvent(new Event("blur", { bubbles: true }));
        agentLog.action(`⚡ Injected value into field '${fieldId || fieldName || fieldIndex}'`, { targetTag: target.tagName });
        sendResponse({ success: true });
        return;
      }
      sendResponse({ success: false, reason: "Element not found" });
    }

    if (message.type === "SET_A11Y_FEATURE") {
      const { feature, enabled, value, level } = message;
      applyA11yFeature(feature, enabled, value, level);
      agentLog.action(`👓 A11y feature '${feature}' set to: ${value || (enabled ? "ON" : "OFF")}`);
      sendResponse({ success: true, feature, enabled, value });
    }

    if (message.type === "APPLY_ALL_A11Y_SETTINGS") {
      const settings = message.settings || {};
      Object.entries(settings).forEach(([feature, cfg]: [string, any]) => {
        if (cfg) {
          applyA11yFeature(feature, cfg.enabled, cfg.value, cfg.level);
        }
      });
      sendResponse({ success: true, count: Object.keys(settings).length });
    }

    if (message.type === "CLEAR_ALL_A11Y") {
      clearAllA11yFeatures();
      sendResponse({ success: true });
      return;
    }

    if (message.type === "SCAN_PAGE_FIELDS" || message.type === "QUERY_PAGE_FIELDS") {
      const detected = getInteractiveFormElements();
      const fields = detected.map((d) => ({
        id: d.id,
        name: d.name,
        label: d.label,
        placeholder: d.placeholder,
        required: d.required,
        type: d.type,
      }));

      const meta = {
        url: window.location.href,
        domain: window.location.hostname,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute("content")?.split(",").map((s) => s.trim()) || [],
      };

      agentLog.perception(`🔍 Scanning DOM: Discovered ${fields.length} synchronized form fields on ${meta.domain}`, {
        count: fields.length,
        title: meta.title,
        fieldKeys: fields.map((f) => f.name || f.id || f.label).slice(0, 8),
      });
      sendResponse({ success: true, fields, count: fields.length, meta });
    }

    if (message.type === "EXTRACT_FORM_AUDIT_DATA") {
      const snapshot = extractFormAuditSnapshot();
      agentLog.action(`🔍 EXTRACT_FORM_AUDIT_DATA: Scraped ${snapshot.fields.length} active inputs and ${snapshot.pageUploadContext.attachedFilesMetadata.length} attached files for audit.`);
      sendResponse({ success: true, data: snapshot });
      return;
    }

    if (message.type === "HIGHLIGHT_AUDIT_FIELD") {
      let target: HTMLElement | null = null;
      let badgeTarget: HTMLElement | null = null;
      if (message.fieldId) target = document.getElementById(message.fieldId);
      if (!target && message.fieldName) target = document.querySelector(`[name="${message.fieldName}"]`);
      if (!target && typeof message.fieldIndex === "number") {
        const detected = getInteractiveFormElements();
        if (detected[message.fieldIndex]) {
          target = detected[message.fieldIndex].targetEl;
          badgeTarget = detected[message.fieldIndex].badgeTargetEl;
        }
      }
      const elToHighlight = badgeTarget || target;
      if (elToHighlight) {
        target?.focus();
        elToHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
        showFieldSpotlight(elToHighlight);
        agentLog.action(`🎯 Audit Spotlight highlighted field '${message.fieldLabel || message.fieldName || message.fieldId}'`);
        sendResponse({ success: true });
        return;
      }
      sendResponse({ success: false, reason: "Field not found" });
      return;
    }

    if (message.type === "APPLY_FIELD_VALUE") {
      let target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;
      if (message.fieldId) target = document.getElementById(message.fieldId) as any;
      if (!target && message.fieldName) target = document.querySelector(`[name="${message.fieldName}"]`) as any;
      if (target && typeof message.value === "string") {
        target.value = message.value;
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
        target.focus();
        showFieldSpotlight(target);
        agentLog.action(`⚡ Applied Vault value to field '${message.fieldName || message.fieldId}': "${message.value}"`);
        sendResponse({ success: true });
        return;
      }
      sendResponse({ success: false, reason: "Field or value invalid" });
      return;
    }

    if (message.type === "START_SCAN_ANIMATION") {
      startScanAnimation();
      sendResponse({ success: true });
      return;
    }

    if (message.type === "STOP_SCAN_ANIMATION") {
      stopScanAnimation();
      sendResponse({ success: true });
      return;
    }

    if (message.type === "SHOW_FIELD_NUMBERS") {
      showFieldNumberBadges();
      sendResponse({ success: true, count: activeNumberedBadges.length });
      return;
    }

    if (message.type === "HIDE_FIELD_NUMBERS") {
      hideFieldNumberBadges();
      sendResponse({ success: true });
      return;
    }

    if (message.type === "NAVIGATE_TO_FIELD") {
      let target: HTMLElement | null = null;
      let badgeTarget: HTMLElement | null = null;
      const idx = typeof message.fieldIndex === "number" ? message.fieldIndex : -1;
      if (idx >= 0 && activeNumberedBadges[idx]) {
        target = activeNumberedBadges[idx].targetEl;
        badgeTarget = activeNumberedBadges[idx].badgeTargetEl;
        activeNumberedBadges.forEach((b, i) => {
          if (i === idx) b.badgeEl.classList.add("active-badge");
          else b.badgeEl.classList.remove("active-badge");
        });
      }
      if (!target && message.fieldId) {
        target = document.getElementById(message.fieldId);
      }
      if (!target && message.fieldName) {
        target = document.querySelector(`[name="${message.fieldName}"]`);
      }
      if (!target && idx >= 0) {
        const detected = getInteractiveFormElements();
        if (detected[idx]) {
          target = detected[idx].targetEl;
          badgeTarget = detected[idx].badgeTargetEl;
        }
      }
      const elToHighlight = badgeTarget || target;
      if (elToHighlight) {
        target?.focus();
        elToHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
        showFieldSpotlight(elToHighlight);
        sendResponse({ success: true, fieldIndex: idx });
        return;
      }
      sendResponse({ success: false, reason: "Field not found" });
      return;
    }

    if (message.type === "START_SNIP_SELECTION") {
      agentLog.action("✂️ Starting Visual Snip selection mode on screen for 'Explain This'");
      startSnipMode();
      sendResponse({ success: true, mode: "active" });
    }

    if (message.type === "SHOW_FIELD_SPOTLIGHT") {
      const activeEl = document.activeElement as HTMLElement;
      let target: HTMLElement | null = activeEl;
      if (!target || target.tagName === "BODY") {
        target = document.querySelector("input:not([type=hidden]), textarea, select") as HTMLElement;
      }
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        showFieldSpotlight(target);
        agentLog.action(`💡 Spotlight Beacon navigated to field '${target.id || target.getAttribute("name") || "input"}'`);
        sendResponse({ success: true });
        return;
      }
      sendResponse({ success: false, reason: "No target field found" });
    }

    if (message.type === "BATCH_AUTOFILL") {
      const payload = message.payload || {};
      const profileItems: Array<{ name: string; value: string; aliases?: string[] }> = Array.isArray(message.items)
        ? message.items
        : Array.isArray(payload.items)
        ? payload.items
        : [];

      const inputs = Array.from(document.querySelectorAll("input, textarea, select")) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
      
      // Store backup for 100% safe undo
      (window as any).__SAVVY_UNDO_BACKUP__ = inputs.map((el) => ({
        el,
        prevVal: el.value,
      }));

      let injectedCount = 0;
      inputs.forEach((input) => {
        if (input.type === "hidden" || input.type === "submit" || input.type === "button") return;
        const rawLabel = findElementLabel(input) || input.name || input.id || (input as any).placeholder || "";
        const nameAttr = rawLabel.toLowerCase().trim();
        let valToInject = "";

        // 1. Dynamic Matching via Profile Items & Aliases
        if (profileItems.length > 0) {
          const isMotherField = nameAttr.includes("mother") || nameAttr.includes("ibu");
          for (const item of profileItems) {
            const itemLower = item.name.toLowerCase().trim();
            if (isMotherField && (itemLower.includes("nama lengkap") || itemLower === "nama" || itemLower === "full name")) {
              continue;
            }
            if (!isMotherField && itemLower.includes("ibu")) {
              continue;
            }

            let matches = (nameAttr.length > 1 && itemLower.length > 1 && (nameAttr === itemLower || nameAttr.includes(itemLower) || itemLower.includes(nameAttr)));

            if (!matches && Array.isArray(item.aliases)) {
              matches = item.aliases.some((alias) => {
                const a = alias.toLowerCase().trim();
                return a.length > 1 && (nameAttr === a || nameAttr.includes(a) || a.includes(nameAttr));
              });
            }

            if (matches && item.value) {
              valToInject = item.value;
              break;
            }
          }
        }

        // 2. Legacy Fallback dictionary
        if (!valToInject) {
          if (nameAttr.includes("nik") || nameAttr.includes("ktp") || nameAttr.includes("national id")) {
            valToInject = payload.nik || payload["NIK"] || "";
          } else if (nameAttr.includes("mother") || nameAttr.includes("ibu")) {
            valToInject = payload["Nama Ibu Kandung"] || payload.nama_ibu || "";
          } else if (nameAttr.includes("nama") || nameAttr.includes("name") || nameAttr.includes("fullname")) {
            valToInject = payload.nama || payload["Nama Lengkap"] || "";
          } else if (nameAttr.includes("place") || nameAttr.includes("tempat") || nameAttr.includes("pob")) {
            valToInject = payload.tempat_lahir || payload["Tempat Lahir"] || "";
          } else if (
            input.type === "date" ||
            nameAttr.includes("tanggal_lahir") ||
            nameAttr.includes("tgl_lahir") ||
            nameAttr.includes("dob") ||
            (nameAttr.includes("birth") && (nameAttr.includes("date") || nameAttr.includes("day"))) ||
            (nameAttr.includes("lahir") && nameAttr.includes("tgl"))
          ) {
            valToInject = payload.tanggal_lahir || payload["Tanggal Lahir"] || "";
          } else if (nameAttr.includes("alamat") || nameAttr.includes("address") || nameAttr.includes("domisili")) {
            valToInject = payload.alamat || payload["Alamat KTP"] || "";
          } else if (input.type === "email" || nameAttr.includes("email") || nameAttr.includes("mail") || nameAttr.includes("surel")) {
            valToInject = payload.email || payload["Email"] || "";
          } else if (input.type === "tel" || nameAttr.includes("hp") || nameAttr.includes("phone") || nameAttr.includes("telp") || nameAttr.includes("whatsapp")) {
            valToInject = payload.no_hp || payload["No. Handphone"] || "";
          }
        }

        if (valToInject) {
          input.value = valToInject;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          injectedCount++;
        }
      });
      agentLog.action(`⚡ Batch Autofill executed: ${injectedCount} fields populated safely with reversibility snapshot.`, {
        injectedCount,
        keys: Object.keys(payload),
      });
      sendResponse({ success: true, count: injectedCount });
      return true;
    }

    if (message.type === "UNDO_AUTOFILL") {
      const backup = (window as any).__SAVVY_UNDO_BACKUP__;
      if (backup && Array.isArray(backup)) {
        backup.forEach(({ el, prevVal }) => {
          if (el) {
            el.value = prevVal;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        const restoredCount = backup.length;
        delete (window as any).__SAVVY_UNDO_BACKUP__;
        agentLog.action(`↩️ Undo Autofill executed: Restored previous values across ${restoredCount} fields.`);
        sendResponse({ success: true, undone: true });
        return true;
      }
      sendResponse({ success: false, reason: "No backup state found" });
    }

    return true;
  });

  // ============================================================================
  // Lightshot-Style Screen Snip & Visual Crop Engine (Pure Vanilla DOM)
  // ============================================================================
  function startSnipMode() {
    // If snip is already active, remove previous one
    const existing = shadowRoot.querySelector(".savvy-lightshot-container");
    if (existing) existing.remove();

    agentLog.action("✂️ Activating Lightshot-style visual crop mode on screen.");

    // 1. Root Container (Full screen)
    const overlay = document.createElement("div");
    overlay.className = "savvy-lightshot-container";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      cursor: crosshair;
      user-select: none;
      -webkit-user-select: none;
      background: rgba(15, 23, 42, 0.45);
      transition: background 0.15s ease-out;
      pointer-events: auto;
    `;

    // 2. Top Header Instruction Pill
    const headerPill = document.createElement("div");
    headerPill.style.cssText = `
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    const t = getContentT();
    headerPill.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #60A5FA;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
        <span>${t.snipTitle}</span>
      </div>
      <div style="width: 1px; height: 14px; background: rgba(255, 255, 255, 0.2);"></div>
      <span style="color: #E2E8F0; font-size: 12px;">${t.snipInstruction}</span>
    `;
    overlay.appendChild(headerPill);

    // 3. Selection Box (Lightshot cutout style)
    const cropBox = document.createElement("div");
    cropBox.style.cssText = `
      position: fixed;
      display: none;
      border: 2px solid #398CF5;
      box-shadow: 0 0 0 99999px rgba(15, 23, 42, 0.65);
      background: transparent;
      pointer-events: auto;
      z-index: 2147483647;
      box-sizing: border-box;
    `;

    // Dimension Tag (attached to cropBox)
    const dimLabel = document.createElement("div");
    dimLabel.style.cssText = `
      position: absolute;
      top: -26px;
      left: -2px;
      background: #0F172A;
      color: #93C5FD;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      pointer-events: none;
      white-space: nowrap;
      font-family: monospace, system-ui, sans-serif;
      border: 1px solid rgba(59, 130, 246, 0.4);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;
    cropBox.appendChild(dimLabel);

    // 8 Resize Handles
    const handlePositions = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    handlePositions.forEach((pos) => {
      const handle = document.createElement("div");
      handle.dataset.handle = pos;
      let cursor = "default";
      if (pos === "nw" || pos === "se") cursor = "nwse-resize";
      else if (pos === "ne" || pos === "sw") cursor = "nesw-resize";
      else if (pos === "n" || pos === "s") cursor = "ns-resize";
      else if (pos === "e" || pos === "w") cursor = "ew-resize";

      handle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #FFFFFF;
        border: 2px solid #398CF5;
        border-radius: 1px;
        z-index: 10;
        cursor: ${cursor};
        box-sizing: border-box;
      `;
      if (pos.includes("n")) handle.style.top = "-5px";
      if (pos.includes("s")) handle.style.bottom = "-5px";
      if (pos.includes("w")) handle.style.left = "-5px";
      if (pos.includes("e")) handle.style.right = "-5px";
      if (pos === "n" || pos === "s") {
        handle.style.left = "50%";
        handle.style.transform = "translateX(-50%)";
      }
      if (pos === "w" || pos === "e") {
        handle.style.top = "50%";
        handle.style.transform = "translateY(-50%)";
      }
      cropBox.appendChild(handle);
    });

    // Floating Action Toolbar (Bottom right of selection box, Lightshot style)
    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
      position: absolute;
      display: none;
      align-items: center;
      gap: 6px;
      padding: 5px 6px;
      background: #0F172A;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
      z-index: 25;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Button 1: Explain with AI (Primary)
    const btnExplain = document.createElement("button");
    btnExplain.style.cssText = `
      background: linear-gradient(135deg, #398CF5 0%, #7045ED 100%);
      color: #FFFFFF;
      font-weight: 600;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(57, 140, 245, 0.35);
    `;
    btnExplain.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <span>${t.snipExplainBtn}</span>
    `;

    // Button 2: Copy Text
    const btnCopy = document.createElement("button");
    btnCopy.style.cssText = `
      background: #1E293B;
      color: #CBD5E1;
      font-weight: 500;
      font-size: 12px;
      padding: 6px 11px;
      border-radius: 6px;
      border: 1px solid #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      transition: all 0.15s ease;
    `;
    btnCopy.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>${t.snipCopyBtn}</span>
    `;

    // Button 3: Cancel (Close)
    const btnCancel = document.createElement("button");
    btnCancel.style.cssText = `
      background: #1E293B;
      color: #EF4444;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.15s ease;
    `;
    btnCancel.innerHTML = `✕`;
    btnCancel.title = t.snipCancelTitle;

    toolbar.appendChild(btnExplain);
    toolbar.appendChild(btnCopy);
    toolbar.appendChild(btnCancel);
    cropBox.appendChild(toolbar);

    overlay.appendChild(cropBox);
    shadowRoot.appendChild(overlay);

    // State Coordinates
    let isDrawing = false;
    let isMoving = false;
    let isResizing = false;
    let activeHandle = "";
    let startX = 0;
    let startY = 0;
    let moveOffsetX = 0;
    let moveOffsetY = 0;

    const rect = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

    function updateBoxDOM() {
      const l = Math.max(0, rect.left);
      const t = Math.max(0, rect.top);
      const w = Math.max(0, rect.width);
      const h = Math.max(0, rect.height);

      cropBox.style.left = `${l}px`;
      cropBox.style.top = `${t}px`;
      cropBox.style.width = `${w}px`;
      cropBox.style.height = `${h}px`;

      dimLabel.textContent = `${Math.round(w)} × ${Math.round(h)} px`;

      // Smart toolbar positioning
      if (t + h + 50 > window.innerHeight) {
        toolbar.style.bottom = "8px";
      } else {
        toolbar.style.bottom = "-48px";
      }

      if (l + w < 280) {
        toolbar.style.right = "auto";
        toolbar.style.left = "0px";
      } else {
        toolbar.style.left = "auto";
        toolbar.style.right = "0px";
      }
    }

    function cleanup() {
      overlay.remove();
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        cleanup();
      } else if (e.key === "Enter" && cropBox.style.display !== "none" && rect.width > 20 && rect.height > 20) {
        handleConfirmExplain();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    // Text Extraction Engine
    function extractTextInRect(): string {
      const texts: string[] = [];
      const boxLeft = rect.left;
      const boxTop = rect.top;
      const boxRight = rect.left + rect.width;
      const boxBottom = rect.top + rect.height;

      // 1. Text Nodes Walker
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent || parent.closest("#savvy-root")) return NodeFilter.FILTER_REJECT;
            const style = window.getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      let textNode: Node | null;
      while ((textNode = walker.nextNode())) {
        try {
          const range = document.createRange();
          range.selectNode(textNode);
          const rects = range.getClientRects();
          for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            const isOverlap = !(
              r.right < boxLeft ||
              r.left > boxRight ||
              r.bottom < boxTop ||
              r.top > boxBottom
            );
            if (isOverlap) {
              const val = textNode.nodeValue?.trim();
              if (val && !texts.includes(val)) {
                texts.push(val);
              }
              break;
            }
          }
        } catch (_) {}
      }

      // 2. Input/Textarea/Select values
      const formElements = document.querySelectorAll("input, textarea, select");
      formElements.forEach((el) => {
        const r = el.getBoundingClientRect();
        const isOverlap = !(
          r.right < boxLeft ||
          r.left > boxRight ||
          r.bottom < boxTop ||
          r.top > boxBottom
        );
        if (isOverlap) {
          const inputEl = el as HTMLInputElement;
          const val = inputEl.value || inputEl.placeholder || "";
          const label = inputEl.getAttribute("aria-label") || inputEl.name || inputEl.id || "";
          if (val || label) {
            texts.push(`[Field ${label}: ${val}]`);
          }
        }
      });

      let fullText = texts.join(" ").trim();
      // UU PDP Redaction for NIK
      fullText = fullText.replace(/\b[1-9][0-9]{15}\b/g, "[REDACTED_NIK]");
      return fullText;
    }

    function handleConfirmExplain() {
      const extractedText = extractTextInRect();
      agentLog.action("⚡ Visual crop snip confirmed by user.", {
        rect,
        extractedLength: extractedText.length,
        preview: extractedText.slice(0, 100),
      });

      // Collect rich SEO & document metadata
      const meta = {
        description:
          document.querySelector('meta[name="description"]')?.getAttribute("content") ||
          document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
          "",
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "",
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "",
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
        ogType: document.querySelector('meta[property="og:type"]')?.getAttribute("content") || "",
        lang: document.documentElement.lang || navigator.language || "id-ID",
        author: document.querySelector('meta[name="author"]')?.getAttribute("content") || "",
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || window.location.href,
      };

      // Visual feedback: Green flash
      cropBox.style.borderColor = "#10B981";
      cropBox.style.boxShadow = "0 0 0 99999px rgba(15, 23, 42, 0.65), 0 0 25px rgba(16, 185, 129, 0.6)";
      dimLabel.textContent = getContentT().snipCapturing;
      dimLabel.style.color = "#34D399";
      btnExplain.disabled = true;
      btnExplain.style.opacity = "0.7";

      // Sembunyikan overlay sejenak agar tangkapan layar jernih tanpa bayangan overlay
      overlay.style.visibility = "hidden";

      // Berikan jeda 60ms agar browser selesai render layar bersih
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, (captureRes) => {
          cleanup();

          chrome.runtime.sendMessage({
            type: "SNIP_EXPLAIN_RESULT",
            fullScreenshot: captureRes?.success ? captureRes.dataUrl : null,
            text: extractedText,
            rect: {
              left: Math.round(rect.left),
              top: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              viewportWidth: window.innerWidth,
              viewportHeight: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio || 1,
            },
            portalUrl: window.location.href,
            portalDomain: window.location.hostname,
            pageTitle: document.title,
            meta,
          });
        });
      }, 60);
    }

    // Button event listeners
    btnExplain.addEventListener("click", (e) => {
      e.stopPropagation();
      handleConfirmExplain();
    });

    btnCopy.addEventListener("click", (e) => {
      e.stopPropagation();
      const text = extractTextInRect();
      if (text) {
        navigator.clipboard.writeText(text);
        const tNow = getContentT();
        btnCopy.innerHTML = `✓ ${tNow.snipCopied}`;
        setTimeout(() => {
          btnCopy.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>${tNow.snipCopyBtn}</span>
          `;
        }, 1500);
      }
    });

    btnCancel.addEventListener("click", (e) => {
      e.stopPropagation();
      cleanup();
    });

    // Mouse Down Handling
    overlay.addEventListener("mousedown", (e) => {
      const target = e.target as HTMLElement;

      // Clicked on toolbar buttons
      if (toolbar.contains(target)) return;

      // Clicked on a resize handle
      if (target.dataset?.handle) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        activeHandle = target.dataset.handle;
        startX = e.clientX;
        startY = e.clientY;
        toolbar.style.display = "none";
        return;
      }

      // Clicked inside the crop box (Move Box)
      if (cropBox.contains(target) && target !== overlay) {
        e.preventDefault();
        e.stopPropagation();
        isMoving = true;
        moveOffsetX = e.clientX - rect.left;
        moveOffsetY = e.clientY - rect.top;
        cropBox.style.cursor = "move";
        toolbar.style.display = "none";
        return;
      }

      // Clicked on the backdrop (Start new drag selection)
      e.preventDefault();
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      rect.left = startX;
      rect.top = startY;
      rect.width = 0;
      rect.height = 0;

      overlay.style.background = "transparent";
      cropBox.style.display = "block";
      cropBox.style.borderColor = "#398CF5";
      cropBox.style.boxShadow = "0 0 0 99999px rgba(15, 23, 42, 0.65)";
      cropBox.style.cursor = "crosshair";
      toolbar.style.display = "none";
      updateBoxDOM();
    });

    function onMouseMove(e: MouseEvent) {
      if (isDrawing) {
        const curX = e.clientX;
        const curY = e.clientY;
        rect.left = Math.min(startX, curX);
        rect.top = Math.min(startY, curY);
        rect.width = Math.abs(curX - startX);
        rect.height = Math.abs(curY - startY);
        updateBoxDOM();
      } else if (isMoving) {
        rect.left = Math.max(0, Math.min(window.innerWidth - rect.width, e.clientX - moveOffsetX));
        rect.top = Math.max(0, Math.min(window.innerHeight - rect.height, e.clientY - moveOffsetY));
        updateBoxDOM();
      } else if (isResizing) {
        const curX = e.clientX;
        const curY = e.clientY;

        if (activeHandle.includes("e")) {
          rect.width = Math.max(20, curX - rect.left);
        }
        if (activeHandle.includes("s")) {
          rect.height = Math.max(20, curY - rect.top);
        }
        if (activeHandle.includes("w")) {
          const right = rect.left + rect.width;
          rect.left = Math.min(right - 20, curX);
          rect.width = right - rect.left;
        }
        if (activeHandle.includes("n")) {
          const bottom = rect.top + rect.height;
          rect.top = Math.min(bottom - 20, curY);
          rect.height = bottom - rect.top;
        }
        updateBoxDOM();
      }
    }
    window.addEventListener("mousemove", onMouseMove);

    function onMouseUp(e: MouseEvent) {
      if (isDrawing) {
        isDrawing = false;
        // If it's a very tiny click (less than 15px), try snapping to element clicked
        if (rect.width < 15 && rect.height < 15) {
          overlay.style.display = "none";
          const underlyingEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
          overlay.style.display = "block";

          if (underlyingEl && !underlyingEl.closest("#savvy-root")) {
            const r = underlyingEl.getBoundingClientRect();
            rect.left = Math.max(0, r.left - 4);
            rect.top = Math.max(0, r.top - 4);
            rect.width = r.width + 8;
            rect.height = r.height + 8;
          } else {
            rect.left = Math.max(10, e.clientX - 160);
            rect.top = Math.max(10, e.clientY - 60);
            rect.width = 320;
            rect.height = 120;
          }
          updateBoxDOM();
        }

        cropBox.style.cursor = "move";
        toolbar.style.display = "flex";
      }

      if (isMoving) {
        isMoving = false;
        cropBox.style.cursor = "move";
        toolbar.style.display = "flex";
      }

      if (isResizing) {
        isResizing = false;
        toolbar.style.display = "flex";
      }
    }
    window.addEventListener("mouseup", onMouseUp);
  }

  // 6b. Reset Semua Fitur Accessibility & Spotlight (WCAG 2.2 Revert)
  function clearAllA11yFeatures() {
    const html = document.documentElement;
    const body = document.body;

    stopScanAnimation();
    hideFieldNumberBadges();
    hideFieldSpotlight();
    if (readingGuideEl) {
      readingGuideEl.style.display = "none";
    }

    html.style.filter = "";
    html.style.fontSize = "";
    body.style.letterSpacing = "";
    body.style.wordSpacing = "";
    body.style.lineHeight = "";
    body.style.textAlign = "";
    body.style.fontFamily = "";

    document.getElementById("savvy-pause-anim")?.remove();
    document.getElementById("savvy-hide-img")?.remove();
    document.getElementById("savvy-highlight-links")?.remove();
    document.getElementById("savvy-big-cursor")?.remove();

    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {}

    try {
      const snip = shadowRoot.querySelector(".savvy-lightshot-container");
      if (snip) snip.remove();
    } catch (_) {}

    agentLog.action("🧹 All accessibility features and spotlights cleared.");
  }

  // 6. Controller 14 Fitur Accessibility HUB (WCAG 2.2 AAA & Pure JS)
  function applyA11yFeature(feature: string, enabled: boolean, value?: string, _level?: number) {
    const html = document.documentElement;
    const body = document.body;

    switch (feature) {
      case "spotlight":
      case "reading_spotlight":
        readingGuideEl.style.display = enabled && value !== "Off" ? "block" : "none";
        break;

      case "contrast":
      case "high_contrast":
        if (!enabled || value === "Normal") {
          html.style.filter = "";
        } else if (value === "High") {
          html.style.filter = "contrast(180%) brightness(105%)";
        } else if (value === "Invert") {
          html.style.filter = "invert(100%) hue-rotate(180deg)";
        } else if (value === "Monochrome") {
          html.style.filter = "grayscale(100%) contrast(120%)";
        } else {
          html.style.filter = "contrast(180%) brightness(105%)";
        }
        break;

      case "textSize":
      case "bigger_text":
        if (!enabled || value === "Normal") {
          html.style.fontSize = "";
        } else if (value === "+25%") {
          html.style.fontSize = "125%";
        } else if (value === "+50%") {
          html.style.fontSize = "150%";
        } else if (value === "+75%") {
          html.style.fontSize = "175%";
        } else if (value === "+100%") {
          html.style.fontSize = "200%";
        } else {
          html.style.fontSize = "125%";
        }
        break;

      case "textSpacing":
      case "text_spacing":
        if (!enabled || value === "Normal") {
          body.style.letterSpacing = "";
          body.style.wordSpacing = "";
        } else if (value?.includes("+10%")) {
          body.style.letterSpacing = "0.08em";
          body.style.wordSpacing = "0.12em";
        } else if (value?.includes("+25%")) {
          body.style.letterSpacing = "0.16em";
          body.style.wordSpacing = "0.24em";
        } else if (value?.includes("+50%")) {
          body.style.letterSpacing = "0.24em";
          body.style.wordSpacing = "0.36em";
        } else {
          body.style.letterSpacing = "0.14em";
          body.style.wordSpacing = "0.2em";
        }
        break;

      case "pauseAnim":
      case "pause_animations":
        if (enabled && value !== "Normal") {
          let style = document.getElementById("savvy-pause-anim");
          if (!style) {
            style = document.createElement("style");
            style.id = "savvy-pause-anim";
            document.head.appendChild(style);
          }
          style.textContent = "* { animation-play-state: paused !important; transition: none !important; }";
        } else {
          document.getElementById("savvy-pause-anim")?.remove();
        }
        break;

      case "hideImages":
      case "hide_images":
        if (!enabled || value === "Normal") {
          document.getElementById("savvy-hide-img")?.remove();
        } else {
          let style = document.getElementById("savvy-hide-img");
          if (!style) {
            style = document.createElement("style");
            style.id = "savvy-hide-img";
            document.head.appendChild(style);
          }
          if (value === "Grayscale") {
            style.textContent = "img, svg:not(.savvy-icon), video { filter: grayscale(100%) !important; opacity: 0.65 !important; }";
          } else {
            style.textContent = "img, svg:not(.savvy-icon), video { visibility: hidden !important; }";
          }
        }
        break;

      case "links":
      case "highlight_links":
        if (!enabled || value === "Off") {
          document.getElementById("savvy-highlight-links")?.remove();
        } else {
          let style = document.getElementById("savvy-highlight-links");
          if (!style) {
            style = document.createElement("style");
            style.id = "savvy-highlight-links";
            document.head.appendChild(style);
          }
          if (value === "Underline") {
            style.textContent = "a { text-decoration: underline 3px solid #2563EB !important; text-underline-offset: 4px !important; }";
          } else if (value === "High Contrast") {
            style.textContent = "a { outline: 3px solid #2563EB !important; background-color: #EFF6FF !important; color: #1D4ED8 !important; text-decoration: underline !important; }";
          } else {
            // Default Highlight
            style.textContent = "a { background-color: #FEF08A !important; color: #1E3A8A !important; text-decoration: underline !important; }";
          }
        }
        break;

      case "dyslexiaFont":
      case "dyslexia_font":
        if (enabled && value !== "Off") {
          body.style.fontFamily = "Comic Sans MS, OpenDyslexic, sans-serif";
        } else {
          body.style.fontFamily = "";
        }
        break;

      case "tts":
      case "text_to_speech":
        if (enabled && value !== "Off") {
          window.speechSynthesis?.cancel();
          const pageSummary = document.title + ". " + (document.body.innerText || "").slice(0, 400);
          const utter = new SpeechSynthesisUtterance(pageSummary);
          utter.lang = document.documentElement.lang || "id-ID";
          window.speechSynthesis?.speak(utter);
        } else {
          window.speechSynthesis?.cancel();
        }
        break;

      case "bigCursor":
      case "big_cursor":
        if (!enabled || value === "Normal") {
          document.getElementById("savvy-big-cursor")?.remove();
        } else {
          let style = document.getElementById("savvy-big-cursor");
          if (!style) {
            style = document.createElement("style");
            style.id = "savvy-big-cursor";
            document.head.appendChild(style);
          }
          if (value === "Large (White)") {
            const whiteCursor = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 24 24'%3E%3Cpolygon points='0,0 0,20 5.5,15 9.5,23 12.5,21.5 8.5,13.5 15,13.5' fill='white' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E";
            style.textContent = `* { cursor: url("${whiteCursor}") 0 0, auto !important; }`;
          } else if (value === "Highlighter") {
            const highlightCursor = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='20' fill='rgba(254,240,138,0.65)' stroke='%23F59E0B' stroke-width='2.5'/%3E%3Ccircle cx='24' cy='24' r='3' fill='%23D97706'/%3E%3C/svg%3E";
            style.textContent = `* { cursor: url("${highlightCursor}") 24 24, auto !important; }`;
          } else {
            // Large (Black)
            const blackCursor = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 24 24'%3E%3Cpolygon points='0,0 0,20 5.5,15 9.5,23 12.5,21.5 8.5,13.5 15,13.5' fill='black' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E";
            style.textContent = `* { cursor: url("${blackCursor}") 0 0, auto !important; }`;
          }
        }
        break;

      case "lineHeight":
      case "line_height":
        if (!enabled || value === "Normal") {
          body.style.lineHeight = "";
        } else if (value === "1.5x") {
          body.style.lineHeight = "1.5";
        } else if (value === "1.8x") {
          body.style.lineHeight = "1.8";
        } else if (value === "2.2x") {
          body.style.lineHeight = "2.2";
        } else {
          body.style.lineHeight = "1.8";
        }
        break;

      case "textAlign":
      case "text_align":
        if (!enabled || value === "Normal") {
          body.style.textAlign = "";
        } else if (value === "Left") {
          body.style.textAlign = "left";
        } else if (value === "Center") {
          body.style.textAlign = "center";
        } else if (value === "Justify") {
          body.style.textAlign = "justify";
        } else {
          body.style.textAlign = "left";
        }
        break;

      case "colorSat":
      case "color_saturation":
        if (!enabled || value === "Normal") {
          html.style.filter = "";
        } else if (value?.includes("High")) {
          html.style.filter = "saturate(200%)";
        } else if (value?.includes("Low")) {
          html.style.filter = "saturate(40%)";
        } else if (value?.includes("Monochrome")) {
          html.style.filter = "grayscale(100%)";
        } else {
          html.style.filter = "saturate(200%)";
        }
        break;

      case "liveTooltips":
      case "live_tooltips":
        break;

      default:
        console.log("[Savvy.AI Content] Toggled feature:", feature, enabled, value);
    }
  }

  // 7. Auto-load persisted Accessibility settings ONLY IF sidepanel is actively open
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_sidepanel_open", "savvy_a11y_settings"], (res) => {
        if (res && res.savvy_sidepanel_open && res.savvy_a11y_settings) {
          Object.entries(res.savvy_a11y_settings).forEach(([feature, cfg]: [string, any]) => {
            if (cfg && cfg.enabled) {
              applyA11yFeature(feature, cfg.enabled, cfg.value, cfg.level);
            }
          });
        }
      });
    }
  } catch (_) {}
})();
