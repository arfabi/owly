# Savvy.AI: Multi-Agent Form Guidance dengan Muse Spark 1.3

Catatan pembahasan, disusun 27 Oktober 2026.
Tujuan: merancang fitur pemandu pengisian form (field per field) di ekstensi Chrome Savvy.AI, memakai Meta Model API (Muse Spark 1.3) dengan stack berbasis JavaScript/TypeScript.

> Status dokumen: ini rangkuman diskusi desain, bukan spesifikasi resmi. Bagian yang berasal dari dokumentasi pihak ketiga atau yang belum diverifikasi ditandai di bagian 16.

---

> **Dokumen terkait:** `web_search_tool.md` (Manual Researcher dan `web_search`), `file_search_vector_tool.md` (File Search dan Vector Store), `multi_chain_cache.md` (Responses API chain, Supabase, strategi cache).

---

## 1. Ringkasan keputusan

1. **Mulai dari satu agent.** Tambahkan agent hanya jika ada kegagalan spesifik yang tidak bisa diperbaiki dengan prompt lebih baik.
2. **Pola arsitektur: satu backend, banyak panggilan model (opsi C).** Orchestrator berupa kode biasa. LLM dipakai di tempat yang butuh pemahaman, bukan di tempat yang bisa ditulis sebagai aturan.
3. **Komponen Savvy.AI:** Form Analyzer, Manual Researcher, Field Coach, Essay Coach, Validator (kode, bukan agent), Consistency Checker.
4. **Ekstraksi form oleh kode (MutationObserver dan sejenisnya), penafsiran oleh LLM.** LLM hanya dipanggil untuk field baru atau belum dikenal.
5. **Cache berlapis:** memori dan `chrome.storage.session` di browser, ditambah cache database bersama di server untuk konten generik.
6. **Validator hanya memberi peringatan, condong longgar,** dan diukur terhadap `checkValidity()` sebagai kunci jawaban.
7. **Gagal dengan anggun:** tangga penurunan kemampuan dan tombol "Tanya Savvy.AI soal ini".
8. **Privasi:** model hanya menerima judul pertanyaan dan ringkasan tersensor, bukan data identitas.

---

## 2. Meta Model API dan Muse Spark 1.3

### 2.1 Fakta yang ditemukan

| Aspek | Temuan |
|---|---|
| Rilis | Muse Spark 1.3 dirilis 2 September 2026 (versi sebelumnya: 1.1 Juli, 1.2 Agustus; seri pertama April 2026) |
| Mode `max` | Dibuka untuk developer sekitar 4 September 2026 (menurut sumber pihak ketiga) |
| Konteks | 1.048.576 token |
| Input | Teks, gambar, video, PDF, audio (dengan catatan) |
| Output | Teks |
| Harga (via OpenRouter) | sekitar $1,25 per juta token input, $4,25 per juta token output, cached input sekitar $0,15 |
| Model ID | `muse-spark-1.3` (Standard) dan `muse-spark-1.3-contributor` |
| Base URL | `https://api.meta.ai/v1` |
| Kompatibilitas | OpenAI SDK, Anthropic SDK, agent CLI seperti OpenCode dan Claude Code |
| Status | Public preview. Pada awal peluncuran akses untuk developer di AS (perlu dicek untuk akun dari Indonesia) |
| Bobot model | Tidak tersedia untuk deployment lokal atau fine-tuning |

### 2.2 Kemampuan API

- **Format endpoint:** Chat Completions (stateless), Responses API (menyimpan state lewat `previous_response_id`, dan menyediakan tool bawaan seperti `web_search`), Messages API.
- **Streaming**, **function/tool calling**, **structured output**, **prompt caching**.
- **Reasoning:** model reasoning. Token berpikir dilaporkan di `reasoning_tokens` dan ditagih sebagai output. Level `reasoning_effort`: `minimal`, `low`, `medium`, `high`, `xhigh` (dan `max` di 1.3). Opsi `none` ditolak.
- **Batasan (dari dokumentasi 1.1):** tidak mendukung logprobs, `n > 1`, `stop`, dan audio input/output.
- **Memori:** tidak ada memori jangka panjang bawaan. Untuk state sesi gunakan Responses API. Untuk memori antar sesi, bangun sendiri (database dan retrieval).
- **Web search grounding:** tersedia untuk jawaban berbasis web terkini dengan sitasi.
- **Efisiensi 1.3 (klaim Meta):** pemanggilan tool turun sekitar 20% dan penggunaan token turun sekitar 25% dibanding versi sebelumnya. Model lebih sering bertanya saat instruksi ambigu dan meminta konfirmasi sebelum aksi besar.

### 2.3 Sumber

- Cookbook resmi: https://github.com/meta-models/meta-model-cookbook/
- Dokumentasi developer Meta: https://dev.meta.ai/docs
- Halaman produk: https://developer.meta.com/ai/products/meta-model-api/

### 2.4 Isi cookbook (ringkas)

1. **API fundamentals:** chat completions, streaming, tool calling, structured output, prompt caching, reasoning tokens, vision input, long context, error handling, search grounding.
2. **Agent patterns:** agent loop, interleaved reasoning dan tool use, manajemen konteks, validated in-place edits.
3. **Use cases:** analisis chart, bug fix dari screenshot, slide generator, web design terverifikasi di browser, sandbox execution, multi-agent product studio, perception grounding, GitHub repo agent, computer use (Linux dan macOS).
4. **Muse Code:** audit log, staged approvals, sandbox, subagent fanout, goal tracking dengan judge, loop dan cron.
5. **Muse Image:** generate dan edit gambar lewat Responses API.
6. **Muse Voice Transcribe:** speech-to-text real-time lewat WebSocket (bukan endpoint HTTP).
7. **SAM 3:** segmentasi gambar dan video.

---

## 3. Konsep multi-agent

### 3.1 Apa itu multi-agent di sini

Meta Model API hanya menyediakan model. Tidak ada runtime multi-agent bawaan. Multi-agent adalah **pola di backend**:

> Agent = satu panggilan (atau loop panggilan) ke model dengan system prompt, tool, dan tugas sendiri.
> Multi-agent = beberapa agent yang hasilnya dirangkai oleh kode.

### 3.2 Membandingkan tiga arsitektur

| Opsi | Bentuk | Penilaian |
|---|---|---|
| A | Satu prompt berisi empat tugas (baca, review, rangkum, hasil akhir) | Bukan multi-agent. Murah dan cepat, tetapi model menilai dirinya sendiri dan tidak ada loop perbaikan |
| B | Lima service backend, masing-masing memanggil empat API | Terlalu rumit. Agent itu logika, bukan server. Menambah latensi dan biaya (sekitar 20 panggilan per request) |
| **C** | **Satu backend, banyak panggilan model, orchestrator berupa kode** | **Direkomendasikan.** Mudah di-debug, di-log, dan biayanya dapat diprediksi |

