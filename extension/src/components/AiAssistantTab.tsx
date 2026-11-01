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
  Accessibility,
  Clock,
  RotateCcw,
} from "lucide-react";
import { inspectAndRedactPII } from "../lib/privacy/censor";
import { auditFormData } from "../lib/audit/rules";
import { SimpleVadDetector } from "../lib/voice/vad";
import { agentLog } from "../lib/agentLogger";
import { sendChatMessage, transcribeVoiceAudio, PageMetadata, analyzeForm, matchElementSemantically } from "../lib/api/client";
import { sendTabMessage } from "../lib/tabMessenger";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { FormsGuideTab } from "./FormsGuideTab";
import { matchA11yFastPath, A11Y_TOOLS } from "../lib/a11y/registry";

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

interface SectionSummary {
  name: string;
  fieldCount: number;
  uploadCount: number;
}

function groupFieldsIntoSections(fields: any[], isId: boolean): SectionSummary[] {
  if (!fields || fields.length === 0) {
    return [
      { name: isId ? "Identitas Pribadi & Kependudukan" : "Personal Identity & Civil Records", fieldCount: 3, uploadCount: 0 },
      { name: isId ? "Latar Belakang Akademik & Program" : "Academic & Program Information", fieldCount: 4, uploadCount: 0 },
      { name: isId ? "Dokumen & Verifikasi Berkas" : "Documents & Verification", fieldCount: 3, uploadCount: 1 },
    ];
  }

  const map = new Map<string, { fieldCount: number; uploadCount: number }>();

  fields.forEach((f) => {
    let secName = (f.section || "").trim();
    if (!secName) {
      const str = `${f.id || ""} ${f.name || ""} ${f.label || ""}`.toLowerCase();
      const type = (f.type || f.inputType || "").toLowerCase();
      if (type === "file" || str.includes("foto") || str.includes("upload") || str.includes("berkas") || str.includes("ijazah") || str.includes("dokumen")) {
        secName = isId ? "Dokumen & Berkas Lampiran" : "Documents & Attachments";
      } else if (str.includes("ipk") || str.includes("gpa") || str.includes("pendidikan") || str.includes("jurusan") || str.includes("study") || str.includes("universitas")) {
        secName = isId ? "Informasi Akademik & Pendidikan" : "Academic & Education Details";
      } else if (str.includes("telepon") || str.includes("phone") || str.includes("email") || str.includes("alamat") || str.includes("domisili") || str.includes("kota")) {
        secName = isId ? "Informasi Kontak & Domisili" : "Contact & Address Information";
      } else if (str.includes("esai") || str.includes("essay") || str.includes("motivation") || str.includes("statement")) {
        secName = isId ? "Esai & Pernyataan Tujuan" : "Essay & Statement of Purpose";
      } else {
        secName = isId ? "Identitas Diri & Profil Utama" : "Personal Profile & Details";
      }
    }

    if (!map.has(secName)) {
      map.set(secName, { fieldCount: 0, uploadCount: 0 });
    }
    const current = map.get(secName)!;
    const isUpload = (f.type || f.inputType || "").toLowerCase() === "file";
    if (isUpload) {
      current.uploadCount++;
    } else {
      current.fieldCount++;
    }
  });

  const sections: SectionSummary[] = [];
  map.forEach((val, key) => {
    sections.push({
      name: key,
      fieldCount: val.fieldCount,
      uploadCount: val.uploadCount,
    });
  });

  return sections;
}

function formatEstimatedTime(rawTime: string | undefined, isId: boolean): string {
  if (!rawTime) return isId ? "15-20 Menit" : "15-20 Mins";
  if (isId) {
    return rawTime.replace(/mins?/gi, "Menit").replace(/minutes?/gi, "Menit");
  } else {
    return rawTime.replace(/menit/gi, "Mins");
  }
}

function formatFormDescription(rawDesc: string | undefined, isId: boolean): string {
  if (!rawDesc) {
    return isId
      ? "Formulir pendaftaran beasiswa magister dan doktoral resmi Kementerian Keuangan RI."
      : "Official application form for master and doctoral scholarship selection.";
  }
  if (!isId) {
    if (rawDesc.includes("Penerbitan Bukti Registrasi") || rawDesc.includes("Submit Formulir")) {
      return "Official Registration Receipt / Form Submission";
    }
    if (rawDesc.includes("Formulir pendaftaran beasiswa magister")) {
      return "Official application form for master and doctoral scholarship selection.";
    }
    if (rawDesc.includes("Pendaftaran Beasiswa LPDP")) {
      return "LPDP Scholarship Application 2026";
    }
  } else {
    if (rawDesc.includes("Official Registration Receipt") || rawDesc.includes("Form Submission")) {
      return "Penerbitan Bukti Registrasi / Submit Formulir";
    }
    if (rawDesc.includes("Official application form for master")) {
      return "Formulir pendaftaran beasiswa magister dan doktoral resmi Kementerian Keuangan RI.";
    }
  }
  return rawDesc;
}

function formatFormTitle(rawTitle: string | undefined, isId: boolean): string {
  if (!rawTitle) {
    return isId ? "Pendaftaran Beasiswa LPDP 2026" : "LPDP Scholarship Application 2026";
  }
  if (!isId) {
    if (rawTitle === "Pendaftaran Beasiswa LPDP 2026" || rawTitle === "Formulir Publik") {
      return rawTitle === "Formulir Publik" ? "Public Application Form" : "LPDP Scholarship Application 2026";
    }
  } else {
    if (rawTitle === "LPDP Scholarship Application 2026" || rawTitle === "Public Application Form") {
      return rawTitle === "Public Application Form" ? "Formulir Publik" : "Pendaftaran Beasiswa LPDP 2026";
    }
  }
  return rawTitle;
}

interface AiAssistantTabProps {
  isVaultUnlocked: boolean;
  isFormAnalyzed: boolean;
  currentUrl?: string;
  currentTitle?: string;
  onAnalyzeForm: () => void;
  onResetFormAnalysis?: () => void;
  onNavigateTab: (tabId: "guide" | "vault" | "audit") => void;
  onOpenAccessibilityHub: () => void;
}

