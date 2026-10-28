# User Journey Map: Savvy.AI

> **Versi 2.1 · 28 Oktober 2026**  
> Menghubungkan titik masalah emosional (*The 3-Y Friction Framework*) dan teknis pendaftar saat berhadapan dengan formulir birokrasi resmi dengan solusi terarah **Savvy.AI** (Pilar: *Understand*, *Fill*, *Audit*).  
> Dokumen Pendamping:
> - [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) — Product Requirements Document & Feature Specs
> - [`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md) — Arsitektur Sistem, Tech Stack, & Meta Model API

---

## 1. Persona Pengguna

Savvy.AI beroperasi 100% di sisi klien untuk **warga dan pendaftar formulir** (*citizen-first*, tanpa ketergantungan atau integrasi SDK instansi):

1. **Pemohon Beasiswa (*Scholarship Applicant*):**
   * *Contoh Target:* Pendaftar beasiswa LPDP, AAS, Chevening, Fulbright, MEXT.
   * *Karakteristik:* Menghadapi ratusan isian formulir, kolom esai panjang, persyaratan dokumen berlapis, dan kecemasan tinggi gagal di tahap seleksi administrasi.
   * *Kebutuhan Kunci:* **Essay Coach** (smart drafting 3-bullet anti-writer's block), **Field Coach** (RAG juknis resmi), dan **Traffic Light Pre-Submit Auditor**.

2. **Pemohon Visa & Paspor (*Traveler / Student / Expat*):**
   * *Contoh Target:* Pemohon US Visa DS-160, Visa Schengen, Paspor Online Imigrasi.
   * *Karakteristik:* Khawatir ditolak karena salah format foto, ketidaktahuan istilah hukum kedutaan (*Affidavit of Support*, *Apostille*), regulasi ukuran file ketat, dan kekhawatiran salah tulis nama paspor vs identitas.
   * *Kebutuhan Kunci:* **Explain This** (Vision Multimodal Snip), **Audit Kepatuhan Foto** (deterministik tanpa ubah piksel ICAO 9303), **Consistency Checker Agent**, dan **Official Specimen & Template Previewer**.

3. **Masyarakat Umum & Pencari Kerja (*Public Service Seekers & Job Applicants*):**
   * *Contoh Target:* Pengisi portal CPNS, seleksi BUMN, OSS perizinan usaha, layanan kependudukan KTP/KK.
   * *Karakteristik:* Literasi birokrasi terbatas, lelah mengetik berulang, risiko salah ketik NIK berakibat fatal.
   * *Kebutuhan Kunci:* **Multiple Vault** (Password-protected), **1-Click Autofill & Undo**, serta **Upload KTP to Vault** (On-Device OCR).

4. **Lansia & Pengguna Neurodivergent (*Accessibility & Handsfree*):**
   * *Contoh Target:* Warga senior, pengguna dengan disleksia, atau kondisi ADHD yang mudah lelah membaca teks rapat birokrasi.
   * *Karakteristik:* Mudah terdistraksi baris panjang, kesulitan menavigasi struktur web rumit.
   * *Kebutuhan Kunci:* **Handsfree Voicebot** (Silero VAD + Muse Voice Transcribe + ElevenLabs / Web Speech fallback), **Beacon Spotlight** (Shadow DOM), dan **Accessibility HUB** (ADHD reading ruler, OpenDyslexic).

---

## 2. Pemetaan Friksi ke Tiga Pilar Savvy.AI

Pengalaman buruk pendaftar dalam formulir digital berakar pada **The 3-Y Friction Framework** (Ambiguity, Complexity, Anxiety) yang dijawab secara simetris oleh **Tiga Pilar Solusi Savvy.AI**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       THE 3-Y FRICTION FRAMEWORK                                       │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
         ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
         ▼                                          ▼                                          ▼
┌────────────────────────────────┐ ┌────────────────────────────────┐ ┌────────────────────────────────┐
│         1. AMBIGUITY           │ │         2. COMPLEXITY          │ │          3. ANXIETY          │
│ (Ketidakjelasan Arti & Bahasa) │ │  (Kerumitan Teknis & Berkas)   │ │ (Kecemasan Risiko & Kegagalan) │
│   "Saya tidak paham maksudnya  │ │  "Sistem/file-nya menolak saya │ │   "Saya takut salah ketik &    │
│    & bingung mau nulis apa"    │ │    & saya lelah mengetik"      │ │         didiskualifikasi"      │
└───────────────┬────────────────┘ └───────────────┬────────────────┘ └───────────────┬────────────────┘
                │                                  │                                  │
         DIJAWAB OLEH:                      DIJAWAB OLEH:                      DIJAWAB OLEH:
         PILAR UNDERSTAND                   PILAR FILL                         PILAR AUDIT
                │                                  │                                  │
  • Petunjuk Kolom Form Gelap        • Ratusan Kolom & Lelah Mengetik   • Takut Salah Alur / Tombol
    ──► Field Coach (4 Elemen Card)    ──► Multiple Vault (Master PW)     ──► Beacon Spotlight & Cursor
  • Juknis Resmi Tersebar / Hilang   • Butuh Pengisian Cepat            • Ragu Format Nilai / Tanggal
    ──► Meta Vector Store RAG          ──► 1-Click Autofill & Undo        ──► Pre-Submit Traffic Light
  • Istilah Hukum Birokrasi          • Dokumen KTP Fisik ke Form        • Foto Rawan Diskualifikasi
    ──► Explain This (Snip Multimodal) ──► Upload to Vault (OCR KTP)      ──► Audit Kepatuhan Foto (Sharp)
  • Butuh Tanya Jawab Langsung       • Writer's Block Kolom Esai        • Data Silang Beda Huruf
    ──► Chatbot & Handsfree Voicebot   ──► Essay Coach (3-Bullet Draft)   ──► Consistency Checker Agent
  • Hambatan Visual / Fokus
    ──► Accessibility HUB
```

---

## 3. Tahapan Alur Perjalanan Pengguna (End-to-End User Journey)

### Tahap 1: Orientasi Halaman & Pencarian Makna (Pilar UNDERSTAND)
* **Situasi Pengguna:** Membuka portal resmi (misal portal beasiswa atau visa) dan dihadapkan pada puluhan kolom dan istilah birokrasi rumit (*Apostille*, *Affidavit of Support*).
* **Titik Stres (Pain Points):**
  * Tidak paham arti istilah hukum formulir.
  * Teks formulir rapat dan melelahkan mata.
* **Respon & Fitur Savvy.AI:**
  * **Auto-Domain Match & Juknis RAG:** Ekstensi mendeteksi domain portal dan menghubungkan ke **Meta Vector Store** resmi terkait.
  * **Beacon Spotlight & Kartu Panduan 4-Elemen:** Menyorot field aktif dengan kursor semu visual (*Animated Virtual Cursor*) dan menampilkan kartu petunjuk (*Meaning, How to Fill, Example Valid Value, Common Pitfalls*) dengan badge bukti transparan (🟢 Official / 🔵 Curated / 🟡 AI Guidance).
  * **Explain This (Multimodal Snip):** Pengguna menyeleksi instruksi rumit; DOM Masking otomatis menutupi data pribadi, lalu **Muse Spark Open** menjelaskan konteksnya secara ramah awam.
  * **Accessibility HUB:** Mengaktifkan ADHD Reading Ruler atau font OpenDyslexic untuk kenyamanan membaca.

---

### Tahap 2: Pengisian Data Aman & Cepat (Pilar FILL)
* **Situasi Pengguna:** Mengisi puluhan kolom identitas, riwayat, dan teks narasi motivasi/alasan beasiswa.
* **Titik Stres (Pain Points):**
  * Lelah mengetik identitas berulang kali di berbagai form.
  * Khawatir data pribadi bocor jika disimpan di cloud pihak ketiga.
  * Mengalami *writer's block* di kolom esai penting.
* **Respon & Fitur Savvy.AI:**
  * **Multiple Vault (Password-Protected):** Akses profil terisolasi (*Pribadi*, *Pasangan*, *Pekerjaan*) terenkripsi lokal WebCrypto `AES-256-GCM` berbasis Master Password (tanpa seed phrase rumit).
  * **1-Click Autofill & Instant Undo:** Memetakan data identitas ke form seketika, dengan jaminan tombol Undo 100% mengembalikan kondisi awal.
  * **Upload KTP to Vault (On-Device OCR):** Foto KTP diekstraksi langsung di browser via MobileSAM Q4 + RapidOCR ONNX (18 MB) tanpa kirim foto ke server.
  * **Handsfree Voicebot:** Interaksi tanya jawab dan pendiktean handsfree didukung Silero VAD lokal + **Muse Voice Transcribe** (Meta Model API) + audio cerdas (ElevenLabs HD Demo / Web Speech fallback).
  * **Essay Coach (Smart Drafting):** Memasukkan 3 poin fakta kasar → disintesiskan menjadi draf narasi terstruktur yang formal, ringkas, dan selaras rubrik beasiswa tanpa mengarang fakta palsu.

---

### Tahap 3: Verifikasi Dokumen & Berkas Pendukung (Pilar AUDIT - Bagian 1)
* **Situasi Pengguna:** Mengunggah pasfoto visa/paspor dan dokumen kelengkapan resmi.
* **Titik Stres (Pain Points):**
  * Pasfoto rawan diskualifikasi karena salah rasio aspek, blur, atau proporsi kepala tidak sesuai ICAO 9303.
  * Takut berkas salah format atau tidak memiliki spesimen sah pembanding.
* **Respon & Fitur Savvy.AI:**
  * **Audit Kepatuhan Foto (Zero-Pixel Manipulation):** Backend `sharp` deterministik memeriksa rasio aspek (2x2 inci / 35x45 mm), ketajaman (Laplacian variance), dan rasio biometrik tinggi kepala (50% - 69%) tanpa memanipulasi piksel foto demi mematuhi hukum internasional.
  * **Official Specimen & Template Previewer:** Membuka modal spesimen resmi dummy beranotasi untuk membandingkan stempel/legalisir basah sah vs fotokopi ditolak, serta tombol unduh template resmi (`.docx` / `.pdf`).

---

### Tahap 4: Pemeriksaan Akhir Sebelum Kirim (Pilar AUDIT - Bagian 2)
* **Situasi Pengguna:** Semua field telah terisi dan pengguna bersiap menekan tombol submit.
* **Titik Stres (Pain Points):**
  * Puncak kecemasan (*anxiety peak*): Takut salah satu digit NIK, format tanggal terbalik (DD/MM vs MM/DD), atau nama paspor tidak sinkron yang berujung penolakan fatal.
* **Respon & Fitur Savvy.AI:**
  * **Traffic Light Pre-Submit Auditor:**
    * 🔴 **Merah:** Field wajib kosong, format regex salah (NIK tidak 16 digit), berkas melebihi limit.
    * 🟡 **Kuning:** Format tanggal ambigu, gelar akademik masuk kolom nama paspor.
    * 🟢 **Hijau:** Isian valid dan siap dikirim.
  * **Consistency Checker Agent (Cross-Field):** Penalaran **Muse Spark Open** memvalidasi keselarasan logis:
    * Nama di form vs Nama di paspor/identitas.
    * Tanggal lahir di form vs angka tanggal lahir pada NIK.
    * Tanggal keberangkatan vs masa berlaku paspor (> 6 bulan).
  * **Jump to Drawer (1-Click Remedy):** Drawer ringkasan masalah menampilkan daftar anomali; mengklik item langsung mengarahkan spotlight dan kursor ke kolom bermasalah untuk diperbaiki.
  * **Prinsip Emas:** Savvy.AI tidak pernah men-submit otomatis; pengguna memegang kendali akhir 100%.

---

## 4. Matriks Rilis Fitur (MVP Hackathon vs Next Roadmap)

| Fitur / Modul | Pilar | Status Hackathon | Model / Engine Terkait |
| :--- | :---: | :---: | :--- |
| **Field Coach & Official Specimen** | Understand | **MVP (P0)** | Meta Vector Store (`file_search`) + Muse Spark Open |
| **Beacon Spotlight & Virtual Cursor** | Understand | **MVP (P0)** | Closed Shadow DOM + Deterministic A11y Tree |
| **Explain This (Multimodal Snip)** | Understand | **MVP (P0)** | Muse Spark Open (Vision) + Local DOM Masking |
| **Handsfree Voicebot** | Understand | **MVP (P0)** | Muse Voice Transcribe (STT) + ElevenLabs / Web Speech (TTS) + Silero VAD |
| **Accessibility HUB** | Understand | **MVP (P0)** | Deterministik (ADHD Ruler, OpenDyslexic, High Contrast) |
| **Multiple Vault (Password Protected)**| Fill | **MVP (P0)** | WebCrypto `AES-256-GCM` + `PBKDF2-SHA256` |
| **1-Click Autofill & Safe Undo** | Fill | **MVP (P0)** | Resilient Semantic Locator + Native Event Dispatch |
| **Upload KTP to Vault (OCR)** | Fill | **MVP (P0)** | On-device MobileSAM Q4 + RapidOCR ONNX (~18 MB) |
| **Essay Coach (Smart Drafting)** | Fill | **MVP (P0)** | Muse Spark Open (3-Bullet Formal Synthesizer) |
| **Traffic Light Pre-Submit Auditor** | Audit | **MVP (P0)** | Deterministic Regex & Syntax Checker |
| **Audit Kepatuhan Foto (Zero-Pixel)** | Audit | **MVP (P0)** | In-memory `sharp` Deterministik (ICAO 9303 Compliant) |
| **Consistency Checker Agent** | Audit | **MVP (P0)** | Muse Spark Open (Cross-Field Logical Validation) |
| **Jump to Drawer (1-Click Fix)** | Audit | **MVP (P0)** | Interactive Drawer & Focus Spotlight |
| **Multi-Language Support (ID & EN)** | Cross | **MVP (P0)** | Muse Voice Transcribe + ElevenLabs / Web Speech API |
| **Multi-Document Cross-Verification**| Audit | **Next Roadmap (v2)**| Ekstraksi PDF multi-halaman & pencocokan silang ijazah |
