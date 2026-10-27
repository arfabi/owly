# PRD — Savvy.AI

> **Pahami. Isi. Periksa. Sebelum Anda menekan Submit.**
> Versi 2.0 · 27 Okt 2026 · Meta Global AI Developer Hackathon 2026 · Track: Indie Developer · Tema: Build for Your World
> Dokumen pendamping: `TASK.md` (urutan kerja), `AGENTS.md` (aturan vibecoding), `user_journey.md` (peta perjalanan pengguna), `multiagents.md` (arsitektur compound multi-agent)

---

## 1. Ringkasan Produk

**Savvy.AI** adalah ekstensi browser (Manifest V3) bergaya Whatfix/Tango untuk **warga**, bukan untuk instansi. Ekstensi berjalan di atas portal pemerintah atau formulir resmi mana pun (beasiswa, visa, paspor, perizinan) **tanpa perlu integrasi, SDK, atau izin dari pemilik portal**.

Tiga pilar solusi:
| Pilar | Pertanyaan pengguna | Inti solusi |
|---|---|---|
| **Understand** | "Kolom ini maksudnya apa?" | Chatbot/Voicebot, Forms Guide (Web & PDF), Explain This |
| **Fill** | "Bagaimana mengisinya dengan benar dan cepat?" | Multiple Vault (Password + 12 Seed), Upload to Vault (OCR KTP), Form Utility Link |
| **Audit** | "Apakah ini sudah benar dan siap dikirim?" | Traffic Light Auditor (kelengkapan, format, audit kepatuhan foto) |

### 1.1 Sasaran Hackathon
- Working product yang bisa di-install (Developer Mode) dan demo end-to-end di mock portal serta PDF form.
- Video demo 3 menit yang rapi.
- Pemakaian Meta AI yang beralasan: **Muse Spark Open** (visual reasoning & writing), **Muse Voice Transcribe** (STT audio), **SAM 3.1 open 0.87B** (segmentasi), model ringan Meta, dan **Muse Code** (coding agent).
- **Prinsip Kepatuhan Regulasi:** Mematuhi aturan ketat formulir resmi/visa internasional (mis. US Department of State / ICAO 9303 yang melarang keras *digitally altered or retouched photos*). Savvy.AI tidak melakukan manipulasi/editing piksel foto wajah, melainkan menyediakan **Audit Kepatuhan Foto** dan **Form Utility** eksternal.

---

## 2. Masalah & Pengguna

### 2.1 Masalah
1. **Ambiguity:** Istilah birokrasi dan hukum (Apostille, Affidavit of Support, Nomor SK) tidak dijelaskan di halaman formulir.
2. **Complexity:** Foto dengan latar atau ukuran salah, format tanggal terbalik, dan file ditolak karena melebihi batas KB.
3. **Anxiety:** Takut salah satu digit atau gelar akademik masuk ke nama paspor, lalu berakibat diskualifikasi atau penolakan visa.

### 2.2 Pengguna
| Persona | Kebutuhan utama | Fitur kunci |
|---|---|---|
| **Pemohon visa/beasiswa** (mis. pelamar Schengen/LPDP) | Takut ditolak karena salah teknis | Explain This, Form Utility, Audit Kepatuhan Foto |
| **Warga umum / lansia** | Literasi digital rendah, mudah lelah | Walkthrough Spotlight, Handsfree Voicebot, Accessibility HUB |
| **Officer instansi** (sekunder) | Ingin panduan resmi tanpa coding | Savvy Studio (rekam flow, isi petunjuk, terbitkan panduan) |

---

## 3. Prinsip Produk (Aturan Emas)

