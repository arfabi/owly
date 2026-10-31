# Savvy.AI — Arsitektur & Spesifikasi Teknis: Pre-Submit Form Auditor
**Dokumen Desain Sistem Form Auditor: Pemisahan Validasi Deterministik, Client-Side Vault Privacy, dan Meta Muse Spark Open Reasoning**

---

## 1. Filosofi & Konsep Inti: "Audit Buta Sumber" (*Source-Agnostic*)

Fitur **Audit Form** pada Savvy.AI dirancang dengan prinsip **Source-Agnostic (Buta Sumber)**:
Sistem tidak mempermasalahkan bagaimana formulir tersebut terisi—apakah diketik manual dengan jari pengguna satu per satu, atau diisi secara instan menggunakan tombol **1-Click AutoFill**. 

Yang diaudit adalah **kondisi riil (*ground truth*) nilai yang saat ini tertulis di formulir web aktif**, lalu diuji secara komprehensif tanpa sistem gerbang buntu (*non-blocking accumulator*) agar seluruh potensi kesalahan terdeteksi sekaligus dalam satu kali putaran audit.

---

## 2. Pemisahan Arsitektur: Deterministik vs AI Agentic

Untuk menjamin **kecepatan instan (<10ms), nol biaya komputasi API untuk hal sepele, dan keakuratan matematis 100% tanpa halusinasi**, sistem membagi beban kerja secara tegas:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CHROME EXTENSION (CONTENT SCRIPT)                               │
│  Mengekstrak: 1. Current Values  2. DOM Constraints  3. Surrounding Text Instructions │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
┌───────────────────────────────────────┐     ┌──────────────────────────────────────────┐
│   CLIENT-SIDE DETERMINISTIC ENGINE    │     │      META MUSE SPARK OPEN AGENT          │
│   (TypeScript / Regex / Math <5ms)    │     │      (High-Reasoning & Ambiguity Buster) │
│                                       │     │                                          │
│ 1. HTML DOM Constraints:              │     │ 1. Scattered Page Context:               │
│    • Required & Asterisk (*) check    │     │    • Catatan kaki & sidebar halaman      │
│    • minLength / maxLength check      │     │    • Aturan bersyarat (afirmasi vs reg)  │
│    • Native pattern & placeholder     │     │                                          │
│                                       │     │ 2. Complex Logic & Contradiction:        │
│ 2. Standar Baku Nasional Indonesia:   │     │    • Jalur beasiswa vs berkas lampiran   │
│    • NIK 16-digit & Kode Provinsi     │     │    • Kontradiksi narasi kualitatif       │
│    • Rumus NIK Wanita (Tgl + 40)      │     │                                          │
│    • No HP (08 / +62, 10–13 digit)    │     │ 3. Human-Centric Explainer:              │
│    • Email RFC 5322 regex             │     │    • Rekomendasi perbaikan humanis       │
│    • Format Paspor ICAO (1H + 7D)     │     │    • Narasi mitigasi diskualifikasi      │
│                                       │     └────────────────────┬─────────────────────┘
│ 3. Zero-Knowledge Vault Reconciler:   │                          │
│    • Fuzzy Levenshtein Typo Catcher   │                          │
│    • 100% Berjalan Lokal di Browser   │                          │
│    • Ciphertext & Data Vault TIDAK    │                          │
│      pernah dikirim ke server/LLM     │                          │
└───────────────────┬───────────────────┘                          │
                    │                                              │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   UNIFIED TRAFFIC LIGHT REPORT (SIDEPANEL UI)                          │
│                   [ ❌ WAJIB ]  [ ❌ FORMAT ]  [ ⚠️ SUMBER ]  [ ❌ BERKAS ]            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Ekstraksi Sisi Klien: Ekstensi sebagai "Mata" (*Visual & DOM Scraper*)

Sebelum audit dijalankan, `content script` mengekstrak struktur input beserta seluruh aturan dan instruksi halaman:

