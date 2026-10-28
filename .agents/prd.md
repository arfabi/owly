# PRD — Savvy.AI

> **Pahami. Isi. Periksa. Sebelum Anda menekan Submit.**  
> Versi 2.1 · 28 Okt 2026 · Meta Global AI Developer Hackathon 2026 · Track: Indie Developer · Tema: Build for Your World  
> Dokumen Arsitektur & Spesifikasi Pendamping:
> - [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) — Arsitektur Compound Multi-Agent, FSM Guardrail, & Deterministic Tools
> - [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md) — Responses API, Stateful Multi-Chain Loop, & Two-Tier Cache System
> - [`file_search_vector_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/file_search_vector_tool.md) — Meta Vector Stores & Tool `file_search` untuk Juknis Resmi
> - [`web_search_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/web_search_tool.md) — Manual Researcher Agent & Real-Time `web_search` Tool

---

## 1. Ringkasan Produk

**Savvy.AI** adalah asisten browser cerdas (Manifest V3) berbasis **Compound Multi-Agent System** untuk **warga dan pendaftar formulir**, bukan instansi. Ekstensi ini aktif di atas portal mana pun (beasiswa, visa, paspor, rekrutmen, perizinan) serta dokumen formulir PDF **tanpa perlu integrasi, SDK, atau izin dari pemilik portal**.

Savvy.AI mengombinasikan siklus agen ReAct (*Think → Act → Observe*) berbasis Meta AI dengan alat deterministik lokal untuk memberikan rasa aman, cepat, dan presisi tinggi sebelum pengguna mengirimkan dokumen penting.

### Tiga Pilar Solusi
| Pilar | Pertanyaan Pengguna | Inti Solusi | Implementasi Spesifik |
|---|---|---|---|
| **Understand** | *"Kolom ini maksudnya apa dan apa aturannya?"* | Contextual Guidance & Accessibility | • **Field Coach** & **Chatbot/Voicebot** via Meta Vector Store (`file_search`)<br>• **Explain This** (Multimodal Snip)<br>• **Accessibility HUB** (14 Deterministic Tools: Reading Spotlight, TTS, Contrast, Dyslexic Font, dll.)<br>• **Beacon Spotlight** (Shadow DOM) |
| **Fill** | *"Bagaimana mengisinya dengan benar, konsisten, dan cepat?"* | Secure Autofill & Smart Drafting | • **Multiple Vault (Password)** lokal AES-256-GCM<br>• **Upload to Vault** (OCR KTP lokal via MobileSAM Q4 + RapidOCR)<br>• **Essay Coach** (Brainstorming & Drafting narasi 3-bullet) |
| **Audit** | *"Apakah ada yang salah atau berpotensi ditolak?"* | Deterministic & Consistency Pre-Audit | • **Traffic Light Auditor** (Validasi format/regex)<br>• **Audit Kepatuhan Foto** (`sharp` deterministik tanpa sentuh piksel)<br>• **Consistency Checker Agent** (Kesesuaian data silang) |

### 1.1 Sasaran Hackathon
- **Produk Siap Pakai:** Ekstensi Manifest V3 (Developer Mode) yang beroperasi mulus di mock portal (`frontend/public/mock-portal/`) dan formulir PDF.
- **Pemanfaatan Nyata Meta AI & Model Stack:**
  - **Muse Spark Open:** Penalaran multimodal, Field Coach, Essay Coach, dan orkestrasi ReAct loop.
  - **Meta Vector Store (`file_search`):** Retrieval juknis resmi dengan sitasi dokumen halaman persis.
  - **Muse Voice Transcribe:** Transkripsi audio STT untuk interaksi handsfree warga.
  - **SAM 3.1 Open 0.87B / MobileSAM Q4:** Segmentasi visual lokal dan fallback server.
  - **Muse Code:** Dokumentasi log vibecoding agentic di `docs/muse-code-log.md`.
- **Prinsip Kepatuhan Regulasi Internasional:** Mematuhi aturan ketat formulir resmi (mis. standar ICAO 9303 / US Dept of State yang melarang keras *digitally altered or retouched photos*). Savvy.AI **tidak memanipulasi piksel foto**, melainkan menjalankan **Audit Kepatuhan Foto** secara deterministik.

---

## 2. Masalah & Pengguna

### 2.1 Masalah Warga
1. **Ambiguity:** Istilah hukum dan birokrasi (Apostille, Affidavit of Support, Nomor SK) membingungkan dan tidak dijelaskan di halaman formulir.
2. **Complexity:** Berkas ditolak karena pasfoto salah ukuran/blur, format penanggalan terbalik, atau dokumen tidak sesuai spesimen sah.
3. **Anxiety:** Takut salah satu digit NIK atau penulisan nama berbeda dengan paspor berakibat diskualifikasi fatal setelah berbulan-bulan persiapan.

### 2.2 Segmentasi Pengguna
| Persona | Kebutuhan Utama | Fitur Kunci Savvy.AI |
|---|---|---|
| **Pendaftar Beasiswa & Visa** (LPDP, AAS, Schengen, US Visa) | Takut berkas diskualifikasi karena salah teknis atau inkonsistensi essay | • Field Coach (Juknis RAG)<br>• Essay Coach & Consistency Checker<br>• Audit Kepatuhan Foto |
| **Warga Umum / Pencari Kerja / CPNS** | Butuh pengisian cepat dan terhindar dari salah ketik berulang | • Multiple Vault (Password)<br>• 1-Click Autofill & Undo<br>• Upload Scan KTP to Vault |
| **Lansia & Pengguna Neurodivergent** | Literasi digital terbatas, mudah terdistraksi atau lelah membaca teks rapat | • Handsfree Voicebot (VAD)<br>• Step-by-Step Focus Mode<br>• Accessibility HUB (ADHD Ruler, OpenDyslexic) |

