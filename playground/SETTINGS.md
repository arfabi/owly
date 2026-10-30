# Panduan Rekomendasi Pengaturan (Settings) - Muse Spark Open

Dokumen ini merangkum acuan teknis resmi dari [Meta AI Docs: Recommended Settings](https://dev.meta.ai/docs/muse-spark-open/settings) untuk mengoptimalkan inferensi model **Muse Spark Open** (`meta-models/muse-spark-open-1026`) pada skenario pengujian di folder `playground/` dan arsitektur produk **Savvy.AI**.

---

## 1. Matriks Reasoning Effort vs Karakteristik Tugas

Muse Spark Open selalu melakukan penalaran sebelum memberikan jawaban. Kekuatan nalar (*Reasoning Strength*) adalah **tuas terbesar** yang menentukan kualitas jawaban sekaligus konsumsi token dan waktu latensi.

| `reasoning_effort` | Token Nalar (Rendered) | Rekomendasi Kasus Penggunaan Resmi Meta | Penerapan di Savvy.AI |
|---|:---:|---|---|
| **`low`** | **8** | Klasifikasi, ekstraksi entitas formulir, pertanyaan langsung, dan *short tool loops*. | • Verifikasi regex NIK, Paspor, & Tanggal Lahir.<br>• Ekstraksi form suara (`07-audio-transcribe.js`).<br>• Klasifikasi intent aksi pendaftar. |
| **`medium`** | **32** | Tugas agentic umum (*General agentic work*). | • **Field Coach Card** (instruksi 4-elemen per kolom).<br>• Analisis potongan visual formulir (*Explain This*). |
| **`high`** | **256** | Penalaran multi-tahap, debugging rumit, dan *long tool loops*. | • **Essay Coach** (sintesis 3-step esai beasiswa/LPDP).<br>• **Consistency Checker** (audit silang antar-kolom). |
| **`xhigh`** *(Default)* | **512** | Masalah mendalam di mana akurasi/kedalaman lebih diutamakan daripada kecepatan/latensi. | • Analisis pertentangan regulasi birokrasi & hukum kependudukan yang sangat rumit. |

> [!WARNING]
> **Penting Mengenai Nilai Default:** Jika parameter `reasoning_effort` tidak ditentukan pada request, model otomatis menggunakan **`xhigh` (512 token)**. Untuk interaksi real-time di antarmuka ekstensi browser, selalu setel `reasoning_effort: "low"` atau `"medium"` agar respon diterima dalam <1 detik.

---

## 2. Parameter Sampling Resmi

Rekomendasi konfigurasi sampling baku dari tim peneliti Meta:
```json
{
  "temperature": 1.0,
  "top_p": 1.0,
  "do_sample": true
}
```
*Catatan:* Evaluasi resmi dan tolok ukur benchmark pada *Model Card* Meta diukur menggunakan nilai di atas bersama `reasoning_effort: "xhigh"`. Pada Muse Spark Open, tingkat determinisme lebih efektif dikendalikan melalui level nalar (`reasoning_effort`) daripada sekadar mengecilkan `temperature` ke `0.0`.

---

## 3. Arsitektur Memori 1 Juta Token (Sliding-Window Attention)

Model memiliki jendela konteks sebesar **1.048.576 token (1M tokens)** dengan arsitektur hibrida pada 62 decoder layers:
- **46 layer** menggunakan *sliding-window attention* (hanya memproses 2.048 token terbaru).
- **16 layer** menggunakan *full attention* (mempertahankan KV cache untuk seluruh 1M token).

**Implikasi:**
Alokasi memori VRAM untuk KV cache hanya membesar pada 16 layer full-attention. Namun, pada runtime inference mandiri (SGLang/vLLM), disarankan membatasi `--context-length` atau `--max-model-len` sesuai kebutuhan beban kerja nyata (misal: 16k–32k token) guna menghemat memori GPU.

---

## 4. Aturan Kritis Stop Tokens (`<|eom|>` vs `<|eot|>`)

| Token | ID Token | Penjelasan & Peran | Aturan Integrasi |
|---|:---:|---|---|
| `<|begin_of_text|>` | `200000` | Awal urutan prompt (`bos_token_id`). | Digenerate oleh template server. |
| `<|end_of_text|>` | `200001` | Akhir teks dari dokumen. | Termasuk dalam `eos_token_id`. |
| `<|eom|>` | `200007` | **End of Message:** Menandai berakhirnya satu pesan, tetapi giliran percakapan (*turn*) **MASIH BERLANJUT** (misal: jeda berpikir nalar, komentar sementara, atau sebelum memanggil native tool). | ⚠️ **PANTANGAN KERAS: JANGAN JADIKAN STOP TOKEN!** Jika server berhenti pada `<|eom|>`, model akan terpotong sebelum mengeksekusi tool call atau menghasilkan jawaban akhir. |
| `<|eot|>` | `200008` | **End of Turn:** Menandai bahwa giliran asisten telah selesai sepenuhnya. | Termasuk dalam `eos_token_id`. |

*Kombinasi `eos_token_id` resmi:* `[200001, 200008]`.

---

## 5. Parser Flags untuk Self-Hosted Server

Jika menjalankan model secara mandiri (*self-hosted*):
- **SGLang:**
  ```bash
  python -m sglang.launch_server \
    --model-path meta-models/Muse-Spark-Open-816B-A42B \
    --reasoning-parser muse \
    --tool-call-parser muse
  ```
- **vLLM:**
  ```bash
  vllm serve meta-models/Muse-Spark-Open-816B-A42B \
    --reasoning-parser muse \
    --tool-call-parser muse \
    --enable-auto-tool-choice
  ```
- **TensorRT-LLM:**
  ```bash
  --reasoning_parser musespark --tool_parser musespark
  ```

---

## 6. Praktik Terbaik Streaming

Untuk inferensi dengan nalar panjang (`reasoning_effort: "high"` atau `"xhigh"`), wajib mengaktifkan `stream: true`. Hal ini mencegah koneksi HTTP terputus akibat batas timeout serverless (seperti Vercel 10s–15s limit) dan memungkinkan pemisahan visual token nalar (`reasoning_content`) serta jawaban (`content`) secara instan seperti pada [`12-streaming-reasoning.js`](file:///d:/webdev/laragon/www/savvy/playground/12-streaming-reasoning.js).