1. **Savvy.AI tidak pernah men-submit formulir.** Tidak ada `form.submit()`, `requestSubmit()`, atau klik tombol submit otomatis.
2. **Savvy.AI menulis ke formulir hanya atas aksi eksplisit pengguna** (klik Autofill, Insert, Paste). Semua penulisan tercatat dalam batch Undo.
3. **Mode pasif tidak membaca isian.** Dilarang membaca `.value`, tanpa screenshot, tanpa listener ketikan. Mode aktif hanya dipicu klik pengguna.
4. **Badge jujur:** 🟢 Official, 🔵 Savvy Curated, 🟡 AI Guidance. Jika tidak ada dasar, katakan "tanyakan ke instansi" dan jangan mengarang.
5. **PII tidak keluar dari browser mentah.** Scrubber lokal dan DOM masking sebelum data/gambar dikirim ke backend.
6. **Klaim privasi harus akurat.** Hanya Vault yang zero-knowledge lokal. Jalur AI dan suara diproses server aman, dan UI menyatakannya secara transparan.
7. **Deterministik di jalur kritis.** Walkthrough memakai state machine, bukan agen otonom. AI hanya memberi asistensi penjelasan.

---

## 4. Cakupan Bahasa yang Didukung (Language & Voice Support)

Target cakupan multibahasa untuk panduan formulir, terjemahan, dan sintesis suara/TTS (didukung model suara **Piper TTS Server** di Baseten CPU):

| No | Bahasa | Estimasi Penutur | Dukungan Piper TTS | Catatan Model / Fallback |
|---|---|---|:---:|---|
| 1 | **Bahasa Inggris** | ~1,49 miliar | ✅ | Didukung resmi (`en_US`, `en_GB`) |
| 2 | **Bahasa Mandarin** | ~1,18 miliar | ✅ | Didukung resmi (`zh_CN-huayan-medium`) |
| 3 | **Bahasa Hindi** | ~611 juta | ✅ | Didukung resmi (`hi_IN-priyamvada`, `hi_IN-rohan`) |
| 4 | **Bahasa Spanyol** | ~561 juta | ✅ | Didukung resmi (`es_ES`, `es_MX`) |
| 5 | **Bahasa Arab Standar Modern** | ~335 juta | ✅ | Didukung resmi (`ar_JO-kareem`) |
| 6 | **Bahasa Prancis** | ~334 juta | ✅ | Didukung resmi (`fr_FR-siwis-medium`) |
| 7 | **Bahasa Bengali** | ~278 juta | ✅ | Didukung resmi (`bn_BD-mike`) |
| 8 | **Bahasa Portugis** | ~263 juta | ✅ | Didukung resmi (`pt_BR-faber`, `pt_PT`) |
| 9 | **Bahasa Rusia** | ~255 juta | ✅ | Didukung resmi (`ru_RU-dmitri`, `ru_RU-irina`) |
| 10 | **Bahasa Urdu** | ~231 juta | ✅ | Didukung resmi (`ur_PK-male-medium`) |
| 11 | **Bahasa Indonesia** | ~199 juta | ✅ | **Prioritas Utama** (`id_ID-news_tts-medium`, `id_ID-indotts-medium`) |
| 12 | **Bahasa Jerman** | ~134 juta | ✅ | Didukung resmi (`de_DE-thorsten`) |
| 13 | **Bahasa Jepang** | ~123 juta | ✅ | Didukung resmi (`ja_JP-hi_fi_captain-medium`) |
| 14 | **Bahasa Marathi** | ~99 juta | ✅ | Didukung resmi (`mr_IN-marathi`) |
| 15 | **Bahasa Telugu** | ~96 juta | ✅ | Didukung resmi (`te_IN-maya`) |
| 16 | **Bahasa Turki** | ~88 juta | ✅ | Didukung resmi (`tr_TR-fahrettin`) |
| 17 | **Bahasa Vietnam** | ~85 juta | ✅ | Didukung resmi (`vi_VN-25hours_single`) |

*Catatan fallback:* Untuk bahasa yang belum memiliki model Piper resmi, sistem otomatis menggunakan *fallback* ke TTS bawaan browser atau Google Wavenet.

---

## 5. PERSYARATAN FITUR

### 5.1 Fitur Ekstensi User (Savvy.AI)

