# Arsitektur Sistem — Savvy.AI

> **Versi 2.0 · 28 Oktober 2026**  
> Proyek: **Savvy.AI** — Browser-Native Compound Multi-Agent Assistant untuk Pendaftaran Formulir Publik  
> Meta Global AI Developer Hackathon 2026 · Track: Indie Developer  
> Dokumen Spesifikasi Terkait:
> - [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) — Product Requirements Document & Feature Specs
> - [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) — Arsitektur Compound Multi-Agent & Prompt Schemas
> - [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md) — Responses API, Stateful Chains, & Two-Tier Cache
> - [`file_search_vector_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/file_search_vector_tool.md) — Meta Vector Stores & Tool `file_search`
> - [`web_search_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/web_search_tool.md) — Manual Researcher Agent & Tool `web_search`

---

## 1. Ringkasan Eksekutif & Filosofi Arsitektur

Savvy.AI dibangun di atas prinsip **Zero-Integration / Zero-SDK**, di mana asisten aktif di sisi klien (browser ekstensi) di atas portal web mana pun (visa, beasiswa, paspor, perizinan, CPNS) dan dokumen PDF formulir tanpa memerlukan API, izin, atau integrasi dari instansi pemilik portal.

Arsitektur sistem memisahkan secara tegas antara:
1. **Deterministic Guardrails (Lokal/Klien):** Validasi regex, enkripsi AES-256-GCM, FSM navigasi, OCR lokal, dan audit pasfoto (sharp) yang tidak diserahkan pada halusinasi model AI.
2. **Agentic Reasoning & RAG (Meta Model API):** Penalaran konteks instruksi birokrasi, retrieval juknis resmi, sintesis draf esai, dan konsistensi data silang menggunakan ekosistem Meta AI resmi.
3. **Audio Presentation Layer (Hybrid):** Transkripsi STT berbasis **Muse Voice Transcribe** via Meta Model API, dan output suara asisten berbasis **ElevenLabs HD Proxy** (Free Tier 10.000 karakter untuk demo) dengan *graceful fallback* ke **Browser Native Web Speech API**.

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
 │   │  • 5-Layer Resilient Semantic Locator Engine ├───────►│  • Multiple Vault Manager (Master Password)              │   │
 │   │  • Local PII Scrubber (NIK, Paspor, Telp)    │        │  • Upload ID to Vault (OCR Preview)                       │   │
 │   │  • DOM Masking Canvas (Blackout isian data)  │        │  • Essay Coach & Traffic Light Drawer                     │   │
 │   └──────────────────────────────────────────────┘        └─────────────────────────────┬─────────────────────────────┘   │
 │                                                                                         │                                 │
 │   ┌─────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────┐   │
 │   │                                         BACKGROUND SERVICE WORKER                                                 │   │
 │   │  • Session & Tab Life Cycle Management        • WebCrypto AES-256-GCM Multiple Vault (PBKDF2-SHA256)              │   │
 │   │  • Local On-Device AI Stack (~19 MB):                                                                             │   │
 │   │    - MobileSAM Q4 ONNX (10 MB) — Visual Boundary     - RapidOCR ONNX (8 MB) — OCR KTP Lokal                       │   │
 │   │    - Silero VAD (1 MB) — Deteksi Jeda Hening         - Web Speech API — Deterministic Native TTS Fallback        │   │
 │   └─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘   │
 └─────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┘
                                                                   │ HTTPS (Bearer JWT / Session ID)
                                                                   ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           BACKEND API GATEWAY (VERCEL SERVERLESS)                                         │
 │                                                                                                                           │
 │   ├── Session & Chain Manager: Pemeliharaan context window via Responses API (`current_chain_id`, `tab_id`)               │
 │   ├── Shared Cache Engine: In-memory single-flight deduplication + lookup `coach_cache` (<50 ms)                          │
 │   ├── Photo Compliance Engine: Audit pasfoto in-memory via `sharp` (Aspek rasio, Laplacian blur, proporsi kepala)        │
 │   └── Audio Proxy Gateway: Streaming ElevenLabs HD ke klien & penanganan kuota (HTTP 429 auto-fallback)                   │
 └───────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┬───────────────────────┘
                                 │                                 │                                 │
                                 ▼                                 ▼                                 ▼
 ┌──────────────────────────────────────────────┐  ┌────────────────────────────────┐  ┌─────────────────────────────────────┐
 │             SUPABASE POSTGRESQL              │  │        ELEVENLABS API          │  │       META MODEL API (CLOUD)        │
 │                                              │  │                                │  │                                     │
 │  • savvy_sessions (Stateful Chain Tracking)  │  │  • Model: Multilingual v2 /    │  │  1. Muse Spark Open (Reasoning)     │
 │  • coach_cache (Normalized Signature Cache)  │  │    Eleven Flash v2.5           │  │  2. Muse Vector Store (file_search) │
 │  • vector_stores (Mapping Domain Portal)     │  │  • Free Tier: 10.000 karakter  │  │  3. Muse Voice Transcribe (STT)     │
 │  • feedback_reports (User Crowdsourced Bugs) │  │  • Streaming Audio MP3         │  │  4. SAM 3.1 Open (Visual Fallback)  │
 │  • Row-Level Security (RLS) & Anon Auth      │  │    (Khusus Demo HD Audio)      │  │  5. Muse Code (Engineering Log)     │
 └──────────────────────────────────────────────┘  └────────────────────────────────┘  └─────────────────────────────────────┘
