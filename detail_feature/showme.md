# Spesifikasi Arsitektur: "Show Me" (4-Level Cascading Element Finder)

Dokumen ini merinci arsitektur teknis, alur pengguna (*UX Flow*), dan strategi mitigasi latensi untuk fitur **"Show Me"** pada **Savvy.AI**.

---

## 1. Latar Belakang & Masalah

### 1.1 Masalah pada Desain Lama
* Sebelumnya, tombol **Show Me** langsung mengarahkan lampu sorot (*Beacon Spotlight*) ke elemen *form field* pertama atau aktif di halaman secara kaku.
* Padahal, kebutuhan pengguna saat menjelajah halaman web layanan publik atau portal pendaftaran sangat beragam:
  - Mencari tombol aksi penting (*"Sign Up"*, *"Login"*, *"Kirim Berkas"*, *"Cetak Kartu"*).
  - Mencari rubrik atau seksi tertentu (*"Persyaratan Khusus"*, *"Jadwal Seleksi"*, *"Tabel Biaya"*).
  - Mencari teks klausul spesifik atau tombol navigasi yang tersembunyi.

### 1.2 Analisis Latensi & Evaluasi Model (Mengapa Tidak Langsung SAM / Vision?)
* **SAM (Segment Anything Model)**:
  - Butuh *heavy image encoder* (ViT) dengan ukuran model ratusan megabita.
  - Jika dieksekusi di server/cloud: butuh *capture* screenshot layar penuh, upload gambar resolusi tinggi, inferensi GPU, dan download mask ($\approx$ **2 hingga 5 detik**).
  - SAM tidak memiliki pemahaman bahasa alami (*natural language grounding*) bawaan, sehingga butuh model tambahan untuk memetakan teks pengguna ke bounding box visual.
* **Panggilan AI Cloud Tunggal**:
  - Panggilan API ke LLM untuk setiap klik tombol menghasilkan jeda $\approx$ **1 hingga 1.5 detik**. Untuk interaksi pencarian navigasi, pengguna mengharapkan respon instan (seperti *Ctrl + F*).
* **Solusi**: Menerapkan arsitektur **4-Level Cascading Matcher** — mengutamakan eksekusi lokal di browser (**0 ms**) untuk 85% kasus umum, dan hanya memanggil AI bertingkat untuk kasus ambigu atau elemen visual murni.

---

## 2. Arsitektur 4-Level Cascading Matcher

```
[ Pengguna Mengetik: "Show me: <target>" ]
                   │
                   ▼
  ┌─────────────────────────────────────────────────────────┐
  │ LEVEL 1: Client-Side Exact & Substring Match (0 ms)    │
  │ • Mencari textContent, aria-label, placeholder, title   │
  └────────────────────────┬────────────────────────────────┘
                           │ (Jika tidak ditemukan)
                           ▼
  ┌─────────────────────────────────────────────────────────┐
  │ LEVEL 2: Client-Side Semantic Synonym Heuristics (0 ms) │
  │ • Kamus sinonim lokal (contoh: "bikin akun" -> Sign Up) │
  └────────────────────────┬────────────────────────────────┘
                           │ (Jika tidak ditemukan / ambigu)
                           ▼
  ┌─────────────────────────────────────────────────────────┐
  │ LEVEL 3: Meta Muse Spark Semantic Reasoning (~1 detik)  │
  │ • Kirim 15-20 kandidat elemen DOM teks ke Muse Spark    │
  │ • Evaluasi semantik & confidence score (0.0 - 1.0)      │
  └────────────────────────┬────────────────────────────────┘
                           │ (Jika confidence < 0.8 / tidak ada teks)
                           ▼
  ┌─────────────────────────────────────────────────────────┐
  │ LEVEL 4: Multimodal Vision Fallback (~2 - 3 detik)      │
  │ • Screenshot layar aktif -> Muse Spark Multimodal Vision│
  │ • Deteksi koordinat visual untuk ikon grafis / canvas    │
  └─────────────────────────────────────────────────────────┘
```

---

### Level 1: Client-Side Exact & Substring Match (Latensi: 0 ms)
* **Kapan Aktif:** Pengguna mengetik nama tombol atau teks yang memang tertera di layar (misal: `"login"`, `"daftar"`, `"persyaratan"`, `"unduh juknis"`).
* **Mekanisme:**
  - Content script menyisir elemen interaktif: `<button>`, `<a>`, `<input>`, `[role="button"]`, `<header>`, `<section>`, serta heading `<h1>` s.d. `<h6>`.
  - Normalisasi teks: `toLowerCase().trim()`.
  - Pencocokan terhadap `textContent`, `aria-label`, `placeholder`, `title`, dan atribut `alt`.