---

## 3. Prinsip Produk (Aturan Emas)

1. **Savvy.AI Tidak Pernah Men-submit Formulir:** Tidak ada pemanggilan `form.submit()`, `requestSubmit()`, atau penekanan tombol submit otomatis. Pengguna memegang kendali akhir 100%.
2. **Aksi Penulisan Eksplisit:** Savvy.AI hanya mengisi kolom DOM atas persetujuan sadar pengguna (klik *Autofill*, *Insert*, atau *Apply Fix*). Seluruh perubahan tercatat pada batch Undo instan.
3. **Mode Pasif Tanpa Pembacaan Nilai (`.value`):** Dalam kondisi pasif, ekstensi hanya memetakan struktur form (`role`, `accessible name`, locator). Dilarang membaca `.value`, dilarang screenshot otomatis, dilarang keylogger.
4. **Badge & Transparansi Bukti:** Setiap rekomendasi wajib memiliki label sumber:
   - 🟢 **Official:** Bersumber langsung dari juknis resmi via Meta Vector Store (`file_search`).
   - 🔵 **Savvy Curated / Verified Cache:** Jawaban valid yang tersimpan di `coach_cache`.
   - 🟡 **AI Guidance:** Penalaran AI berbasis konteks DOM (jika confidence < 0.6, sarankan *"Konfirmasi ke instansi penerbit"*).
5. **PII Masking & Privacy First:** Redaksi identitas (NIK, nomor paspor, kontak) dilakukan di sisi klien sebelum data teks/visual dikirim ke inference backend.
6. **Zero-Knowledge Multiple Vault:** Kunci enkripsi AES-256-GCM diturunkan dari master password lokal via PBKDF2 dan tidak pernah disimpan atau dikirim ke server.
7. **Deterministik di Jalur Kritis:** Alur walkthrough, validasi field regex, dan audit pasfoto dijalankan oleh Finite State Machine (FSM) dan pustaka deterministik, bukan diserahkan pada halusinasi LLM.

---

## 4. Cakupan Bahasa & Dukungan Suara (Multilingual Support)

Mendukung warga global dan pendaftar internasional dengan asistensi teks, transkripsi suara (Meta Model API: Muse Voice Transcribe), dan output suara cerdas (ElevenLabs HD Audio untuk demo + Browser Web Speech API fallback):

| No | Bahasa | Prioritas / Status | Mesin Suara / Audio Stack |
|---|---|---|---|
| 1 | **Bahasa Indonesia** | ⭐ **Prioritas Utama** | Muse Voice Transcribe (Meta Model API) + ElevenLabs HD / Browser Speech Synthesis |
| 2 | **Bahasa Inggris** | ⭐ **Prioritas Utama** | Muse Voice Transcribe (Meta Model API) + ElevenLabs HD / Browser Speech Synthesis |
| 3 | **Bahasa Mandarin** | Didukung | Muse Voice Transcribe (Meta Model API) + ElevenLabs HD / Browser Speech Synthesis |
| 4 | **Bahasa Spanyol** | Didukung | Muse Voice Transcribe (Meta Model API) + ElevenLabs HD / Browser Speech Synthesis |
| 5 | **Bahasa Arab Standar** | Didukung | Muse Voice Transcribe (Meta Model API) + ElevenLabs HD / Browser Speech Synthesis |
| 6 | **Bahasa Prancis, Jerman, Jepang, Portugis** | Didukung | Muse Voice Transcribe (Meta Model API) + ElevenLabs HD / Browser Speech Synthesis |

---

## 5. PERSYARATAN FITUR UTAMA

### 5.1 Pilar UNDERSTAND (Guidance & Accessibility)

#### A. Multi-Agent Guidance Engine
1. **Form Analyzer Agent:**
   - Secara pasif memindai pohon aksesibilitas DOM (`role`, `accessible_name`, hierarki kontainer) saat halaman termuat atau bermutasi (MutationObserver).
   - Menghasilkan *normalized field signature* untuk mendeteksi tipe input tanpa membaca isian data pengguna.
2. **Field Coach Agent (Contextual Q&A):**
   - Terpicu saat pengguna fokus pada field tertentu atau bertanya di Side Panel.
   - Menggunakan **Responses API & Chain ID** (`multi_chain_cache.md`) untuk memelihara konteks sesi percakapan per tab secara efisien.
   - Melakukan retrieval berjenjang:
     1. Cek `coach_cache` (Supabase) untuk field identik → respons instan (<50 ms).
     2. Jika tidak ada di cache, panggil tool `file_search` ke **Meta Vector Store** juknis portal terkait → sitasi nomor bab & halaman resmi.
     3. Jika pertanyaan menyangkut regulasi dinamis terbaru, panggil tool `web_search` via **Manual Researcher Agent**.
3. **Chatbot "Tanya Savvy" & Handsfree Voicebot:**
   - **Teks:** Dialog interaktif di Side Panel dengan riwayat terhubung per tab.
   - **Voice:** Interaksi Handsfree berbasis **Silero VAD** on-device (deteksi jeda hening dan barge-in) → transkripsi **Muse Voice Transcribe** (Meta Model API) → sintesis audio instan via browser **Web Speech API**.
   - **Avatar Talking & Lipsync:** Indikator visual SVG interaktif (*Listening / Thinking / Speaking*).
4. **Explain This (Multimodal Snip):**
   - Pengguna menyeleksi area formulir yang membingungkan.
   - DOM Masking otomatis menutupi kotak isian dengan warna hitam pekat sebelum screenshot diambil.
   - Dikirim ke **Muse Spark Open** untuk dijelaskan secara visual dan kontekstual.

