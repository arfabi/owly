import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Layers,
  ArrowRight,
  ExternalLink,
  Bot,
  Sliders,
  Type,
  Maximize2,
  Pause,
  Contrast,
  Compass,
  FileText,
  BadgeAlert,
  ChevronRight,
  Sparkle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500/15 selection:text-blue-700 relative overflow-hidden">
      {/* SkyAgent Style Light Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[120px] pointer-events-none -z-10" />
      
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Floating Pill Navbar (SkyAgent Magic UI style) */}
      <header className="sticky top-5 z-50 max-w-5xl mx-auto px-4">
        <nav className="magic-pill rounded-full px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
              S
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Savvy<span className="text-blue-600">.AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              Meta Hackathon 2026
            </span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#bento" className="hover:text-blue-600 transition-colors">
              Pilar Solusi
            </a>
            <a href="#accessibility" className="hover:text-blue-600 transition-colors">
              Accessibility Hub
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              Cara Kerja
            </a>
            <Link href="/mock-portal" className="hover:text-blue-600 transition-colors">
              Mock Portal
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/mock-portal"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-all flex items-center gap-1.5"
            >
              <span>Demo</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
            <Link
              href="#install"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              Pasang Ekstensi
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 max-w-5xl mx-auto text-center relative">
        {/* SkyAgent Capsule Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkle className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>Meta Global AI Developer Hackathon 2026 • Build for Your World</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.12] mb-6">
          Pahami. Isi. Periksa.
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Sebelum Anda Menekan Submit.
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Asisten browser cerdas berbasis <strong>Compound Multi-Agent System (Meta Muse Spark 1.3)</strong> untuk warga dan pendaftar formulir publik — tanpa perlu integrasi dari pemilik portal, dengan jaminan privasi <em>Zero-Knowledge</em>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <Link
            href="/mock-portal"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all group"
          >
            <span>Uji Coba di Mock Portal LPDP</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#bento"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-sm border border-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Pelajari Arsitektur & Keamanan</span>
          </a>
        </div>

        {/* Clean Light Browser Frame Mockup */}
        <div className="relative mx-auto rounded-2xl bg-white shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden text-left">
          {/* Top Browser Chrome Bar */}
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-white rounded-md px-3 py-1 text-xs text-slate-500 flex items-center gap-2 border border-slate-200 shadow-2xs">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span className="text-slate-700 font-mono text-[11px]">https://beasiswalpdp.kemenkeu.go.id/pendaftaran/form</span>
            </div>
          </div>

          {/* Simulated Browser Webpage Content & Savvy Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-white">
            {/* Left: Simulated Portal Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 relative bg-[#fafafa]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Formulir Pendaftaran Beasiswa LPDP 2026</h3>
                  <p className="text-xs text-slate-500">Tahap 1: Data Identitas Diri & Dokumen Resmi</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Portal Terdeteksi
                </span>
              </div>

              {/* Form Input with Beacon Spotlight */}
              <div className="space-y-4">
                <div className="relative p-4 rounded-xl bg-blue-50/40 border-2 border-blue-500 shadow-xs transition-all">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-900">
                      Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Field Aktif
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled
                    value="3271041908980002"
                    className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 shadow-2xs outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sesuai format 16 digit sah
                    </span>
                    <span className="text-slate-500 text-[10px]">Autofilled via Vault</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Surat Pernyataan Komitmen Kembali (Apostille / Legalisir) <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50/60">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-700 font-medium">Format PDF resmi, maks. 2MB</p>
                    <p className="text-[10px] text-slate-500">Wajib legalisir basah sesuai Juknis Bab IV</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Savvy.AI Floating Side Panel */}
            <div className="lg:col-span-5 p-5 bg-white flex flex-col justify-between border-l border-slate-100">
              <div>
                {/* Agent Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <span className="text-xs font-bold text-slate-900">Field Coach (Juknis RAG)</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 Official
                  </span>
                </div>

                {/* 4-Element Guidance Card */}
                <div className="magic-card p-4 space-y-3 text-xs text-left mb-3 bg-slate-50/70 border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Aturan Resmi Juknis:</span>
                    <p className="text-slate-800 font-medium mt-0.5 leading-snug">
                      NIK wajib 16 digit asli sesuai e-KTP fisik dan terdaftar aktif di Dukcapil.
                    </p>
                  </div>
                  <div className="bg-blue-50/60 rounded-lg p-2.5 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 block">Jebakan Umum (Pitfall):</span>
                    <p className="text-[11px] text-blue-900 mt-0.5 leading-snug">
                      Jangan menggunakan NIK pada Kartu Keluarga lama bila pernah pindah domisili.
                    </p>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                    <span>Sumber: Juknis LPDP 2026 Halaman 14</span>
                    <span className="text-blue-600 font-semibold">Meta Vector Store</span>
                  </div>
                </div>

                {/* Single-Field Autofill Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Isi Kolom Ini dari Vault (3271...)</span>
                </button>
              </div>

              {/* Bottom Assistant Status: Voicebot & Audit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-[11px]">Handsfree Voicebot Siap</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Audit: 100% Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Portals Marquee */}
      <section className="py-10 border-y border-slate-200 bg-slate-50/70 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
          Bimbingan Terarah di Atas Seluruh Portal Resmi & Formulir Digital
        </p>
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex items-center gap-8 text-slate-700 font-semibold text-xs whitespace-nowrap">
            {[
              "Portal Beasiswa LPDP Kemenkeu",
              "Aplikasi Visa Schengen Eropa",
              "Layanan Paspor RI (M-Paspor)",
              "Portal Rekrutmen CASN / CPNS",
              "US Visa Portal (DS-160)",
              "Australia Awards Scholarship",
              "Portal Izin Usaha OSS Kemeninvest",
              "Formulir Beasiswa LPDP Kemenkeu",
              "Aplikasi Visa Schengen Eropa",
              "Layanan Paspor RI (M-Paspor)",
            ].map((name, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Bento Grid Section */}
      <section id="bento" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            3 Pilar Solusi
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mt-3 mb-4">
            Dirancang Khusus untuk Rasa Aman Warga
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Menggabungkan kecerdasan reasoning Meta Muse Spark dengan penjaga deterministik lokal tanpa halusinasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: UNDERSTAND */}
          <div className="magic-card p-7 flex flex-col justify-between border-t-4 border-t-blue-600">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Pilar 1</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">UNDERSTAND</h3>
              <p className="text-slate-500 text-xs italic mb-4">
                *"Kolom ini maksudnya apa dan apa aturannya?"*
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Field Coach:</strong> RAG resmi via Meta Vector Store dengan sitasi bab & halaman sah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Explain This:</strong> Snip area membingungkan dengan penutup sensor DOM Masking lokal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Handsfree Voicebot:</strong> Tanya jawab suara handsfree via Silero VAD & Muse Voice.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Didukung: Meta Vector Store (`file_search`)
            </div>
          </div>

          {/* Card 2: FILL */}
          <div className="magic-card p-7 flex flex-col justify-between border-t-4 border-t-indigo-600">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Pilar 2</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">FILL</h3>
              <p className="text-slate-500 text-xs italic mb-4">
                *"Bagaimana mengisinya dengan benar, konsisten, dan cepat?"*
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Multiple Vault:</strong> Terenkripsi lokal AES-256-GCM (Zero-Knowledge, data tidak pernah ke server).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Dual Autofill & Undo:</strong> Single-field per kartu panduan atau batch 1-click dengan tombol undo instan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Essay Coach:</strong> Merapikan 3 bullet fakta kasar menjadi draf narasi formal tanpa halusinasi.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Didukung: WebCrypto AES-256-GCM & Muse Spark 1.3
            </div>
          </div>

          {/* Card 3: AUDIT */}
          <div className="magic-card p-7 flex flex-col justify-between border-t-4 border-t-emerald-600">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Pilar 3</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">AUDIT</h3>
              <p className="text-slate-500 text-xs italic mb-4">
                *"Apakah ada yang salah atau berpotensi ditolak?"*
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Traffic Light Auditor:</strong> Evaluasi regex instan (&lt;300ms) untuk format NIK, tanggal, dan email.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Audit Kepatuhan Foto (Zero-Pixel):</strong> Uji rasio, blur Laplacian, dan biometrik tanpa manipulasi piksel (ICAO).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Consistency Checker:</strong> Agen penalaran pemeriksa keselarasan data silang antar-kolom form.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Didukung: Sharp in-memory deterministik + FSM
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility HUB 14 Tools Showcase */}
      <section id="accessibility" className="py-20 px-4 max-w-6xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Kenyamanan Sensorik & Kognitif</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Accessibility HUB: 14 Tools Deterministik
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-3">
            Dapat diaktifkan secara <strong>manual lewat klik tile kartu</strong> atau dipicu oleh <strong>reasoning AI saat pengguna mengeluh pusing/lelah</strong>. Murni berjalan di browser lokal tanpa biaya token ($0).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { title: "Reading Spotlight", icon: Eye, status: "Focus Line" },
            { title: "Text to Speech (TTS)", icon: Volume2, status: "Web Speech" },
            { title: "Contrast Mode", icon: Contrast, status: "WCAG AAA" },
            { title: "Highlight Links", icon: ArrowRight, status: "High Visibility" },
            { title: "Bigger Text Size", icon: Type, status: "Scalable" },
            { title: "Text Spacing", icon: Sliders, status: "Letter Spacing" },
            { title: "Pause Animations", icon: Pause, status: "Anti-Distraction" },
            { title: "Hide All Images", icon: Layers, status: "Clean Form" },
            { title: "Dyslexia Font", icon: Type, status: "OpenDyslexic" },
            { title: "Big Cursor", icon: Maximize2, status: "SVG Pointer" },
            { title: "Live Tooltips", icon: FileText, status: "Contextual" },
            { title: "Line Height", icon: Sliders, status: "Comfort Spacing" },
            { title: "Text Alignment", icon: Type, status: "Normalized" },
            { title: "Color Saturation", icon: Contrast, status: "Monochrome" },
          ].map((tool, idx) => (
            <div
              key={idx}
              className="magic-card p-3.5 text-center flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <tool.icon className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-1">{tool.title}</div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {tool.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works: 4 Easy Steps */}
      <section id="how-it-works" className="py-20 px-4 max-w-5xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Alur Pengguna
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3">
            Dari Ambigu Menjadi Siap Kirim dalam 4 Langkah
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Buka Portal Formulir",
              desc: "Ekstensi mendeteksi formulir secara pasif tanpa membaca isian data privasi pengguna.",
            },
            {
              step: "02",
              title: "Panduan Juknis Resmi",
              desc: "Field Coach & Voicebot memberikan konteks dan contoh sah dari Meta Vector Store.",
            },
            {
              step: "03",
              title: "Autofill Terkontrol",
              desc: "Isi per-kolom atau serentak dari Vault terenkripsi lokal dengan fitur 1-click Undo.",
            },
            {
              step: "04",
              title: "Pre-Submit Audit",
              desc: "Pastikan lampu hijau menyala untuk format regex, biometrik pasfoto, dan konsistensi data.",
            },
          ].map((item, idx) => (
            <div key={idx} className="magic-card p-6 relative">
              <span className="text-4xl font-black text-slate-200 block mb-3">{item.step}</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SkyAgent Call to Action Banner (High Contrast Dark Slate / Royal Blue Accent) */}
      <section id="install" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[90px] pointer-events-none -z-10" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Siap Mengisi Formulir Tanpa Cemas?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Uji coba Savvy.AI sekarang di Mock Portal resmi atau pasang ekstensi Chrome untuk pengalaman pendaftaran publik yang lebih manusiawi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/mock-portal"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Buka Demo Mock Portal</span>
              <ExternalLink className="w-4 h-4 text-white" />
            </Link>
            <a
              href="https://github.com/arfabi/savvy"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Dokumentasi GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
        <p>
          © 2026 Savvy.AI • Dibuat untuk <strong>Meta Global AI Developer Hackathon 2026</strong> • Track: Indie Developer
        </p>
        <p className="mt-1 text-slate-400">
          Built for Your World with Meta Muse Spark, Responses API, and Native Web Accessibility.
        </p>
      </footer>
    </div>
  );
}