#### A. AI Assistant
1. **Side Panel UI:** 3 Tab navigasi (*AI Assistant*, *Forms Guide*, *AutoFill*) dengan pemilih mode Chatbot & Voicebot.
2. **Chatbot "Tanya Savvy":** Tanya jawab teks dengan konteks field aktif dan potongan juknis resmi (Supabase RAG).
3. **Voicebot (Tap-to-Talk & Handsfree VAD):**
   - Mendukung interaksi tekan mic atau mode Handsfree (sesi 2 menit otomatis merespons saat jeda hening terdeteksi via Silero VAD).
   - **Arsitektur Pemrosesan Suara End-to-End:**
     | Tahap | Komponen | Lokasi |
     |:---|:---|:---|
     | **1. Deteksi bicara & barge-in** | **Silero VAD** | Lokal (browser) |
     | **2. STT** | **Muse Voice Transcribe** | Cloud Meta Model API, lewat relay backend |
     | **3. Cadangan** | **Input teks di chat** | Lokal |
     | **4. Penalaran** | **Muse Spark Open** | Baseten Model API (per token) |
     | **5. TTS** | **Piper TTS** | Baseten CPU (verifikasi dulu bahasa Indonesia), atau TTS browser sebagai cadangan |
     | **6. Pemutaran** | **Opus client** | Lokal |
4. **Avatar Talking & Lipsync:** Avatar visual SVG di Side Panel dengan animasi gerak mulut tersinkronisasi status bicara (*Speaking/Thinking/Listening*).
5. **Explain This:** Snip area formulir layar (Lightshot-style) dengan DOM Masking PII otomatis → analisis multimodal via Muse Spark Open.
6. **1-Click Autofill:** Mengisi field yang cocok dari Vault aktif secara langsung dalam satu klik.
7. **Translate Page (Scoped):** Menerjemahkan label/instruksi halaman tanpa merusak teks locator dan tanpa mengubah isi yang diketik pengguna (tersimpan di WeakMap, bisa di-revert).
8. **Show Me (Spotlight):** Menyorot elemen formulir di halaman web menggunakan Beacon Spotlight Shadow DOM.
9. **Step-by-Step Focus Mode:** Menampilkan 1 field per layar di Side Panel untuk pengguna yang mudah terdistraksi.
10. **Accessibility HUB:** Pengaturan kenyamanan membaca: ADHD focus reading bar, font OpenDyslexic, kontras tinggi, dan ukuran teks fleksibel.

#### B. Forms Guide
1. **Analyze Form (Web):** Toggle ON/OFF untuk observasi dinamis (MutationObserver). Saat URL/halaman berpindah, sistem otomatis memindai struktur form dan memetakan dengan guide plan aktif tanpa AI (100% diffing lokal).
2. **Analyze PDF Form:** Memindai dokumen PDF formulir yang dibuka di browser (via PDF parser lokal), mengekstrak kolom isian, dan memberikan panduan field-by-field.
3. **Kartu Petunjuk Berjenjang (Walkthrough):**
   - Spotlight ke field formulir dengan 4 elemen kunci: *Meaning, How to Fill, Example Valid Value, Common Pitfalls*.
   - Disertai 3-tier badge dengan *Evidence-Based Confidence Scoring* (🟢 **Official**: diverifikasi instansi / 🔵 **Savvy Curated**: direview tim internal / 🟡 **AI Guidance**: saran AI berbasis bukti DOM, jika bukti <0.6 menampilkan *"Tanyakan ke instansi"*).
   - **Kursor Semu Beranimasi (Animated Virtual Cursor):** Kursor visual lembut yang meluncur di layar memandu pandangan mata pengguna ke kolom berikutnya begitu sinyal selesai (`Tab`, `Enter`, atau `blur`) terdeteksi, tanpa merebut mouse fisik pengguna.
4. **Official Specimen & Template Previewer (Fitur Berkas Unggah):**
   - **Interactive Specimen Modal:** Tombol *"Lihat Contoh Sah (Spesimen)"* pada kolom upload file (`input[type="file"]`) yang memunculkan contoh dummy resmi beranotasi visual (misal contoh pasfoto berlegalisir asli vs fotokopi buram) yang dapat di-zoom.
   - **One-Click Template Download:** Tombol download instan template surat atau dokumen resmi (`.docx` / `.pdf`) agar pengguna tidak perlu membuat format sendiri dari nol.
   - **Side-by-Side Pre-Upload Verification:** Pratinjau berdampingan di Side Panel antara berkas yang dipilih pengguna dengan spesimen resmi sebelum berkas diunggah ke portal.