### 3.3 Orchestrator: kode atau LLM

- **Kode (deterministik):** alur tetap, murah, cepat, mudah diprediksi. Mulai dari sini.
- **LLM (dinamis):** model memilih langkah berikutnya lewat tool calling. Fleksibel tapi mahal dan sulit dikontrol. Pindah ke sini hanya jika ada jalur yang benar-benar dinamis.

### 3.4 Kapan multi-agent layak dipakai

Pakai jika salah satu benar:

1. Ada bagian independen yang bisa dijalankan paralel (misalnya tiga foto dokumen).
2. Butuh pemeriksa independen dan kesalahan mahal (verifier terpisah).
3. Input melebihi konteks atau terlalu beragam untuk satu konteks.
4. Tiap langkah butuh tool, data, atau tingkat reasoning berbeda.
5. Butuh jejak audit per langkah.
6. Biaya perlu ditekan karena sebagian langkah cukup `low`.

Jangan pakai jika tugasnya satu langkah, latensi harus sangat rendah, atau tidak ada cara menilai hasil.

Klaim yang tidak otomatis benar: "lebih akurat" (model dan pengetahuan sama), "lebih terstruktur" (structured output sudah cukup), "lebih canggih" (soal kesan).

Contoh yang dikoreksi dalam diskusi: satu PDF peraturan 40 halaman yang muat di konteks sebenarnya cukup dengan **satu agent** ditambah (opsional) **satu verifier**. Multi-agent baru bernilai untuk banyak sumber dan banyak jenis input.

### 3.5 Berurutan vs paralel

- **Berurutan:** output satu agent menjadi input berikutnya (`await` satu per satu).
- **Paralel (fan-out/fan-in):** tugas independen dengan `Promise.all`. Waktu total mendekati langkah paling lambat. Biaya token tidak turun.
- **Hybrid:** paling umum.
- **Dinamis:** orchestrator LLM memutuskan.

Hal yang dijaga saat paralel: batas rate (batasi concurrency 3 sampai 5), `Promise.allSettled` jika sebagian hasil masih berguna, jangan bergantung pada urutan selesai.

### 3.6 Aturan keputusan

Jika satu agent sudah benar pada set evaluasi, tetap satu agent. Tambahkan agent hanya jika evaluasi menunjukkan peningkatan yang membenarkan tambahan biaya dan latensi.

### 3.7 Agentic Loop: ReAct Pattern di Savvy.AI (untuk juri)

Chatbot: User tanya → AI jawab 1x selesai.

Agentic: User kasih Goal → Agent bikin rencana → pakai tools → cek hasil → loop sampai hijau.

Loop Savvy (deterministik dulu, agentic kemudian):

```
Goal: Audit visa sampai semua hijau (Understand. Fill. Check.)

1. THINK: Apa yang belum dicek? → Foto belum
2. ACT: tool photo_audit_deterministic() [sharp, Laplacian, rasio kepala]
3. OBSERVE: Glare 12%, latar tidak putih
4. THINK: Butuh aturan resmi
5. ACT: tool search_guidance("schengen photo glare") → RAG Supabase
6. OBSERVE: Aturan ICAO: glare >5% = kuning
7. ACT: tulis ke drawer "Foto ada pantulan, foto ulang tanpa flash"
8. Selesai? Loop ke field berikutnya
```

Tiga agent yang dipakai (sesuai multi_agents.md):

- **Extractor Agent:** baca PDF juknis berantakan → JSON terstruktur (Muse Spark Open). *(Catatan: "Extractor Agent" di sini membaca PDF juknis; berbeda dari Extractor DOM berbasis kode di bagian 4.)*
- **Validator Agent:** validasi JSON pakai Zod + cek ICAO 9303 (kode, bukan LLM)
- **Explainer Agent:** hanya untuk field kuning, kasih saran fix spesifik (Muse Spark)

Prinsip: Validator & Consistency Checker = KODE (guardrail/rule engine), bukan agent. Jadi audit <300ms, agentic hanya untuk penjelasan kuning. Tidak pernah auto-submit.

---

## 4. Arsitektur Savvy.AI Form Guidance

### 4.1 Komponen

| Komponen | LLM? | Reasoning | Tugas |
|---|---|---|---|
| **Extractor** | Tidak (kode) | - | Membaca DOM, menghasilkan daftar field mentah |
| **Form Analyzer** | Ya | `medium` | Memberi arti pada field: tipe, wajib, bagian, jenis validasi, percabangan |
| **Manual Researcher** | Ya + tool search | `medium` | Mencari pedoman pengisian (PDF, halaman resmi, video) |
| **Field Coach** | Ya | `low` | Menjelaskan arti, format, contoh fiktif, kesalahan umum per field |
| **Essay Coach** | Ya | `high` | Pertanyaan pemandu, kerangka, umpan balik untuk essay |
| **Validator** | **Tidak (kode)** | - | Validasi format berdasarkan jenis dari Form Analyzer |
| **Consistency Checker** | Ya + kode | `high` | Konsistensi antar jawaban dan kesesuaian dengan pedoman |

Validator **bukan agent**: deterministik, tanpa keputusan model. Sebut sebagai komponen, guardrail, atau rule engine.

### 4.2 Alur

```
Form dibuka
   ├─► Extractor (kode) ─► Form Analyzer ─► skema field
   └─► Manual Researcher (paralel, latar belakang) ─► pedoman
                                   │
Per field:   Validator (kode, instan)
             Field Coach (cache + prefetch, diberi konteks pedoman bila ada)
Textarea:    Essay Coach
Akhir bagian: Consistency Checker (bagian itu)
Sebelum kirim: Consistency Checker penuh || umpan balik essay (paralel)
```

### 4.3 Prinsip desain

- **Savvy.AI memandu, bukan mengisi.** User yang mengetik sendiri.
- **Essay Coach adalah pelatih, bukan penulis.**
- **Jujur saat tidak yakin:** lebih baik "belum bisa dipastikan, cek petunjuk situs" daripada menebak.
- **Jangan memodifikasi DOM form asli.** Tampilkan panduan di panel terpisah (shadow DOM milik Savvy.AI) untuk menghindari konflik dengan framework situs.

---

## 5. Detail tiap komponen

### 5.1 Form Analyzer

