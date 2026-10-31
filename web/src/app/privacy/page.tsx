"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Trash2,
  FileCheck2,
  Key,
  ServerOff,
  Fingerprint,
  ArrowLeft,
  ExternalLink,
  Mail,
  CheckCircle,
  AlertTriangle,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";

export default function PrivacyPage() {
  const { language } = useLanguage();
  const isId = language === "id";

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500/15 selection:text-blue-700 relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="absolute top-[500px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Floating Pill Navbar */}
      <header className="sticky top-5 z-50 max-w-5xl mx-auto px-4 w-full">
        <nav className="magic-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-xs">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Savvy.AI Logo"
              className="w-8 h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-lg tracking-tight text-savvy-navy">
              Savvy<span className="text-savvy-blue">.AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isId ? "Kembali ke Beranda" : "Back to Home"}</span>
            </Link>
            <Link href="/mock-portal" className="hover:text-blue-600 transition-colors">
              Mock Portal
            </Link>
            <Link href="/simulator" className="hover:text-blue-600 transition-colors">
              Simulator
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-12 pb-24 w-full">
        {/* Breadcrumb & Hero */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{isId ? "Keamanan & Privasi Data" : "Security & Privacy Architecture"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-2xl mx-auto">
            {isId
              ? "Bagaimana Savvy Melindungi Data Paling Sensitif Anda"
              : "How Savvy protects your most sensitive data"}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isId
              ? "Kami secara matematis memastikan kredensial identitas, kata sandi, dan dokumen paspor Anda tidak pernah dapat dibaca oleh staf pengembang Savvy, server database, maupun pihak ketiga."
              : "We mathematically ensure your identity credentials, passwords, and passport documents can never be read by Savvy engineers, database servers, or third-party brokers."}
          </p>

          {/* 3 Core Highlights Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>AES-256-GCM Client Encryption</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
              <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Document Retention</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
              <EyeOff className="w-3.5 h-3.5 text-purple-400" />
              <span>Client-Side PII Masking</span>
            </span>
          </div>
        </div>

        {/* 4 Non-Negotiable Security Commitments Grid */}
        <section className="mb-20">
          <div className="text-left mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {isId ? "4 Komitmen Keamanan Mutlak Kami" : "Our 4 Non-Negotiable Security Commitments"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isId
                ? "Pengisian formulir resmi membutuhkan rasa saling percaya penuh. Berikut adalah rincian teknis bagaimana Savvy menangani setiap lapisan informasi."
                : "Official forms demand total trust. Here is the technical breakdown of how Savvy handles each layer of information."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="magic-card p-6 text-left relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-2">
                1. Client-Side Vault Encryption (AES-256-GCM)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isId
                  ? "Data profil tersimpan Anda (nama, alamat, tanggal lahir) dienkripsi langsung di dalam browser menggunakan Web Crypto API asli dengan PBKDF2 (100.000 iterasi) dan AES-256-GCM. Kunci dekripsi tidak pernah meninggalkan perangkat Anda. Server hanya menerima ciphertext yang tidak dapat dibuka."
                  : "Your stored profile data (name, address, date of birth) is encrypted right inside your browser using the native Web Crypto API with PBKDF2 (100,000 iterations) and AES-256-GCM. The decryption keys never leave your device. Savvy servers only store ciphertext."}
              </p>
            </div>

            {/* Card 2 */}
            <div className="magic-card p-6 text-left relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-2">
                2. Zero Document Storage (Ephemeral OCR)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isId
                  ? "Saat Anda mengunggah KTP, ijazah, atau paspor untuk ekstraksi pintar, berkas diproses di memori RAM sementara browser. Begitu data terekstraksi ke dalam brankas terenkripsi, berkas biner asli langsung dimusnahkan secara permanen. Tidak ada arsip dokumen yang disimpan."
                  : "When you upload an ID card, diploma, or passport for smart extraction, the document is processed in temporary browser memory. Once canonical fields are extracted into your encrypted vault, the original binary file is permanently erased. No document archives exist."}
              </p>
            </div>

            {/* Card 3 */}
            <div className="magic-card p-6 text-left relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-2">
                3. Client-Side PII Masking Before Cloud AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isId
                  ? "Untuk menjelaskan pertanyaan formulir yang rumit, Savvy hanya mengirimkan label pertanyaan, petunjuk sekitar, dan struktur halaman ke Google Gemini. Seluruh nilai identitas pribadi (nomor paspor, NIK, nomor telepon) disamarkan (masked) di sisi klien sebelum paket jaringan dikirim."
                  : "To explain a confusing form question, Savvy only transmits the question label, surrounding instructions, and page structure to Google Gemini. All personal identity values (passport numbers, phone numbers, NIK) are masked client-side before any network packet is dispatched."}
              </p>
            </div>

            {/* Card 4 */}
            <div className="magic-card p-6 text-left relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ServerOff className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-2">
                4. Strict Exclusion of Passwords & Financial Inputs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isId
                  ? "Savvy dikunci secara hard-coded untuk mengabaikan seluruh kolom autentikasi. Tag input dengan tipe 'password', kode CVV, nomor kartu kredit, kode OTP, dan PIN bank tidak pernah dibaca, tidak pernah disarankan untuk AutoFill, dan tidak pernah dicatat."
                  : "Savvy is hard-coded to ignore authentication fields. Input tags with type=\"password\", CVV codes, credit card numbers, OTPs, and bank PINs are never captured, never suggested for AutoFill, and never logged."}
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Privacy Policy Section */}
        <section className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 sm:p-10 text-left space-y-8 shadow-xs">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Privacy Policy for Savvy.ai & Browser Extension
            </h2>
            <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">Last Updated: October 2026</span>
              <span>•</span>
              <span>Valid for Google Chrome, Microsoft Edge, Firefox, and Opera extensions.</span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-white border border-blue-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Summary of Our Privacy Guarantee</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Zero Plaintext: </span>
                  <span>Your profile data is encrypted on your device using AES-256-GCM. We never hold your keys.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Zero Document Storage: </span>
                  <span>Uploaded identity cards and diplomas are analyzed in temporary RAM and immediately discarded.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Zero Authentication Capture: </span>
                  <span>Passwords, credit cards, CVVs, and OTP inputs are never captured or recorded.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">No Data Brokering: </span>
                  <span>We never sell, monetize, or transfer personal data to advertising networks.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              1. Information We Collect and Process
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Savvy.ai operates as a browser extension and client-side assistance tool. To assist you with filling and auditing official forms, Savvy processes the following categories of information:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li>
                <span className="font-bold text-slate-800">Form Context & Field Labels:</span> HTML form field names, input descriptions, labels, and relevant on-screen instructions required to provide contextual explanations.
              </li>
              <li>
                <span className="font-bold text-slate-800">Encrypted User Vault:</span> User-supplied details (such as full name, date of birth, and contact information) entered into the Savvy Smart Vault. This data is encrypted locally using the Web Crypto API prior to any cloud synchronization.
              </li>
              <li>
                <span className="font-bold text-slate-800">Temporary Document Extractions:</span> When you upload a passport or certificate to autofill forms, OCR extraction is executed ephemerally. The source document file is purged from memory once extraction completes.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              2. Single-Purpose Exemption for Passwords & Financial Data
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In strict accordance with Google Chrome Web Store User Data FAQ and Mozilla AMO Add-on Policies:
            </p>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
              Savvy.ai is engineered with hardcoded client-side filters that prevent access to input tags with <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-[11px]">type="password"</code>, credit card number patterns, security CVV numbers, bank PINs, and one-time authentication tokens (OTP). Such inputs are completely ignored and never processed.
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              3. How Cloud AI Analysis Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To provide natural language explanations and audio voice guidance, Savvy transmits non-sensitive form field questions and contextual descriptions to Google Gemini models via Google Cloud infrastructure.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Before any request leaves your device, Savvy runs a client-side regex scrubber that masks personal identifiers (such as national ID numbers, passport codes, and phone numbers). Google Cloud does not use data submitted through enterprise API endpoints to train underlying foundation models.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              4. Permissions Used in Browser Extensions
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Savvy requests only permissions strictly necessary to deliver its core features in compliance with Chrome Web Store policies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-blue-600 block">sidePanel</span>
                <span className="text-slate-600 leading-snug block">
                  To render the friendly conversational assistant beside your webpage without obstructing form inputs.
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-blue-600 block">Host Permissions (&lt;all_urls&gt;)</span>
                <span className="text-slate-600 leading-snug block">
                  Strictly required so users can navigate arbitrary third-party application portals (e.g. government visa portals, university admission systems, scholarship sites) where Savvy detects form inputs, translates confusing instructions, and allows users to crop and explain ambiguous on-screen questions via the 'Explain This' visual snippet tool.
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-blue-600 block">activeTab & scripting</span>
                <span className="text-slate-600 leading-snug block">
                  To highlight and explain form fields on the active webpage on demand.
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-blue-600 block">storage</span>
                <span className="text-slate-600 leading-snug block">
                  To save your client-side encrypted vault and accessibility profile preferences.
                </span>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              5. User Control & Data Deletion
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You retain complete control over your stored credentials. You may clear your encrypted vault, remove saved profiles, or uninstall the extension at any time directly through the extension settings, which permanently wipes all locally stored keys.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              6. Contact & Data Protection Officer
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              For questions regarding this Privacy Policy or security practices, reach out to our team at:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="mailto:privacy@savvy.id"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>privacy@savvy.id</span>
              </a>
              <a
                href="mailto:support@savvy.id"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>support@savvy.id</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Savvy.AI • Built for Meta Global AI Hackathon</p>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Security & Privacy
            </Link>
            <a
              href="https://github.com/arfabi/savvy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