#### B. Walkthrough & Visual Navigation
1. **Beacon Spotlight (Shadow DOM Overlay):**
   - Menyorot field aktif dengan kursor semu beranimasi (*Animated Virtual Cursor*) yang mengarahkan pandangan mata pengguna ke tahapan berikutnya tanpa mengambil alih mouse fisik.
2. **Kartu Petunjuk 4-Elemen & Aksi Langsung (Actionable Guidance):**
   - Menampilkan: (1) *Arti Istilah*, (2) *Cara Mengisi*, (3) *Contoh Nilai Valid*, dan (4) *Jebakan Umum (Common Pitfalls)* disertai badge bukti (🟢/🔵/🟡).
   - **Tombol Aksi Single-Field Autofill:** Jika field formulir yang aktif cocok dengan data di Vault (mis. NIK, Nama Lengkap, Tempat Lahir) dan Vault dalam status *Unlocked*, kartu menampilkan tombol deterministik `[Isi Kolom Ini dari Vault]` (mis. *"Isi NIK: 3271..."*) untuk pengisian granular yang terkontrol.
3. **Official Specimen & Template Previewer:**
   - Tombol *"Lihat Contoh Sah"* pada input dokumen/pasfoto menampilkan spesimen beranotasi resmi (legalisir basah vs fotokopi ditolak).
   - Tombol unduh template format resmi (`.docx` / `.pdf`).

#### C. Deterministic Accessibility Tools (Accessibility HUB)

Pengaturan aksesibilitas deterministik langsung di sisi klien (`content_scripts`) tanpa manipulasi piksel dan tanpa biaya inferensi LLM untuk eksekusi DOM/CSS:

1. **Katalog 14 Fitur Deterministik Hub:**
   | No | Fitur | Mekanisme Deterministik Klien | Nilai Default / Status |
   |---|---|---|---|
   | 1 | **Reading Spotlight** | Overlay bayangan gelap dengan strip sorot transparan mengikuti vertikal kursor untuk fokus membaca baris panjang. | Off |
   | 2 | **Text to Speech (TTS)** | Pembacaan seleksi teks/instruksi formulir langsung via Web Speech API browser lokal. | Off |
   | 3 | **Contrast Mode** | Injeksi filter CSS high-contrast (Dark / Light / Invert) memenuhi standar WCAG AAA. | Normal |
   | 4 | **Highlight Links** | Outline dan background kontras tinggi pada elemen interaktif `<a>`, `<button>`, dan input klik. | Off |
   | 5 | **Bigger Text Size** | Penskalaan tipografi halaman menggunakan variabel CSS root (`--savvy-font-scale`) tanpa merusak layout form. | Normal |
   | 6 | **Text Spacing** | Penyesuaian `letter-spacing` dan `word-spacing` untuk mempermudah pemilahan kata. | Normal |
   | 7 | **Pause Animations** | Injeksi CSS `animation: none !important; transition: none !important;` untuk menghentikan elemen bergerak/distraksi. | Normal |
   | 8 | **Hide All Images** | Pengaturan `opacity: 0` / `display: none` pada elemen `<img>`, `<picture>`, dan banner iklan agar form bersih. | Normal |
   | 9 | **Dyslexia Friendly Font** | Penggantian `font-family` global halaman ke *OpenDyslexic* untuk penderita disleksia. | Off |
   | 10 | **Big Cursor** | Penggantian kursor mouse native dengan SVG high-visibility cursor berukuran besar. | Normal |
   | 11 | **Live Explanatory Tooltips** | Tooltip kontekstual deterministik melayang di atas istilah birokrasi/hukum tanpa menutupi input. | Off |
   | 12 | **Line Height Spacing** | Penskalaan jarak antar-baris teks (`line-height: 1.8 - 2.2`) untuk kenyamanan membaca. | Normal |
   | 13 | **Text Alignment** | Normalisasi perataan teks (kiri, kanan, rata tengah) untuk konsistensi keterbacaan. | Normal |
   | 14 | **Color Saturation** | Penyesuaian saturasi warna halaman (Monochrome, Low Saturation, High Saturation). | Normal |

2. **Arsitektur Dual-Trigger (Manual Tile UI vs Agent Reasoning):**
   Fitur Accessibility Hub dapat dipicu melalui dua jalur yang bermuara pada fungsi eksekusi deterministik yang sama:
   - **Jalur Manual (100% Deterministik / $0 Token):** Pengguna mengklik langsung tile kartu di Side Panel ekstensi. Bersifat instan (<10 ms), murni manipulasi CSS/DOM, dan tersimpan per portal via `chrome.storage.sync`.
   - **Jalur AI Reasoning (Agent Tool Calling):** Model AI (Muse Spark Open) menerjemahkan keluhan atau perintah natural language pengguna menjadi pemanggilan fungsi deterministik.

3. **Skenario Pemicu Pemanggilan oleh AI Agent (Kapan & Kenapa):**
   - **Permintaan Langsung (Explicit Commands):** Pengguna meminta bantuan via chat/voice (*"Teks form ini kekecilan, tolong perbesar"* $\rightarrow$ memanggil `bigger_text_size`).
   - **Keluhan Implisit & Masalah Kognitif (Contextual Problem Solving):** Pengguna mengeluhkan rasa lelah atau kebingungan tanpa menyebut nama fitur (*"Pusing lihat banner kedip-kedip di form ini"* $\rightarrow$ agent memilih `pause_animations` + `hide_all_images`; *"Mata saya lelah baca syarat panjang ini"* $\rightarrow$ agent menawarkan/mengaktifkan `reading_spotlight`).
   - **Bantuan Proaktif Kontekstual (Multi-Agent Collaboration):** 
     - Saat **Essay Coach** aktif untuk kolom esai panjang, agent menyarankan *Distraction-Free Mode* (`pause_animations` + `hide_all_images`).
     - Saat **Field Coach** mendeteksi istilah birokrasi berulang pada formulir teknis, agent mengaktifkan `live_explanatory_tooltips`.
   - **Prinsip Kedaulatan Pengguna:** AI hanya mengeksekusi langsung jika instruksi jelas; jika bersifat saran proaktif, AI menawarkan tombol konfirmasi terlebih dahulu. Seluruh perubahan bersifat *revertable* 1-klik melalui UI Hub.

