# Arsitektur Sistem — Savvy.AI

> **Versi 2.0 · 28 Oktober 2026**  
> Proyek: **Savvy.AI** — Browser-Native Compound Multi-Agent Assistant untuk Pendaftaran Formulir Publik  
> Meta Global AI Developer Hackathon 2026 · Track: Indie Developer  
> Dokumen Spesifikasi Terkait:
> - [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) — Product Requirements Document & Feature Specs
> - [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) — Arsitektur Compound Multi-Agent & Prompt Schemas
> - [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md) — Baseten Chaining, Sliding Window Context, & Two-Tier Cache
> - [`file_search_vector_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/file_search_vector_tool.md) — Juknis RAG Storage & Tool `file_search`
> - [`web_search_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/web_search_tool.md) — Manual Researcher Agent & Tool `web_search`

---

## 1. Ringkasan Eksekutif & Filosofi Arsitektur

Savvy.AI dibangun di atas prinsip **Zero-Integration / Zero-SDK**, di mana asisten aktif di sisi klien (browser ekstensi) di atas portal web mana pun (visa, beasiswa, paspor, perizinan, CPNS) dan dokumen PDF formulir tanpa memerlukan API, izin, atau integrasi dari instansi pemilik portal.

Arsitektur sistem memisahkan secara tegas antara:
1. **Deterministic Guardrails (Lokal/Klien):** Validasi regex, enkripsi AES-256-GCM, FSM navigasi, OCR lokal, dan audit pasfoto (sharp) yang tidak diserahkan pada halusinasi model AI.
2. **Agentic Reasoning & RAG (Muse Spark Open via Baseten):** Penalaran konteks instruksi birokrasi, retrieval juknis resmi, sintesis draf esai, dan konsistensi data silang menggunakan model resmi Meta (`meta-models/muse-spark-open-1026`) yang di-host di Baseten Inference API.
3. **Audio Presentation Layer:** Input suara menggunakan Web Speech API (Browser STT) atau audio recording, dan output suara asisten berbasis **Browser/OS Native Web Speech API** (`window.speechSynthesis`, zero-latency, 100% lokal, tanpa dependensi server).

---

## 2. Diagram Arsitektur Sistem Global

