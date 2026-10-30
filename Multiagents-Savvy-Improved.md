# Savvy.AI: Arsitektur Compound Multi-Agent System (CMAS) - "Analyze This Form"

Dokumen arsitektur dan spesifikasi teknis penerapan sistem multi-agen (*3-Agent Pipeline*) pada fitur **Analyze This Form** di **Savvy.AI**, memanfaatkan kapabilitas penuh ekosistem **Meta Muse Spark Open** (`meta-models/muse-spark-open-1026`) via Baseten Inference API.

---

## 1. Latar Belakang & Konsep Utama

Saat pengguna membuka halaman formulir birokrasi, beasiswa, atau perizinan (seperti LPDP, CPNS, Paspor, Visa, Pajak), ekstensi browser konvensional umumnya hanya membaca pohon teks DOM. Pendekatan ini memiliki kelemahan mendasar:
- Kehilangan **konteks visual** (banner pengumuman penting, indikator status, deadline darurat berupa grafis/canvas, badge merah).
- Rentan halusinasi regulasi karena tidak memiliki **search grounding** ke aturan resmi pemerintah terbaru.
- Mengandalkan prompt tunggal (*monolithic prompt*) yang membebani model untuk memahami visual, mencari aturan, dan menyusun panduan sekaligus.

### Solusi: Triad Input + 3-Agent Collaborative Chain
Saat pengguna menekan tombol **"Analyze This Form"**, ekstensi Savvy mengirimkan 3 data input terintegrasi ke backend:
1. **DOM Terstruktur**: Struktur form, nama kolom, id, jenis input, placeholder, dan status *required* (tanpa menyertakan isi `.value` pengguna demi privasi).
2. **Metadata Halaman**: URL, domain instansi, `document.title`, `meta[name="description"]`, `meta[name="keywords"]`.
3. **Screenshot Aktif**: Tangkapan layar visual halaman aktif (`captureVisibleTab`) yang dikompresi menjadi WebP/JPEG.

Di backend, sistem orkestrasi menjalankan **3 Agen Spesialis** yang bekerja secara berantai (*prompt chaining* & *tool calling*):

