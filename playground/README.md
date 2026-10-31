# Owly.AI - Baseten & Muse Spark Open Playground (Node.js)

Folder ini berisi kumpulan skrip modular untuk menguji kemampuan model **Muse Spark Open** (`meta-models/muse-spark-open-1026`) via Baseten Inference API menggunakan **Node.js murni (Zero external dependencies)**, berpedoman pada dokumentasi resmi [Meta Prompting Guide](https://dev.meta.ai/docs/muse-spark-open/prompting).

---

## 📁 Struktur File & Peta Kapabilitas

| File | Fitur / Spesifikasi Meta | Deskripsi Eksperimen |
|---|---|---|
| [`client.js`](file:///d:/webdev/laragon/www/savvy/playground/client.js) | Core Client Wrapper | Membaca `.env`, memformat payload OpenAI-compatible (`reasoning_effort`, `tools`, `stream`, `chat_template_kwargs`), dan parsing respons. |
| [`baseten.js`](file:///d:/webdev/laragon/www/savvy/playground/baseten.js) | Connectivity Test | Ping & verifikasi akses endpoint `meta-models/muse-spark-open-1026`. |
| [`01-reasoning.js`](file:///d:/webdev/laragon/www/savvy/playground/01-reasoning.js) | Reasoning Prompting | Cross-field sanity check NIK vs Tanggal Lahir & validitas paspor secara nalar mendalam. |
| [`02-decision.js`](file:///d:/webdev/laragon/www/savvy/playground/02-decision.js) | Structured JSON Output | Klasifikasi risiko field formulir dan pengambilan keputusan otomatis dalam skema JSON. |
| [`03-chaining.js`](file:///d:/webdev/laragon/www/savvy/playground/03-chaining.js) | Prompt Chaining | Pipeline penalaran bertahap 3-step (Ekstraksi Rubrik ➔ Kerangka Esai ➔ Draf Akhir). |
| [`04-last-response.js`](file:///d:/webdev/laragon/www/savvy/playground/04-last-response.js) | Multi-turn Chat Context | Retensi histori percakapan antar turn pesan. |
| [`05-web-search.js`](file:///d:/webdev/laragon/www/savvy/playground/05-web-search.js) | Manual RAG Grounding | Pola Researcher Agent mensitasi referensi regulasi web resmi `.go.id`. |
| [`06-file-search.js`](file:///d:/webdev/laragon/www/savvy/playground/06-file-search.js) | Document RAG | Field Coach menyusun Kartu Panduan 4-Elemen dari potongan juknis resmi. |
| [`07-audio-transcribe.js`](file:///d:/webdev/laragon/www/savvy/playground/07-audio-transcribe.js) | Text-to-Form Parser | Ekstraksi entitas isian formulir dari teks ucapan verbal pendaftar. |
| [`08-reasoning-effort.js`](file:///d:/webdev/laragon/www/savvy/playground/08-reasoning-effort.js) | **`reasoning_effort` & Strength Override** | Menguji parameter `low`, `medium`, `high`, `xhigh` serta override via System Prompt `Reasoning strength: N`. |
| [`09-native-tool-calling.js`](file:///d:/webdev/laragon/www/savvy/playground/09-native-tool-calling.js) | **Native Tool Calling (Function Calling)** | Implementasi native OpenAI tools array, event loop eksekusi tool, dan **Parallel Tool Calling** multi-fungsi. |
| [`10-multimodal-vision.js`](file:///d:/webdev/laragon/www/savvy/playground/10-multimodal-vision.js) | **Native Multimodal Vision** | Input visual dokumen via partisi typed content `{"type": "image_url", ...}` (token `<|patch|>`). |
| [`11-multimodal-audio.js`](file:///d:/webdev/laragon/www/savvy/playground/11-multimodal-audio.js) | **Native Multimodal Audio & Video** | Pengiriman file rekaman suara langsung via `{"type": "audio_url", ...}` (token `<|audio|>`). |
| [`SETTINGS.md`](file:///d:/webdev/laragon/www/savvy/playground/SETTINGS.md) | **Recommended Settings Reference** | Dokumentasi acuan resmi Meta: matriks `reasoning_effort`, sampling parameter, 1M sliding context, stop tokens `<|eom|>` vs `<|eot|>`, dan parser runtime. |
| [`12-streaming-reasoning.js`](file:///d:/webdev/laragon/www/savvy/playground/12-streaming-reasoning.js) | **SSE Streaming & Reasoning Trace** | Menangkap stream real-time dan memisahkan visual warna antara token penalaran (`reasoning_content`) dan jawaban akhir (`content`). |

---

> 📖 **Panduan Lengkap Pengaturan:** Rincian sampling parameter, stop tokens, dan matriks pemanfaatan level nalar resmi dapat dibaca di **[`SETTINGS.md`](file:///d:/webdev/laragon/www/savvy/playground/SETTINGS.md)**.

## ⚙️ Persiapan

Pastikan API Key Baseten sudah terpasang di file `playground/.env`:
```env
APIKEY=b10_zqaOAtiM...
```

---

## 🚀 Cara Menjalankan

Jalankan skrip yang ingin diuji melalui terminal di folder `playground/` menggunakan `node` atau `npm run`:

```bash
# 1. Uji koneksi dasar
npm run test:baseten

# 2. Uji penalaran dasar & alur formulir
npm run test:reasoning
npm run test:decision
npm run test:chaining
npm run test:last-response
npm run test:web-search
npm run test:file-search
npm run test:audio

# 3. Uji fitur arsitektur Meta Muse Spark Open (Fitur Baru)
npm run test:effort            # Kontrol reasoning_effort & system prompt override
npm run test:tools             # Native tool calling & parallel execution
npm run test:vision            # Native image_url multimodal
npm run test:multimodal-audio  # Native audio_url multimodal
npm run test:stream            # Streaming pemisahan reasoning vs content
```