```typescript
// Kontrak Data: Ekstraksi Struktur & Nilai Form Aktif
export interface ScrapedFormField {
  fieldId: string;
  name: string;
  label: string;
  currentValue: string;        // Nilai riil di form saat ini (manual / autofill)
  surroundingContext: string;  // Contoh teks di dekat label: "(Contoh: 08123456789)", "(Format: DD/MM/YYYY)"
  rules: {
    isRequired: boolean;       // Dari atribut required, aria-required, atau deteksi tanda bintang (*)
    placeholder?: string;      // Contoh: "16 digit NIK"
    pattern?: string;          // Regex bawaan website
    minLength?: number;
    maxLength?: number;
    type: string;              // text, email, tel, date, file, select, textarea
    inputMaskDetected?: string;// Cth: "9999-9999-9999-9999"
    accept?: string;           // Khusus upload: ".pdf,.jpg,.jpeg"
  };
}

export interface PageUploadContext {
  pageWideFileInstructions: string[]; // Teks di sidebar/footer: "Maksimal file 500 KB, format PDF"
  attachedFilesMetadata: {
    fieldName: string;
    fileName: string;
    fileSizeKb: number;
    fileExtension: string;
  }[];
}
```

---

## 4. Rincian 4 Lapisan Validasi Tanpa Gerbang Buntu (*Non-Blocking Accumulator*)

Sistem tidak menghentikan evaluasi hanya karena sebuah kolom gagal di Layer 1. Jika NIK hanya diisi 15 digit, sistem **tetap melaporkan kekurangan digit DAN tetap memvalidasi digit tanggal lahir yang ada**, sehingga pengguna mendapatkan seluruh daftar perbaikan secara lengkap dalam satu kali klik.

### Layer 1: Aturan Bawaan Form (HTML & DOM Constraints)
*Dieksekusi secara deterministik di sisi klien (<2ms).*
- **Deteksi Asterisk (`*`) & `required`**: Memastikan kolom tidak dibiarkan kosong (`value.trim() === ""`).
- **Batas Panjang Karakter**: Memvalidasi `minLength` dan `maxLength`.
- **Placeholder & Input Mask**: Memastikan pengisian sesuai pola contoh (misal: jumlah digit).

### Layer 2: Format Baku Standar Indonesia & Nalar Silang
*Dieksekusi oleh kombinasi deterministik engine dan reasoning agent.*

1. **Aturan Standar NIK Kependudukan (Kemendagri RI)**:
   - Harus tepat 16 digit numerik.
   - 2 digit pertama adalah **Kode Provinsi Resmi** (rentang 11 s/d 94, misal: 31 DKI Jakarta, 32 Jawa Barat, 33 Jawa Tengah).
   - **Algoritma Tanggal Lahir & Gender**:
     - Digit ke-7 dan 8 adalah **Hari Lahir**:
       - **Laki-laki**: `01` s/d `31`.
       - **Perempuan**: `Tanggal Lahir + 40` (rentang `41` s/d `71`).  
         *Contoh*: Pemohon perempuan lahir tanggal 17 Agustus 1995 ➔ Digit 7–12 NIK adalah `570895` (`57 = 17 + 40`).
     - Digit ke-9 dan 10 adalah **Bulan Lahir** (`01` s/d `12`).
     - Digit ke-11 dan 12 adalah **2 Digit Terakhir Tahun Lahir** (misal: `95` untuk 1995).
2. **Aturan Standar Nomor Handphone Indonesia**:
   - Harus diawali kode negara `+62` atau prefix domestik `08`.
   - Panjang total nomor: 10 s/d 13 digit numerik.
3. **Aturan Standar Email**:
   - Sintaks RFC 5322: `^[^\s@]+@[^\s@]+\.[^\s@]+$` (memastikan ada domain dan TLD valid).
4. **Aturan Standar Dokumen Paspor (ICAO 9303)**:
   - 1 huruf kapital diikuti 7 atau 8 digit angka numerik (contoh: `A1234567` atau `C1234567`).
5. **Nalar Silang Antar-Kolom (*Cross-Field Consistency*)**:
   - Membedah digit NIK (hari, bulan, tahun, dan jenis kelamin) vs kolom *Tanggal Lahir* dan *Jenis Kelamin* pada form.
   - Memeriksa tanggal kedaluwarsa paspor vs tanggal rencana keberangkatan (minimal aktif 6 bulan).

### Layer 3: Penyelarasan Sumber Data (*Client-Side Vault Reconciler*)
*Dieksekusi 100% lokal di browser pengguna (Zero-Knowledge Privacy).*
- **Jaminan Privasi Penuh**:
  Data plaintext profil Vault (nama, NIK, alamat) **TIDAK PERNAH dikirim ke server backend atau model AI**.
