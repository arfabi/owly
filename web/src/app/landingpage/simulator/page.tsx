"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Navbar } from "@/components/Navbar";
import {
  Sparkles,
  Download,
  CheckCircle2,
  Upload,
  CreditCard,
  GraduationCap,
  BookOpen,
  ArrowRight,
  X,
  Laptop,
  Check,
  RefreshCw,
} from "lucide-react";

export default function SimulatorPage() {
  const { language } = useLanguage();
  const isId = language === "id";

  // Extension Detection States
  const [isExtensionDetected, setIsExtensionDetected] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [connectedToast, setConnectedToast] = useState(false);

  // Form Field States across all input types
  // 1. Text & Masked Inputs
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [gender, setGender] = useState("L");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [npwp, setNpwp] = useState("");

  // 2. Number & Select Inputs
  const [jenjang, setJenjang] = useState("magister_luar");
  const [negaraTujuan, setNegaraTujuan] = useState("United Kingdom");
  const [universitas, setUniversitas] = useState("");
  const [toefl, setToefl] = useState("");
  const [ipk, setIpk] = useState("");
  const [usia, setUsia] = useState("");

  // 3. File & Image Upload Inputs
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [ktpFileName, setKtpFileName] = useState<string | null>(null);
  const [ijazahFileName, setIjazahFileName] = useState<string | null>(null);
  const [rekomendasiFileName, setRekomendasiFileName] = useState<string | null>(null);

  // 4. Textarea Inputs
  const [essay, setEssay] = useState("");
  const [researchSummary, setResearchSummary] = useState("");

  // 5. Agreement Checkbox
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Active Field tracking for visual focus
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Detect extension presence on mount & via message listener
  useEffect(() => {
    const checkExtension = () => {
      // Check DOM dataset attribute injected by extension content script
      if (document.documentElement.dataset.owlyExtension === "installed") {
        setIsExtensionDetected(true);
        return;
      }
      // Check global window object injected by content script
      if ((window as any).__OWLY_EXTENSION_INSTALLED__) {
        setIsExtensionDetected(true);
        return;
      }
      // Ping via window.postMessage
      window.postMessage({ type: "OWLY_PING" }, "*");
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OWLY_PONG") {
        setIsExtensionDetected(true);
      }
    };

    window.addEventListener("message", handleMessage);
    checkExtension();

    // Check again after a short delay in case content script initializes slightly after DOM
    const timer = setTimeout(checkExtension, 600);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
    };
  }, []);

  // Handler for "Access with Owly" button
  const handleAccessWithOwly = () => {
    const isInstalled =
      isExtensionDetected ||
      document.documentElement.dataset.owlyExtension === "installed" ||
      (window as any).__OWLY_EXTENSION_INSTALLED__;

    if (isInstalled) {
      window.postMessage({ type: "OWLY_OPEN_SIDEPANEL" }, "*");
      setConnectedToast(true);
      setTimeout(() => setConnectedToast(false), 4000);
    } else {
      setShowInstallModal(true);
    }
  };

  // Masking helpers
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    setNik(raw);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d+]/g, "").slice(0, 15);
    setPhone(raw);
  };

  const handleNpwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 15);
    setNpwp(raw);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatNikDisplay = (val: string) => {
    if (!val) return "";
    const chunks = val.match(/.{1,4}/g);
    return chunks ? chunks.join("-") : val;
  };

  const essayWordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/15 selection:text-blue-700 relative flex flex-col justify-between">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.1),rgba(255,255,255,0))] pointer-events-none -z-10" />

      {/* Unified Navbar */}
      <Navbar />

      {/* Connected Toast Notification */}
      {connectedToast && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">
              {isId ? "Ekstensi Owly Terhubung!" : "Owly Extension Connected!"}
            </p>
            <p className="text-emerald-100 text-[11px]">
              {isId
                ? "Membuka side panel... Jika panel belum muncul, klik icon Owly di toolbar browser."
                : "Opening side panel... If it doesn't open automatically, click the Owly icon in your browser toolbar."}
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace: Real Form + Right Sticky Access Controller */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24 w-full">
        {/* Top Header Banner */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Laptop className="w-3.5 h-3.5" />
            <span>
              {isId
                ? "Portal Pengujian Lengkap: Formulir Beasiswa Resmi 2026"
                : "Official Form Testing & Companion Portal 2026"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isId
              ? "Pendaftaran Beasiswa & Dokumen Pelayanan Publik"
              : "Scholarship Application & Public Service Form"}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
            {isId
              ? "Halaman ini menyediakan seluruh variasi input formulir nyata (teks, masked NIK/telepon, tanggal, angka, upload pasfoto biometrik, dokumen PDF, dan esai). Uji kehebatan ekstensi browser Owly untuk membimbing, menjelaskan syarat, autofill dari Vault, dan mengaudit berkas langsung dari browser Anda."
              : "This page provides all standard real-world input types (text, masked NIK/phone, dates, numbers, biometric photo upload, PDF documents, and essays). Test Owly's live extension capabilities directly on this form."}
          </p>
        </div>

        {/* 2-Column Layout: Left Form (flex-1), Right Controller (w-80 / 340px) */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Full Comprehensive Form */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
              {/* Section 1: Identitas Diri (Text, Masked, Date, Radio) */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {isId ? "1. Identitas Pribadi & Kependudukan" : "1. Personal Identity & Civil Records"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Field NIK (Masked 16 Digit) */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "nik"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="nik-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Nomor Induk Kependudukan (NIK)" : "National Identification Number (NIK)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nik"
                      id="nik-field"
                      value={formatNikDisplay(nik)}
                      onChange={handleNikChange}
                      onFocus={() => setFocusedField("nik")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="3271-XXXX-XXXX-XXXX"
                      maxLength={19}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                      <span>{isId ? "Wajib tepat 16 digit angka e-KTP." : "Must be exactly 16 valid digits."}</span>
                      <span className="font-mono font-semibold text-blue-600">{nik.length}/16</span>
                    </p>
                  </div>

                  {/* Field Nama Lengkap */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "nama"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="fullname-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Nama Lengkap (Sesuai Ijazah & KTP)" : "Full Legal Name"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullname-field"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      onFocus={() => setFocusedField("nama")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={isId ? "Contoh: Budi Santoso" : "e.g. John Doe"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isId ? "Tanpa gelar akademik atau singkatan." : "Without academic titles or prefixes."}
                    </p>
                  </div>

                  {/* Field Tempat Lahir */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "tempatLahir"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="birthplace-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Tempat Lahir (Kota/Kabupaten)" : "Place of Birth"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="birthPlace"
                      id="birthplace-field"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      onFocus={() => setFocusedField("tempatLahir")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={isId ? "Contoh: Jakarta Selatan" : "e.g. New York City"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Field Tanggal Lahir (Date Input) */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "tglLahir"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="birthdate-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Tanggal Lahir" : "Date of Birth"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      id="birthdate-field"
                      value={tglLahir}
                      onChange={(e) => setTglLahir(e.target.value)}
                      onFocus={() => setFocusedField("tglLahir")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isId ? "Format standar: YYYY-MM-DD (atau klik ikon kalender 📅)" : "Standard format: YYYY-MM-DD (or click calendar icon 📅)"}
                    </p>
                  </div>

                  {/* Field Jenis Kelamin (Radio Input) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      {isId ? "Jenis Kelamin" : "Gender"} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700">
                        <input
                          type="radio"
                          name="gender"
                          value="L"
                          checked={gender === "L"}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{isId ? "Laki-laki" : "Male"}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700">
                        <input
                          type="radio"
                          name="gender"
                          value="P"
                          checked={gender === "P"}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{isId ? "Perempuan" : "Female"}</span>
                      </label>
                    </div>
                  </div>

                  {/* Field Nomor WhatsApp (Masked Phone) */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "phone"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="phone-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Nomor Telepon / WhatsApp" : "Mobile / WhatsApp Number"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      id="phone-field"
                      value={phone}
                      onChange={handlePhoneChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+62 812-3456-7890"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Field Email (RFC 5322) */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "email"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="email-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Alamat Email Aktif" : "Active Email Address"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      id="email-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="nama@domain.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Field NPWP (Masked NPWP) */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "npwp"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="npwp-field" className="block text-xs font-bold text-slate-800 mb-1.5 cursor-pointer">
                      {isId ? "Nomor Pokok Wajib Pajak (NPWP)" : "Tax Identification Number (NPWP)"}
                    </label>
                    <input
                      type="text"
                      name="npwpNumber"
                      id="npwp-field"
                      value={npwp}
                      onChange={handleNpwpChange}
                      onFocus={() => setFocusedField("npwp")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="00.000.000.0-000.000"
                      maxLength={15}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isId ? "Opsional bagi pelamar fresh graduate." : "Optional for fresh graduates."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Kualifikasi Pendidikan & Nilai (Select, Number) */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {isId ? "2. Jenjang Studi, Universitas, & Skor Bahasa" : "2. Academic Degree, Destination & Test Scores"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Select Jenjang */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                    <label htmlFor="jenjang-field" className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isId ? "Jenjang Beasiswa" : "Target Degree"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="jenjang-field"
                      name="degreeLevel"
                      value={jenjang}
                      onChange={(e) => setJenjang(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="magister_dalam">{isId ? "Magister (S2) Dalam Negeri" : "Master's Degree (Domestic)"}</option>
                      <option value="magister_luar">{isId ? "Magister (S2) Luar Negeri" : "Master's Degree (Overseas)"}</option>
                      <option value="doktoral_dalam">{isId ? "Doktoral (S3) Dalam Negeri" : "Doctoral Degree (Domestic)"}</option>
                      <option value="doktoral_luar">{isId ? "Doktoral (S3) Luar Negeri" : "Doctoral Degree (Overseas)"}</option>
                    </select>
                  </div>

                  {/* Select Negara Tujuan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                    <label htmlFor="country-field" className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isId ? "Negara Tujuan Studi" : "Destination Country"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country-field"
                      name="targetCountry"
                      value={negaraTujuan}
                      onChange={(e) => setNegaraTujuan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="United Kingdom">{isId ? "United Kingdom (Inggris)" : "United Kingdom (UK)"}</option>
                      <option value="United States">{isId ? "United States (Amerika Serikat)" : "United States (USA)"}</option>
                      <option value="Australia">Australia</option>
                      <option value="Netherlands">{isId ? "Netherlands (Belanda)" : "Netherlands"}</option>
                      <option value="Japan">{isId ? "Japan (Jepang)" : "Japan"}</option>
                      <option value="Indonesia">Indonesia</option>
                    </select>
                  </div>

                  {/* Text Universitas */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                    <label htmlFor="univ-field" className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isId ? "Universitas Tujuan" : "Target University"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="univ-field"
                      name="targetUniversity"
                      value={universitas}
                      onChange={(e) => setUniversitas(e.target.value)}
                      placeholder={isId ? "Contoh: Universitas Indonesia" : "e.g. University of Oxford"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Number Skor TOEFL / IELTS */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "toefl"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="toefl-field" className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isId ? "Skor Resmi TOEFL ITP / iBT" : "Official TOEFL Score"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="toeflScore"
                      id="toefl-field"
                      min={310}
                      max={677}
                      value={toefl}
                      onChange={(e) => setToefl(e.target.value)}
                      onFocus={() => setFocusedField("toefl")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={isId ? "Contoh: 550" : "e.g. 550"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isId ? "Syarat Magister Luar Negeri: min. 500." : "Minimum required for overseas: 500."}
                    </p>
                  </div>

                  {/* Number IPK Skala 4.00 */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "ipk"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="gpa-field" className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isId ? "IPK Jenjang Sebelumnya (Skala 4.00)" : "Cumulative GPA (4.00 Scale)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="gpaScore"
                      id="gpa-field"
                      min={0}
                      max={4.0}
                      step={0.01}
                      value={ipk}
                      onChange={(e) => setIpk(e.target.value)}
                      onFocus={() => setFocusedField("ipk")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={isId ? "Contoh: 3.75" : "e.g. 3.75"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Number Usia Pelamar */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "usia"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="age-field" className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isId ? "Usia per 31 Desember 2026" : "Age by Dec 31, 2026"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="applicantAge"
                      id="age-field"
                      min={18}
                      max={60}
                      value={usia}
                      onChange={(e) => setUsia(e.target.value)}
                      onFocus={() => setFocusedField("usia")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={isId ? "Contoh: 26" : "e.g. 26"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isId ? "Batas Magister: maks. 35 tahun." : "Master age limit: max 35 years."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Upload Image & Dokumen Berkas (File Uploads) */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {isId ? "3. Unggah Berkas & Pasfoto Biometrik" : "3. Biometric Photo & Official Documents"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Upload Image: Pasfoto Biometrik */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                    <div>
                      <label htmlFor="photo-upload" className="block text-xs font-bold text-slate-800 mb-1">
                        {isId ? "Pasfoto Biometrik Resmi (2x2 Inci / 35x45 mm)" : "Official Biometric Passport Photo"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isId
                          ? "Format JPG/PNG, maks. 200 KB. Wajah menghadap lurus tanpa kacamata gelap."
                          : "JPG/PNG format, max 200 KB. Frontal face view per ICAO 9303 standards."}
                      </p>

                      <div className="flex items-center gap-4">
                        {photoPreview ? (
                          <div className="w-16 h-20 rounded-xl border border-blue-500 shadow-xs shrink-0 relative overflow-hidden">
                            <img
                              src={photoPreview}
                              alt="Biometric Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <Upload className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            id="photo-upload"
                            name="biometricPhoto"
                            onChange={handlePhotoUpload}
                            className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                          />
                          {photoName && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                              ✓ {photoName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload File: Scan KTP Fisik */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                    <div>
                      <label htmlFor="ktp-upload" className="block text-xs font-bold text-slate-800 mb-1">
                        {isId ? "Scan Kartu Tanda Penduduk (e-KTP Asli)" : "Scanned National ID Card"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isId ? "Format PDF atau JPG berwarna terang, tidak terpotong." : "Color PDF or JPG format, fully legible."}
                      </p>

                      <input
                        type="file"
                        id="ktp-upload"
                        name="ktpDocument"
                        accept="image/*,application/pdf"
                        onChange={(e) => setKtpFileName(e.target.files?.[0]?.name || null)}
                        className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                      />
                      {ktpFileName && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                          ✓ {ktpFileName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Upload File: Ijazah & Transkrip Terlegalisir (PDF) */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                    <div>
                      <label htmlFor="ijazah-upload" className="block text-xs font-bold text-slate-800 mb-1">
                        {isId ? "Ijazah & Transkrip Terlegalisir (PDF)" : "Certified Diploma & Transcript (PDF)"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isId ? "Wajib legalisir basah atau ttd elektronik barcode BSrE." : "Must have official university certification seal."}
                      </p>

                      <input
                        type="file"
                        id="ijazah-upload"
                        name="diplomaDocument"
                        accept="application/pdf"
                        onChange={(e) => setIjazahFileName(e.target.files?.[0]?.name || null)}
                        className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                      />
                      {ijazahFileName && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                          ✓ {ijazahFileName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Upload File: Surat Rekomendasi (PDF) */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                    <div>
                      <label htmlFor="rekomendasi-upload" className="block text-xs font-bold text-slate-800 mb-1">
                        {isId ? "Surat Rekomendasi Tokoh / Akademisi (PDF)" : "Academic Recommendation Letter (PDF)"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isId ? "Diterbitkan dalam kurun waktu 1 tahun terakhir." : "Issued within the last 12 months."}
                      </p>

                      <input
                        type="file"
                        id="rekomendasi-upload"
                        name="recommendationLetter"
                        accept="application/pdf"
                        onChange={(e) => setRekomendasiFileName(e.target.files?.[0]?.name || null)}
                        className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                      />
                      {rekomendasiFileName && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                          ✓ {rekomendasiFileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Esai Komitmen & Rencana Studi (Textarea) */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {isId ? "4. Esai Komitmen Pasca-Studi & Proposal" : "4. Post-Study Commitment Essay & Abstract"}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Textarea Esai */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "essay"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="essay-field" className="text-xs font-bold text-slate-800">
                        {isId ? "Esai Komitmen Kembali ke Indonesia & Rencana Kontribusi" : "Return Commitment & Contribution Plan Essay"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {essayWordCount} {isId ? "kata (min. 50 kata)" : "words (min. 50 words)"}
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      name="essayContribution"
                      id="essay-field"
                      value={essay}
                      onChange={(e) => setEssay(e.target.value)}
                      onFocus={() => setFocusedField("essay")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={
                        isId
                          ? "Deskripsikan rencana konkret kontribusi Anda bagi bangsa pasca menyelesaikan studi. Jelaskan peran strategis Anda dalam 5 tahun ke depan..."
                          : "Describe your concrete post-study contributions and 5-year career roadmap..."
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Textarea Proposal Ringkas */}
                  <div
                    className={`p-4 rounded-2xl transition-all border ${
                      focusedField === "proposal"
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                    }`}
                  >
                    <label htmlFor="proposal-field" className="block text-xs font-bold text-slate-800 mb-2">
                      {isId ? "Ringkasan Rencana Riset / Studi (Research Abstract)" : "Research Proposal Abstract"}
                    </label>
                    <textarea
                      rows={3}
                      id="proposal-field"
                      name="researchAbstract"
                      value={researchSummary}
                      onChange={(e) => setResearchSummary(e.target.value)}
                      onFocus={() => setFocusedField("proposal")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={
                        isId
                          ? "Jelaskan judul rencana tesis, topik utama, metodologi, dan dampaknya bagi pembangunan nasional..."
                          : "Outline your proposed thesis topic, methodology, and expected national impact..."
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Persetujuan Integritas (Checkbox) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    {isId
                      ? "Saya menyatakan dengan sebenar-benarnya bahwa seluruh informasi dan dokumen yang saya unggah pada formulir ini adalah benar, sah, dan dapat dipertanggungjawabkan secara hukum."
                      : "I hereby certify under penalty of perjury that all submitted information and uploaded credentials are true, authentic, and legally valid."}
                  </span>
                </label>
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={!agreeTerms}
                  className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                    agreeTerms
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isId ? "Kirim Berkas Pendaftaran (Submit)" : "Submit Application"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNik("");
                    setNama("");
                    setTempatLahir("");
                    setTglLahir("");
                    setPhone("");
                    setEmail("");
                    setNpwp("");
                    setToefl("");
                    setIpk("");
                    setUsia("");
                    setPhotoPreview(null);
                    setPhotoName(null);
                    setKtpFileName(null);
                    setIjazahFileName(null);
                    setRekomendasiFileName(null);
                    setEssay("");
                    setResearchSummary("");
                    setAgreeTerms(false);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isId ? "Reset Seluruh Form" : "Reset Form"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Sticky "Access with Owly" Controller Card */}
          <div className="w-full lg:w-80 shrink-0 sticky top-24 space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-[60px] pointer-events-none -z-10" />

              {/* Header Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <img src="/owly.png" alt="Owly Logo" className="w-7 h-7 object-contain drop-shadow-xs" />
                  <span className="font-extrabold text-base tracking-tight text-white">
                    Owly<span className="text-blue-400">.AI</span>
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isExtensionDetected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  <span className={isExtensionDetected ? "text-emerald-400" : "text-slate-400"}>
                    {isExtensionDetected ? "Connected" : "Standby"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {isId
                  ? "Buka side panel ekstensi Owly untuk mendampingi pengisian form ini dengan AI guidance, visual snip, autofill terenkripsi, dan audit pra-kirim."
                  : "Connect with Owly browser extension to access AI field guidance, visual snip explain, encrypted autofill, and pre-submit auditing on this form."}
              </p>

              {/* Big Access Button */}
              <button
                id="owly-access-btn"
                data-owly-action="open-sidepanel"
                type="button"
                onClick={handleAccessWithOwly}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isId ? "Access with Owly" : "Access with Owly"}</span>
              </button>

              {/* Extension Feature Checklist */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{isId ? "Field-by-Field Coach Otomatis" : "Automatic Field-by-Field Coach"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{isId ? "Hands-Free Voice Companion" : "Hands-Free Voice Companion"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{isId ? "Lightshot Visual Snip Reasoning" : "Lightshot Visual Snip Reasoning"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{isId ? "1-Click Local Vault Autofill" : "1-Click Local Vault Autofill"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{isId ? "Pre-Submit Traffic Light Auditor" : "Pre-Submit Traffic Light Auditor"}</span>
                </div>
              </div>
            </div>

            {/* Quick Install Help Pill */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600 flex items-center justify-between">
              <span className="text-[11px]">
                {isId ? "Belum menginstal ekstensi?" : "Haven't installed extension?"}
              </span>
              <Link
                href="/download"
                className="font-bold text-blue-600 hover:text-blue-700 text-[11px] flex items-center gap-1"
              >
                <span>{isId ? "Panduan Download" : "Download Guide"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Looks like you haven't installed the extension */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Icon */}
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
              <Download className="w-7 h-7" />
            </div>

            {/* Modal Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Looks like you haven&apos;t installed the extension
            </h3>

            {/* Modal Description */}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              {isId
                ? "Untuk mengakses panduan cerdas, bantuan suara hands-free, visual snip explainer, dan audit berkas anti-gagal secara otomatis di formulir ini, silakan pasang ekstensi browser Owly terlebih dahulu."
                : "To access real-time AI guidance, hands-free voice companion, visual snip reasoning, and pre-submit auditing on this form, please install the Owly AI browser extension."}
            </p>

            {/* 3 Quick Steps */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>{isId ? "Download file owly-extension.zip" : "Download owly-extension.zip"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  {isId
                    ? "Buka chrome://extensions & aktifkan Developer Mode"
                    : "Open chrome://extensions & toggle Developer Mode"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  {isId ? "Ekstrak & drag folder ke browser" : "Extract & drag folder into browser"}
                </span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/download"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all text-center"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{isId ? "Buka Halaman Download" : "Go to Download Page"}</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isId ? "Tutup" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <p>© 2026 Owly.AI • Official Form Sandbox & Companion Testing</p>
      </footer>
    </div>
  );
}