#### C. Auto Fill
1. **Multiple Vault (Password + 12 Seed):**
   - Mendukung banyak vault independen (misal: Personal, Pasangan, Pekerjaan).
   - Dilindungi **Password** dan **12-Word Seed Phrase (BIP-39)** dengan fitur **Lock & Unlock** instan.
2. **Autofill from Vault & Undo:** Pengisian batch otomatis dengan pemetaan semantic key; tombol **Undo Autofill** mengembalikan nilai semula 100%.
3. **Upload to Vault (Ekstraksi Dokumen ke Data):**
   - Pengguna mengunggah scan KTP / ID Card ke tab AutoFill.
   - Diproses on-device oleh **MobileSAM Q4 + RapidOCR ONNX** (18 MB) tanpa kirim berkas ke server → data (NIK, nama, tgl lahir) langsung masuk ke Vault aktif.
4. **Help Me Write / Magic Pen:**
   - Pill ✨ di pojok textarea. Pengguna mengetik 3 poin bullet kasar → AI menyusun draf narasi formulir resmi (formal/ringkas/elaboratif) tanpa mengarang fakta.

#### D. Form Utility (Quick Link ke formmate.in)
- Tautan cepat di Side Panel ke platform utilitas berkas eksternal (`formmate.in`):
  - **Converter:** JPG to PDF, PDF to JPG, PNG to JPG, JPG to PNG, Docx to PDF, PDF to Docx.
  - **Compressor:** PDF Compressor, PNG Compressor, JPG Compressor.
  - **Resizer:** Photo Resizer (pixel/size based), PDF Resizer (A4, Letter).
  - **Editor:** Remove Background, Signature Fixer.
- *Catatan Kepatuhan:* Membantu konversi ukuran/format berkas tanpa melakukan retouching wajah biometrik (dilarang hukum internasional).

#### E. Form Audit
1. **Traffic Light Auditor:** Evaluasi pre-submit sekali klik (mode aktif membaca isian):
   - 🔴 **Merah:** Field wajib kosong, format melanggar aturan panjang/regex, file melebihi batas KB.
   - 🟡 **Kuning:** Isian ambigu (mis. format tanggal terbalik), format tidak lazim, perlu konfirmasi.
   - 🟢 **Hijau:** Valid dan siap kirim.
2. **Audit Kepatuhan Foto (Tanpa Manipulasi Piksel):** Uji deterministik terhadap file pasfoto (rasio 2x2 / 35x45 mm, ukuran KB, rasio tinggi kepala biometrik, ketajaman/blur Laplacian) tanpa merusak keaslian piksel.
3. **Jump to Drawer:** Drawer ringkasan audit dengan tombol "Perbaiki dengan saran" (Apply Fix) yang langsung menyorot field yang salah.

#### F. Feedback Modal
Kanal pelaporan terintegrasi di Side Panel bagi warga:
1. **Guidance Discrepancy:** Label kolom berubah, field dihapus instansi, atau petunjuk salah.
2. **Translate Issue:** Terjemahan birokrasi keliru atau janggal.
3. **Submission Error:** Portal instansi menolak kiriman karena error validasi yang tidak terduga.

---

### 5.2 Fitur Ekstensi Studio (Official — Savvy Studio)

Khusus digunakan oleh officer/instansi untuk merekam dan menerbitkan panduan formulir resmi:

1. **Form Record Flow:**
   - Input URL formulir, Title, dan Deskripsi alur.
   - Listener pasif merekam urutan interaksi (`click`, `focus`, `change`) dan mengekstrak `role`, `accessible_name`, label, serta `semantic_key`.
