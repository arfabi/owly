# Savvy.AI — Rencana Accessibility Hub (14 Tool)
**Satu sistem, dua pintu masuk: klik manual dan perintah bahasa natural (LLM Function Calling)**

---

## 0. Catatan Penting Sebelum Membaca

Dari screenshot, baru **6 tool** yang terlihat jelas:

| # | Tool | Tipe | Status |
|---|------|------|--------|
| 1 | Reading Spotlight | Toggle On/Off | Terkonfirmasi |
| 2 | Text to Speech (TTS) | Toggle On/Off | Terkonfirmasi |
| 3 | Contrast Mode | Pilihan mode (Normal, ...) | Terkonfirmasi (opsi mode = usulan) |
| 4 | Highlight Links | Toggle On/Off | Terkonfirmasi |
| 5 | Bigger Text Size | Level (Normal, +25% ... +100%) | Terkonfirmasi |
| 6 | Text Spacing | Level (Normal, +25% ... +100%) | Terkonfirmasi |

Sisa **8 tool** di dokumen ini adalah **usulan pengisi** (ditandai 🔶). Ganti sesuai tool aslimu; arsitektur tidak berubah karena semua tool didaftarkan lewat satu registry.

---

## 1. Tujuan & Prinsip Desain

1. **Satu sumber kebenaran.** Klik di UI dan perintah LLM memanggil fungsi yang sama dan menulis ke state yang sama.
2. **Deterministik.** Tool bersifat *set state* (idempoten), bukan *toggle*. Memanggil dua kali memberi hasil yang sama.
3. **LLM hanya menerjemahkan niat.** Penerapan, validasi, dan batas aman semuanya kode biasa.
4. **Selalu bisa diurungkan.** Setiap perubahan punya tombol **Urungkan** dan **Reset**.
5. **Hemat latensi.** Perintah jelas ("perbesar teks") dijalankan tanpa LLM; LLM dipakai untuk keluhan dan kalimat ambigu.
6. **Hub itu sendiri harus aksesibel.** Navigasi keyboard, label ARIA, dan target sentuh ≥ 44px.

---

## 2. Arsitektur

```
┌─────────────────────┐        ┌──────────────────────────┐
│  UI Klik (HUB)      │        │  Chat / Suara (LLM)      │
│  toggle, segmented  │        │  "tulisan kecil banget"  │
└─────────┬───────────┘        └────────────┬─────────────┘
          │ dispatch(action)                │ Intent Router
          │                                 │  ├─ Fast path (kata kunci) ─┐
          │                                 │  └─ LLM Function Calling ───┤
          │                                 ▼                             │
          │                    POST /api/a11y/command                     │
          │                    (kembalikan tool_calls)                    │
          │                                 │                             │
          └─────────────────┬───────────────┴─────────────────────────────┘
                            ▼
              ┌───────────────────────────────┐
              │  ACTION DISPATCHER (client)   │
              │  1. validasi vs FEATURE_REGISTRY │
              │  2. reducer + resolveState()  │
              │  3. simpan snapshot (undo)    │
              └──────────────┬────────────────┘
                             ▼
              ┌───────────────────────────────┐
              │ chrome.storage (AccessibilityState) │ ◄── sumber kebenaran
              └──────────────┬────────────────┘
                 onChanged   │
        ┌────────────────────┴───────────────────┐
        ▼                                        ▼
┌──────────────────┐                  ┌───────────────────────┐
│ Sidepanel UI     │                  │ Content Script        │
│ (render ulang)   │                  │ (terapkan CSS/DOM/TTS)│
└──────────────────┘                  └───────────────────────┘
```

**Poin kunci:** UI tidak mengubah halaman langsung. UI hanya `dispatch`, lalu state berubah, lalu content script menerapkan. Dengan begitu, hasil klik dan hasil LLM pasti identik.

---

## 3. Katalog 14 Tool

### 3.1 Tipe nilai