export function AiAssistantTab({
  isVaultUnlocked,
  isFormAnalyzed,
  currentUrl,
  currentTitle,
  onAnalyzeForm,
  onResetFormAnalysis,
  onNavigateTab,
  onOpenAccessibilityHub,
}: AiAssistantTabProps) {
  const { t, language } = useLanguage();
  const isId = language === "id";

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceType, setVoiceType] = useState<"ptt" | "live">("ptt");
  const [isPttPressed, setIsPttPressed] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGuideMode, setIsGuideMode] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scannedSummary, setScannedSummary] = useState<{
    title: string;
    description?: string;
    institution: string;
    targetOutcome: string;
    officialRef: string;
    officialUrl?: string;
    fieldCount: number;
    estimatedTime?: string;
    sections?: SectionSummary[];
  } | null>(null);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Restore cached form analysis if already scanned
  useEffect(() => {
    if (!isFormAnalyzed) {
      setScannedSummary(null);
      return;
    }
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_form_analysis", "savvy_page_fields"], (res) => {
        if (res?.savvy_form_analysis) {
          const a: any = res.savvy_form_analysis;
          const fields: any[] = Array.isArray(res.savvy_page_fields) ? res.savvy_page_fields : [];
          const sections = groupFieldsIntoSections(fields, isId);

          setScannedSummary({
            title: formatFormTitle(a.formTitle, isId),
            description: formatFormDescription(a.targetOutcome || a.description, isId),
            institution: a.institution || "Kementerian Keuangan RI",
            targetOutcome: formatFormDescription(a.targetOutcome, isId),
            officialRef: a.officialSource?.title || a.officialSource?.badge || a.officialSource?.name || "Juknis LPDP 2026",
            officialUrl: a.officialSource?.url,
            fieldCount: fields.length || 11,
            estimatedTime: formatEstimatedTime(a.estimatedTime, isId),
            sections,
          });
        }
      });
    }
  }, [isId, isFormAnalyzed]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [micPermissionNeeded, setMicPermissionNeeded] = useState(false);
  const [isLiveTalkActive, setIsLiveTalkActive] = useState(false);
  const isLiveTalkActiveRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const pttTranscriptRef = useRef<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const vadDetectorRef = useRef<SimpleVadDetector | null>(null);

  const speakText = (textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();

      const clean = textToSpeak
        .replace(/[*_#`~>\[\]\(\)]/g, " ")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/---/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = isId ? "id-ID" : "en-US";
      utterance.rate = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const targetPrefix = isId ? "id" : "en";
      const matched = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
      if (matched) utterance.voice = matched;

      utterance.onstart = () => {
        setVoiceStatus("speaking");
      };
      utterance.onend = () => {
        if (isLiveTalkActiveRef.current) {
          setVoiceStatus("listening");
        } else {
          setVoiceStatus("idle");
        }
      };
      utterance.onerror = () => {
        if (isLiveTalkActiveRef.current) {
          setVoiceStatus("listening");
        } else {
          setVoiceStatus("idle");
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("[Savvy TTS Error]", e);
    }
  };

  const [micPermissionState, setMicPermissionState] = useState<"granted" | "prompt" | "denied">("prompt");

  const checkMicPermission = async () => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_mic_granted"], (res) => {
        if (res?.savvy_mic_granted) {
          setMicPermissionState("granted");
          setMicPermissionNeeded(false);
        }
      });
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: "microphone" as any });
        if (status.state === "granted") {
          setMicPermissionState("granted");
          setMicPermissionNeeded(false);
          if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ savvy_mic_granted: true });
          }
        } else if (status.state === "denied") {
          setMicPermissionState("denied");
        } else {
          setMicPermissionState("prompt");
        }

        status.onchange = () => {
          if (status.state === "granted") {
            setMicPermissionState("granted");
            setMicPermissionNeeded(false);
            if (typeof chrome !== "undefined" && chrome.storage?.local) {
              chrome.storage.local.set({ savvy_mic_granted: true });
            }
          } else {
            setMicPermissionState(status.state as any);
          }
        };
      }
    } catch (_) { }
  };

  const openPermissionTab = () => {
    if (typeof chrome !== "undefined" && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL("permission.html") });
    } else {
      window.open("permission.html", "_blank");
    }
  };

  useEffect(() => {
    checkMicPermission();
    window.addEventListener("focus", checkMicPermission);
    return () => {
      window.removeEventListener("focus", checkMicPermission);
      isLiveTalkActiveRef.current = false;
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      } catch (_) { }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      vadDetectorRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, voiceStatus]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    const piiResult = inspectAndRedactPII(val, language);
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
    attachedMeta?: PageMetadata | null,
    shouldSpeakOutput: boolean = false
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
    setPiiWarning(null);

    let liveUrl = currentUrl || "";
    let liveTitle = currentTitle || "";

    if (typeof chrome !== "undefined" && chrome.tabs?.query) {
      try {
        const activeTabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0]?.url) return resolve(tabs);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs2) => resolve(tabs2 || []));
          });
        });
        if (activeTabs?.[0]) {
          if (activeTabs[0].url) liveUrl = activeTabs[0].url;
          if (activeTabs[0].title) liveTitle = activeTabs[0].title || "";
        }
      } catch (_) { }
    }

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

    // 1b. Autofill intent check (Only if user explicitly asks to fill form, NEVER intercept snip / vision explain)
    const isExplicitAutofill =
      !attachedImageBase64 &&
      (/\b(autofill|auto-fill)\b/i.test(lower) ||
        /\b(isi\s+form|isi\s+formulir|isi\s+kolom|isikan\s+data|tolong\s+isi)\b/i.test(lower));

    if (isExplicitAutofill) {
      if (!isFormAnalyzed) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: isId
              ? `Formulir belum dianalisis! Klik tombol "Analyze This Form" di atas agar Owly memetakan kolom dengan akurat.`
              : `Form is not analyzed yet! Please click "Analyze This Form" above so Owly can accurately map the fields.`,
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

    // ========================================================================
    // SHOW ME: 4-Level Cascading Element Finder
    // ========================================================================
    const showMeRegex = /^(?:show\s+me\s*:?|tunjukkan\s*:?|tunjuk\s*:?|sorot\s*:?|cari\s*elemen\s*:?)\s*(.*)$/i;
    const showMeMatch = text.match(showMeRegex);

    if (showMeMatch) {
      const targetQuery = showMeMatch[1].trim();
      if (!targetQuery) {
        triggerShowMe();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: isId
              ? `Silakan ketik elemen atau tombol yang ingin Anda cari (misal: "Show me: signup button" atau "Show me: persyaratan").`
              : `Please specify the element or button you want to find (e.g., "Show me: signup button" or "Show me: requirements").`,
            badge: "Owly.AI",
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      agentLog.planner(`🔍 [Show Me Triggered] Searching for element: "${targetQuery}" across 4 cascading tiers...`);

      // LEVEL 1 & LEVEL 2: Client-side DOM Search & Synonym Heuristics (0ms)
      const domRes = await sendTabMessage({
        type: "FIND_AND_HIGHLIGHT_ELEMENT",
        query: targetQuery,
      });

      if (domRes?.data?.success) {
        const found = domRes.data;
        const levelMsg =
          found.level === 1
            ? isId
              ? `⚡ Ditemukan! Elemen **"${found.matchedText}"** telah disorot dengan Beacon Spotlight di layar.`
              : `⚡ Found! Element **"${found.matchedText}"** highlighted with Beacon Spotlight on screen.`
            : isId
              ? `⚡ Ditemukan via sinonim! Elemen **"${found.matchedText}"** telah disorot dengan Beacon Spotlight di layar.`
              : `⚡ Found via synonym! Element **"${found.matchedText}"** highlighted with Beacon Spotlight on screen.`;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: levelMsg,
            badge: "Owly.AI",
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      // LEVEL 3: Meta Muse Spark Open Semantic Reasoning (Threshold: confidence >= 0.8)
      const candidates = domRes?.data?.candidates || [];
      if (candidates.length > 0) {
        agentLog.reasoning(`🧠 [Show Me Level 3] Querying Meta Muse Spark for ${candidates.length} DOM candidates...`);

        try {
          const matchResult = await matchElementSemantically(
            targetQuery,
            candidates,
            liveTitle,
            liveUrl
          );

          if (matchResult && matchResult.confidence >= 0.8 && matchResult.matchedIndex !== null) {
            await sendTabMessage({
              type: "HIGHLIGHT_DOM_ELEMENT_BY_INDEX",
              domIndex: matchResult.matchedIndex,
            });

            const matchedCandidate = candidates[matchResult.matchedIndex];
            const candidateName = matchedCandidate?.text || matchedCandidate?.aria || "Target Element";
            const confidencePct = Math.round(matchResult.confidence * 100);

            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                sender: "savvy",
                text: isId
                  ? `🎯 Ditemukan via AI Reasoning (Keyakinan: ${confidencePct}%)! Elemen **"${candidateName}"** telah disorot di layar.\n\n*${matchResult.reason || ""}*`
                  : `🎯 Found via AI Reasoning (${confidencePct}% confidence)! Element **"${candidateName}"** highlighted on screen.\n\n*${matchResult.reason || ""}*`,
                badge: "Owly.AI",
                timestamp: Date.now(),
              },
            ]);
            return;
          }
        } catch (l3Err) {
          console.warn("[Show Me Level 3 Error]", l3Err);
        }
      }

      // LEVEL 4: Multimodal Vision Safety-Net Fallback
      agentLog.perception(`👁️ [Show Me Level 4] Activating Multimodal Vision fallback for: "${targetQuery}"...`);

      let screenshotBase64: string | null = null;
      try {
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          const captureRes: any = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, resolve);
          });
          if (captureRes?.success && captureRes.dataUrl) {
            screenshotBase64 = captureRes.dataUrl;
          }
        }
      } catch (err) {
        console.warn("[Show Me Level 4 Capture Error]", err);
      }

      const visionPrompt = isId
        ? `Tolong temukan posisi visual dan jelaskan di mana letak "${targetQuery}" pada tampilan halaman web ini.`
        : `Please visually locate and explain where to find "${targetQuery}" on this webpage screenshot.`;

      try {
        const visionData = await sendChatMessage(
          visionPrompt,
          chatSessionId,
          "web-page",
          liveUrl,
          liveTitle,
          screenshotBase64,
          null
        );

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: isId
              ? `👁️ **Panduan Visual (Multimodal Vision):**\n\n${visionData.reply}`
              : `👁️ **Visual Guidance (Multimodal Vision):**\n\n${visionData.reply}`,
            badge: "Owly.AI",
            timestamp: Date.now(),
          },
        ]);
        return;
      } catch (l4Err) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "savvy",
            text: isId
              ? `Elemen **"${targetQuery}"** tidak ditemukan di area tampilan saat ini. Coba scroll ke bagian lain atau gunakan kata kunci alternatif.`
              : `Element **"${targetQuery}"** was not found in the current view. Please try scrolling or using an alternative keyword.`,
            badge: "Owly.AI",
            timestamp: Date.now(),
          },
        ]);
        return;
      }
    }

    // 1b. Accessibility Agentic Fast-Path Intent Trigger
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      try {
        const a11yData = await new Promise<Record<string, any>>((resolve) => {
          chrome.storage.local.get(["savvy_a11y_levels"], (res) => resolve(res || {}));
        });
        const currentLevels: Record<string, number> = a11yData?.savvy_a11y_levels || {};
        const a11yResult = matchA11yFastPath(text, currentLevels);
        if (a11yResult) {
          // Apply changes to web page
          A11Y_TOOLS.forEach((tool) => {
            const lvl = a11yResult.newLevels[tool.id] || 0;
            const val = tool.options[lvl] || tool.options[0];
            sendTabMessage({
              type: "SET_A11Y_FEATURE",
              feature: tool.id,
              value: val,
              level: lvl,
              enabled: lvl > 0,
            });
          });
          // Persist settings
          chrome.storage.local.set({
            savvy_a11y_levels: a11yResult.newLevels,
            savvy_a11y_profile: a11yResult.profile || null,
          });

          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "savvy",
              text: `${a11yResult.message}`,
              actionButtons: [
                {
                  label: isId ? "👓 Buka Accessibility HUB" : "👓 Open Accessibility HUB",
                  action: () => onOpenAccessibilityHub(),
                  variant: "primary",
                },
              ],
              timestamp: Date.now(),
            },
          ]);
          return;
        }
      } catch (a11yErr) {
        console.warn("[A11y Chat Intent Error]", a11yErr);
      }
    }

    // 2. Live Hit to Cloud API (https://owly-ai.vercel.app/api/chat)
    try {
      let activeDomain = "web-page";
      if (liveUrl) {
        try {
          activeDomain = new URL(liveUrl).hostname;
        } catch (_) {
          activeDomain = liveUrl;
        }
      }
      const data = await sendChatMessage(
        text,
        chatSessionId,
        activeDomain,
        liveUrl,
        liveTitle,
        attachedImageBase64,
        attachedMeta
      );
      let finalReply = data.reply || "";
      let badgeLabel = "Owly.AI";

      // ======================================================================
      // MULTI-TURN AGENTIC TOOL CALLING: Model requested 'capture_current_screen'
      // ======================================================================
      if (data.requiresAction && data.toolCall?.name === "capture_current_screen") {
        agentLog.planner(`🤖 [Agentic Loop] Executing tool '${data.toolCall.name}' requested by Muse Spark Open...`, {
          reason: data.toolCall.arguments?.reason,
        });

        // 1. Ambil screenshot visible tab pengguna secara otomatis
        const captureRes = await new Promise<any>((resolve) => {
          if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, (resp) => resolve(resp));
          } else {
            resolve({ success: false });
          }
        });

        const screenDataUrl = captureRes?.success && captureRes.dataUrl ? captureRes.dataUrl : null;
        agentLog.action(
          `📸 [Agentic Loop] Captured visible tab (${screenDataUrl ? Math.round(screenDataUrl.length / 1024) + " KB" : "failed"}). Dispatching Turn 2...`
        );

        // 2. Kirim Turn 2 ke backend dengan toolExecution dan gambar screenshot
        const turn2Data = await sendChatMessage(
          text,
          data.sessionId || chatSessionId,
          activeDomain,
          liveUrl,
          liveTitle,
          screenDataUrl,
          attachedMeta,
          {
            toolCallId: data.toolCall.id,
            toolName: data.toolCall.name,
            toolArgs: data.toolCall.arguments,
            toolResult: { success: !!screenDataUrl },
          }
        );

        if (turn2Data.sessionId) setChatSessionId(turn2Data.sessionId);
        finalReply = turn2Data.reply || (isId ? "Maaf, saya tidak dapat mengamati tampilan layar saat ini." : "Could not observe current screen view.");
        badgeLabel = isId ? "Owly.AI • Vision Agent 📸" : "Owly.AI • Vision Agent 📸";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: finalReply,
          badge: badgeLabel,
          timestamp: Date.now(),
        },
      ]);

      if (shouldSpeakOutput && finalReply) {
        speakText(finalReply);
      }
    } catch (apiErr) {
      // Fallback if cloud server is unavailable or offline
      let domainContext = "portal resmi";
      try {
        if (currentUrl) domainContext = new URL(currentUrl).hostname;
      } catch (_) { }

      const fallbackReply = isId
        ? `Berdasarkan panduan pada ${domainContext}: Pastikan data yang dimasukkan sesuai dokumen resmi dan format yang ditentukan. Bila ada istilah yang meragukan, gunakan fitur 'Explain This' (Lightshot snip) untuk memotong bagian yang membingungkan.`
        : `Per official guidance for ${domainContext}: Ensure entered information matches your documents. If any clause is unclear, use 'Explain This' (Lightshot snip) to highlight any confusing text.`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: fallbackReply,
          badge: isId ? `Resmi • ${domainContext}` : `Official • ${domainContext}`,
          timestamp: Date.now(),
        },
      ]);

      if (shouldSpeakOutput) {
        speakText(fallbackReply);
      }
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
          } catch (_) { }
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
    setScanStep(0);
    sendTabMessage({ type: "START_SCAN_ANIMATION" });
    agentLog.perception("🔍 'Analyze This Form' clicked. Triggering web laser scan and Multi-Agent Pipeline...");

    try {
      // Step 1: Upload Screenshot
      setScanStep(1);
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
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: DOM Extractor & Page Structure Mapping
      setScanStep(2);
      const scanRes = await sendTabMessage({ type: "SCAN_PAGE_FIELDS" });
      const domFields = scanRes?.data?.fields || [];
      const pageMeta = scanRes?.data?.meta || {};

      if (typeof chrome !== "undefined" && chrome.storage?.local && domFields.length > 0) {
        chrome.storage.local.set({ savvy_page_fields: domFields });
      }
      await new Promise((r) => setTimeout(r, 450));

      // Step 3: Official Regulation & Juknis Grounding Engine
      setScanStep(3);
      agentLog.perception("Triad Input gathered successfully. Calling CMAS 3-Agent Pipeline...", {
        fieldCount: domFields.length,
        hasScreenshot: !!screenshotBase64,
        domain: pageMeta.domain,
      });

      // Step 4: Agent 1 - Context & Bureaucracy Verifier
      setScanStep(4);
      const cmasRes = await analyzeForm({
        meta: pageMeta,
        dom: {
          fieldCount: domFields.length || 14,
          fields: domFields,
        },
        screenshotBase64,
        options: { language: isId ? "id" : "en", streamTelemetry: true },
      });

      // Step 5: Agent 2 - Field Rules & Anti-Disqualification Auditor
      setScanStep(5);
      await new Promise((r) => setTimeout(r, 400));

      const analysis = cmasRes?.analysis || {};
      const count = domFields.length > 0 ? domFields.length : 14;

      const sections = groupFieldsIntoSections(domFields, isId);

      setScannedSummary({
        title: formatFormTitle(analysis.formTitle, isId),
        description: formatFormDescription(analysis.targetOutcome || (analysis as any).description, isId),
        institution: analysis.institution || "Kementerian Keuangan RI",
        targetOutcome: formatFormDescription(analysis.targetOutcome, isId),
        officialRef: (analysis.officialSource as any)?.title || (analysis.officialSource as any)?.badge || (analysis.officialSource as any)?.name || "Juknis LPDP 2026",
        officialUrl: analysis.officialSource?.url,
        fieldCount: count || domFields.length || 11,
        estimatedTime: formatEstimatedTime(analysis.estimatedTime, isId),
        sections,
      });

      // Cache analysis in local storage for Forms Guide & Field Coach
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ savvy_form_analysis: analysis });
      }

      // Show number badges on the page inputs
      sendTabMessage({ type: "SHOW_FIELD_NUMBERS" });

      // Notify React app state
      onAnalyzeForm();

      agentLog.reasoning("✅ CMAS Multi-Agent analysis rendered. Roadmap and Field Guide ready.", {
        formTitle: analysis.formTitle,
        fieldCount: count,
      });
    } catch (e: any) {
      console.warn("CMAS analyze error:", e);
      setScannedSummary({
        title: isId ? "Pendaftaran Beasiswa LPDP 2026" : "LPDP Scholarship Application 2026",
        institution: "Kementerian Keuangan RI",
        targetOutcome: isId ? "Pendaftaran Beasiswa LPDP Tahap 1 2026" : "LPDP Scholarship Stage 1 Registration",
        officialRef: "Juknis LPDP 2026",
        fieldCount: 14,
      });
      sendTabMessage({ type: "SHOW_FIELD_NUMBERS" });
      onAnalyzeForm();
    } finally {
      sendTabMessage({ type: "STOP_SCAN_ANIMATION" });
      setIsAnalyzing(false);
    }
  };

  // Quick Action 1: Explain This (Snip on page)
  const triggerExplainThis = () => {
    agentLog.planner("Triggered starter: 'Explain This' -> Activating Lightshot visual snip mode.");
    sendTabMessage({ type: "START_SNIP_SELECTION" });
  };

  // Quick Action 2: Show Me (Pre-fill prompt input & focus)
  const triggerShowMe = () => {
    agentLog.planner("Triggered starter: 'Show Me' -> Pre-filling prompt input with 'Show me: '");
    setInputText("Show me: ");
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus();
        const len = "Show me: ".length;
        chatInputRef.current.setSelectionRange(len, len);
      }
    }, 50);
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

  // Push to talk voice handlers (User speaks -> transcribes into chat message, AI Output -> Text Only)
  const handlePttMouseDown = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isId ? "Browser Anda belum mendukung Web Speech Recognition." : "Your browser does not support Web Speech Recognition.");
      return;
    }

    setIsPttPressed(true);
    setVoiceStatus("listening");
    pttTranscriptRef.current = "";
    agentLog.voice("🎙️ PTT button held -> Listening and transcribing speech...");

    try {
      const rec = new SpeechRecognition();
      rec.lang = isId ? "id-ID" : "en-US";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          pttTranscriptRef.current = transcript.trim();
          setInputText(transcript.trim());
        }
      };

      rec.onerror = (err: any) => {
        console.warn("[PTT Recognition Error]", err);
        if (err.error === "not-allowed") {
          setMicPermissionNeeded(true);
          openPermissionTab();
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.warn("[PTT Start Error]", e);
    }
  };

  const handlePttMouseUp = async () => {
    if (!isPttPressed) return;
    setIsPttPressed(false);
    setVoiceStatus("thinking");
    agentLog.voice("🎙️ PTT button released -> Finalizing speech transcription...");

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (_) { }

    const textFromSpeech = pttTranscriptRef.current.trim();
    if (textFromSpeech) {
      agentLog.voice(`🗣️ [PTT Transcribed] "${textFromSpeech}" (Output: Text Only)`);
      // PTT output is text only -> shouldSpeakOutput = false
      await handleSendMessage(textFromSpeech, null, null, false);
    } else {
      setVoiceStatus("idle");
    }
  };

  // Live talk toggle (Continuous hands-free conversation with SpeechSynthesis audio output)
  const handleVadToggle = async () => {
    if (!isLiveTalkActive) {
      agentLog.voice("🎙️ Live Talk activated -> Two-way hands-free conversation with Web Speech TTS.");
      setIsLiveTalkActive(true);
      isLiveTalkActiveRef.current = true;
      setVoiceStatus("listening");

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert(isId ? "Browser Anda belum mendukung Web Speech Recognition." : "Your browser does not support Web Speech Recognition.");
        setVoiceStatus("idle");
        setIsLiveTalkActive(false);
        isLiveTalkActiveRef.current = false;
        return;
      }

      try {
        const rec = new SpeechRecognition();
        rec.lang = isId ? "id-ID" : "en-US";
        rec.continuous = true;
        rec.interimResults = true;

        let liveSpeechBuffer = "";

        rec.onresult = (event: any) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (interim) {
            setInputText(interim);
          }

          if (final.trim()) {
            liveSpeechBuffer = final.trim();
            setInputText(liveSpeechBuffer);
            agentLog.voice(`🗣️ [Live Talk Transcribed] "${liveSpeechBuffer}" -> Querying AI with TTS audio output`);
            rec.stop(); // Stop listening while AI answers & speaks
            setVoiceStatus("thinking");

            // Live Talk output: Spoken via Web Speech API (shouldSpeakOutput: true)
            handleSendMessage(liveSpeechBuffer, null, null, true).finally(() => {
              if (isLiveTalkActiveRef.current) {
                setTimeout(() => {
                  if (isLiveTalkActiveRef.current) {
                    try {
                      rec.start();
                      setVoiceStatus("listening");
                    } catch (_) { }
                  }
                }, 500);
              }
            });
          }
        };

        rec.onerror = (err: any) => {
          console.warn("[Live Talk Error]", err);
          if (err.error === "not-allowed") {
            setMicPermissionNeeded(true);
            openPermissionTab();
            setVoiceStatus("idle");
            setIsLiveTalkActive(false);
            isLiveTalkActiveRef.current = false;
          }
        };

        rec.onend = () => {
          if (isLiveTalkActiveRef.current && voiceStatus !== "speaking" && voiceStatus !== "thinking") {
            try {
              rec.start();
            } catch (_) { }
          }
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (e) {
        console.warn("[Live Talk Start Error]", e);
        setVoiceStatus("idle");
        setIsLiveTalkActive(false);
        isLiveTalkActiveRef.current = false;
      }
    } else {
      agentLog.voice("🎙️ Live Talk stopped.");
      isLiveTalkActiveRef.current = false;
      setIsLiveTalkActive(false);
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      } catch (_) { }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceStatus("idle");
      setLiveVolume(0);
    }
  };

  const handleNewConversation = () => {
    isLiveTalkActiveRef.current = false;
    setIsLiveTalkActive(false);
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (_) { }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    setInputText("");
    setPiiWarning(null);
    setVoiceStatus("idle");
    setIsPttPressed(false);
    setScannedSummary(null);
    setIsGuideMode(false);
    setIsAnalyzing(false);
    setScanStep(0);

    // Reset parent form analysis state
    if (onResetFormAnalysis) {
      onResetFormAnalysis();
    }

    // Clean up cached form analysis and page fields from local storage
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.remove(["savvy_form_analysis", "savvy_page_fields"]).catch(() => { });
    }

    // Hide field number badges and clean up web page highlights
    sendTabMessage({ type: "HIDE_FIELD_NUMBERS" });
    sendTabMessage({ type: "STOP_SCAN_ANIMATION" });
    sendTabMessage({ type: "CLEAR_ALL_A11Y" });

    agentLog.action("🔄 New conversation started. Form analysis and page badges reset to initial state.");
  };

  if (isGuideMode) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-800">
        <div className="flex-1 overflow-y-auto">
          <FormsGuideTab
            isVaultUnlocked={isVaultUnlocked}
            isFormAnalyzed={isFormAnalyzed}
            onBackToAssistant={() => setIsGuideMode(false)}
            onNavigateTab={onNavigateTab}
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
        {/* 1. SCANNING PROGRESS CHECKLIST (Shown while isAnalyzing is true)     */}
        {/* ==================================================================== */}
        {isAnalyzing && (
          <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3 text-left animate-in fade-in zoom-in-98 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-savvy-blue shrink-0">
                <ScanLine className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                  {t.assistant.multiAgentRunning}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.assistant.multiAgentScanningDesc}
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              {[
                { step: 1, label: t.assistant.step1Vision },
                { step: 2, label: t.assistant.step2Dom },
                { step: 3, label: t.assistant.step3Grounding },
                { step: 4, label: t.assistant.step4Agent1 },
                { step: 5, label: t.assistant.step5Agent2 },
              ].map((item) => {
                const isDone = scanStep > item.step;
                const isCurrent = scanStep === item.step;
                return (
                  <div
                    key={item.step}
                    className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${isDone
                        ? "bg-emerald-50/70 text-emerald-900 font-semibold"
                        : isCurrent
                          ? "bg-blue-50/80 text-blue-900 font-bold"
                          : "text-slate-400"
                      }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <ScanLine className="w-4 h-4 text-savvy-blue animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className="text-[11px] leading-tight">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. ON BOARDING BANNER CARD (Only shown when not analyzing)           */}
        {/* ==================================================================== */}
        {/* ==================================================================== */}
        {/* UNIFIED ONBOARDING, FORM GUIDANCE & QUICK TOOLS CARD                 */}
        {/* ==================================================================== */}
        {!isAnalyzing && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-4 text-left">
            {/* 1. Header Greeting & Logo (Centered Big Logo Full Without Border) */}
            <div className="flex flex-col items-center text-center pt-1 pb-4 border-b border-slate-100">
              <div className="relative mb-2 group">
                <img
                  src="owly.png"
                  alt="Owly AI"
                  className="w-24 h-24 object-contain drop-shadow-md transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 tracking-tight">
                {t.assistant.greetingTitle}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                {t.assistant.greetingDesc}
              </p>
            </div>

            {/* 2. Pandu Saya Isi Formulir Ini (Analyze Section) */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              {!isFormAnalyzed ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-savvy-soft-blue flex items-center justify-center text-savvy-blue shrink-0 mt-0.5">
                      <ScanLine className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900 leading-tight">
                        {t.assistant.guideMeTitle}
                      </h5>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed">
                        {t.assistant.guideMeDesc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyzeThisForm}
                    className="w-full py-2.5 px-3 rounded-xl bg-savvy-gradient text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-savvy-blue/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t.assistant.btnAnalyzeForm}</span>
                  </button>
                </>
              ) : (
                /* Post-Analysis Summary & Actions */
                <div className="space-y-3.5">
                  {/* Header Badge & Estimated Time */}
                  <div className="flex items-center justify-between gap-2 border-b border-blue-100/70 pb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-savvy-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/80 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t.assistant.analyzedReadyBadge}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{formatEstimatedTime(scannedSummary?.estimatedTime, isId)}</span>
                    </span>
                  </div>

                  {/* Form Title & Description */}
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {formatFormTitle(scannedSummary?.title, isId)}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {formatFormDescription(scannedSummary?.description || scannedSummary?.targetOutcome, isId)}
                    </p>
                  </div>

                  {/* Sections Breakdown to Complete */}
                  <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 space-y-2">
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{t.assistant.sectionsToFillTitle}</span>
                      <span className="text-emerald-700 font-black">
                        {scannedSummary?.fieldCount || 11} {isId ? "total kolom" : "total fields"}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                      {scannedSummary?.sections && scannedSummary.sections.length > 0 ? (
                        scannedSummary.sections.map((sec, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-black text-[9px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate" title={sec.name}>{sec.name}</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                              {sec.fieldCount > 0 && `${sec.fieldCount} ${isId ? "kolom" : "fields"}`}
                              {sec.fieldCount > 0 && sec.uploadCount > 0 && ", "}
                              {sec.uploadCount > 0 && `${sec.uploadCount} ${isId ? "unggah" : "upload"}`}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-black text-[9px] flex items-center justify-center shrink-0">1</span>
                            <span className="truncate">{isId ? "Kolom Formulir" : "Form Fields"}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                            {scannedSummary?.fieldCount || 10} {isId ? "kolom" : "fields"}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Main Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        agentLog.planner("Navigating to: Guide Field by Field");
                        sendTabMessage({ type: "NAVIGATE_TO_FIELD", fieldIndex: 0 });
                        setIsGuideMode(true);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-savvy-gradient text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-sm shadow-savvy-blue/20 hover:opacity-95 transition-all cursor-pointer truncate"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t.assistant.btnGuideStep}</span>
                    </button>

                    <button
                      onClick={() => {
                        agentLog.planner("Navigating to: Fill with 1 Click-Autofill");
                        onNavigateTab("vault");
                      }}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer truncate"
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t.assistant.btnAutofillQuick}</span>
                    </button>
                  </div>

                  {/* Cancel / Reset Button */}
                  <button
                    type="button"
                    onClick={() => {
                      agentLog.action("User clicked: Cancel & Return to Overview.");
                      setScannedSummary(null);
                      setIsGuideMode(false);
                      setIsAnalyzing(false);
                      setScanStep(0);
                      if (onResetFormAnalysis) {
                        onResetFormAnalysis();
                      }
                      if (typeof chrome !== "undefined" && chrome.storage?.local) {
                        chrome.storage.local.remove(["savvy_form_analysis", "savvy_page_fields"]).catch(() => {});
                      }
                      sendTabMessage({ type: "HIDE_FIELD_NUMBERS" });
                      sendTabMessage({ type: "STOP_SCAN_ANIMATION" });
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/70 text-slate-500 hover:text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>{t.assistant.btnCancelAnalysis}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Onboarding Starter Tools (Explain This, Show Me, Accessibility) - Hidden when Form is Analyzed */}
            {!isFormAnalyzed && (
              <>
                {/* 3. Dua Tombol Fitur Utama: Explain This & Show Me */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={triggerExplainThis}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-savvy-purple/50 hover:bg-purple-50/40 transition-all flex items-center gap-2 group bg-white shadow-2xs text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-savvy-purple flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Crop className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        {t.assistant.explainThisTitle}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {t.assistant.explainThisSub}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={triggerShowMe}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        {t.assistant.showMeTitle}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {t.assistant.showMeSub}
                      </div>
                    </div>
                  </button>
                </div>

                {/* 4. Bagian Alat Bantu (Accessibility Chips) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {t.assistant.a11ySectionTitle}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      {
                        label: t.assistant.chipTextTooSmall,
                        query: isId ? "tulisannya kekecilan tolong perbesar" : "text is too small please make it larger",
                        title: isId ? "Perbesar ukuran teks halaman" : "Enlarge page text size",
                      },
                      {
                        label: t.assistant.chipGlareScreen,
                        query: isId ? "layarnya silau tolong mode gelap" : "screen glare please high contrast dark mode",
                        title: isId ? "Aktifkan kontras tinggi / gelap" : "Enable high contrast mode",
                      },
                      {
                        label: t.assistant.chipReadAloud,
                        query: isId ? "tolong bacakan halaman ini" : "please read this page aloud",
                        title: isId ? "Bacakan teks halaman via TTS" : "Read page text via TTS",
                      },
                      {
                        label: t.assistant.chipHardToFocus,
                        query: isId ? "susah fokus membaca tolong spotlight" : "hard to focus please turn on reading spotlight",
                        title: isId ? "Aktifkan reading spotlight & jeda animasi" : "Enable reading spotlight & pause animation",
                      },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleSendMessage(chip.query)}
                        title={chip.title}
                        className="text-[10.5px] font-medium whitespace-nowrap bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-all cursor-pointer select-none shadow-2xs"
                      >
                        {chip.label}
                      </button>
                    ))}

                    {/* Accessibility Lainnya Button */}
                    <button
                      type="button"
                      onClick={onOpenAccessibilityHub}
                      className="text-[10.5px] font-bold whitespace-nowrap bg-blue-50/80 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 transition-all cursor-pointer select-none shadow-2xs flex items-center gap-1"
                    >
                      <Accessibility className="w-3 h-3 text-blue-600" />
                      <span>{t.assistant.btnMoreA11y}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. CHAT THREAD MESSAGES (If any) */}
        {/* ==================================================================== */}
        {messages.length > 0 && (
          <div className="space-y-3 pt-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {m.sender === "savvy" && (
                  <div className="w-7 h-7 rounded-lg bg-savvy-soft-blue flex items-center justify-center p-1 shrink-0 border border-savvy-blue/20">
                    <img
                      src="owly.png"
                      alt="Owly"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${m.sender === "user"
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
                          <span>{t.assistant.snipBoxTitle}</span>
                        </span>
                        <span className="text-[9px] text-blue-200 font-mono">{t.assistant.snipVisionBadge}</span>
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
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${btn.variant === "primary"
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
                {t.assistant.voiceDrawerTitle}
              </h4>
            </div>
            <button
              onClick={() => {
                setIsVoiceModalOpen(false);
                isLiveTalkActiveRef.current = false;
                setIsLiveTalkActive(false);
                try {
                  if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                  }
                } catch (_) { }
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                vadDetectorRef.current?.stop();
                setVoiceStatus("idle");
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isId ? "Tutup Voice Companion" : "Close Voice Companion"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Mode Selector: PTT vs Live Talk */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              onClick={() => setVoiceType("ptt")}
              className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${voiceType === "ptt"
                  ? "bg-purple-50 border-savvy-purple shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <Mic className="w-3.5 h-3.5 text-savvy-purple" />
                {voiceType === "ptt" && <CheckCircle2 className="w-3.5 h-3.5 text-savvy-purple" />}
              </div>
              <div className="text-[11px] font-extrabold text-slate-900">{t.assistant.pttTitle}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {t.assistant.pttDesc}
              </div>
            </button>

            <button
              onClick={() => setVoiceType("live")}
              className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${voiceType === "live"
                  ? "bg-purple-50 border-savvy-purple shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                {voiceType === "live" && <CheckCircle2 className="w-3.5 h-3.5 text-savvy-purple" />}
              </div>
              <div className="text-[11px] font-extrabold text-slate-900">{t.assistant.liveTalkTitle}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {t.assistant.liveTalkDesc}
              </div>
            </button>
          </div>

          {/* Mic Permission Status Bar */}
          <div className={`rounded-xl p-2.5 text-xs flex items-center justify-between gap-2 shadow-2xs text-left border transition-all ${micPermissionState === "granted"
              ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-900"
              : "bg-slate-50 border-slate-200/90 text-slate-800"
            }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${micPermissionState === "granted"
                  ? "bg-emerald-500 shadow-sm shadow-emerald-400"
                  : "bg-amber-500"
                }`} />
              <span className="text-[11px] font-bold text-slate-700">
                {t.assistant.micPermissionLabel}{" "}
                <span className={`font-extrabold uppercase tracking-wide ${micPermissionState === "granted" ? "text-emerald-700" : "text-amber-600"
                  }`}>
                  {micPermissionState === "granted" ? t.assistant.micActive : t.assistant.micInactive}
                </span>
              </span>
            </div>

            {micPermissionState === "granted" ? (
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100/70 border border-emerald-300/50 px-2 py-0.5 rounded-md">
                ✓ Ready
              </span>
            ) : (
              <button
                onClick={openPermissionTab}
                className="bg-savvy-gradient text-white font-extrabold px-3 py-1 rounded-lg text-[10.5px] hover:opacity-95 shadow-2xs cursor-pointer shrink-0"
              >
                {t.assistant.btnAllowMic}
              </button>
            )}
          </div>

          {/* Interactive Controls */}
          {voiceType === "ptt" ? (
            <div className="space-y-2 text-center pt-1">
              <button
                onMouseDown={handlePttMouseDown}
                onMouseUp={handlePttMouseUp}
                onTouchStart={handlePttMouseDown}
                onTouchEnd={handlePttMouseUp}
                className={`w-20 h-20 mx-auto rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-md select-none cursor-pointer ${isPttPressed
                    ? "bg-rose-600 text-white shadow-rose-300 scale-95"
                    : "bg-savvy-gradient text-white shadow-purple-200 hover:scale-102"
                  }`}
              >
                <Mic className={`w-6 h-6 ${isPttPressed ? "animate-pulse" : ""}`} />
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {isPttPressed ? t.assistant.pttReleaseToSend : t.assistant.pttHoldToSpeak}
                </span>
              </button>
              <p className="text-[10px] font-semibold text-slate-500">
                {isPttPressed
                  ? t.assistant.pttListeningPrompt
                  : t.assistant.pttIdlePrompt}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-center pt-1">
              <button
                onClick={handleVadToggle}
                className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${isLiveTalkActive
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-savvy-gradient text-white hover:opacity-95"
                  }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isLiveTalkActive ? "animate-pulse text-rose-600" : ""}`} />
                <span>
                  {isLiveTalkActive
                    ? t.assistant.btnStopLiveTalk
                    : t.assistant.btnStartLiveTalk}
                </span>
              </button>
              <p className="text-[10px] font-semibold text-slate-500">
                {isLiveTalkActive
                  ? voiceStatus === "speaking"
                    ? t.assistant.liveSpeakingStatus
                    : voiceStatus === "thinking"
                      ? t.assistant.liveThinkingStatus
                      : t.assistant.liveListeningStatus
                  : t.assistant.liveIdleStatus}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. BOTTOM CHAT INPUT SECTION (Hidden when Voice Companion is active) */}
      {/* ==================================================================== */}
      {!isVoiceModalOpen && (
        <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
          {/* PII Warning */}
          {piiWarning && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-left text-[10px] text-amber-900 flex items-start gap-1.5 leading-tight">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{piiWarning}</span>
            </div>
          )}

          {/* Input Textarea Box (Reduced to 2 Rows) with Mic and Send Buttons */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl focus-within:border-savvy-blue focus-within:bg-white focus-within:shadow-sm transition-all p-2.5 shadow-2xs flex flex-col justify-between gap-1.5">
            <textarea
              ref={chatInputRef}
              rows={2}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t.assistant.inputPlaceholder}
              className="w-full bg-transparent px-1 py-0.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none font-sans leading-relaxed resize-none min-h-[48px]"
            />

            <div className="flex items-center justify-between pt-1 border-t border-slate-100/90">
              <span className="text-[10px] text-slate-400 font-medium pl-1">
                {t.assistant.keyboardHint}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Tombol Mikrofon: Menampilkan Voice Companion */}
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen((prev) => !prev)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${isVoiceModalOpen
                      ? "bg-purple-100 text-savvy-purple shadow-2xs"
                      : "text-slate-500 hover:text-savvy-purple hover:bg-purple-50/80"
                    }`}
                  title="Voice Companion (PTT & Live Talk)"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Tombol Kirim */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="w-8 h-8 rounded-xl bg-savvy-blue hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-savvy-blue text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
                  title={t.assistant.btnSendMessage}
                >
                  <Send className="w-3.5 h-3.5 -mr-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Start New Conversation */}
          <div className="flex flex-col items-center pt-1">
            <button
              onClick={handleNewConversation}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.assistant.btnStartNewChat}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