2. **Guidance Metadata Editor:**
   - Mengatur metadata resmi: Nama Guidance, Deskripsi (Goal), Instansi, Domain, Jangka Waktu (ETA), Biaya/Fee, dan Catatan Tambahan.
   - Target Citizen filter: Indonesian, Indian, US Citizen, Foreigner.
   - Aturan Upload Berkas: Menentukan batas nama, ukuran file maksimal (KB), dan format yang diterima (Foto, Signature, Passport, ID, Dokumen).
3. **Field-by-Field Inspector:**
   - Menulis petunjuk resmi per kolom: *Meaning & Purpose, How to Fill, Example Entry, Common Mistakes, Notes*.
   - **Penyematan Spesimen & Template Resmi:** Melampirkan tautan contoh berkas sah (`specimen_image_url`), tautan berkas template (`template_url` .docx/.pdf), serta parameter checklist upload eksplisit (`COLOR_REQUIRED`, `MIN_DPI: 300`, `MAX_SIZE_KB: 2048`).
   - Format validation rules: regex, panjang karakter, format tanggal.
4. **Smart Blur:**
   - Secara otomatis menyamarkan nilai contoh yang diketik officer saat merekam menjadi placeholder aman (`{{USER_NIK}}`, `{{USER_NAME}}`).
5. **Simulate Guide Me:**
   - Memutar ulang simulasi panduan di browser officer menggunakan runner FSM yang sama persis dengan ekstensi pengguna sebelum diterbitkan.
6. **Publish & Export:**
   - Menerbitkan panduan ke database Supabase dengan status verified tier 🟢 **Official**.
   - Mengekspor panduan ke format **Markdown** dan **HTML mandiri**.

---

### 5.3 Fitur Frontend (Dashboard & Mock Portal)

1. **Dashboard Web:**
   - **Autentikasi:** Login/Daftar via Supabase Auth (Magic link / Password).
   - **Overview:** Ringkasan aktivitas audit dan kuota pemakaian API.
   - **Riwayat Audit:** Arsip riwayat pengecekan formulir yang pernah dilakukan.
   - **Vault Backup/Sync:** Sinkronisasi amplop terenkripsi (opsional bagi user login) dan ekspor cadangan vault.
   - **Manajemen Panduan (Officer):** Daftar panduan resmi, editor draf, dan fungsi cetak/export.
   - **Pengaturan:** Preferensi bahasa antarmuka dan aksesibilitas.
2. **Mock Portal ("GlobalVisa Demo Portal"):**
   - Dihosting di `frontend/public/mock-portal/` sebagai target pengujian resmi demo hackathon.
   - Terdiri dari 3 tahapan realistis:
     - Tahap 1: Data Pribadi (Nama paspor, NIK, tanggal lahir, jenis kelamin, field dinamis status pernikahan).
     - Tahap 2: Paspor & Perjalanan (Nomor paspor, Affidavit of Support, Purpose of Visit textarea).
     - Tahap 3: Dokumen (Upload pasfoto dan scan identitas).
   - Ditanami kesalahan tersembunyi yang dapat dipicu untuk mendemonstrasikan keunggulan Traffic Light Auditor.

---

## 6. INFRASTRUKTUR & STACK TEKNOLOGI

### 6.1 Ekstensi User (Savvy.AI)
- **Framework & Runtime:** WXT (Vite), Manifest V3, TypeScript strict.
- **UI:** React + Tailwind CSS di dalam Side Panel (`sidepanel.html`), Closed Shadow DOM overlay untuk Beacon Spotlight di halaman portal.
- **Kriptografi Lokal:** WebCrypto API `AES-256-GCM`, `PBKDF2-SHA256` (≥ 600.000 iterasi), BIP-39 mnemonic (12-word seed phrase).
- **Multi-Layer Locator Engine (Hierarki 5-Lapis Tahan UI Drift):**
  1. *Lapis 1 (W3C Semantic A11y Tree):* `role` + `accessible name` (pohon aksesibilitas WCAG).
  2. *Lapis 2 (Stable Attributes):* Atribut native `name`, `type`, `autocomplete`, keterkaitan `for="id"`.
  3. *Lapis 3 (Semantic Section Path):* Hierarki fieldset/seksi formulir (`Seksi Data Pribadi > Alamat Domisili`).
  4. *Lapis 4 (Geometric DOM Relation):* Koordinat kontainer seksi terdekat (`elementFromPoint` + bounding box).
  5. *Lapis 5 (Fuzzy String Matching):* Kesamaan string label lokal (Levenshtein > 85%).