| Tipe | Nilai valid | Kontrol UI |
|------|-------------|-----------|
| `toggle` | `on`, `off` | Switch / pill On-Off |
| `level` | `normal`, `plus25`, `plus50`, `plus75`, `plus100` | Segmented control 5 langkah |
| `enum` | daftar mode tetap | Segmented / dropdown |

### 3.2 Daftar lengkap

| # | `feature` (ID) | Nama di UI | Tipe | Nilai | Default | Asal |
|---|---|---|---|---|---|---|
| 1 | `reading_spotlight` | Reading Spotlight | toggle | on/off | off | ✅ |
| 2 | `tts` | Text to Speech | toggle | on/off (+ `rate` opsional) | off | ✅ |
| 3 | `contrast_mode` | Contrast Mode | enum | normal, high, dark, yellow_black | normal | ✅ (opsi = usulan) |
| 4 | `highlight_links` | Highlight Links | toggle | on/off | off | ✅ |
| 5 | `text_size` | Bigger Text Size | level | normal, +25 … +100 | normal | ✅ |
| 6 | `text_spacing` | Text Spacing | level | normal, +25 … +100 | normal | ✅ |
| 7 | `line_height` | Line Height | level | normal, +25 … +100 | normal | 🔶 |
| 8 | `dyslexia_font` | Dyslexia Font | toggle | on/off | off | 🔶 |
| 9 | `big_cursor` | Big Cursor | toggle | on/off | off | 🔶 |
| 10 | `stop_animations` | Stop Animations | toggle | on/off | off | 🔶 |
| 11 | `hide_images` | Hide Images | toggle | on/off | off | 🔶 |
| 12 | `focus_mode` | Focus Mode (sembunyikan pengganggu) | toggle | on/off | off | 🔶 |
| 13 | `reading_ruler` | Reading Ruler | toggle | on/off | off | 🔶 |
| 14 | `color_filter` | Color Filter | enum | normal, grayscale, protanopia, deuteranopia, tritanopia | normal | 🔶 |

Komposisi: 9 toggle, 3 level, 2 enum.

### 3.3 Pemetaan level ke nilai nyata (deterministik)

| Level | `text_size` (skala) | `text_spacing` (letter-spacing) | `line_height` (kali) |
|-------|------|------|------|
| normal | 1.00 | 0 | bawaan situs |
| plus25 | 1.25 | 0.03em | 1.5 |
| plus50 | 1.50 | 0.06em | 1.65 |
| plus75 | 1.75 | 0.09em | 1.8 |
| plus100 | 2.00 | 0.12em | 2.0 |

`plus100` pada Text Spacing sengaja diset `0.12em`, sesuai batas WCAG 1.4.12.

---

## 4. Registry: Satu Definisi untuk UI dan LLM

Semua tool didefinisikan **sekali**. Dari registry ini dibangkitkan (a) kartu UI, (b) validasi, dan (c) skema function calling. Menambah tool ke-15 cukup menambah satu entri.

