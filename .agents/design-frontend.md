# Savvy.AI: Design System

_Berbasis fondasi template SkyAgent (Magic UI) dan konvensi shadcn/ui, disesuaikan untuk ekstensi browser yang dipakai orang tua dan pendaftar form. Token ada di `tokens.css`._

## 1. Sumber dan batasan

- Sumber: https://agent-magicui.vercel.app/ , template landing page "SkyAgent" dari Magic UI.
- Yang bisa saya baca dari halaman itu hanya teks dan struktur. Warna, font, dan nilai CSS persisnya **tidak terbaca**. Karena itu token memakai konvensi shadcn/ui (netral hitam-putih, variabel CSS, mode terang/gelap), yang menjadi pasangan Magic UI, bukan nilai yang disalin dari situsnya.
- SkyAgent adalah halaman pemasaran, bukan UI aplikasi. Pola aplikasi (status, lencana sumber, kartu panduan, log) dirancang baru di sini.
- Magic UI (pustaka) berlisensi MIT. Lisensi template SkyAgent sendiri **belum saya pastikan**. Cek repositori sebelum menyalin kodenya.

## 2. Prinsip

1. **Jelas sebelum cantik.** Pengguna utama adalah orang tua dan orang yang sedang cemas soal berkas. Satu layar, satu keputusan.
2. **Warna tidak pernah sendirian.** Setiap status memakai ikon dan kata, bukan hanya warna.
3. **Aman terlihat aman.** Savvy tidak pernah mengirim form. Tombol dan teks harus mengatakan apa yang akan terjadi dan bahwa bisa dibatalkan.
4. **Satu momen gerak.** Gerak hanya untuk satu hal: proses pemeriksaan foto. Sisanya diam.
5. **Label "Resmi" ditentukan kode.** Gaya visual tidak boleh membuat saran AI tampak resmi.

## 3. Yang diambil dari SkyAgent, dan yang diubah

| Elemen SkyAgent | Dipakai di Savvy | Perubahan |
|---|---|---|
| Netral hitam-putih, mode terang/gelap, tombol ganti tema | Ya | Kontras dinaikkan, ukuran teks minimal 16 px |
| Kartu bergaya bento dengan sudut membulat | Ya, untuk panel samping | Satu ukuran radius, tanpa kartu dekoratif |
| Langkah "Ask → Process → Result → Improve" | Ya, sebagai alur Paham → Isi → Periksa | Hanya jika isinya memang berurutan |
| Akordeon FAQ | Ya, untuk bantuan di panel | Dibuka dengan Enter/Spasi, bukan hover |
| Marquee testimoni, animasi latar, gradien | **Tidak** | Mengganggu fokus dan membebani halaman portal |
| Harga, CTA bergambar | Tidak | Tidak relevan di aplikasi |

## 4. Token (ringkas)

| Kategori | Nilai | Catatan |
|---|---|---|
| Teks isi | 18 px, line-height 1,6 | Teks terkecil 16 px |
| Judul | 20 / 24 / 30 px | Kalimat biasa, bukan huruf kapital semua |
| Font | Inter (dibundel di ekstensi), cadangan `system-ui` | Tidak memuat font dari CDN |
| Spasi | kelipatan 4 px | `--space-1` sampai `--space-6` |
| Radius | 12 px kartu, 8 px kontrol kecil | |
| Target sentuh | minimal 48 px | Tombol, lencana yang bisa ditekan |
| Fokus | garis 3 px biru, offset 2 px | Selalu terlihat |
| Gerak | 120 / 200 ms, `prefers-reduced-motion` dihormati | |

Warna status (terang | gelap) sudah dipilih agar teks memenuhi kontras AA. Lihat `tokens.css`.

## 5. Komponen

### 5.1 Button

| Varian | Dipakai untuk |
|---|---|
| Utama | Satu aksi terpenting di panel (mis. "Isi untuk saya") |
| Sekunder | "Lihat dulu", "Lewati" |
| Hantu | Aksi kecil dan bantuan |
| Bahaya | Hanya untuk menghapus data pengguna |

- Tinggi minimal 48 px, label kata kerja ("Isi kolom ini", bukan "Submit").
- Status: biasa, hover, ditekan, nonaktif (tetap terbaca), memuat (teks "Sedang memeriksa…", bukan hanya spinner).
- Aksesibilitas: elemen `<button>`, fokus terlihat, Enter dan Spasi bekerja.

### 5.2 StatusChip (lampu lalu lintas)

| Status | Ikon | Kata | Warna |
|---|---|---|---|
| Aman | centang | "Sudah benar" | success |
| Perlu dicek | segitiga | "Periksa dulu" | warning |
| Salah | silang | "Perlu diperbaiki" | danger |

- Selalu ikon, kata, dan warna bersama-sama. `role="status"`, dibacakan pembaca layar sebagai teks kata.
- Jangan pakai istilah "Traffic Light" di antarmuka pengguna.

### 5.3 SourceBadge (lencana sumber)

