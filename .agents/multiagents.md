# Spesifikasi & Blueprint: Single-Hit Compound Multi-Agent (Savvy.AI)

> **Arsitektur Multi-Agent Edge-First & Efisiensi Inferensi 1-Hit**  
> Dokumen ini memuat blueprint teknis, prompt template, skema JSON, dan contoh implementasi sistem **Single-Hit Compound Multi-Agent** pada model **Muse Spark Open** untuk 3 fitur killer di ekosistem Savvy.AI:
> 1. **Analyze Form**
> 2. **Traffic Light Auditor**
> 3. **Explain This**

---

## 1. Filosofi & Keunggulan Pola "Single-Hit Compound Multi-Agent"

Banyak implementasi multi-agent konvensional melakukan pemanggilan API berantai secara terpisah (*sequential agent chaining*):
> Agent A panggil LLM (2 dtk) → kirim ke Agent B (2 dtk) → kirim ke Agent C (2 dtk) → total latensi 6–8 detik & kuota token terkuras 3–4x lipat.

Savvy.AI menggunakan pendekatan **Single-Hit Compound Multi-Agent**:
- **1 Kali Hit API ke Muse Spark Open** dengan `response_format={"type": "json_object"}`.
- Muse Spark Open mengeksekusi peran 4 agen spesialis secara paralel dalam satu jendela penalaran (*in-context reasoning*).
- Menghasilkan respon terpadu dalam **< 1,2 detik**, siap dikonsumsi langsung oleh browser dan streaming audio Piper TTS.

---

## 2. Tiga Penerapan Multi-Agent Utama di Savvy.AI

---

### 2.1 Multi-Agent: Analyze Form

Digunakan saat pengguna membuka halaman formulir baru atau menekan tombol **"Analyze Form"** untuk memetakan seluruh struktur form, mendeteksi prasyarat, dan menyiapkan panduan langkah demi langkah.

#### Komposisi 4 Agen Spesialis (1-Hit Muse Spark Open):
1. **Agent A - SECTION & FLOW MAPPER:**  
   Menganalisis pohon DOM formulir dan mengelompokkan field-field ke dalam langkah-langkah logis (*logical steps*, misal: Step 1: Identitas Pribadi, Step 2: Kontak & Domisili, Step 3: Berkas Pendukung).
2. **Agent B - VAULT SEMANTIC KEY MATCHER:**  
   Mencocokkan atribut field (`name`, `id`, `autocomplete`, `label`) dengan kunci taksonomi data Vault pengguna (`user.nik`, `user.fullname`, `user.birth_date`, `passport.number`) untuk mengaktifkan **1-Click Autofill**.
3. **Agent C - PREREQUISITE & ATTACHMENT DETECTOR:**  
   Mendeteksi kolom berkas (`input[type="file"]`), aturan upload (ekstensi file, batas KB), serta mendeteksi ketergantungan kondisional (*dynamic branching*, misal: jika status menikah dipilih, muncul kolom data pasangan).
4. **Agent D - FORM COMPANION SYNTHESIZER:**  
   Menghitung estimasi waktu pengisian (ETA), menyusun daftar berkas yang wajib disiapkan sebelum mulai, dan membuat naskah audio pembuka ramah untuk disuarakan Piper TTS.