4. **Spesifikasi Kontrak Tool Agen (Unified Parameterized Tool):**
   Untuk menghemat context window dan mencegah kebingungan model (dibandingkan mendaftarkan 14 tool terpisah), seluruh kapabilitas dirangkum ke dalam satu function signature:
   ```json
   {
     "name": "set_accessibility_feature",
     "description": "Mengatur fitur aksesibilitas dan kenyamanan visual halaman web (ukuran teks, kontras, spotlight, TTS, animasi, dll) secara deterministik.",
     "parameters": {
       "type": "object",
       "properties": {
         "feature": {
           "type": "string",
           "enum": [
             "reading_spotlight", "text_to_speech", "contrast_mode",
             "highlight_links", "bigger_text_size", "text_spacing",
             "pause_animations", "hide_all_images", "dyslexia_font",
             "big_cursor", "live_tooltips", "line_height",
             "text_alignment", "color_saturation"
           ]
         },
         "action": {
           "type": "string",
           "enum": ["enable", "disable", "increase", "decrease", "reset"],
           "description": "Status atau penyesuaian level fitur"
         }
       },
       "required": ["feature", "action"]
     }
   }
   ```
5. **Smart Paste & Date Normalizer:** Fitur pendukung input deterministik otomatis merapikan format tanggal (DD/MM/YYYY vs MM/DD/YYYY) dan membersihkan spasi/strip liar pada nomor identitas saat ditempel.

---

### 5.2 Pilar FILL (Secure Vault & Smart Assist)

#### A. Multiple Vault (Password-Protected)
1. **Multi-Profil Terisolasi:**
   - Pengguna dapat membuat beberapa profil independen (misal: *Pribadi*, *Pasangan*, *Anak*, *Pekerjaan*).
   - Terenkripsi penuh di sisi klien menggunakan WebCrypto `AES-256-GCM` dengan kunci turunan `PBKDF2-SHA256` (≥ 600.000 iterasi) berbasis **Master Password**.
   - Bebas seed phrase rumit; pengelolaan murni berbasis password dengan proteksi Lock/Unlock instan di memori runtime.
2. **Dual Autofill Mode (Single-Field & Batch All-Fields) & Safe Undo:**
   - **Mode Granular (Single-Field Autofill):** Tersedia langsung di kartu panduan Field Coach untuk mengisi satu kolom aktif secara presisi (misal: hanya mengisi kolom NIK atau Tanggal Lahir) tanpa menyentuh kolom lain.
   - **Mode Batch (1-Click Form Autofill):** Tombol di Side Panel yang memetakan seluruh data profil Vault aktif ke semua kolom formulir yang cocok secara serentak.
   - **Keamanan Zero Cloud Transit:** Proses pengisian berjalan 100% di browser klien (`content_scripts`) dari memori Vault langsung ke input DOM (`element.value` + dispatch native event `input` dan `change`). Data identitas warga **sama sekali tidak dikirim ke Supabase atau Meta Model API** saat proses autofill.
   - **Proteksi Status Vault:** Opsi autofill hanya dapat dipicu jika Vault dalam status **Unlocked** (Master Password telah dimasukkan di sesi runtime aktif).
   - **Safe Undo (100% Reversible):** Tombol **Undo Autofill** mengembalikan seluruh perubahan nilai ke kondisi awal seketika melalui snapshot memori lokal.

#### B. Upload to Vault (On-Device OCR)
1. **Ekstraksi KTP / ID Card Lokal:**
   - Pengguna mengunggah gambar identitas ke Side Panel.
   - Diproses langsung di browser oleh **MobileSAM Q4 + RapidOCR ONNX (~18 MB)** tanpa mengirim foto identitas ke server.
   - Hasil ekstraksi (NIK, Nama Lengkap, Tempat/Tgl Lahir, Alamat) otomatis terpetakan ke dalam Vault aktif setelah dikonfirmasi pengguna.

#### C. Essay Coach (Smart Drafting & Rubric Alignment)
1. **Peningkatan dari Simple Magic Pen:**
   - Menyediakan bantuan menulis untuk kolom narasi panjang (Statement of Purpose, Personal Statement, Alasan Memilih Visa/Beasiswa).
   - Pengguna memasukkan 3 poin fakta kasar → Essay Coach menstrukturkan narasi formal, padat, dan sesuai etika formulir resmi tanpa mengarang fakta/halusinasi.
   - Memeriksa kesesuaian draf dengan batasan kata/karakter dan tujuan beasiswa/instansi.

---

### 5.3 Pilar AUDIT (Traffic Light & Consistency Checking)

#### A. Deterministic Pre-Submit Audit
1. **Traffic Light Auditor:**
   - 🔴 **Merah:** Field wajib kosong, format melanggar aturan panjang/regex, atau ukuran berkas melampaui limit.
   - 🟡 **Kuning:** Format ambigu (mis. kemungkinan tanggal dan bulan terbalik), nama bergelar yang berpotensi ditolak paspor.
   - 🟢 **Hijau:** Isian valid dan siap dikirim.