- **Finite State Machine (FSM Runner):** Berjalan deterministik mengelola siklus: `Idle` → `SiteMatched` → `PlanLoaded` → `StepActive` → `Scanning` → `Diffed` → `FieldFocused` → `Explaining` → `StepComplete` → `Finished`.
- **On-Device AI / ML Stack (~19 MB Total):**
  | Komponen | Library / Model | Ukuran | Fungsi |
  |---|---|:---:|---|
  | **Segmentasi** | **MobileSAM Q4 ONNX** | 10 MB | Segmentasi pasfoto di browser klien (0 latensi, 100% privasi) |
  | **OCR Dokumen** | **MobileSAM Q4 + RapidOCR ONNX** | 18 MB *(extra 8 MB)* | Crop & pembacaan data teks scan KTP langsung masuk ke Vault |
  | **Deteksi Suara & Barge-In** | **Silero VAD** | 1 MB | Deteksi hening & barge-in lokal instan untuk sesi Handsfree |
  | **Audio Player** | **HTTP Chunked + Opus Client** | — | Streaming pemutaran suara instan (<300 ms) dari backend |
  *(Catatan: Transkripsi suara STT diproses di Cloud Meta Model API via Muse Voice Transcribe melalui relay backend).*

### 6.2 Ekstensi Studio (Official — Savvy Studio)
- **Framework:** WXT (Vite), Manifest V3, React + Tailwind CSS.
- **Core Engine:** DOM Event Listener pasif, Schema Validator (Zod), Runner FSM lokal dari paket `shared/`.
- **Export Engine:** Template generator Markdown dan HTML murni.

### 6.3 Backend (Penghubung Ekstensi & API URL Utama)
- **Runtime & Hosting:** Node.js (TypeScript) Serverless di Vercel (`/api/*`).
- **Database & Auth:** **Supabase** (PostgreSQL, Auth guest anonymous & email, RLS per tabel, pgvector / FTS untuk juknis).
- **Skema Relasional Database Guidance (Supabase PostgreSQL):**
  - `sites`: Direktori domain portal yang didukung (`id`, `domain`, `name`, `category`).
  - `guide_versions`: Versi panduan per portal (`id`, `site_id`, `version`, `structure_hash`, `status`).
  - `steps`: Tahapan alur formulir (`id`, `guide_version_id`, `step_order`, `title`, `anchor_selector`).
  - `fields`: Kolom formulir (`id`, `step_id`, `field_order`, `signature` hash, `primary_role`, `primary_name`, `fallback_selectors` JSONB, `is_required`).
  - `field_contents`: Konten penjelasan multi-tier & multi-bahasa (`id`, `field_id`, `tier` official/curated/ai, `language`, `meaning`, `how_to_fill`, `example`, `common_pitfalls`, `document_guidance` JSONB [spesimen & template], `confidence_score`, `evidence` JSONB, `confirmation_ref`).
- **Optimasi Token & Single-Flight Request:**
  - *Shared Cache by Field Signature:* Hash normalisasi atribut (`label + role + section`). Penjelasan AI disimpan di server; field identik pada portal yang sama cukup diproses sekali oleh LLM dan langsung dibagikan ke pengguna lain (menghemat 90% panggilan AI).
  - *Mekanisme Single-Flight:* Saat banyak pengguna membuka halaman yang sama bersamaan, Edge Function hanya mengeksekusi 1 pemanggilan LLM untuk satu signature; permintaan lain menunggu promise yang sama.
