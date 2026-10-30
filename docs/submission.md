# Devpost & Hackathon Submission Form — Savvy.AI

> **Meta Global AI Developer Hackathon 2026**  
> **Track:** Indie Developer  
> **Theme:** Build for Your World  

---

## 📌 Submission Overview
- **Project Name:** Savvy.AI - Your AI Browser Companion for Forms & Web
- **Tagline:** Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark.
- **Live Demo Web App:** [https://savvy-plum.vercel.app](https://savvy-plum.vercel.app)
- **Live Extension Simulator:** [https://savvy-plum.vercel.app/landingpage/simulator](https://savvy-plum.vercel.app/landingpage/simulator)
- **Interactive Mock Portal:** [https://savvy-plum.vercel.app/landingpage/mock-portal](https://savvy-plum.vercel.app/landingpage/mock-portal)
- **GitHub Repository:** [https://github.com/arfabi/savvy](https://github.com/arfabi/savvy)
- **Video Walkthrough (3 Mins):** `[Link to YouTube / Loom Video]`

---

## 💡 Inspiration
Setiap tahun, lebih dari satu milyar permohonan formulir publik—mulai dari beasiswa LPDP, visa Schengen internasional, hingga seleksi CASN/BKN—diproses secara daring. Namun, hingga 42% pendaftar gugur di tahap seleksi administrasi awal bukan karena kekurangan potensi, melainkan akibat kebingungan menafsirkan istilah teknis juknis regulasi, kesalahan format foto biometrik, dan kecemasan mengisi data sensitif di portal yang rumit.

Sebagai pengembang independen di negara berkembang, kami merasakan langsung bagaimana kecemasan administratif ini menjadi jurang pemisah sosial. Kami membangun **Savvy.AI** untuk mendemokratisasi akses terhadap birokrasi publik: sebuah asisten browser-native cerdas yang bekerja secara independen di atas formulir web apa pun tanpa perlu izin atau integrasi server dari kementerian.

---

## 🚀 What It Does (3 Solution Pillars)
Savvy.AI mendampingi warga di Chrome Side Panel (Manifest V3) melalui 3 pilar utama:
1. **Pillar 1: Understand (Pahami)**
   - **Beacon Spotlight & Field Coach RAG:** Menyorot kolom formulir aktif dan menyajikan kartu panduan 4-elemen (*Arti Istilah, Cara Mengisi, Contoh Valid Fiktif, Jebakan Umum*) yang divalidasi langsung oleh model **Meta Muse Spark Open** dengan sitasi halaman juknis resmi.
   - **Snip & Explain (Jargon Buster):** Pengguna dapat menyeleksi paragraf klausul juknis yang membingungkan untuk diterjemahkan ke dalam bahasa awam.
   - **Handsfree Voicebot:** Asisten percakapan suara dwibahasa (Indonesia/Inggris) berlatensi rendah (<900ms) menggunakan Web Speech API.

2. **Pillar 2: Fill (Isi)**
   - **Zero-Knowledge Encrypted Vault:** Menyimpan data KTP, paspor, dan transkrip yang dienkripsi secara lokal menggunakan **WebCrypto AES-256-GCM**.
   - **1-Click Batch Autofill & Safe Undo:** Mengisi seluruh kolom formulir secara instan dengan bilah pembatalan (Undo Bar 100%) jika pengguna berubah pikiran.
   - **Academic Essay Coach:** Mentransformasikan poin kasar pengalaman pendaftar menjadi narasi esai terstruktur sesuai rubrik tanpa mengarang fakta fiktif.

3. **Pillar 3: Audit (Periksa)**
   - **Traffic Light Pre-Submit Auditor:** Evaluator FSM memeriksa konsistensi silang data (Nama KTP vs Formulir, format NIK, batas usia reguler vs afirmasi) sebelum tombol submit ditekan.
   - **Zero-Pixel Photo Compliance Inspector:** Memeriksa kesesuaian pasfoto biometrik (rasio 2x2 inci / 35x45mm, ketajaman fokus Laplacian, dan keseragaman latar belakang) secara in-memory C++ tanpa pernah memodifikasi piksel asli (kepatuhan ICAO 9303).
   - **14 Deterministic Accessibility (A11y) Tools:** Mendukung pemohon neurodivergen dan disabilitas (Reading Spotlight Guide, High Contrast, Dyslexia Font, Pause Animations, Text Spacing).

---

## 🛠️ How We Built It
- **Core AI Model:** **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)** dieksekusi melalui **Baseten Inference API** (`https://inference.baseten.co/v1`).
- **Memory & Chaining:** 10-message active sliding window yang dipadukan dengan background compacting memory di Supabase (`compacted_summary`) untuk mempertahankan ingatan percakapan tanpa batas dengan biaya minimal (~Rp 3/chat turn).
- **Frontend & Web Showcase:** Next.js 16 (Turbopack, App Router) di-deploy di Vercel dengan integrasi Vercel Analytics.
- **Chrome Extension MV3:** Dibangun menggunakan Vite + React + TailwindCSS, Closed Shadow DOM (`#savvy-root`), dan Chrome Side Panel API.
- **Security & Privacy:**
  - Client-side Canvas **DOM Blackout Masking** menutup foto wajah sebelum ekstraksi dokumen (Zero Biometric Transit).
  - Client-side **PII Censor Guard** menyamarkan NIK/NPWP secara real-time.
  - **WebCrypto AES-256-GCM** menjamin server Supabase hanya menyimpan ciphertext tanpa bisa mendekripsinya.

---

## 🏆 Model Compliance & Hackathon Rules
> **Model Usage Guarantee:** Proyek ini secara eksklusif memanggil satu model AI saat runtime: **Muse Spark Open (Meta)** via Baseten (`meta-models/muse-spark-open-1026`). Tidak ada model pihak ketiga non-Meta (tidak menggunakan ElevenLabs, Google WaveNet, MobileSAM, atau RapidOCR). Seluruh fitur suara memanfaatkan standar natif browser (Web Speech API) dan audit foto diproses in-memory tanpa modifikasi piksel.

---

## 📈 Accomplishments We're Proud Of
1. **100% Test Pass Rate:** Lulus 20 dari 20 skenario pengujian verifikasi otomatis end-to-end (`e2e_verification.mjs`).
2. **Sub-Second Latency:** Latensi inferensi live Baseten Muse Spark Open mencapai **816 ms**.
3. **Zero Portal Integration:** Berfungsi di formulir web mana pun secara universal tanpa izin backend instansi.
4. **1-Click Demo Juri:** Akun khusus dewan juri (`judge@savvy.ai`) yang siap diuji dalam hitungan detik.

---

## 🔮 What's Next for Savvy.AI
- Mendukung verifikasi tanda tangan digital e-Meterai resmi Peruri.
- Memperluas database regulasi RAG ke portal perizinan OSS (Online Single Submission) dan visa kerja global.
- Menambahkan model penerjemahan bahasa daerah (Jawa, Sunda, Melayu) menggunakan bobot terbuka Meta NLLB.
