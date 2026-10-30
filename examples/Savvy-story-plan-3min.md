# Savvy.AI: Story Plan Video 3 Menit

**Format:** monolog personal + demo langsung · **Bahasa voice-over:** Inggris (juri global), subtitle Indonesia opsional · **Target:** 360-400 kata, tidak lebih

## Yang diubah dari draf awal

- Draf narasi 5 babak itu sekitar 5 menit kalau dibacakan. Di sini dipadatkan jadi **6 segmen** supaya demo dan trace punya waktu cukup.
- Cerita istri tetap jadi pembuka dan penutup, tapi diringkas. Inilah yang membuat juri ingat.
- Demo dan trace tetap bagian terpanjang karena itu yang menentukan skor Demo (25%), Meta tooling (25%), dan Technical depth (20%).
- Fitur kecil (Essay Coach, penggaris baca, font adaptif) cukup disebut satu kalimat di akhir.

## Timeline

| Waktu | Segmen | Yang tampil di layar | Kriteria |
|---|---|---|---|
| 0:00-0:22 | **Hook cerita** | Foto/mock halaman penolakan, lalu form dengan satu digit salah disorot | Impact |
| 0:22-0:38 | **Insight dan solusi** | Logo Savvy.AI + tiga kata: Understand, Fill, Audit | Impact |
| 0:38-1:33 | **Demo langsung** (3 sub-bagian) | Layar asli di portal mock, side panel terbuka | Demo |
| 1:33-2:30 | **Agent trace dan Meta tools** | Panel trace + diagram alur dari README | Meta tooling, Technical depth |
| 2:30-2:48 | **Hasil ukuran** | Tabel evaluasi dari README | Technical depth |
| 2:48-3:00 | **Penutup** | Tagline + link repo + logo hackathon | Impact |

## Naskah voice-over (English)

### 0:00-0:22 | Hook (~46 kata)
"Hi, I'm Robby. A few months ago, my wife tried to renew her driver's license online. Three days later: rejected. Not because she was ineligible. Because she mistyped one digit in a field with confusing instructions. She paid again and started over."

*Visual:* tampilkan penolakan, lalu zoom ke satu digit salah. Musik pelan.

### 0:22-0:38 | Insight dan solusi (~45 kata)
"I almost built a bot to fill it for her. She said no: 'Don't fill it blindly. Sit next to me.' So I built Savvy.AI, a browser copilot that fills forms with you, not for you. Understand. Fill. Audit."

*Visual:* logo muncul pada kata "Savvy.AI", tiga kata muncul berurutan.

### 0:38-1:33 | Demo langsung (~100 kata, sisanya diam atau suara klik)

**Understand (0:38-0:58)**
"Understand. I click a confusing field. Field Coach explains the term in plain language, how to fill it, the common trap, and cites the official guideline, retrieved from Muse Vector Store."

**Fill (0:58-1:13)**
"Fill. My data lives in an encrypted local vault. One click fills the form, and one click undoes it. Sensitive fields are masked before anything reaches a model."

**Audit (1:13-1:33)**
"Audit. Before submit, the auditor cross-checks the form. Here, the birth date doesn't match the ID number. Red light. I fix it, and it turns green. The passport photo is checked against ICAO rules without changing a single pixel."

*Visual:* rekam layar asli, tanpa slide. Beri spotlight pada kartu panduan dan lampu lalu lintas.

### 1:33-2:30 | Agent trace dan Meta tools (~90 kata)
"Let's look under the hood. Savvy is a ReAct agent loop on Meta's Model API. Muse Spark decides which tools to call: file search over official regulations in Muse Vector Store, web search for the latest notices, and code execution for date math. Format rules run as deterministic code. Then a separate verifier call scores the draft. Here the score is 0.71, so it fails. The weakest part goes back to the model, it revises, and the second check passes at 0.93. Every step, in one request, is visible here."