- **Dedicated LLM & Inference Engine (Baseten & Meta Model API):**
  Semua komputasi model AI di-hosting di **Baseten** dan **Meta Model API** (kredit $100 tahan lama dengan konfigurasi *scale-to-zero* saat idle):
  | No | Tugas | Model | Resource & Biaya |
  |:---:|---|---|:---:|
  | 1 | **Otak Utama (Reasoning & Multimodal)** | **Muse Spark Open** | Baseten GPU A10G ($0.8/jam) |
  | 2 | **Segmentasi Fallback** | **SAM 3.1 open 0.87B** | Baseten GPU A10G ($0.8/jam) |
  | 3 | **STT Utama (Voice-to-Text)** | **Muse Voice Transcribe** | Cloud Meta Model API via relay backend ($3 / 1.000 menit) |
  | 4 | **TTS Streaming** | **Piper TTS Server** | Baseten CPU ($0.05/jam, $0.01/1k req) *(Cadangan: TTS browser)* |
- **Library & Utilitas Backend:**
  - `sharp`: Audit deterministik file pasfoto di memori (dimensi, Laplacian blur, rasio kepala).
  - `zod`: Validasi ketat di semua batas API dan data schema.
  - `jose`: Verifikasi dan penanganan JWT Supabase di setiap request.
  - `shared/scrub`: Penyaring PII lokal sebelum teks diproses LLM.

### 6.4 Frontend (Dashboard & Mock Portal)
- **Framework:** Vite + React + Tailwind CSS + shadcn/ui.
- **Client SDK:** `@supabase/supabase-js` untuk manajemen akun dan sinkronisasi data.
- **Mock Portal:** Halaman HTML/CSS/JS statis murni di `frontend/public/mock-portal/`.

### 6.5 Diagram Alur & Kontrak API

```
 Portal (mock / web / PDF form)
      │  content script (pasif: struktur, focusin)
      ▼
 extension-savvy (User) ◄──► Service Worker ◄──► Side Panel UI
      │ Closed Shadow DOM (Spotlight, Kartu, Badge)
      │ On-Device AI: MobileSAM Q4, RapidOCR, Silero VAD, Opus Client
      │ Multiple Vault (WebCrypto AES-256-GCM + BIP-39)
      ▼ HTTPS + Bearer JWT (Supabase)
 backend API Gateway (Vercel Node/TS)
      ├── modelRouter ──► Baseten & Meta Inference Engine:
      │                   ├── Muse Spark Open (A10G: Explain, Magic Pen, RAG)
      │                   ├── SAM 3.1 open 0.87B (A10G: segmentasi fallback)
      │                   ├── Muse Voice Transcribe (STT audio via Meta Model API)
      │                   └── Piper TTS Server (CPU: streaming audio chunked)
      ├── sharp (audit kepatuhan foto in-memory)
      └── Supabase (Postgres + RLS + Auth + doc_chunks RAG)
```

#### Endpoint Utama:
| Metode & Path | Fungsi | Engine / Model |
|---|---|---|
| `GET /api/guidance?domain=&path=` | Mengambil guide plan aktif (ETag caching) | Supabase DB |
| `POST /api/explain` | Explain This (snip gambar form ter-scrub) | Muse Spark Open (Baseten) |
| `POST /api/chat` (stream) | Tanya jawab juknis RAG streaming | Muse Spark Open (Baseten) |
| `POST /api/write/draft` | Magic Pen (3 bullet → draf formal) | Muse Spark Open (Baseten) |
| `POST /api/voice/tts` (stream) | Streaming TTS audio respons (Opus/chunked) | Piper TTS CPU (Baseten) |
| `POST /api/voice/transcribe` | STT transkripsi suara | Muse Voice Transcribe (Meta Model API) |
| `POST /api/photo/audit` | Audit kepatuhan pasfoto deterministik | `sharp` in-memory |
| `POST /api/studio/guides` · `POST /…/publish` | CRUD & publish panduan resmi officer | Supabase DB |
| `POST /api/feedback` | Pelaporan kendala (guidance, translate, error) | Supabase DB |

---

## 7. Privasi & Keamanan