| Lencana | Arti | Syarat (diputuskan kode) |
|---|---|---|
| Resmi | Ada sitasi dari juknis resmi atau domain tepercaya | Sitasi file/halaman ada, atau domain di daftar tepercaya |
| Dikurasi | Disusun tim dan ditinjau | Ada penanda `curated` di database |
| Saran AI | Belum ada sumber resmi | Selain dua di atas |

- Lencana "Resmi" menampilkan nama dokumen dan halaman ("juknis-visa.pdf, hlm. 45"). Tanpa sumber, tidak boleh tampil.
- "Saran AI" memakai warna peringatan dan kalimat "Periksa ke penyelenggara".

### 5.4 FieldCoachCard (kartu panduan kolom)

Isi berurutan: arti kolom, cara mengisi, contoh, lencana sumber, tombol "Isi untuk saya" dan "Dengar penjelasan".

- Muncul di panel samping, tidak menimpa halaman portal.
- Status: memuat (kerangka abu-abu tanpa animasi berlebihan), terisi, gagal ("Belum bisa menemukan panduan. Isi manual atau tanya penyelenggara.").
- Teks maksimal sekitar 60 karakter per baris.

### 5.5 PhotoAuditCard (momen puncak)

- Menampilkan foto pengguna dengan lapisan mask hasil SAM, angka ukuran (mis. rasio kepala), dan tiga StatusChip.
- **Satu-satunya tempat gerak boleh menonjol:** garis tepi bergerak (mis. komponen Border Beam dari Magic UI) hanya selama pemeriksaan berjalan, berhenti saat hasil keluar. Dengan `prefers-reduced-motion`, ganti menjadi teks "Sedang memeriksa…".
- Pelanggaran ditandai di foto dengan kotak dan nomor, dan setiap nomor dijelaskan dalam satu kalimat.

### 5.6 UndoBar

- Muncul di bawah panel setelah "Isi untuk saya": "Sudah diisi 4 kolom. [Batalkan]".
- Bertahan sampai pengguna menutupnya (tidak hilang sendiri dalam 3 detik). `role="status"`, tombol Batalkan fokus-able.

### 5.7 EventLog (jejak aksi)

- Daftar kronologis: waktu, aksi, hasil, dan apakah disetujui pengguna. Bisa dibuka lewat "Lihat apa yang dilakukan Savvy".
- Entri baru boleh masuk dengan transisi singkat (komponen Animated List dari Magic UI), tanpa gerak jika `reduced-motion`.

### 5.8 VoiceButton

- Tekan-dan-tahan atau ketuk untuk mulai/berhenti. Ukuran minimal 56 px.
- Status: siap, mendengar (indikator tingkat suara + teks "Mendengarkan"), memproses, gagal ("Tidak terdengar. Coba lagi."). Transkrip ditampilkan agar bisa dikoreksi.

## 6. Penulisan teks antarmuka

| Hindari | Pakai |
|---|---|
| Traffic Light | Pemeriksaan |
| Vault | Brankas data (tersimpan di perangkat Anda) |
| Submit | Kirim (dilakukan Anda sendiri di portal) |
| Error | Ada yang perlu diperbaiki |
| Autofill | Isi untuk saya |

- Kalimat biasa, kata kerja aktif, nama aksi sama di seluruh alur ("Batalkan" menghasilkan "Dibatalkan").
- Pesan gagal menyebut apa yang terjadi dan langkah berikutnya, tidak meminta maaf berlebihan.

## 7. Implementasi di ekstensi

1. **Pasang UI di Shadow DOM**, bukan langsung di halaman. Ini mencegah CSS portal merusak komponen, dan sebaliknya mencegah Tailwind (preflight) merusak portal.
2. **Gunakan `px`, bukan `rem`**, di dalam Shadow DOM. `rem` mengikuti `html` milik portal. Beberapa utilitas Tailwind berbasis `rem`: atur ulang skala spasi dan font di konfigurasi.
3. Pakai komponen **shadcn/ui** sebagai dasar (Button, Accordion, Tabs, Sheet untuk panel). Salin komponen Magic UI yang dibutuhkan saja (Border Beam, Animated List), bukan seluruh pustaka, agar ukuran paket kecil.
4. Gerak memakai `prefers-reduced-motion` dari `tokens.css`. Uji dengan opsi sistem "kurangi gerakan" menyala.
5. Font Inter dibundel di ekstensi (woff2). Tidak ada permintaan jaringan untuk gaya atau font.
6. Panel samping tidak boleh menutupi kolom form yang sedang diisi, dan tidak boleh mengambil fokus tanpa tindakan pengguna.

## 8. Daftar periksa sebelum demo

- [ ] Semua teks isi >= 16 px, target sentuh >= 48 px
- [ ] Setiap status punya ikon dan kata
- [ ] Fokus keyboard terlihat di semua kontrol, urutan tab masuk akal
- [ ] Kontras teks >= 4,5:1 di mode terang dan gelap
- [ ] Gerak mati saat `prefers-reduced-motion`
- [ ] Lencana "Resmi" hanya muncul jika kode menemukan sumbernya
- [ ] Tidak ada elemen yang mengirim form
- [ ] Panel tampil benar di portal uji (CSS portal tidak bocor)
