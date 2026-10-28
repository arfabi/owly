# Design System & UI/UX Guidelines — Savvy.AI

> **Versi 2.0 · 28 Oktober 2026**  
> Sistem Desain, Komponen Antarmuka, dan Pedoman Aksesibilitas Ekstensi Browser Savvy.AI (Side Panel & Closed Shadow DOM Overlay).  
> Dokumen Pendamping:
> - [`prd.md`](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) — Product Requirements Document
> - [`architecture.md`](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md) — Arsitektur Sistem & Tech Stack
> - [`user_journey.md`](file:///d:/webdev/laragon/www/savvy/.agents/user_journey.md) — User Journey & Persona Mapping

---

## 1. Prinsip Desain Antarmuka

1. **Non-Intrusive Presence (Hadir Tanpa Mengganggu):**
   * Antarmuka utama berada di **Chrome Side Panel** (`width: 380px–420px`), memberikan ruang pandang 100% leluasa bagi pengguna untuk melihat halaman formulir asli.
   * Elemen in-page hanya muncul saat diperlukan menggunakan **Closed Shadow DOM** agar style ekstensi tidak bertabrakan dengan CSS portal pemerintah/visa.
2. **Clarity Over Cleverness (Kejelasan Melebihi Dekorasi):**
   * Bahasa visual bersih, profesional, dan menenangkan guna mereduksi kecemasan (*anxiety reduction*) pengguna saat mengisi formulir birokrasi berisiko tinggi.
3. **Evidence-First Transparency:**
   * Setiap panduan visual wajib memiliki penanda bukti yang jelas (badge sumber) sehingga pengguna tahu persis dasar hukum instruksi tersebut.

---

## 2. Palet Warna & Semantic Tokens

Sistem warna dirancang ramah WCAG AAA dengan kontras tajam pada tema gelap (*Dark Mode*) maupun terang (*Light Mode*):

### 2.1 Brand & Neutral Colors
* **Background Utama (Side Panel):** `#0F172A` (Slate 900)
* **Surface / Card Background:** `#1E293B` (Slate 800) / Border: `#334155` (Slate 700)
* **Primary Accent:** `#3B82F6` (Blue 500) — Fokus, aksi tombol primer, aktif
* **Primary Glow / Aura:** `rgba(59, 130, 246, 0.35)`
* **Text High Contrast:** `#F8FAFC` (Slate 50) — Judul & label utama
* **Text Muted:** `#94A3B8` (Slate 400) — Deskripsi & teks sekunder

### 2.2 Semantic Status & Traffic Light Tokens
* 🔴 **Error / Critical Danger:**
  * Background: `rgba(239, 68, 68, 0.15)` | Border: `#EF4444` | Text: `#FCA5A5`
  * Digunakan untuk: Format salah fatal, NIK kurang digit, pasfoto blur ditolak.
* 🟡 **Warning / Ambiguity:**
  * Background: `rgba(245, 158, 11, 0.15)` | Border: `#F59E0B` | Text: `#FCD34D`
  * Digunakan untuk: Format tanggal berpotensi terbalik, gelar masuk nama paspor.
* 🟢 **Success / Official Grounding:**
  * Background: `rgba(16, 185, 129, 0.15)` | Border: `#10B981` | Text: `#6EE7B7`
  * Digunakan untuk: Kolom valid, juknis resmi terverifikasi Meta Vector Store.

### 2.3 Evidence Badges
* 🟢 **Official:** `bg-emerald-950/80 text-emerald-300 border-emerald-500/40` (Kutipan bab & halaman juknis sah).
* 🔵 **Curated:** `bg-blue-950/80 text-blue-300 border-blue-500/40` (Validasi terverifikasi di cache Savvy).
* 🟡 **AI Guidance:** `bg-amber-950/80 text-amber-300 border-amber-500/40` (Saran AI berbasis DOM, confidence < 0.6 sarankan konfirmasi).

---

## 3. Tipografi

* **Font Utama UI:** Inter / System Font stack (`font-sans`) untuk keterbacaan tinggi pada teks kecil (12–14px).
* **Font Aksesibilitas Khusus:** **OpenDyslexic** (dapat diaktifkan secara opsional di Accessibility HUB untuk pengguna dengan disleksia).
* **Skala Tipografi:**
  * Headings (H1/H2): `18px – 20px`, Font-weight: `600 (Semibold)`
  * Subheadings / Field Titles: `14px – 15px`, Font-weight: `600 (Semibold)`
  * Body Text: `13px – 14px`, Line-height: `1.5`
  * Caption & Badge: `11px – 12px`, Font-weight: `500 (Medium)`

---

## 4. Komponen Kunci Antarmuka

### 4.1 Beacon Spotlight & Animated Virtual Cursor (Closed Shadow DOM)
* **Overlay Layer:** Layar web meredup halus (`background: rgba(0, 0, 0, 0.55)` dengan transisi `opacity 250ms ease-out`).
* **Hole Punch Cutout:** Kolom aktif diberi sorotan jernih dengan border spotlight bercahaya (`box-shadow: 0 0 0 9999px rgba(0,0,0,0.55), 0 0 15px #3B82F6`).
* **Animated Virtual Cursor:** Kursor semu visual berbentuk titik cahaya halus meluncur mengarahkan pandangan mata ke input berikutnya saat pengguna menekan `Tab` / `Enter` (tanpa mengambil alih mouse fisik).

### 4.2 Kartu Panduan 4-Elemen (Field Coach Card)
Setiap field aktif menampilkan kartu terstruktur:
1. **Arti Istilah (*Meaning*):** Penjelasan bahasa manusia biasa.
2. **Cara Mengisi (*How to Fill*):** Langkah teknis yang sah.
3. **Contoh Valid (*Example Valid Value*):** Nilai nyata yang benar (bukan placeholder acak).
4. **Jebakan Umum (*Common Pitfalls*):** Peringatan kesalahan fatal yang sering menggugurkan berkas.

### 4.3 Lipsync Avatar Interaktif (Voicebot Visualizer)
* Berupa SVG minimalis dinamis di Side Panel dengan 3 status:
  * 🎧 **Listening (Mendengarkan):** Animasi gelombang audio bergetar lembut merespons VAD mikrofon.
  * 💡 **Thinking (Berpikir):** Cincin berputar halus dengan efek gradien biru-cyan.
  * 🗣️ **Speaking (Berbicara):** Viseme SVG bibir/mulut bergerak sinkron saat audio ElevenLabs / Web Speech API berbunyi.

### 4.4 Accessibility HUB (Bilah Alat Aksesibilitas)
* **ADHD Reading Ruler:** Strip horizontal semi-transparan mengikuti posisi kursor vertikal untuk memfokuskan pembacaan baris demi baris pada teks rapat.
* **Dyslexic Mode Toggle:** Mengubah seluruh tipografi ekstensi ke font *OpenDyslexic*.
* **High Contrast Mode:** Memaksimalkan kontras teks WCAG AAA (hitam pekat `#000` & putih murni `#FFF` bergaris tegas).

---

## 5. Responsivitas & Isolasi CSS

* **Side Panel Host:** Terisolasi penuh di dalam konteks ekstensi browser (`chrome-extension://`).
* **In-Page Injections:** Seluruh tooltip, spotlight, dan virtual cursor dibungkus dalam `div#savvy-root` dengan mode `{ mode: 'closed' }` pada Shadow Root untuk mencegah kebocoran CSS ke portal target maupun sebaliknya.
