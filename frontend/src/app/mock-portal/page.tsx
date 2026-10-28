"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  Lock,
  Sparkles,
  Eye,
  FileText,
  Volume2,
} from "lucide-react";

export default function MockPortalPage() {
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [essay, setEssay] = useState("");
  const [activeField, setActiveField] = useState<string | null>("nik");
  const [auditResult, setAuditResult] = useState<{
    status: "idle" | "green" | "yellow" | "red";
    message: string;
  }>({ status: "idle", message: "" });

  const handleAudit = () => {
    if (!nik || !nama || !tglLahir || !essay) {
      setAuditResult({
        status: "red",
        message: "Audit Gagal (Lampu Merah): Masih ada kolom wajib yang belum diisi lengkap.",
      });
      return;
    }
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      setAuditResult({
        status: "red",
        message: "Audit Gagal (Lampu Merah): NIK wajib berjumlah tepat 16 digit angka.",
      });
      return;
    }
    if (essay.split(/\s+/).filter(Boolean).length < 20) {
      setAuditResult({
        status: "yellow",
        message: "Peringatan (Lampu Kuning): Esai kontribusi terlalu singkat (disarankan minimal 50 kata).",
      });
      return;
    }
    setAuditResult({
      status: "green",
      message: "Audit Berhasil (Lampu Hijau): Semua field valid, sesuai format Juknis LPDP 2026. Siap dikirim!",
    });
  };

  const autofillFromVault = () => {
    setNik("3271041908980002");
    setNama("Budi Santoso");
    setTglLahir("1998-08-19");
    setEssay(
      "Pasca menyelesaikan studi Magister Kebijakan Publik, rencana strategis saya adalah kembali mengabdi di Badan Perencanaan Pembangunan Nasional (Bappenas). Saya akan memimpin perancangan program hilirisasi ekonomi hijau berbasis riset kebijakan tepat guna guna memperkuat ketahanan ekonomi nasional."
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 font-sans pb-16">
      {/* Top Banner Pemerintah / Instansi Mock */}
      <div className="bg-[#1e3a8a] text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
          <span className="font-bold tracking-wider uppercase text-[11px] bg-blue-900 px-2 py-0.5 rounded">
            Simulasi Resmi
          </span>
          <span className="truncate">
            Portal Pendaftaran Beasiswa Lembaga Pengelola Dana Pendidikan (LPDP) Republik Indonesia
          </span>
        </div>
        <Link
          href="/"
          className="text-xs text-blue-200 hover:text-white flex items-center gap-1 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Landing Page</span>
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="border-b pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Formulir Beasiswa Reguler Magister / Doktor 2026
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Tahap 1: Data Identitas Pribadi, Dokumen Biometrik, &amp; Rencana Pasca-Studi
              </p>
            </div>
            <button
              onClick={autofillFromVault}
              type="button"
              className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-center"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulasi 1-Click Vault Autofill</span>
            </button>
          </div>

          {/* Form Content */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Field NIK */}
            <div
              className={`p-4 rounded-xl transition-all ${
                activeField === "nik"
                  ? "bg-indigo-50/70 border-2 border-indigo-500 shadow-sm"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActiveField("nik")}
            >
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <span>Nomor Induk Kependudukan (NIK)</span>
                  <span className="text-red-500">*</span>
                </label>
                {activeField === "nik" && (
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                    Spotlight Aktif (Savvy)
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 digit angka sesuai e-KTP fisik"
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Pastikan NIK masih aktif di Dinas Kependudukan dan Pencatatan Sipil (Dukcapil).
              </p>
            </div>

            {/* Field Nama Lengkap */}
            <div
              className={`p-4 rounded-xl transition-all ${
                activeField === "nama"
                  ? "bg-indigo-50/70 border-2 border-indigo-500 shadow-sm"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActiveField("nama")}
            >
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Nama Lengkap (Sesuai Ijazah &amp; KTP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Field Tanggal Lahir */}
            <div
              className={`p-4 rounded-xl transition-all ${
                activeField === "tgl"
                  ? "bg-indigo-50/70 border-2 border-indigo-500 shadow-sm"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActiveField("tgl")}
            >
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tglLahir}
                onChange={(e) => setTglLahir(e.target.value)}
                className="w-full sm:w-64 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Field Upload Pasfoto */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Unggah Pasfoto Biometrik Resmi (2x2 Inci / 35x45 mm) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">
                  Klik untuk unggah foto berlatar polos (putih/merah)
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Format JPG/PNG, ukuran maks. 200 KB. Diaudit biometrik ketajaman Laplacian &amp; proporsi kepala ICAO 9303.
                </p>
              </div>
            </div>

            {/* Field Esai */}
            <div
              className={`p-4 rounded-xl transition-all ${
                activeField === "essay"
                  ? "bg-indigo-50/70 border-2 border-indigo-500 shadow-sm"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setActiveField("essay")}
            >
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Esai Komitmen Kembali ke Indonesia &amp; Rencana Pasca-Studi <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-gray-500">
                  {essay.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
              <textarea
                rows={4}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Deskripsikan rencana konkret kontribusi Anda bagi bangsa pasca menyelesaikan studi..."
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Audit Status Alert */}
            {auditResult.status !== "idle" && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 text-xs font-medium ${
                  auditResult.status === "green"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : auditResult.status === "yellow"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {auditResult.status === "green" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {auditResult.status === "yellow" && (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {auditResult.status === "red" && (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">Hasil Pre-Submit Auditor (Savvy.AI)</div>
                  <div className="mt-0.5">{auditResult.message}</div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAudit}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Shield className="w-4 h-4" />
                <span>Jalankan Pre-Submit Audit</span>
              </button>

              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gray-200 text-gray-400 font-bold text-xs cursor-not-allowed"
                title="Tombol ini hanya ditekan oleh pengguna sendiri setelah lampu hijau audit menyala"
              >
                Kirim Formulir (Submit)
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
