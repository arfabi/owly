# Savvy.AI: File Search & Vector Stores (Muse Spark)

> Konsep, limit, biaya, dan implementasi File Search untuk Savvy.AI. RAG tanpa bikin pgvector sendiri.
>
> **Dokumen terkait:** `multi_chain_cache.md` (`getCurrentChainId`, `saveChainId`, skema Supabase), `web_search_tool.md` (`web_search` dan Manual Researcher), `multi_agents.md` (arsitektur agent).

## 1. Apa itu File Search?

File Search adalah **RAG (Retrieval-Augmented Generation) bawaan Meta**. Kamu upload PDF juknis, Meta yang urus chunking + embedding + search + sitasi.

Tanpa File Search:
```
Officer upload PDF 100 halaman -> Kamu chunk manual -> embedding via API -> simpan pgvector Supabase -> search manual -> kirim 3 chunk ke prompt (boros token)
```

Dengan File Search:
```
Officer upload PDF -> Upload ke Meta Vector Store -> Meta auto chunk + embedding
User tanya -> Agent otomatis call tool file_search -> Meta balikin 3 chunk + sitasi halaman
```

Kamu cuma kirim pertanyaan 20 token, bukan 100 halaman.

## 2. Konsep Vector Store

Vector Store = container untuk file-file yang sudah di-embedding.

```
API Key kamu (1):
  ├─ vs_evisa_imigrasi_go_id (vector store ID: vs_abc123)
  │   ├─ juknis-evisa-2026.pdf (512 MB max)
  │   ├─ faq-evisa.pdf
  │   └─ contoh-foto.pdf
  ├─ vs_lpdp_2026 (vs_def456)
  │   ├─ juknis-lpdp.pdf
  │   └─ panduan-essay.pdf
  └─ vs_paspor_2026 (vs_ghi789)
      └─ juknis-paspor.pdf
```

- 1 Vector Store = 1 Portal (reuse untuk 10 user)
- Bukan 1 Vector Store = 1 User (jangan, boros limit)

## 3. Limit Resmi (per 27 Okt 2026)

### Per File
- Max size: 512 MB / file
- Format: PDF, DOCX, TXT, MD, JSON
- Max token: ~5 juta token / file (~3.500 halaman)
- Juknis e-Visa 30 halaman = ~20k token = aman

### Per Vector Store
- Max 10.000 file / vector store
- Max 100 GB storage / vector store
- Max 20 chunks balik per query file_search (tiap chunk ~800 token)

### Per API Key / Org
- Max 100 vector stores / API key (tier hackathon $150)
- Bisa request naik ke 500 untuk production
- Savvy butuh 4-10 vector stores saja -> masih sisa 90

### Rate Limit
- Upload: ~100 file / menit
- Query file_search: ~100 req / menit per API key

## 4. Alur Implementasi untuk Savvy.AI

### Step 1: Buat Vector Store (sekali per portal)

```js
// lib/vectorStore.js
import MetaAI from '@meta-ai/sdk'
const meta = new MetaAI({ apiKey: process.env.META_API_KEY })

export async function createPortalVectorStore(portalKey) {
  const vs = await meta.vectorStores.create({
    name: `savvy_${portalKey}`,
    metadata: { portal: portalKey, type: 'official' }
  })
  await supabase.from('vector_stores').insert({
    portal_key: portalKey,
    vector_store_id: vs.id,
    name: vs.name
  })
  return vs.id
}

// Contoh: createPortalVectorStore('evisa.imigrasi.go.id') -> vs_abc123
```

### Step 2: Upload File dari Studio Officer

```js
export async function uploadJuknisToVectorStore({ vectorStoreId, filePath, fileName }) {
  // Guard: jangan upload PII!
  if (fileName.includes('KTP') || fileName.includes('KK')) {
    throw new Error('Jangan upload KTP/KK ke Vector Store! Simpan di Vault lokal.')
  }

  // Guard: size check
  const stats = await fs.stat(filePath)
  if (stats.size > 512 * 1024 * 1024) {
    throw new Error('File >512MB, pecah jadi beberapa PDF')
  }

  const file = await meta.vectorStores.files.upload({
    vector_store_id: vectorStoreId,
    file: fs.createReadStream(filePath),
    metadata: { uploaded_by: 'officer', status: 'official' }
  })

  // Tunggu sampai ready (polling)
  let status = 'processing'
  while (status === 'processing') {
    const f = await meta.vectorStores.files.retrieve(vectorStoreId, file.id)
    status = f.status // 'ready' atau 'failed'
    await new Promise(r => setTimeout(r, 2000))
  }

  return file.id
}
```

### Step 3: Pakai di Field Coach (Combo dengan previous_response_id)