2. **Audit Kepatuhan Foto (Zero-Pixel Manipulation):**
   - Memeriksa pasfoto secara deterministik melalui backend `sharp`:
     - Rasio aspek (2x2 inci / 35x45 mm).
     - Ambang ketajaman (Laplacian variance blur detection).
     - Proporsi biometrik tinggi kepala (50% - 69% dari total tinggi foto).
     - Ukuran file (KB) dan format warna standar.
   - Tidak melakukan *airbrushing*, *enhancement*, atau editing piksel guna mematuhi standar hukum biometrik.
3. **Jump to Drawer (1-Click Fix):**
   - Drawer ringkasan audit menampilkan daftar anomali; mengklik item langsung mengarahkan spotlight ke kolom yang bermasalah.

#### B. Consistency Checker Agent
1. **Cross-Field Sanity Validation:**
   - Agen penalaran yang membandingkan keselarasan logis antar-kolom sebelum submit:
     - Nama di kolom formulir vs Nama pada paspor/dokumen identitas.
     - Kesesuaian tanggal lahir di form dengan angka tanggal lahir yang terkandung di NIK.
     - Keselarasan antara tanggal keberangkatan dengan masa berlaku paspor (> 6 bulan).

---

### 5.4 Web Showcase: Landing Page & Interactive Mock Portal (Magic UI Aesthetic)

Sebagai etalase publik dan sarana demonstrasi langsung bagi juri hackathon, platform dilengkapi web showcase modern yang mengadopsi bahasa desain **Magic UI** (merujuk pada template *SkyAgent by Magic UI* di `https://agent-magicui.vercel.app/`):

1. **Prinsip Estetika & Visual Identity:**
   - **Dark Mode Premium:** Latar belakang gelap bergradasi halus (*sleek dark slate/black*) dengan pola radial glow dan grid/dot pattern halus.
   - **Pola Komponen Magic UI:**
     - **Hero Section:** Menampilkan headline produk *"Pahami. Isi. Periksa. Sebelum Anda Menekan Submit"*, teks sub-judul persuasif, dan *Interactive Browser Frame* berbingkai *Border Beam (Neon Glow Animation)* yang memperlihatkan preview Side Panel ekstensi aktif di samping formulir.
     - **Bento Grid Showcase:** Menyajikan 3 pilar solusi (Understand via Juknis RAG, Fill via Zero-Knowledge Vault, Audit via Traffic Light & Photo Biometrics) serta kartu khusus katalog 14 Tools Accessibility HUB dalam tata letak kartu bento interaktif.
     - **Step-by-Step Walkthrough (4 Easy Steps):** Alur interaktif vertikal/tab yang menjelaskan alur pengguna: *(1) Deteksi Formulir Pasif $\rightarrow$ (2) Bimbingan Juknis Resmi & Voicebot $\rightarrow$ (3) Autofill Terkontrol $\rightarrow$ (4) Audit Hijau & Submit Mandiri*.
     - **Animated Marquee:** Pita berjalan menampilkan badge portal resmi yang didukung (*Beasiswa LPDP, Visa Schengen, Paspor RI Imigrasi, SSCASN CPNS, US DS-160, Australia Awards*).
     - **High-Impact CTA:** Tombol ganda `[Pasang Ekstensi Chrome]` dan `[Coba Langsung di Mock Portal]`.

2. **Interactive Mock Portal Suite (`/mock-portal`):**
   - Halaman simulasi formulir pendaftaran nyata (misal: *Formulir Beasiswa LPDP 2026* dan *Aplikasi Visa*) yang berjalan di origin web yang sama (`frontend/src/app/mock-portal/`).
   - Menyediakan lingkungan uji coba yang stabil dan mandiri (tanpa dependensi eksternal) untuk evaluasi fungsional ekstensi (Field Coach, Autofill, Spotlight, Auditor, dan pasfoto).

---

## 6. INFRASTRUKTUR & ARSITEKTUR TEKNOLOGI

### 6.1 Komponen Web App & Ekstensi Browser
- **Frontend Web & Landing Page:** Next.js (App Router), React 18, TypeScript Strict, Tailwind CSS, Magic UI component patterns (Bento Grid, Border Beam, Marquee).
- **Ekstensi Browser (Manifest V3):** WXT (Vite), React 18, TypeScript Strict, Tailwind CSS.
- **Isolasi UI Ekstensi:** Side Panel (`sidepanel.html`) untuk kontrol utama, dan Closed Shadow DOM untuk Beacon Spotlight di halaman portal.
- **Kriptografi Klien:** WebCrypto API `AES-256-GCM`, `PBKDF2-SHA256`.
- **On-Device WASM/AI Stack (~19 MB):**
  - MobileSAM Q4 ONNX (10 MB) — Segmentasi dokumen visual.
  - RapidOCR ONNX (8 MB) — OCR lokal KTP/dokumen ke Vault.
  - Silero VAD (1 MB) — Deteksi suara hening & barge-in lokal.
  - Opus Client / Audio Streaming — Pemutaran respons suara instan (<300 ms).

### 6.2 Backend & Multi-Agent Inference Engine
- **Runtime & Hosting:** Node.js Serverless di Vercel (`/api/*`).
- **Database & Auth:** Supabase PostgreSQL (Auth Anonymous Guest & Email, Row-Level Security).
- **Separasi Penyimpanan Data (Arsitektur Hybrid):**
  - **Cloud Database (Supabase):** Menyimpan state sesi multi-turn, shared cache kartu panduan, direktori juknis vector store, dan laporan kendala tanpa retensi data identitas warga (PII).
  - **Client-Side Storage (`chrome.storage.local`):** Menyimpan data sensitif Multiple Vault (KTP, paspor, data form) terenkripsi AES-256-GCM lokal (*Zero-Knowledge*).
  - **Client-Side Settings (`chrome.storage.sync`):** Menyimpan konfigurasi 14 alat Accessibility HUB per portal secara deterministik dan offline-first.

