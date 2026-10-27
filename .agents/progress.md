# TASK — Urutan Pengerjaan Savvy.AI

> Rujukan: `PRD.md` (apa dan mengapa) · `AGENTS.md` (aturan koding)
> Kerjakan **dari atas ke bawah**. Jangan mulai P1 sebelum Gerbang G2 lolos.

**Legenda:** `[ ]` belum · `[~]` jalan · `[x]` selesai · **P0** wajib demo · **P1** setelah P0 · **P2** sisa waktu
**Estimasi:** S ≈ 1–2 jam · M ≈ 3–5 jam · L ≈ 6–10 jam. **DoD** = definisi selesai.

---

## 0. Kalender & Aturan Waktu

Kickoff **26 Okt 12:00 ET (≈ 23:00 WIB)**. Batas submit **4 Nov 21:00 ET = 5 Nov 09:00 WIB**. **Target submit paling lambat 4 Nov 22:00 WIB** (±11 jam penyangga).

| Hari | Tanggal | Fokus | Gerbang akhir hari |
|---|---|---|---|
| D1 | 26–27 Okt | Fondasi + spike model | — |
| D2 | 27 Okt | Fondasi selesai, mulai Understand | **G1** |
| D3 | 28 Okt | Understand (walkthrough, Explain) | — |
| D4 | 29 Okt | Understand (chat, voice) + mulai Fill | **G2a** |
| D5 | 30 Okt | Fill (vault, Photo Studio) | — |
| D6 | 31 Okt | Audit + integrasi P0 | **G2** (P0 selesai) |
| D7 | 1 Nov | P1 gelombang 1 | — |
| D8 | 2 Nov | P1 gelombang 2 → **FEATURE FREEZE malam** | **G3** |
| D9 | 3 Nov | Video demo + README (tanpa fitur baru) | — |
| D10 | 4 Nov | Penyangga, uji instalasi bersih, **submit** | **G4** |

**Aturan keras:**
1. **Feature freeze** malam D8. Setelah itu hanya perbaikan bug dan polish.
2. Jika G2 meleset > 0,5 hari, **seluruh P1 dipotong** sesuai Daftar Potong (bagian 9).
3. Setiap akhir hari: commit, catat di `docs/muse-code-log.md`, rekam 10 detik layar kemajuan (bahan video).
4. Jangan mengoptimalkan sebelum alur demo jalan end-to-end.

---

## 1. Fase 0 — Persiapan (sebelum kickoff, tanpa kode produk)

- [ ] **T0-1 (S)** Pastikan status diterima dan klaim $150 kredit Meta Model API. Baca syarat kredit.
- [ ] **T0-2 (S)** Siapkan akun: Supabase (proyek baru), Vercel, GitHub repo kosong (publik pada akhirnya), Chrome/Edge dengan Developer Mode.
- [ ] **T0-3 (S)** Instal Node LTS, pnpm, dan Muse Code (cek cara membaca `AGENTS.md`; jika tidak otomatis, siapkan prompt pembuka). Siapkan Antigravity sebagai cadangan.
- [ ] **T0-4 (M)** Baca dokumentasi Meta Model API: **kemampuan Glimmer**, model open-weights yang tersedia, structured output, streaming, limit rate, format input/output SAM 3.1, ada/tidaknya embedding.
- [ ] **T0-5 (S)** Baca Official Rules final (pekerjaan sebelum kickoff, atribusi, format submission).
- [ ] **T0-6 (S)** Verifikasi 3 statistik narasi ke sumber primer; simpan tautan di `docs/sources.md`.
- [ ] **T0-7 (S)** Siapkan 3 foto uji (selfie casual, latar berantakan, pencahayaan buruk) dan konten juknis seed (2–3 PDF/teks contoh).

---

## 2. Fase 1 — Fondasi & Spike (D1–D2)