```ts
// shared/a11y/registry.ts
export type Level = "normal" | "plus25" | "plus50" | "plus75" | "plus100";
export const LEVELS: Level[] = ["normal", "plus25", "plus50", "plus75", "plus100"];

type FeatureDef =
  | { id: string; label: string; kind: "toggle"; default: "off"; aliases: string[] }
  | { id: string; label: string; kind: "level";  default: "normal"; aliases: string[] }
  | { id: string; label: string; kind: "enum";   options: string[]; default: string; aliases: string[] };

export const FEATURES: FeatureDef[] = [
  { id: "reading_spotlight", label: "Reading Spotlight", kind: "toggle", default: "off",
    aliases: ["spotlight", "sorot baris", "fokus baca"] },
  { id: "tts", label: "Text to Speech", kind: "toggle", default: "off",
    aliases: ["bacakan", "suara", "dengarkan", "baca keras"] },
  { id: "contrast_mode", label: "Contrast Mode", kind: "enum",
    options: ["normal", "high", "dark", "yellow_black"], default: "normal",
    aliases: ["kontras", "gelap", "dark mode", "terlalu terang"] },
  { id: "highlight_links", label: "Highlight Links", kind: "toggle", default: "off",
    aliases: ["tautan", "link", "sorot link"] },
  { id: "text_size", label: "Bigger Text Size", kind: "level", default: "normal",
    aliases: ["teks kecil", "huruf kecil", "perbesar", "tulisan kecil", "ukuran huruf"] },
  { id: "text_spacing", label: "Text Spacing", kind: "level", default: "normal",
    aliases: ["jarak huruf", "huruf rapat", "huruf menumpuk"] },
  // 🔶 usulan
  { id: "line_height", label: "Line Height", kind: "level", default: "normal",
    aliases: ["jarak baris", "baris rapat"] },
  { id: "dyslexia_font", label: "Dyslexia Font", kind: "toggle", default: "off",
    aliases: ["disleksia", "huruf tertukar", "font disleksia"] },
  { id: "big_cursor", label: "Big Cursor", kind: "toggle", default: "off",
    aliases: ["kursor", "pointer besar", "mouse kecil"] },
  { id: "stop_animations", label: "Stop Animations", kind: "toggle", default: "off",
    aliases: ["animasi", "bergerak", "berkedip", "mengganggu gerakan"] },
  { id: "hide_images", label: "Hide Images", kind: "toggle", default: "off",
    aliases: ["sembunyikan gambar", "tanpa gambar"] },
  { id: "focus_mode", label: "Focus Mode", kind: "toggle", default: "off",
    aliases: ["susah fokus", "terlalu ramai", "iklan mengganggu", "sembunyikan pengganggu"] },
  { id: "reading_ruler", label: "Reading Ruler", kind: "toggle", default: "off",
    aliases: ["penggaris baca", "garis baca", "tersesat baris"] },
  { id: "color_filter", label: "Color Filter", kind: "enum",
    options: ["normal", "grayscale", "protanopia", "deuteranopia", "tritanopia"], default: "normal",
    aliases: ["buta warna", "filter warna", "hitam putih"] },
];
```

### State

```ts
export interface AccessibilityState {
  version: 1;
  features: Record<string, string>;   // id -> nilai ("on"|"off"|Level|enum option)
  ttsRate: number;                    // 0.75 | 1 | 1.25 | 1.5
  activeProfile: string | null;
  updatedAt: number;
}
```

---

## 5. Kontrak Aksi (Dispatcher)

Hanya ada **satu pintu** perubahan state:

```ts
export type A11yAction =
  | { type: "SET";     feature: string; value: string; source: "ui" | "llm" | "voice" | "profile" | "site-memory" }
  | { type: "STEP";    feature: string; direction: "increase" | "decrease"; source: Source }
  | { type: "PROFILE"; profile: ProfileId; source: Source }
  | { type: "RESET";   scope: "all" | string; source: Source }
  | { type: "UNDO";    source: Source };

export interface ActionResult {
  ok: boolean;
  state: AccessibilityState;          // selalu kembalikan state akhir
  changes: { feature: string; from: string; to: string }[];
  error?: { code: "UNKNOWN_FEATURE" | "INVALID_VALUE" | "AT_LIMIT"; message: string; allowed?: string[] };
}
```

**Urutan di dispatcher:**
1. Validasi `feature` dan `value` terhadap `FEATURES`. Jika salah, kembalikan `error` beserta `allowed` agar LLM bisa memperbaiki.
2. Hitung state baru (`STEP` digeser dalam `LEVELS`, dibatasi di ujung dengan `AT_LIMIT`).
3. Jalankan `resolveState()` untuk aturan konflik (bagian 8).
4. Simpan snapshot sebelumnya ke stack undo (maks 20).
5. Tulis ke `chrome.storage`; UI dan content script bereaksi lewat `onChanged`.
6. Kembalikan `ActionResult`.