#### Prompt Template (`Analyze Form`):
```python
ANALYZE_FORM_SYSTEM_PROMPT = """
Kamu adalah sistem analisis formulir cerdas Edge-first untuk Savvy.AI.
Analisis struktur formulir berikut yang diambil dari DOM halaman:
<form_dom>
{form_dom_json}
</form_dom>

Jalankan 4 agent spesialis secara paralel dalam 1 siklus inferensi:

Agent A - SECTION & FLOW MAPPER:
- Identifikasi langkah formulir logis (1-4 langkah). Tentukan anchor penanda tiap langkah.
Output: { "steps": [{"step_order": 1, "title": "Data Pribadi", "field_count": 5}] }

Agent B - VAULT SEMANTIC KEY MATCHER:
- Cocokkan elemen form dengan kunci data Vault: 'user.nik', 'user.fullname', 'user.birth_date', 'user.email', 'user.phone', 'user.address', 'passport.number'.
Output: { "matched_keys": [{"field_id": "nik_input", "vault_key": "user.nik", "confidence": 0.98}] }

Agent C - PREREQUISITE & ATTACHMENT DETECTOR:
- Deteksi semua kolom berkas dan batasan teknis (max KB, format diperbolehkan).
Output: { "attachments_required": [{"label": "Scan KTP", "max_kb": 2048, "allowed": ["pdf","jpg"]}], "has_dynamic_fields": true }

Agent D - FORM COMPANION SYNTHESIZER:
- Rangkum total estimasi waktu pengisian (ETA dalam menit).
- final_summary: Ringkasan singkat untuk tampilan Side Panel.
- final_audio_text: Ucapan sambutan pembuka untuk disuarakan Piper TTS tanpa karakter markdown/simbol.

FINAL OUTPUT WAJIB JSON VALID:
{
  "A": { "steps": [...] },
  "B": { "matched_keys": [...] },
  "C": { "attachments_required": [...], "has_dynamic_fields": boolean },
  "final_summary": "Formulir beasiswa ini terdiri dari 3 tahapan. Estimasi pengisian 8 menit.",
  "final_audio_text": "Halo, formulir beasiswa ini memiliki 3 tahapan. Siapkan scan KTP dan transkrip nilai sebelum mulai."
}
"""
```

---

### 2.2 Multi-Agent: Traffic Light Auditor

Digunakan pada fase **Pre-Submit Audit** saat pengguna selesai mengisi formulir dan bersiap menekan tombol *Submit*, untuk mencegah diskualifikasi akibat salah format atau kelalaian fatal.

#### Komposisi 4 Agen Spesialis (1-Hit Muse Spark Open):
1. **Agent A - SYNTAX & REGEX VALIDATOR (Format Engine):**  
   Memeriksa kepatuhan teknis nilai isian: NIK wajib tepat 16 digit angka numerik murni, validitas format email (RFC 5322), dan pola nomor registrasi resmi.
2. **Agent B - CROSS-FIELD & REGULATORY CONSISTENCY CHECKER:**  
   Mendeteksi kontradiksi logika antar-kolom (misal: tanggal kadaluarsa paspor lebih awal dari tanggal penerbitan; gelar akademis seperti "Dr." atau "S.Kom" yang dilarang tertulis di kolom nama paspor).
3. **Agent C - DOCUMENT & PHOTO COMPLIANCE INSPECTOR:**  
   Memverifikasi kepatuhan berkas yang di-attach: dimensi pasfoto memenuhi standar regulasi (2x2 / 35x45 mm), rasio kepala biometrik, ketajaman foto, serta batas ukuran file.
4. **Agent D - TRAFFIC LIGHT SYNTHESIZER:**  
   Menetapkan status lampu keseluruhan:
   - 🔴 **RED (Critical):** Ada field wajib kosong, NIK tidak valid, atau gelar masuk ke paspor (pasti gugur).
   - 🟡 **YELLOW (Warning):** Format tanggal ambigu (DD/MM vs MM/DD) atau file mendekati batas maksimum.
   - 🟢 **GREEN (Ready):** Formulir sah, lengkap, dan siap kirim.
   Menyusun daftar aksi perbaikan instan (*remedy list*) dan naskah audio evaluasi ringkas untuk Piper TTS.

