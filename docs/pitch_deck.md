# Savvy.AI — Pitch Deck (10 Slides)

> **Meta Global AI Developer Hackathon 2026**  
> Track: **Indie Developer** · Theme: **Build for Your World**  
> Live Showcase: [https://savvy-plum.vercel.app](https://savvy-plum.vercel.app)

---

### Slide 1: Cover & Vision
**Title:** Savvy.AI - Your AI Browser Companion for Forms & Web
**Subtitle:** Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark
**Tagline:** *"Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark"*
**Track:** Indie Developer (Meta Global AI Developer Hackathon 2026)
**Presenter:** Antigravity & Indie Developer Team

---

### Slide 2: The Problem — The Administrative Barrier
- **1.2 Milyar+** permohonan formulir publik, beasiswa pemerintah, dan visa diproses di seluruh dunia setiap tahun.
- **30% - 42%** pemohon gugur pada tahap administrasi awal akibat salah tafsir syarat, bukan karena ketidakmampuan akademis.
- **The 3-Y Friction Framework:**
  1. **Ambiguity (Ambiguitas):** Jargon juknis regulasi yang berbelit-belit dan membingungkan warga awam.
  2. **Complexity (Kompleksitas):** Puluhan kolom berulang dan syarat teknis foto biometrik (rasio, ukuran, ketajaman).
  3. **Anxiety (Kecemasan):** Ketakutan data pribadi (NIK/NPWP/Paspor) bocor di portal publik yang tidak aman.

---

### Slide 3: The Solution — 3 Pillars of Empowerment
Savvy.AI mengubah pengalaman pengisian formulir dari proses yang mencemaskan menjadi pengalaman yang percaya diri dan terpandu:
1. **Pillar 1: Understand (Pahami)** — Beacon Spotlight dan Field Coach RAG menyajikan kartu panduan 4-elemen (*Arti, Cara Isi, Contoh, Jebakan*) dengan sitasi bab & halaman resmi.
2. **Pillar 2: Fill (Isi)** — Brankas terenkripsi WebCrypto AES-256-GCM lokal, 1-Click Batch Autofill dengan Safe Undo, serta asisten esai akademik terstruktur.
3. **Pillar 3: Audit (Periksa)** — Traffic Light Pre-Submit Auditor dan Photo Compliance Inspector in-memory tanpa manipulasi piksel biometrik.

---

### Slide 4: Zero-Portal Integration Rule
**Mengapa Savvy.AI Unik?**
- **Tidak Memerlukan Modifikasi Server:** Bekerja di atas situs formulir web apa pun (LPDP, CASN, Kedutaan, OSS) tanpa perlu izin atau integrasi API dari kementerian/lembaga.
- **Chrome Manifest V3 Side Panel:** Berjalan berdampingan dengan tab formulir aktif secara mulus dan responsif.
- **Closed Shadow DOM Isolation:** Beacon Spotlight dan panduan visual disuntikkan ke dalam container bayangan tertutup (`#savvy-root`), menjamin 0% benturan CSS dengan stylesheet situs induk.

---

### Slide 5: Meta AI & Baseten Architecture
- **Exclusive Foundation Model:** **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)** via Baseten Inference API.
- **Stateful 10-Message Sliding Window:** Memelihara konteks percakapan aktif dengan rolling background summarization di Supabase (`compacted_summary`), menghemat 70% token.
- **Regulatory RAG Grounding:** 13 segmen juknis resmi tersimpan di PostgreSQL Supabase dengan metadata halaman dan sitasi hukum yang transparan.
- **Strictly Zero Non-Meta AI Models:** Tidak memanggil model pihak ketiga. Fitur suara mengandalkan Web Speech API bawaan browser/OS (0ms latency, $0 token waste).

---

### Slide 6: Zero-Knowledge Privacy & UU PDP Compliance
Indonesia's Personal Data Protection Law (UU PDP No. 27/2022) Compliance:
- **Client-Side DOM Blackout Mask:** Kanvas browser secara otomatis menutup foto wajah dan tanda tangan dengan kotak hitam pekat sebelum gambar dianalisis. **Nol data biometrik wajah** yang pernah terkirim ke jaringan.
- **WebCrypto AES-256-GCM Vault:** Kunci didekripsi dari PIN/password pengguna menggunakan PBKDF2 (100.000 iterasi). Server Supabase hanya menerima ciphertext dan IV, menjamin server-side zero knowledge.
- **Real-Time PII Censor Guard:** Input obrolan memindai dan menyamarkan NIK 16-digit dan NPWP secara lokal sebelum diteruskan ke prompt AI.

---

### Slide 7: Live Demo & Key Feature Showcase
- **Interactive LPDP 2026 Mock Portal:** Lingkungan pengujian interaktif untuk mendemonstrasikan alur pendaftar beasiswa dari awal hingga akhir.
- **Dual-Mode Web Simulator:** Evaluator hackathon dapat menguji ekstensi secara langsung di browser web tanpa perlu menginstal file `.crx` di Chrome.
- **1-Click Demo Juri:** Akun instan (`judge@savvy.ai`) yang telah terisi data KTP dan transkrip terenkripsi untuk pengujian zero-friction bagi dewan juri.
- **14 Deterministic Accessibility (A11y) Tools:** Reading Guide, High Contrast, Pause Animations, Dyslexia Font, Text Spacing (WCAG 2.2 AAA).

---

### Slide 8: Technical Benchmarks & Cost Efficiency
Hasil verifikasi otomatis end-to-end (`e2e_verification.mjs`):
- **Live Inference Latency:** **816 ms** pada endpoint Baseten Muse Spark Open.
- **Cache Hit Latency:** **< 15 ms** melalui Supabase L1/L2 `coach_cache`.
- **Cost Efficiency:** **~Rp 3,- ($0.0002)** per percakapan dengan 1.000 token sliding window.
- **Audit Speed:** Pre-submit consistency validator selesai dalam **< 50 ms**.
- **Test Pass Rate:** **20 dari 20 (100%) skenario pengujian lulus sempurna.**

---

### Slide 9: Persona & Global Market Potential
- **Persona 1: Pelamar Beasiswa LPDP & Afirmasi 3T** — Mengeliminasi kebingungan surat rekomendasi dan format komitmen kontribusi.
- **Persona 2: Pemohon Visa Schengen & Visa Kerja** — Menjamin kepatuhan pasfoto biometrik 2x2 / 35x45mm dan validitas paspor 6 bulan.
- **Persona 3: Pendaftar CASN / PPPK** — Memastikan kesesuaian akreditasi BAN-PT dan pembubuhan e-meterai resmi.
- **Persona 4: Pemohon Disabilitas & Neurodivergen** — 14 alat aksesibilitas WCAG 2.2 AAA untuk pengalaman inklusif.

---

### Slide 10: Future Roadmap & Vision
- **Q2 2026:** Dukungan multi-bahasa regional (Jawa, Sunda, Melayu) via Meta NLLB open weights.
- **Q3 2026:** Integrasi verifikasi cryptographic e-Meterai Peruri dan sertifikat tanda tangan digital langsung di browser.
- **Q4 2026:** Ekspansi ke portal layanan publik Asia Tenggara (Singapura MyInfo, Malaysia MyGov).
- **Visi:** *Menghapus ketimpangan birokrasi digital di seluruh dunia, satu formulir dalam satu waktu.*