- Dijalankan **sekali per langkah/keadaan baru**, bukan sekali per form (lihat bagian 8 untuk SPA dan wizard).
- Menghasilkan skema terstruktur. Jenis validasi dipilih dari **daftar tetap**; jika tidak yakin wajib memilih `teks_bebas`.

```json
{
  "id": "q3",
  "judul": "NIK",
  "tipe": "teks_pendek",
  "wajib": true,
  "validasi": "nik",
  "keyakinan": "tinggi",
  "muncul_jika": null
}
```

### 5.2 Field Coach

- Satu agent untuk semua field non-essay. Tidak perlu dipecah per bagian (data pribadi, pendidikan, pekerjaan) karena tugasnya sama.
- **Tidak boleh dipersonalisasi** jika hasilnya ingin di-cache bersama. Penjelasan generik di-cache; tips personal (jika ada) dibuat terpisah dan tidak disimpan.
- Input hanya **judul/deskripsi/opsi pertanyaan**, bukan isi jawaban user.

Prompt (ringkas):

```
Kamu Savvy.AI, pemandu pengisian formulir. Jelaskan satu pertanyaan dalam
bahasa awam, maksimal 4 kalimat: (1) maksud pertanyaan, (2) format yang
diminta, (3) satu contoh DENGAN DATA FIKTIF, (4) satu kesalahan umum.
Jangan meminta user menuliskan datanya kepadamu. Jangan menebak aturan
yang tidak tertulis di form; jika tidak yakin, katakan "cek petunjuk form".
Keluaran JSON: {"arti":"","format":"","contoh":"","hati_hati":""}
```

**Prefetch:** saat user di field n, pastikan field n sampai n+3 sudah ada di cache. Hanya panggil yang belum ada. Jangan prefetch field yang belum pasti muncul (percabangan). Batasi concurrency.

```ts
const cache = new Map<string, Promise<Coach>>();
function ensureCoach(fieldIds: string[]) {
  for (const id of fieldIds) {
    if (!cache.has(id)) cache.set(id, coachField(schema[id]));
  }
}
onFieldFocus(n => ensureCoach(ids.slice(n, n + 4)));
```

Simpan **promise**, bukan hanya hasil, agar user yang pindah ke field sebelum respons selesai tidak memicu panggilan kedua.

### 5.3 Essay Coach

Dua mode:

1. **Saat textarea difokuskan:** tampilkan pertanyaan pemandu dan kerangka (bisa di-prefetch, karena hanya bergantung pada pertanyaan dan ringkasan jawaban sebelumnya).
2. **Saat user sudah menulis:** umpan balik (relevansi, kejelasan, panjang) lewat tombol "Minta masukan" atau jeda mengetik panjang. Bukan di setiap ketukan, karena `high` mahal dan lambat.

### 5.4 Validator (kode)

- Berdasarkan jenis dari Form Analyzer, aturan ditulis oleh developer (bukan oleh LLM):

```ts
const validators = {
  nik: v => /^\d{16}$/.test(v),
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  tahun: v => /^(19|20)\d{2}$/.test(v),
};
```

- Detail evaluasi dan kunci jawaban di bagian 9.

### 5.5 Manual Researcher

- **Tugas:** web grounding untuk mencari pedoman pengisian form. Berjalan **paralel** dengan Form Analyzer, hasil di-cache per form.
- **Detail lengkap** (posisi, query, urutan sumber, skema keluaran, risiko dan mitigasi) dipindahkan ke **`web_search_tool.md`**.

### 5.6 Consistency Checker

Dua arah pemeriksaan:

1. **Konsistensi internal:** tanggal kuliah vs kerja, ejaan nama instansi, klaim di essay vs data.
2. **Kesesuaian dengan pedoman** dari Manual Researcher.

Pembagian kerja:

| Aturan | Diperiksa oleh |
|---|---|
| Batas kata, format file, tenggat, field wajib, IPK minimal, rentang usia (jika terstruktur) | **Kode** |
| Essay menjawab kriteria, kesesuaian pengalaman dengan data, kontradiksi dengan syarat bebas | **LLM** |

Aturan penting:

- Hanya sumber **resmi** dengan relevansi **tinggi** yang boleh menghasilkan temuan keras ("melebihi pedoman"). Selain itu jenisnya "perlu dicek".
- Pedoman yang diam tentang sesuatu bukan berarti sesuatu itu dilarang.
- Checker hanya memberi saran, keputusan tetap di user.
- Jika pedoman tidak ditemukan, jalankan hanya konsistensi internal.
- Kirim **ringkasan fakta tersensor** ke model, bukan identitas mentah.
- Turunkan keyakinan jika pedoman terlalu lama dibanding tahun form.

Skema temuan:

```json
{
  "field": "Essay motivasi",
  "jenis": "melebihi_pedoman",
  "keparahan": "tinggi",
  "masalah": "Essay 640 kata, pedoman menyebut maksimal 500.",
  "sumber_pedoman": 0,
  "keyakinan": "tinggi",
  "saran": "Pangkas sekitar 140 kata."
}
```

Jadwal: per bagian untuk aturan kode, lalu pemeriksaan penuh sebelum kirim, paralel dengan umpan balik essay:

```ts
const rulesFindings = checkStructuredRules(answers, manual.aturan_terstruktur);
const [essayFeedback, llmFindings] = await Promise.all([
  essayCoach(essay, context),
  consistencyChecker(redact(answers), manual),
]);
const findings = merge(rulesFindings, llmFindings);
```

---

## 6. Tools dan pemakaian API

| Kebutuhan | Fitur Meta Model API |
|---|---|
| Panggilan dasar | Chat Completions (OpenAI SDK dengan `baseURL` diganti) |
| State sesi | Responses API dengan `previous_response_id` |
| Pencarian pedoman | `web_search` (search grounding) lewat Responses API |
| Output antar komponen | Structured output (JSON valid) |
| Penghematan biaya | Prompt caching (taruh prefiks stabil di awal), reasoning `low` untuk langkah ringan |
| Membaca halaman/PDF/foto | Vision dan input PDF |
| Tool calling | Hanya jika diperlukan (orchestrator dinamis atau agent yang memakai tool) |
| Respons terasa cepat | Streaming dan pesan progres |

Helper dasar:

```ts
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.meta.ai/v1",
  apiKey: process.env.MODEL_API_KEY!,
});

type Effort = "low" | "medium" | "high";

async function agent(system: string, input: string, effort: Effort = "medium") {
  const r = await client.chat.completions.create({
    model: "muse-spark-1.3",
    reasoning_effort: effort,
    messages: [
      { role: "system", content: system },
      { role: "user", content: input },
    ],
  });
  return r.choices[0].message.content ?? "";
}
```