*Visual:* buka panel trace, sorot tiga hal berurutan: (1) nama tool Meta (`file_search`, `web_search`, `code_execution`), (2) baris `verifier_eval_pass` gagal, (3) baris revisi dan lulus. Tampilkan juga diagram singkat dari README selama 5-8 detik.

### 2:30-2:48 | Hasil ukuran (~40 kata)
"We tested [N] forms. Against a single-shot model, grounded accuracy went from 61 to 98 percent, and false rejections dropped from 18 to under one percent. No sensitive data left the device in our tests."

*Visual:* tabel evaluasi, sorot dua baris utama saja.

### 2:48-3:00 | Penutup (~38 kata)
"Savvy also has hands-free voice mode and reading aids for ADHD and dyslexia. Behind every form is someone's dream. Savvy.AI: understand, fill, audit. Before you press submit. Open source at [link]."

*Visual:* tagline, URL repo, logo hackathon. Musik naik lalu berhenti.

**Total sekitar 360 kata.** Dengan kecepatan 140-150 kata per menit, itu sekitar 2,5 menit bicara. Sisa waktu untuk jeda dan momen demo tanpa suara.

## Persiapan demo

- **Picu kegagalan dengan sengaja.** Siapkan satu input yang andal membuat skor verifier di bawah ambang pada percobaan pertama, supaya momen retry muncul setiap kali rekaman. Pastikan itu benar-benar terjadi di loop (panggilan `verifier_eval_pass`), bukan dibuat-buat di UI.
- **Siapkan data audit:** satu form dengan ketidakcocokan tanggal lahir vs NIK yang jelas, lalu versi yang sudah benar.
- **Tampilkan nama tool Meta di layar** (panel trace atau label diagram), karena juri yang tidak membuka repo harus tetap melihatnya.
- Rekam layar dulu, voice-over belakangan. Bacakan naskah dengan timer minimal tiga kali.
- Zoom ke area penting, karena juri mungkin menonton di layar kecil.
- Potong waktu tunggu atau percepat, tapi biarkan stempel waktu di trace tetap terlihat.

## Kalau durasi melebihi 3:00

Potong dalam urutan ini:
1. Kalimat tentang voice mode dan reading aids di penutup.
2. Sub-bagian Fill di demo (cukup 8 detik).
3. Baris kedua di slide hasil ukuran.

**Jangan dipotong:** hook cerita, demo Understand dan Audit, momen gagal lalu retry di trace.

## Klaim yang harus diverifikasi sebelum direkam

| Klaim di draf | Tindakan |
|---|---|
| "43% pendaftar beasiswa dan visa gugur..." | Tidak ada sumber. Beri sumber atau **hapus**. Naskah di atas sengaja tidak memakainya. |
| 61.2% → 98.4%, 18.5% → 0.8%, 79.0% → 99.8% | Pakai hanya kalau ini hasil ukuran asli. Sebutkan jumlah form uji. |
| "PII leak 0%" / "100% privacy guaranteed" | Ganti dengan klaim yang bisa dibuktikan, misalnya "0 kebocoran di N pengujian". Kata "guaranteed" mudah dipatahkan juri. |
| "Compound Multi-Agent" | Sekarang bisa dipertanggungjawabkan: ada agen berperan berbeda (Field Coach, Manual Researcher, Essay Coach, Verifier) dengan `reasoning_effort` dan tool berbeda. Tetap tulis apa adanya di README. |
| Nama model dan tool Meta, ICAO 9303, enkripsi "standar industri" | Pastikan nama dan fitur sesuai dokumentasi dan kodemu. Sebut algoritmanya (misalnya AES-GCM) kalau memang dipakai. |

## Checklist akhir

- [ ] Durasi ≤ 3:00, tidak ada bagian yang terburu-buru
- [ ] Nama tool Meta terlihat dan terdengar
- [ ] Ada satu momen gagal lalu diperbaiki di trace
- [ ] Semua angka berasal dari ukuran asli
- [ ] Subtitle terpasang, audio jelas
- [ ] Link repo dan simulator di akhir video bisa dibuka
- [ ] Isi video konsisten dengan README