---

## 6. Jalur 1 — Klik Manual

### 6.1 Perilaku kontrol

| Tipe | Kontrol | Perilaku |
|------|---------|----------|
| toggle | Kartu dengan pill On/Off | Klik berarti `SET value = on/off` (bukan toggle buta, sehingga menampilkan nilai sebenarnya) |
| level | Segmented `Normal · +25% · +50% · +75% · +100%` | Klik langsung loncat ke level. Kartu juga menyediakan tombol `−` dan `+` (`STEP`) |
| enum | Segmented atau dropdown | Klik berarti `SET` ke opsi |

> Catatan: UI saat ini menampilkan pill status ("Off", "Normal"). Pill itu tetap dipertahankan sebagai indikator, dan klik membuka kontrol level/enum secara inline di bawah kartu.

### 6.2 Tata letak HUB

```
┌─ Accessibility HUB (14 Tools) ─────────────── ✕ ┐
│ ✨ Katakan masalahmu, Savvy yang atur            │
│  [Tulisan kecil, mata cepat capek]               │
│  [Susah fokus baca]   [Bacakan halaman ini]      │
│  [ ✏️ Ketik atau 🎤 Bicara saja ........... ➤ ]  │
├──────────────────────────────────────────────────┤
│ QUICK ACCESSIBILITY PROFILES                     │
│  ADHD · Dyslexia · Low Vision · Senior           │
├──────────────────────────────────────────────────┤
│  Kartu 14 tool (grid 2 kolom)                    │
├──────────────────────────────────────────────────┤
│  [↶ Urungkan]            [Reset Semua]           │
└──────────────────────────────────────────────────┘
```

Bilah **Urungkan / Reset** dibuat *sticky* di bawah agar selalu terjangkau.

### 6.3 Umpan balik klik
- Perubahan terlihat di halaman dalam < 100 ms.
- Toast kecil: `Teks +50% · [Urungkan]`.
- Setiap kontrol mengumumkan hasil via `aria-live="polite"`.

---

## 7. Jalur 2 — LLM Function Calling

### 7.1 Kenapa hanya 6 tool, bukan 14?

Dengan 14 fungsi terpisah, model lebih sering salah memilih. Solusinya: **fungsi generik** dengan `feature` sebagai enum, dan validasi dilakukan registry. Skema dibangkitkan otomatis dari `FEATURES`.

### 7.2 Skema tool

```json
[
  {
    "type": "function",
    "function": {
      "name": "set_accessibility_feature",
      "description": "Menetapkan nilai satu fitur aksesibilitas. Idempoten. Gunakan untuk 'nyalakan', 'matikan', 'jadikan +50%', 'ubah ke mode gelap'.",
      "parameters": {
        "type": "object",
        "properties": {
          "feature": { "type": "string", "enum": ["reading_spotlight","tts","contrast_mode","highlight_links","text_size","text_spacing","line_height","dyslexia_font","big_cursor","stop_animations","hide_images","focus_mode","reading_ruler","color_filter"] },
          "value": {
            "type": "string",
            "enum": ["on","off","normal","plus25","plus50","plus75","plus100","high","dark","yellow_black","grayscale","protanopia","deuteranopia","tritanopia"],
            "description": "toggle: on/off. level: normal/plus25/plus50/plus75/plus100. enum: sesuai opsi fitur."
          }
        },
        "required": ["feature", "value"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "step_accessibility_feature",
      "description": "Menaikkan atau menurunkan satu langkah pada fitur bertipe level. Untuk 'lebih besar lagi', 'agak dikecilkan'.",
      "parameters": {
        "type": "object",
        "properties": {
          "feature": { "type": "string", "enum": ["text_size","text_spacing","line_height"] },
          "direction": { "type": "string", "enum": ["increase","decrease"] }
        },
        "required": ["feature","direction"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "apply_accessibility_profile",
      "description": "Menerapkan satu paket preset untuk kebutuhan tertentu.",
      "parameters": {
        "type": "object",
        "properties": { "profile": { "type": "string", "enum": ["adhd","dyslexia","low_vision","senior"] } },
        "required": ["profile"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_accessibility_state",
      "description": "Membaca state saat ini. Panggil dulu jika perlu tahu kondisi sebelum menyesuaikan.",
      "parameters": { "type": "object", "properties": {} }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "reset_accessibility",
      "description": "Mengembalikan satu fitur atau semuanya ke default.",
      "parameters": {
        "type": "object",
        "properties": { "scope": { "type": "string", "description": "'all' atau ID fitur" } },
        "required": ["scope"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "undo_last_change",
      "description": "Membatalkan perubahan aksesibilitas terakhir. Untuk 'kembalikan', 'tadi lebih baik', 'batalkan'.",
      "parameters": { "type": "object", "properties": {} }
    }
  }
]
```