```
                        ┌────────────────────────────────────────────────────────┐
                        │             CHROME EXTENSION (SIDEPANEL)               │
                        └──────────────────────────┬─────────────────────────────┘
                                                   │
                         POST /api/form/analyze    │  1. DOM Terstruktur
                         (Single Request)          │  2. Metadata Halaman
                                                   │  3. Screenshot Aktif (WebP)
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND GATEWAY & MULTI-AGENT ORCHESTRATOR                      │
│                                                                                        │
│  ┌───────────────────────┐   Identitas Form   ┌───────────────────────┐                │
│  │ AGEN 1: PERCEPTION    │ ─────────────────► │ AGEN 2: REGULATION    │                │
│  │ Multimodal Vision     │                    │ Native Tool Calling   │                │
│  │ Profiler Form         │                    │ (web_search / juknis) │                │
│  └───────────────────────┘                    └──────────┬────────────┘                │
│              │                                           │                             │
│              │ Hasil Analisis Visual                     │ Dokumen & Aturan Resmi      │
│              └─────────────────────┬─────────────────────┘                             │
│                                    ▼                                                   │
│                       ┌─────────────────────────┐                                      │
│                       │ AGEN 3: DECISION        │                                      │
│                       │ Chaining & Synthesis    │                                      │
│                       │ reasoning_effort: high  │                                      │
│                       └────────────┬────────────┘                                      │
│                                    │                                                   │
│                                    ▼ Roadmap, Field Rules, & Trap Checklist            │
└────────────────────────────────────┼───────────────────────────────────────────────────┘
                                     │
                                     │ Stream Telemetry (SSE) & JSON Response
                                     ▼
                        ┌────────────────────────────────────────────────────────┐
                        │             SAVVY SIDEPANEL & FORMS GUIDE              │
                        └────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Peran & Spesifikasi Masing-Masing Agen

### 👁️ Agen 1: Perception & Form Profiler (Multimodal Vision)
- **Fokus Tugas**: Memahami formulir apa yang sedang dibuka, siapa penyelenggaranya, apa tujuan akhir pendaftaran, dan apa prasyarat dokumennya.
- **Input**:
  - `screenshotBase64`: Tangkapan visual layar aktif.
  - `pageMetadata`: URL, title, description, keywords.
  - `domSummary`: Daftar field ringkas (ID, label, type).
- **Konfigurasi Model**:
  - Model: `meta-models/muse-spark-open-1026`
  - Parameter: `reasoning_effort: "medium"` (32 token nalar).
  - Endpoint: Baseten OpenAI-compatible Chat Completions dengan payload `image_url`.
- **Keluaran (Output)**:
  - `formName`: Identifikasi nama resmi (misal: "Pendaftaran Beasiswa Magister LPDP Tahap 1 2026").
  - `institution`: Instansi penyelenggara (misal: "LPDP - Kementerian Keuangan RI").
  - `targetOutcome`: Hasil akhir pengajuan (misal: "Penerbitan Bukti Registrasi & Nomor Peserta Tes").
  - `category`: Kategori form (Beasiswa, Visa/Paspor, Pajak, Rekrutmen BUMN/CPNS, dll).
  - `prerequisites`: Daftar berkas yang wajib disiapkan sebelum mengisi.

---

### 🌐 Agen 2: Regulation & Grounding Researcher (Meta AI Native Tooling)
- **Fokus Tugas**: Melakukan pencarian mandiri (*search grounding*) untuk mengambil petunjuk teknis (Juknis) resmi, jadwal tenggat waktu (deadline), dan peraturan birokrasi terbaru tahun berjalan.
- **Pemanfaatan Tooling Meta AI**:
  - **`web_search`**: Native search grounding untuk menemukan portal resmi pemerintah (`.go.id`, `.ac.id`, portal instansi).
  - **`file_search`** (RAG Vector Store): Mengambil pasal/ketentuan dari berkas PDF juknis resmi yang telah diindeks di backend.
- **Aturan Emas Privasi (Zero PII)**:
  - Query pencarian hanya dibangun dari: `formName`, `institution`, dan kata kunci regulasi (contoh: *"juknis pendaftaran beasiswa lpdp 2026 pdf syarat batas usia"*).
  - **Dilarang keras** memasukkan data pribadi atau nilai isian pengguna ke dalam query pencarian web.
- **Konfigurasi Model**:
  - Model: `meta-models/muse-spark-open-1026`
  - `tools`: `[{ type: "web_search" }]` (OpenAI-compatible tool call).
  - `reasoning_effort`: `"medium"` (32 token nalar per putaran loop).
- **Keluaran (Output)**:
  - `officialSource`: Tautan referensi resmi beserta badge verifikasi (`isOfficial: true`).
  - `deadlines`: Batas waktu pengisian atau tanggal penutupan pendaftaran.
  - `criticalRules`: Aturan krusial (misal: "Format esai maksimal 1500 kata", "Surat rekomendasi bertanggal maksimal 30 hari").
  - `disqualificationTraps`: Jebakan umum penyebab gugur berkas administrasi.

---

### 🧠 Agen 3: Decision, Synthesis & Chaining (High Reasoning Effort)
- **Fokus Tugas**: Menggabungkan (*prompt chaining*) hasil visual Agen 1 dan aturan resmi Agen 2, lalu memetakan langsung ke struktur DOM riil halaman untuk membentuk **Field-by-Field Blueprint** dan **Trap Warning List**.
- **Pemanfaatan Meta AI Parameters**:
  - Parameter: `reasoning_effort: "high"` (256 token nalar) atau `Reasoning strength: 256` di awal pesan instruksi nalar.
  - Model melakukan audit mendalam:
    1. *Field Matching*: Menautkan setiap `fieldId` di DOM dengan aturan juknis spesifik.
    2. *Validation Strategy*: Merumuskan rekomendasi regex, batas karakter, dan format dokumen.
    3. *Priority Ordering*: Menyusun alur pengisian dari yang paling mudah hingga yang membutuhkan esai panjang.
- **Keluaran (Output)**:
  - `roadmap`: Ringkasan tahap pengisian formulir.
  - `fieldRulesMap`: Panduan kontekstual per kolom untuk tab **Forms Guide**.
  - `trapsChecklist`: Peringatan bahaya sebelum tombol submit ditekan.

---

## 3. Kontrak Payload Data

### A. Request Payload dari Ekstensi (`POST /api/form/analyze`)
```json
{
  "meta": {
    "url": "https://beasiswalpdp.kemenkeu.go.id/pendaftaran",
    "domain": "beasiswalpdp.kemenkeu.go.id",
    "title": "Portal Pendaftaran Beasiswa LPDP - Kementerian Keuangan",
    "description": "Pendaftaran Beasiswa Pendidikan Indonesia Tahun Anggaran 2026",
    "keywords": ["lpdp", "beasiswa", "magister", "kemenkeu"]
  },
  "dom": {
    "fieldCount": 18,
    "fields": [
      { "id": "nik", "name": "nik", "type": "text", "label": "Nomor Induk Kependudukan (NIK)", "required": true },
      { "id": "program_studi", "name": "prodi", "type": "select", "label": "Pilihan Program Studi", "required": true },
      { "id": "essay_kontribusi", "name": "essay", "type": "textarea", "label": "Komitmen Kembali ke Indonesia", "required": true }
    ]
  },
  "screenshotBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "options": {
    "language": "id",
    "streamTelemetry": true
  }
}
```

### B. Response Lengkap dari Backend
```json
{
  "success": true,
  "analysis": {
    "formId": "lpdp_magister_2026",
    "formTitle": "Pendaftaran Beasiswa LPDP Tahap 1 (2026)",
    "institution": "Lembaga Pengelola Dana Pendidikan (Kemenkeu RI)",
    "targetOutcome": "Penerbitan Bukti Registrasi & Kartu Peserta Seleksi",
    "difficultyLevel": "Tinggi (18 Kolom, 3 Berkas Wajib, 1 Esai)",
    "estimatedTime": "25 - 35 Menit",
    "officialSource": {
      "url": "https://lpdp.kemenkeu.go.id/juknis-2026.pdf",
      "badge": "Official .go.id"
    },
    "prerequisites": [
      "KTP Asli / e-KTP",
      "LoA Unconditional atau Ijazah & Transkrip Asli",
      "Sertifikat TOEFL ITP / IELTS yang masih aktif"
    ],
    "traps": [
      "Esai melebihi 1.500 kata akan otomatis terpotong oleh sistem portal.",
      "Ukuran file KTP tidak boleh melebihi 500 KB dalam format .JPG (bukan PDF)."
    ],
    "fieldsGuide": [
      {
        "fieldId": "nik",
        "action": "Pastikan 16 digit sesuai Dukcapil tanpa tanda spasi/strip.",
        "vaultKey": "personal.nik"
      },
      {
        "fieldId": "essay_kontribusi",
        "action": "Gunakan format STAR (Situation, Task, Action, Result).",
        "vaultKey": null
      }
    ]
  },
  "agentTrace": [
    { "agent": "Agen 1 (Perception)", "status": "Identified form as LPDP 2026", "durationMs": 420 },
    { "agent": "Agen 2 (Tooling)", "status": "Web search: Juknis resmi LPDP 2026", "durationMs": 850 },
    { "agent": "Agen 3 (Reasoning)", "status": "Reasoning chain completed (256 tokens)", "durationMs": 1100 }
  ]
}
```

---

## 4. Tantangan Rekayasa & Strategi Mitigasi

| Tantangan Teknis | Risiko Potensial | Solusi & Mitigasi Arsitektur |
|---|---|---|
| **Latensi Waktu Tunggu** | Menjalankan 3 LLM calls + Web Search secara berurutan berpotensi memakan waktu 4 - 7 detik. | 1. **Live Stream Telemetry (SSE)**: Ekstensi menerima update instan per agen dan menampilkan progres live.<br>2. **Tier-1/2 Caching**: Hasil analisis di-cache di Supabase (`coach_cache`) berdasarkan hash `SHA256(domain + formTitle)`. Analisis ulang form yang sama langsung *hit* dalam <600ms. |
| **Ukuran Payload Gambar** | Screenshot layar retina/1080p mentah mencapai 2 MB - 4 MB. | Kompresi di sisi browser (`background.ts` / canvas) menjadi **JPEG kualitas 0.7 dengan lebar maksimal 1280px** (ukuran berkurang drastis menjadi **150 KB - 250 KB**). |
| **Privasi Pengguna (Zero PII)** | Pengguna mungkin telah mengisi sebagian data sebelum menekan tombol analisis. | Content script hanya mengekstrak metadata tag DOM (`id`, `name`, `type`, `placeholder`). Nilai `.value` **tidak pernah dimasukkan** ke dalam payload analitik. |
| **Kegagalan Tooling Web Search** | Downtime portal internet atau timeout pencarian. | **Graceful Fallback**: Jika Agen 2 gagal atau timeout (>3 detik), pipeline langsung lanjut ke Agen 3 dengan mode *Heuristic Guidance* (badge berubah dari *Official* menjadi *AI Guidance*). |

---

## 5. Dampak ke Pengalaman Pengguna (Sidepanel UX)

1. Pengguna membuka portal formulir dan menekan tombol **"Analyze This Form"**.
2. **Indikator Progres Multi-Agen** tampil langsung di antarmuka ekstensi dan console DevTools (`agentLogger`):
   - `👁️ [Agen 1: Perception] Memindai DOM & tangkapan visual halaman...`
   - `🌐 [Agen 2: Tooling] Menelusuri regulasi & juknis resmi di domain portal...`
   - `🧠 [Agen 3: Reasoning] Menyusun roadmap pengisian & audit potensi jebakan...`
3. Setelah selesai (3 - 4 detik):
   - **Form Overview Card**: Menampilkan identitas form, tingkat kesulitan, estimasi waktu, prasyarat berkas, dan peringatan jebakan (*traps*).
   - **Dua Tombol Aksi Utama**:
     - **Guide Field by Field**: Membuka panduan langkah demi langkah yang terhubung ke *spotlight beacon* di halaman web.
     - **1-Click Auto Fill**: Memetakan data dari Multi-Vault AES-256 lokal ke kolom-kolom yang telah diidentifikasi.

---


## 6. Tuning Spesifik untuk Meta Muse Spark Open (meta-models/muse-spark-open-1026)

### 6.1 Model Capability Mapping
Muse Spark Open di Baseten adalah OpenAI-compatible Chat Completions:
- Input: messages dengan image_url base64 WebP seperti di playground/10-multimodal-vision.js
- Tool Calling: tools [{type: function, function: {name: web_search}}] - model return tool_calls, wajib handle loop seperti playground/09-native-tool-calling.js
- Reasoning Effort: diimplementasikan via system prompt reasoning_effort low(8), medium(32), high(256), xhigh(512) - lihat playground/08-reasoning-effort.js
- Cost: Image token ~85 token per 512px tile. Crop via DOM rect = hemat 70 persen token.

### 6.2 Prompt Final Production-Ready

Agent 1 System Prompt:
You are Agent 1: Perception and Form Profiler for Savvy.AI. You are Meta Muse Spark Open with vision.
RULES:
1. Identify formName ONLY from visible text in screenshot or meta.title. If not visible, return Unknown Form.
2. DO NOT hallucinate institution. If logo not visible, institution = domain.
3. NEVER include user .value in output.
4. Output MUST be valid JSON schema: {formName, institution, targetOutcome, category, prerequisites[], difficultyLevel, estimatedTime}
reasoning_effort: medium (32)

Agent 2 System Prompt:
You are Agent 2: Regulation Researcher. Tool: web_search
CRITICAL PRIVACY: NEVER include PII (nik, email, name) in web_search query. Query = formName + institution + year + juknis + site:.go.id
If no .go.id result, return isOfficial false, fallback to AI Guidance.
reasoning_effort: medium (32)

Agent 3 System Prompt:
You are Agent 3: Decision and Synthesis - High Reasoning.
Input: Agent1 JSON + Agent2 JSON + DOM fields
TASK: Field Matching, Validation Strategy, Priority Ordering, Trap Detection
RULES:
- fieldId in output MUST exactly match DOM input, do not invent.
- Add confidenceScore 0-1 per field.
- reasoning_effort DYNAMIC: if fieldCount <8 low(32) else if has officialSource high(256) else medium(32)
Output JSON: {roadmap, fieldRulesMap: [{fieldId, action, vaultKey, confidenceScore, validation}], trapsChecklist[]}

### 6.3 Optimasi Kritis

Screenshot Crop - JANGAN pakai SAM untuk form:
- SAM 3.1 latency 300-600ms, overkill. Pakai DOM getBoundingClientRect() + 200px margin, latency <5ms, gratis.
- Crop di canvas content script, WebP 0.7 max 1280px, dari 200KB jadi 60KB.
- SAM 3.1 baru dipakai untuk Snip Explain jurnal/chart.

Cache Key Fix:
- Lama: SHA256(domain + formTitle) rawan miss
- Baru: SHA256(domain + sorted_field_ids + fieldCount) stabil, TTL 24 jam, hit <600ms

PII Guard Tambahan:
- Content script hanya scan atribut - SUDAH BENAR.
- Tambah backend filter regex strip 16 digit NIK dan email sebelum kirim ke LLM.

### 6.4 Agentic Loop Telemetry

SSE seperti di examples/agentic-loop-guide.md:
- event: agent_log data: {agent: A1, msg: ...}
- Tampilkan di sidepanel + DevTools via agentLogger. Ini bukti agentic loop untuk juri.

### 6.5 Judging Alignment

- Impact 30 persen: Tunjukkan banner deadline visual yang hanya bisa ditangkap screenshot, bukan DOM.
- Use of Meta Tooling 25 persen: Sebut eksplisit di video We use Muse Spark Open vision + web_search tool + tunable reasoning_effort
- Demo 25 persen: Cache hit <600ms bikin demo instant
- Technical Depth 20 persen: Zero PII + AES-256 Vault + Graceful Fallback

## 7. Referensi Implementasi Terkait


- [playground/09-native-tool-calling.js](file:///d:/webdev/laragon/www/savvy/playground/09-native-tool-calling.js): Pola pemanggilan tool native OpenAI-compatible di Muse Spark Open.
- [playground/05-web-search.js](file:///d:/webdev/laragon/www/savvy/playground/05-web-search.js): Pola grounding pencarian regulasi resmi pemerintah.
- [playground/08-reasoning-effort.js](file:///d:/webdev/laragon/www/savvy/playground/08-reasoning-effort.js): Matriks tuning token penalaran `low (8)`, `medium (32)`, `high (256)`, `xhigh (512)`.
- [playground/10-multimodal-vision.js](file:///d:/webdev/laragon/www/savvy/playground/10-multimodal-vision.js): Standar input pengiriman gambar base64 ke Baseten API.
- [examples/agentic-loop-guide.md](file:///d:/webdev/laragon/www/savvy/examples/agentic-loop-guide.md): Panduan looping agent, verifier, dan penanganan timeout/trace.
- [.agents/spark_web_search_tool.md](file:///d:/webdev/laragon/www/savvy/.agents/spark_web_search_tool.md): Dokumentasi spesifikasi web search tool & manual researcher.
