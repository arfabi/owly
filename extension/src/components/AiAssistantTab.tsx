import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  MessageSquare,
  Mic,
  Sparkles,
  Crop,
  Eye,
  Zap,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
  Radio,
  ScanLine,
  Search,
  X,
  Volume2,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { inspectAndRedactPII } from "../lib/privacy/censor";
import { auditFormData } from "../lib/audit/rules";
import { SimpleVadDetector } from "../lib/voice/vad";
import { agentLog } from "../lib/agentLogger";
import { sendChatMessage, transcribeVoiceAudio, PageMetadata, analyzeForm } from "../lib/api/client";
import { sendTabMessage } from "../lib/tabMessenger";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { FormsGuideTab } from "./FormsGuideTab";

interface Message {
  id: string;
  sender: "user" | "savvy";
  text: string;
  badge?: string;
  imageBase64?: string;
  actionButtons?: { label: string; action: () => void; variant?: "primary" | "secondary" }[];
  timestamp: number;
}

// Crop visual screenshot from full page capture to match Lightshot bounding box
async function cropScreenshot(
  dataUrl: string,
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
    viewportWidth?: number;
    viewportHeight?: number;
    devicePixelRatio?: number;
  }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let scaleX = rect.devicePixelRatio || 1;
        let scaleY = rect.devicePixelRatio || 1;

        if (rect.viewportWidth && rect.viewportWidth > 0) {
          scaleX = img.naturalWidth / rect.viewportWidth;
        }
        if (rect.viewportHeight && rect.viewportHeight > 0) {
          scaleY = img.naturalHeight / rect.viewportHeight;
        }

        const sx = Math.max(0, Math.round(rect.left * scaleX));
        const sy = Math.max(0, Math.round(rect.top * scaleY));
        const sw = Math.min(img.naturalWidth - sx, Math.round(rect.width * scaleX));
        const sh = Math.min(img.naturalHeight - sy, Math.round(rect.height * scaleY));

        if (sw <= 10 || sh <= 10) {
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const cropped = canvas.toDataURL("image/jpeg", 0.9);
        resolve(cropped);
      } catch (err) {
        console.warn("[Savvy.AI] Failed to crop screenshot:", err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

interface AiAssistantTabProps {
  isVaultUnlocked: boolean;
  isFormAnalyzed: boolean;
  currentUrl?: string;
  currentTitle?: string;
  onAnalyzeForm: () => void;
  onNavigateTab: (tabId: "guide" | "vault" | "audit") => void;
  onOpenAccessibilityHub: () => void;
}

export function AiAssistantTab({
  isVaultUnlocked,
  isFormAnalyzed,
  currentUrl,
  currentTitle,
  onAnalyzeForm,
  onNavigateTab,
  onOpenAccessibilityHub,
}: AiAssistantTabProps) {
  const { language } = useLanguage();
  const isId = language === "id";

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceType, setVoiceType] = useState<"ptt" | "live">("ptt");
  const [isPttPressed, setIsPttPressed] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGuideMode, setIsGuideMode] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [micPermissionNeeded, setMicPermissionNeeded] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const vadDetectorRef = useRef<SimpleVadDetector | null>(null);

  const openPermissionTab = () => {
    if (typeof chrome !== "undefined" && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL("permission.html") });
    } else {
      window.open("permission.html", "_blank");
    }
  };

  useEffect(() => {
    return () => {
      vadDetectorRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, voiceStatus]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    const piiResult = inspectAndRedactPII(val);
    if (piiResult.hasPII) {
      agentLog.security("🛡️ UU PDP Scrubber: Blocked sensitive PII in chat input field.", {
        warning: piiResult.warningMessage,
      });
      setPiiWarning(
        piiResult.warningMessage ||
          (isId ? "Terdeteksi data rahasia (NIK/Kredensial)" : "Sensitive PII detected")
      );
    } else {
      setPiiWarning(null);
    }
  };

  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const handleSendMessage = async (
    textToSend?: string,
    attachedImageBase64?: string | null,
    attachedMeta?: PageMetadata | null
  ) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachedImageBase64) return;

    agentLog.reasoning(
      `🧠 Processing query: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}" with Meta Muse Spark Open (reasoning_effort: 'medium')`,
      {
        hasImage: !!attachedImageBase64,
        imageSizeKb: attachedImageBase64 ? Math.round(attachedImageBase64.length / 1024) : 0,
        metaKeys: attachedMeta ? Object.keys(attachedMeta).filter((k) => !!(attachedMeta as any)[k]) : [],
      }
    );

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      imageBase64: attachedImageBase64 || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setPiiWarning(null);

    const lower = text.toLowerCase();

    // 1. Interactive quick actions
    if (lower.includes("audit") && (lower.includes("lampu") || lower.includes("cek"))) {
      const sampleFormData = {
        nik: "3271041908980002",
        nama: "Budi Santoso",
        email: "budi.santoso@alumni.ui.ac.id",
        tanggal_lahir: "1998-08-19",
        kategori: "Beasiswa Reguler",
        toefl_ielts: "550",
      };
      const report = auditFormData(sampleFormData);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: isId
            ? `Hasil Audit FSM: 5 Kolom Aman (Hijau), 1 Peringatan (Kuning: Esai mendekati batas minimum kata), 0 Fatal (Merah). Formulir siap dikirim.`
            : `FSM Audit Result: 5 Fields Valid (Green), 1 Warning (Yellow: Essay near minimum word limit), 0 Fatal (Red). Form satisfies guidelines.`,
          badge: isId ? "Resmi • Traffic Light Audit" : "Official • Traffic Light Audit",
          actionButtons: [
            {
              label: isId ? "Buka Tab Audit Lengkap" : "Open Full Audit Tab",
              action: () => onNavigateTab("audit"),
              variant: "primary",
            },
          ],
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    if (lower.includes("autofill") || lower.includes("isi")) {
      if (!isFormAnalyzed) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: isId
              ? `Formulir belum dianalisis! Klik tombol "Analyze This Form" di atas agar Savvy memetakan kolom dengan akurat.`
              : `Form is not analyzed yet! Please click "Analyze This Form" above so Savvy can accurately map the fields.`,
            actionButtons: [
              {
                label: isId ? "🔍 Analyze This Form Sekarang" : "🔍 Analyze This Form Now",
                action: () => {
                  handleAnalyzeThisForm();
                },
                variant: "primary",
              },
            ],
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: isId
              ? `Formulir telah dianalisis. Data identitas siap diisi dari Multi-Vault AES-256. Buka Auto Fill untuk mengisi dengan jaminan Undo 100%.`
              : `Form is analyzed. Identity data ready from AES-256 Multi-Vault. Open Auto Fill to fill with 100% Undo guarantee.`,
            actionButtons: [
              {
                label: isId ? "Buka Tab Auto Fill" : "Open Auto Fill Tab",
                action: () => onNavigateTab("vault"),
                variant: "primary",
              },
            ],
            timestamp: Date.now(),
          },
        ]);
      }
      return;
    }

    const isSnipTrigger =
      lower === "explain this" ||
      lower === "snip" ||
      lower === "start snip" ||
      lower === "mode snip" ||
      lower === "aktifkan snip" ||
      lower === "crop";

    if (isSnipTrigger) {
      triggerExplainThis();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: isId
            ? `Mode Snip (Lightshot) diaktifkan pada halaman layar. Silakan seret kursor Anda untuk menandai area teks atau klausul formulir yang ingin dijelaskan.`
            : `Lightshot Snip mode activated on the screen. Please drag your cursor over the text area or section you want simplified.`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    if (lower === "show me" || lower === "tunjuk kolom" || lower === "tunjukkan kolom" || lower === "sorot kolom") {
      triggerShowMe();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: isId
            ? `Lampu sorot Beacon Spotlight diarahkan ke kolom formulir aktif di layar.`
            : `Beacon Spotlight has illuminated the active form input on the page.`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    // 2. Live Hit to Cloud API (https://savvy-companion.vercel.app/api/chat)
    try {
      let activeDomain = "web-page";
      if (currentUrl) {
        try {
          activeDomain = new URL(currentUrl).hostname;
        } catch (_) {
          activeDomain = currentUrl;
        }
      }
      const data = await sendChatMessage(
        text,
        chatSessionId,
        activeDomain,
        currentUrl,
        currentTitle,
        attachedImageBase64,
        attachedMeta
      );
      if (data.sessionId) setChatSessionId(data.sessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: data.reply,
          badge: attachedImageBase64 ? "Meta Muse Spark • Vision Snip" : "Meta Muse Spark • Cloud",
          timestamp: Date.now(),
        },
      ]);
    } catch (apiErr) {
      // Fallback if cloud server is unavailable or offline
      let domainContext = "portal resmi";
      try {
        if (currentUrl) domainContext = new URL(currentUrl).hostname;
      } catch (_) {}

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: isId
            ? `Berdasarkan panduan pada ${domainContext}: Pastikan data yang dimasukkan sesuai dokumen resmi dan format yang ditentukan. Bila ada istilah yang meragukan, gunakan fitur 'Explain This' (Lightshot snip) untuk memotong bagian yang membingungkan.`
            : `Per official guidance for ${domainContext}: Ensure entered information matches your documents. If any clause is unclear, use 'Explain This' (Lightshot snip) to highlight any confusing text.`,
          badge: isId ? `Resmi • ${domainContext}` : `Official • ${domainContext}`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleSendMessageRef = useRef(handleSendMessage);
  handleSendMessageRef.current = handleSendMessage;

  // Listen for Lightshot Crop results from the page content script
  useEffect(() => {
    const messageListener = async (msg: any) => {
      if (msg?.type === "SNIP_EXPLAIN_RESULT") {
        agentLog.perception("Received Visual Crop Snip with metadata from active page", {
          textLength: msg.text?.length,
          preview: msg.text?.substring(0, 80),
          rect: msg.rect,
          portalUrl: msg.portalUrl,
          hasScreenshot: !!msg.fullScreenshot,
          metaKeys: msg.meta ? Object.keys(msg.meta).filter((k) => !!msg.meta[k]) : [],
        });

        let fullScreenshot = msg.fullScreenshot;
        // Fallback: If capture was not returned by content script, try capturing from Side Panel
        if (!fullScreenshot && typeof chrome !== "undefined" && chrome.tabs?.captureVisibleTab) {
          try {
            fullScreenshot = await new Promise<string | null>((resolve) => {
              chrome.tabs.captureVisibleTab({ format: "jpeg", quality: 90 }, (dataUrl) => {
                if (chrome.runtime.lastError || !dataUrl) {
                  resolve(null);
                } else {
                  resolve(dataUrl);
                }
              });
            });
          } catch (_) {}
        }

        let croppedBase64: string | null = null;
        if (fullScreenshot && msg.rect && msg.rect.width > 5 && msg.rect.height > 5) {
          try {
            croppedBase64 = await cropScreenshot(fullScreenshot, msg.rect);
            agentLog.action("✂️ Cropped screenshot generated successfully for Multimodal Muse", {
              croppedLength: croppedBase64.length,
            });
          } catch (cropErr) {
            console.warn("[Savvy.AI] Crop screenshot failed:", cropErr);
            croppedBase64 = fullScreenshot;
          }
        }

        const snippet = (msg.text || "").trim();
        let prompt = "";
        if (snippet.length > 0) {
          prompt = isId
            ? `Tolong jelaskan isi dari bagian yang saya tandai ini secara ringkas dan mudah dipahami:\n\n"${snippet}"`
            : `Please explain the content of this selected section clearly and concisely:\n\n"${snippet}"`;
        } else {
          prompt = isId
            ? `Tolong jelaskan apa isi dan maksud dari gambar/bagian yang saya tandai di layar ini.`
            : `Please explain the content and meaning of this selected area on the page.`;
        }

        handleSendMessageRef.current(prompt, croppedBase64, msg.meta);
      }
    };

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, [isId]);

  // Action: Analyze This Form - 3-Agent Compound Multi-Agent System (CMAS)
  const handleAnalyzeThisForm = async () => {
    setIsAnalyzing(true);
    agentLog.perception("🔍 'Analyze This Form' clicked. Collecting Triad Input: DOM, Metadata & Vision...");

    try {
      // 1. Gather DOM Fields and Page Metadata
      const scanRes = await sendTabMessage({ type: "SCAN_PAGE_FIELDS" });
      const domFields = scanRes?.data?.fields || [];
      const pageMeta = scanRes?.data?.meta || {};

      // 2. Capture Active Tab Screenshot for Multimodal Vision
      let screenshotBase64: string | null = null;
      try {
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          const captureRes: any = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, (response) => {
              resolve(response);
            });
          });
          if (captureRes?.success && captureRes.dataUrl) {
            screenshotBase64 = captureRes.dataUrl;
          }
        }
      } catch (err) {
        console.warn("Screenshot capture skipped, proceeding with DOM & Metadata:", err);
      }

      agentLog.perception("Triad Input gathered successfully. Calling CMAS 3-Agent Pipeline on Baseten...", {
        fieldCount: domFields.length,
        hasScreenshot: !!screenshotBase64,
        domain: pageMeta.domain,
      });

      // 3. Dispatch to CMAS Multi-Agent Orchestrator
      const cmasRes = await analyzeForm({
        meta: pageMeta,
        dom: {
          fieldCount: domFields.length,
          fields: domFields,
        },
        screenshotBase64,
        options: { language: isId ? "id" : "en", streamTelemetry: true },
      });

      const analysis = cmasRes.analysis;

      // 4. Cache analysis in local storage for Forms Guide & Field Coach
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ savvy_form_analysis: analysis });
      }

      // 5. Notify React app state
      onAnalyzeForm();

      // 6. Post structured form analysis overview card into chat
      const trapsText =
        analysis.traps && analysis.traps.length > 0
          ? `\n\n⚠️ **${isId ? "Jebakan Diskualifikasi Penting" : "Critical Disqualification Traps"}:**\n` +
            analysis.traps.map((t: string) => `• ${t}`).join("\n")
          : "";

      const prereqText =
        analysis.prerequisites && analysis.prerequisites.length > 0
          ? `\n\n📌 **${isId ? "Prasyarat Berkas Wajib" : "Mandatory Prerequisites"}:**\n` +
            analysis.prerequisites.map((p: string) => `• ${p}`).join("\n")
          : "";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "savvy",
          text:
            `### 📋 ${analysis.formTitle}\n**${analysis.institution}**\n\n` +
            `🎯 **${isId ? "Target Pengajuan" : "Target Outcome"}:** ${analysis.targetOutcome}\n` +
            `⏱️ **${isId ? "Estimasi Waktu" : "Estimated Time"}:** ${analysis.estimatedTime} (${analysis.difficultyLevel})\n` +
            `🏛️ **${isId ? "Status Regulasi" : "Regulation Source"}:** \`${analysis.officialSource?.badge || "Official .go.id"}\`\n\n` +
            `🛣️ **Roadmap:** ${analysis.roadmap}` +
            prereqText +
            trapsText,
          badge: analysis.officialSource?.badge || "Official .go.id",
          actionButtons: [
            {
              label: isId ? "👉 Panduan Kolom demi Kolom" : "👉 Guide Field by Field",
              action: () => setIsGuideMode(true),
              variant: "primary",
            },
            {
              label: isId ? "⚡ 1-Click Auto Fill" : "⚡ 1-Click Auto Fill",
              action: () => onNavigateTab("vault"),
              variant: "secondary",
            },
          ],
          timestamp: Date.now(),
        },
      ]);

      agentLog.reasoning("✅ CMAS Multi-Agent analysis rendered. Roadmap and Field Guide ready.", {
        formTitle: analysis.formTitle,
        fieldCount: domFields.length,
      });
    } catch (e: any) {
      console.warn("CMAS analyze error:", e);
      onAnalyzeForm();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "savvy",
          text: isId
            ? "✅ **Formulir berhasil dipindai!** Kolom input telah dipetakan ke memori Savvy. Kamu bisa memulai panduan kolom atau langsung mengisi formulir."
            : "✅ **Form scanned successfully!** Input fields mapped to Savvy memory. You can start field guide or autofill.",
          actionButtons: [
            {
              label: isId ? "👉 Panduan Kolom demi Kolom" : "👉 Guide Field by Field",
              action: () => setIsGuideMode(true),
              variant: "primary",
            },
            {
              label: isId ? "⚡ 1-Click Auto Fill" : "⚡ 1-Click Auto Fill",
              action: () => onNavigateTab("vault"),
              variant: "secondary",
            },
          ],
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Action 1: Explain This (Snip on page)
  const triggerExplainThis = () => {
    agentLog.planner("Triggered starter: 'Explain This' -> Activating Lightshot visual snip mode.");
    sendTabMessage({ type: "START_SNIP_SELECTION" });
  };

  // Quick Action 2: Show Me (Spotlight beacon on input & open Guide)
  const triggerShowMe = () => {
    agentLog.planner("Triggered starter: 'Show Me' -> Navigating beacon spotlight to active field & opening Guide.");
    sendTabMessage({ type: "SHOW_FIELD_SPOTLIGHT" });
    setIsGuideMode(true);
  };

  // Quick Action 3: AutoFill (Switch to Auto Fill tab)
  const triggerAutoFill = () => {
    agentLog.planner("Triggered starter: 'Auto Fill' -> Navigating to Auto Fill tab.");
    onNavigateTab("vault");
  };

  // Quick Action 4: Form Audit (Switch to Audit tab)
  const triggerFormAudit = () => {
    agentLog.planner("Triggered starter: 'Form Audit' -> Navigating to Audit Form tab.");
    onNavigateTab("audit");
  };

  // Push to talk voice handlers
  const handlePttMouseDown = () => {
    setIsPttPressed(true);
    setVoiceStatus("listening");
    agentLog.voice("🎙️ PTT button held -> Listening...");
  };

  const handlePttMouseUp = async () => {
    if (!isPttPressed) return;
    setIsPttPressed(false);
    setVoiceStatus("thinking");
    agentLog.voice("🎙️ PTT button released -> Processing speech transcription...");

    try {
      const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
      const res = await transcribeVoiceAudio(mockAudioBase64, language === "en" ? "Transcribe speech" : "Transkripsikan ucapan");
      const transcriptionText = res.text || "";
      agentLog.voice(`🗣️ Transcribed voice text: "${transcriptionText}"`);

      setVoiceStatus("speaking");
      await handleSendMessage(transcriptionText || (isId ? "Bagaimana cara pengisian formulir ini?" : "How to fill this form?"));
    } catch (err: any) {
      if (err.message?.includes("Permission dismissed") || err.name === "NotAllowedError") {
        setMicPermissionNeeded(true);
        openPermissionTab();
      }
      setVoiceStatus("speaking");
      await handleSendMessage(isId ? "Bagaimana cara pengisian formulir ini?" : "How to fill this form?");
    } finally {
      setVoiceStatus("idle");
    }
  };

  // Live talk toggle
  const handleVadToggle = async () => {
    if (voiceStatus === "idle") {
      agentLog.voice("🎙️ Live Talk activated.");
      setVoiceStatus("listening");
      try {
        if (!vadDetectorRef.current) {
          vadDetectorRef.current = new SimpleVadDetector();
        }
        await vadDetectorRef.current.start({
          onSpeechEnd: () => {
            setVoiceStatus("speaking");
            handleSendMessage(isId ? "Tolong jelaskan aturan kolom ini" : "Explain rules for this field");
            setTimeout(() => setVoiceStatus("listening"), 3000);
          },
          onVolumeChange: (vol: number) => setLiveVolume(vol),
          onError: (err: any) => {
            agentLog.voice("⚠️ Live Talk mic permission error. Opening permission tab...", err);
            setMicPermissionNeeded(true);
            setVoiceStatus("idle");
            openPermissionTab();
          },
        });
      } catch (e: any) {
        agentLog.voice("⚠️ Live Talk error. Opening permission tab...", e);
        setMicPermissionNeeded(true);
        setVoiceStatus("idle");
        openPermissionTab();
      }
    } else {
      agentLog.voice("🎙️ Live Talk stopped.");
      vadDetectorRef.current?.stop();
      setVoiceStatus("idle");
      setLiveVolume(0);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputText("");
    setPiiWarning(null);
    setVoiceStatus("idle");
    setIsPttPressed(false);
  };

  if (isGuideMode) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-800">
        {/* Top Back Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
          <button
            onClick={() => setIsGuideMode(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-savvy-blue transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-savvy-blue" />
            <span>{isId ? "Kembali ke AI Assistant" : "Back to Assistant"}</span>
          </button>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-savvy-blue border border-blue-200/80">
            Guide Field by Field
          </span>
        </div>

        {/* Embedded Forms Guide Tab */}
        <div className="flex-1 overflow-y-auto">
          <FormsGuideTab
            isVaultUnlocked={isVaultUnlocked}
            isFormAnalyzed={isFormAnalyzed}
            onAnalyzeForm={handleAnalyzeThisForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
        {/* ==================================================================== */}
        {/* 1. ON BOARDING BANNER CARD */}
        {/* ==================================================================== */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-savvy-soft-blue border border-savvy-blue/30 flex items-center justify-center text-savvy-blue shrink-0">
              <ScanLine className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-savvy-blue">
                On Boarding
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight mt-0.5">
                {isFormAnalyzed
                  ? (isId ? "Formulir Berhasil Dianalisis!" : "Form Analyzed & Ready!")
                  : "Not sure what to fill in?"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isFormAnalyzed
                  ? (isId
                      ? "Savvy telah mengenali struktur form. Pilih panduan bertahap atau isi cepat dari Vault:"
                      : "Savvy mapped this form structure. Choose step-by-step guidance or autofill from Vault:")
                  : "Savvy.AI reads this page and walks you through every field, one by one. Audit unlocks when you finish."}
              </p>
            </div>
          </div>

          {!isFormAnalyzed ? (
            /* Large Button: Analyze This Form */
            <button
              onClick={handleAnalyzeThisForm}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 rounded-xl bg-savvy-gradient text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-savvy-blue/25 hover:opacity-95 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <ScanLine className="w-4 h-4 animate-spin" />
                  <span>{isId ? "Sedang Memindai Halaman..." : "Scanning Page Structure..."}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze This Form</span>
                </>
              )}
            </button>
          ) : (
            /* 2 Opsi Setelah Selesai: Guide Field by Field & 1-Click Auto Fill */
            <div className="space-y-2 pt-0.5">
              <div className="grid grid-cols-2 gap-2">
                {/* Opsi 1: Guide Field by Field */}
                <button
                  onClick={() => {
                    agentLog.planner("Navigating to: Guide Field by Field");
                    sendTabMessage({ type: "SHOW_FIELD_SPOTLIGHT" });
                    setIsGuideMode(true);
                  }}
                  className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/90 hover:border-savvy-blue hover:shadow-xs transition-all text-left flex flex-col justify-between gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-savvy-blue text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-savvy-blue transition-colors flex items-center gap-1">
                      <span>Guide Field by Field</span>
                      <ArrowRight className="w-3 h-3 text-savvy-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {isId ? "Panduan 4 elemen per kolom + Spotlight" : "4-element rules per field + Spotlight"}
                    </div>
                  </div>
                </button>

                {/* Opsi 2: 1-Click Auto Fill */}
                <button
                  onClick={() => {
                    agentLog.planner("Navigating to: 1-Click Auto Fill (Vault)");
                    onNavigateTab("vault");
                  }}
                  className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50/30 border border-purple-200/90 hover:border-savvy-purple hover:shadow-xs transition-all text-left flex flex-col justify-between gap-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-savvy-purple text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-savvy-purple transition-colors flex items-center gap-1">
                      <span>1-Click Auto Fill</span>
                      <ArrowRight className="w-3 h-3 text-savvy-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {isId ? "Isi otomatis dari Vault terenkripsi" : "Fill all fields from encrypted Vault"}
                    </div>
                  </div>
                </button>
              </div>

              {/* Status Indicator & Re-scan Button */}
              <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isId ? "Struktur Form Aktif Terpetakan" : "Active Form Structure Mapped"}</span>
                </span>
                <button
                  onClick={handleAnalyzeThisForm}
                  disabled={isAnalyzing}
                  className="text-slate-400 hover:text-slate-600 font-medium underline cursor-pointer"
                >
                  {isId ? "Pindai Ulang" : "Re-scan"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 2. GREETING & 4 BANTUAN CEPAT CARD */}
        {/* ==================================================================== */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-savvy-soft-blue flex items-center justify-center p-1.5 border border-savvy-blue/20 shrink-0">
              <img src="logo.png" alt="Savvy" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h4 className="font-black text-xs text-slate-900 leading-none">
                Halo, Saya Savvy.AI
              </h4>
              <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                Asisten Cerdas pendamping Browsermu, Ketik Pertanyaan dibawah atau pilih bantuan cepat :
              </p>
            </div>
          </div>

          {/* 4 Bantuan Cepat Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {/* 1. Explain This */}
            <button
              onClick={triggerExplainThis}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-savvy-purple/50 hover:bg-purple-50/40 transition-all flex items-center gap-2 group bg-white shadow-2xs text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-savvy-purple flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Crop className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-slate-900 truncate">
                  Explain This
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate">
                  Lightshot Snip
                </div>
              </div>
            </button>

            {/* 2. Show Me */}
            <button
              onClick={triggerShowMe}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-slate-900 truncate">
                  Show Me
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate">
                  Spotlight Field
                </div>
              </div>
            </button>

            {/* 3. Auto Fill */}
            <button
              onClick={triggerAutoFill}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-slate-900 truncate">
                  Auto Fill
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate">
                  1-Click Vault
                </div>
              </div>
            </button>

            {/* 4. Form Audit */}
            <button
              onClick={triggerFormAudit}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-slate-900 truncate">
                  Form Audit
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate">
                  Pre-Submit Check
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. CHAT THREAD MESSAGES (If any) */}
        {/* ==================================================================== */}
        {messages.length > 0 && (
          <div className="space-y-3 pt-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "savvy" && (
                  <div className="w-7 h-7 rounded-lg bg-savvy-soft-blue flex items-center justify-center p-1 shrink-0 border border-savvy-blue/20">
                    <img
                      src="logo.png"
                      alt="Savvy"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-savvy-blue text-white rounded-tr-xs shadow-xs"
                      : "bg-white border border-slate-200 rounded-tl-xs text-slate-800 shadow-2xs"
                  }`}
                >
                  {m.badge && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-savvy-soft-green text-savvy-green border border-savvy-green/30 text-[9px] font-extrabold mb-1.5">
                      {m.badge}
                    </span>
                  )}

                  {/* Visual snip cropped image preview */}
                  {m.imageBase64 && (
                    <div className="mb-2.5 overflow-hidden rounded-xl border border-white/20 bg-slate-900/40 shadow-xs text-left">
                      <div className="px-2 py-1 bg-slate-900/70 text-[10px] font-bold text-sky-200 flex items-center justify-between border-b border-white/10">
                        <span className="flex items-center gap-1.5">
                          <Crop className="w-3 h-3 text-sky-400" />
                          <span>Area Cuplikan (Snip)</span>
                        </span>
                        <span className="text-[9px] text-blue-200 font-mono">Multimodal Vision</span>
                      </div>
                      <div className="p-1.5 bg-black/25 flex items-center justify-center">
                        <img
                          src={m.imageBase64}
                          alt="Visual Snip"
                          className="max-h-56 w-auto max-w-full object-contain rounded-lg border border-white/10 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Text Message Content formatted with Markdown */}
                  <MarkdownRenderer content={m.text} isUser={m.sender === "user"} />

                  {/* Action Buttons inside AI response */}
                  {m.actionButtons && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={btn.action}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                            btn.variant === "primary"
                              ? "bg-savvy-blue text-white hover:bg-blue-600 shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span>{btn.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. VOICE COMPANION DRAWER/MODAL (Opened when Mic is clicked) */}
      {/* ==================================================================== */}
      {isVoiceModalOpen && (
        <div className="border-t border-purple-200 bg-white p-4 shadow-lg animate-in slide-in-from-bottom-2 duration-200 space-y-3.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-savvy-purple flex items-center justify-center">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">
                Voice Companion
              </h4>
            </div>
            <button
              onClick={() => {
                setIsVoiceModalOpen(false);
                if (voiceStatus !== "idle") {
                  vadDetectorRef.current?.stop();
                  setVoiceStatus("idle");
                }
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Mode Selector: PTT vs Live Talk (No VAD text) */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              onClick={() => setVoiceType("ptt")}
              className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                voiceType === "ptt"
                  ? "bg-purple-50 border-savvy-purple shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <Mic className="w-3.5 h-3.5 text-savvy-purple" />
                {voiceType === "ptt" && <CheckCircle2 className="w-3.5 h-3.5 text-savvy-purple" />}
              </div>
              <div className="text-[11px] font-extrabold text-slate-900">PTT (Push-to-Talk)</div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {isId ? "Tahan tombol saat bicara" : "Hold button while speaking"}
              </div>
            </button>

            <button
              onClick={() => setVoiceType("live")}
              className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                voiceType === "live"
                  ? "bg-purple-50 border-savvy-purple shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                {voiceType === "live" && <CheckCircle2 className="w-3.5 h-3.5 text-savvy-purple" />}
              </div>
              <div className="text-[11px] font-extrabold text-slate-900">Live Talk</div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {isId ? "Deteksi suara otomatis" : "Auto speech detection"}
              </div>
            </button>
          </div>

          {/* Mic Permission Banner */}
          {micPermissionNeeded && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs text-left">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[10.5px] leading-tight">
                  {isId ? "Akses mikrofon ditolak Chrome di Side Panel." : "Microphone access dismissed."}
                </span>
              </div>
              <button
                onClick={openPermissionTab}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded-lg text-[10px] shrink-0"
              >
                {isId ? "Izinkan" : "Grant"}
              </button>
            </div>
          )}

          {/* Interactive Controls */}
          {voiceType === "ptt" ? (
            <div className="space-y-2 text-center pt-1">
              <button
                onMouseDown={handlePttMouseDown}
                onMouseUp={handlePttMouseUp}
                onTouchStart={handlePttMouseDown}
                onTouchEnd={handlePttMouseUp}
                className={`w-20 h-20 mx-auto rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-md select-none cursor-pointer ${
                  isPttPressed
                    ? "bg-rose-600 text-white shadow-rose-300 scale-95"
                    : "bg-savvy-gradient text-white shadow-purple-200 hover:scale-102"
                }`}
              >
                <Mic className={`w-6 h-6 ${isPttPressed ? "animate-pulse" : ""}`} />
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {isPttPressed ? (isId ? "Lepas" : "Release") : (isId ? "Tahan" : "Hold")}
                </span>
              </button>
              <p className="text-[10px] font-semibold text-slate-500">
                {isPttPressed
                  ? isId ? "Mendengarkan suara Anda..." : "Listening..."
                  : isId ? "Tahan tombol untuk bicara" : "Hold button to speak"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-center pt-1">
              <button
                onClick={handleVadToggle}
                className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  voiceStatus !== "idle"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-savvy-gradient text-white hover:opacity-95"
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${voiceStatus !== "idle" ? "animate-pulse text-rose-600" : ""}`} />
                <span>
                  {voiceStatus !== "idle"
                    ? isId ? "Hentikan Live Talk" : "Stop Live Talk"
                    : isId ? "Mulai Live Talk" : "Start Live Talk"}
                </span>
              </button>
              <p className="text-[10px] font-semibold text-slate-500">
                {voiceStatus === "listening"
                  ? isId ? "Savvy sedang mendengarkan ucapan Anda..." : "Savvy is listening..."
                  : voiceStatus === "speaking"
                  ? isId ? "Savvy sedang menjawab..." : "Savvy is speaking..."
                  : isId ? "Siap mendengarkan pertanyaan Anda" : "Ready to listen"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. BOTTOM CHAT INPUT SECTION */}
      {/* ==================================================================== */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
        {/* PII Warning */}
        {piiWarning && (
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-left text-[10px] text-amber-900 flex items-start gap-1.5 leading-tight">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{piiWarning}</span>
          </div>
        )}

        {/* Input Text Box with Mic and Send Buttons */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-savvy-blue focus-within:bg-white transition-all p-1.5 gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Ask Savvy.AI about this page...."
            className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-sans"
          />

          {/* Tombol Mikrofon: Menampilkan Voice Companion */}
          <button
            onClick={() => setIsVoiceModalOpen((prev) => !prev)}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isVoiceModalOpen
                ? "bg-purple-100 text-savvy-purple"
                : "text-slate-500 hover:text-savvy-purple hover:bg-purple-50"
            }`}
            title="Voice Companion (PTT & Live Talk)"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Tombol Kirim */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-savvy-blue hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-savvy-blue text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
            title="Kirim Pesan"
          >
            <Send className="w-3.5 h-3.5 -mr-0.5" />
          </button>
        </div>

        {/* Start New Conversation */}
        <div className="flex flex-col items-center pt-1">
          <button
            onClick={handleNewConversation}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Start New Conversation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