#### Prompt Template (`Traffic Light Auditor`):
```python
TRAFFIC_LIGHT_SYSTEM_PROMPT = """
Kamu adalah auditor pre-submission formulir birokrasi ketat untuk Savvy.AI.
Evaluasi data formulir yang telah terisi (telah disanitasi dari PII rahasia):
<form_submission_data>
{submission_data_json}
</form_submission_data>

Jalankan 4 agent auditor secara paralel dalam 1 siklus inferensi:

Agent A - SYNTAX & REGEX VALIDATOR:
- Uji validitas format numerik (NIK 16 digit, format tanggal DD/MM/YYYY, nomor HP).
Output: { "syntax_errors": [{"field": "nik", "error": "NIK hanya 15 digit"}] }

Agent B - CROSS-FIELD & REGULATORY CONSISTENCY CHECKER:
- Periksa kontradiksi: apakah ada gelar akademik tertulis di nama paspor? Apakah tanggal keberangkatan mendahului tanggal pengajuan?
Output: { "conflict_warnings": [{"field": "passport_name", "warning": "Terdeteksi gelar 'S.T.' di nama paspor (dilarang ICAO)"}] }

Agent C - DOCUMENT & PHOTO COMPLIANCE INSPECTOR:
- Evaluasi metadata berkas dan hasil audit foto (rasio kepala, blur Laplacian, ukuran file).
Output: { "document_issues": [{"file_field": "pasfoto", "issue": "Resolusi memenuhi syarat, ukuran pas 180 KB"}] }

Agent D - TRAFFIC LIGHT SYNTHESIZER:
- Tentukan status lampu keseluruhan: "RED", "YELLOW", atau "GREEN".
- remedies: Daftar solusi konkret yang bisa diklik pengguna untuk langsung memperbaiki field.
- final_summary: Ringkasan hasil audit untuk Side Panel Drawer.
- final_audio_text: Laporan audit suara ramah untuk dibacakan oleh Piper TTS Voicebot.

FINAL OUTPUT WAJIB JSON VALID:
{
  "A": { "syntax_errors": [...] },
  "B": { "conflict_warnings": [...] },
  "C": { "document_issues": [...] },
  "status": "RED",
  "remedies": [
    { "field_selector": "#passport_name", "suggested_value": "Ahmad Fauzi", "reason": "Hapus gelar akademik" }
  ],
  "final_summary": "Ditemukan 1 kesalahan fatal: hapus gelar pada kolom nama paspor sebelum submit.",
  "final_audio_text": "Perhatian, kami menemukan gelar akademik pada kolom nama paspor. Harap hapus gelar sebelum menekan submit."
}
"""
```

---

### 2.3 Multi-Agent: Explain This

Digunakan saat pengguna bingung dengan suatu kolom formulir, mengklik tombol *"Jelaskan Ini"*, atau menyeleksi snip area layar (dengan penutupan otomatis DOM masking PII).

#### Komposisi 4 Agen Spesialis (1-Hit Muse Spark Open):
1. **Agent A - LEGAL & REGULATORY GROUNDING AGENT:**  
   Menafsirkan istilah hukum/birokrasi sulit (*Affidavit of Support*, *Apostille*, *Nomor SK Penugasan*, *Akreditasi BAN-PT*) berdasarkan juknis resmi atau konteks regulasi terkait.
2. **Agent B - JARGON BUSTER & PLAIN LANGUAGE SPECIALIST (ELI5):**  
   Menerjemahkan bahasa hukum yang kaku menjadi penjelasan sederhana yang mudah dipahami warga awam dan lansia dalam bahasa ibu mereka.
3. **Agent C - PRACTICAL ACTION & SPECIMEN ADVISOR:**  
   Memberikan contoh isian nyata yang sah (*Valid Entry Example*) dan panduan dokumen fisik yang harus dicari (*"Lihat surat berstempel basah dari kelurahan"*).
4. **Agent D - DUAL EXPLAIN SYNTHESIZER:**  
   Merangkum menjadi kartu visual interaktif (*Meaning, How to Fill, Example, Common Pitfalls*) dengan honest badge, serta naskah audio singkat yang ramah didengar untuk Piper TTS.

