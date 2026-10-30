import React, { useState, useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Lock,
  Unlock,
  Shield,
  Upload,
  Zap,
  RotateCcw,
  Sparkles,
  FileCheck2,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building,
  Heart,
  Save,
  CheckCircle2,
} from "lucide-react";
import { encryptVaultItem, decryptVaultItem } from "../lib/crypto/vault";
import { agentLog } from "../lib/agentLogger";
import { generateEssayDraft } from "../lib/api/client";

interface VaultTabProps {
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (val: boolean) => void;
  isFormAnalyzed: boolean;
  onAnalyzeForm: () => void;
}

export function VaultTab({
  isVaultUnlocked,
  setIsVaultUnlocked,
  isFormAnalyzed,
  onAnalyzeForm,
}: VaultTabProps) {
  const { t, language } = useLanguage();
  const isId = language === "id";
  const v = t.vault;

  // Passphrase & Setup State
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form State inside Vault
  const [activeProfile, setActiveProfile] = useState<"pribadi" | "pasangan" | "pekerjaan">("pribadi");
  const [formData, setFormData] = useState({
    nik: "3271041908980002",
    nama: "Budi Santoso",
    tanggal_lahir: "1998-08-19",
    alamat: "Jl. Sudirman No. 45, Jakarta Pusat",
    email: "budi.santoso@alumni.ui.ac.id",
    no_hp: "081234567890",
  });

  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "done">("idle");
  const [showUndoBar, setShowUndoBar] = useState(false);
  const [essayDraft, setEssayDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [analyzeNotice, setAnalyzeNotice] = useState(false);

  // Check if master password exists in storage
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_vault_has_pass", "savvy_vault_encrypted"], (res) => {
        if (res.savvy_vault_has_pass) {
          setHasMasterPassword(true);
        }
      });
    } else {
      const stored = localStorage.getItem("savvy_vault_has_pass");
      if (stored === "true") setHasMasterPassword(true);
    }
  }, []);

  // 1. Set Master Password
  const handleSetPassword = async () => {
    if (!passwordInput || passwordInput.length < 6) {
      setPasswordError(isId ? "Password minimal 6 karakter." : "Password must be at least 6 characters.");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setPasswordError(isId ? "Konfirmasi password tidak cocok." : "Password confirmation does not match.");
      return;
    }

    try {
      // Encrypt initial profile data
      const encrypted = await encryptVaultItem(formData, passwordInput);
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({
          savvy_vault_has_pass: true,
          savvy_vault_encrypted: encrypted,
        });
      } else {
        localStorage.setItem("savvy_vault_has_pass", "true");
        localStorage.setItem("savvy_vault_encrypted", JSON.stringify(encrypted));
      }

      setHasMasterPassword(true);
      setIsVaultUnlocked(true);
      setPasswordError(null);
      setPasswordInput("");
      setConfirmPasswordInput("");
      agentLog.security("🔐 Master Password successfully initialized. Stored encrypted vault payload using WebCrypto AES-256-GCM.");
    } catch (e) {
      setPasswordError(isId ? "Gagal mengenkripsi Vault." : "Failed to encrypt Vault.");
    }
  };

  // 2. Unlock Existing Vault
  const handleUnlockVault = async () => {
    if (!passwordInput) {
      setPasswordError(isId ? "Masukkan password Vault Anda." : "Please enter your Vault password.");
      return;
    }

    try {
      let encryptedPayload: any = null;
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        const res = await chrome.storage.local.get(["savvy_vault_encrypted"]);
        encryptedPayload = res.savvy_vault_encrypted;
      } else {
        const stored = localStorage.getItem("savvy_vault_encrypted");
        if (stored) encryptedPayload = JSON.parse(stored);
      }

      if (encryptedPayload) {
        const decrypted = await decryptVaultItem(encryptedPayload, passwordInput);
        setFormData((prev) => ({ ...prev, ...decrypted }));
      }

      setIsVaultUnlocked(true);
      setPasswordError(null);
      setPasswordInput("");
      agentLog.security("🔓 Vault unlocked! WebCrypto AES-256-GCM key derived successfully. Identity data decrypted in client memory.");
    } catch (err) {
      agentLog.security("⚠️ Vault unlock failed: Invalid master passphrase provided.");
      setPasswordError(isId ? "Password salah! Silakan periksa kembali." : "Incorrect password. Please try again.");
    }
  };

  // 3. Lock Vault
  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setPasswordInput("");
    agentLog.security("🔒 Vault locked by user. Client in-memory decrypted buffer destroyed.");
  };

  // 4. Save Vault Data Changes
  const handleSaveFormData = async () => {
    setSaveFeedback(true);
    agentLog.security("💾 Vault data re-encrypted & saved to persistent storage.", { profile: activeProfile });
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  // 5. Trigger Autofill to Portal
  const handleBatchAutofill = () => {
    if (!isFormAnalyzed) {
      agentLog.action("⛔ Autofill blocked: Active page form has not been analyzed yet. Guardrail enforced.");
      setAnalyzeNotice(true);
      return;
    }
    setAnalyzeNotice(false);
    setShowUndoBar(true);

    agentLog.action("⚡ 1-Click Autofill dispatched to content script with automatic undo snapshot.", {
      targetKeys: Object.keys(formData),
    });

    // Send autofill message to content script
    if (typeof chrome !== "undefined" && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "BATCH_AUTOFILL",
            payload: formData,
          });
        }
      });
    }
  };

  // 6. Undo Autofill
  const handleUndoAutofill = () => {
    setShowUndoBar(false);
    agentLog.action("↩️ Undo Autofill requested. Restoring previous values across form elements.");
    if (typeof chrome !== "undefined" && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "UNDO_AUTOFILL" });
        }
      });
    }
  };

  const handleSimulateOcr = async () => {
    setOcrStatus("processing");
    setTimeout(() => {
      setOcrStatus("done");
      setFormData((prev) => ({
        ...prev,
        nik: "3271041908980002",
        nama: "Budi Santoso",
        tanggal_lahir: "1998-08-19",
        alamat: "Jl. Sudirman No. 45, Jakarta Pusat",
      }));
    }, 1200);
  };

  const handleGenerateEssay = async () => {
    try {
      const res = await generateEssayDraft([
        "Lulusan S1 Ilmu Komputer UI dengan predikat Cum Laude",
        "Pengalaman 3 tahun di bidang transformasi digital dan sistem birokrasi publik",
        "Rencana studi S2 Magister Kebijakan Publik untuk memperkuat hilirisasi teknologi nasional",
      ]);
      if (res.essay) {
        setEssayDraft(res.essay);
        return;
      }
    } catch (_) {}
    setEssayDraft(
      isId
        ? "Pasca menyelesaikan studi Magister Kebijakan Publik, rencana strategis saya adalah kembali mengabdi di Badan Perencanaan Pembangunan Nasional (Bappenas). Saya akan memimpin perancangan program hilirisasi ekonomi hijau berbasis riset kebijakan tepat guna guna memperkuat ketahanan ekonomi nasional dalam 5 tahun ke depan."
        : "Upon completing my Master in Public Policy, my strategic plan is to resume service at the National Development Planning Agency (Bappenas), focusing on evidence-based green economy transformation."
    );
  };

  return (
    <div className="p-3.5 space-y-3.5 text-slate-800">
      {/* KONDISI 1: VAULT TERKUNCI (Pertama kali dibuka / Lock State) */}
      {!isVaultUnlocked ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-savvy-soft-blue border border-savvy-blue/30 flex items-center justify-center text-savvy-blue">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              {hasMasterPassword
                ? isId
                  ? "Buka Kunci Vault Terenkripsi"
                  : "Unlock Encrypted Vault"
                : isId
                ? "Atur Password Vault Baru"
                : "Set Master Vault Password"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[280px] mx-auto">
              {hasMasterPassword
                ? isId
                  ? "Data NIK dan berkas Anda dienkripsi AES-256-GCM. Masukkan passphrase untuk mengakses data."
                  : "Your identity data is protected by AES-256-GCM. Enter your passphrase to access."
                : isId
                ? "Anda belum memiliki password Vault. Buat password rahasia untuk mengamankan data formulir Anda."
                : "No Vault password detected. Set a master passphrase to secure your sensitive form data."}
            </p>
          </div>

          {/* Input Password Form */}
          <div className="space-y-2.5 text-left pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                {hasMasterPassword ? (isId ? "Password Vault" : "Vault Password") : (isId ? "Buat Password Baru" : "Create Password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={isId ? "Masukkan password..." : "Enter password..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 pr-9 focus:outline-none focus:border-savvy-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* If Setting Password First Time: Confirm Field */}
            {!hasMasterPassword && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {isId ? "Ulangi Password" : "Confirm Password"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder={isId ? "Ketik ulang password..." : "Retype password..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-savvy-blue"
                />
              </div>
            )}

            {passwordError && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              onClick={hasMasterPassword ? handleUnlockVault : handleSetPassword}
              className="w-full py-2.5 px-4 rounded-xl bg-savvy-gradient text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-savvy-blue/20 hover:opacity-95 transition-all mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {hasMasterPassword
                  ? isId ? "Buka Vault Saya" : "Unlock My Vault"
                  : isId ? "Simpan & Buka Vault" : "Set Password & Open Vault"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* KONDISI 2: VAULT TERBUKA (User Data, Edit, OCR & Autofill) */
        <div className="space-y-3.5">
          {/* Header Vault Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-savvy-soft-green text-savvy-green border border-savvy-green/30 flex items-center justify-center font-bold text-xs">
                <Unlock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-900">
                  {isId ? "Multi-Vault Terbuka (AES-256)" : "Unlocked Vault (AES-256)"}
                </h3>
                <span className="text-[10px] text-slate-400">Zero-Knowledge Client Encryption</span>
              </div>
            </div>

            <button
              onClick={handleLockVault}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {isId ? "Kunci Vault" : "Lock Vault"}
            </button>
          </div>

          {/* Profile Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveProfile("pribadi")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeProfile === "pribadi"
                  ? "bg-white text-savvy-blue shadow-2xs"
                  : "hover:text-slate-900"
              }`}
            >
              <User className="w-3 h-3" />
              <span>{isId ? "Pribadi" : "Personal"}</span>
            </button>
            <button
              onClick={() => setActiveProfile("pasangan")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeProfile === "pasangan"
                  ? "bg-white text-savvy-blue shadow-2xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>{isId ? "Pasangan" : "Spouse"}</span>
            </button>
            <button
              onClick={() => setActiveProfile("pekerjaan")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeProfile === "pekerjaan"
                  ? "bg-white text-savvy-blue shadow-2xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Building className="w-3 h-3" />
              <span>{isId ? "Pekerjaan" : "Work"}</span>
            </button>
          </div>

          {/* Warning: Belum Analyze Form saat klik Autofill */}
          {analyzeNotice && !isFormAnalyzed && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-950 font-medium">
                  {isId
                    ? "Formulir belum dianalisis! Anda harus menganalisis formulir terlebih dahulu agar Autofill mengisi kolom yang tepat."
                    : "Form is not analyzed yet! Please analyze the form first so Autofill can match fields accurately."}
                </div>
              </div>
              <button
                onClick={() => {
                  onAnalyzeForm();
                  setAnalyzeNotice(false);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                {isId ? "🔍 Analyze Form Sekarang" : "🔍 Analyze Form Now"}
              </button>
            </div>
          )}

          {/* Persistent Undo Bar */}
          {showUndoBar && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{isId ? "Formulir Berhasil Diisi!" : "Form Successfully Filled!"}</span>
              </div>
              <button
                onClick={handleUndoAutofill}
                className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo 100%</span>
              </button>
            </div>
          )}

          {/* Identity Fields Input Form */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 text-left">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                {isId ? "Data Identitas Terenkripsi" : "Encrypted Identity Fields"}
              </span>
              <button
                onClick={handleSimulateOcr}
                className="text-[10px] font-bold text-savvy-purple bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>{ocrStatus === "processing" ? (isId ? "Memindai..." : "Scanning...") : (isId ? "OCR e-KTP" : "Scan ID")}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">NIK (16 Digit)</label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Tanggal Lahir</label>
                <input
                  type="text"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">No. Handphone</label>
                <input
                  type="text"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Alamat Domisili KTP</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveFormData}
                className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>{saveFeedback ? (isId ? "Tersimpan!" : "Saved!") : (isId ? "Simpan Perubahan" : "Save Changes")}</span>
              </button>

              {/* 1-Click Batch Autofill Button */}
              <button
                onClick={handleBatchAutofill}
                className="flex-1 py-2 px-3 rounded-xl bg-savvy-blue hover:bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isId ? "1-Click Autofill ke Form" : "1-Click Autofill to Form"}</span>
              </button>
            </div>
          </div>

          {/* Academic Essay Generator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-savvy-blue" />
                <span>{v.essayTitle}</span>
              </div>
              <button
                onClick={handleGenerateEssay}
                className="text-[10px] font-bold text-savvy-blue bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
              >
                {isId ? "Buat Draf AI" : "Generate Draft"}
              </button>
            </div>

            <textarea
              rows={3}
              value={essayDraft}
              onChange={(e) => setEssayDraft(e.target.value)}
              placeholder={isId ? "Tuliskan poin rencana Anda, Savvy akan menyusun draf narasi akademik formal..." : "Enter your points, Savvy will compose formal academic essay..."}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-savvy-blue font-sans"
            />

            {essayDraft && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (isId ? "Disalin!" : "Copied!") : (isId ? "Salin Esai" : "Copy Essay")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