- **Mekanisme Kerja**:
  - Ekstensi membaca nilai form di tab aktif dan membandingkannya secara lokal dengan in-memory decrypted Vault menggunakan algoritma kemiripan teks (*Levenshtein Distance*).
  - *Deteksi Typo*: Jika di form tertulis `"Bima Arya"` dan di Vault tersimpan `"Bima Aryo"` (similarity 92%), ekstensi secara lokal menyematkan badge peringatan:
    `⚠️ [SUMBER] Nama di form "Bima Arya" berbeda dengan dokumen Vault "Bima Aryo"`.
  - Menyediakan tombol 1-klik lokal: `[ Ganti dengan Data Vault ]`.

### Layer 4: Berkas & Instruksi Halaman Tersebar (*Page-Wide Upload Inspector*)
*Dieksekusi oleh Meta Muse Spark Open untuk memahami instruksi natural language.*
- Membaca catatan kaki, teks petunjuk di sidebar, atau teks abu-abu di bawah tombol upload.
- Memvalidasi metadata berkas yang dilampirkan: ukuran file (KB/MB) dan format ekstensi (`.pdf`, `.jpg`, `.png`).

---

## 5. Spesifikasi Custom Tools (Function Calling)

Daftar *tools* yang didaftarkan ke model **Meta Muse Spark Open** via Baseten (`meta-models/muse-spark-open-1026`):

### 1. `crosscheck_field_consistency`
*Membedah digit NIK (termasuk rumus +40 wanita) dan mencocokkannya dengan kolom form.*
```json
{
  "type": "function",
  "function": {
    "name": "crosscheck_field_consistency",
    "description": "Melakukan pemeriksaan konsistensi nalar silang antara NIK dengan tanggal lahir dan jenis kelamin form (menerapkan rumus Dukcapil: tanggal wanita ditambah 40).",
    "parameters": {
      "type": "object",
      "properties": {
        "nik_value": { "type": "string", "description": "16 digit Nomor Induk Kependudukan" },
        "form_birth_date": { "type": "string", "description": "Format DD/MM/YYYY atau YYYY-MM-DD" },
        "form_gender": { "type": "string", "enum": ["LAKI-LAKI", "PEREMPUAN"], "description": "Pilihan jenis kelamin di form" }
      },
      "required": ["nik_value", "form_birth_date"]
    }
  }
}
```

### 2. `audit_page_wide_file_constraints`
*Mengevaluasi berkas yang dilampirkan terhadap teks instruksi halaman yang ambigu/tersebar.*
```json
{
  "type": "function",
  "function": {
    "name": "audit_page_wide_file_constraints",
    "description": "Mengevaluasi berkas upload terhadap syarat format dan batas ukuran file yang ditemukan di seluruh instruksi halaman web (sidebar, footer, catatan form).",
    "parameters": {
      "type": "object",
      "properties": {
        "attached_file_name": { "type": "string" },
        "attached_file_size_kb": { "type": "number" },
        "attached_file_extension": { "type": "string" },
        "page_instructions": { 
          "type": "array", 
          "items": { "type": "string" },
          "description": "Potongan teks instruksi halaman terkait dokumen"
        }
      },
      "required": ["attached_file_name", "attached_file_size_kb", "attached_file_extension"]
    }
  }
}
```

### 3. `evaluate_scattered_regulations`
*Menganalisis teks instruksi bersyarat di halaman (misal: syarat IPK khusus afirmasi vs reguler).*
```json
{
  "type": "function",
  "function": {
    "name": "evaluate_scattered_regulations",
    "description": "Menganalisis apakah nilai isian pengguna melanggar aturan birokrasi bersyarat yang tertera pada catatan halaman formulir.",
    "parameters": {
      "type": "object",
      "properties": {
        "selected_category": { "type": "string", "description": "Jalur pendaftaran yang dipilih pendaftar" },
        "applicant_value": { "type": "string", "description": "Nilai isian pendaftar (IPK, Usia, dll)" },
        "context_notes": { "type": "string", "description": "Catatan teks aturan di halaman web" }
      },
      "required": ["selected_category", "applicant_value", "context_notes"]
    }
  }
}
```

---

## 6. Skenario Khusus: Bagaimana Jika User Belum Upload Dokumen ke Vault?

Jika pengguna **belum pernah mengunggah dokumen apa pun ke Vault**, audit **tetap berjalan 100% tanpa hambatan** (*Graceful Degradation*):

1. **Layer 1, Layer 2, dan Layer 4 Tetap Aktif Penuh**:
   - Seluruh pengecekan kolom kosong bertanda `*`, format nomor HP, rumus NIK wanita/pria, dan batasan ukuran berkas tetap berjalan lengkap.