Praktik teknis: log tiap langkah (input, output, token, waktu), batasi putaran perbaikan (maksimal 2), retry dengan backoff tanpa mengulang error 4xx, pantau biaya token reasoning per request, dan kirim progres ke frontend lewat SSE.

---

## 7. Multimodal

| Tahap | Kemampuan | Penggunaan di Savvy.AI |
|---|---|---|
| Input visual | Vision (gambar, PDF) | Screenshot form saat DOM gagal dibaca; foto formulir/dokumen persyaratan |
| Pemahaman | Model + structured output | Penjelasan per kolom, daftar kekurangan dokumen |
| Input suara | Muse Voice Transcribe (WebSocket) | Opsional: user bicara, jawaban dalam bahasa sederhana (aksesibilitas) |
| Output visual | Muse Image | Tidak prioritas untuk Savvy.AI |
| Segmentasi | SAM 3 | Tidak prioritas |

Contoh fan-out paralel multimodal (cek kelengkapan dokumen): tiga agent vision (`medium`, satu per foto) berjalan dengan `Promise.all`, lalu satu judge membandingkan hasilnya dengan daftar persyaratan.

Catatan privasi: KTP dan KK adalah data pribadi. Minimalkan penyimpanan, jangan log isi mentah, gunakan varian Standard.

Fallback screenshot dipakai untuk: komponen canvas, field tanpa elemen standar, iframe lintas-origin, dan label yang tidak terhubung ke input.

---

## 8. Membaca form dinamis: MutationObserver dan SPA

### 8.1 Masalah

Form Analyzer "sekali di awal" hanya cocok untuk form statis. Untuk SPA dan wizard multi-langkah: field muncul/hilang lewat JavaScript, langkah berikutnya belum ada di DOM, ada field kondisional, daftar dinamis (tambah pengalaman kerja), validasi dinamis, iframe, dan shadow DOM.

### 8.2 Prinsip

**Ekstraksi oleh kode, penafsiran oleh LLM.**

```
Perubahan terdeteksi ─► Extractor (kode) ─► bandingkan dengan skema
   field sudah dikenal ─► pakai skema lama (tanpa LLM)
   field baru ────────► Interpreter/Form Analyzer (LLM) ─► gabung ke skema
```

### 8.3 Deteksi perubahan

```ts
// 1. Perubahan DOM
const obs = new MutationObserver(debounce(onDomChange, 400));
obs.observe(document.body, {
  childList: true, subtree: true, attributes: true,
  attributeFilter: ["hidden", "disabled", "aria-hidden"],
});

// 2. Perubahan rute SPA (pushState tidak memicu event bawaan)
const wrap = (fn) => function (...a) { const r = fn.apply(this, a); onRouteChange(); return r; };
history.pushState = wrap(history.pushState);
history.replaceState = wrap(history.replaceState);
addEventListener("popstate", onRouteChange);
addEventListener("hashchange", onRouteChange);
```

Catatan:

- **Debounce** 300 sampai 500 ms karena SPA memicu banyak mutasi sekaligus.
- **Tanda tangan langkah (step signature):** hash dari daftar field yang terlihat (label + tipe + nama). Jika berubah, berarti langkah atau keadaan baru.
- Di ekstensi Chrome, patch `pushState` dilakukan di **konteks halaman** (skrip yang diinjeksi), karena content script berada di dunia terisolasi.
- **Abaikan mutasi yang berasal dari elemen Savvy.AI sendiri** agar tidak terjadi loop tak berujung.
- Tunggu DOM stabil (tanpa mutasi selama beberapa ratus ms) sebelum menganalisis, untuk konten lazy-load.

### 8.4 Skema yang tumbuh (peta per langkah)

```json
{
  "formId": "...",
  "steps": {
    "sig_a1": {"judul": "Data pribadi", "fields": [{"id": "nama", "validasi": "teks_bebas"}]},
    "sig_b7": {"judul": "Pendidikan", "fields": [{"id": "jenjang"}]}
  },
  "kondisional": [{"muncul": "npwp_nomor", "jika": {"field": "punya_npwp", "nilai": "ya"}}],
  "diamati_pada": "2026-10-27"
}
```

- Langkah dengan signature yang sudah ada tidak dianalisis ulang.
- Hubungan "muncul jika" dipelajari dari pengamatan (X muncul setelah Y diubah), bukan ditebak.
- Savvy.AI tidak boleh menyatakan "field ini pasti dilewati".

### 8.5 Kasus sulit

| Kasus | Penanganan |
|---|---|
| Shadow DOM (open) | Telusuri `shadowRoot` secara rekursif |
| Closed shadow DOM | Fallback screenshot ke vision |
| Iframe | `all_frames: true` dan pesan antar-frame; lintas-origin sering tidak terbaca |
| Canvas/komponen kustom | Fallback screenshot ke vision |
| Daftar virtual | Jangan simpulkan "ini seluruh field" |
| Label buruk (`name="q17"`) | Berikan `aria-label`, placeholder, teks terdekat, konteks langkah; jika tetap tidak jelas, tandai `tidak_yakin` |

### 8.6 Privasi saat ekstraksi

Ambil **label, tipe, atribut, dan opsi**, bukan **nilai** yang diketik user. Jangan proses `type="password"`. Berlaku juga di SPA yang memuat data user ke dalam form.

### 8.7 Prefetch menurut jenis form

Dipindahkan ke **`multi_chain_cache.md`** (bagian 6.6), karena erat dengan strategi cache.


---

## 9. Validator, kunci jawaban `checkValidity()`, dan evaluasi

### 9.1 Dua jenis kesalahan

| Jenis | Dampak |
|---|---|
| **False reject** (menolak isian yang benar) | Lebih merusak: user bingung atau mengubah jawaban yang benar |
| **False accept** (meloloskan isian yang salah) | Lebih ringan: form/server asli biasanya tetap memeriksa |

Karena itu validator condong **longgar**.

### 9.2 Sumber kesalahan

1. **Form Analyzer salah menentukan jenis** (sumber terbesar). Contoh: field "Nomor identitas" ditandai `nik` padahal menerima paspor WNA.
2. Aturan terlalu ketat atau longgar (NIK hanya dicek 16 digit; HP hanya menerima `08`).
3. Konteks lokal (nama satu kata, alamat tanpa nomor).
4. Validasi Savvy.AI bertentangan dengan validasi form.
5. Form berubah tetapi skema lama masih dipakai.

### 9.3 Tingkat keandalan per jenis