#### Prompt Template (`Explain This`):
```python
EXPLAIN_THIS_SYSTEM_PROMPT = """
Kamu adalah pendamping birokrasi ramah warga untuk fitur Explain This di Savvy.AI.
Jelaskan elemen formulir berikut:
<field_context>
Label: {field_label}
Placeholder / Hint: {field_hint}
Konteks Seksi: {section_title}
Potongan Juknis Resmi (jika ada): {official_guidance_chunk}
</field_context>

Jalankan 4 agent secara paralel dalam 1 siklus inferensi:

Agent A - LEGAL & REGULATORY GROUNDING:
- Apa dasar hukum / tujuan birokrasi dari kolom ini? Ambil pasal/juknis jika tersedia.
Output: { "legal_purpose": "...", "citation": "Juknis LPDP Bab IV Hal 18" }

Agent B - JARGON BUSTER (Bahasa Awam):
- Rangkum maksud kolom ini dengan kalimat sederhana tanpa istilah birokrasi berbelit.
Output: { "simple_meaning": "Ini adalah surat izin dari atasan tempat Anda bekerja." }

Agent C - PRACTICAL ACTION & SPECIMEN ADVISOR:
- Berikan langkah konkret: dokumen fisik mana yang harus diambil, format yang benar, dan contoh nyata.
Output: { "how_to_fill": "Ketik nomor lengkap di pojok kanan atas surat", "example_entry": "800/123/BKD/2026", "pitfall": "Jangan gunakan SK kenaikan gaji" }

Agent D - DUAL EXPLAIN SYNTHESIZER:
- badge_tier: "OFFICIAL" (jika ada sitasi), "CURATED" (jika review tim), atau "AI_GUIDANCE".
- final_answer: Markdown rapi untuk kartu popover di Side Panel.
- final_audio_text: Penjelasan lisan santun (1-2 kalimat) untuk dibacakan oleh Piper TTS Voicebot.

FINAL OUTPUT WAJIB JSON VALID:
{
  "A": { "legal_purpose": "...", "citation": "..." },
  "B": { "simple_meaning": "..." },
  "C": { "how_to_fill": "...", "example_entry": "...", "pitfall": "..." },
  "badge_tier": "OFFICIAL",
  "final_answer": "**Surat Izin Atasan**: Masukkan nomor SK izin belajar resmi dari pimpinan kantor Anda. Contoh: `800/123/BKD/2026`.\n\n*Catatan: Bukan SK kenaikan pangkat berkala.*",
  "final_audio_text": "Kolom ini meminta nomor surat izin belajar dari atasan kantor Anda. Masukkan nomor di sudut kanan atas surat, bukan SK kenaikan pangkat."
}
"""
```

---

## 3. Implementasi Pemanggilan & Konsumsi di Ekstensi

### 3.1 Backend Router (`backend/src/ai/agentDispatcher.ts`)

```typescript
import { OpenAI } from "openai";

const basetenClient = new OpenAI({
  baseURL: process.env.BASETEN_MUSE_SPARK_URL,
  apiKey: process.env.BASETEN_API_KEY,
});

export type MultiAgentTask = "ANALYZE_FORM" | "TRAFFIC_LIGHT_AUDIT" | "EXPLAIN_THIS";

export async function dispatchMultiAgent(task: MultiAgentTask, contextData: Record<string, unknown>) {
  let systemPrompt = "";

  switch (task) {
    case "ANALYZE_FORM":
      systemPrompt = ANALYZE_FORM_SYSTEM_PROMPT.replace("{form_dom_json}", JSON.stringify(contextData));
      break;
    case "TRAFFIC_LIGHT_AUDIT":
      systemPrompt = TRAFFIC_LIGHT_SYSTEM_PROMPT.replace("{submission_data_json}", JSON.stringify(contextData));
      break;
    case "EXPLAIN_THIS":
      systemPrompt = EXPLAIN_THIS_SYSTEM_PROMPT
        .replace("{field_label}", String(contextData.label))
        .replace("{field_hint}", String(contextData.hint || ""))
        .replace("{section_title}", String(contextData.section || ""))
        .replace("{official_guidance_chunk}", String(contextData.chunk || "-"));
      break;
  }

  // 1 HIT SAJA KE MUSE SPARK OPEN
  const response = await basetenClient.chat.completions.create({
    model: "muse-spark-open",
    messages: [{ role: "user", content: systemPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.2, // Rendah untuk kepatuhan deterministik
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
```

---

### 3.2 Konsumsi di Browser Extension (`extension-savvy/src/services/agentConsumer.ts`)