2. **Layer 3 Bertransformasi Menjadi *Internal Self-Consistency Check***:
   - Karena tidak ada KTP di Vault, sistem memeriksa konsistensi matematis di dalam form itu sendiri:
     - Jika pemohon memilih gender `PEREMPUAN` dan tanggal lahir `17-08-1995`, tetapi NIK tertulis `3273011708950001` (digit 7-8 adalah `17`, bukan `57`), sistem **langsung mendeteksi ketidakcocokan gender/tanggal lahir**, murni dari bedah matematis NIK tanpa butuh file KTP!
3. **Kartu Edukasi Ramah di UI**:
   - Menampilkan notifikasi informatif biru (*Tips Privasi*):  
     `💡 [TIPS PRIVASI] Vault Anda belum terisi dokumen KTP. Fitur pencocokan salah ketik (typo guard) nama otomatis dinonaktifkan.`
4. **Fitur "Reverse Onboarding" (Simpan Form ke Vault)**:
   - Jika formulir dinyatakan lolos audit dan berstatus hijau, muncul tombol ajakan cerdas:  
     `[ 🔐 Simpan Data Ini ke Vault Pribadi ]`  
     Pengguna dapat menyimpan data hasil ketikan tersebut ke Vault terenkripsi mereka agar di masa depan dapat langsung menggunakan 1-Click AutoFill.

---

## 7. Desain Tampilan Hasil Akhir di Ekstensi ([AuditorTab.tsx](file:///d:/webdev/laragon/www/savvy/extension/src/components/AuditorTab.tsx))

```
┌─────────────────────────────────────────────────────────────┐
│ 🛡️ Audit Form Savvy — 3 Masalah Ditemukan (Skor: 65/100)    │
│ [ 2 Fatal Merah ]   [ 1 Peringatan Kuning ]   [ 12 Lolos ]  │
└─────────────────────────────────────────────────────────────┘

❌ [WAJIB] Kolom NIK Belum Diisi
   • Status: Wajib diisi (terdapat tanda asterik *)
   • Panduan: Masukkan 16 digit sesuai e-KTP
   [ 👉 Sorot Kolom di Web ]

❌ [FORMAT] Nomor Handphone Tidak Standar
   • Nilai saat ini: "08123"
   • Aturan form: Minimal 10 digit
   • Standar baku: Format nomor Indonesia harus 10-13 digit (08xxx)
   [ 👉 Sorot Kolom di Web ]

⚠️ [SUMBER] Perbedaan Nama dengan Dokumen Vault
   • Nilai di Form : "Bima Arya"
   • Nilai di Vault: "Bima Aryo" (KTP Republik Indonesia)
   • Analisis: Terdeteksi potensi salah ketik (typo 1 karakter)
   [ ⚡ Pakai Data Vault: "Bima Aryo" ]   [ Abaikan ]

❌ [BERKAS] Ukuran Berkas Melebihi Batas Halaman
   • Berkas terunggah: pasfoto.png (820 KB)
   • Catatan di halaman: "Maksimal 500 KB, format PDF atau JPG"
   [ 📷 Ganti Berkas ]
```

---

## 8. Roadmap Implementasi Teknis

1. **Content Script (`content.ts`)**:
   - Mengimplementasikan `extractFormAuditSnapshot()` untuk mengambil seluruh nilai input riil, aturan DOM, asterisk `*`, placeholder, dan instruksi teks halaman.
2. **Client-Side Deterministic & Vault Reconciler (`extension/src/lib/audit/clientAuditor.ts`)**:
   - Menjalankan Layer 1 (DOM constraints), Layer 2 (deterministik NIK, HP, Email, Paspor), dan Layer 3 (Levenshtein Vault matching secara lokal tanpa kirim plaintext ke server).
3. **Backend Agentic Endpoint (`/api/form/audit`)**:
   - Menjalankan model Meta Muse Spark Open via Baseten dengan tool `crosscheck_field_consistency`, `audit_page_wide_file_constraints`, dan `evaluate_scattered_regulations` untuk menelaah instruksi ambigu.
4. **Sidepanel UI (`AuditorTab.tsx`)**:
   - Menggabungkan laporan deterministik lokal + hasil analisa AI ke dalam kartu Traffic Light interaktif yang terhubung langsung dengan beacon spotlight di formulir web.
