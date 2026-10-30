// ============================================================================
// SAVVY.AI — Content Script (Chrome Manifest V3)
// Injeksi Closed Shadow DOM, Field Detection, dan Accessibility Controller
// ============================================================================

(() => {
  // Cegah injeksi ganda
  if ((window as any).__SAVVY_CONTENT_SCRIPT_INITIALIZED__) return;
  (window as any).__SAVVY_CONTENT_SCRIPT_INITIALIZED__ = true;

  console.log("[Savvy.AI] Content Script activated.");

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

      // Kirim metadata field ke background & sidepanel
      chrome.runtime.sendMessage({
        type: "FIELD_FOCUSED",
        fieldId: target.id || "",
        fieldName: target.getAttribute("name") || "",
        label: findElementLabel(target),
        tagName: target.tagName,
        inputType: (target as HTMLInputElement).type || "text",
        value: (target as HTMLInputElement).value || "",
      });
    }
  });

  document.addEventListener("focusout", () => {
    // Spotlight tetap aktif sejenak untuk memandu mata
  });

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
        sendResponse({ success: true });
        return true;
      }
      sendResponse({ success: false, reason: "Element not found" });
    }

    if (message.type === "SET_A11Y_FEATURE") {
      const { feature, enabled } = message;
      applyA11yFeature(feature, enabled);
      sendResponse({ success: true, feature, enabled });
    }

    if (message.type === "SCAN_PAGE_FIELDS") {
      const inputs = Array.from(
        document.querySelectorAll("input, select, textarea")
      ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

      const fields = inputs
        .filter((el) => el.type !== "hidden" && el.type !== "submit")
        .map((el) => ({
          id: el.id,
          name: el.name,
          label: findElementLabel(el),
          value: el.value,
          required: el.required,
          type: el.type || el.tagName.toLowerCase(),
        }));

      sendResponse({ fields, count: fields.length });
    }

    if (message.type === "START_SNIP_SELECTION") {
      startSnipMode();
      sendResponse({ success: true, mode: "active" });
    }

    return true;
  });

  // Snip Mode for "Explain This" (Jargon Buster)
  function startSnipMode() {
    const snipOverlay = document.createElement("div");
    snipOverlay.style.position = "fixed";
    snipOverlay.style.top = "0";
    snipOverlay.style.left = "0";
    snipOverlay.style.width = "100vw";
    snipOverlay.style.height = "100vh";
    snipOverlay.style.backgroundColor = "rgba(37, 99, 235, 0.08)";
    snipOverlay.style.cursor = "crosshair";
    snipOverlay.style.zIndex = "2147483647";
    snipOverlay.style.pointerEvents = "auto";

    const banner = document.createElement("div");
    banner.style.position = "fixed";
    banner.style.top = "20px";
    banner.style.left = "50%";
    banner.style.transform = "translateX(-50%)";
    banner.style.backgroundColor = "#2563EB";
    banner.style.color = "#FFFFFF";
    banner.style.padding = "10px 20px";
    banner.style.borderRadius = "9999px";
    banner.style.fontSize = "13px";
    banner.style.fontWeight = "bold";
    banner.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    banner.style.pointerEvents = "none";
    banner.innerText = "🔍 Savvy Snip: Klik paragraf / klausul juknis yang ingin dijelaskan";
    snipOverlay.appendChild(banner);

    const cleanup = () => {
      snipOverlay.remove();
      document.removeEventListener("keydown", onKeyDown);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cleanup();
    };
    document.addEventListener("keydown", onKeyDown);

    snipOverlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cleanup();

      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (elementAtPoint) {
        let text = elementAtPoint.innerText || elementAtPoint.textContent || "";
        text = text.trim().slice(0, 500);

        // Client-side PII black-out masking
        text = text.replace(/\b[1-9][0-9]{15}\b/g, "[REDACTED_NIK]");

        chrome.runtime.sendMessage({
          type: "SNIP_EXPLAIN_RESULT",
          text,
          tagName: elementAtPoint.tagName,
          portalUrl: window.location.href,
        });
      }
    });

    shadowRoot.appendChild(snipOverlay);
  }

  // 6. Controller 14 Fitur Accessibility HUB (WCAG 2.2 AAA & Pure JS)
  function applyA11yFeature(feature: string, enabled: boolean) {
    const html = document.documentElement;
    const body = document.body;

    switch (feature) {
      case "reading_spotlight":
        readingGuideEl.style.display = enabled ? "block" : "none";
        break;
      case "high_contrast":
        if (enabled) {
          html.style.filter = "contrast(180%) brightness(105%)";
        } else {
          html.style.filter = "";
        }
        break;
      case "bigger_text":
        if (enabled) {
          html.style.fontSize = "120%";
        } else {
          html.style.fontSize = "";
        }
        break;
      case "text_spacing":
        if (enabled) {
          body.style.letterSpacing = "0.12em";
          body.style.lineHeight = "1.8";
        } else {
          body.style.letterSpacing = "";
          body.style.lineHeight = "";
        }
        break;
      case "pause_animations":
        if (enabled) {
          const style = document.createElement("style");
          style.id = "savvy-pause-anim";
          style.textContent = "* { animation-play-state: paused !important; transition: none !important; }";
          document.head.appendChild(style);
        } else {
          document.getElementById("savvy-pause-anim")?.remove();
        }
        break;
      case "hide_images":
        if (enabled) {
          const style = document.createElement("style");
          style.id = "savvy-hide-img";
          style.textContent = "img, svg:not(.savvy-icon), video { visibility: hidden !important; }";
          document.head.appendChild(style);
        } else {
          document.getElementById("savvy-hide-img")?.remove();
        }
        break;
      case "highlight_links":
        if (enabled) {
          const style = document.createElement("style");
          style.id = "savvy-highlight-links";
          style.textContent = "a { outline: 3px solid #2563EB !important; background-color: #EFF6FF !important; }";
          document.head.appendChild(style);
        } else {
          document.getElementById("savvy-highlight-links")?.remove();
        }
        break;
      case "dyslexia_font":
        if (enabled) {
          body.style.fontFamily = "Comic Sans MS, sans-serif";
        } else {
          body.style.fontFamily = "";
        }
        break;
      default:
        console.log("[Savvy.AI Content] Toggled feature:", feature, enabled);
    }
  }
})();
