// ============================================================================
// SAVVY.AI — Content Script (Chrome Manifest V3)
// Injeksi Closed Shadow DOM, Field Detection, dan Accessibility Controller
// ============================================================================

(() => {
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

  agentLog.perception("Content Script activated. Closed Shadow DOM host initialized on page.");

  // 1. Injeksi Closed Shadow DOM untuk Beacon Spotlight & A11y Overlays
  let hostContainer = document.getElementById("savvy-root");
  if (!hostContainer) {
    hostContainer = document.createElement("div");
    hostContainer.id = "savvy-root";
    hostContainer.style.position = "absolute";
    hostContainer.style.top = "0";
    hostContainer.style.left = "0";
    hostContainer.style.width = "100%";
    hostContainer.style.height = "100%";
    hostContainer.style.pointerEvents = "none";
    hostContainer.style.zIndex = "2147483647"; // Maksimum z-index
    document.body.appendChild(hostContainer);
  }

  const shadowRoot = hostContainer.attachShadow({ mode: "closed" });

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
  `;
  shadowRoot.appendChild(styleEl);

  const spotlightEl = document.createElement("div");
  spotlightEl.className = "savvy-spotlight";
  spotlightEl.style.display = "none";
  spotlightEl.innerHTML = `<div class="savvy-spotlight-beacon">S</div>`;
  shadowRoot.appendChild(spotlightEl);

  const readingGuideEl = document.createElement("div");
  readingGuideEl.className = "savvy-reading-guide";
  shadowRoot.appendChild(readingGuideEl);

  // 2. Tracking Mouse untuk Reading Guide (Spotlight Tool #1)
  window.addEventListener("mousemove", (e) => {
    if (readingGuideEl.style.display === "block") {
      readingGuideEl.style.top = `${e.clientY - 24}px`;
    }
  });

  // 3. Helper untuk mencari Label dari Form Element
  function findElementLabel(el: HTMLElement): string {
    if (el.getAttribute("aria-label")) {
      return el.getAttribute("aria-label")!;
    }
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label && label.textContent) return label.textContent.trim();
    }
    const parentLabel = el.closest("label");
    if (parentLabel && parentLabel.textContent) {
      return parentLabel.textContent.trim();
    }
    const placeholder = el.getAttribute("placeholder");
    if (placeholder) return placeholder.trim();
    return el.getAttribute("name") || el.id || "Kolom Form";
  }

  // 4. Focus Listener untuk mendeteksi field aktif
  document.addEventListener("focusin", (e) => {
    const target = e.target as HTMLElement;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA")
    ) {
      const rect = target.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      // Posisikan Spotlight
      spotlightEl.style.display = "block";
      spotlightEl.style.top = `${rect.top + scrollTop - 4}px`;
      spotlightEl.style.left = `${rect.left + scrollLeft - 4}px`;
      spotlightEl.style.width = `${rect.width + 8}px`;
      spotlightEl.style.height = `${rect.height + 8}px`;

      const label = findElementLabel(target);
      agentLog.perception(`🎯 Field focused: '${target.id || target.getAttribute("name") || "input"}' (${label})`, {
        fieldId: target.id || "",
        tagName: target.tagName,
        inputType: (target as HTMLInputElement).type || "text",
        hasValue: !!(target as HTMLInputElement).value,
      });

      // Kirim metadata field ke background & sidepanel
      chrome.runtime.sendMessage({
        type: "FIELD_FOCUSED",
        fieldId: target.id || "",
        fieldName: target.getAttribute("name") || "",
        label,
        tagName: target.tagName,
        inputType: (target as HTMLInputElement).type || "text",
        value: (target as HTMLInputElement).value || "",
      });
    }
  });

  document.addEventListener("focusout", () => {
    // Spotlight tetap aktif sejenak untuk memandu mata
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
      return m.target !== hostContainer && !hostContainer.contains(m.target);
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

  // 5. Message Listener dari Side Panel
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "INJECT_VALUE") {
      const { fieldId, fieldName, value } = message;
      let target: HTMLElement | null = null;
      if (fieldId) target = document.getElementById(fieldId);
      if (!target && fieldName) target = document.querySelector(`[name="${fieldName}"]`);

      if (target && ("value" in target)) {
        (target as HTMLInputElement).value = value;
        // Trigger framework change events (React, Vue, dll)
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
        target.dispatchEvent(new Event("blur", { bubbles: true }));
        agentLog.action(`⚡ Injected value into field '${fieldId || fieldName}'`, { targetTag: target.tagName });
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

    if (message.type === "SCAN_PAGE_FIELDS" || message.type === "QUERY_PAGE_FIELDS") {
      const inputs = Array.from(
        document.querySelectorAll("input, select, textarea")
      ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

      const fields = inputs
        .filter((el) => el.type !== "hidden" && el.type !== "submit")
        .map((el) => ({
          id: el.id || el.name,
          name: el.name,
          label: findElementLabel(el),
          placeholder: (el as HTMLInputElement).placeholder || "",
          required: el.required,
          type: el.type || el.tagName.toLowerCase(),
        }));

      const meta = {
        url: window.location.href,
        domain: window.location.hostname,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute("content")?.split(",").map((s) => s.trim()) || [],
      };

      agentLog.perception(`🔍 Scanning DOM: Discovered ${fields.length} active interactive fields on ${meta.domain}`, {
        count: fields.length,
        title: meta.title,
        fieldKeys: fields.map((f) => f.name || f.id || f.label).slice(0, 8),
      });
      sendResponse({ success: true, fields, count: fields.length, meta });
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
        const rect = target.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        spotlightEl.style.display = "block";
        spotlightEl.style.top = `${rect.top + scrollTop - 4}px`;
        spotlightEl.style.left = `${rect.left + scrollLeft - 4}px`;
        spotlightEl.style.width = `${rect.width + 8}px`;
        spotlightEl.style.height = `${rect.height + 8}px`;
        agentLog.action(`💡 Spotlight Beacon navigated to field '${target.id || target.getAttribute("name") || "input"}'`);
        sendResponse({ success: true });
        return;
      }
      sendResponse({ success: false, reason: "No target field found" });
    }

    if (message.type === "BATCH_AUTOFILL") {
      const payload = message.payload || {};
      const inputs = Array.from(document.querySelectorAll("input, textarea, select")) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
      
      // Store backup for 100% safe undo
      (window as any).__SAVVY_UNDO_BACKUP__ = inputs.map((el) => ({
        el,
        prevVal: el.value,
      }));

      let injectedCount = 0;
      inputs.forEach((input) => {
        const nameAttr = (input.name || input.id || "").toLowerCase();
        let valToInject = "";
        if (nameAttr.includes("nik") || nameAttr.includes("ktp")) valToInject = payload.nik || "";
        else if (nameAttr.includes("nama") || nameAttr.includes("name")) valToInject = payload.nama || "";
        else if (nameAttr.includes("lahir") || nameAttr.includes("birth") || nameAttr.includes("tgl")) valToInject = payload.tanggal_lahir || "";
        else if (nameAttr.includes("alamat") || nameAttr.includes("address")) valToInject = payload.alamat || "";
        else if (nameAttr.includes("email") || nameAttr.includes("mail")) valToInject = payload.email || "";
        else if (nameAttr.includes("hp") || nameAttr.includes("phone") || nameAttr.includes("telp")) valToInject = payload.no_hp || "";

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
    headerPill.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #60A5FA;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
        <span>Savvy Snip</span>
      </div>
      <div style="width: 1px; height: 14px; background: rgba(255, 255, 255, 0.2);"></div>
      <span style="color: #E2E8F0; font-size: 12px;">Seret kursor untuk memotong area teks • <strong>ESC</strong> untuk batal</span>
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
      <span>Jelaskan dengan Savvy AI</span>
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
      <span>Salin Teks</span>
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
    btnCancel.title = "Batal (ESC)";

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
      dimLabel.textContent = "✓ Mengambil tangkapan layar...";
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
        btnCopy.innerHTML = `✓ Tersalin!`;
        setTimeout(() => {
          btnCopy.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Salin Teks</span>
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

  // 7. Auto-load persisted Accessibility settings from chrome.storage on page open/refresh
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get("savvy_a11y_settings", (res) => {
        if (res && res.savvy_a11y_settings) {
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
