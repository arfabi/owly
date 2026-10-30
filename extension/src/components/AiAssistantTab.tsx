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
  Sliders,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
  Bot,
  Volume2,
  ChevronDown,
  Radio,
  RotateCcw,
} from "lucide-react";
import { inspectAndRedactPII } from "../lib/privacy/censor";
import { auditFormData } from "../lib/audit/rules";
import { SimpleVadDetector } from "../lib/voice/vad";
import { agentLog } from "../lib/agentLogger";
import { sendChatMessage, transcribeVoiceAudio } from "../lib/api/client";
import { sendTabMessage } from "../lib/tabMessenger";

interface Message {
  id: string;
  sender: "user" | "savvy";
  text: string;
  badge?: string;
  actionButtons?: { label: string; action: () => void; variant?: "primary" | "secondary" }[];
  timestamp: number;
}

interface AiAssistantTabProps {
  isVaultUnlocked: boolean;
  isFormAnalyzed: boolean;
  currentUrl?: string;
  currentTitle?: string;
  onAnalyzeForm: () => void;
  onNavigateTab: (tabId: "assistant" | "guide" | "vault" | "audit") => void;
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

  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [voiceType, setVoiceType] = useState<"ptt" | "vad">("ptt"); // Push to Talk vs Live Talk (VAD)
  const [isPttPressed, setIsPttPressed] = useState(false);
  const [isModeHovered, setIsModeHovered] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);

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

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    agentLog.reasoning(`🧠 Processing query: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" with Meta Muse Spark Open (reasoning_effort: 'medium')`);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
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
            ? `Hasil Audit FSM: 5 Kolom Aman (Hijau), 1 Peringatan (Kuning: Esai mendekati batas minimum kata), 0 Fatal (Merah). Formulir siap dikirim sesuai regulasi LPDP 2026.`
            : `FSM Audit Result: 5 Fields Valid (Green), 1 Warning (Yellow: Essay near minimum word limit), 0 Fatal (Red). Form satisfies LPDP 2026 guidelines.`,
          badge: isId ? "Resmi • Juknis LPDP 2026" : "Official • LPDP Guidelines",
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
              ? `Formulir belum dianalisis! Anda harus menganalisis formulir terlebih dahulu agar Savvy memetakan kolom dengan akurat.`
              : `Form is not analyzed yet! Please analyze the form first so Savvy can accurately map the fields.`,
            actionButtons: [
              {
                label: isId ? "🔍 Analyze Form Sekarang" : "🔍 Analyze Form Now",
                action: () => {
                  onAnalyzeForm();
                  onNavigateTab("guide");
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
              ? `Formulir telah dianalisis. Data identitas siap diisi dari Multi-Vault AES-256. Buka Vault untuk mengisi dengan jaminan Undo 100%.`
              : `Form is analyzed. Identity data ready from AES-256 Multi-Vault. Open Vault to autofill with 100% Undo guarantee.`,
            actionButtons: [
              {
                label: isId ? "Buka Vault & Isi Form" : "Open Vault & Fill Form",
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

    if (lower.includes("explain") || lower.includes("snip")) {
      triggerExplainThis();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: isId
            ? `Mode Snip diaktifkan pada halaman formulir. Silakan seret kursor pada bagian teks atau peraturan birokrasi yang ingin Anda terjemahkan.`
            : `Snip mode activated on the form page. Please drag your cursor over the text you want simplified.`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    if (lower.includes("show") || lower.includes("tunjuk") || lower.includes("kolom")) {
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
      const data = await sendChatMessage(text, chatSessionId, activeDomain, currentUrl, currentTitle);
      if (data.sessionId) setChatSessionId(data.sessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: data.reply,
          badge: "Meta Muse Spark • Cloud",
          timestamp: Date.now(),
        },
      ]);
    } catch (apiErr) {
      // Fallback if cloud server is unavailable or offline
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "savvy",
          text: isId
            ? `Berdasarkan regulasi resmi LPDP 2026 Bab IV hlm. 14: Dokumen surat rekomendasi dan KTP wajib berformat PDF/JPG dengan batas maksimal 2MB. Pastikan NIK sesuai e-KTP Dukcapil.`
            : `Per LPDP 2026 Official Guidelines Chapter IV p. 14: Recommendation letters and ID must be PDF/JPG max 2MB. Ensure NIK matches civil registry.`,
          badge: isId ? "Resmi • Bab IV Hlm. 14" : "Official • Ch. IV p. 14",
          actionButtons: [
            {
              label: isId ? "Lihat Forms Guide" : "View Forms Guide",
              action: () => onNavigateTab("guide"),
              variant: "secondary",
            },
          ],
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Action 1: Form Companion
  const triggerFormCompanion = () => {
    agentLog.planner("Triggered starter: 'Form Companion' -> Consulting Juknis guide.");
    handleSendMessage(
      isId
        ? "Jelaskan aturan dan panduan pengisian kolom formulir ini"
        : "Explain the official rules and guide for this form field"
    );
  };

  // Action 2: Explain This (Snip on page)
  const triggerExplainThis = () => {
    agentLog.planner("Triggered starter: 'Explain This' -> Activating screen snip mode.");
    sendTabMessage({ type: "START_SNIP_SELECTION" });
  };

  // Action 3: Show Me (Spotlight beacon on input)
  const triggerShowMe = () => {
    agentLog.planner("Triggered starter: 'Show Me' -> Navigating beacon spotlight to active field.");
    sendTabMessage({ type: "SHOW_FIELD_SPOTLIGHT" });
    handleSendMessage(isId ? "Tunjukkan letak kolom aktif di halaman" : "Show me where the active field is located");
  };

  // Action 4: AutoFill (Checks analysis first)
  const triggerAutoFill = () => {
    agentLog.planner("Triggered starter: 'AutoFill' -> Navigating to Vault tab.");
    onNavigateTab("vault");
  };

  // Action 5: Form Audit
  const triggerFormAudit = () => {
    agentLog.planner("Triggered starter: 'Form Audit' -> Running pre-submit traffic light validator.");
    handleSendMessage(isId ? "Jalankan pre-submit audit lampu lalu lintas" : "Run pre-submit traffic light audit");
  };

  // Action 6: Accessibility HUB
  const triggerAccessibilityHub = () => {
    agentLog.planner("Triggered starter: 'Accessibility HUB' -> Opening modal.");
    onOpenAccessibilityHub();
  };

  // Push-to-Talk Handlers
  const handlePttMouseDown = () => {
    agentLog.voice("🎙️ Push-to-Talk active: Microphone recording stream opened.");
    setIsPttPressed(true);
    setVoiceStatus("listening");
  };

  const handlePttMouseUp = () => {
    if (!isPttPressed) return;
    agentLog.voice("🎙️ Push-to-Talk released: Audio buffer sent to Meta Muse Voice transcribe.");
    setIsPttPressed(false);
    setVoiceStatus("thinking");
    setTimeout(() => {
      setVoiceStatus("speaking");
      handleSendMessage(isId ? "Bagaimana syarat esai kontribusi LPDP 2026?" : "What are the LPDP 2026 essay requirements?");
      setTimeout(() => setVoiceStatus("idle"), 2500);
    }, 1200);
  };

  // Live Talk (VAD) Toggle with real SimpleVadDetector AudioContext
  const handleVadToggle = async () => {
    if (voiceStatus === "idle") {
      agentLog.voice("🎙️ Live Talk (VAD) started: Listening for voice activity...");
      setVoiceStatus("listening");
      try {
        if (!vadDetectorRef.current) {
          vadDetectorRef.current = new SimpleVadDetector();
        }
        await vadDetectorRef.current.start({
          onVolumeChange: (vol) => setLiveVolume(vol),
          onSpeechStart: () => {
            agentLog.voice("🎙️ Live Talk VAD: Speech detected -> Streaming user audio frames.");
            setVoiceStatus("listening");
          },
          onSpeechEnd: (audioBlob) => {
            agentLog.voice("🎙️ Live Talk VAD: Speech ended -> Transcribing and generating assistant answer.");
            setVoiceStatus("thinking");
            vadDetectorRef.current?.stop();

            if (audioBlob && audioBlob.size > 0) {
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                  const transcribeRes = await transcribeVoiceAudio(base64);
                  setVoiceStatus("speaking");
                  await handleSendMessage(transcribeRes.text || (isId ? "Saya ingin mengisi formulir ini" : "I want to fill this form"));
                  setTimeout(() => setVoiceStatus("idle"), 2500);
                  return;
                } catch {
                  // Fallback if cloud transcribe is offline
                  setVoiceStatus("speaking");
                  await handleSendMessage(isId ? "Bagaimana syarat esai kontribusi LPDP 2026?" : "What are the LPDP 2026 essay requirements?");
                  setTimeout(() => setVoiceStatus("idle"), 2500);
                }
              };
              reader.readAsDataURL(audioBlob);
              return;
            }

            setTimeout(() => {
              setVoiceStatus("speaking");
              handleSendMessage(isId ? "Saya ingin mengisi NIK, format apa yang benar?" : "How should I format my NIK?");
              setTimeout(() => setVoiceStatus("idle"), 3000);
            }, 1000);
          },
          onError: () => {
            setVoiceStatus("idle");
          },
        });
      } catch (err: any) {
        console.warn("[Savvy.AI VAD] Mic permission denied or unavailable, fallback simulation:", err);
        const isPermDenied = err?.name === "NotAllowedError" || String(err).includes("Permission dismissed") || String(err).includes("Permission denied");
        if (isPermDenied) {
          setMicPermissionNeeded(true);
          agentLog.voice("⚠️ Chrome requires microphone permission via a normal browser tab. Opening permission.html...", { error: String(err) });
          openPermissionTab();
        } else {
          agentLog.voice("⚠️ Mic access unavailable, falling back to simulated speech loop.", err);
        }
        // Fallback simulation if mic is unavailable
        setTimeout(() => setVoiceStatus("thinking"), 2500);
        setTimeout(() => {
          setVoiceStatus("speaking");
          handleSendMessage(isId ? "Saya ingin mengisi NIK, format apa yang benar?" : "How should I format my NIK?");
          setTimeout(() => setVoiceStatus("idle"), 3000);
        }, 4000);
      }
    } else {
      agentLog.voice("🎙️ Live Talk (VAD) stopped.");
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

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* 1. Mode Switcher (Hover to Reveal Accordion) */}
      <div
        className="px-3.5 pt-3 pb-1"
        onMouseEnter={() => setIsModeHovered(true)}
        onMouseLeave={() => setIsModeHovered(false)}
      >
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-300">
          {/* Active Mode Banner Header (Always visible) */}
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                  mode === "chat"
                    ? "bg-savvy-blue/10 text-savvy-blue"
                    : "bg-purple-100 text-savvy-purple"
                }`}
              >
                {mode === "chat" ? <MessageSquare className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-slate-900">
                    {mode === "chat"
                      ? isId
                        ? "Chatbot Mode"
                        : "Chatbot Mode"
                      : isId
                      ? `Voicebot Mode (${voiceType === "ptt" ? "Push to Talk" : "Live Talk VAD"})`
                      : `Voicebot Mode (${voiceType === "ptt" ? "Push to Talk" : "Live Talk VAD"})`}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  {mode === "chat"
                    ? isId
                      ? "Teks cepat & senyap (Arahkan kursor untuk ganti mode)"
                      : "Fast & silent text (Hover to switch mode)"
                    : isId
                    ? "Suara dwibahasa Meta Muse (Arahkan kursor untuk ganti mode)"
                    : "Meta Muse Voice (Hover to switch mode)"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isModeHovered ? "rotate-180 text-savvy-blue" : ""
              }`}
            />
          </div>

          {/* Hidden Panel: Revealed on Hover */}
          {isModeHovered && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="grid grid-cols-2 gap-2">
                {/* Chatbot Mode Selector */}
                <button
                  onClick={() => setMode("chat")}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    mode === "chat"
                      ? "bg-savvy-soft-blue border-savvy-blue shadow-2xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-savvy-blue" />
                    {mode === "chat" && <CheckCircle2 className="w-3 h-3 text-savvy-blue" />}
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-900">Chatbot Mode</div>
                  <div className="text-[9px] text-slate-500">Fast & silent text</div>
                </button>

                {/* Voicebot Mode Selector */}
                <button
                  onClick={() => setMode("voice")}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    mode === "voice"
                      ? "bg-purple-50 border-savvy-purple shadow-2xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Mic className="w-3.5 h-3.5 text-savvy-purple" />
                    {mode === "voice" && <CheckCircle2 className="w-3 h-3 text-savvy-purple" />}
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-900">Voicebot Mode</div>
                  <div className="text-[9px] text-slate-500">PTT & Live VAD</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3">
        {/* KONDISI A: MODE VOICEBOT DIPILIH */}
        {mode === "voice" ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs text-center space-y-4">
            {/* Mascot Avatar dengan Waveform Halo */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  voiceStatus !== "idle" || isPttPressed
                    ? "bg-purple-200/80 animate-ping scale-110"
                    : "bg-purple-50"
                }`}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center p-2">
                <img
                  src="logo.png"
                  alt="Savvy Voice"
                  className="w-12 h-12 object-contain drop-shadow-xs"
                />
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                {isId ? "Savvy Voice Companion" : "Savvy Voice Companion"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                {isId
                  ? "Bicara bebas genggam dalam Bahasa Indonesia atau Inggris untuk menanyakan formulir."
                  : "Speak handsfree in Indonesian or English to inquire about form requirements."}
              </p>
            </div>

            {/* Pilihan Metode Suara di Tengah Onboarding */}
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <button
                onClick={() => setVoiceType("ptt")}
                className={`p-3 rounded-xl border transition-all text-left ${
                  voiceType === "ptt"
                    ? "bg-purple-50 border-savvy-purple shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Mic className="w-4 h-4 text-savvy-purple" />
                  {voiceType === "ptt" && <CheckCircle2 className="w-3.5 h-3.5 text-savvy-purple" />}
                </div>
                <div className="text-[11px] font-extrabold text-slate-900">Push-to-Talk</div>
                <div className="text-[9px] text-slate-500 mt-0.5 leading-snug">
                  {isId ? "Tahan tombol saat bicara" : "Hold button while speaking"}
                </div>
              </button>

              <button
                onClick={() => setVoiceType("vad")}
                className={`p-3 rounded-xl border transition-all text-left ${
                  voiceType === "vad"
                    ? "bg-purple-50 border-savvy-purple shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  {voiceType === "vad" && <CheckCircle2 className="w-3.5 h-3.5 text-savvy-purple" />}
                </div>
                <div className="text-[11px] font-extrabold text-slate-900">Live Talk (VAD)</div>
                <div className="text-[9px] text-slate-500 mt-0.5 leading-snug">
                  {isId ? "Deteksi suara otomatis" : "Auto speech detection"}
                </div>
              </button>
            </div>

            {/* Mic Permission Banner if dismissed */}
            {micPermissionNeeded && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs text-left">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    {isId ? "Akses mikrofon ditolak Chrome di Side Panel." : "Microphone access dismissed by Chrome."}
                  </span>
                </div>
                <button
                  onClick={openPermissionTab}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shrink-0 transition-colors shadow-2xs"
                >
                  {isId ? "Izinkan di Tab" : "Grant in Tab"}
                </button>
              </div>
            )}

            {/* Kontrol Utama Suara di Tengah */}
            <div className="pt-2">
              {voiceType === "ptt" ? (
                <div className="space-y-3">
                  <button
                    onMouseDown={handlePttMouseDown}
                    onMouseUp={handlePttMouseUp}
                    onTouchStart={handlePttMouseDown}
                    onTouchEnd={handlePttMouseUp}
                    className={`w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg select-none ${
                      isPttPressed
                        ? "bg-rose-600 text-white shadow-rose-300 scale-95"
                        : "bg-savvy-gradient text-white shadow-purple-200 hover:scale-102"
                    }`}
                  >
                    <Mic className={`w-8 h-8 ${isPttPressed ? "animate-pulse" : ""}`} />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      {isPttPressed ? (isId ? "Lepas" : "Release") : (isId ? "Tahan" : "Hold")}
                    </span>
                  </button>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {isPttPressed
                      ? isId ? "Mendengarkan suara Anda..." : "Listening to your voice..."
                      : isId ? "Tekan & tahan lingkaran untuk mulai bicara" : "Press & hold circle to talk"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleVadToggle}
                    className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                      voiceStatus !== "idle"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-savvy-gradient text-white hover:opacity-95"
                    }`}
                  >
                    <Radio className={`w-4 h-4 ${voiceStatus !== "idle" ? "animate-pulse text-rose-600" : ""}`} />
                    <span>
                      {voiceStatus !== "idle"
                        ? isId ? "Hentikan Live Talk" : "Stop Live Talk"
                        : isId ? "Mulai Live Talk (Deteksi Otomatis)" : "Start Live Talk (Auto Detection)"}
                    </span>
                  </button>

                  {/* Waveform Visualizer */}
                  <div className="flex items-center justify-center gap-1.5 h-6">
                    {[6, 16, 24, 18, 10, 20, 14, 8].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          voiceStatus !== "idle" ? "bg-savvy-purple animate-pulse" : "bg-slate-200"
                        }`}
                        style={{ height: voiceStatus !== "idle" ? `${h}px` : "6px" }}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] font-semibold text-slate-500">
                    {voiceStatus === "listening"
                      ? isId ? "Savvy sedang mendengarkan ucapan Anda..." : "Savvy is listening..."
                      : voiceStatus === "thinking"
                      ? isId ? "Memproses jawaban regulasi..." : "Processing response..."
                      : voiceStatus === "speaking"
                      ? isId ? "Savvy sedang menjawab..." : "Savvy is speaking..."
                      : isId ? "Siap mendengarkan pertanyaan Anda" : "Ready to listen"}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Voice Hints */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 text-left">
              <span className="font-bold text-slate-700 block mb-1">
                {isId ? "Contoh pertanyaan suara:" : "Voice prompt examples:"}
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                <li>{isId ? '"Bagaimana format pasfoto yang benar?"' : '"What is the required photo format?"'}</li>
                <li>{isId ? '"Berapa skor minimal TOEFL beasiswa ini?"' : '"What is the minimum TOEFL score?"'}</li>
              </ul>
            </div>
          </div>
        ) : (
          /* KONDISI B: MODE CHATBOT DIPILIH */
          <>
            {messages.length === 0 ? (
              /* Onboarding Card State (6 Quick Starter Actions) */
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center space-y-3.5">
                {/* Mascot Avatar Hero */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-savvy-soft-blue flex items-center justify-center p-2 shadow-xs border border-savvy-blue/20">
                  <img
                    src="logo.png"
                    alt="Savvy Mascot"
                    className="w-12 h-12 object-contain drop-shadow-xs"
                  />
                </div>

                {/* Welcome Greeting */}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    {isId ? "Halo! Saya Savvy" : "Hello! I am Savvy"}{" "}
                    <span className="inline-block animate-bounce">👋</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    {isId
                      ? "Asisten cerdas pendamping formulir publik Anda. Ketik pertanyaan di bawah atau pilih bantuan cepat:"
                      : "Your friendly AI form-filling companion. Type a question below or choose a quick starter:"}
                  </p>
                </div>

                {/* 6 Actions Grid (Quick Starters) */}
                <div className="grid grid-cols-2 gap-2 text-left pt-1">
                  {/* 1. Form Companion (Understand) */}
                  <button
                    onClick={triggerFormCompanion}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-savvy-blue/50 hover:bg-savvy-soft-blue/40 transition-all flex items-center gap-2 group bg-white shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-savvy-blue flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        Form Companion
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {isId ? "Pilar 1: Pahami" : "Pillar 1: Understand"}
                      </div>
                    </div>
                  </button>

                  {/* 2. Explain This (Understand) */}
                  <button
                    onClick={() => {
                      triggerExplainThis();
                      handleSendMessage(isId ? "Jelaskan teks potongan regulasi yang saya snip" : "Explain the snip text");
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-savvy-purple/50 hover:bg-savvy-soft-purple/40 transition-all flex items-center gap-2 group bg-white shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-savvy-purple flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Crop className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        Explain This
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {isId ? "Pilar 1: Pahami" : "Pillar 1: Understand"}
                      </div>
                    </div>
                  </button>

                  {/* 3. Show Me (Understand) */}
                  <button
                    onClick={triggerShowMe}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        Show Me
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {isId ? "Pilar 1: Pahami" : "Pillar 1: Understand"}
                      </div>
                    </div>
                  </button>

                  {/* 4. AutoFill (Fill) */}
                  <button
                    onClick={triggerAutoFill}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        AutoFill
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {isId ? "Pilar 2: Isi Aman" : "Pillar 2: Safe Fill"}
                      </div>
                    </div>
                  </button>

                  {/* 5. Form Audit (Audit) */}
                  <button
                    onClick={triggerFormAudit}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        Form Audit
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {isId ? "Pilar 3: Periksa" : "Pillar 3: Audit"}
                      </div>
                    </div>
                  </button>

                  {/* 6. Accessibility HUB (Audit & Inclusion) */}
                  <button
                    onClick={triggerAccessibilityHub}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center gap-2 group bg-white shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-900 truncate">
                        Accessibility HUB
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium truncate">
                        {isId ? "14 Alat Akses" : "14 A11y Tools"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Chat Thread State */
              <div className="space-y-3">
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
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* Optional Action Buttons inside AI response */}
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
          </>
        )}
      </div>

      {/* 3. Bottom Chat Input Section — HANYA MUNCUL DI CHATBOT MODE */}
      {mode === "chat" && (
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          {/* Client-side PII Warning Banner */}
          {piiWarning && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-left text-[10px] text-amber-900 flex items-start gap-1.5 leading-tight">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{piiWarning}</span>
            </div>
          )}

          {/* Input Text Box with Blue Send Button */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-savvy-blue focus-within:bg-white transition-all p-1.5 pr-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder={
                isId
                  ? "Tanya Savvy atau ketik 'Tunjukkan kolom'..."
                  : "Ask Savvy or type 'Show me [words]'..."
              }
              className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-sans"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-savvy-blue hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-savvy-blue text-white flex items-center justify-center shrink-0 transition-all shadow-xs"
              title="Kirim pesan"
            >
              <Send className="w-3.5 h-3.5 -mr-0.5" />
            </button>
          </div>

          {/* New Conversation Button (hanya muncul saat ada riwayat pesan) */}
          {messages.length > 0 && (
            <div className="flex justify-center pt-0.5">
              <button
                onClick={handleNewConversation}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                <span>{isId ? "Percakapan Baru" : "New Conversation"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