### 7.3 Intent Router (hemat latensi)

```
Masukan pengguna
   │
   ├─ 1. Fast path (regex/alias dari registry, tanpa LLM)
   │      "perbesar teks"       → STEP text_size increase
   │      "matikan spotlight"   → SET reading_spotlight off
   │      "reset"               → RESET all
   │      "urungkan"            → UNDO
   │
   ├─ 2. Terdeteksi niat aksesibilitas tapi ambigu/keluhan
   │      → POST /api/a11y/command (LLM + tools di atas)
   │
   └─ 3. Bukan aksesibilitas → alur chat Guide biasa
```

Klasifikasi tahap 2 vs 3 cukup dengan pencocokan `aliases` ditambah kata kunci keluhan ("capek", "susah", "kecil", "silau", "pusing"). Jika ragu, kirim ke LLM dan beri tool `none` / jawaban teks biasa.

### 7.4 Endpoint

`POST /api/a11y/command`

```json
// request
{
  "utterance": "tulisannya kecil banget, mata saya cepat capek",
  "state": { "text_size": "normal", "contrast_mode": "normal", "...": "..." },
  "lang": "id"
}

// response
{
  "tool_calls": [
    { "name": "set_accessibility_feature", "arguments": { "feature": "text_size", "value": "plus50" } },
    { "name": "set_accessibility_feature", "arguments": { "feature": "contrast_mode", "value": "high" } }
  ]
}
```

- Model: `reasoning_effort` rendah. Tugasnya klasifikasi sederhana dan cepat.
- `state` dikirim bersama request, sehingga **tidak perlu round-trip** memanggil `get_accessibility_state`. Tool itu tetap ada sebagai cadangan.
- **Eksekusi di client**, karena state dan halaman ada di browser. Backend hanya menerjemahkan niat.
- **Pesan konfirmasi dibuat dari template deterministik**, bukan panggilan LLM kedua, sehingga lebih cepat dan konsisten.

### 7.5 System prompt (inti)

```
Kamu penerjemah niat aksesibilitas untuk Savvy.AI. Tugasmu HANYA memanggil tool.
Aturan:
1. Gunakan state saat ini. Jika fitur sudah di level yang diminta, jangan ulangi.
2. Keluhan, bukan perintah, dipetakan dengan tabel di bawah. Pilih nilai SEDANG dulu.
3. Pengguna meminta "lebih/lagi" → step_accessibility_feature(increase).
4. Pengguna meminta "kembalikan/batalkan" → undo_last_change.
5. Jangan menebak nilai di luar enum. Jangan mengarang fitur.
6. Jika permintaan bukan soal aksesibilitas, jawab singkat tanpa tool.
7. Maksimal 3 tool call per permintaan, kecuali profil.

Pemetaan keluhan:
- teks kecil / mata capek           → text_size plus50 (+ contrast_mode high jika "capek/silau")
- huruf rapat / menumpuk            → text_spacing plus50
- susah fokus / terlalu ramai       → focus_mode on + reading_spotlight on
- huruf tertukar / disleksia        → apply_accessibility_profile dyslexia
- terlalu terang / silau            → contrast_mode dark
- tidak bisa membaca / bacakan      → tts on
- gambar/animasi mengganggu         → stop_animations on
- buta warna                        → color_filter sesuai jenis, jika tak disebut tanya singkat
```

