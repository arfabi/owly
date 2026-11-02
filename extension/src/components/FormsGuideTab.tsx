import React, { useState, useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { agentLog } from "../lib/agentLogger";
import { sendTabMessage } from "../lib/tabMessenger";
import { fetchFieldCoachGuidance } from "../lib/api/client";

interface FieldItem {
  id: string;
  name: string;
  label: string;
  localizedLabel?: string;
  badgeType: "official" | "curated" | "ai";
  badgeLabel?: string;
  meaning: string;
  howTo: string;
  example: string;
  pitfall: string;
  vaultKey?: "nik" | "nama" | "tempat_lahir" | "tanggal_lahir" | "alamat" | "email" | "no_hp";
  fallbackValue?: string;
  type?: string;
}

// Maps any raw DOM element into a clean, dynamic FieldItem with smart vault binding
export function mapRawFieldToItem(raw: any, isId: boolean): FieldItem {
  const label = (raw.label || raw.name || raw.id || "Field").trim();
  const lower = `${label} ${raw.name || ""} ${raw.id || ""}`.toLowerCase();

  let vaultKey: "nik" | "nama" | "tempat_lahir" | "tanggal_lahir" | "alamat" | "email" | "no_hp" | undefined = undefined;
  let fallbackValue = "";

  if (lower.includes("nik") || lower.includes("identitas") || lower.includes("ktp") || lower.includes("national id")) {
    vaultKey = "nik";
  } else if (lower.includes("nama") || lower.includes("name") || lower.includes("fullname")) {
    vaultKey = "nama";
  } else if (
    lower.includes("tempat lahir") ||
    lower.includes("place of birth") ||
    lower.includes("birth place") ||
    lower.includes("birthplace") ||
    lower.includes("pob") ||
    (lower.includes("tempat") && !lower.includes("tinggal"))
  ) {
    vaultKey = "tempat_lahir";
  } else if (
    lower.includes("tanggal lahir") ||
    lower.includes("date of birth") ||
    lower.includes("birth date") ||
    lower.includes("birthdate") ||
    lower.includes("dob") ||
    raw.type === "date" ||
    lower.includes("lahir") ||
    lower.includes("birth")
  ) {
    vaultKey = "tanggal_lahir";
  } else if (
    lower.includes("email") ||
    lower.includes("surel") ||
    lower.includes("e-mail") ||
    lower.includes("mail") ||
    raw.type === "email"
  ) {
    // CRITICAL: EMAIL CHECK RUNS BEFORE ALAMAT/ADDRESS
    vaultKey = "email";
  } else if (
    (lower.includes("alamat") || lower.includes("address") || lower.includes("domisili") || lower.includes("tinggal")) &&
    !lower.includes("email") &&
    !lower.includes("surel") &&
    !lower.includes("mail") &&
    raw.type !== "email"
  ) {
    vaultKey = "alamat";
  } else if (lower.includes("telepon") || lower.includes("phone") || lower.includes("hp") || lower.includes("whatsapp")) {
    vaultKey = "no_hp";
  }

  return {
    id: raw.id || raw.name || "field",
    name: raw.name || raw.id || "field",
    label: label,
    localizedLabel: label,
    badgeType: "ai",
    badgeLabel: "✨ Meta AI Guidance",
    meaning: isId ? `Memuat analisis resmi untuk ${label}...` : `Loading official guidance for ${label}...`,
    howTo: isId ? `Memuat instruksi pengisian dari Meta Muse Spark Open...` : `Loading step-by-step instructions from Meta Muse Spark Open...`,
    example: isId ? `Memuat contoh format...` : `Loading valid example format...`,
    pitfall: isId ? `Menganalisis potensi jebakan administrasi...` : `Analyzing common disqualification pitfalls...`,
    vaultKey,
    fallbackValue,
    type: raw.type || "text",
  };
}

function getDefaultFields(isId: boolean): FieldItem[] {
  return [
    {
      id: "nik",
      name: "nik",
      label: isId ? "Nomor Induk Kependudukan (NIK)" : "National ID Number (NIK)",
      badgeType: "official",
      badgeLabel: isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance",
      meaning: isId
        ? "Nomor identitas kependudukan tunggal 16 digit yang diterbitkan resmi oleh Dinas Dukcapil."
        : "A 16-digit continuous citizen identification number issued by the civil registry.",
      howTo: isId
        ? "Ketik 16 digit angka tanpa spasi, titik, atau tanda hubung (-). Wajib persis sesuai e-KTP fisik terbaru."
        : "Enter 16 continuous digits without spaces or dashes. Must match your latest physical ID card.",
      example: "3271041908980002",
      pitfall: isId
        ? "Jangan gunakan NIK lama pada fotokopi Kartu Keluarga jika Anda baru saja pindah domisili."
        : "Do not use an outdated identification number if you have recently relocated your registered residence.",
      vaultKey: "nik",
      fallbackValue: "",
    },
    {
      id: "nama_lengkap",
      name: "nama_lengkap",
      label: isId ? "Nama Lengkap" : "Full Legal Name",
      badgeType: "official",
      badgeLabel: isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance",
      meaning: isId
        ? "Nama sah pendaftar yang tercatat pada sistem administrasi kependudukan negara."
        : "Full official legal name as recorded in national civil administration systems.",
      howTo: isId
        ? "Tuliskan nama lengkap tanpa gelar akademik/keagamaan, kecuali formulir memiliki kolom gelar tersendiri."
        : "Enter your full legal name without academic titles, unless a dedicated field is provided.",
      example: isId ? "Budi Santoso" : "John Doe",
      pitfall: isId
        ? "Perbedaan satu huruf antara KTP dan Ijazah dapat menyebabkan verifikasi manual tertolak."
        : "A single letter mismatch with educational diplomas may cause manual verification rejection.",
      vaultKey: "nama",
      fallbackValue: "",
    },
  ];
}

interface FormsGuideTabProps {
  isVaultUnlocked: boolean;
  isFormAnalyzed: boolean;
  onAnalyzeForm?: () => void;
  onBackToAssistant?: () => void;
  onNavigateTab?: (tabId: "guide" | "vault" | "audit") => void;
}

export function FormsGuideTab({
  isVaultUnlocked,
  isFormAnalyzed,
  onBackToAssistant,
  onNavigateTab,
}: FormsGuideTabProps) {
  const { language } = useLanguage();
  const isId = language === "id";

  const [rawScannedFields, setRawScannedFields] = useState<any[]>([]);
  const [fields, setFields] = useState<FieldItem[]>(() => getDefaultFields(isId));
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [vaultData, setVaultData] = useState<Record<string, string>>({});

  // Two-tier AI Guidance Cache (L1 state + L2 chrome.storage)
  const [aiGuidanceCache, setAiGuidanceCache] = useState<Record<string, {
    meaning: string;
    howTo: string;
    example: string;
    pitfall: string;
    badgeLabel: string;
    badgeType: "official" | "curated" | "ai";
  }>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Restore AI Guidance cache on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_ai_guidance_cache"], (res) => {
        if (res?.savvy_ai_guidance_cache && typeof res.savvy_ai_guidance_cache === "object") {
          setAiGuidanceCache(res.savvy_ai_guidance_cache as any);
        }
      });
    }
  }, []);

  // Sync vault data from storage if available
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_vault_plain"], (res) => {
        if (res?.savvy_vault_plain && typeof res.savvy_vault_plain === "object") {
          setVaultData(res.savvy_vault_plain as Record<string, string>);
        } else {
          setVaultData({});
        }
      });
    }
  }, [isVaultUnlocked]);

  // Load scanned fields from cache if exists
  useEffect(() => {
    if (!isFormAnalyzed) {
      setRawScannedFields([]);
      setFields(getDefaultFields(isId));
      setCurrentFieldIndex(0);
      return;
    }
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_page_fields"], (res) => {
        if (res?.savvy_page_fields && Array.isArray(res.savvy_page_fields) && res.savvy_page_fields.length > 0) {
          setRawScannedFields(res.savvy_page_fields);
        }
      });
    }
  }, [isFormAnalyzed, isId]);

  // Whenever scanned fields or language change, map fields dynamically
  useEffect(() => {
    if (rawScannedFields.length > 0) {
      const mapped = rawScannedFields.map((f) => mapRawFieldToItem(f, isId));
      setFields(mapped);
    } else {
      setFields(getDefaultFields(isId));
    }
  }, [rawScannedFields, isId]);

  // Real-Time On-Demand AI Guidance: Call Meta Muse Spark Open via /api/coach/field
  useEffect(() => {
    if (!fields || fields.length === 0) return;
    const target = fields[currentFieldIndex];
    if (!target) return;

    const fieldKey = target.id || target.name || target.label;
    const cacheKey = `${fieldKey}_${isId ? "id" : "en"}`;

    // If already cached in memory, use it directly (0ms)
    if (aiGuidanceCache[cacheKey]) return;

    let cancelled = false;
    setIsLoadingAi(true);

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_form_analysis"], (storageRes) => {
        const analysis: any = storageRes?.savvy_form_analysis || {};
        const domain = analysis.institution || "beasiswalpdp.kemenkeu.go.id";
        const formTitle = analysis.formTitle || "Official Public Application";

        fetchFieldCoachGuidance(
          fieldKey,
          target.label || target.name || "field",
          domain,
          formTitle,
          language
        )
          .then((res) => {
            if (cancelled) return;
            const newEntry = {
              meaning: res.meaning || (isId ? `Kolom untuk ${target.label}.` : `Field for ${target.label}.`),
              howTo: res.how_to_fill || (isId ? "Isi sesuai dengan dokumen resmi kependudukan atau akademik yang masih berlaku." : "Enter matching valid official identity or academic credentials."),
              example: res.example || (isId ? "Sesuai format dokumen resmi" : "Matching official document format"),
              pitfall: res.pitfalls || (isId ? "Pastikan tidak ada salah ketik yang berbeda dengan dokumen asli." : "Ensure there are no typos or discrepancies with original records."),
              badgeLabel: res.confirmation_ref || (res.source_type === "official" ? (isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance") : "✨ Meta AI Guidance"),
              badgeType: (res.source_type === "official" ? "official" : "ai") as "official" | "ai",
            };

            setAiGuidanceCache((prev) => {
              const updated = { ...prev, [cacheKey]: newEntry };
              if (typeof chrome !== "undefined" && chrome.storage?.local) {
                chrome.storage.local.set({ savvy_ai_guidance_cache: updated });
              }
              return updated;
            });
          })
          .catch((err) => {
            console.warn("[FormsGuideTab] AI Field Coach fetch error:", err);
          })
          .finally(() => {
            if (!cancelled) setIsLoadingAi(false);
          });
      });
    } else {
      setIsLoadingAi(false);
    }

    return () => {
      cancelled = true;
    };
  }, [currentFieldIndex, fields, isId]);

  // Listen to FIELD_SELECTED_FROM_PAGE from content script (clicking number badge on webpage)
  useEffect(() => {
    const messageListener = (msg: any) => {
      if (msg?.type === "FIELD_SELECTED_FROM_PAGE") {
        if (typeof msg.fieldIndex === "number" && msg.fieldIndex >= 0 && msg.fieldIndex < fields.length) {
          setCurrentFieldIndex(msg.fieldIndex);
          setHasAutofilled(false);
          agentLog.perception(`🎯 Field #${msg.fieldIndex + 1} selected directly from page click.`);
        }
      }
    };

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, [fields.length]);

  const rawCurrent = fields[currentFieldIndex] || getDefaultFields(isId)[0];
  const activeFieldKey = rawCurrent.id || rawCurrent.name || rawCurrent.label;
  const currentCacheKey = `${activeFieldKey}_${isId ? "id" : "en"}`;
  const activeAi = aiGuidanceCache[currentCacheKey];

  const currentField: FieldItem = {
    ...rawCurrent,
    meaning: activeAi?.meaning || rawCurrent.meaning,
    howTo: activeAi?.howTo || rawCurrent.howTo,
    example: activeAi?.example || rawCurrent.example,
    pitfall: activeAi?.pitfall || rawCurrent.pitfall,
    badgeLabel: activeAi?.badgeLabel || rawCurrent.badgeLabel,
    badgeType: activeAi?.badgeType || rawCurrent.badgeType,
  };

  const hasVaultKey = !!(currentField.vaultKey && vaultData[currentField.vaultKey]);

  // Manual Refresh AI Guidance
  const handleRefreshAi = () => {
    setAiGuidanceCache((prev) => {
      const copy = { ...prev };
      delete copy[currentCacheKey];
      return copy;
    });
    setIsLoadingAi(true);

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_form_analysis"], (storageRes) => {
        const analysis: any = storageRes?.savvy_form_analysis || {};
        const domain = analysis.institution || "beasiswalpdp.kemenkeu.go.id";
        const formTitle = analysis.formTitle || "Official Public Application";

        fetchFieldCoachGuidance(
          activeFieldKey,
          rawCurrent.label || rawCurrent.name || "field",
          domain,
          formTitle,
          language
        )
          .then((res) => {
            const newEntry = {
              meaning: res.meaning || (isId ? `Kolom untuk ${rawCurrent.label}.` : `Field for ${rawCurrent.label}.`),
              howTo: res.how_to_fill || (isId ? "Isi sesuai dengan dokumen resmi kependudukan atau akademik yang masih berlaku." : "Enter matching valid official identity or academic credentials."),
              example: res.example || (isId ? "Sesuai format dokumen resmi" : "Matching official document format"),
              pitfall: res.pitfalls || (isId ? "Pastikan tidak ada salah ketik yang berbeda dengan dokumen asli." : "Ensure there are no typos or discrepancies with original records."),
              badgeLabel: res.confirmation_ref || (res.source_type === "official" ? (isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance") : "✨ Meta AI Guidance"),
              badgeType: (res.source_type === "official" ? "official" : "ai") as "official" | "ai",
            };

            setAiGuidanceCache((prev) => {
              const updated = { ...prev, [currentCacheKey]: newEntry };
              chrome.storage.local.set({ savvy_ai_guidance_cache: updated });
              return updated;
            });
          })
          .finally(() => {
            setIsLoadingAi(false);
          });
      });
    }
  };

  // Helper function to navigate between fields (Before / Next)
  const handleNavigateField = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= fields.length) return;
    setCurrentFieldIndex(newIndex);
    setHasAutofilled(false);

    const targetField = fields[newIndex];
    agentLog.action(`🧭 Navigating to Field #${newIndex + 1}: ${targetField.label}`);

    // Send command to web page to scroll and spotlight this field
    sendTabMessage({
      type: "NAVIGATE_TO_FIELD",
      fieldIndex: newIndex,
      fieldId: targetField.id,
      fieldName: targetField.name,
    });
  };

  // Determine Vault Data preview value
  const rawVaultVal =
    (currentField.vaultKey && vaultData[currentField.vaultKey]) ||
    "";

  const getMaskedVal = (val: string) => {
    if (!val) return "";
    if (val.length <= 4) return val[0] + "xxx";
    return val.substring(0, 3) + "x".repeat(Math.max(4, val.length - 5)) + val.slice(-2);
  };

  const displayVaultVal = isVaultUnlocked ? rawVaultVal : getMaskedVal(rawVaultVal);

  // Single-Field Autofill action
  const handleFillFromVault = () => {
    if (!isVaultUnlocked || !rawVaultVal) {
      if (onNavigateTab) {
        onNavigateTab("vault");
      }
      return;
    }

    sendTabMessage({
      type: "INJECT_VALUE",
      fieldIndex: currentFieldIndex,
      fieldId: currentField.id,
      fieldName: currentField.name,
      value: rawVaultVal,
    }).then((res: any) => {
      if (res?.success) {
        setHasAutofilled(true);
        agentLog.action(`⚡ Injected vault value into Field #${currentFieldIndex + 1} (${currentField.label})`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header bar with Back button and Field Progress */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs">
        <button
          onClick={onBackToAssistant}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isId ? "Kembali" : "Back to Copilot"}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            {isId ? "Kolom" : "Field"}{" "}
            <span className="text-savvy-blue font-black font-mono text-xs">
              {currentFieldIndex + 1}
            </span>{" "}
            / {fields.length}
          </span>
          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-savvy-gradient transition-all duration-300"
              style={{
                width: `${((currentFieldIndex + 1) / fields.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Active Field Name & AI Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <span className="text-[10px] font-extrabold text-savvy-blue uppercase tracking-wider block">
              {isId ? "PANDUAN KOLOM AKTIF" : "ACTIVE FIELD COACH"}
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
              {currentField.label}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {currentField.badgeType === "official" ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 shrink-0">
                {currentField.badgeLabel || (isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance")}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-200 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{currentField.badgeLabel || "✨ Meta AI Guidance"}</span>
              </span>
            )}
            <button
              onClick={handleRefreshAi}
              title={isId ? "Tanya ulang ke Meta AI" : "Re-consult Meta AI"}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingAi ? "animate-spin text-savvy-blue" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4-Element Guidance Card (Meta Muse Spark Open) */}
        {isLoadingAi && !activeAi ? (
          <div className="bg-white border border-blue-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5 text-xs text-left">
            <div className="flex items-center gap-2 text-savvy-blue font-extrabold text-xs">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>{isId ? "Menghubungi Meta Muse Spark Open AI..." : "Consulting Meta Muse Spark Open AI..."}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isId
                ? `Menganalisis juknis resmi, basis aturan LPDP, dan mengekstrak contoh valid spesifik untuk "${currentField.label}"...`
                : `Analyzing official guidelines, regulatory criteria, and synthesizing valid examples specifically for "${currentField.label}"...`}
            </p>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-blue-100/70 rounded-md animate-pulse w-3/4"></div>
              <div className="h-3 bg-blue-100/70 rounded-md animate-pulse w-1/2"></div>
              <div className="h-3 bg-blue-100/70 rounded-md animate-pulse w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5 text-xs text-left">
            {/* 1. Arti Istilah / Field Meaning */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {isId ? "ARTI ISTILAH:" : "FIELD MEANING:"}
              </span>
              <p className="text-slate-900 font-semibold mt-1 leading-snug">
                {currentField.meaning}
              </p>
            </div>

            {/* 2. Cara Mengisi / How to Fill */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {isId ? "CARA MENGISI:" : "HOW TO FILL:"}
              </span>
              <p className="text-slate-600 mt-1 leading-snug">
                {currentField.howTo}
              </p>
            </div>

            {/* 3. Contoh Valid / Valid Example */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {isId ? "CONTOH VALID:" : "VALID EXAMPLE:"}
              </span>
              <code className="text-savvy-blue font-mono font-bold text-xs mt-1 block">
                {currentField.example}
              </code>
            </div>

            {/* 4. Jebakan Umum / Common Pitfall */}
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isId ? "JEBAKAN UMUM (PITFALL):" : "COMMON PITFALL:"}</span>
              </span>
              <p className="text-[11px] text-amber-950 mt-1 leading-snug">
                {currentField.pitfall}
              </p>
            </div>

            {/* 5. Data Anda (Dari Vault / Status Pengisian) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-savvy-blue" />
                  <span>{hasVaultKey ? (isId ? "DATA ANDA (DARI VAULT):" : "YOUR DATA (FROM VAULT):") : (isId ? "STATUS PENGISIAN:" : "INPUT STATUS:")}</span>
                </span>
                <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                  {hasVaultKey
                    ? rawVaultVal
                      ? displayVaultVal
                      : isId
                      ? "(Belum ada data di Vault)"
                      : "(No data in Vault)"
                    : currentField.type === "file"
                    ? isId
                      ? "Unggah berkas langsung di halaman"
                      : "Upload file directly on web page"
                    : isId
                    ? "Diisi / dipilih langsung pada formulir"
                    : "Fill / select directly on form"}
                </div>
                {hasVaultKey && currentField.vaultKey === "tanggal_lahir" && rawVaultVal && (
                  <p className="text-[10px] text-blue-600 font-semibold mt-1">
                    {isId
                      ? "💡 Format kalender (YYYY-MM-DD / mm/dd/yyyy) disesuaikan otomatis dari data Vault Anda saat diisi."
                      : "💡 Calendar format (YYYY-MM-DD / mm/dd/yyyy) is automatically converted from your Vault on fill."}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                {hasVaultKey
                  ? isVaultUnlocked
                    ? isId
                      ? "Terbuka"
                      : "Unlocked"
                    : isId
                    ? "Terkunci"
                    : "Locked"
                  : isId
                  ? "Manual / Web"
                  : "Manual / Web"}
              </span>
            </div>
          </div>
        )}

        {/* Tombol: Isi Kolom dari Vault ATAU Petunjuk Langsung */}
        {hasVaultKey ? (
          <button
            onClick={handleFillFromVault}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isVaultUnlocked
                ? "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                : !rawVaultVal
                ? "bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200"
                : hasAutofilled
                ? "bg-savvy-green text-white hover:opacity-95"
                : "bg-savvy-gradient text-white hover:opacity-95 shadow-sm shadow-savvy-blue/20"
            }`}
          >
            {!isVaultUnlocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{isId ? "Buka Vault untuk Mengisi Kolom" : "Unlock Vault to Fill Field"}</span>
              </>
            ) : !rawVaultVal ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{isId ? "Data Belum Ada di Vault (Buka Vault)" : "No Data in Vault (Open Vault)"}</span>
              </>
            ) : hasAutofilled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isId ? "Kolom Berhasil Diisi!" : "Field Filled Successfully!"}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{isId ? `Isi Kolom Ini dari Vault (${displayVaultVal.slice(0, 10)}...)` : `Fill Field from Vault (${displayVaultVal.slice(0, 10)}...)`}</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/90">
            {currentField.type === "file" ? (
              <>
                <span>📁</span>
                <span>{isId ? "Klik tombol Upload pada halaman web untuk memilih berkas" : "Click Upload button on web page to select file"}</span>
              </>
            ) : (
              <>
                <span>✏️</span>
                <span>{isId ? "Isi atau pilih opsi ini langsung pada halaman formulir" : "Enter or select option directly on the web form"}</span>
              </>
            )}
          </div>
        )}

        {/* Tombol Navigasi: Before & Next */}
        <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
          <button
            onClick={() => handleNavigateField(currentFieldIndex - 1)}
            disabled={currentFieldIndex === 0}
            className={`py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentFieldIndex === 0
                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isId ? "Sebelumnya" : "Previous"}</span>
          </button>

          <button
            onClick={() => handleNavigateField(currentFieldIndex + 1)}
            disabled={currentFieldIndex === fields.length - 1}
            className={`py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentFieldIndex === fields.length - 1
                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                : "bg-white text-savvy-blue border-blue-200 hover:bg-blue-50/50 hover:border-savvy-blue shadow-2xs"
            }`}
          >
            <span>{isId ? "Selanjutnya" : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