### 2.1 Monorepo & infrastruktur
- [ ] **T1-1 (S) P0** Init monorepo pnpm: `shared`, `frontend`, `backend`, `extension-savvy`, `extension-studio`, `supabase`, `docs`. TypeScript strict, ESLint, Prettier. **DoD:** `pnpm -r build` hijau.
- [ ] **T1-2 (M) P0** Supabase: migrasi skema (PRD §7.5), RLS, seed `sites`/`guide_versions`. **DoD:** query publik hanya mengembalikan guide `published`; `vault_envelopes` hanya terbaca pemiliknya.
- [ ] **T1-3 (M) P0** `backend` skeleton Vercel: struktur `/api/*`, helper respons `{ok,data|error}`, validasi zod, middleware JWT Supabase, kuota harian per rute (`usage_events`), flag `DEV_AUTH_BYPASS`. **DoD:** `GET /api/health` publik; rute lain 401 tanpa token.
- [ ] **T1-4 (M) P0** `modelRouter` di backend: peta tugas→model dari env, timeout, retry 1×, fallback chain, log latensi tanpa PII. **DoD:** unit test dengan model palsu.
- [ ] **T1-5 (M) P0** `extension-savvy` skeleton (WXT): manifest MV3, service worker, content script, Side Panel React dengan 3 tab kosong, pesan bertipe antar konteks. **DoD:** ter-load di Chrome tanpa error; panel terbuka.
- [ ] **T1-6 (M) P0** **Mock portal** (3 langkah, field dinamis, kesalahan tertanam; PRD §10.1) di `frontend/public/mock-portal/`. **DoD:** dapat dibuka lokal dan di Vercel.
- [ ] **T1-7 (S) P0** Auth guest: ekstensi memanggil `signInAnonymously`, menyimpan sesi di `chrome.storage.local`, menyertakan JWT ke backend. **DoD:** panggilan backend lolos dengan guest token.

### 2.2 Spike (waktu dibatasi, hasilnya dicatat di `docs/spikes.md`)
- [ ] **T1-8 (S) P0** Spark: kirim gambar + prompt, minta JSON terstruktur. **Keluaran:** snippet yang jalan + latensi.
- [ ] **T1-9 (M) P0** **SAM 3.1:** segmentasi subjek dari foto; tentukan format mask dan cara menyusunnya dengan `sharp`. **Keluaran:** foto uji → PNG alpha. *Jika terblokir > 3 jam, aktifkan rencana B (lihat bagian 9).*
- [ ] **T1-10 (S) P0** Model ringan: panggilan teks + streaming; pilih model (Llama/Glimmer) berdasarkan kualitas ID/EN dan latensi.
- [ ] **T1-11 (S) P0** Keputusan RAG: embedding tersedia? Jika tidak → FTS Postgres.
- [ ] **T1-12 (S) P0** Mic di Side Panel MV3: `webkitSpeechRecognition` dan izin mikrofon (perlu halaman izin atau tidak). Uji juga `speechSynthesis` ID.
- [ ] **T1-13 (S) P0** Uji Vercel: kirim foto 2 MB ke fungsi + `sharp` jalan; catat batas.

**🚦 G1 (akhir D2):** semua spike punya keputusan tertulis; mock portal live; `GET /api/health` + panggilan Spark nyata dari backend berjalan. *Jika gagal, selesaikan sebelum fase 2.*

---

## 3. Fase 2 — Understand (D2–D4)

- [ ] **T2-1 (M) P0** `shared`: skema zod guide (PRD §7.6), tipe `AuditItem`, util normalisasi teks, Levenshtein, scrubber PII, i18n ID/EN dasar. **DoD:** unit test scrubber (NIK, email, telp) hijau.
- [ ] **T2-2 (M) P0** Seed guide mock portal (JSON tulisan tangan) dengan campuran tier: sebagian Official (`DEMO-SEED`), Curated, dan 1–2 field tanpa guide. Endpoint `GET /api/guidance` + cache lokal + ETag. **DoD:** ekstensi mengambil plan untuk domain mock portal.
- [ ] **T2-3 (L) P0** Scanner pasif + **locator 3 lapis** + diff `matched/unmapped/missing` + `MutationObserver` debounce. **DoD:** ≥ 90% field mock portal ter-resolve; field kondisional terdeteksi; **tidak ada** pembacaan `.value` (uji dengan grep + spy).
- [ ] **T2-4 (L) P0** FSM walkthrough + overlay **closed Shadow DOM**: Beacon Spotlight, kartu petunjuk (Meaning/How/Example/Pitfalls), badge 3 tier, tombol Lanjut/Kembali, sinkron `focusin`. **DoD:** satu putaran penuh 3 langkah di mock portal tanpa error konsol.
- [ ] **T2-5 (M) P0** Tab *Forms Guide* di Side Panel: daftar field per step, status (matched/unmapped), klik = Show Me. **DoD:** sesuai wireframe.
- [ ] **T2-6 (L) P0** **Explain This:** overlay snip, DOM masking, pratinjau "Apa yang dikirim", izin opsional `<all_urls>`, `POST /api/explain` → Spark → JSON zod. **DoD:** AC PRD U-3; payload bersih PII (cek di tab Network).
- [ ] **T2-7 (M) P0** Field `unmapped` → tombol "Jelaskan" → AI Guidance (badge kuning + fallback "tanyakan ke instansi" bila bukti kurang). **DoD:** field ambigu mock portal tampil badge kuning.
- [ ] **T2-8 (L) P0** **Chatbot RAG:** ingest juknis seed (skrip manual), `POST /api/chat` stream, sitasi, fallback "tidak ada di dokumen", guardrail domain. **DoD:** AC PRD U-4.
- [ ] **T2-9 (M) P0** **Voicebot Tap-to-Mic:** STT → chat → TTS, thread bersama, indikator mic, matikan semua track saat berhenti. **DoD:** AC PRD U-5.
- [ ] **T2-10 (S) P0** Panel 3 tab final + pemilih mode Chatbot/Voicebot + grid aksi cepat.