```
                                 ┌──────────────────────────────────────────────────────────┐
                                 │       Portal Web Target / Mock Portal / Formulir PDF     │
                                 └────────────────────────────┬─────────────────────────────┘
                                                              │ DOM Accessibility Tree / Events
                                                              ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                              EKSTENSI BROWSER (MANIFEST V3)                                               │
 │                                                                                                                           │
 │   ┌──────────────────────────────────────────────┐        ┌───────────────────────────────────────────────────────────┐   │
 │   │               CONTENT SCRIPT                 │        │                 SIDE PANEL UI (React 18)                  │   │
 │   │  • Closed Shadow DOM (Beacon Spotlight)      │        │  • Field Coach Card (4 Elemen + Badge Bukti)              │   │
 │   │  • Animated Virtual Cursor                   │  IPC   │  • Handsfree Voicebot (Avatar Lipsync & VAD)              │   │
 │   │  • 5-Layer Resilient Semantic Locator Engine ├───────►│  • Web Speech API (`speechSynthesis` TTS Lokal)          │   │
 │   │  • Local PII Scrubber (NIK, Paspor, Telp)    │        │  • Multiple Vault Manager (Master Password)              │   │
 │   │  • DOM Masking Canvas (Blackout isian data)  │        │  • Upload ID to Vault (OCR Preview)                       │   │
 │   │  └───────────────────────────────────────────┘        │  • Essay Coach & Traffic Light Drawer                     │   │
 │   │                                                       └─────────────────────────────┬─────────────────────────────┘   │
 │   │                                                                                     │                                 │
 │   │   ┌─────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────┐   │
 │   │   │                                         BACKGROUND SERVICE WORKER                                                 │   │
 │   │   │  • Session & Tab Life Cycle Management        • WebCrypto AES-256-GCM Multiple Vault (PBKDF2-SHA256)              │   │
 │   │   │  • Local Client Stack:                                                                                            │   │
 │   │   │    - Silero VAD (1 MB) — Deteksi Jeda Hening         - Web Speech API — Zero-Latency Native TTS Engine           │   │
 │   │   │    - DOM Masking Canvas (Blackout PII)               - Pure Meta Model Architecture (No Non-Meta Models)         │   │
 │   │   └─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────┘   │
 │   └─────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┘
                                                                       │ HTTPS (Bearer JWT / Session ID)
                                                                       ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           BACKEND API GATEWAY (VERCEL SERVERLESS)                                         │
 │                                                                                                                           │
 │   ├── Session & Context Manager: Pemeliharaan context sliding window & Supabase session (`session_id`, `tab_id`)          │
 │   ├── Shared Cache Engine: In-memory single-flight deduplication + lookup `coach_cache` (<50 ms)                          │
 │   └── Photo Compliance Engine: Audit pasfoto in-memory via `sharp` (Aspek rasio, Laplacian blur, proporsi kepala)        │
 └───────────────────────────────┬───────────────────────────────────────────────────────────────────┬───────────────────────┘
                                 │                                                                   │
                                 ▼                                                                   ▼
 ┌──────────────────────────────────────────────┐                   ┌─────────────────────────────────────────────────────────┐
 │             SUPABASE POSTGRESQL              │                   │              BASETEN INFERENCE API (CLOUD)              │
 │                                              │                   │                                                         │
 │  • savvy_sessions (Session & State Tracking) │                   │  1. Muse Spark Open (`meta-models/muse-spark-open-1026`)│
 │  • coach_cache (Normalized Signature Cache)  │                   │     - Reasoning Engine (low/med/high/xhigh)             │
 │  • juknis_chunks (Grounding Dokumen RAG)     │                   │     - Multimodal Vision (Explain This & Vault OCR)      │
 │  • feedback_reports (User Crowdsourced Bugs) │                   │     - Native Tool Calling & ReAct Orchestrator          │
 │  • Row-Level Security (RLS) & Anon Auth      │                   │  2. Muse Code (Engineering Architecture Log)            │
 └──────────────────────────────────────────────┘                   └─────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack Matrix

| Layer | Komponen / Library | Versi / Resource | Peran & Alasan Pemilihan |
|---|---|---|---|
| **Extension Client** | **WXT (Next-gen Web Extension)** | Vite + React 18 | Bundler MV3 modern dengan HMR, support Shadow DOM, dan TypeScript strict |
| | **Tailwind CSS** | v3.4 | Utilitas styling Side Panel yang ringkas dan modern |
| | **WebCrypto API** | Native Browser | Enkripsi `AES-256-GCM` + derivasi kunci `PBKDF2-SHA256` (≥ 600.000 iterasi) untuk Multiple Vault |
| **Client Audio & VAD** | **Silero VAD** | 1 MB | Deteksi jeda suara & barge-in lokal untuk Handsfree Voicebot |
| **Backend Gateway** | **Vercel Serverless (Node/TS)** | Node.js 20 LTS | Hosting gateway API serverless cepat, gratis, dan scale-to-zero |
| | **Sharp** | v0.33+ | Pemrosesan citra deterministik C++ in-memory (Laplacian variance blur, rasio aspek biometrik) |
| **Database & Cache** | **Supabase PostgreSQL** | v15 (Cloud) | Penyimpanan sesi stateful, cache respons field, dan Auth Anonim dengan RLS |
| **Cloud AI Models** | **Muse Spark Open** | Baseten (`meta-models/muse-spark-open-1026`) | Otak utama: ReAct orchestrator, Field Coach, Essay Coach, Consistency Checker, Multimodal Vision Document Extractor (in-RAM only, UU PDP consent) via Baseten Inference API |
| | **Juknis Knowledge Store** | Supabase PostgreSQL / Local JSON | Grounding RAG juknis resmi portal dengan chunking semantik & sitasi bab/halaman persis diinjeksikan ke context Muse Spark Open |
| | **Muse Code** | Meta Tooling | Dokumentasi rekayasa sistem agentic di `docs/muse-code-log.md` |
| **Audio Presentation** | **Web Speech API** | Native Browser/OS | Sintesis suara instan (<50 ms) bawaan browser/sistem operasi (`window.speechSynthesis`) untuk bahasa Indonesia, Inggris, dll. Zero-cost, zero-latency, 100% lokal tanpa beban server. |

---

## 4. Rincian Pemanfaatan Model AI (Eksklusif Model Meta via Baseten)

Seluruh pemodelan kecerdasan buatan dijalankan secara eksklusif menggunakan model resmi Meta yaitu **Muse Spark Open** (`meta-models/muse-spark-open-1026`) yang di-host pada platform inferensi **Baseten**:

### 4.1 Muse Spark Open (The Orchestrator & Multi-Agent Brain)
* **Peran:**
  * Menjalankan siklus ReAct (*Think → Act → Observe*) pada Field Coach dan Chatbot dengan Tool Calling standar OpenAI-compatible.
  * Menerima input visual gambar beranotasi pada fitur **Explain This** (Vision Multimodal) serta pemindaian dokumen ID/KTP untuk vault via input base64 `image_url`.
  * Bertindak sebagai **Essay Coach**: menstrukturkan bullet fakta kasar menjadi draft narasi formal tanpa halusinasi fakta dengan penalaran mendalam (`reasoning_effort: "high"`).
  * Bertindak sebagai **Consistency Checker**: membandingkan silang keselarasan data antar-field (misal: Nama di Form vs Nama di Paspor).
* **Integrasi:** Dipanggil melalui endpoint gateway backend `POST /api/chat`, `POST /api/coach/field`, `POST /api/essay/coach`, dan `POST /api/audit/consistency` yang mengarah ke `https://inference.baseten.co/v1/chat/completions`.