* **Hasil:** Jika ditemukan kecocokan persis atau substring langsung, elemen **seketika di-scroll dan disorot dalam hitungan 0 milidetik**.

---

### Level 2: Client-Side Semantic Synonym Heuristics (Latensi: 0 ms)
* **Kapan Aktif:** Pengguna menggunakan frasa sehari-hari yang berbeda dari label resmi tombol, namun termasuk dalam pola sinonim umum web.
* **Mekanisme:**
  - Kamus kamus sinonim lokal di browser (*in-memory lookup table*):
    ```typescript
    const SYNONYM_DICTIONARY: Record<string, string[]> = {
      "bikin akun": ["sign up", "signup", "register", "daftar", "registrasi", "buat akun"],
      "masuk": ["login", "sign in", "signin", "masuk"],
      "keluar": ["logout", "sign out", "keluar"],
      "unggah": ["upload", "unggah", "pilih berkas", "choose file", "browse"],
      "unduh": ["download", "unduh", "unduh berkas", "ambil file"],
      "syarat": ["persyaratan", "kriteria", "ketentuan", "eligibility", "terms"],
      "bantuan": ["help", "bantuan", "faq", "panduan", "hubungi kami", "contact"],
      "biaya": ["tarif", "harga", "biaya", "fee", "cost", "pembayaran"],
    };
    ```
  - Jika kata kunci cocok dengan grup sinonim, sistem mencari elemen yang memuat padanan katanya.
* **Hasil:** Langsung menyorot seketika (**0 ms**) tanpa konsumsi bandwidth atau kuota API.

---

### Level 3: Meta Muse Spark Open Semantic Reasoning (Latensi: $\approx 0.8 - 1.2$ detik)
* **Kapan Aktif:** Query pengguna bersifat abstrak, bernarasi panjang, atau memiliki banyak kandidat ambigu di DOM yang tidak dapat diselesaikan oleh Level 1 & Level 2.
* **Mekanisme:**
  1. Content script mengumpulkan **15–20 elemen interaktif terdekat/paling relevan** dalam struktur JSON ringkas:
     ```json
     [
       {"id": 1, "tag": "button", "text": "Ajukan Formulir Tahap 1", "role": "button"},
       {"id": 2, "tag": "a", "text": "Syarat Pendaftaran Beasiswa", "role": "link"},
       {"id": 3, "tag": "button", "text": "Draft Saya", "role": "button"}
     ]
     ```
  2. Mengirim payload teks ringkas ($\approx 150$ token) ke endpoint backend Meta Muse Spark Open.
  3. Muse Spark mengevaluasi maksud semantik pengguna dan memberikan skor keyakinan (*confidence score*):
     ```json
     {
       "matchedId": 1,
       "confidence": 0.94,
       "reason": "Pengguna bermaksud mengirim formulir pendaftaran yang sesuai dengan tombol id 1."
     }
     ```
  4. **Aturan Ambang Batas (*Threshold*):**
     - Jika `confidence >= 0.8`: Ekstensi menerima ID elemen, melakukan *smooth scroll*, dan mengaktifkan Beacon Spotlight.
     - Jika `confidence < 0.8`: Lanjut otomatis ke **Level 4**.

---

### Level 4: Multimodal Vision Fallback (Latensi: $\approx 2 - 3$ detik)
* **Kapan Aktif:**
  - Level 3 mengembalikan confidence $< 0.8$, ATAU
  - Elemen yang dicari merupakan **grafis/visual murni tanpa teks DOM** (contoh: logo vendor SVG tanpa teks, ikon panah navigasi slider, gambar banner promosi, atau elemen di dalam `<canvas>`).
* **Mekanisme:**
  1. Ekstensi memanggil `chrome.tabs.captureVisibleTab` untuk menangkap screenshot viewport saat ini.
  2. Gambar Base64 dikirim ke endpoint Vision Meta Muse Spark (`meta-models/muse-spark-open-1026`) dengan instruksi:
     *"Temukan koordinat visual tombol/ikon [target] dalam bounding box normalisasi [ymin, xmin, ymax, xmax]."*
  3. Ekstensi memproyeksikan koordinat visual tersebut ke layar dengan overlay Beacon Spotlight.

---

## 3. Desain Interaksi Pengguna (User Experience / UX Flow)