**🚦 G2a (akhir D4):** demo "Understand" (walkthrough + Explain + chat + suara) berjalan di mock portal. *Jika belum, tunda semua P1 lebih awal.*

---

## 4. Fase 3 — Fill (D4–D5)

- [ ] **T3-1 (M) P0** **Vault:** modul WebCrypto (AES-256-GCM, PBKDF2 ≥ 600k), buat/buka/kunci, kunci turunan di `chrome.storage.session`, UI setup password + form profil. **DoD:** ciphertext saja di storage; salah password ditolak; unit test enkripsi bolak-balik.
- [ ] **T3-2 (M) P0** **Autofill:** pemetaan `semantic_key` → vault, "Isi semua"/"Isi field ini", provenance, tidak menyentuh password/OTP, dispatch event `input/change` agar framework portal mengenali. **DoD:** 8+ field terisi di mock portal.
- [ ] **T3-3 (S) P0** **Undo Autofill** (batch snapshot). **DoD:** satu klik memulihkan semua.
- [ ] **T3-4 (L) P0** **Photo Studio backend:** `POST /api/photo/process`: validasi ukuran, SAM → mask → `sharp` komposisi background solid, crop preset (US 2×2, Schengen 35×45, ID 4×6), 300 DPI, binary search kualitas ≤ batas KB, tanpa penyimpanan. **DoD:** 3 foto uji menghasilkan keluaran valid < 10 detik.
- [ ] **T3-5 (M) P0** **Photo Studio UI** (tab AutoFill atau modal): drop foto, downscale klien, pilih preset & warna, pratinjau sebelum/sesudah, unduh, **Attach** ke input file (DataTransfer). Preset otomatis dari `fileRule.photoPreset`. **DoD:** AC PRD F-2/F-3.

---

## 5. Fase 4 — Audit (D5–D6)

- [ ] **T4-1 (M) P0** **Rules engine** di `shared`: required, regex, panjang, `dateFormat`, `fileRule`; hasil `AuditItem[]`. **DoD:** unit test tiap aturan.
- [ ] **T4-2 (M) P0** **Traffic Light UI:** tombol "Pre-Submit Audit" (mode aktif), ringkasan merah/kuning/hijau, daftar item, badge pada field di halaman (Shadow DOM). **DoD:** mock portal menghasilkan merah untuk kesalahan tertanam.
- [ ] **T4-3 (S) P0** **Jump to error** + pre-submit drawer + "Apply fix" untuk item bersaran. **Tanpa tombol submit.**
- [ ] **T4-4 (M) P0** **Audit foto** `POST /api/photo/audit`: dimensi/rasio, ukuran, kerataan latar, rasio kepala, tengah, ketajaman; tampilkan dalam UI audit. **DoD:** foto uji berlatar salah → merah dengan saran "Buka Photo Studio".
- [ ] **T4-5 (M) P0** **Integrasi P0 end-to-end:** jalankan skrip demo penuh (Understand → Fill → Audit → hijau) tiga kali berturut-turut tanpa error. Perbaiki bug.

**🚦 G2 (akhir D6):** alur P0 stabil 3× berturut-turut. Build ZIP ekstensi dapat di-load pada profil Chrome bersih. **Hanya jika G2 lolos, lanjut ke P1.**

---

## 6. Fase 5 — P1 (D7–D8) — urutan WAJIB

Urutan disusun berdasarkan nilai demo ÷ usaha. Berhenti pada item yang tidak sempat; jangan melompat.

