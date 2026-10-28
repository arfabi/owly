# Savvy.AI — Companion & Co-Pilot Formulir Publik

> **"Pahami. Isi. Periksa. Sebelum Anda menekan Submit."**  
> Ekstensi browser cerdas (Manifest V3) berbasis Compound Multi-Agent System untuk pendaftar formulir publik, visa, beasiswa, dan perizinan.  
> Dibangun untuk **Meta Global AI Developer Hackathon 2026** (Track: *Indie Developer* · Tema: *Build for Your World*).

---

## 📚 Dokumentasi Spesifikasi & Arsitektur (`.agents/`)

Seluruh rancangan produk, arsitektur sistem, dan panduan teknis terpusat di dalam direktori [`.agents/`](file:///d:/webdev/laragon/www/savvy/.agents/):

| Dokumen | Deskripsi & Fokus Utama |
|---|---|
| [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) | **Product Requirements Document (SSOT):** 3 Pilar Solusi (*Understand, Fill, Audit*), pemanfaatan eksklusif 5 model Meta AI, kepatuhan ICAO 9303 tanpa manipulasi foto, dan skenario demo 3 menit. |
| [`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md) | **Arsitektur Sistem & Tech Stack:** Diagram global, integrasi Meta Model API (tanpa Baseten), ElevenLabs HD + Web Speech fallback, on-device AI 19 MB, Vercel Serverless, dan Supabase. |
| [`user_journey.md`](file:///d:/webdev/laragon/www/savvy/.agents/user_journey.md) | **User Journey Map:** *The 3-Y Friction Framework* (Ambiguity, Complexity, Anxiety) dipetakan ke 4 persona pendaftar dan matriks rilis fitur MVP. |
| [`design.md`](file:///d:/webdev/laragon/www/savvy/.agents/design.md) | **Design System & UI/UX Guidelines:** Palet warna WCAG AAA, kartu petunjuk 4-elemen, Beacon Spotlight (Closed Shadow DOM), dan Accessibility HUB. |
| [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) | **Compound Multi-Agent Design:** Siklus ReAct internal, skema prompt, format JSON output, dan parameter reasoning Muse Spark Open. |
| [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md) | **Stateful Chains & Two-Tier Cache:** Penggunaan Responses API (`previous_response_id`), manajemen sesi per tab, dan single-flight deduplication. |
| [`file_search_vector_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/file_search_vector_tool.md) | **RAG Juknis Resmi:** Pemanfaatan Meta Vector Store dan tool `file_search` untuk grounding regulasi dengan sitasi bab/halaman persis. |
| [`web_search_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/web_search_tool.md) | **Manual Researcher Agent:** Pemanfaatan tool `web_search` di Responses API untuk pembaruan regulasi eksternal terkini. |
| [`journal.md`](file:///d:/webdev/laragon/www/savvy/.agents/journal.md) | **Development Journal:** Catatan log kemajuan harian, evaluasi teknis, dan catatan arsitektural selama hackathon. |

---

## ⚡ 5 Model Meta AI Resmi (Meta Model API)

Savvy.AI memanfaatkan 5 model kecerdasan buatan dari ekosistem Meta AI secara eksklusif:
1. **Muse Spark Open:** Reasoning & ReAct Multi-Agent loop, Field Coach, Essay Coach, Consistency Checker, Vision Multimodal (*Explain This*).
2. **Muse Vector Store (`file_search`):** Retrieval juknis resmi dengan chunking semantik & sitasi bab/halaman dokumen sah.
3. **Muse Voice Transcribe:** Cloud Speech-to-Text (STT) untuk interaksi Handsfree Voicebot.
4. **SAM 3.1 Open (0.87B):** Cloud visual fallback untuk segmentasi batas formulir resolusi tinggi.
5. **Muse Code:** Dokumentasi rekayasa agentic dan logging sistem di `docs/muse-code-log.md`.

---

## 🤖 1. Daftar Agents Savvy.AI

Daftar agen cerdas berbasis penalaran model AI yang bekerja secara compound dan saling terkoordinasi untuk memandu pendaftar:

| Nama Agent | Fungsi | Keterangan | Referensi |
|---|---|---|---|
| **Form Analyzer Agent** | Memetakan dan menafsirkan struktur semantik formulir web/PDF | Berjalan saat halaman dimuat atau bermutasi (MutationObserver) untuk menentukan makna field, tipe logis, penanda wajib/opsional, aturan validasi terstandar, dan percabangan kondisional tanpa membaca isi data nilai pengguna (`.value`). | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L197-L213)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L89-L92) |
| **Manual Researcher Agent** | Riset regulasi eksternal & juknis terbaru via web grounding | Berjalan paralel di latar belakang menggunakan tool `web_search` untuk mencari regulasi dinamis terbaru (mis. edaran kementerian `.go.id` atau portal kedutaan) yang belum terindeks di Vector Store; hasil riset di-cache per domain formulir. | [`web_search_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/web_search_tool.md)<br>[`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L267-L270) |
| **Field Coach Agent** | Menyajikan kartu bimbingan kontekstual 4-elemen per field aktif | Terpicu saat field difokuskan; memanggil tool `file_search` ke Meta Vector Store untuk menyusun kartu panduan (*Arti Istilah, Cara Mengisi, Contoh Valid Fiktif, Jebakan Umum*) disertai sitasi bab/halaman dan badge bukti transparan (🟢/🔵/🟡). | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L214-L244)<br>[`file_search_vector_tool.md`](file:///d:/webdev/laragon/www/savvy/.agents/file_search_vector_tool.md)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L93-L98) |
| **Essay Coach Agent** | Mentransformasikan poin kasar menjadi draf esai formal berstruktur | Menyediakan bimbingan narasi pada kolom teks panjang (Statement of Purpose / Alasan Beasiswa); mengubah 3 poin fakta kasar pendaftar menjadi pilihan draf terstruktur (Formal, Ringkas, Elaboratif) yang selaras rubrik tanpa mengarang fakta fiktif. | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L245-L251)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L143-L148) |
| **Consistency Checker Agent** | Validasi nalar keselarasan logis silang (*cross-field sanity check*) | Memeriksa konsistensi internal data antar-kolom sebelum submit (mis. Nama di formulir vs Nama pada paspor/KTP, kesesuaian tanggal lahir vs angka NIK, dan masa berlaku paspor > 6 bulan terhadap tanggal keberangkatan). | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L271-L318)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L168-L174) |
| **Explain This (Visual Inspector) Agent** | Menganalisis potongan gambar formulir membingungkan via Vision Multimodal | Memproses area layar yang diseleksi pengguna setelah kotak isian ditutup rapat oleh DOM Masking, lalu menjabarkan arti instruksi visual dan syarat dokumen yang rumit secara ramah awam menggunakan Muse Spark Open. | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L50-L53)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L103-L107) |
| **Form Companion Synthesizer (Chatbot & Voicebot Agent)** | Mengorkestrasi percakapan interaktif dua arah di Side Panel | Menjawab pertanyaan warga secara interaktif melalui dialog teks maupun audio handsfree, memelihara konteks sesi per tab via Responses API (`previous_response_id`), dan mengalirkan respons ke mesin audio asisten. | [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L99-L102) |

---

## 🛠️ 2. Daftar Deterministic Tools (Alat Bantu Deterministik)

Alat bantu kode (*code-based guardrails & local deterministic engines*) yang dibangun secara terarah untuk dipanggil dan digunakan langsung oleh agents maupun sistem di jalur kritis tanpa risiko halusinasi model:

| Nama Tool (Deterministik) | Peran & Cara Kerja | Pengguna / Terhubung Ke | Referensi |
|---|---|---|---|
| **DOM Extractor & A11y Scanner (`extractFormStructure`)** | Mengekstraksi pohon aksesibilitas DOM (`role`, `accessible_name`, tag input, atribut `required`, `pattern`, `maxlength`) secara pasif tanpa pernah menyentuh atau membaca atribut nilai isian (`.value`) pengguna. | Form Analyzer Agent & Traffic Light Auditor | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L162)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L89-L92) |
| **5-Layer Resilient Locator Engine (`resolveSemanticLocator`)** | Menemukan dan mengunci elemen form di halaman web secara akurat melalui 5 lapis ketahanan: (1) A11y Tree, (2) Stable Attr Hash, (3) Section Path Hierarchy, (4) Geometric DOM Bounding Box, dan (5) Fuzzy Levenshtein Distance. | Beacon Spotlight, Virtual Cursor, & 1-Click Autofill | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L322)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L38-L43) |
| **Local PII Scrubber & Redactor (`scrubPIIText`)** | Menyaring dan menyamarkan identitas sensitif (NIK 16 digit, nomor paspor, email, nomor HP) menggunakan ekspresi reguler (regex) di browser sebelum teks prompt dikirim ke Meta Model API. | Seluruh Pemanggilan Meta Model API (Field Coach, Essay Coach, Consistency Checker) | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L63)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L42) |
| **DOM Masking Canvas (`applyDOMBlackoutMask`)** | Merender lapisan canvas penutup warna hitam pekat di atas seluruh kotak input data pengguna secara lokal sebelum proses screenshot area dijalankan untuk fitur *Explain This*. | Explain This (Visual Inspector) Agent | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L104-L106)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L43) |
| **Traffic Light Regex & Syntax Validator (`validateFieldRule`)** | Memvalidasi sintaksis isian formulir secara deterministik di content script (<300 ms) berdasarkan aturan regex (NIK 16 digit, email RFC, penanggalan) dan status evaluasi natif `checkValidity()` bawaan browser. | Traffic Light Pre-Submit Auditor & Consistency Checker | [`multi_agents.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md#L252-L265)<br>[`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L154-L157) |
| **Photo Compliance Inspector (`auditPhotoBiometrics` via `sharp`)** | Mengaudit pasfoto biometrik secara in-memory di backend (rasio aspek 2x2 inci / 35x45 mm, deteksi blur Laplacian variance, proporsi tinggi kepala 50%–69%, dan batas KB) tanpa manipulasi piksel biometrik (kepatuhan ICAO 9303). | Traffic Light Pre-Submit Auditor & Consistency Checker | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L158-L164)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L62) |
| **Multiple Vault Cryptographic Engine (`WebCryptoVaultEngine`)** | Mengelola derivasi kunci `PBKDF2-SHA256` (≥ 600.000 iterasi) berbasis Master Password lokal dan enkripsi/dekripsi `AES-256-GCM` 256-bit di memori runtime klien, serta dispatch event pengisian dan aksi Undo 100%. | 1-Click Autofill, Undo Action, & Multiple Vault Manager | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L128-L136)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L48) |
| **On-Device OCR & Document Parser (`MobileSAM + RapidOCR ONNX`)** | Mengisolasi segmentasi batas fisik kartu KTP lokal (MobileSAM 10 MB) dan mengekstraksi teks identitas lokal (RapidOCR 8 MB) langsung ke dalam memori Vault tanpa mengunggah berkas foto KTP ke server. | Upload ID to Vault & Multiple Vault Manager | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L137-L142)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L49-L51) |
| **Silero Voice Activity Detector (`SileroVADEngine`)** | Mendeteksi jeda suara hening (800 ms) dan interupsi bicara (*barge-in*) secara lokal on-device (1 MB) untuk mengendalikan pembukaan/penutupan rekaman mikrofon secara presisi saat interaksi suara handsfree. | Handsfree Voicebot & Muse Voice Transcribe STT | [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md#L101)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L51) |
| **Two-Tier Cache & Signature Hasher (`generateFieldSignature` & `lookupCoachCache`)** | Menghasilkan hash identitas field ternormalisasi (`domain_portal + field_locator_hash`) dan melakukan lookup cepat (<50 ms) di Supabase `coach_cache` dengan pencegahan pemanggilan ganda (*single-flight deduplication*). | Field Coach Agent & Form Analyzer Agent | [`multi_chain_cache.md`](file:///d:/webdev/laragon/www/savvy/.agents/multi_chain_cache.md#L150-L190)<br>[`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md#L61) |