- **Desain Skema Database Final (Supabase PostgreSQL DDL):**
  ```sql
  -- ============================================================================
  -- 1. TABEL: savvy_sessions
  -- Pengelolaan sesi stateful per user per tab browser via Meta Responses API.
  -- Memungkinkan multi-turn conversation tanpa mengirim ulang seluruh riwayat chat.
  -- ============================================================================
  CREATE TABLE savvy_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      tab_id TEXT NOT NULL,                          -- ID tab unik browser (mis. 'tab_lpdp_kemenkeu_go_id')
      portal_key TEXT NOT NULL,                      -- Domain aktif portal formulir
      current_chain_id TEXT NOT NULL,                -- Identifier chain sesi aktif
      current_response_id TEXT NOT NULL,             -- ID respons Meta terbaru (resp_xxx) untuk previous_response_id
      token_count INT DEFAULT 0,                     -- Akumulasi token sesi untuk pemantauan kuota
      message_count INT DEFAULT 0,                   -- Jumlah pertukaran pesan dalam sesi
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours', -- TTL sesi sesuai cache window Meta API
      UNIQUE(user_id, tab_id)
  );

  CREATE INDEX idx_sessions_user_tab ON savvy_sessions(user_id, tab_id);
  CREATE INDEX idx_sessions_expires ON savvy_sessions(expires_at);

  -- ============================================================================
  -- 2. TABEL: coach_cache
  -- Shared Two-Tier Cache publik untuk kartu panduan 4-elemen Field Coach.
  -- Menghindari pemanggilan ulang LLM untuk field formulir yang sama (hemat s/d 80% token).
  -- ============================================================================
  CREATE TABLE coach_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cache_key TEXT UNIQUE NOT NULL,                -- SHA-256 hash(portal_key + section + field_key + role)
      portal_domain TEXT NOT NULL,                   -- Normalisasi domain portal formulir
      field_key TEXT NOT NULL,                       -- Identifier semantik field (mis. 'nik', 'apostille')
      language TEXT NOT NULL DEFAULT 'id',           -- Bahasa output panduan ('id', 'en', dll)
      explanation_json JSONB NOT NULL,               -- Payload 4-elemen: { meaning, how_to_fill, example, pitfalls }
      source_type TEXT NOT NULL DEFAULT 'ai_guidance',-- 'official' (dari juknis) | 'curated' | 'ai_guidance'
      confirmation_ref TEXT,                         -- Sitasi bab/halaman juknis resmi atau URL referensi
      model_used TEXT NOT NULL DEFAULT 'muse-spark-1.3', -- Versi model Meta yang menghasilkan cache
      prompt_ver TEXT NOT NULL DEFAULT 'v1',         -- Versi prompt untuk invalidasi terarah
      hit_count INT DEFAULT 1,                       -- Frekuensi pemakaian kartu panduan
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days' -- TTL cache publik
  );

  CREATE INDEX idx_coach_cache_key ON coach_cache(cache_key);
  CREATE INDEX idx_coach_cache_portal ON coach_cache(portal_domain);

  -- ============================================================================
  -- 3. TABEL: vector_stores
  -- Katalog pemetaan portal formulir resmi ke Meta Vector Store ID untuk tool file_search.
  -- ============================================================================
  CREATE TABLE vector_stores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      domain TEXT NOT NULL UNIQUE,                   -- Domain web portal resmi (mis. 'beasiswalpdp.kemenkeu.go.id')
      vector_store_id TEXT NOT NULL,                 -- ID Vector Store resmi di Meta Model API (vs_xxx)
      portal_name TEXT NOT NULL,                     -- Nama resmi portal (mis. 'Beasiswa LPDP 2026')
      document_title TEXT NOT NULL,                  -- Judul juknis (mis. 'Buku Panduan Pendaftaran LPDP 2026')
      doc_version TEXT NOT NULL DEFAULT '2026',      -- Versi rilis juknis
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_vector_stores_domain ON vector_stores(domain);

  -- ============================================================================
  -- 4. TABEL: feedback_reports
  -- Penampung pelaporan anomali panduan atau juknis usang dari pengguna.
  -- ============================================================================
  CREATE TABLE feedback_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      category TEXT NOT NULL,                        -- 'wrong_guidance' | 'outdated_juknis' | 'ui_bug' | 'other'
      portal_url TEXT NOT NULL,                      -- URL formulir saat kendala dialami
      field_signature TEXT,                          -- Signature field terkait (bila ada)
      report_data JSONB NOT NULL,                    -- Detail kendala & screenshot masking
      created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ============================================================================
  -- 5. TABEL: user_preferences (Profil & Konteks Pengguna)
  -- Sinkronisasi identitas dasar (nama, goals aplikasi), preset aksesibilitas,
  -- dan preferensi bahasa akun lintas perangkat untuk personalisasi bimbingan AI.
  -- ============================================================================
  CREATE TABLE user_preferences (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,                                -- Nama panggilan/lengkap pengguna (mis. 'Budi Santoso')
      goals TEXT,                                    -- Target aplikasi aktif (mis. 'Beasiswa LPDP 2026', 'Visa Schengen')
      accessibility_preset JSONB DEFAULT '{}'::jsonb,-- Konfigurasi preset 14 tools Accessibility HUB
      default_language TEXT DEFAULT 'id',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- ============================================================================
  -- KEBIJAKAN ROW-LEVEL SECURITY (RLS)
  -- ============================================================================
  ALTER TABLE savvy_sessions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE coach_cache ENABLE ROW LEVEL SECURITY;
  ALTER TABLE vector_stores ENABLE ROW LEVEL SECURITY;
  ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

  -- User hanya dapat membaca & memodifikasi sesinya sendiri
  CREATE POLICY "Users own their sessions" ON savvy_sessions
      FOR ALL USING (auth.uid() = user_id);

  -- Cache publik & direktori juknis dapat dibaca oleh seluruh user terautentikasi / anonim
  CREATE POLICY "Public read for coach cache" ON coach_cache
      FOR SELECT USING (true);
  CREATE POLICY "Public read for vector stores" ON vector_stores
      FOR SELECT USING (true);

  -- Pengguna dapat mengirim feedback & membaca preferensi miliknya sendiri
  CREATE POLICY "Users insert feedback" ON feedback_reports
      FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  CREATE POLICY "Users manage preferences" ON user_preferences
      FOR ALL USING (auth.uid() = user_id);
  ```