| Area | Kebijakan & Aturan Teknis |
|---|---|
| **Mode Pasif** | Hanya membaca struktur DOM (`role`, `accessible_name`, atribut). Dilarang membaca `.value` dan tanpa listener ketikan. |
| **Mode Aktif** | Hanya dipicu klik pengguna (Autofill, Pre-Submit Audit, Explain This). |
| **DOM Masking** | Sebelum screenshot diambil untuk Explain This, seluruh field input ditutup kotak hitam secara lokal. |
| **Scrubber Lokal** | NIK 16 digit, nomor paspor, email, dan nomor telepon disaring sebelum teks diteruskan ke AI. |
| **Multiple Vault** | Zero-knowledge di sisi klien; kunci turunan AES-GCM tidak pernah keluar dari memori/session storage browser. |
| **Kepatuhan Foto** | Tidak ada modifikasi/manipulasi digital pada foto biometrik resmi pengguna. |
| **Kerahasiaan Kunci** | API Key Meta, Baseten, dan Service Role Supabase hanya tersimpan di backend Vercel; tidak pernah diekspos ke ekstensi atau frontend. |

---

## 8. Persyaratan Non-Fungsional

| Metrik | Target Kinerja |
|---|---|
| Audit formulir lokal (≤ 50 field) | < 300 ms |
| Latensi audio streaming pertama (TTS) | < 300 ms |
| Chat RAG token pertama | < 2 detik |
| Explain This respons visual (p50) | < 5 detik |
| Spotlight muncul setelah `focusin` | < 100 ms |
| Resolve rate locator di mock portal | ≥ 90% |
| Ukuran bundle model on-device ekstensi | ≤ 20 MB (~19 MB aktual) |
| Aksesibilitas Side Panel | Navigasi keyboard penuh, kontras WCAG AA |

---

## 9. Rencana Demo 3 Menit & Kriteria Penilaian

### 9.1 Demo 3 Menit Spine
1. **0:00–0:25 (Pain):** Tingginya angka penolakan visa/formulir resmi akibat jargon rumit dan kesalahan teknis berkas.
2. **0:25–1:05 (Understand):** Walkthrough spotlight di mock portal, Explain This pada istilah "Affidavit of Support" via Muse Spark Open, tanya panduan via Handsfree Voicebot.
3. **1:05–1:45 (Fill):** Unlock Vault dengan 12 Seed/Password, 1-Click Autofill, Undo seketika, dan demonstrasi Help Me Write (Magic Pen) dari 3 bullet poin.
4. **1:45–2:20 (Audit):** Pre-Submit Traffic Light Auditor menemukan kesalahan format tanggal dan pasfoto blur → diperbaiki langsung via drawer → status berubah hijau.
5. **2:20–2:45 (Behind the Scenes):** Menampilkan arsitektur on-device 19 MB (MobileSAM + RapidOCR + Silero VAD) serta backend Baseten (Muse Spark & Piper TTS).
6. **2:45–3:00 (Closing):** "Starts local, scales global — Built with Muse Code".

### 9.2 Kriteria Penilaian Hackathon
- **Impact (30%):** Menyelesaikan masalah universal birokrasi warga dunia tanpa perlu izin dari pemilik portal web.
- **Use of Meta AI Tooling (25%):** Kombinasi Muse Spark Open, SAM 3.1, Muse Voice, dan dokumentasi keterlibatan Muse Code di `docs/muse-code-log.md`.
- **Technical Depth (20%):** On-device WASM inference 19 MB, Multiple Vault BIP-39, FSM state machine deterministik, audio chunked streaming.
- **Demo Quality (25%):** Mock portal stabil tanpa ketergantungan situs luar saat presentasi juri.

---

## 10. Manajemen Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Batas waktu 10 hari hackathon | Sangat Tinggi | Scope dipangkas ketat; editing foto diganti link utilitas, Studio dipisah, feature freeze hari ke-8. |
| Kuota kredit Baseten $100 | Sedang | Deployment Baseten diatur *scale-to-zero* saat idle; model inference hanya menyala saat testing aktif. |
| Izin mikrofon browser | Sedang | Menyediakan fallback teks chat penuh jika izin mikrofon ditolak oleh pengguna. |
| Variasi struktur portal web | Sedang | Locator berjenjang 3 lapis (role + accessible name, atribut stabil, fuzzy label Levenshtein ≥ 0.85). |
