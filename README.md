# Savvy.AI — Your AI Browser Companion for Forms & Web

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/compass.svg" width="64" height="64" alt="Savvy.AI Logo" />
</p>

<p align="center">
  <strong>Savvy.AI — Your AI Browser Companion for Forms & Web</strong><br>
  <em>Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark.</em><br>
  Dibangun untuk <strong>Meta Global AI Developer Hackathon 2026</strong> (Track: <em>Indie Developer</em> · Tema: <em>Build for Your World</em>).
</p>

<p align="center">
  <a href="https://savvy-plum.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel%20Production-blue?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://savvy-plum.vercel.app/landingpage/simulator"><img src="https://img.shields.io/badge/Web%20Simulator-Interactive-purple?style=for-the-badge" alt="Simulator" /></a>
  <a href="https://github.com/arfabi/savvy"><img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Model-Meta%20Muse%20Spark%20Open-blueviolet?style=for-the-badge" alt="Meta Muse Spark" />
  <img src="https://img.shields.io/badge/Tests-20%2F20%20Pass%20(100%25)-brightgreen?style=for-the-badge" alt="Tests 100%" />
</p>

---

## ⚡ Akses Cepat untuk Dewan Juri Hackathon

Evaluator dan dewan juri dapat menguji Savvy.AI secara instan tanpa perlu mengompilasi kode ekstensi lokal:

| Layanan | Tautan Langsung | Keterangan Pengujian |
|---|---|---|
| 🌐 **Web Showcase & Landing** | [savvy-plum.vercel.app](https://savvy-plum.vercel.app) | Presentasi visual SkyAgent UI, fitur Bento Grid, dan panduan lengkap. |
| 🧪 **In-Browser Extension Simulator** | [savvy-plum.vercel.app/.../simulator](https://savvy-plum.vercel.app/landingpage/simulator) | Simulator Chrome Side Panel MV3 interaktif lengkap dengan Voicebot & Essay Coach. |
| 📝 **Interactive LPDP 2026 Portal** | [savvy-plum.vercel.app/.../mock-portal](https://savvy-plum.vercel.app/landingpage/mock-portal) | Arena pengujian pengisian formulir simulasi LPDP 2026 dengan autofill dan audit. |
| 🔑 **1-Click Demo Akun Juri** | Email: `judge@savvy.ai`<br>Sandi: `SavvyJudge2026!` | Klik tombol **"1-Click Masuk Demo Juri"** di header untuk langsung membuka Vault terenkripsi. |

---

## 🏛️ Arsitektur Sistem (Compound Multi-Agent System)

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Client Browser Layer (Chrome MV3 / Web)"]
        UserForm["Web Form Portal\n(LPDP / Schengen / CASN)"]
        ShadowDOM["Closed Shadow DOM (#savvy-root)\n• Beacon Spotlight\n• 14 A11y WCAG Tools"]
        SidePanel["Chrome Side Panel React App\n• Coach Tab • Vault Tab\n• Auditor Tab • A11y Tab"]
        WebCrypto["WebCrypto AES-256-GCM\nClient-Side Vault Engine"]
        CanvasMask["Canvas DOM Blackout Mask\n(Zero Face Biometrics Transit)"]
        PIIGuard["PII Censor Guard\n(Client-side NIK/NPWP Interceptor)"]
    end

    subgraph GatewayLayer["☁️ Vercel Next.js Serverless Gateway (Edge / RAM-Only)"]
        APIChat["POST /api/chat\n(10-Msg Sliding Window + Compactor)"]
        APICoach["POST /api/coach/field\n(Two-Tier Cache & Juknis RAG)"]
        APIExplain["POST /api/explain\n(Multimodal Vision Jargon Buster)"]
        APIEssay["POST /api/essay/coach\n(High-Reasoning Narrative Generator)"]
        APIAudit["POST /api/photo/audit\n(Zero-Pixel C++ Sharp Validator)"]
    end

    subgraph MetaAILayer["🤖 Meta AI Model on Baseten"]
        MuseSpark["Meta Muse Spark Open\n(meta-models/muse-spark-open-1026)\n• 816ms Latency • Rp 3/Chat Turn"]
    end

    subgraph DataLayer["🗄️ Supabase PostgreSQL Cloud"]
        SupaAuth["Supabase Auth (50k MAU Free Tier)\n• Meta / Google / Demo Judge"]
        SupaRAG["Tabel juknis_chunks\n(13 Regulasi Sah Terverifikasi)"]
        SupaCache["Tabel coach_cache\n(<15ms L1/L2 Response)"]
        SupaVault["Tabel user_vault\n(Hanya Menyimpan Ciphertext & IV)"]
    end

    UserForm <--> ShadowDOM
    ShadowDOM <--> SidePanel
    SidePanel --> PIIGuard
    SidePanel --> CanvasMask
    SidePanel --> WebCrypto
    SidePanel <--> GatewayLayer

    APICoach --> SupaCache
    APICoach --> SupaRAG
    APICoach --> MuseSpark
    APIChat --> MuseSpark
    APIExplain --> MuseSpark
    APIEssay --> MuseSpark

    WebCrypto -.->|Sinkronisasi Ciphertext| SupaVault
    SidePanel -.->|Meta Social Login| SupaAuth
```

---

## 🎯 3 Pilar Solusi Savvy.AI

### 1. Pillar 1: Understand (Pahami)
- **Beacon Spotlight & Field Coach RAG:** Kursor pada kolom formulir memicu sorotan fokus di Closed Shadow DOM dan memanggil kartu panduan 4-elemen (*Arti Istilah, Cara Mengisi, Contoh Valid Fiktif, Jebakan Diskualifikasi*) lengkap dengan bukti sitasi bab & halaman dokumen sah.
- **Snip & Explain (Jargon Buster):** Seleksi potongan teks regulasi yang rumit untuk diterjemahkan menjadi penjelasan bahasa awam yang mudah dipahami.
- **Handsfree Voicebot:** Asisten percakapan suara dwibahasa (Indonesia & Inggris) berlatensi sub-detik (<900ms) menggunakan Web Speech API bawaan browser/OS.

### 2. Pillar 2: Fill (Isi)
- **Zero-Knowledge Encrypted Vault:** Menyimpan data identitas (KTP, paspor, transkrip) yang dienkripsi secara lokal via **WebCrypto AES-256-GCM**.
- **1-Click Batch Autofill & Safe Undo:** Mengisi seluruh kolom formulir secara instan dan menyediakan bilah pembatalan (Undo Bar 100%) jika pengguna ingin mengembalikan formulir ke keadaan semula.
- **Academic Essay Coach:** Mengubah poin-poin kasar pengalaman pendaftar menjadi draf narasi esai formal akademik tanpa pernah mengarang fakta fiktif.

### 3. Pillar 3: Audit (Periksa)
- **Traffic Light Pre-Submit Auditor:** Mesin FSM deterministik memeriksa konsistensi silang data (Nama di formulir vs KTP, validitas 16 digit NIK, batas usia jalur afirmasi vs reguler, dan syarat TOEFL/IELTS) sebelum berkas dikirim.
- **Zero-Pixel Photo Compliance Inspector:** Memeriksa pasfoto biometrik (rasio 2x2 inci / 35x45mm, ketajaman fokus Laplacian, dan keseragaman latar belakang) secara in-memory C++ (`sharp`) tanpa pernah memodifikasi piksel asli pemohon (kepatuhan standar ICAO Doc 9303).
- **14 Deterministic Accessibility (A11y) Tools:** Mendukung pemohon disabilitas dan neurodivergen (Reading Guide, High Contrast, Dyslexia Font, Pause Animations, Text Spacing).

---

## 🔒 Jaminan Privasi & Kepatuhan UU PDP No. 27/2022

1. **Client-Side Canvas Face Blackout Mask:** Sebelum gambar dokumen identitas dikirim ke model penglihatan multimodal, kanvas browser secara otomatis menutup foto wajah dan tanda tangan dengan kotak hitam pekat. **Nol data biometrik wajah** yang pernah terkirim ke jaringan.
2. **WebCrypto AES-256-GCM Zero-Knowledge Vault:** Kunci enkripsi diturunkan langsung dari PIN pengguna (PBKDF2 100.000 iterasi). Server Supabase hanya menerima ciphertext dan IV acak.
3. **Client-Side PII Chat Guard:** Sensor ekspresi reguler (regex) mencegat dan menyamarkan NIK (16 digit) dan NPWP (15-16 digit) sebelum teks pesan terkirim ke jaringan publik.

---

## 🧪 Hasil Pengujian Otomatis End-to-End (P4)

Diverifikasi langsung melalui skrip pengujian [e2e_verification.mjs](file:///d:/webdev/laragon/www/savvy/web/scripts/e2e_verification.mjs):

```text
========================================================
   🧪 SAVVY.AI END-TO-END VERIFICATION & SECURITY AUDIT
========================================================
▶ [Test 1] Client & Server PII Censor Guard (P4.2)
  ✅ PASS: NIK 16-digit berhasil disamarkan sebelum transit
  ✅ PASS: NPWP berhasil disamarkan sebelum transit
  ✅ PASS: Tag pengganti [REDACTED_NIK] disisipkan secara deterministik

▶ [Test 2] Pre-Submit Consistency & Traffic Light Rules (P4.1)
  ✅ PASS: Validasi NIK tepat 16 digit numerik
  ✅ PASS: Validasi Nama Lengkap bebas karakter angka/simbol
  ✅ PASS: Validasi sintaks RFC alamat email resmi
  ✅ PASS: Validasi ambang TOEFL/IELTS memenuhi regulasi beasiswa
  ✅ PASS: Sistem berhasil mendeteksi diskualifikasi (Fatal Red Light)

▶ [Test 3] Zero-Knowledge AES-256-GCM Cryptographic Vault (P4.2)
  ✅ PASS: Payload plaintext memuat NIK sebelum enkripsi
  ✅ PASS: Ciphertext yang dikirim ke Supabase tidak memuat plaintext NIK
  ✅ PASS: Initialization Vector (96-bit) & Salt (128-bit) tergenerasi unik

▶ [Test 4] Baseten Muse Spark Open Model Verification (P4.5)
  ✅ PASS: BASETEN_API_KEY terkonfigurasi di environment
  ✅ PASS: Base URL mengarah ke endpoint Baseten Inference resmi
  ✅ PASS: Model ID persis 'meta-models/muse-spark-open-1026' (Meta Muse Spark Open)
  Menguji ping latensi live ke Baseten Inference API...
  ✅ PASS: Respon live Baseten sukses (HTTP 200) dalam 816ms
  ✅ PASS: Model Muse Spark Open mengembalikan token jawaban
  ⚡ Latensi Live Baseten: 816ms (Benchmark < 2500ms tercapai)

▶ [Test 5] Juknis RAG Chunks Database Integrity (P4.1)
  ✅ PASS: Supabase credentials terkonfigurasi
  ✅ PASS: Kueri tabel juknis_chunks Supabase berhasil tanpa error
  ✅ PASS: Terdapat 13 entri regulasi resmi LPDP/Schengen/CASN di database
  ✅ PASS: Regulasi LPDP terverifikasi aktif dengan sitasi: Persyaratan Umum Pendaftar Beasiswa Reguler

========================================================
   HASIL VERIFIKASI: 20 / 20 PENGUJIAN LULUS (100%)
   Zero Raw PII Transit Guarantee: TERVERIFIKASI ✅
   Baseten Muse Spark Open Model Compliance: TERVERIFIKASI ✅
   Regulatory Grounded RAG Citation: TERVERIFIKASI ✅
========================================================
```

---

## 📦 Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- Node.js versi 18 ke atas
- Akun Baseten dengan API Key aktif
- Proyek Supabase PostgreSQL

### 2. Menjalankan Web Application (Next.js 16)
```bash
cd web
npm install
# Konfigurasikan variabel lingkungan di web/.env.local
npm run dev
```
Buka browser pada `http://localhost:3000`.

### 3. Mengompilasi Chrome Extension MV3
```bash
cd extension
npm install
npm run build
```
1. Buka Google Chrome dan navigasikan ke `chrome://extensions/`.
2. Aktifkan **Developer mode** di pojok kanan atas.
3. Klik **Load unpacked** dan pilih folder `extension/dist/`.

---

## 🏆 Kepatuhan Aturan Hackathon (Meta Model Policy)

> **Pernyataan Kepatuhan:** Proyek ini memanggil model kecerdasan buatan terbuka **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)** melalui Baseten Inference API secara eksklusif. Proyek ini tidak memanggil model AI pihak ketiga non-Meta (nol ketergantungan pada ElevenLabs, Google WaveNet, MobileSAM, atau RapidOCR). Seluruh fitur suara dan pengenalan data dibangun di atas standar natif browser (Web Speech API, WebCrypto, HTML5 Canvas) untuk menjamin latensi 0ms dan privasi tanpa transit cloud.

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk rincian selengkapnya.