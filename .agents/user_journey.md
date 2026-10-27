# User Journey Map: Savvy.AI Companion & Co-Pilot

> Dokumen ini memetakan perjalanan pengalaman pengguna (*User Journey*) secara komprehensif, menghubungkan titik masalah emosional dan teknis masyarakat saat berhadapan dengan formulir birokrasi resmi dengan solusi terarah yang disediakan oleh **Savvy.AI** dan **Savvy Studio**.

---

## 1. Persona Pengguna

1. **Pemohon Beasiswa (*Scholarship Applicant*):**
   * *Contoh Target:* Pendaftar beasiswa LPDP, Chevening, Fulbright, MEXT.
   * *Karakteristik:* Menghadapi ratusan isian formulir, kolom esai panjang, persyaratan dokumen berlapis, dan kecemasan tinggi gagal di tahap seleksi administrasi.
   * *Kebutuhan Kunci:* Magic Pen (anti-writer's block), Forms Guide, dan Traffic Light Auditor.

2. **Pemohon Visa & Paspor (*Traveler / Student / Expat*):**
   * *Contoh Target:* Pemohon US Visa DS-160, Visa Schengen, Paspor Online Imigrasi.
   * *Karakteristik:* Khawatir ditolak karena salah format foto, ketidaktahuan istilah hukum kedutaan (*Affidavit of Support*, *Apostille*), regulasi ukuran file ketat, dan kekhawatiran salah tulis nama paspor.
   * *Kebutuhan Kunci:* Explain This, Audit Kepatuhan Foto (ICAO 9303), Form Utility (formmate.in), dan Spesimen Dokumen Sah.

3. **Masyarakat Umum & Lansia (*Public Service Seekers*):**
   * *Contoh Target:* Pengisi portal CPNS, OSS perizinan usaha, layanan adminduk KTP/KK.
   * *Karakteristik:* Literasi digital terbatas, mudah lelah mengetik, kesulitan membaca teks kecil atau istilah birokrasi berbelit-belit.
   * *Kebutuhan Kunci:* Walkthrough Spotlight, Handsfree Voicebot (Silero VAD), Accessibility HUB (ADHD focus bar, OpenDyslexic), dan 1-Click Vault Autofill.

4. **Petugas Instansi / Officer (*Content Publisher — Official*):**
   * *Contoh Target:* Staf humas/IT kementerian atau pengelola layanan publik resmi.
   * *Karakteristik:* Ingin menerbitkan panduan pengisian resmi tanpa harus mengubah source code portal pemerintah atau menyewa konsultan IT mahal.
   * *Kebutuhan Kunci:* Savvy Studio (rekam alur klik, smart blur PII, lampirkan spesimen/template resmi, publikasi tier Official).

---

## 2. Tiga Pilar Masalah Utama: "The 3-Y Friction Framework"

Pengalaman buruk dan kegagalan masyarakat dalam pendaftaran formulir digital bermuara pada tiga pilar friksi utama: **Ambiguity**, **Complexity**, dan **Anxiety**.

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
  • Petunjuk Kolom Form Gelap        • Gagal Upload Berkas (Size Limit) • Takut Salah Alur / Tombol
    ──► Forms Guide (Walkthrough)      ──► Form Utility (formmate.in)     ──► Beacon Spotlight & Shadow DOM
        (Meaning, Example, Pitfall)  • Pasfoto Syarat Khusus (ICAO)     • Ragu Format Nilai / Tanggal
  • Salah Format Berkas / Dokumen      ──► Audit Kepatuhan Foto (Sharp)   ──► Pre-Submit Traffic Light
    ──► Official Specimen & Template • Ratusan Kolom & Lelah Mengetik   • Takut Data Palsu / Tidak Sah
  • Istilah Hukum Birokrasi            ──► Multiple Vault & Voicebot      ──► 3-Tier Honest Badge
    ──► Explain This (Snip Tool)     • Hambatan Fisik / Visual          • Kerusakan UI / Redesign Portal
  • Formulir Berbahasa Asing           ──► Accessibility HUB              ──► 5-Layer Multi-Layer Locator
    ──► Scoped Translation (WeakMap)
  • Writer's Block Kolom Alasan
    ──► Magic Pen (3 Opsi Draf)
  • Butuh Tanya Jawab Langsung
    ──► Chatbot & Handsfree Voicebot
```

### Pemetaan Rinci 3 Pilar:

#### 1. AMBIGUITY (Ketidakjelasan Makna, Petunjuk Form, Regulasi, dan Rangkaian Kata)
* **Akar Masalah:** Hambatan kognitif, ketiadaan konteks di halaman form, dan kesulitan merangkai teks resmi.
* **Gejala di Masyarakat:**
  * Tidak tahu kolom harus diisi apa, format contohnya seperti apa, dan apa pantangannya.
  * Terbentur istilah birokrasi asing (*Apostille*, *Affidavit of Support*, *Substituted Power of Attorney*).
  * Menghadapi formulir berbahasa asing pada portal kedutaan luar negeri.
  * Bingung merangkai kata pada kolom esai/keterangan/alasan (*writer's block*).
* **Solusi Savvy.AI:**
  * **Forms Guide (Kamus Petunjuk Form Lengkap):** Menampilkan kartu petunjuk resmi per elemen field yang aktif:
    * *Meaning:* Penjelasan arti kolom dalam bahasa sederhana.
    * *How to Fill:* Langkah teknis pengisian yang sah.
    * *Example Valid Value:* Contoh isian nyata yang sah dan benar.
    * *Common Pitfalls:* Peringatan dini kesalahan fatal yang sering bikin gugur.
  * **Explain This (Snip Lightshot-Style):** Penjelasan instan elemen layar dengan DOM Masking PII otomatis via Muse Spark Open.
  * **Scoped Page Translation:** Terjemahan label halaman berbasis WeakMap tanpa merusak locator asli dan tanpa mengubah isian pengguna.
  * **Magic Pen (Anti-Writer's Block):** Mengubah 3 poin bullet kasar menjadi draf formal/ringkas/elaboratif dengan label transparan *"Dibuat AI"*.
  * **Chatbot & Handsfree Voicebot:** Tanya jawab interaktif juknis resmi dengan Silero VAD dan dual guardrail anti-prompt injection.

#### 2. COMPLEXITY (Kerumitan Mekanis, Teknis Portal, dan Standarisasi Berkas)
* **Akar Masalah:** Gesekan teknis sistem formulir dan persyaratan media digital yang kaku.
* **Gejala di Masyarakat:**
  * File PDF / scan KTP ditolak sistem karena melebihi batas ukuran (*"File melebihi 200 KB"*).
  * Tidak yakin apakah pasfoto memenuhi standar regulasi paspor/visa (rasio kepala, ketajaman, dimensi).
  * Formulir memiliki puluhan kolom yang melelahkan jika diketik manual berulang kali.
  * Hambatan visual atau kesulitan fokus pada formulir yang padat.
* **Solusi Savvy.AI:**
  * **Form Utility Link (formmate.in):** Akses instan ke alat konversi berkas (JPG/PNG/PDF/Docx), kompresi cerdas, dan resizer dokumen.
  * **Audit Kepatuhan Foto (Deterministik & Aman Regulasi):** Validasi otomatis rasio kepala, dimensi 2x2 / 35x45 mm, dan ketajaman tanpa mengubah piksel foto (100% mematuhi aturan US Dept of State & ICAO 9303).
  * **Multiple Vault Autofill & Seed Phrase:** Penyimpanan aman berenkripsi AES-256-GCM lokal dengan 12-Word Seed Phrase (BIP-39), pengisian instan 1-klik, dan fungsi Undo 100%.
  * **Upload to Vault (On-Device OCR):** Ekstraksi data KTP langsung ke Vault menggunakan model lokal MobileSAM Q4 + RapidOCR ONNX (18 MB).
  * **Accessibility HUB:** Pengaturan kenyamanan membaca (ADHD focus reading bar, OpenDyslexic font, kontras tinggi).

#### 3. ANXIETY (Kecemasan Mental, Ketakutan Salah Klik, dan Risiko Diskualifikasi)
* **Akar Masalah:** Konsekuensi fatal dari kesalahan sepele dalam pendaftaran resmi (uang pendaftaran hangus, visa ditolak, atau gugur berkas beasiswa).
* **Gejala di Masyarakat:**
  * Takut mengklik tombol yang salah atau tersesat di alur portal.
  * Ragu apakah petunjuk di internet valid atau sudah usang.
  * Kecemasan memuncak saat mendekati tombol *Submit* (khawatir format tanggal terbalik, gelar akademis masuk ke nama paspor, atau NIK kurang 1 digit).
* **Solusi Savvy.AI:**
  * **Interactive Visual Walkthrough (Beacon Spotlight):** Lampu sorot penuntun visual langkah demi langkah di atas layar asli portal di dalam Closed Shadow DOM.
  * **Animated Virtual Cursor:** Kursor semu visual yang meluncur memandu mata ke kolom berikutnya tanpa merebut mouse fisik pengguna.
  * **Honest Badging Tiga Tingkat:** Pembedaan tegas antara sumber terverifikasi instansi (🟢 **Official**), kurasi tim (🔵 **Savvy Curated**), dan saran kecerdasan buatan (🟡 **AI Guidance**).
  * **Pre-Submission Traffic Light Auditor:** Audit komprehensif berlampu merah, kuning, dan hijau sebelum submit untuk mendeteksi kesalahan fatal.

---

## 3. Tahapan Alur Perjalanan Pengguna (End-to-End User Journey)

### Tahap 1: Onboarding & Pengenalan Halaman (Discovery & Orientation)
* **Situasi Pengguna:** Membuka portal resmi (misal portal beasiswa atau visa) dan dihadapkan pada puluhan tab serta istilah hukum rumit.
* **Titik Stres (Pain Points):**
  * Tidak tahu harus mulai dari mana.
  * Teks portal padat, kecil, atau berbahasa asing.
* **Solusi & Respon Savvy.AI:**
  * **Auto-Domain Match:** Ekstensi mendeteksi URL aktif dan menampilkan badge status panduan resmi di Side Panel.
  * **Explain This (Snip Tool):** Pengguna menyeleksi area layar untuk memperoleh penjelasan instan ramah awam.
  * **Accessibility HUB:** Mengaktifkan mode kontras tinggi atau ADHD focus bar jika teks sulit dibaca.

---

### Tahap 2: Bimbingan & Penelusuran Alur Resmi (Guided Navigation)
* **Situasi Pengguna:** Memulai pengisian langkah demi langkah.
* **Titik Stres (Pain Points):**
  * Takut salah klik tombol yang bisa menggugurkan pendaftaran.
  * Bingung apa maksud suatu field dan format apa yang diminta instansi.
* **Solusi & Respon Savvy.AI:**
  * **Interactive Visual Walkthrough:** Layar meredup halus dan lampu sorot (*beacon spotlight*) menunjuk langsung ke elemen yang wajib diisi.
  * **Kursor Semu Beranimasi:** Meluncur visual mengarahkan fokus saat pengguna menekan `Tab` / `Enter` atau pindah kolom.
  * **Kartu Field Guidance Resmi:** Menampilkan *Meaning, How to Fill, Example Valid Value,* dan *Common Pitfalls*.
  * **Evidence-Based Scoring:** Menjamin skor akurasi berdasarkan data resmi, atau menampilkan *"Tanyakan ke instansi"* jika tidak ada bukti sah.

---

### Tahap 3: Pengisian Data & Bantuan Pengetikan (Data Input & Assistance)
* **Situasi Pengguna:** Mengisi identitas, tanggal lahir, riwayat pendidikan, serta kolom esai/alasan.
* **Titik Stres (Pain Points):**
  * Lelah mengetik identitas berulang kali di puluhan kolom.
  * Mengalami *writer's block* di kolom teks narasi (*"Tujuan Kunjungan"*, *"Rencana Studi"*).
* **Solusi & Respon Savvy.AI:**
  * **Multiple Vault Autofill:** Mengisi otomatis dari Vault aktif dengan 1-klik, lengkap dengan tombol **Undo Autofill**.
  * **Voice Form-Filling & Handsfree VAD:** Pengguna cukup mendiktekan jawaban via mikrofon (didukung Silero VAD).
  * **Magic Pen (Anti-Writer's Block):** Mengetik 3 poin santai → diubah menjadi pilihan draf narasi resmi (Formal/Ringkas/Elaboratif).

---

### Tahap 4: Persiapan & Unggah Berkas (Document Preparation & Specimen)
* **Situasi Pengguna:** Diminta mengunggah dokumen KTP/Ijazah dan pasfoto resmi.
* **Titik Stres (Pain Points):**
  * Berkas ditolak sistem karena ukuran melebihi batas portal (*"File melebihi 200 KB"*).
  * Ragu apakah pasfoto sudah memenuhi syarat biometrik visa/paspor.
  * Bingung format surat rekomendasi yang sah seperti apa.
* **Solusi & Respon Savvy.AI:**
  * **Form Utility Link:** Tautan cepat ke platform `formmate.in` untuk kompresi file PDF/gambar dan konversi format.
  * **Audit Kepatuhan Foto:** Validasi otomatis rasio kepala, dimensi, dan ketajaman tanpa manipulasi piksel wajah.
  * **Official Specimen & Template Previewer:**
    * *Interactive Specimen Modal:* Menampilkan contoh berkas sah resmi dummy beranotasi yang dapat di-zoom.
    * *One-Click Template Download:* Mengunduh langsung template resmi (`.docx` / `.pdf`).
    * *Side-by-Side Pre-Upload Verification:* Pratinjau berdampingan di Side Panel antara berkas pengguna dengan spesimen resmi sebelum upload.

---

### Tahap 5: Pemeriksaan Akhir Sebelum Kirim (Pre-Submission Audit)
* **Situasi Pengguna:** Semua field telah terisi dan tombol "Submit Permohonan" sudah aktif.
* **Titik Stres (Pain Points):**
  * Kecemasan memuncak (*anxiety peak*): Apakah ada tanggal yang terbalik? Apakah NIK kurang 1 digit? Apakah gelar akademik masuk ke nama paspor?
* **Solusi & Respon Savvy.AI:**
  * **Pre-Submission Traffic Light Auditor:** Memindai seluruh halaman sebelum kirim:
    * 🟢 *Hijau:* Format data sah dan sesuai standar regulasi.
    * 🟡 *Kuning:* Peringatan format meragukan (mis. format tanggal ambigu).
    * 🔴 *Merah:* Kesalahan fatal yang pasti menggugurkan (NIK tidak 16 digit, gelar masuk nama paspor, field wajib kosong).
  * **One-Click Jump to Drawer:** Menampilkan drawer daftar perbaikan; klik salah satu saran langsung menyorot field yang bersangkutan.

---

## 4. Matriks Rilis Fitur (MVP Hackathon vs Next Roadmap)

| Fitur / Modul | Fase Rilis | Peran & Alasan Prioritas |
| :--- | :---: | :--- |
| **Official Verified Guidance Hub** | **MVP (P0)** | Pilar panduan resmi tanpa risiko salah informasi hukum. |
| **A11y Visual Spotlight & Navigation** | **MVP (P0)** | Mengarahkan panduan visual interaktif di atas DOM portal. |
| **Multi-Layer Locator Engine (5-Layer)** | **MVP (P0)** | Ketahanan panduan terhadap perubahan UI portal instansi. |
| **Chatbot & Handsfree Voicebot** | **MVP (P0)** | Kanal interaktif teks & suara (Muse Voice Transcribe + Silero VAD). |
| **Multiple Vault Autofill & Seed Phrase** | **MVP (P0)** | Enkripsi WebCrypto AES-256-GCM + BIP-39 dan tombol Undo. |
| **Upload to Vault (On-Device OCR KTP)** | **MVP (P0)** | Ekstraksi identitas instan via MobileSAM Q4 + RapidOCR ONNX. |
| **Pre-Submission Traffic Light Auditor** | **MVP (P0)** | Mencegah diskualifikasi administrasi fatal sebelum submit. |
| **Audit Kepatuhan Foto (In-Memory)** | **MVP (P0)** | Validasi pasfoto deterministik tanpa manipulasi piksel biometrik. |
| **Form Utility Link (formmate.in)** | **MVP (P0)** | Solusi cepat kompresi dan konversi berkas eksternal. |
| **Official Specimen & Template Previewer**| **MVP (P0)** | Pratinjau contoh berkas sah dan unduh template surat resmi. |
| **Magic Pen (Help Me Write)** | **MVP (P0)** | Menghilangkan *writer's block* pada kolom narasi esai/alasan. |
| **Explain This (Lightshot Snip + Masking)**| **MVP (P0)** | Analisis multimodal istilah hukum layar via Muse Spark Open. |
| **SVG Talking Avatar (Lipsync Viseme)** | **MVP (P1)** | Visualisasi interaktif status bicara suara (Listening/Speaking). |
| **Multi-Document Cross-Verification** | **Next Roadmap (v2)**| Pengecekan silang otomatis konsistensi antar-dokumen (KTP vs Ijazah). |