```

---

## 3. Tech Stack Matrix

| Layer | Komponen / Library | Versi / Resource | Peran & Alasan Pemilihan |
|---|---|---|---|
| **Extension Client** | **WXT (Next-gen Web Extension)** | Vite + React 18 | Bundler MV3 modern dengan HMR, support Shadow DOM, dan TypeScript strict |
| | **Tailwind CSS** | v3.4 | Utilitas styling Side Panel yang ringkas dan modern |
| | **WebCrypto API** | Native Browser | Enkripsi `AES-256-GCM` + derivasi kunci `PBKDF2-SHA256` (≥ 600.000 iterasi) untuk Multiple Vault |
| **On-Device AI (~19 MB)** | **MobileSAM Q4 ONNX** | 10 MB | Segmentasi visual dokumen/KTP di sisi klien tanpa kirim berkas ke server |
| | **RapidOCR ONNX** | 8 MB | Ekstraksi teks KTP/ID Card lokal langsung ke formulir Vault |
| | **Silero VAD** | 1 MB | Deteksi jeda suara & barge-in lokal untuk Handsfree Voicebot |
| **Backend Gateway** | **Vercel Serverless (Node/TS)** | Node.js 20 LTS | Hosting gateway API serverless cepat, gratis, dan scale-to-zero |
| | **Sharp** | v0.33+ | Pemrosesan citra deterministik C++ in-memory (Laplacian variance blur, rasio aspek biometrik) |
| **Database & Cache** | **Supabase PostgreSQL** | v15 (Cloud) | Penyimpanan sesi stateful, cache respons field, dan Auth Anonim dengan RLS |
| **Cloud AI Models** | **Muse Spark Open** | Meta Model API | Otak utama: ReAct orchestrator, Field Coach, Essay Coach, Consistency Checker, Multimodal Snip |
| | **Muse Vector Store** | Meta Model API | Cloud RAG juknis resmi portal dengan chunking semantik & sitasi bab/halaman persis |
| | **Muse Voice Transcribe** | Meta Model API | Cloud STT mengubah audio ucapan warga menjadi teks interaktif |
| | **SAM 3.1 Open (0.87B)** | Meta Model API | Cloud visual fallback untuk segmentasi dokumen resolusi tinggi |
| | **Muse Code** | Meta Tooling | Dokumentasi rekayasa sistem agentic di `docs/muse-code-log.md` |
| **Audio Presentation** | **ElevenLabs Free API** | 10.000 chars | Audio HD suara natural asisten untuk video demo (*stream via backend proxy*) |
| | **Web Speech API** | Native Browser | *Deterministic Fallback*: Sintesis suara instan (<50ms) saat offline atau kuota ElevenLabs habis |

---

## 4. Rincian Pemanfaatan Model AI (Eksklusif Meta Model API)

Seluruh pemodelan kecerdasan buatan dijalankan secara eksklusif melalui **Meta Model API** resmi tanpa hosting perantara pihak ketiga (tanpa Baseten):

### 4.1 Muse Spark Open (The Orchestrator & Multi-Agent Brain)
* **Peran:**
  * Menjalankan siklus ReAct (*Think → Act → Observe*) pada Field Coach dan Chatbot.
  * Menerima input visual gambar beranotasi pada fitur **Explain This** (Vision Multimodal) setelah kotak isian ditutup oleh DOM Masking.
  * Bertindak sebagai **Essay Coach**: menstrukturkan 3 bullet fakta kasar menjadi draft narasi formal tanpa halusinasi fakta.
  * Bertindak sebagai **Consistency Checker**: membandingkan silang keselarasan data antar-field (misal: Nama di Form vs Nama di Paspor).
* **Integrasi:** Dipanggil melalui endpoint backend `POST /api/chat`, `POST /api/coach/field`, `POST /api/essay/coach`, dan `POST /api/audit/consistency`.

### 4.2 Muse Vector Store (`file_search` Tool)
* **Peran:**
  * Menyimpan representasi semantik juknis resmi portal beasiswa/visa (misal: LPDP, Schengen Visa, US Visa Guide).
  * Menghasilkan grounding kutipan resmi (🟢 **Official Badge**) disertai referensi nomor halaman dan nomor bab yang dapat diverifikasi pengguna.
* **Integrasi:** Terhubung sebagai tool bawaan (`file_search`) pada sesi inferensi Muse Spark Open.

### 4.3 Muse Voice Transcribe (Speech-to-Text)
* **Peran:**
  * Mengonversi rekaman suara ucapan warga dari mikrofon browser menjadi teks pertanyaan secara akurat.
  * Bekerja sama dengan on-device **Silero VAD** yang mendeteksi kapan pengguna mulai dan selesai berbicara (jeda hening 800 ms).
* **Integrasi:** Dipanggil melalui endpoint backend `POST /api/voice/transcribe`.

### 4.4 SAM 3.1 Open 0.87B (Visual Fallback)
* **Peran:**
  * Fallback server-side untuk segmentasi dokumen, batas tepi formulir, atau pemindaian resolusi tinggi jika perangkat klien memiliki keterbatasan WebAssembly/RAM.
* **Integrasi:** Dipanggil via backend saat payload visual melampaui kapasitas MobileSAM Q4 lokal.

### 4.5 Muse Code (Agentic Engineering)
* **Peran:**
  * Dokumentasi alur pengembangan vibecoding sistem multi-agent, pencatatan iterasi schema JSON, dan logging perbaikan sistem di `docs/muse-code-log.md`.

---

## 5. Strategi Audio & Suara Asisten (ElevenLabs + Web Speech API)

Untuk menghasilkan pengalaman asisten yang memukau (*wow factor*) saat demonstrasi tanpa membebani server atau menabrak limit gratis Vercel:

```
                          [ Asisten Selesai Menghasilkan Teks ]
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │  Ekstensi Memanggil: POST /api/voice/tts      │
                    └───────────────────────┬───────────────────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        │                                       │
                        ▼                                       ▼
             [ Cek Kuota ElevenLabs ]               [ Kuota Habis / Error 429 ]
             • Status: HTTP 200                     • Status: HTTP 429 / Offline
             • Model: Multilingual v2 / Flash       • Trigger: Fallback Otomatis
                        │                                       │
                        ▼                                       ▼
            ┌──────────────────────┐               ┌───────────────────────────────┐
            │ Stream Audio MP3 HD  │               │ Browser Web Speech API        │
            │ (Vercel Proxy Ringan)│               │ (`window.speechSynthesis`)    │
            └──────────────────────┘               │ - 0 Latensi (<50 ms)          │
                                                   │ - 0 Beban Server              │
                                                   │ - Bahasa Indonesia / English  │
                                                   └───────────────────────────────┘