### 3.1 Pemicu Tombol "Show Me"
1. Pengguna membuka tab **Ask Savvy**.
2. Pengguna mengklik tombol **Show Me**:
   - **TIDAK langsung menembak ke field input sembarangan**.
   - Input textarea chat otomatis terisi teks awalan: `"Show me: "`.
   - Kursor otomatis diletakkan di akhir teks, siap diketik pengguna.
   - Placeholder textarea berubah interaktif:
     `"Contoh: tombol login, daftar akun, syarat beasiswa, seksi kontak..."`
3. Tersedia chip rekomendasi cepat di bawah input (opsional):
   - `Show me: Tombol Daftar`
   - `Show me: Tombol Login`
   - `Show me: Persyaratan`
   - `Show me: Panduan / Juknis`

### 3.2 Feedback Visual di Layar Halaman Web
Saat elemen ditemukan:
1. **Smooth Scroll**:
   ```javascript
   targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
   ```
2. **Beacon Spotlight (Closed Shadow DOM)**:
   - Sorotan cahaya melingkar (*Pulse Glow*) berkedip lembut di sekeliling elemen.
   - Tidak merusak layout atau CSS situs induk.
   - Otomatis memudar setelah 6 detik atau saat pengguna mengklik elemen tersebut.

### 3.3 Feedback Pesan di Chatbot Savvy
Savvy memberikan laporan ringkas di bubble chat:
* **Kasus Cepat (Level 1 & 2):**
  > *"⚡ Ditemukan! Tombol **'Sign Up Free'** telah disorot di layar."*
* **Kasus Reasoning AI (Level 3):**
  > *"🎯 Berdasarkan pencarian semantik (Keyakinan: 94%), elemen **'Ajukan Formulir Tahap 1'** telah disorot di layar."*
* **Kasus Vision (Level 4):**
  > *"👁️ Elemen visual berhasil dideteksi melalui Multimodal Vision dan ditandai di layar."*
* **Kasus Tidak Ditemukan:**
  > *"Elemen '[kata kunci]' tidak ditemukan pada tampilan layar saat ini. Coba scroll ke bagian lain atau gunakan istilah lain."*

---

## 4. Keunggulan Arsitektur Ini

| Parameter | Desain Lama | Desain SAM / Full-Vision Murni | Desain 4-Level Cascading (Baru) |
| :--- | :--- | :--- | :--- |
| **Fleksibilitas Pencarian** | Terbatas pada kolom form input | Luas (Visual) | **Sangat Luas (Tombol, Teks, Seksi, Gambar)** |
| **Kecepatan untuk Kasus Umum (85%)** | 0 ms | 2.500 – 4.000 ms (Lambat) | **0 ms (Instan di browser)** |
| **Penanganan Bahasa Abstrak** | Gagal | Butuh pipeline ganda | **Cerdas via Muse Spark Open (Level 3)** |
| **Ketepatan Koordinat (*Pixel-Perfect*)** | Pas | Sering meleset / kasar | **100% Pas (Berbasis DOM Node)** |
| **Konsumsi Kuota & Bandwidth** | 0 | Sangat Boros | **Sangat Hemat (Kirim gambar hanya jika perlu)** |
| **Privasi Pengguna (UU PDP)** | Aman | Seluruh gambar layar terkirim | **Teks DOM disanitasi, screenshot minimal** |

---

## 5. Rencana Tahapan Eksekusi (Implementation Roadmap)

1. **Fase 1: UX Action & Pre-fill Input**:
   - Modifikasi tombol `triggerShowMe()` di [AiAssistantTab.tsx](file:///d:/webdev/laragon/www/savvy/extension/src/components/AiAssistantTab.tsx) agar mengisi input chat dengan `"Show me: "` dan memfokuskan textarea.
2. **Fase 2: Client DOM Finder & Synonym Registry (Level 1 & 2)**:
   - Tambahkan fungsi `findDomElementByText(query)` di [content.ts](file:///d:/webdev/laragon/www/savvy/extension/src/content.ts).
   - Hubungkan dengan animasi `Beacon Spotlight` yang sudah ada.
3. **Fase 3: Meta Muse Spark Reasoning Endpoint (Level 3)**:
   - Buat endpoint API `/api/element/match` di backend Next.js untuk menerima daftar ringkas kandidat DOM dan mengembalikan `{ matchedId, confidence }`.
4. **Fase 4: Multimodal Vision Safety-Net (Level 4)**:
   - Integrasikan `captureVisibleTab` sebagai fallback jika response Level 3 bernilai `confidence < 0.8`.