### 4.2 Juknis RAG Knowledge Base (`file_search` Tool)
* **Peran:**
  * Menyimpan representasi semantik juknis resmi portal beasiswa/visa (misal: LPDP, Schengen Visa, US Visa Guide) pada database Supabase / file JSON terstruktur.
  * Menghasilkan grounding kutipan resmi (🟢 **Official Badge**) disertai referensi nomor halaman dan nomor bab yang diinjeksikan langsung ke dalam konteks penalaran Muse Spark Open.
* **Integrasi:** Dijalankan via function calling tool `search_scholarship_guide` / `lookup_official_docs` pada loop agent Muse Spark Open di Baseten.

### 4.3 Muse Code (Agentic Engineering)
* **Peran:**
  * Dokumentasi alur pengembangan vibecoding sistem multi-agent, pencatatan iterasi schema JSON, dan logging perbaikan sistem di `docs/muse-code-log.md`.

---

## 5. Strategi Audio & Suara Asisten (Browser/OS Native Web Speech API)

Untuk menghasilkan asisten suara yang responsif, zero-latency, dan tidak bergantung pada API berbayar pihak ketiga:

```
                          [ Asisten Selesai Menghasilkan Teks ]
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │   Side Panel / Content Script Ekstensi       │
                     │       Trigger `window.speechSynthesis`       │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │   Browser/OS Native SpeechSynthesis Engine   │
                     │   - Windows SAPI / macOS Speech / Android    │
                     │   - Zero Latensi (<50 ms, langsung bunyi)    │
                     │   - 100% Offline & Tanpa Kuota API           │
                     │   - Dukungan Bawaan: id-ID, en-US, dll.      │
                     └──────────────────────────────────────────────┘
```

