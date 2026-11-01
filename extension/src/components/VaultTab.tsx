import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Zap,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  UploadCloud,
  Shield,
  ExternalLink,
  AlertCircle,
  X,
  FileCheck2,
} from "lucide-react";
import { agentLog } from "../lib/agentLogger";
import { sendTabMessage } from "../lib/tabMessenger";
import { getEffectiveApiBaseUrl } from "../lib/api/client";

export interface ProfileItem {
  id: string;
  name: string;        // Nama Data
  value: string;       // Value
  aliases: string[];   // Aliases
  sourceTag?: string;  // e.g. "KTP Republik Indonesia"
}

interface VaultTabProps {
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (val: boolean) => void;
  isFormAnalyzed: boolean;
  onAnalyzeForm: () => void;
  onNavigateTab?: (tabId: "guide" | "vault" | "audit") => void;
}

const DEFAULT_PROFILE_ITEMS: ProfileItem[] = [
  {
    id: "nik",
    name: "NIK",
    value: "3171011508980001",
    aliases: ["Nomor Induk Kependudukan", "ID Number"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "nama_lengkap",
    name: "Nama Lengkap",
    value: "RADEN ARYA WIRASENA",
    aliases: ["Nama", "Full Name"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "tempat_lahir",
    name: "Tempat Lahir",
    value: "JAKARTA",
    aliases: ["Place of Birth"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "tanggal_lahir",
    name: "Tanggal Lahir",
    value: "15-08-1998",
    aliases: ["Date of Birth"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "jenis_kelamin",
    name: "Jenis Kelamin",
    value: "LAKI-LAKI",
    aliases: ["Gender", "Sex"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "alamat",
    name: "Alamat KTP",
    value: "JL. JEND. SUDIRMAN NO. 45, RT 004 RW 002, KEL. KARET SEMANGGI, KEC. SETIABUDI, JAKARTA SELATAN, DKI JAKARTA 12930",
    aliases: ["Address", "Domisili", "Alamat Tinggal"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "agama",
    name: "Agama",
    value: "ISLAM",
    aliases: ["Religion"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "status_perkawinan",
    name: "Status Perkawinan",
    value: "BELUM KAWIN",
    aliases: ["Marital Status", "Status Pernikahan"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "pekerjaan",
    name: "Pekerjaan",
    value: "KARYAWAN SWASTA",
    aliases: ["Occupation", "Profesi", "Job"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "kewarganegaraan",
    name: "Kewarganegaraan",
    value: "WNI",
    aliases: ["Nationality", "Citizenship"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "golongan_darah",
    name: "Golongan Darah",
    value: "O",
    aliases: ["Blood Type", "Gol Darah"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "email",
    name: "Email",
    value: "arya.wirasena@example.com",
    aliases: ["Surel", "Alamat Email", "E-mail Address"],
    sourceTag: "Manual Input",
  },
  {
    id: "no_hp",
    name: "No. Handphone",
    value: "081298765432",
    aliases: ["Phone Number", "Telepon", "No. Telepon", "WhatsApp"],
    sourceTag: "Manual Input",
  },
  {
    id: "paspor_no",
    name: "Nomor Dokumen Paspor",
    value: "C1234567",
    aliases: ["Document No.", "Passport Number", "No. Paspor"],
    sourceTag: "Paspor Republik Indonesia",
  },
  {
    id: "paspor_issue",
    name: "Tanggal Penerbitan Paspor",
    value: "12-10-2022",
    aliases: ["Date of Issue", "Passport Issue Date"],
    sourceTag: "Paspor Republik Indonesia",
  },
  {
    id: "paspor_expiry",
    name: "Tanggal Berakhir Paspor",
    value: "12-10-2032",
    aliases: ["Date of Expiry", "Expiry Date", "Passport Expiry"],
    sourceTag: "Paspor Republik Indonesia",
  },
  {
    id: "paspor_office",
    name: "Kantor Penerbit Paspor",
    value: "Kanim Jakarta Selatan",
    aliases: ["Issuing Authority", "Place of Issue"],
    sourceTag: "Paspor Republik Indonesia",
  },
  {
    id: "nama_ibu",
    name: "Nama Ibu Kandung",
    value: "SITI AMINAH",
    aliases: ["Mother's Name", "Nama Ibu"],
    sourceTag: "Kartu Keluarga",
  },
];

export function VaultTab({
  isFormAnalyzed,
  onAnalyzeForm,
}: VaultTabProps) {
  const { t, language } = useLanguage();
  const isId = language === "id";

  const [profileItems, setProfileItems] = useState<ProfileItem[]>([]);
  const [showUndoBar, setShowUndoBar] = useState(false);
  const [analyzeNotice, setAnalyzeNotice] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // New Item Form State
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newAliases, setNewAliases] = useState("");
  const [newSourceTag, setNewSourceTag] = useState("Manual Input");
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load verified profile items from storage if saved (default is empty [])
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_verified_profile_items"], (res) => {
        if (Array.isArray(res?.savvy_verified_profile_items)) {
          // Automatically purge any stale dummy placeholder item
          const cleaned = res.savvy_verified_profile_items.filter(
            (item: any) =>
              item &&
              item.id !== "extracted_doc" &&
              item.value !== "Ekstraksi berhasil" &&
              !item.value?.toLowerCase()?.includes("ekstraksi berhasil")
          );
          setProfileItems(cleaned);
          if (cleaned.length !== res.savvy_verified_profile_items.length) {
            chrome.storage.local.set({ savvy_verified_profile_items: cleaned });
          }
        } else {
          setProfileItems([]);
        }
      });
    }
  }, []);

  // Save changes to state & storage
  const saveItems = (updated: ProfileItem[]) => {
    setProfileItems(updated);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({
        savvy_verified_profile_items: updated,
        savvy_vault_customized: true,
      });

      // Synchronize flat dictionary for FormsGuideTab & instant autofill
      const flatDict: Record<string, string> = {};
      updated.forEach((item) => {
        flatDict[item.id] = item.value;
        flatDict[item.name] = item.value;
        if (item.id === "nik") flatDict["nik"] = item.value;
        if (item.id === "nama_lengkap") flatDict["nama"] = item.value;
        if (item.id === "tempat_lahir") flatDict["tempat_lahir"] = item.value;
        if (item.id === "tanggal_lahir") flatDict["tanggal_lahir"] = item.value;
        if (item.id === "alamat") flatDict["alamat"] = item.value;
        if (item.id === "email") flatDict["email"] = item.value;
        if (item.id === "no_hp") flatDict["no_hp"] = item.value;
        if (Array.isArray(item.aliases)) {
          item.aliases.forEach((alias) => {
            flatDict[alias] = item.value;
          });
        }
      });
      chrome.storage.local.set({ savvy_vault_plain: flatDict });
    }
  };

  // Reset profile items back to factory default
  const handleResetToDefaults = () => {
    setProfileItems(DEFAULT_PROFILE_ITEMS);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({
        savvy_verified_profile_items: DEFAULT_PROFILE_ITEMS,
        savvy_vault_customized: false,
      });
      const flatDict: Record<string, string> = {};
      DEFAULT_PROFILE_ITEMS.forEach((item) => {
        flatDict[item.id] = item.value;
        flatDict[item.name] = item.value;
        if (item.id === "nik") flatDict["nik"] = item.value;
        if (item.id === "nama_lengkap") flatDict["nama"] = item.value;
        if (item.id === "tempat_lahir") flatDict["tempat_lahir"] = item.value;
        if (item.id === "tanggal_lahir") flatDict["tanggal_lahir"] = item.value;
        if (item.id === "alamat") flatDict["alamat"] = item.value;
        if (item.id === "email") flatDict["email"] = item.value;
        if (item.id === "no_hp") flatDict["no_hp"] = item.value;
      });
      chrome.storage.local.set({ savvy_vault_plain: flatDict });
    }
    agentLog.security("🔄 Verified profile data reset to factory default.");
  };

  // Clear all profile items
  const handleClearAll = () => {
    saveItems([]);
    agentLog.security("🗑️ All verified profile data cleared by user.");
  };

  // 1-Click AutoFill
  const handleBatchAutofill = () => {
    if (!isFormAnalyzed) {
      agentLog.action("⛔ Autofill blocked: Active page form has not been analyzed yet. Guardrail enforced.");
      setAnalyzeNotice(true);
      return;
    }

    setAnalyzeNotice(false);
    setShowUndoBar(true);

    const flatDict: Record<string, string> = {};
    profileItems.forEach((item) => {
      flatDict[item.name] = item.value;
      if (Array.isArray(item.aliases)) {
        item.aliases.forEach((alias) => {
          flatDict[alias] = item.value;
        });
      }
    });

    agentLog.action("⚡ 1-Click Autofill dispatched to content script with automatic undo snapshot.", {
      itemCount: profileItems.length,
    });

    sendTabMessage({
      type: "BATCH_AUTOFILL",
      items: profileItems,
      payload: flatDict,
    });
  };

  // Undo Autofill
  const handleUndoAutofill = () => {
    setShowUndoBar(false);
    agentLog.action("↩️ Undo Autofill requested. Restoring previous values across form elements.");
    sendTabMessage({ type: "UNDO_AUTOFILL" });
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updated = profileItems.filter((i) => i.id !== id);
    saveItems(updated);
    agentLog.security("🗑️ Item deleted from verified profile items.", { id });
  };

  // Add new item
  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError(t.vault.errorNameRequired);
      return;
    }
    if (!newValue.trim()) {
      setFormError(t.vault.errorValueRequired);
      return;
    }

    const aliasesArr = newAliases
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const newItem: ProfileItem = {
      id: "item_" + Date.now(),
      name: newName.trim(),
      value: newValue.trim(),
      aliases: aliasesArr,
      sourceTag: newSourceTag.trim() || "Manual Input",
    };

    const updated = [newItem, ...profileItems];
    saveItems(updated);

    // Reset form
    setNewName("");
    setNewValue("");
    setNewAliases("");
    setNewSourceTag("Manual Input");
    setFormError(null);
    setIsAddModalOpen(false);

    agentLog.security("➕ New verified profile item added.", { name: newItem.name });
  };

  // Real AI Document Upload with Meta Muse Spark Open Multimodal Vision
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Visual AI Vision requires image formats
    if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
      setUploadSuccessToast(
        isId
          ? "Ekstraksi visual AI memerlukan format gambar (JPG, JPEG, PNG, WEBP). Harap unggah foto KTP/Paspor Anda."
          : "Visual AI extraction requires image format (JPG, JPEG, PNG, WEBP). Please upload an image of your ID."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setFormError(null);
    agentLog.action("📤 Document uploaded for AI zero-knowledge extraction.", { fileName: file.name, size: file.size });

    try {
      // 1. Read file as base64 Data URL
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Call /api/document/extract
      let fields: ProfileItem[] = [];
      let docType = "KTP Republik Indonesia";

      const baseUrl = await getEffectiveApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/document/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          language: isId ? "id" : "en",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.fields) && json.fields.length > 0) {
          fields = json.fields.filter(
            (f: any) =>
              f &&
              f.id !== "extracted_doc" &&
              f.value &&
              typeof f.value === "string" &&
              f.value.trim().length > 0 &&
              f.value.toLowerCase() !== "null" &&
              !f.value.toLowerCase().includes("ekstraksi berhasil")
          );
          docType = json.documentType || docType;
        }
      } else {
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.error ||
            (isId
              ? "Dokumen tidak dapat terbaca. Pastikan foto KTP/Paspor terang dan teks jelas."
              : "Document unreadable. Please ensure the ID photo is well-lit and clear.")
        );
      }

      if (fields.length === 0) {
        throw new Error(
          isId
            ? "Tidak ada data identitas yang terbaca dari gambar ini. Pastikan foto e-KTP/Paspor terang, tidak buram, dan teks terlihat jelas."
            : "No identity fields could be recognized from this image. Please ensure the ID photo is bright and clear."
        );
      }

      // 3. Merge extracted fields into profileItems (update existing or prepend new)
      const existingMap = new Map(profileItems.map((item) => [item.id, item]));
      fields.forEach((extItem) => {
        existingMap.set(extItem.id, extItem);
      });
      const updated = Array.from(existingMap.values());

      saveItems(updated);

      agentLog.security(`✅ Extracted ${fields.length} profile fields from ${file.name}.`, {
        documentType: docType,
        extractedCount: fields.length,
      });

      setUploadSuccessToast(
        isId
          ? `Ekstraksi ${file.name} berhasil! ${fields.length} data identitas resmi otomatis ditambahkan ke Vault.`
          : `Extraction for ${file.name} succeeded! ${fields.length} official identity fields added to Vault.`
      );
    } catch (err: any) {
      console.error("[VaultTab] Upload extract error:", err);
      agentLog.action(`❌ Extraction error: ${err.message}`);
      setUploadSuccessToast(
        isId
          ? `Gagal mengekstrak: ${err.message || "Pastikan foto dokumen terlihat jelas."}`
          : `Extraction failed: ${err.message || "Ensure document photo is clear."}`
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setUploadSuccessToast(null), 6000);
    }
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* ==================================================================== */}
      {/* 1. TOP CARD: READY TO FILL ACTIVE FORM                               */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between text-left">
        <div className="min-w-0 pr-3">
          <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
            {t.vault.readyToFillTitle}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {t.vault.readyToFillSubtitle}
          </p>
        </div>

        <button
          onClick={handleBatchAutofill}
          className="py-2.5 px-4 rounded-xl bg-savvy-blue hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-savvy-blue/20 transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{t.vault.btnBatchAutofill}</span>
        </button>
      </div>

      {/* Warning: Not Analyzed */}
      {analyzeNotice && !isFormAnalyzed && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-950 font-medium">
              {t.vault.warningNotAnalyzed}
            </div>
          </div>
          <button
            onClick={() => {
              onAnalyzeForm();
              setAnalyzeNotice(false);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors cursor-pointer"
          >
            {t.vault.btnAnalyzeNow}
          </button>
        </div>
      )}

      {/* Persistent Undo Bar */}
      {showUndoBar && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{t.vault.undoBarSuccess}</span>
          </div>
          <button
            onClick={handleUndoAutofill}
            className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.vault.btnUndo}</span>
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MIDDLE CARD: VERIFIED PROFILE DATA (Items List + Add Data)         */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-left space-y-3">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xs text-slate-900">
              {t.vault.verifiedDataTitle}
            </h3>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {profileItems.length} {t.vault.itemsCountSuffix}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {profileItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 px-2 py-1 rounded transition-colors cursor-pointer"
                title={isId ? "Hapus seluruh data profil" : "Clear all profile items"}
              >
                {isId ? "Kosongkan" : "Clear All"}
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-[11px] font-extrabold text-savvy-blue bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.vault.btnAddData}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
          {profileItems.length === 0 ? (
            <div className="p-6 text-center bg-slate-50/80 border border-dashed border-slate-200 rounded-xl space-y-3 my-1">
              <div className="w-9 h-9 mx-auto rounded-full bg-blue-50 text-savvy-blue flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-savvy-blue" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  {isId ? "Belum Ada Data Profil" : "No Profile Data Yet"}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[270px] mx-auto">
                  {isId
                    ? "Unggah foto KTP di bawah untuk ekstraksi otomatis via AI Vision, atau muat data profil demo."
                    : "Upload an ID card below for AI Vision extraction, or load demo profile data."}
                </p>
              </div>
              <button
                onClick={handleResetToDefaults}
                className="px-3.5 py-1.5 text-xs font-bold text-savvy-blue bg-white border border-blue-200 shadow-2xs rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isId ? "Muat Profil Demo" : "Load Demo Profile"}</span>
              </button>
            </div>
          ) : (
            profileItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-all text-left space-y-1 relative group"
              >
                {/* Header: Nama Data + Source Tag + Trash */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-600">
                      {item.name}
                    </span>
                    {item.sourceTag && (
                      <span className="text-[9.5px] font-bold text-savvy-blue bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                        {item.sourceTag}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                    title={t.vault.deleteTooltip}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Value (Bold) */}
                <div className="font-black text-sm text-slate-900 tracking-tight select-all">
                  {item.value}
                </div>

                {/* Aliases */}
                <div className="text-[10.5px] text-slate-400 font-medium">
                  {t.vault.labelAliases}: {Array.isArray(item.aliases) && item.aliases.length > 0 ? item.aliases.join(", ") : "-"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. BOTTOM CARD: UPLOAD DOCUMENT & PRIVACY CONSENT BANNER             */}
      {/* ==================================================================== */}
      <div className="border-2 border-dashed border-blue-400/80 bg-white rounded-2xl p-5 text-center space-y-3.5 shadow-2xs">
        {/* Upload Icon */}
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-savvy-blue shadow-2xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
            {t.vault.uploadDocCardTitle}
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[320px] mx-auto">
            {t.vault.uploadDocCardSubtitle}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="py-2.5 px-6 rounded-xl bg-white border border-slate-300 hover:border-savvy-blue text-savvy-blue font-extrabold text-xs shadow-2xs hover:bg-blue-50/50 transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-savvy-blue border-t-transparent rounded-full animate-spin" />
              <span>{t.vault.uploadingDoc}</span>
            </>
          ) : (
            <span>{t.vault.btnUploadDoc}</span>
          )}
        </button>

        {/* Upload Success Feedback */}
        {uploadSuccessToast && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessToast}</span>
          </div>
        )}

        {/* Mandatory Privacy & AI Processing Consent Banner */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-left flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[10.5px] text-emerald-950 leading-relaxed font-normal">
            <span>{t.vault.uploadConsentNotice}</span>
            <a
              href="https://owly-ai.vercel.app/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-savvy-blue underline font-bold hover:text-blue-700 ml-1 inline-flex items-center gap-0.5"
            >
              <span>{t.vault.privacyPolicyLink}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: + ADD DATA                                                    */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 relative text-left space-y-3">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-xs text-slate-900">
                {t.vault.modalAddDataTitle}
              </h4>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormError(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewItem} className="space-y-2.5 text-xs">
              {/* Nama Data */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {t.vault.labelDataName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t.vault.placeholderDataName}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-savvy-blue"
                  autoFocus
                />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {t.vault.labelValue} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={t.vault.placeholderValue}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-savvy-blue"
                />
              </div>

              {/* Aliases */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {t.vault.labelAliases} <span className="text-slate-400 font-normal">{t.vault.hintAliases}</span>
                </label>
                <input
                  type="text"
                  value={newAliases}
                  onChange={(e) => setNewAliases(e.target.value)}
                  placeholder={t.vault.placeholderAliases}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-savvy-blue"
                />
              </div>

              {/* Source Tag */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {t.vault.labelSourceTag}
                </label>
                <input
                  type="text"
                  value={newSourceTag}
                  onChange={(e) => setNewSourceTag(e.target.value)}
                  placeholder={t.vault.placeholderSourceTag}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-savvy-blue"
                />
              </div>

              {formError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  {t.vault.btnCancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-savvy-blue hover:bg-blue-600 text-white font-extrabold shadow-2xs transition-colors"
                >
                  {t.vault.btnSaveData}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
