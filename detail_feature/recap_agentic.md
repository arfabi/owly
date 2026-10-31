# 🤖 Owly.AI — Rekapitulasi Arsitektur Sistem Agen (Agentic Ecosystem)

Dokumen ini memetakan seluruh kapabilitas agen cerdas, pembagian peran agen, penjelasan alur kerja, dan klasifikasi alat (*Meta Muse Spark Native Tools* vs *Deterministic Local Tools*) di dalam ekosistem **Owly.AI**.

---

## 📊 Tabel Matriks: Fitur, Agen, Penjelasan & Alat (Tools)

| Fitur | Agen | Penjelasan | Meta Spark Tool / Local Tool |
|---|---|---|---|
| **Analyze This Form** (3-Agent Pipeline) | **Perception & Form Profiler Agent** | Menganalisis tangkapan visual halaman (`image_url`) dan metadata DOM untuk mengidentifikasi nama formulir, instansi penyelenggara, kategori, dan prasyarat pendaftaran secara menyeluruh. | 🤖 **Meta Spark Tool**: Native Vision API (`<\|patch\|>`), `reasoning_effort: medium` |
| **Analyze This Form** (3-Agent Pipeline) | **Regulation Researcher Agent** | Menjalankan pencarian mandiri (*search grounding*) ke portal resmi pemerintah (`.go.id`, `.ac.id`) dan mencocokkan pasal juknis PDF di database tanpa menyertakan data pribadi pengguna. | 🤖 **Meta Spark Tool**: `web_search` (Native Grounding) & `file_search` (Vector RAG) |
| **Analyze This Form** (3-Agent Pipeline) | **Decision & Synthesis Agent** | Menggabungkan hasil analisis visual dan regulasi hukum menjadi roadmap tahapan pengisian, kartu panduan per kolom, dan daftar jebakan fatal diskualifikasi. | 🤖 **Meta Spark Tool**: Chaining CoT Reasoning (`reasoning_effort: high`) |
| **Field Coach Card** (Panduan 4 Elemen) | **Active Field Context Agent** | Mendeteksi kursor fokus pengguna secara real-time dan menyajikan 4 kartu panduan: *Arti Istilah*, *Cara Mengisi*, *Contoh Isian Valid*, dan *Peringatan Jebakan*. | 🤖 **Meta Spark Tool**: `meta-models/muse-spark-open-1026` (Reasoning Effort: 32 tokens) |
| **Show Me: Level 1 & 2** (Fast Element Finder) | **Client-Side Heuristic Matcher** | Mencari tombol, link, atau rubrik di halaman melalui pencocokan teks langsung (`textContent`, `aria-label`) dan kamus sinonim lokal dalam **0 ms**. | ⚙️ **Local Tool**: TypeScript DOM Matcher & Semantic Synonym Dictionary |
| **Show Me: Level 3** (Semantic Element Finder) | **Semantic Reasoner Agent** | Mengirimkan 15–20 kandidat elemen teks dari DOM ke model untuk dinilai relevansi maksud semantiknya saat kata kunci ambigu atau tidak cocok langsung. | 🤖 **Meta Spark Tool**: Muse Spark OpenAI-compatible Tool Calling (`find_element_semantic`) |
| **Show Me: Level 4** (Multimodal Vision Fallback) | **Visual Locator Agent** | Mengambil screenshot bersih layar aktif untuk menemukan koordinat visual tombol/ikon grafis atau elemen canvas yang tidak memiliki teks di DOM. | 🤖 **Meta Spark Tool**: Multimodal Vision Grounding (`capture_current_screen`) |
| **Visual Navigator** (Show Me Feedback) | **Ghost Pointer & Spotlight Agent** | Menggerakkan kursor virtual melayang (*AI Ghost Cursor*) secara dinamis dan menembakkan lampu sorot (*Beacon Spotlight*) tepat ke koordinat elemen yang ditemukan. | ⚙️ **Local Tool**: Closed Shadow DOM CSS Keyframe Animator & Virtual Cursor Controller |
| **Visual Snip Explainer** (Lightshot Snip) | **Visual Snip Context Agent** | Mengambil potongan visual 2-turn dari area yang dipotong pengguna (*cropping*), mengekstrak teks gambar, dan menjelaskan klausul atau gambar membingungkan secara humanis. | 🤖 **Meta Spark Tool**: Multimodal Image-to-Text Vision Prompt & CoT Reasoning |
| **Pre-Submit Auditor** (Validasi Standar Baku) | **Deterministic Syntax & Math Validator** | Memeriksa kepatuhan NIK 16-digit Kemendagri, rumus tanggal wanita (+40), nomor HP Indonesia (`+62/08`), email RFC 5322, dan Paspor ICAO secara instan (<5ms). | ⚙️ **Local Tool**: TypeScript Finite State Machine (FSM) Regex Validator |
| **Pre-Submit Auditor** (Pemeriksaan Foto Berkas) | **Biometric Photo Quality Inspector** | Menguji ketajaman pasfoto biometrik (Laplacian blur variance > 100.0) dan komposisi kepala 70–80% ICAO Doc 9303 tanpa mengirim piksel foto ke internet. | ⚙️ **Local Tool**: In-Memory WebAssembly/C++ `sharp` Kernel Inspector |
| **Pre-Submit Auditor** (Pencocokan Data Rahasia) | **Zero-Knowledge Vault Reconciler** | Menguji keselarasan isian formulir dengan arsip profil pengguna di memori browser lokal menggunakan algoritma Levenshtein distance tanpa membuka PIN vault ke AI. | ⚙️ **Local Tool**: In-Browser Fuzzy Levenshtein Matcher (0 network transit) |
| **Pre-Submit Auditor** (Nalar Kontradiksi Kompleks) | **Ambiguity & Disqualification Buster** | Menganalisis catatan kaki, aturan bersyarat (misal: syarat IPK afirmasi vs reguler), dan klausul ambigu untuk memunculkan sinyal lampu lalu lintas (*Traffic Light*). | 🤖 **Meta Spark Tool**: Muse Spark Deep Reasoning (`reasoning_effort: high`, 256 tokens) |
| **Voicebot Interaktif** (Live Talk & PTT) | **Audio Activity & VAD Agent** | Memantau volume suara pengguna via Web Audio API AudioContext, mendeteksi jeda bicara (RMS threshold), dan mencegah interferensi audio ganda. | ⚙️ **Local Tool**: Web Audio API AudioWorklet & Client-Side RMS VAD Engine |
| **Voicebot Interaktif** (Speech-to-Intent) | **Multimodal Audio Agent** | Menerjemahkan suara rekaman pendaftar menjadi intensi perintah atau ekstraksi nilai formulir melalui payload audio bawaan. | 🤖 **Meta Spark Tool**: Native Audio Comprehension (`audio_url`, `<\|audio\|>`) |
| **Voicebot Interaktif** (Respon Verbal Warga) | **Speech Synthesis Engine** | Membacakan jawaban panduan resmi secara ramah dan ringkas ke telinga pengguna secara instan tanpa biaya token suara pihak ketiga. | ⚙️ **Local Tool**: Native Browser Web Speech API (`SpeechSynthesisUtterance`) |
| **Accessibility Hub** (14 Tool Inklusif) | **A11y Intent Router Agent** | Menganalisis keluhan lelah/pusing pengguna di ruang chat (misal: *"layarnya silau dan tulisannya kekecilan"*) dan secara otonom memanggil tool aksesibilitas yang tepat. | 🤖 **Meta Spark Tool**: Muse Function Calling (`toggle_a11y_tool`, `set_a11y_level`) |
| **Accessibility Hub** (Eksekusi 14 A11y Tools) | **Deterministic DOM Styler** | Menginjeksi filter kontras tinggi, reading spotlight, font disleksia, pembesar kursor, pembeku animasi CSS, dan spasi baca lebar ke DOM halaman aktif. | ⚙️ **Local Tool**: Chrome Extension Native Content Script DOM CSS Injector |
| **Private Vault** (Penyimpanan Aman) | **Zero-Knowledge Encryption Engine** | Mengunci data pribadi sensitif (NIK, KK, Ijazah, Gaji) dengan kunci turunan PIN pengguna (PBKDF2 100.000 iterasi) sebelum disinkronkan ke Supabase. | ⚙️ **Local Tool**: WebCrypto SubtleCrypto AES-256-GCM (128-bit salt, 96-bit IV) |
| **Chat & Log Privacy Guard** | **UU PDP PII Scrubber** | Mencegat dan menyamarkan (*redact*) nomor identitas rahasia sebelum pesan dikirim ke LLM publik untuk memenuhi UU PDP No. 27/2022. | ⚙️ **Local Tool**: Client-Side Regex Interceptor & Stream Masker |
| **1-Click AutoFill & Recovery** | **Deterministic Field Mapper** | Mengisi seluruh kolom formulir dari data vault terenkripsi dalam 1 klik dan mengelola riwayat perubahan formulir tanpa merusak ketikan manual. | ⚙️ **Local Tool**: Dispatcher Event DOM (`input`, `change`, `blur`) & In-Memory Redux Undo Stack |