```typescript
// extension-savvy/src/services/agentConsumer.ts

export async function handleMultiAgentExecution(task: "ANALYZE_FORM" | "TRAFFIC_LIGHT_AUDIT" | "EXPLAIN_THIS", payload: unknown) {
  const result = await chrome.runtime.sendMessage({
    type: "API_DISPATCH_MULTIAGENT",
    task,
    payload,
  });

  // 1. Audio Pipe: Selalu periksa dan mainkan audio jika tersedia
  if (result.final_audio_text) {
    streamPiperAudio(result.final_audio_text);
  }

  // 2. Dispatch UI Aksi spesifik berdasarkan tugas:
  switch (task) {
    case "ANALYZE_FORM":
      // Siapkan navigasi form, badge autofill, dan daftar berkas
      renderFormSteps(result.A.steps);
      bindVaultAutofillIndicators(result.B.matched_keys);
      showPrerequisiteModal(result.C.attachments_required);
      break;

    case "TRAFFIC_LIGHT_AUDIT":
      // Tampilkan drawer lampu lalu lintas dengan tombol Apply Fix
      renderTrafficLightDrawer({
        status: result.status, // "RED" | "YELLOW" | "GREEN"
        remedies: result.remedies,
        summary: result.final_summary,
      });
      break;

    case "EXPLAIN_THIS":
      // Tampilkan kartu popover petunjuk resmi di sebelah elemen
      renderGuidanceCard({
        badge: result.badge_tier,
        markdownContent: result.final_answer,
        example: result.C.example_entry,
        pitfall: result.C.pitfall,
      });
      break;
  }
}
```

---

## 4. Alur Integrasi End-to-End dengan Piper TTS & Silero VAD

```
[User Trigger: Klik / Suara / Pre-Submit]
                 │
                 ├──► Silero VAD: Deteksi jeda hening (cut audio jika mic)
                 ├──► Scrubber PII Lokal: DOM Masking & Regex sanitasi
                 │
                 ▼
  [1 HIT ke Backend API Relay: dispatchMultiAgent()]
                 │
                 ▼
      [Muse Spark Open (Baseten A10G)]
      ┌──────────────────────────────────────────────┐
      │ Parallel Compound Reasoning:                 │
      │ • Agent A: Analisis Struktur / Format        │
      │ • Agent B: Logika Semantik / A11y / Jargon   │
      │ • Agent C: Kepatuhan Berkas / Red-Flags      │
      │ • Agent D: Dual Synthesizer                  │
      └──────────────────────┬───────────────────────┘
                             │
                             ▼ Single Structured JSON Output
              ┌──────────────┴──────────────┐
              ▼                             ▼
    [data.final_audio_text]         [data.final_answer + A, B, C]
              │                             │
              ▼                             ▼
     [Piper TTS Server]             [Side Panel & Overlay UI]
   (Streaming chunked audio)       • Kartu panduan visual
              │                    • Lampu Merah/Kuning/Hijau
              ▼                    • Tombol 1-Click Apply Fix
      [Speaker Warga]              • Langkah navigasi form
```

---

## 5. Ringkasan Manfaat Teknis untuk Penilaian Hackathon

1. **Memenuhi Kriteria Use of Meta AI Tooling (25%):**  
   Mengeksploitasi kapabilitas reasoning multimodal dan output terstruktur JSON dari model unggulan Meta **Muse Spark Open**.
2. **Memenuhi Kriteria Technical Depth & Execution (20%):**  
   Arsitektur *Single-Hit Compound Multi-Agent* mendemonstrasikan keahlian *engineering* tingkat tinggi: memadukan validasi regulasi, aksesibilitas birokrasi, deteksi red-flag, dan dual-mode synthesis (suara + visual) dalam satu siklus inferensi yang sangat hemat biaya.
3. **Optimasi Biaya Nyata (Zero Wasted Tokens):**  
   Menghindari overhead 3–4x panggilan jaringan bolak-balik, menjaga kredit $100 Baseten bertahan sepanjang hackathon dengan latensi sub-1.5 detik.