### 6.3 Pemanfaatan Model AI (Eksklusif Meta Model API)

Seluruh pemanggilan model AI cerdas berjalan secara terpusat langsung melalui **Meta Model API** resmi. Pemanfaatan model AI dibatasi secara terfokus pada 5 model resmi:

| No | Komponen / Fitur | Model AI | Jalur Akses / Provider | Peran Utama di Savvy.AI |
|---|---|---|---|---|
| 1 | **Multi-Agent Orchestrator & Reasoning** | **Muse Spark Open** | Cloud Meta Model API | Field Coach, Essay Coach, Consistency Checker, Explain This (Multimodal) |
| 2 | **Document Retrieval (RAG)** | **Muse Vector Store (`file_search`)** | Cloud Meta Model API | Retrieval juknis resmi dengan chunking semantik & sitasi halaman persis |
| 3 | **STT (Speech-to-Text)** | **Muse Voice Transcribe** | Cloud Meta Model API | Transkripsi audio dari mikrofon klien untuk Handsfree Voicebot |
| 4 | **Visual Segmentation** | **SAM 3.1 Open 0.87B** | Cloud Meta Model API | Segmentasi visual dokumen/formulir lanjutan bila input melebihi kapasitas klien |
| 5 | **Agentic Vibecoding & Engineering** | **Muse Code** | Meta Developer Tooling | Dokumentasi rekayasa agentic dan log vibecoding di `docs/muse-code-log.md` |

*(Catatan: Output suara/TTS asisten dijalankan secara deterministik on-device via browser Web Speech API tanpa memerlukan model eksternal).*

### 6.4 Diagram Arsitektur & Alur Data

```
 [ Portal Web Formulir / PDF Form ]
         │ (content script: deteksi fokus & struktur DOM, tanpa .value)
         ▼
 ┌───────────────────────────────────────────────────────────────┐
 │               Ekstensi Browser Savvy.AI (MV3)                │
 │  ├── Closed Shadow DOM Overlay (Beacon Spotlight, Cursor)    │
 │  ├── Side Panel UI (React + Tailwind)                        │
 │  ├── Local Engines: MobileSAM Q4, RapidOCR, Silero VAD        │
 │  ├── Native Web Speech API (TTS Suara Asisten On-Device)     │
 │  └── Multiple Vault (AES-256-GCM + Master Password Lokal)     │
 └───────────────────────────────┬───────────────────────────────┘
                                 │ HTTPS (Bearer JWT / Session ID)
                                 ▼
 ┌───────────────────────────────────────────────────────────────┐
 │               Backend API Gateway (Vercel Node/TS)            │
 │  ├── Session & Chain Manager (savvy_sessions via Responses API)│
 │  ├── Shared Cache Engine (coach_cache - single flight)        │
 │  └── Photo Auditor Engine (sharp in-memory deterministik)     │
 └───────────────────────┬───────────────────────┬───────────────┘
                         │                       │
                         ▼                       ▼
 ┌───────────────────────────────┐     ┌───────────────────────────────────┐
 │      Supabase PostgreSQL      │     │          Meta Model API           │
 │  - Sessions (savvy_sessions)  │     │  - Muse Spark Open (Reasoning)    │
 │  - Coach Cache (coach_cache)  │     │  - Muse Vector Store (file_search)│
 │  - Store Maps (vector_stores) │     │  - Muse Voice Transcribe (STT)    │
 │  - Feedback Reports           │     │  - SAM 3.1 Open (Visual Fallback) │
 └───────────────────────────────┘     │  - web_search Tool                │
                                       └───────────────────────────────────┘
```

### 6.5 Kontrak Endpoint API Utama

| Metode & Path | Fungsi | Engine / Model Terkait | Dokumen Rujukan |
|---|---|---|---|
| `POST /api/chat` (stream) | Tanya jawab Field Coach berbasis Chain ID & Responses API | Muse Spark Open + Meta `file_search` / `web_search` | [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md) |
| `POST /api/coach/field` | Penjelasan cepat field aktif via cache atau inference tunggal | `coach_cache` + Muse Spark Open | [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md) |
| `POST /api/explain` | Analisis visual snip formulir ter-masking | Muse Spark Open (Multimodal) | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) |
| `POST /api/essay/coach` | Brainstorming, feedback rubrik, dan drafting narasi esai | Muse Spark Open | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) |
| `POST /api/audit/consistency` | Pemeriksaan keselarasan silang antar-kolom (cross-field) | Muse Spark Open | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) |
| `POST /api/photo/audit` | Audit teknis pasfoto (aspek rasio, blur Laplacian, ukuran) | `sharp` (in-memory deterministik) | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) |
| `POST /api/voice/transcribe` | Transkripsi audio ucapan pengguna ke teks | Muse Voice Transcribe (Meta Model API) | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) |
| `POST /api/voice/tts` (stream)| Audio stream respons asisten (ElevenLabs HD Proxy, fallback Web Speech) | ElevenLabs Free API / Browser Web Speech | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) |
| `POST /api/feedback` | Pengiriman laporan kendala warga | Supabase DB | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) |

---

## 7. Privasi & Keamanan