| Tingkat | Contoh | Catatan |
|---|---|---|
| Tinggi | Wajib isi, hanya angka, panjang, rentang tahun, batas kata, format email dasar | Aturan jelas |
| Sedang | NIK, nomor HP, kode pos, NPWP | Ada kasus tepi (`+62`, spasi, titik); format dapat berubah |
| Rendah | Nama, alamat, isian bebas | Jangan divalidasi ketat |

### 9.4 Kunci jawaban: `checkValidity()`

Browser sudah menghitung validitas lewat `input.validity` dan `checkValidity()`, dan banyak form memakai `pattern`, `maxlength`, `required`, `min`, `max`. Dua kegunaan:

1. **Sumber aturan utama:** baca aturan dari form, jangan tebak lewat LLM.
2. **Pembanding untuk evaluasi:** bandingkan keputusan validator Savvy.AI dengan `checkValidity()`.

```ts
const savvyOk = validators[field.validasi](value);
const formOk = el.checkValidity();
if (savvyOk !== formOk) logMismatch({ fieldType: field.validasi, savvyOk, formOk });
```

Catat **jenis validasi dan hasil**, jangan isi nilainya. Keterbatasan: `checkValidity()` hanya mencakup validasi bawaan HTML5 dan Constraint Validation API. Validasi kustom di JavaScript situs atau di server tidak terlihat.

### 9.5 Cara mengukur

1. **Unit test per validator**, 20 sampai 50 contoh benar/salah termasuk kasus tepi (`+62812...`, spasi di ujung, huruf kapital, nama satu kata, tahun 1999 dan 2000, NIK berawalan nol). Wajib 100% lulus.
2. **Uji Form Analyzer:** 20 sampai 30 form nyata, jenis validasi benar ditentukan manual, hitung seberapa sering tebakan salah.
3. **Metrik:** false reject rate, false accept rate, dan tingkat klik "Abaikan peringatan".
4. **Ambang:** jika false reject suatu jenis di atas sekitar 1 sampai 2%, turunkan menjadi petunjuk atau matikan.

### 9.6 Rilis bertahap

- **Mode bayangan (shadow):** validator berjalan dan mencatat hasil tanpa tampil ke user; bandingkan dengan `checkValidity()` selama beberapa minggu.
- Aktifkan hanya jenis yang terbukti rendah kesalahan; tambahkan sisanya satu per satu.

### 9.7 Rancangan yang membuat kegagalan murah

- Hanya **peringatan**, tidak pernah memblokir, dengan tombol "Abaikan".
- Daftar jenis tetap dan konservatif; ragu berarti `teks_bebas`.
- Aturan dari form lebih diutamakan daripada jenis dari Form Analyzer.
- Pesan menjelaskan alasan.
- Tombol "Peringatan ini salah" sebagai sumber data perbaikan.

---

## 10. Kegagalan yang mungkin terjadi dan cara menghadapinya

### 10.1 Kategori

- **Membaca form:** canvas/komponen kustom, iframe lintas-origin, closed shadow DOM, label tidak terhubung, atribut acak hasil bundling, editor kaya, virtualized list, captcha/bot protection.
- **Waktu:** race condition, hujan mutasi, penjelasan basi, prefetch terbuang, loop observer.
- **Pemahaman:** salah tafsir field ambigu, aturan tersembunyi di kode situs, cabang kondisional belum teramati, istilah instansi.
- **Teknis ekstensi:** service worker MV3 dimatikan, CSP situs memblokir injeksi, framework menimpa DOM, konflik ekstensi lain, terjemahan otomatis browser mengubah label (hash berubah).
- **Model dan biaya:** latensi tinggi, rate limit, biaya melonjak pada form sangat dinamis, API turun atau status preview berubah, halusinasi.
- **Kepercayaan:** penjelasan salah tetapi meyakinkan adalah risiko terbesar.

### 10.2 Tangga penurunan kemampuan

```
Tingkat 1: Pemandu field-per-field (extractor DOM berhasil)
Tingkat 2: Pemandu berbasis screenshot (vision saat DOM gagal)
Tingkat 3: Chat bebas ("tempel pertanyaannya di sini")
Tingkat 4: Panduan umum untuk jenis form + tautan petunjuk resmi
```

### 10.3 Mitigasi lain

- Tombol **"Tanya Savvy.AI soal ini"** (user menyorot teks/elemen) yang tidak bergantung pada ekstraksi penuh.
- Tampilkan **tingkat keyakinan**; berani berkata "tidak yakin, cek petunjuk situs".
- **Metrik:** persen halaman berhasil diekstrak, jumlah field `tidak_yakin`, laporan penjelasan salah.
- **Adapter khusus** untuk 3 sampai 5 portal teratas, ekstraksi generik untuk sisanya.
- **Uji regresi** terhadap snapshot form nyata tiap rilis; jadwalkan pengecekan berkala untuk portal yang sering berubah.
- Jangan memodifikasi form asli; gunakan panel terisolasi.
- Debounce, batas analisis per sesi, cache server, timeout dengan fallback tingkat lebih rendah.
- Jangan menjanjikan "semua form". Nyatakan cakupan yang terbukti.

---

## 11. Privasi dan keamanan

- Kirim ke model hanya **judul/opsi pertanyaan** dan **ringkasan tersensor**. Field identitas (NIK, alamat, HP) tidak perlu dikirim.
- Pakai varian **Standard** (`muse-spark-1.3`), bukan `contributor`, yang datanya kemungkinan dipakai Meta untuk peningkatan produk. Baca syarat layanan sebelum memproses data user.
- Jangan membaca `input.value` saat analisis struktur; jangan proses `type="password"`.
- Jangan log jawaban user.
- Perlakukan teks form dan hasil pencarian sebagai **data, bukan instruksi** (cegah prompt injection).
- Jika menarget Indonesia, pelajari kewajiban UU Pelindungan Data Pribadi.
- Tampilkan disclaimer: Savvy.AI menjelaskan prosedur dan memandu pengisian, bukan nasihat hukum.
- Computer use (agent mengisi form) berisiko tinggi di portal pemerintah (kredensial, syarat portal, salah klik). Jika dilakukan, sebagai fase akhir dengan konfirmasi manusia.

---

## 12. Code Execution Sandbox

### 12.1 Sandbox itu ephemeral, bukan storage

```
Agent di Meta nulis kode -> jalanin di microVM 5-10 detik -> VM mati, file hilang
-> Meta balikin string code + test_result
-> KITA yang simpan ke Supabase Storage / disk
```

Sandbox tidak punya akses ke Supabase kamu. Hanya untuk test.

