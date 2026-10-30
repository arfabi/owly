# Savvy.AI: Web Search Tool & Manual Researcher - Muse Spark 1.3

_Cara memakai `web_search` (search grounding) di Baseten Inference API, dan agent Manual Researcher yang memakainya untuk mencari pedoman pengisian form. Siap untuk `docs/web_search_tool.md`._

> **Dokumen terkait:** `file_search_vector_tool.md` (RAG untuk PDF juknis resmi, termasuk tabel perbandingan file_search vs web_search vs pgvector), `multi_chain_cache.md` (Native Tool Calling (OpenAI-compatible) dan chain), `multi_agents.md` (arsitektur agent).

---

## 1. Peran `web_search`

- `web_search` adalah tool bawaan di **Native Tool Calling (OpenAI-compatible)** (bukan Chat Completions). Jawaban berbasis web terkini disertai **sitasi** (search grounding).
- Dipakai untuk: aturan terbaru 2026 yang berubah, berita, halaman penyelenggara, peraturan terkait, pedoman pengisian form yang belum ada di Vector Store.
- Aturan emas: juknis resmi publik -> `file_search`; aturan terbaru / berita -> `web_search`; KTP/KK user -> tidak masuk tool pencarian manapun (detail di `file_search_vector_tool.md` bagian 5).
- Kombinasi terbaik: `file_search` untuk juknis, `web_search` untuk update terbaru.

### 1.1 Cara memanggil

```js
tools: [{ type: 'web_search' }] // kalau butuh cari aturan terbaru
```

Dikombinasikan dengan File Search:

```js
tools: [
  { type: 'file_search', vector_store_ids: [vectorStoreId] }, // RAG resmi
  { type: 'web_search' }                                       // bisa combo untuk aturan terbaru
]
```

Pemakaian lengkap bersama `messages` (chain per user per tab) ada di `multi_chain_cache.md` bagian 4.2.

### 1.2 Aturan dalam prompt

- Tools yang boleh dipakai: `web_search` (untuk cari aturan resmi `.go.id`).
- Dilarang: menyentuh `.value` asli user, menebak NIK.
- Query hanya dari judul form, penyelenggara, dan domain. **Jangan** menyertakan data user.
- Kalau tidak yakin atau tidak ada sumber, badge = AI Guidance (bukan Official).

### 1.3 Catatan biaya dan kecepatan

- `reasoning_effort: 'low'` untuk Field Coach; `medium` untuk Manual Researcher.
- Manual Researcher dijalankan **sekali per form**, hasil di-cache (lihat `multi_chain_cache.md` bagian 6), dengan batas jumlah sumber dan timeout.

---

## 2. Manual Researcher

- **Tugas:** web grounding untuk mencari pedoman pengisian form (PDF resmi, halaman penyelenggara, peraturan terkait, video tutorial).
- **Posisi:** paralel dengan Form Analyzer; hasil di-cache per form di database. Field Coach mulai tanpa pedoman lalu beralih ke mode berpedoman begitu siap.
- **Query:** dari judul form, penyelenggara, dan domain. **Jangan** menyertakan data user.
- **Urutan sumber:** (1) halaman/PDF resmi penyelenggara (`.go.id`, domain penyelenggara), (2) FAQ/pengumuman situs yang sama, (3) peraturan yang dirujuk, (4) video resmi, (5) pihak ketiga hanya sebagai cadangan dan berlabel "tidak resmi".
- **PDF:** model menerima PDF sebagai input.
- **YouTube:** tidak ada bukti model bisa menonton URL YouTube langsung. Opsi realistis: ambil transkrip (jika tersedia dan sah) lalu beri sebagai teks. Anggap tambahan, bukan andalan.

Skema keluaran:

```json
{
  "ditemukan": true,
  "sumber": [
    {"url": "https://...", "jenis": "pdf", "resmi": true,
     "tanggal": "2026-03-01", "relevansi": "tinggi",
     "ringkasan": "Panduan pendaftaran..."}
  ],
  "panduan_per_field": [{"field": "Essay motivasi", "aturan": "Maksimal 500 kata", "sumber": 0}],
  "aturan_terstruktur": [
    {"field": "essay", "tipe": "maks_kata", "nilai": 500, "sumber": 0},
    {"tipe": "tenggat", "nilai": "2026-11-30", "sumber": 0}
  ],
  "tidak_ditemukan": ["format penilaian essay"],
  "keyakinan": "sedang"
}
```

Risiko dan mitigasi:

- **Sumber salah form atau salah tahun:** wajibkan `tanggal` dan `relevansi`.
- **Prompt injection dari halaman web:** perlakukan hasil pencarian sebagai data, validasi JSON, jangan eksekusi isi.
- **Label resmi ditentukan oleh kode** (daftar domain tepercaya), bukan oleh model.
- **Hak cipta:** ringkas dan beri tautan, jangan menyimpan salinan panjang.
- **Biaya:** sekali per form, cache, batas jumlah sumber (misalnya 5), dan timeout.
- **Hasil kosong itu sah.** Savvy.AI tetap berfungsi tanpa pedoman.
- **Ukur manfaatnya:** bandingkan Field Coach dengan dan tanpa pedoman pada 20 sampai 30 form nyata.

---

## 3. Hal yang belum diverifikasi (khusus web search)

Daftar lengkapnya ada di `multi_agents.md` bagian 16. Yang terkait dokumen ini:

- Parameter dan perilaku persis search grounding (`web_search`) di Muse Spark 1.3. Cek resep cookbook nomor 10 dan dokumentasi resmi.
- Kemampuan membaca video YouTube dan kelegalan mengambil transkrip.