| Area | Kebijakan & Aturan Teknis |
|---|---|
| **Mode Pasif** | Hanya membaca struktur semantik DOM (`role`, `accessible_name`, atribut standar). Dilarang membaca `.value` dan tanpa listener ketikan. |
| **Mode Aktif Terkontrol** | Hanya aktif atas klik pengguna (Autofill, Pre-Submit Audit, Explain This). |
| **DOM Masking Otomatis** | Seluruh kotak isian ditutup elemen hitam secara lokal sebelum screenshot area dikirim ke AI. |
| **Scrubber PII Lokal** | Regex scrubber di browser membersihkan NIK, paspor, email, dan nomor telepon sebelum diteruskan ke model LLM. |
| **Multiple Vault Zero-Knowledge** | Kunci enkripsi AES-256-GCM disimpan di memori sesi lokal dan tidak pernah keluar dari browser. |
| **Integritas Biometrik Foto** | Foto wajah tidak diubah pikselnya sama sekali, melindungi pengguna dari tuduhan manipulasi pasfoto pada hukum visa internasional. |
| **Keamanan Kunci API** | Kunci API Meta dan Supabase Service Role berada di backend Vercel; tidak pernah bocor ke sisi klien. |

---

## 8. Persyaratan Non-Fungsional

| Metrik | Target Kinerja | Status / Catatan |
|---|---|---|
| Audit formulir lokal (≤ 50 field) | < 300 ms | Pengecekan regex deterministik di content script |
| Respons cache Field Coach (`coach_cache`) | < 50 ms | Single-flight Supabase lookup |
| Token pertama chat stream RAG | < 1,8 detik | Responses API streaming + Meta Vector Store |
| Latensi audio suara asisten (TTS) | < 100 ms | Web Speech API lokal on-device |
| Explain This respons visual multimodal | < 4 detik | Muse Spark Open inference |
| Ukuran bundle model on-device ekstensi | ≤ 20 MB (~19 MB aktual) | MobileSAM Q4 + RapidOCR + Silero VAD |
| Tingkat akurasi locator di mock portal | ≥ 95% | 5-layer resilient semantic locator |

---

## 9. Rencana Demo 3 Menit & Kriteria Penilaian

### 9.1 Skenario Demo 3 Menit (Spine)
1. **0:00–0:30 (Pain & Ambiguity):**
   - Menampilkan mock portal visa/beasiswa dengan istilah rumit (*"Affidavit of Support"*, batas ukuran pasfoto ketat).
   - Menunjukkan tingginya risiko penolakan akibat salah paham instruksi birokrasi.
2. **0:30–1:15 (Understand — Multi-Agent & RAG):**
   - Kursor fokus pada kolom: Field Coach langsung memunculkan kartu panduan resmi berlabel 🟢 **Official** dari Meta Vector Store juknis.
   - Demo **Explain This** snip visual pada instruksi rumit.
   - Tanya jawab singkat via **Handsfree Voicebot** (*"Apa format surat rekomendasi yang sah?"*).
3. **1:15–1:55 (Fill — Vault & Essay Coach):**
   - Membuka Multiple Vault dengan Master Password.
   - **1-Click Autofill** mengisi data identitas secara instan, disusul demonstrasi **Undo Autofill** yang aman.
   - Penggunaan **Essay Coach** pada kolom motivasi: merapikan 3 bullet kasar menjadi paragraf formal tanpa mengarang fakta.
4. **1:55–2:35 (Audit — Traffic Light & Foto):**
   - Menjalankan **Traffic Light Pre-Submit Audit**: mendeteksi kesalahan format tanggal terbalik dan pasfoto blur.
   - Consistency Checker menandai perbedaan nama paspor vs nama di form identitas.
   - Pengguna menekan *Apply Fix* dari Drawer, mengunggah pasfoto tajam yang lolos uji rasio biometrik → status audit berubah hijau 🟢.
5. **2:35–3:00 (Behind The Scenes & Penutup):**
   - Menampilkan diagram arsitektur on-device 19 MB (MobileSAM + RapidOCR + Silero VAD) dan integrasi Meta AI (Muse Spark Open, Vector Store, Muse Voice).
   - *"Savvy.AI: Pahami, Isi, Periksa — Built for Your World with Meta AI."*

### 9.2 Kriteria Penilaian Hackathon
- **Impact (30%):** Memecahkan friksi birokrasi universal warga dunia secara langsung di atas portal formulir nyata tanpa perlu API dari pemerintah.
- **Use of Meta AI Tooling (25%):** Pemanfaatan mendalam Muse Spark Open, Meta Vector Stores (`file_search`), `web_search`, SAM 3.1, Muse Voice Transcribe, dan dokumentasi Muse Code.
- **Technical Depth (20%):** Compound multi-agent system, Responses API stateful loop, on-device AI 19 MB, zero-knowledge multiple vault, dan deterministic guardrails.
- **Demo Quality (25%):** Mock portal interaktif yang stabil dan responsif tanpa kendala ketergantungan jaringan luar.

---

## 10. Manajemen Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Latensi panggilan LLM & Tool Search | Sedang | *Two-tier cache*: `coach_cache` lokal/server menampung 80% pertanyaan field umum; single-flight request mencegah duplikasi komputasi. |
| Variasi struktur HTML pada portal liar | Sedang | Multi-layer locator 5 lapis (Semantic A11y Tree, Stable Attributes, Section Hierarchy, Geometric DOM, Fuzzy Levenshtein). |
| Penolakan izin mikrofon pengguna | Rendah | Fallback penuh ke mode input teks chat di Side Panel. |
| Biaya & kuota Meta Model API | Rendah | Utilisasi kredit hackathon $150 Meta API secara terukur; optimasi two-tier cache (`coach_cache`) menekan konsumsi token hingga 80%. |