```js
export async function askWithFileSearch({ userId, tabId, portalKey, question }) {
  // 1. Ambil vector store ID untuk portal ini (reuse, bukan bikin baru)
  const { data } = await supabase
    .from('vector_stores')
    .select('vector_store_id')
    .eq('portal_key', portalKey)
    .single()

  const vectorStoreId = data.vector_store_id // vs_abc123

  // 2. Ambil chain ID per user per tab (anti tercampur) - lihat multi_chain_cache.md
  const chain = await getCurrentChainId(userId, tabId)

  // 3. Prompt sudah di-redact
  const prompt = `Portal: ${portalKey}, Field: ${question}. Cari di juknis resmi. Badge harus Official jika ada sitasi file.`

  let response
  if (!chain?.currentId) {
    response = await meta.responses.create({
      model: 'muse-spark-1.3',
      input: prompt,
      reasoning_effort: 'low',
      tools: [
        { type: 'file_search', vector_store_ids: [vectorStoreId] }, // RAG resmi
        { type: 'web_search' } // bisa combo untuk aturan terbaru
      ],
      structured_output: {
        schema: {
          type: 'object',
          properties: {
            meaning: { type: 'string' },
            how_to_fill: { type: 'string' },
            example: { type: 'string' },
            badge: { type: 'string', enum: ['Official', 'Curated', 'AI Guidance'] },
            confirmation_ref: { type: 'string' },
            citations: { type: 'array' }
          }
        }
      }
    })
  } else {
    response = await meta.responses.create({
      model: 'muse-spark-1.3',
      previous_response_id: chain.currentId, // hemat token
      input: prompt,
      tools: [
        { type: 'file_search', vector_store_ids: [vectorStoreId] },
        { type: 'web_search' }
      ]
    })
  }

  await saveChainId(userId, tabId, portalKey, response.id, response.usage)
  return response.output // ada citations: [{ file: 'juknis-evisa.pdf', page: 45 }]
}
```

### Step 4: Hasil dengan Sitasi

```json
{
  "meaning": "Foto untuk e-Visa harus 3x4 latar putih",
  "how_to_fill": "Upload JPG max 2MB",
  "badge": "Official",
  "confirmation_ref": "juknis-evisa-2026.pdf",
  "citations": [
    { "file_id": "file_xyz", "filename": "juknis-evisa-2026.pdf", "page": 45, "chunk": "..." }
  ]
}
```

Badge jadi 🟢 Official karena ada sitasi file resmi, bukan AI ngarang.

## 5. File Search vs Web Search vs Supabase pgvector

| Aspek | file_search (Meta) | web_search (Meta) | Supabase pgvector (kamu) |
|-------|-------------------|-------------------|--------------------------|
| Sumber | PDF yang kamu upload | Internet publik | Data kamu sendiri |
| Cocok untuk | Juknis resmi 100 halaman yang tidak ada di Google | Aturan terbaru 2026 yang berubah | Data privat user (jangan untuk KTP) |
| Chunking | Auto oleh Meta (800 token) | Tidak ada | Manual oleh kamu |
| Sitasi | file + halaman | link website | chunk ID |
| Biaya | Storage vector store + token hemat | Token murah | Kamu bayar Supabase + embedding API |
| Privasi | File ada di server Meta (jangan upload PII) | Publik | Kamu kontrol |

Best practice Savvy:
- Juknis resmi publik -> file_search
- Aturan terbaru / berita -> web_search
- KTP/KK user -> JANGAN masuk vector store manapun, tetap di Vault lokal terenkripsi (WebCrypto AES-256)

## 6. Biaya & Token

- Storage: ~$0.10 / GB / bulan (100 GB = $10 / bulan untuk semua portal)
- Query: hemat token karena kamu tidak kirim PDF. Kirim cuma pertanyaan 20 token, bukan 20k token.
- Contoh: 1 pertanyaan tanpa file_search = kirim 20k token PDF + 20 token pertanyaan = 20.020 token. Dengan file_search = 20 token saja (file_search di belakang layar tidak hitung token input kamu, hanya output citations)

## 7. Guardrail untuk Hackathon

- [ ] 1 vector store per portal, bukan per user (hemat limit 100)
- [ ] Jangan upload file KTP/KK/NIK ke vector store (PII leak)
- [ ] Beri metadata status: Official vs Curated. Official baru masuk vector store setelah officer approve di Studio
- [ ] Cek size <512MB sebelum upload
- [ ] Simpan vector_store_id di Supabase table `vector_stores` untuk reuse
- [ ] Combo file_search + web_search untuk hasil terbaik: file_search untuk juknis, web_search untuk update terbaru
- [ ] Simpan citations untuk badge 🟢 Official

## 8. Dashboard Cek

Di dev.meta.ai -> Vector Stores:
- Lihat `4 / 100 used`
- Lihat status file: processing / ready / failed
- Hapus file draft yang tidak dipakai untuk hemat storage

---

## 9. Catatan Terkait Dokumen Lain

- PDF yang muat di konteks (mis. peraturan 40 halaman) sebenarnya cukup dengan satu agent ditambah (opsional) satu verifier; model menerima PDF sebagai input. File Search lebih bernilai untuk banyak sumber atau PDF yang sangat besar (lihat `multi_agents.md` bagian 3.4 dan 5.5 / `web_search_tool.md`).
- Label "resmi" ditentukan oleh kode (daftar domain tepercaya / status Official setelah officer approve), bukan oleh model.

---

File ini siap untuk `docs/file_search_vector_tool.md`.