```

1. **ElevenLabs HD Proxy (`/api/voice/tts`):**
   * Endpoint Vercel bertindak sebagai *streaming proxy* ringan (menyembunyikan `ELEVENLABS_API_KEY`).
   * Memanfaatkan kuota gratis 10.000 karakter (~1.500 kata bicara) khusus untuk demonstrasi dan video submission.
2. **Web Speech API Fallback:**
   * Jika panggilan ElevenLabs gagal, kuota habis, atau pengguna dalam mode hemat kuota, klien otomatis beralih ke `speechSynthesis` lokal seketika.
   * Suara asisten dijamin tidak pernah macet (*zero failure*).

---

## 6. Two-Tier Cache & Stateful Responses API

Untuk menghemat kuota Meta Model API dan mencapai waktu respons instan:

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
       Meta Model API (Responses API)
     Muse Spark Open + file_search
                  │
                  ▼
       Simpan ke coach_cache & Kirim
```

1. **Sesi Stateful via Responses API:**
   * Riwayat percakapan tidak dikirim ulang secara penuh (*preventing token ballooning*).
   * Backend mengelola pointer `current_chain_id` pada tabel `savvy_sessions` per `(user_id, tab_id)`.
2. **Single-Flight Deduplication:**
   * Jika beberapa tab menanyakan field yang sama secara bersamaan, gateway hanya melakukan satu panggilan inferensi ke Meta Model API dan mendistribusikan hasilnya ke seluruh pemanggil.

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
   * Regex sisi klien menyamarkan NIK, nomor paspor, dan kontak sebelum teks prompt dikirim ke Meta Model API.

---

## 8. Persyaratan Operasional & Deploy

* **Ekstensi Browser:** Dibundel via `wxt build` menghasilkan folder `dist/` Manifest V3 siap muat di Developer Mode Chrome/Edge.
* **Backend API Gateway:** Terdeploy di **Vercel** (`/api/*`) pada tier Hobby/Free.
* **Database & Auth:** Terhubung ke proyek **Supabase Cloud** dengan kebijakan Row-Level Security aktif.
* **Environment Variables yang Dibutuhkan:**
  ```env
  # Meta Model API (Wajib)
  META_MODEL_API_KEY=your_meta_model_api_key
  META_MODEL_API_URL=https://api.meta.ai/v1

  # Supabase Service & Client (Wajib)
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

  # Audio Presentation Utility (Opsional untuk Demo HD)
  ELEVENLABS_API_KEY=your_elevenlabs_api_key
  ELEVENLABS_VOICE_ID=your_selected_voice_id
  ```