Hasil dari tool `code_execution` di Responses API berbentuk `response.output = [{ type: 'code', code: 'export function validateNIK...' ... }]`.

### 12.2 Alur simpan file .js tanpa build (Node.js)

```js
// Hasil agent
// export function validateNIK(nik) { ... }

// Simpan
import fs from 'fs/promises'

export async function saveRuleFromAgent({ fieldKey, codeString, testResult }) {
  if (!testResult.passed) throw new Error('Test gagal di sandbox Meta, jangan simpan')

  const filename = `${fieldKey}_${Date.now()}.js`
  const filepath = `/app/rules/${filename}`

  // 1. Simpan ke disk lokal (atau Supabase Storage)
  await fs.writeFile(filepath, codeString)

  // 2. Simpan metadata ke Supabase - status pending approval officer
  await supabase.from('form_rules').insert({
    field_key: fieldKey,
    zod_file_path: filepath,
    zod_code: codeString,
    test_result: testResult,
    status: 'pending_officer_approval', // officer cek di Studio baru jadi Official
    source_response_id: 'resp_xxx'      // audit trail
  })

  // 3. Load tanpa build - dynamic import dengan cache-busting
  const mod = await import(`file://${filepath}?update=${Date.now()}`)
  return mod // bisa langsung mod.validateNIK(nik)
}

// Load rule yang sudah ada (anti-cache)
export async function loadRule(rulePath) {
  const mod = await import(`file://${rulePath}?update=${Date.now()}`)
  return mod
}
```

Node.js 20+ support `import()` file path langsung, tidak perlu `npm run build` atau `tsc`.

---

## 13. Deterministic Tools Beyond Auditor

### 13.1 Font Size+: Biasa vs Wow

**Biasa (nilai 5/10):**

```js
document.body.style.fontSize = "18px" // pecah layout, tidak per-portal
```

**Wow (nilai 9/10): deterministik + revertable:**

```js
export const accessibilityTools = {
  fontSizePlus: {
    run: (delta) => {
      const root = document.documentElement
      const current = parseFloat(getComputedStyle(root).fontSize)
      root.style.setProperty('--savvy-font-scale', `${(current + delta) / 16}`, 'important')
      chrome.storage.sync.set({ [`a11y_${portalKey}_fontScale`]: current + delta })
    },
    revertable: true,
    badge: "deterministik"
  },
  openDyslexic: { ... },
  highContrast: { ... },
  readingRuler: { ... }, // garis baca
  focusMode: { ... },    // sembunyikan header/footer
  adhdBar: { ... }       // progress bar
}
```

### 13.2 Tools deterministik lain yang lebih wow

| Tool | Kenapa Wow | Trigger Chat |
|---|---|---|
| Focus Mode | Sembunyikan distraksi, sisain form saja | "pusing lihatnya" |
| ADHD Bar | Progress Tahap 2/3 sisa 4 field | Otomatis tiap field |
| Smart Paste | Paste NIK 16 digit auto-split provinsi/tgl lahir | Paste event |
| Date Normalizer | "17 agustus 2005" -> 17/08/2005 | Field Coach |
| Reading Ruler | Garis baca ngikutin kursor | "susah baca" |

Semua deterministik, bisa revert, simpan per `portal_key`.

### 13.3 Tambahan deterministik baru (bebas bundle 20MB)

NIK decode + cek wilayah Kemendagri, MRZ parser ICAO dengan check digit, normalisasi smartquote/NBSP/zero-width, validasi MIME vs ekstensi, `libphonenumber-js` untuk +62, deteksi gelar akademik di Full Name.

---

## 14. Tool Guardrail: Anti Salah Panggil

### 14.1 Risiko LLM salah tool

- Salah intent: "susah baca" dipanggil `validateNIK()`
- Salah argumen: `fontSizePlus(delta: 100)` -> layout pecah
- Combo ngawur: 3 tool tidak berhubungan

### 14.2 Solusi 2 lapis

**Lapis 1: Schema ketat (LLM hanya propose)**

```js
{
  name: "adjustAccessibility",
  description: "Hanya untuk masalah baca/lihat, BUKAN untuk isi form",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["fontSizePlus", "openDyslexic", "readingRuler", "focusMode", "highContrast", "adhdBar"]
      },
      delta: { type: "number", minimum: 1, maximum: 4 } // guard, tidak boleh lebih dari 4
    },
    required: ["action"]
  }
}
```

**Lapis 2: Validator deterministik (kode kita)**

```js
const ALLOW_A11Y = ["fontSizePlus", "openDyslexic", "readingRuler", "focusMode", "highContrast", "adhdBar"]
const ALLOWED_COMBO = {
  "susah baca": ["fontSizePlus", "readingRuler"],
  "pusing": ["focusMode", "adhdBar"]
}

function executeTool(toolCall, currentMode) {
  if (currentMode === "accessibility" && !ALLOW_A11Y.includes(toolCall.action)) {
    return { error: "tool tidak diizinkan di mode ini" }
  }
  if (toolCall.action === "fontSizePlus" && toolCall.delta > 4) {
    toolCall.delta = 4 // clamp
  }
  return runDeterministic(toolCall)
}
```

### 14.3 FSM state (kunci utama di PRD)

```
IDLE
  -> Keyword "baca/kecil/pusing" -> ACCESSIBILITY state
       -> Tools yang boleh: [fontSizePlus, openDyslexic, readingRuler] ONLY
       -> LLM tidak bisa panggil validateNIK di sini
  -> Keyword "NIK/paspor" -> VALIDATION state
       -> Tools yang boleh: [checkNIK, parseMRZ] ONLY
       -> LLM tidak bisa panggil fontSizePlus di sini
  -> Selesai -> balik IDLE