### 7.6 Alur contoh

```
User: "tulisannya kecil banget, mata saya cepat capek"
 → tool_calls: set text_size=plus50, set contrast_mode=high   (paralel)
 → Dispatcher menerapkan → state tersimpan → halaman berubah
 → UI: "✅ Teks +50% dan kontras tinggi diterapkan.
        [Urungkan] [Terlalu besar?] [Simpan untuk situs ini]
        Coba juga: "lebih besar lagi" atau "kembalikan seperti semula""

User: "lebih besar lagi"
 → step text_size increase (plus50 → plus75)
```

---

## 8. Aturan Konflik & Batas Aman — `resolveState()`

Satu fungsi murni; model tidak boleh menyelesaikan konflik.

| Situasi | Aturan |
|---------|--------|
| `contrast_mode` ≠ normal dan `color_filter` ≠ normal | Kontras menang untuk warna latar/teks; filter tetap diterapkan di atasnya, tampilkan peringatan kecil. |
| `hide_images` on dan `color_filter` aktif | Filter tidak berpengaruh pada gambar; tidak perlu tindakan. |
| `focus_mode` on dan `reading_spotlight` on | Boleh bersamaan (saling melengkapi). |
| `text_size` plus100 dan `text_spacing` plus100 | Boleh; tampilkan saran "layout bisa rusak, coba kurangi?" bila terdeteksi overflow horizontal. |
| `STEP` melewati ujung | Kembalikan `AT_LIMIT`; pesan: "Sudah di batas maksimum (+100%)". |
| Profil diterapkan | Menimpa fitur yang disebutkan profil saja; fitur lain dibiarkan. Tandai `activeProfile`. Jika pengguna mengubah fitur manual, `activeProfile = null`. |

### Profil (preset tetap)

```ts
export const PROFILES = {
  adhd:       { focus_mode: "on", reading_spotlight: "on", stop_animations: "on", text_spacing: "plus25" },
  dyslexia:   { dyslexia_font: "on", text_spacing: "plus50", line_height: "plus50", text_size: "plus25" },
  low_vision: { contrast_mode: "high", text_size: "plus75", highlight_links: "on", big_cursor: "on" },
  senior:     { text_size: "plus50", contrast_mode: "high", highlight_links: "on", tts: "on", big_cursor: "on" },
};
```

---

## 9. Penerapan di Content Script

Pola: **satu stylesheet yang dikontrol lewat atribut di `<html>`**, bukan menyuntik style satu per satu.

```ts
// content/a11y-applier.ts
function applyState(state: AccessibilityState) {
  const root = document.documentElement;
  for (const [id, val] of Object.entries(state.features)) {
    root.setAttribute(`data-savvy-${id}`, val);   // mis. data-savvy-text_size="plus50"
  }
  root.style.setProperty("--savvy-text-scale", SCALE[state.features.text_size]);
  // stylesheet Savvy (sekali disuntik) membaca atribut/variabel di atas
}
```

Catatan teknis per fitur:

