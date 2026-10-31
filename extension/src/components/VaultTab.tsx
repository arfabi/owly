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

export interface ProfileItem {
  id: string;
  name: string;        // Nama Data
  value: string;       // Value
  aliases: string[];   // Aliases (bisa diisi banyak untuk mengenali input field nama yang mirip)
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
    value: "3319020707950005",
    aliases: ["Nomor Induk Kependudukan", "ID Number"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "nama_lengkap",
    name: "Nama Lengkap",
    value: "AHMAD RIDLO FADLLI ROBBI",
    aliases: ["Nama", "Full Name"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "tempat_lahir",
    name: "Tempat Lahir",
    value: "KUDUS",
    aliases: ["Place of Birth"],
    sourceTag: "KTP Republik Indonesia",
  },
  {
    id: "tanggal_lahir",
    name: "Tanggal Lahir",
    value: "07-07-1995",
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
    value: "DESA JETIS KAPUAN RT 003 RW 002 KEC. JATI, KUDUS",
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
    value: "ahmad.ridlo@gmail.com",
    aliases: ["Surel", "Alamat Email", "E-mail Address"],
    sourceTag: "Manual Input",
  },
  {
    id: "no_hp",
    name: "No. Handphone",
    value: "081234567890",
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
  const { language } = useLanguage();
  const isId = language === "id";

  const [profileItems, setProfileItems] = useState<ProfileItem[]>(DEFAULT_PROFILE_ITEMS);
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

  // Load verified profile items from storage if previously customized
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_verified_profile_items"], (res) => {
        if (
          res?.savvy_verified_profile_items &&
          Array.isArray(res.savvy_verified_profile_items) &&
          res.savvy_verified_profile_items.length > 0
        ) {
          setProfileItems(res.savvy_verified_profile_items);
        }
      });
    }
  }, []);

  // Save changes to state & storage
  const saveItems = (updated: ProfileItem[]) => {
    setProfileItems(updated);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ savvy_verified_profile_items: updated });
    }
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

    // Build dictionary payload for legacy compatibility
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
      setFormError(isId ? "Nama Data wajib diisi." : "Data Name is required.");
      return;
    }
    if (!newValue.trim()) {
      setFormError(isId ? "Value data wajib diisi." : "Data Value is required.");
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

  // Handle Document Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    agentLog.action("📤 Document uploaded for AI zero-knowledge extraction.", { fileName: file.name });

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccessToast(
        isId
          ? `Ekstraksi ${file.name} selesai! File asli otomatis dihapus. Data terenkripsi tersimpan di Vault.`
          : `Extraction for ${file.name} completed! Original file auto-deleted. Extracted data saved to Vault.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setUploadSuccessToast(null), 5000);
    }, 1500);
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* ==================================================================== */}
      {/* 1. TOP CARD: READY TO FILL ACTIVE FORM                               */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between text-left">
        <div className="min-w-0 pr-3">
          <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
            Ready to Fill Active Form
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Matches verified profile data to web inputs
          </p>
        </div>

        <button
          onClick={handleBatchAutofill}
          className="py-2.5 px-4 rounded-xl bg-savvy-blue hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-savvy-blue/20 transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>1-Click AutoFill</span>
        </button>
      </div>

      {/* Warning: Belum Analyze Form saat klik Autofill */}
      {analyzeNotice && !isFormAnalyzed && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-950 font-medium">
              {isId
                ? "Formulir belum dianalisis! Klik tombol di bawah agar Savvy memetakan kolom dengan akurat."
                : "Form is not analyzed yet! Please analyze the form first so AutoFill can match fields accurately."}
            </div>
          </div>
          <button
            onClick={() => {
              onAnalyzeForm();
              setAnalyzeNotice(false);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors cursor-pointer"
          >
            {isId ? "🔍 Analyze Form Sekarang" : "🔍 Analyze Form Now"}
          </button>
        </div>
      )}

      {/* Persistent Undo Bar */}
      {showUndoBar && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{isId ? "Formulir Berhasil Diisi!" : "Form Successfully Filled!"}</span>
          </div>
          <button
            onClick={handleUndoAutofill}
            className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo 100%</span>
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
              Verified Profile Data
            </h3>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {profileItems.length} items
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-[11px] font-extrabold text-savvy-blue bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Data</span>
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
          {profileItems.map((item) => (
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
                  title="Hapus data ini"
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
                Aliases: {Array.isArray(item.aliases) && item.aliases.length > 0 ? item.aliases.join(", ") : "-"}
              </div>
            </div>
          ))}
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
            Add Profile Data via ID or Document
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[320px] mx-auto">
            Simply upload your ID card, Passport, or Academic Certificate (PDF, PNG, JPG)
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
              <span>Memproses Dokumen...</span>
            </>
          ) : (
            <span>Upload Document</span>
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
            <span>
              By uploading, I consent to AI processing my ID for autofill. Original files are auto-deleted after extraction. Only encrypted extracted data is stored in my vault.
            </span>
            <a
              href="http://savvy-companion.vercel.app/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-savvy-blue underline font-bold hover:text-blue-700 ml-1 inline-flex items-center gap-0.5"
            >
              <span>Privacy Policy</span>
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
                Tambah Data Profil Baru
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
                  Nama Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Cth: Nomor NPWP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-savvy-blue"
                  autoFocus
                />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Cth: 12.345.678.9-012.000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-savvy-blue"
                />
              </div>

              {/* Aliases */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Aliases <span className="text-slate-400 font-normal">(bisa diisi banyak untuk mengenali input field nama yang mirip)</span>
                </label>
                <input
                  type="text"
                  value={newAliases}
                  onChange={(e) => setNewAliases(e.target.value)}
                  placeholder="Pisahkan koma, cth: Tax ID, NPWP, Tax Number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-savvy-blue"
                />
              </div>

              {/* Source Tag */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Source Tag
                </label>
                <input
                  type="text"
                  value={newSourceTag}
                  onChange={(e) => setNewSourceTag(e.target.value)}
                  placeholder="Cth: Kartu NPWP / Manual Input"
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
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-savvy-blue hover:bg-blue-600 text-white font-extrabold shadow-2xs transition-colors"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