1. **Native On-Device Speech Synthesis (`window.speechSynthesis`):**
   * Sintesis suara berjalan langsung di browser pengguna menggunakan mesin TTS bawaan sistem operasi (Windows Speech API, Apple AVFoundation, Google TTS).
   * Mendukung penyesuaian laju bicara (`rate`), nada (`pitch`), dan pemilihan suara (`getVoices()`) sesuai bahasa pendaftar (Bahasa Indonesia `id-ID`, English `en-US`, dll).
2. **Keunggulan Tanpa Server:**
   * **Zero Cost & Zero Limit:** Tidak ada pembatasan kuota karakter bulanan.
   * **Privasi Maksimal:** Suara dibangkitkan langsung di mesin lokal tanpa mengirimkan teks ke proxy cloud pihak ketiga.
   * **Kesiapan Offline:** Tetap berfungsi saat jaringan internet mengalami fluktuasi.

---

## 6. Two-Tier Cache & Sliding Window Conversation Flow

Untuk menghemat pemanggilan inferensi Baseten dan mencapai waktu respons instan:

```
[ Pengguna Fokus ke Kolom / Bertanya ] 
                  │
                  ▼
         Generate Signature
  (hash: portal_domain + field_locator)
                  │
                  ▼
         Cek coach_cache (Tier 2) ─────────► [ HIT ] ──► Tampilkan (<50 ms)
                  │
               [ MISS ]
                  │
                  ▼
        Baseten Inference API
      Muse Spark Open + RAG Context
                  │
                  ▼
       Simpan ke coach_cache & Kirim
```

1. **Manajemen Konteks Sesi:**
   * Menggunakan riwayat percakapan array `messages: [...]` yang dikelola secara efisien dengan *sliding window* (10 pesan aktif) dan di-chaining ke Baseten.
2. **Single-Flight Deduplication:**
   * Jika beberapa tab menanyakan field yang sama secara bersamaan, gateway hanya melakukan satu panggilan inferensi ke Baseten dan mendistribusikan hasilnya ke seluruh pemanggil.

---

## 7. Kriptografi & Privasi Data Klien (Multiple Vault)

1. **Zero-Knowledge Multi-Vault:**
   * Setiap vault (Pribadi, Pasangan, Kerja) dilindungi oleh **Master Password** lokal.
   * Derivasi Kunci: `PBKDF2-SHA256` dengan salt unik lokal dan ≥ 600.000 iterasi.
   * Enkripsi Data: WebCrypto `AES-256-GCM` dengan Initialization Vector (IV) acak 96-bit per enkripsi.
   * Kunci enkripsi hanya berada di memori volatile ekstensi saat status *Unlocked*, dan tidak pernah disimpan atau dikirim ke server Supabase/Vercel.
2. **DOM Masking Otomatis:**
   * Fitur *Explain This* melakukan render canvas penutup warna hitam pekat di atas seluruh elemen input data pengguna sebelum mengambil cuplikan layar.
3. **Local PII Scrubber:**
   * Regex sisi klien menyamarkan NIK, nomor paspor, dan kontak sebelum teks prompt dikirim ke model AI.

---

## 8. Persyaratan Operasional & Deploy

* **Ekstensi Browser:** Dibundel via `wxt build` menghasilkan folder `dist/` Manifest V3 siap muat di Developer Mode Chrome/Edge.
* **Backend API Gateway:** Terdeploy di **Vercel** (`/api/*`) pada tier Hobby/Free.
* **Database & Auth:** Terhubung ke proyek **Supabase Cloud** dengan kebijakan Row-Level Security aktif.
* **Environment Variables yang Dibutuhkan:**
  ```env
  # Baseten Inference API (Wajib untuk Muse Spark Open)
  BASETEN_API_KEY=your_baseten_api_key
  BASETEN_BASE_URL=https://inference.baseten.co/v1
  MUSE_SPARK_MODEL_NAME=meta-models/muse-spark-open-1026

  # Supabase Service & Client (Wajib)
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
  ```