| Fitur | Cara penerapan | Hal yang diwaspadai |
|-------|----------------|---------------------|
| `text_size` | `html { font-size }` tidak mempan di situs berbasis `px`. Gunakan skala via CSS (mis. `zoom` pada `body`) atau `chrome.tabs.setZoom`. Uji keduanya. | Layout dan elemen `position: fixed` |
| `text_spacing`, `line_height` | `* { letter-spacing; line-height !important }` | Teks di dalam elemen ikon/canvas |
| `contrast_mode`, `color_filter` | Variabel CSS dan `filter` pada `html` | Gambar ikut terfilter; jangan menumpuk dua `filter` yang menimpa |
| `highlight_links` | `a { outline; text-decoration: underline !important }` | |
| `reading_spotlight`, `reading_ruler` | Overlay `position: fixed`, `pointer-events: none`, mengikuti mouse/fokus | `z-index`, iframe |
| `tts` | `speechSynthesis` (atau TTS server), baca elemen terpilih/halaman | Hentikan saat navigasi/tutup tab |
| `focus_mode` | Sembunyikan elemen heuristik (iklan, sidebar, popup, `aria-hidden`) lewat kelas | **Jangan** menyembunyikan form/field; uji pada halaman form Juknis |
| `stop_animations` | `*, *::before, *::after { animation: none; transition: none }`, hormati `prefers-reduced-motion` | Pop-up yang bergantung pada animasi |
| `dyslexia_font` | Sisipkan `@font-face` dari paket ekstensi (bukan CDN) | Lisensi font |

- Daftarkan content script dengan `all_frames: true` agar iframe form ikut terdampak.
- Gunakan `MutationObserver` ringan untuk halaman SPA yang merender ulang.
- Pastikan overlay Savvy sendiri (spotlight, panel) **tidak** ikut terkena pembesaran/filter.

---

## 10. Memori Per Situs & Preferensi

| Fitur | Perilaku |
|-------|----------|
| **Default global** | Preferensi dari onboarding, dipakai saat situs belum punya aturan khusus. |
| **Simpan untuk situs ini** | `{ domain → state }`. Saat situs dibuka lagi, state otomatis diterapkan (`source: "site-memory"`). |
| **Privasi** | Hanya menyimpan domain dan pengaturan; seluruhnya lokal (`chrome.storage.local`). |

---

## 11. Discoverability — Agar Pengguna Tahu Bisa Mengetik

Urutan prioritas:

1. **Chip contoh di atas HUB** (diklik berarti langsung dijalankan sekaligus demonstrasi).
2. **Placeholder chat berputar**: `Coba: "tulisan terlalu kecil"` → `Coba: "bacakan halaman ini"` → `Coba: "terlalu silau"`.
3. **Konfirmasi edukatif** setelah setiap perintah (contoh kalimat lanjutan).
4. **Banner sekali tampil** (hilang setelah 3 kali atau setelah pernah dipakai).
5. **Saran kontekstual**: deteksi font < 12px, kontras buruk, atau tombol Bigger Text ditekan berulang lalu tawarkan perintah suara/teks.
6. Label **🎤 Bicara saja** di samping ikon mic.
7. Ikon aksesibilitas kanan-atas diberi **titik penanda** (dot) pada kunjungan pertama, dan tooltip: "Atur tampilan agar nyaman dibaca".

Chip memakai **bahasa keluhan pengguna**, bukan istilah teknis.

---

## 12. Integrasi dengan Fitur Savvy Lain

| Fitur Savvy | Sinergi aksesibilitas |
|-------------|----------------------|
| **Show Me** (Spotlight Field) | Spotlight/ruler otomatis berpindah ke kolom yang ditunjuk. |
| **Explain This** | Hasil penjelasan bisa dibacakan (TTS) dengan tombol 🔊. |
| **Audit Form** | Temuan error disorot; dengan profil Low Vision, sorotan memakai kontras tinggi dan garis lebih tebal. |
| **Auto Fill** | Setelah autofill, kolom yang berubah disorot sebentar agar mudah diverifikasi. |
| **Suara (mic)** | "Bacakan kolom ini" memicu `tts` dan membaca label + contoh. |

---

## 13. Pengujian

### 13.1 Golden set (tabel uji ucapan → aksi)

