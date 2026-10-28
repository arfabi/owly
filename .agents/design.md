# Design System & UI/UX Guidelines — Savvy.AI

> **Versi 2.1 · 28 Oktober 2026**  
> Master Design System tunggal (*Single Source of Truth*) untuk Web Showcase (Landing Page & Mock Portal) serta Ekstensi Browser Savvy.AI (Chrome Side Panel & Closed Shadow DOM Overlay).  
> Dokumen Pendamping:
> - [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) — Product Requirements Document & Feature Specs
> - [`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md) — Arsitektur Sistem & Tech Stack
> - [`user_journey.md`](file:///d:/webdev/laragon/www/savvy/.agents/user_journey.md) — User Journey & Persona Mapping

---

## 1. Filosofi & Prinsip Desain

1. **Jelas Sebelum Cantik (*Clarity Over Decoration*):**
   Pengguna utama adalah orang tua, lansia, dan pendaftar yang sedang cemas menghadapi konsekuensi fatal diskualifikasi berkas birokrasi. Satu layar, satu keputusan jelas.
2. **Non-Intrusive Presence (Hadir Tanpa Mengganggu):**
   Antarmuka utama berada di **Chrome Side Panel** (`width: 380px–420px`), memberikan pandangan 100% leluasa ke halaman formulir asli. Elemen in-page hanya muncul saat dibutuhkan via **Closed Shadow DOM** agar style ekstensi tidak merusak CSS portal target.
3. **Evidence-First Transparency (Bukti Mendahului Rekomendasi):**
   Setiap bimbingan visual wajib disertai badge bukti yang transparan (🟢 **Resmi**, 🔵 **Dikurasi**, 🟡 **Saran AI**). Rekomendasi AI tidak boleh disamarkan sebagai aturan resmi instansi.
4. **Warna Tidak Pernah Sendirian (*Triple Encoding*):**
   Setiap status wajib menyertakan **ikon**, **kata/teks**, dan **warna** secara bersamaan guna menjamin aksesibilitas penderita buta warna dan pembaca layar (*screen reader*).
5. **Aman Terlihat Aman (*Zero-Surprise Interaction*):**
   Savvy.AI **tidak pernah men-submit formulir secara otomatis**. Seluruh aksi penulisan (*autofill*) memerlukan izin sadar dan didukung tombol **Undo** 1-klik yang persisten.
6. **Gerakan Terkendali (*Intentional Motion*):**
   Animasi gerak hanya diperbolehkan pada momen yang membutuhkan umpan balik proses (misal: pemindaian pasfoto dan gelombang suara *Voicebot*). Sisanya diam dan menghormati `prefers-reduced-motion`.

---

## 2. Palet Warna & Semantic Design Tokens

Sistem warna menggunakan acuan warna netral shadcn/ui dan SkyAgent Magic UI, dirancang memenuhi standar rasio kontras **WCAG AAA**:

### 2.1 Brand & Neutral Palette
* **Primary Brand Accent:** `#2563EB` (Blue 600) / `#3B82F6` (Blue 500)
  * Digunakan untuk: Tombol aksi utama, ring fokus interaktif, indikator kolom aktif, dan pendaran cahaya aksen.
* **Neutrals (Web Landing Page — Clean Light Mode):**
  * Background Utama: `#FFFFFF` (Pure White)
  * Background Sekunder / Card: `#FAFAFA` / `#F8FAFC` (Slate 50)
  * Border Token: `#E2E8F0` (Slate 200)
  * Heading Text: `#020617` (Slate 950)
  * Body Text: `#475569` (Slate 600)
* **Neutrals (Ekstensi Chrome Side Panel — Slate Adaptive):**
  * Background Utama: `#0F172A` (Slate 900)
  * Surface / Card Background: `#1E293B` (Slate 800)
  * Border Token: `#334155` (Slate 700)
  * High Contrast Text: `#F8FAFC` (Slate 50)
  * Muted Text: `#94A3B8` (Slate 400)

### 2.2 Semantic Status Tokens (Traffic Light Auditor)
| Status | Ikon | Label Kata | Background | Border | Teks | Penggunaan |
|---|---|---|---|---|---|---|
| **Aman (Hijau)** | Centang `CheckCircle2` | "Sudah benar" | `rgba(16, 185, 129, 0.12)` | `#10B981` | `#047857` (Light) / `#6EE7B7` (Dark) | Format regex valid, juknis terverifikasi |
| **Perlu Dicek (Kuning)** | Segitiga `AlertTriangle` | "Periksa dulu" | `rgba(245, 158, 11, 0.12)` | `#F59E0B` | `#B45309` (Light) / `#FCD34D` (Dark) | Format tanggal ambigu, esai terlalu singkat |
| **Salah (Merah)** | Silang `AlertCircle` | "Perlu diperbaiki" | `rgba(239, 68, 68, 0.12)` | `#EF4444` | `#B91C1C` (Light) / `#FCA5A5` (Dark) | NIK kurang digit, kolom wajib kosong, foto blur |

### 2.3 Evidence Badges (Lencana Sumber Regulasi)
* 🟢 **Resmi (`Official`):**
  * Syarat: Wajib memiliki sitasi dokumen sah (nama file, bab, dan nomor halaman) dari Meta Vector Store (`file_search`).
  * Tampilan: `bg-emerald-50 text-emerald-800 border-emerald-200` (Light) | `bg-emerald-950/80 text-emerald-300 border-emerald-500/40` (Dark).
  * Format teks: *"Resmi • Juknis LPDP 2026, hlm. 14"*.
* 🔵 **Dikurasi (`Curated`):**
  * Syarat: Penjelasan telah diverifikasi tim kurasi dan tersimpan di `coach_cache`.
  * Tampilan: `bg-blue-50 text-blue-800 border-blue-200` (Light) | `bg-blue-950/80 text-blue-300 border-blue-500/40` (Dark).
* 🟡 **Saran AI (`AI Guidance`):**
  * Syarat: Dihasilkan oleh penalaran LLM berbasis struktur DOM tanpa grounding juknis resmi.
  * Tampilan: `bg-amber-50 text-amber-800 border-amber-200` (Light) | `bg-amber-950/80 text-amber-300 border-amber-500/40` (Dark).
  * Format teks: Disertai pesan *"Periksa kembali ke pihak penyelenggara"*.

---

## 3. Tipografi & Sistem Ikon (Lucide Icons)

### 3.1 Sistem Ikon: Lucide React (`lucide-react`)
Standar ikon visual yang dipakai di seluruh Web Showcase dan Ekstensi Browser:
* **Pustaka:** `lucide-react` (tree-shakeable, SVG murni berbobot ringan).
* **Grid & Stroke:** Grid dasar `24px` dengan `strokeWidth={1.5}` untuk kartu bimbingan dan `strokeWidth={2}` untuk status interaktif/tombol.
* **Kategori Ikon Kunci:**
  * **Traffic Light & Validasi:** `CheckCircle2` (Hijau), `AlertTriangle` (Kuning), `AlertCircle` (Merah), `ShieldCheck` (Pre-submit).
  * **Aksesibilitas & Kognitif:** `Eye` (Spotlight), `Volume2` (TTS), `Contrast`, `Type`, `Pause` (Animasi), `Maximize2` (Kursor).
  * **Multiple Vault & Privasi:** `Lock`, `Unlock`, `KeyRound`, `FileText`, `Upload` (OCR KTP).
  * **Multi-Agent Companion:** `Sparkles` / `Bot` (Field Coach), `Wand2` (Essay Coach).

### 3.2 Pasangan Font Tipografi
Kombinasi font komplementer untuk kenyamanan membaca dokumen rapat dan kejelasan angka:
1. **Font Teks UI & Narasi:** **Inter** atau **Geist Sans** (`font-sans`).
   * Dirancang khusus untuk layar digital dengan *x-height* proporsional, menjamin kartu panduan tetap sangat nyaman dibaca pada teks kecil (12px–14px).
   * Web: dimuat mandiri via `next/font/google` (zero-CDN, offline-ready).
   * Ekstensi: `@fontsource/inter` dengan fallback ke `system-ui`.
2. **Font Tabular Angka & Identitas:** **Geist Mono** atau **JetBrains Mono** (`font-mono`).
   * Diterapkan pada kolom angka krusial: NIK 16 digit, nomor paspor, tanggal lahir, dan kode pos.
   * Format *monospace tabular* memastikan angka `0` tidak tertukar dengan huruf `O`, serta angka `1` tidak tertukar dengan huruf `l`/`I`.
3. **Font Aksesibilitas Khusus:** **OpenDyslexic** (opsional diaktifkan via Accessibility Hub untuk pengguna disleksia).

### 3.3 Ukuran Tipografi Ramah Warga
* **Teks Isi Minimal:** `16px` (Web Showcase) / `13px–14px` (Chrome Side Panel sempit), `line-height: 1.6`.
* **Headings:** `20px` / `24px` / `32px` dalam penulisan *sentence case* (menghindari huruf kapital semua yang intimidatif).
* **Ukuran Target Sentuh (Touch Target):** Minimal `48px` x `48px` untuk seluruh tombol interaktif dan kontrol formulir.
* **Indikator Fokus:** Garis biru tegas `3px` solid `#2563EB` dengan offset `2px`, selalu terlihat saat navigasi keyboard (`Tab`).

---

## 4. Sub-Sistem Antarmuka

### 4.1 Web Showcase (Landing Page & Mock Portal)
* **Gaya Visual:** Mengadopsi template **SkyAgent (Magic UI)** di `https://agent-magicui.vercel.app/`.
* **Karakteristik Kunci:**
  * Latar belakang putih bersih dengan pendaran aksen biru langit halus (*subtle sky-blue radial glow*).
  * **Floating Capsule Navbar (`magic-pill`):** Kapsul membulat putih dengan backdrop blur transparan (`rounded-full bg-white/85 border border-slate-200/90 shadow-sm`).
  * **Bento Grid Showcase (`magic-card`):** Kartu berujung membulat halus (`rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300`).
  * **Running Marquee:** Pita horizontal berjalan menampilkan daftar portal resmi yang didukung (*LPDP, Visa Schengen, M-Paspor RI, SSCASN CPNS, US DS-160*).
  * **Interactive Mock Portal (`/mock-portal`):** Lingkungan pengujian formulir nyata mandiri tanpa ketergantungan API luar.

### 4.2 Ekstensi Browser (Chrome Side Panel & Closed Shadow DOM)
* **Side Panel Host:** Menampilkan kontrol utama, chat/voicebot, vault manager, dan kartu panduan field aktif dengan lebar `380px–420px`.
* **Closed Shadow DOM Overlay (`div#savvy-root`):**
  * Seluruh injeksi in-page dibungkus dalam `{ mode: 'closed' }` untuk mengisolasi total CSS ekstensi dari portal pemerintah/visa.
  * **Beacon Spotlight:** Layar web meredup halus (`background: rgba(0, 0, 0, 0.55)`), sementara field formulir yang aktif diberi potongan sorotan jernih dengan border spotlight bercahaya (`box-shadow: 0 0 0 9999px rgba(0,0,0,0.55), 0 0 15px #2563EB`).
  * **Animated Virtual Cursor:** Titik cahaya pemandu bergerak mengarahkan pandangan mata pengguna ke kolom urutan berikutnya tanpa mengambil alih mouse fisik.

---

## 5. Katalog Komponen Inti

### 5.1 Button
| Varian | Peran | Tampilan | Label Contoh |
|---|---|---|---|
| **Primary** | Aksi tunggal terpenting | `bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm` | *"Isi Kolom Ini dari Vault"*, *"Jalankan Audit"* |
| **Secondary** | Aksi alternatif / bantuan | `bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200` | *"Lihat Contoh Sah"*, *"Dengarkan Audio"* |
| **Ghost** | Aksi pendukung ringan | `hover:bg-slate-100 text-slate-600 hover:text-slate-900` | *"Bantuan"*, *"Tutup"* |
| **Danger** | Aksi destruktif data | `bg-red-50 hover:bg-red-100 text-red-700 border border-red-200` | *"Kunci Vault Sekarang"*, *"Hapus Data"* |

### 5.2 StatusChip (Indikator Lampu Lalu Lintas)
* Wajib menggabungkan **ikon + label kata + warna**:
  * 🟢 **Aman:** `[CheckCircle2] Sudah benar`
  * 🟡 **Perlu Dicek:** `[AlertTriangle] Periksa dulu`
  * 🔴 **Salah:** `[AlertCircle] Perlu diperbaiki`
* Dilengkapi atribut aksesibilitas `role="status"` dan `aria-live="polite"`.

### 5.3 SourceBadge (Lencana Bukti Regulasi)
* Ditampilkan di header kartu panduan dengan rujukan persis:
  * Format: `[🟢 Resmi • Juknis LPDP 2026 hlm. 14]`
* Menjamin transparansi hukum birokrasi bagi pendaftar.

### 5.4 FieldCoachCard (Kartu Panduan 4-Elemen)
Menampilkan 4 elemen baku:
1. **Arti Istilah (*Meaning*):** Maksud kolom dalam bahasa awam.
2. **Cara Mengisi (*How to Fill*):** Panduan langkah pengisian yang sah.
3. **Contoh Valid (*Example Valid Value*):** Spesimen nilai nyata yang lolos seleksi.
4. **Jebakan Umum (*Common Pitfalls*):** Peringatan kesalahan fatal berujung gugur berkas.
* **Tombol Aksi Single-Field Autofill:** Tombol deterministik langsung `[Isi Kolom Ini dari Vault (3271...)]` yang muncul jika field cocok dengan data di Vault ter-unlock.

### 5.5 PhotoAuditCard (Momen Pembuktian Pasfoto)
* Mengaudit pasfoto biometrik secara in-memory melalui `sharp` (rasio aspek 2x2 inci / 35x45 mm, Laplacian variance blur, proporsi biometrik kepala 50%–69%).
* **Satu-satunya elemen gerak yang menonjol:** Garis tepi bercahaya (*Border Beam*) hanya berputar selama proses pemindaian foto berlangsung dan seketika berhenti saat 3 StatusChip hasil audit keluar.
* Menegakkan kepatuhan standar hukum biometrik internasional ICAO 9303 (**0% manipulasi piksel wajah**).

### 5.6 UndoBar (Pengaman Pengisian Form)
* Muncul seketika di bagian bawah setelah aksi pengisian: *"4 kolom berhasil diisi dari Vault. [Batalkan / Undo]"*.
* Bersifat persisten sampai pengguna menutupnya atau menavigasi ke tahap lain (tidak hilang otomatis dalam 3 detik agar pengguna lansia sempat membacanya).

---

## 6. Accessibility HUB (Katalog 14 Tools Deterministik)

Seluruh 14 alat aksesibilitas berjalan 100% deterministik di sisi browser (`content_scripts`) tanpa manipulasi server dan tanpa biaya token LLM ($0):

| No | Tool | Fungsi & Mekanisme Klien | Status Awal |
|---|---|---|---|
| 1 | **Reading Spotlight** | Strip transparan mengikuti vertikal kursor untuk fokus membaca baris panjang. | Off |
| 2 | **Text to Speech (TTS)** | Pembacaan instruksi via Web Speech API browser lokal. | Off |
| 3 | **Contrast Mode** | Injeksi filter CSS high-contrast (Dark / Light / Invert) memenuhi standar WCAG AAA. | Normal |
| 4 | **Highlight Links** | Outline dan background kontras tinggi pada link `<a>`, `<button>`, dan input klik. | Off |
| 5 | **Bigger Text Size** | Penskalaan tipografi menggunakan CSS root `--savvy-font-scale` tanpa merusak layout form. | Normal |
| 6 | **Text Spacing** | Penyesuaian `letter-spacing` dan `word-spacing` untuk kemudahan pemilahan kata. | Normal |
| 7 | **Pause Animations** | Injeksi CSS `animation: none !important;` untuk mematikan elemen bergerak/distraksi. | Normal |
| 8 | **Hide All Images** | Pengaturan `display: none` pada banner iklan dan gambar dekoratif agar form bersih. | Normal |
| 9 | **Dyslexia Font** | Penggantian font global antarmuka ke *OpenDyslexic* bagi penderita disleksia. | Off |
| 10 | **Big Cursor** | Penggantian kursor native dengan pointer SVG high-visibility berukuran besar. | Normal |
| 11 | **Live Tooltips** | Tooltip kontekstual deterministik melayang di atas istilah birokrasi teknis. | Off |
| 12 | **Line Height** | Penskalaan jarak antar-baris teks (`line-height: 1.8 - 2.2`) untuk kenyamanan mata. | Normal |
| 13 | **Text Alignment** | Normalisasi perataan teks (rata kiri) untuk konsistensi keterbacaan. | Normal |
| 14 | **Color Saturation** | Penyesuaian saturasi warna halaman (Monochrome / Low Saturation). | Normal |

> **Arsitektur Dual-Trigger:** Seluruh alat di atas dapat dipicu melalui klik langsung tile kartu di Side Panel ekstensi, atau dipanggil secara otomatis oleh reasoning AI (*Muse Spark 1.3*) melalui kontrak tool tunggal `set_accessibility_feature` saat pengguna mengeluhkan rasa pusing atau lelah.