### Gelombang 1 (D7)
- [ ] **T5-1 (M) P1** **A-4 Validasi Indonesia:** NIK (provinsi, tanggal), NPWP 15/16, filter gelar akademik + saran, KTP vs paspor (form ⇄ vault). **DoD:** "Dr." dan NIK 15 digit di mock portal terdeteksi; unit test dengan data uji.
- [ ] **T5-2 (M) P1** **Magic Pen:** pill di textarea, `POST /api/write/draft` (Spark, 3 opsi JSON), label "Dibuat AI", Insert + Undo, tanpa fakta karangan. **DoD:** AC PRD F-4.
- [ ] **T5-3 (M) P1** **X-1 Auth penuh + D-1 inti:** login email, upgrade guest→akun, vault sync terenkripsi (F-6), dashboard: login, overview, riwayat audit, pengaturan. **DoD:** vault tersinkron antar dua profil browser tanpa server mengetahui isi.
- [ ] **T5-4 (L) P1** **S-1 Studio Recorder** (extension-studio): gating peran `officer`, record flow, inspector petunjuk, Smart Blur, simulasi memakai runner `shared`, publish → backend (tier ditentukan server), `integrity_hash`. **DoD:** rekam mock portal langkah 1 dalam < 5 menit, publish, lalu `extension-savvy` memakai guide hasil rekaman.

### Gelombang 2 (D8)
- [ ] **T5-5 (S) P1** **S-2 Export** MD dan HTML dari endpoint backend + tombol di dashboard.
- [ ] **T5-6 (M) P1** **U-6 Focus Mode** (1 field per layar, sinkron dua arah, "Bacakan").
- [ ] **T5-7 (S) P1** **F-5 Privacy Masking** toggle.
- [ ] **T5-8 (M) P1** **X-2 Accessibility Hub** (Side Panel + overlay): ADHD bar, OpenDyslexic, kontras tinggi, ukuran teks; simpan di `storage.sync`.
- [ ] **T5-9 (M) P1** **U-7 Translate Page (scoped)**: batch teks terlihat → model ringan, cache hash, Revert, locator memakai teks asli. **DoD:** walkthrough tetap bekerja saat halaman diterjemahkan.
- [ ] **T5-10 (S) P1** **A-5 Audit semantik** (model ringan) untuk field ambigu, berlabel "Saran AI".
- [ ] **T5-11 (S) P1** Dashboard: halaman Vault, Panduan (officer), cetak PDF dari tampilan HTML ekspor (print CSS).
- [ ] **T5-11a (S) P1** **U-10 Specimen Previewer:** pratinjau contoh dokumen sah beranotasi pada input berkas di mock portal.

**🚦 G3 (malam D8 — FEATURE FREEZE):** apa pun yang belum `[x]` dibekukan dan **tidak** ditampilkan di demo. Bagian P1 yang selesai separuh disembunyikan di balik flag, bukan ditampilkan rusak.

### P2 (hanya jika G2 lolos lebih cepat ≥ 1 hari)
- [ ] **T5-12 (M) P2** A-6 Red-flag tone auditor (Spark), dengan guardrail "tidak menyarankan menyembunyikan fakta".
- [ ] **T5-13 (M) P2** U-8 Avatar SVG (state IDLE/LISTENING/THINKING/SPEAKING; mulut mengikuti `speechSynthesis` boundary).
- [ ] **T5-14 (M) P2** U-9 ElevenLabs `with-timestamps` + mapper viseme + fallback Web Speech.
- [ ] **T5-15 (S) P2** S-3 auto-lokalisasi ID⇄EN di Studio dengan pratinjau.
- [ ] **T5-16 (S) P2** **X-3 Feedback & Discrepancy:** tombol "Laporkan Kolom Berubah" pada kartu petunjuk + endpoint `/api/feedback/discrepancy` + simpan ke Supabase.

---

## 7. Fase 6 — Demo, Dokumentasi (D9)

- [ ] **T6-1 (M) P0** Naskah video 3 menit (bahasa Inggris) mengikuti PRD §10.2; tentukan 1–2 cutaway P1 dari yang benar-benar stabil.
- [ ] **T6-2 (M) P0** Rekam layar 1080p/60fps pada mock portal, kursor/zoom bersih. Edit bagian tunggu API agar tidak terasa lag.
- [ ] **T6-3 (M) P0** Diagram arsitektur (routing model + privasi) sebagai slide 15–20 detik.
- [ ] **T6-4 (S) P0** Voiceover jernih + subtitle. Pernyataan jujur: data Official adalah **seed simulasi**.
- [ ] **T6-5 (M) P0** README bintang lima: masalah, GIF demo, arsitektur, **cara instal ekstensi (unpacked)**, akun demo/guest, daftar fitur dengan label P0/P1 yang benar-benar berfungsi, penjelasan peran tiap produk Meta, bagian "Built with Muse Code" (tautkan `docs/muse-code-log.md` + screenshot), batasan yang jujur.
- [ ] **T6-6 (S) P0** Tag rilis `v1.0-hackathon` dan unggah ZIP ekstensi (Savvy.AI + Studio) ke GitHub Release.