| Ucapan | Aksi yang diharapkan |
|--------|----------------------|
| "tulisannya kecil banget, mata saya cepat capek" | `text_size=plus50`, `contrast_mode=high` |
| "perbesar teks" | `STEP text_size increase` (fast path) |
| "lebih besar lagi" | `STEP text_size increase` |
| "terlalu besar, kecilin dikit" | `STEP text_size decrease` |
| "huruf-hurufnya menumpuk" | `text_spacing=plus50` |
| "aku susah fokus" | `focus_mode=on`, `reading_spotlight=on` |
| "bacakan halaman ini" | `tts=on` |
| "matikan semua" / "reset" | `RESET all` |
| "kembalikan seperti tadi" | `UNDO` |
| "aku lansia, tolong buat nyaman" | `PROFILE senior` |
| "cuaca hari ini?" | tanpa tool (bukan aksesibilitas) |
| "teksnya jadi 500%" | `INVALID_VALUE`; model memakai `plus100` dan memberi tahu batasnya |

Jalankan otomatis (CI) pada setiap perubahan prompt atau registry; target akurasi ≥ 95%.

### 13.2 Uji lain
- **Idempotensi:** dispatch aksi yang sama dua kali menghasilkan state identik.
- **Paritas UI vs LLM:** untuk tiap fitur, klik dan tool call menghasilkan state yang sama.
- **Undo/Reset:** 20 langkah berturut-turut dapat diurungkan.
- **Regresi halaman:** uji di 5 halaman form pemerintah (layout berat, iframe, SPA).
- **Aksesibilitas HUB:** lolos audit keyboard + pembaca layar (axe-core).

---

## 14. Roadmap

| Tahap | Isi | Keluaran |
|-------|-----|----------|
| **1. Fondasi** | `FEATURES` registry, `AccessibilityState`, dispatcher + `resolveState()`, penyimpanan, undo | Modul `shared/a11y/*` dengan unit test |
| **2. Content script** | Applier + stylesheet untuk 14 tool; uji tiap tool di halaman nyata | Semua tool berfungsi lewat `dispatch` manual |
| **3. UI klik** | Kartu tool dengan toggle/segmented, profil, bilah Urungkan/Reset, `aria-live` | HUB jalur 1 selesai |
| **4. LLM** | Bangkitkan skema dari registry, endpoint `/api/a11y/command`, Intent Router (fast path + LLM), template konfirmasi | Jalur 2 selesai |
| **5. Discoverability** | Chip contoh, placeholder berputar, banner, saran kontekstual | Pengguna tahu fitur bicara bebas |
| **6. Memori & integrasi** | Per-situs, sinergi dengan Show Me/Explain/Audit, suara | Pengalaman terpadu |
| **7. QA & rilis** | Golden set, uji regresi halaman, audit aksesibilitas | Rilis |

---

## 15. Kriteria Selesai

- [ ] Semua 14 tool dapat diatur lewat **klik** dan lewat **perintah bahasa natural**, dengan hasil identik.
- [ ] Setiap tool idempoten dan menolak nilai di luar registry dengan pesan jelas.
- [ ] "Tulisan kecil, mata capek" menghasilkan perubahan benar dalam ≤ 2 detik (fast path ≤ 300 ms).
- [ ] Setiap perubahan dapat diurungkan; Reset mengembalikan ke default.
- [ ] State bertahan setelah reload dan dapat diingat per situs.
- [ ] Golden set ≥ 95% lulus; tidak ada regresi layout parah pada halaman uji.
- [ ] HUB lolos audit keyboard dan pembaca layar.
- [ ] Pengguna baru melihat cara memakai perintah bebas tanpa membaca dokumentasi.

---

## 16. Pertanyaan Terbuka

1. Daftar final **8 tool lain** (bagian 3.2 yang bertanda 🔶).
2. Opsi sebenarnya untuk **Contrast Mode** dan apakah Text Spacing memakai 5 level yang sama.
3. Strategi pembesaran teks: CSS `zoom` atau `chrome.tabs.setZoom`? (uji di halaman form target)
4. TTS memakai Web Speech API bawaan atau layanan server (kualitas suara bahasa Indonesia)?
5. Apakah profil boleh dikustomisasi pengguna?