---

## 🏛️ Filosofi Pemisahan: Probabilistik vs Deterministik

Owly.AI menerapkan prinsip ketat dalam pembagian tanggung jawab komputasi:

1. **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)**:
   - Dikhususkan untuk **penalaran probabilistik tingkat tinggi**, seperti pemahaman visual dokumen kompleks (*Native Vision*), ekstraksi intensi suara (*Native Audio*), penelusuran regulasi dinamis (*web_search*), sintesis kebijakan birokrasi, dan inferensi semantik.
2. **Deterministic Local Tools (Client-Side Browser)**:
   - Dikhususkan untuk **kepastian 100% dan keamanan mutlak**, seperti validasi matematika NIK Kemendagri, enkripsi kriptografi AES-256-GCM, sensor privasi PII UU PDP, injeksi CSS aksesibilitas, dan pembatalan (*lossless undo*). Komputasi ini berjalan lokal dengan latensi <5ms dan $0 biaya token.

---

## 📡 Visibilitas & Telemetri Real-Time
Setiap eksekusi dari agen-agen di atas memancarkan telemetri berstandar industri:
- **Server-Sent Events (SSE)**: Menghubungkan penalaran multi-agen langsung ke konsol side panel.
- **Agent Logger (7 Domain)**: `PERCEPTION`, `REASONING`, `PLANNER`, `ACTION`, `SECURITY`, `VOICE`, dan `GATEWAY` dapat dipantau langsung melalui terminal mini ekstensi dan Chrome DevTools (`F12 > Console`).