---

## 8. Fase 7 — Submit (D10)

- [ ] **T7-1 (M) P0** **Uji instalasi bersih:** profil Chrome baru → muat ZIP dari Release → ikuti README apa adanya → jalankan skrip demo. Perbaiki README bila ada langkah yang hilang.
- [ ] **T7-2 (S) P0** Periksa produksi: backend Vercel, Supabase, mock portal live; kuota API cukup; tidak ada kunci rahasia di repo (`git log -p | grep`).
- [ ] **T7-3 (S) P0** Unggah video (YouTube/Loom, HD, Unlisted/Public), cek dapat diputar tanpa login.
- [ ] **T7-4 (S) P0** Isi formulir submission di portal Cerebral Valley: track **Indie Developer**, tema **Build for Your World**, tautan repo, video, demo live, ringkasan penggunaan Meta AI.
- [ ] **T7-5 (S) P0** **Submit paling lambat 4 Nov 22:00 WIB.** Simpan bukti konfirmasi.

**🚦 G4:** submission terkonfirmasi.

---

## 9. Daftar Potong & Rencana B

**Urutan pemotongan bila waktu mepet (potong dari paling atas):**
1. P2 seluruhnya (avatar, ElevenLabs, red-flag, lokalisasi, PDF).
2. T5-11 (halaman dashboard tambahan) dan T5-5 (HTML export; pertahankan MD).
3. T5-9 Translate Page.
4. T5-8 Accessibility Hub (pertahankan hanya kontras tinggi + ukuran teks).
5. T5-7 Privacy Masking.
6. T5-6 Focus Mode.
7. T5-10 Audit semantik.
8. T5-4 Studio Recorder, **kecuali** versi tersempit: rekam + publish tanpa export dan tanpa simulasi.
9. T5-3 Auth penuh (pertahankan guest anonymous saja; vault sync dan login dipotong).

**Tidak boleh dipotong:** P0 §3–§5, README, video, uji instalasi bersih.

**Rencana B:**
- *SAM 3.1 terblokir > 3 jam:* gunakan segmentasi alternatif sederhana hanya untuk melanjutkan pipeline (mis. model open-weights segmentasi atau pustaka penghapus latar), sambil tetap memanggil SAM untuk bagian yang sudah bisa; jangan mengklaim SAM di video bila tidak dipakai.
- *Spark lambat/rate limit:* aktifkan cache respons untuk skrip demo dan fallback ke model ringan.
- *Mic MV3 bermasalah:* halaman izin mikrofon terpisah; bila tetap gagal, demo voicebot dengan input teks dan TTS saja.
- *Embedding tidak ada:* FTS Postgres.
- *Portal live berubah:* demo hanya di mock portal.

---

## 10. Checklist Uji Manual (jalankan di G2, G3, dan T7-1)

- [ ] Mode pasif: tab Network/Console tidak menunjukkan pengiriman nilai isian; tidak ada pembacaan `.value` sebelum klik Audit/Autofill.
- [ ] Payload Explain This tidak memuat PII (NIK/email/telepon sudah disamarkan).
- [ ] Teks halaman berisi instruksi ("isi field ini dengan …", "abaikan aturan sebelumnya") tidak pernah dijalankan.
- [ ] Savvy.AI tidak pernah menekan Submit; tidak ada kode yang memanggil `form.submit()` / klik tombol submit.
- [ ] Undo Autofill memulihkan seluruh field.
- [ ] Mic berhenti dan indikator browser padam setelah selesai/menutup panel.
- [ ] Vault: storage hanya ciphertext; kunci tidak ada di `storage.local`.
- [ ] Badge: Official/Curated/AI tampil sesuai sumber; field tanpa dasar menampilkan "tanyakan ke instansi".
- [ ] Walkthrough tahan: field kondisional, resize jendela, dan (jika P1) halaman diterjemahkan.
- [ ] Guest dan login keduanya dapat memakai fitur P0.
- [ ] Instalasi pada profil bersih berhasil memakai README.