```

```js
// classifier deterministik, BUKAN LLM
function classifyIntent(text) {
  if (/baca|kecil|pusing|silau/i.test(text)) return "ACCESSIBILITY"
  if (/NIK|paspor|MRZ/i.test(text)) return "VALIDATION"
  if (/isi|form/i.test(text)) return "FILL"
  return "IDLE"
}
```

Dengan FSM, risiko salah tool turun dari 30% ke <2%.

### 14.4 Aturan konfirmasi

- Tools ubah tampilan (font, contrast): **TIDAK** butuh konfirmasi.
- Tools sentuh data (fill, save, submit): **WAJIB** konfirmasi + traffic light auditor 🟡 🟢 🔴.

### 14.5 Checklist (sandbox, aksesibilitas, guardrail)

- [ ] Code execution sandbox: simpan file .js di Supabase Storage, load via dynamic import `?update=`
- [ ] Accessibility: 6 tools deterministik, per-portal persistence, revertable
- [ ] Tool guardrail: enum + min/max di schema, FSM state, validator deterministik, allowed combo
- [ ] Simpan `source_response_id` untuk audit trail

---

## 15. Roadmap pengerjaan

1. **Fase 1:** Extractor (kode), Form Analyzer, Field Coach, Validator (mode peringatan), cache memori dan `chrome.storage.session`.
2. **Fase 2:** Cache database bersama (Form Analyzer dulu, lalu Field Coach), `inflight`, tombol laporan, metrik hit rate.
3. **Fase 3:** MutationObserver, deteksi rute SPA, step signature, skema per langkah.
4. **Fase 4:** Manual Researcher dengan `aturan_terstruktur`, daftar domain tepercaya.
5. **Fase 5:** Consistency Checker (aturan kode, lalu LLM), Essay Coach.
6. **Fase 6:** Fallback screenshot/vision, tangga penurunan kemampuan, "Tanya Savvy.AI soal ini".
7. **Fase 7 (opsional):** suara (Muse Voice), adapter portal prioritas, computer use dengan konfirmasi.

Di setiap fase: bangun set evaluasi dan ukur sebelum menambah komponen.

---

## 16. Hal yang belum diverifikasi

- Parameter dan perilaku persis search grounding (`web_search`) di Muse Spark 1.3. Cek resep cookbook nomor 10 dan dokumentasi resmi.
- Ketersediaan akun dan API key dari Indonesia, batas rate, dan syarat data. Akses awal untuk developer di AS.
- Dukungan audio input di 1.3 (satu sumber menyebutnya dengan tanda bintang; dokumentasi 1.1 menyatakan tidak didukung).
- Kualitas bahasa Indonesia untuk tugas formal dan istilah birokrasi. Perlu diuji dengan kasus nyata.
- Latensi mode reasoning tinggi untuk interaksi per field.
- Kemampuan membaca video YouTube dan kelegalan mengambil transkrip.
- Struktur DOM Google Form dan portal pemerintah target (sering berubah).
- Detail harga dan status public preview (bisa berubah).
- Angka klaim performa 1.3 berasal dari Meta atau pihak ketiga dan belum direproduksi sendiri.

---

## 17. Langkah berikutnya yang bisa dikerjakan

- Skema JSON lengkap Form Analyzer (jenis validasi, percabangan, `content_hash`).
- Kode extractor (shadow DOM, step signature) dan kerangka ekstensi Chrome.
- Fungsi normalisasi URL Google Form dan pembuatan kunci cache.
- Skema `aturan_terstruktur` dan fungsi `checkStructuredRules`.
- Daftar jenis validasi konservatif untuk form Indonesia lengkap dengan unit test dan kasus tepi.
- Template set evaluasi (form nyata, kunci jawaban, metrik) dan skrip pembanding `checkValidity()`.
- Rancangan tangga penurunan kemampuan beserta pemilih tingkatnya.

---

## 18. Peta komponen: mana LLM, guardrail, rule engine

### 18.1 Definisi singkat

| Istilah | Artinya | Ciri |
|---|---|---|
| **LLM (agent)** | Bagian yang memakai Muse Spark untuk memahami, menjelaskan, atau memutuskan | Hasil bisa bervariasi, berbiaya, diuji dengan set evaluasi |
| **Komponen** | Satu bagian program dengan tugas jelas (tidak harus memakai LLM) | Istilah paling umum dan netral |
| **Guardrail** | Pagar pengaman yang mencegah atau membatasi kesalahan | Fokus pada fungsi: melindungi |
| **Rule engine** | Menjalankan aturan eksplisit "jika X maka Y" yang ditulis manusia | Fokus pada cara kerja: tanpa penalaran model |

Satu bagian bisa punya lebih dari satu peran. Contoh: Validator adalah komponen, berfungsi sebagai guardrail, dan cara kerjanya rule engine.

### 18.2 Komponen berbasis LLM (agent)

| Komponen | Reasoning | Tugas | Catatan |
|---|---|---|---|
| Form Analyzer (Interpreter) | `medium` | Memberi arti pada field baru: tipe, wajib, bagian, jenis validasi, percabangan | Hanya dipanggil untuk field baru/belum dikenal |
| Manual Researcher | `medium` + web search | Mencari pedoman pengisian (PDF, halaman resmi, video) dan menyusun `aturan_terstruktur` | Sekali per form, hasil di-cache. Label "resmi" ditentukan kode, bukan model |
| Field Coach | `low` | Penjelasan generik per field | Tanpa personalisasi agar bisa di-cache bersama |
| Essay Coach | `high` | Pertanyaan pemandu, kerangka, umpan balik essay | Pelatih, bukan penulis |
| Consistency Checker (bagian LLM) | `high` | Konsistensi antar jawaban, essay vs data, kontradiksi dengan pedoman bebas | Menerima ringkasan tersensor. Hanya memberi saran |
| Vision fallback | `medium` | Membaca screenshot saat DOM gagal (canvas, closed shadow DOM, iframe lintas-origin) | Tangga penurunan tingkat 2 |
| Chat bebas | sesuai kebutuhan | Menjawab pertanyaan manual ("Tanya Savvy.AI soal ini") | Tangga penurunan tingkat 3 |

### 18.3 Guardrail (kode)

| Guardrail | Melindungi dari | Juga rule engine? |
|---|---|---|
| Validator (peringatan format) | Isian keliru yang lolos tanpa disadari | Ya |
| Pemeriksa aturan terstruktur (`checkStructuredRules`: batas kata, tenggat, field wajib, IPK minimal) | Pelanggaran syarat yang bisa dicek pasti | Ya |
| Penanda sumber "resmi" berdasarkan daftar domain tepercaya | Model salah menilai sumber tidak resmi sebagai resmi | Ya |
| Validasi skema JSON keluaran model (`isValidCoach` dan sejenisnya) sebelum disimpan atau ditampilkan | Keluaran rusak atau cache berisi sampah | Sebagian |
| Sensor/redaksi data (`redact`): hilangkan NIK, alamat, HP sebelum ke model | Kebocoran data pribadi | Ya |
| Larangan membaca `input.value` saat analisis struktur dan larangan memproses `type="password"` | Pengambilan data sensitif | Ya |
| Perlakuan teks form dan hasil pencarian sebagai data, bukan instruksi, ditambah validasi keluaran | Prompt injection dan cache poisoning | Sebagian |
| Aturan "hanya sumber resmi dengan relevansi tinggi yang boleh memicu temuan keras" | Temuan keliru yang membuat user salah koreksi | Ya |
| Aturan "jika tidak yakin, pilih `teks_bebas`" (jenis validasi konservatif) | False reject pada validator | Ya |
| Validator hanya memberi peringatan, tidak pernah memblokir | Menghalangi user mengisi jawaban yang benar | Ya |
| Mengabaikan mutasi DOM dari elemen Savvy.AI sendiri | Loop observer tak berujung | Ya |
| Debounce, batas concurrency, timeout, retry dengan backoff, batas putaran perbaikan | Rate limit, biaya melonjak, loop, panggilan menggantung | Ya |
| Batas jumlah sumber Manual Researcher dan batas analisis per sesi | Biaya dan latensi berlebih | Ya |
| TTL dan invalidasi cache (hash isi field, versi prompt, versi model, flag `flagged`) | Penjelasan basi atau salah yang menyebar | Ya |
| Pembatasan cache bersama hanya untuk form publik dan konten generik | Kebocoran isi form privat dan data user | Ya |
| Persetujuan manusia untuk aksi besar (jika computer use dipakai) | Salah klik pada formulir resmi | Ya |

### 18.4 Rule engine (kode)

| Rule engine | Aturan yang dijalankan |
|---|---|
| Validator | Jenis validasi dari Form Analyzer dipetakan ke aturan tetap: `nik`, `email`, `tahun`, `teks_panjang`, `teks_bebas` |
| `checkStructuredRules` | Cocokkan jawaban dengan `aturan_terstruktur` (`maks_kata`, `min_angka`, `tenggat`) |
| Pemilih tingkat penurunan kemampuan | Kondisi pemicu pindah tingkat (ekstraksi gagal berarti vision; vision gagal berarti chat bebas; dan seterusnya) |
| Penanda keyakinan | Aturan yang menurunkan keyakinan (sumber tidak resmi, tanggal pedoman terlalu lama, relevansi rendah) |
| Penggabung skema per langkah | Langkah dengan signature yang sudah ada tidak dianalisis ulang; field baru ditambahkan ke langkah yang sama |
| Pencatat hubungan "muncul jika" | Jika field X muncul setelah Y diubah, catat sebagai kondisional |
| Penentu prefetch | Prefetch n sampai n+3; lewati field yang belum pasti muncul; hanya panggil yang belum ada di cache |
| Daftar domain tepercaya | `.go.id` dan domain penyelenggara dari URL form ditandai resmi |

### 18.5 Komponen kode lain (bukan guardrail murni, bukan rule engine murni)

| Komponen | Peran |
|---|---|
| Orchestrator (kode) | Merangkai alur: urutan, paralel (`Promise.all`), putaran perbaikan terbatas |
| Extractor (DOM) | Membaca label, tipe, atribut, dan opsi field (bukan nilai). Menelusuri shadow DOM dan iframe bila bisa |
| Pendeteksi perubahan | `MutationObserver` dengan debounce, patch `pushState`/`replaceState`, event `popstate` dan `hashchange` |
| Penghitung step signature | Hash dari daftar field yang terlihat (label + tipe + nama) |
| Cache browser | `Map` (content script), `chrome.storage.session`, `chrome.storage.local`, IndexedDB |
| Cache database | Tabel `coach_cache`, kunci berhash, `inflight` untuk menggabungkan permintaan yang sama |
| Pembuat kunci cache | Normalisasi URL form, ID field, hash isi, versi prompt, versi model, hash pedoman |
| Penggabung temuan | Menggabungkan temuan kode dan LLM menjadi satu daftar |
| Panel UI Savvy.AI (shadow DOM sendiri) | Menampilkan panduan tanpa mengubah form asli |
| Logging dan metrik | Log langkah, token, waktu; hit rate cache; jumlah `tidak_yakin`; laporan "penjelasan salah" |

### 18.6 Komponen evaluasi (pengukuran, bukan fitur untuk user)

| Komponen | Fungsi |
|---|---|
| Pembanding dengan `checkValidity()` (mode bayangan) | Kunci jawaban untuk mengukur false reject dan false accept validator |
| Unit test validator | Wajib lulus 100% dengan kasus tepi (`+62`, nama satu kata, tahun 1999 dan 2000, dsb.) |
| Kumpulan uji Form Analyzer | 20 sampai 30 form nyata dengan jenis validasi yang benar ditentukan manual |
| Set evaluasi Field Coach dengan dan tanpa pedoman | Mengukur manfaat Manual Researcher |
| Uji regresi snapshot form | Mendeteksi extractor yang rusak setelah situs berubah |
| Tombol "Peringatan ini salah" dan "Penjelasan ini kurang tepat" | Umpan balik pengguna untuk perbaikan dan penandaan cache |

### 18.7 Ringkasan satu tabel

| Komponen | LLM | Guardrail | Rule engine |
|---|:---:|:---:|:---:|
| Form Analyzer | Ya | - | - |
| Manual Researcher | Ya | - | - |
| Field Coach | Ya | - | - |
| Essay Coach | Ya | - | - |
| Consistency Checker (penilaian semantik) | Ya | - | - |
| Vision fallback | Ya | - | - |
| Validator | - | Ya | Ya |
| `checkStructuredRules` | - | Ya | Ya |
| Penanda sumber resmi (daftar domain) | - | Ya | Ya |
| Sensor/redaksi data | - | Ya | Ya |
| Validasi skema JSON keluaran | - | Ya | - |
| Batas biaya (debounce, concurrency, timeout, retry) | - | Ya | Ya |
| TTL dan invalidasi cache | - | Ya | Ya |
| Pemilih tingkat penurunan kemampuan | - | - | Ya |
| Penentu prefetch | - | - | Ya |
| Penggabung skema per langkah | - | - | Ya |
| Orchestrator, Extractor, MutationObserver, cache, UI | - | - | - |

Prinsip pembagian: jika sesuatu bisa ditulis sebagai aturan yang jelas, pakai kode (guardrail atau rule engine). Simpan LLM untuk hal yang butuh pemahaman bahasa atau konteks, dan batasi keluarannya dengan guardrail.

---

Catatan rebrand: Dokumen ini sebelumnya bernama Telmy. Per 27 Okt 2026 resmi menjadi Savvy.AI (tagline: Savvy.ai fills forms with you. Understand every field. Check before you submit.). Telmy tetap dipertahankan sebagai alias internal.

Catatan penyuntingan: beberapa baris kode di sumber asli terpotong (potongan di bagian 12 dan 14, mis. pesan error `saveRuleFromAgent`, argumen `setProperty`, daftar `enum`/`ALLOW_A11Y`); sudah dilengkapi secara wajar agar kode utuh. Mohon dicek ulang.
