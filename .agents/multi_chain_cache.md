# Savvy.AI: Multi Chain & Cache (Baseten Chat Completions API, Chain ID, Supabase, Cache) - Muse Spark 1.3

_Gabungan dokumen Baseten Chat Completions API & Chain ID (agar tidak tercampur antar user), manajemen token, skema Supabase, dan strategi cache (browser + database bersama). Siap untuk `docs/multi_chain_cache.md`._

> **Dokumen terkait:** `multi_agents.md` (arsitektur agent, sandbox, deterministic tools), `web_search_tool.md`, `file_search_vector_tool.md`.

---

## 1. Konsep Dasar: Chain ID itu milik Meta, mapping milik kita

### 1.1 Apa yang dibuat Meta vs apa yang kita simpan

```
[Baseten Inference API] -- bikin --> response_id (contoh: resp_abc123)

[Backend Kita]   -- simpan --> mapping user_id + tab_id -> response_id
```

- Meta yang bikin `resp_xxx`. Isinya: full context, `reasoning_tokens`, `tool_calls` (`web_search`, `code_execution`).
- Meta TIDAK tau itu punya user siapa. Dia cuma tau "ada chain resp_xxx".
- Kita yang harus simpan mapping-nya di Supabase + `chrome.storage.session`.

### 1.2 Analogi n8n

| n8n | Meta Spark Baseten Chat Completions API |
|---|---|
| Memory Node simpan di Postgres kamu | History disimpan di server Meta |
| Tiap run kamu kirim ulang full history (10jt token untuk 100 pesan) | Kamu cuma kirim `messages context history` (200k token untuk 100 pesan) |
| Hemat? Tidak, boros token | Hemat 50x lipat |

---

## 2. Alur Chain yang Benar (Tidak Tercampur)

```
Chat 1: kirim previous_id = null / kosong
       -> Meta bikin baru -> balik id: 223
Chat 2: kirim previous_id = 223
       -> Meta load chain 223 -> lanjutin -> balik id baru: 225
Chat 3: kirim previous_id = 225
       -> Meta load chain 225 (isinya 223+225) -> balik id: 229
Chat 4: kirim previous_id = 229 -> dst
```

**Aturan emas: selalu kirim ID TERAKHIR. Jangan pernah simpan di global var.**

```js
// SALAH - akan kecampur 10 user
let lastId = null
lastId = resp_223 // User A
// User B pakai lastId yang sama -> bocor PII!

// BENAR - per user per tab
await supabase.from('savvy_sessions').upsert({
  user_id: userA.id,
  tab_id: 'tab_evisa',
  current_response_id: resp_223
})
```

---

## 3. Skema Supabase

### 3.1 Tabel `savvy_sessions` (chain privat, butuh `messages context history`)

```sql
create table savvy_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tab_id text not null,                  -- contoh: 'tab_evisa_imigrasi_go_id' atau chrome tab
  portal_key text,                       -- 'evisa.imigrasi.go.id'
  current_response_id text not null,     -- resp_xxx dari Meta
  token_count int default 0,             -- akumulasi token chain ini
  message_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default now() + interval '48 hours', -- TTL Meta 2-7
  unique(user_id, tab_id)
);

create index idx_sessions_user_tab on savvy_sessions(user_id, tab_id);
create index idx_sessions_expires on savvy_sessions(expires_at);
```

### 3.2 Tabel `coach_cache` (cache bersama, generik)

Skema gabungan dari dua rancangan (rancangan Baseten Chat Completions API dan rancangan cache form). Semua kolom dari kedua versi dipertahankan; kolom yang artinya sama disatukan dan ditandai di komentar.

```sql
create table coach_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,        -- sha256 kunci (lihat 6.2); versi ringkas: hash(label + role + section)
  form_id text not null,                 -- normalizeFormId(url)
  field_id text not null,                -- ID field, bukan nama
  field_key text,                        -- 'nik', 'apostille'
  content_hash text not null,            -- sha256(title + description + options)
  prompt_hash text,
  prompt_ver text not null,              -- mis. 'coach-v3'
  response_text text,
  response_json jsonb,                   -- { meaning, how_to_fill, example, pitfalls } (payload)
  source_type text,                      -- 'official' | 'curated' | 'ai_guidance'
  confirmation_ref text,                 -- url juknis
  model_used text,                       -- 'muse-spark-1.3'
  reasoning_effort text,                 -- 'low' | 'medium'
  created_at timestamptz default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  hits int default 0,
  flagged boolean default false
);
create index on coach_cache (form_id);
```

> Catatan: pada rancangan awal, `response_text` berstatus `not null` dan `payload`/`response_json` berstatus `not null`; di sini keduanya dibuat boleh kosong supaya salah satu bentuk bisa dipakai. Sesuaikan jika ingin ketat.

### 3.3 Beda penggunaan

- `savvy_sessions` -> pakai **Baseten Chat Completions API + `messages context history`** (privat, ada PII).
- `coach_cache` -> pakai **Chat Completions stateless TANPA `messages context history`** (publik, bisa di-share 10 user).

---

## 4. Implementasi Node.js (Tanpa Build)

### 4.1 `getCurrentChainId` dan `saveChainId` (anti race condition)

```js
// lib/metaChain.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

/**
 * Ambil chain ID terakhir untuk user + tab. Kalau tidak ada atau expired, return null.
 * Aman untuk 10 user concurrent.
 */
export async function getCurrentChainId(userId, tabId) {
  const { data, error } = await supabase
    .from('savvy_sessions')
    .select('current_response_id, expires_at, token_count, message_count')
    .eq('user_id', userId)
    .eq('tab_id', tabId)
    .single()

  if (error || !data) return null

  // Cek TTL - kalau sudah expired 48 jam, anggap chain baru
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('savvy_sessions').delete().eq('user_id', userId).eq('tab_id', tabId)
    return null
  }

  // Guardrail: kalau sudah >50 pesan atau >80k token, reset dengan ringkasan
  if (data.message_count > 50 || data.token_count > 80000) {
    return { needsSummary: true, currentId: data.current_response_id }
  }

  return { needsSummary: false, currentId: data.current_response_id }
}

export async function saveChainId(userId, tabId, portalKey, newResponseId, tokenUsage) {
  await supabase.from('savvy_sessions').upsert({
    user_id: userId,
    tab_id: tabId,
    portal_key: portalKey,
    current_response_id: newResponseId,
    token_count: tokenUsage?.total_tokens || 0,
    message_count: 1, // increment via trigger atau di app
    updated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  }, { onConflict: 'user_id,tab_id' })
}
```

### 4.2 Prompt + `messages context history` (Field Coach)

```js
// lib/savvyAgent.js
import MetaAI from '@meta-ai/sdk'

const meta = new MetaAI({ apiKey: process.env.META_API_KEY })

export async function askFieldCoach({ userId, tabId, portalKey, fieldLabel, redactedContext }) {
  // 1. Ambil chain terakhir
  const chain = await getCurrentChainId(userId, tabId)

  // 2. Prompt yang sudah di-redact (jangan kirim NIK asli!)
  const prompt = `
Kamu adalah Field Coach Savvy.AI.
Portal: ${portalKey}
Field: ${fieldLabel}
Konteks: ${redactedContext} // sudah di-redact: NIK jadi [NIK_16]
Tugas: Jelaskan meaning, how_to_fill, example, common_pitfalls.
Output JSON: { meaning, how_to_fill, example, pitfalls, badge }
Badge: Official jika ada confirmation_ref, Curated jika dari cache, AI Guidance jika tidak ada keduanya.
`

  // 3. Panggil Meta
  let response
  if (!chain || !chain.currentId) {
    // Chain baru
    response = await meta.responses.create({
      model: 'muse-spark-1.3',
      reasoning_effort: 'low', // untuk Field Coach, hemat token
      input: prompt,
      tools: [{ type: 'web_search' }], // kalau butuh cari aturan terbaru
      structured_output: {
        schema: {
          type: 'object',
          properties: {
            meaning: { type: 'string' },
            how_to_fill: { type: 'string' },
            example: { type: 'string' },
            pitfalls: { type: 'array', items: { type: 'string' } },
            badge: { type: 'string' },
            confirmation_ref: { type: 'string' }
          }
        }
      }
    })
  } else {
    // Lanjutan chain - CUMA kirim messages context history + input baru
    response = await meta.responses.create({
      model: 'muse-spark-1.3',
      messages context history: chain.currentId, // <-- INI KUNCINYA (HEMAT TOKEN)
      input: prompt,
      reasoning_effort: 'low',
      tools: [{ type: 'web_search' }]
    })
  }

  // 4. Simpan ID baru
  await saveChainId(userId, tabId, portalKey, response.id, response.usage)
  return response.output
}
```

Versi dengan `file_search` (RAG juknis resmi) ada di `file_search_vector_tool.md`; detail `web_search` di `web_search_tool.md`.

### 4.3 Reset chain (>50 pesan atau >80k token): ringkas dulu

```js
if (token_count > 80000 || message_count > 50) {
  const summary = await meta.responses.create({
    model: 'muse-spark-1.3',
    messages context history: lastId,
    input: 'Ringkas progres audit Tahap 1-2 dalam 200 token untuk lanjut Tahap 3',
    reasoning_effort: 'low'
  })

  // Buat chain baru dengan summary sebagai input pertama
  const newChain = await meta.responses.create({
    model: 'muse-spark-1.3',
    input: `Konteks sebelumnya: ${summary.output}. Lanjutkan audit.`
  })

  await saveChainId(userId, tabId, portalKey, newChain.id, newChain.usage)
}
```

Untuk menyimpan file .js hasil `code_execution` agent, lihat `multi_agents.md` bagian 12.

---

## 5. Token & Biaya: 100 Pesan

**Chat Completions (stateless, kayak n8n default)**

- Tiap turn kirim ulang history
- 100 pesan x 2k token x rata-rata 50 pesan history = ~10 juta token input
- Biaya: 10jt * $1.25 = **$12.5 / user / sesi**

**Baseten Chat Completions API (stateful, yang kita pakai)**

- Tiap turn cuma kirim 2k baru
- 100 pesan = 200k token input
- Biaya: 200k * $1.25 = **$0.25 / user / sesi** (hemat 50x)

**Guardrail agar tetap murah:**

1. Field generik -> Chat Completions + `coach_cache` (tidak masuk chain)
2. Prefetch n s/d n+3 (Rule engine)
3. Reset chain kalau >50 pesan atau >80k token -> buat ringkasan dulu, lalu chain baru dengan ringkasan itu (kode di 4.3)

---

## 6. Strategi Cache

### 6.1 Cache di browser

| Lokasi | Bertahan sampai | Cocok untuk |
|---|---|---|
| `Map` di memori | Tab ditutup/refresh | Cache Field Coach per sesi (tercepat) |
| `sessionStorage` | Tab ditutup | Bertahan saat refresh (hanya string, sekitar 5 MB) |
| IndexedDB | Sampai dihapus | Data lebih besar, lintas sesi |
| `chrome.storage.session` | Browser ditutup | Berbagi data antara content script dan service worker |
| `chrome.storage.local` | Sampai dihapus | Skema form yang dipakai ulang |

Rekomendasi dua lapis: `Map` untuk cache Field Coach, `chrome.storage.session`/`local` untuk skema dan progres. Catatan Manifest V3: service worker bisa dimatikan browser kapan saja, jadi `Map` ditaruh di content script dan data penting di `chrome.storage`. Beri TTL dan batas ukuran.

### 6.2 Cache database bersama

Alur berlapis:

```
1. Memori / chrome.storage.session   (instan, per user)
2. Database cache server             (puluhan ms, dibagi semua user)
3. Panggil Muse Spark                (detik, berbiaya) lalu simpan ke 2 dan 1
```

Manfaat terbesar: penjelasan field dibuat sekali, dipakai semua pengguna form yang sama. Cache Form Analyzer juga sangat berharga (satu analisis per form).

Desain kunci:

```ts
const key = sha256([
  normalizeFormId(url),                                   // buang parameter prefill/pelacakan
  field.id,                                               // ID field, bukan nama
  sha256(field.title + field.description + JSON.stringify(field.options)),
  PROMPT_VERSION,                                         // mis. "coach-v3"
  "muse-spark-1.3",
].join("|"));
```

Jika ada Manual Researcher, sertakan juga hash `panduan_per_field` untuk field itu.

Skema tabel: lihat skema gabungan `coach_cache` di bagian 3.2 (memuat kolom `form_id`, `field_id`, `content_hash`, `prompt_ver`, `model`, `payload`, `hits`, `flagged`, dan seterusnya).

Cache-aside dengan penggabungan permintaan (cegah stampede):

```ts
const inflight = new Map<string, Promise<Coach>>();

async function getCoach(field: Field, formUrl: string): Promise<Coach> {
  const key = makeKey(formUrl, field);
  const hit = await db.getCoach(key);
  if (hit && !hit.flagged && hit.expiresAt > Date.now()) return hit.payload;

  if (inflight.has(key)) return inflight.get(key)!;
  const p = (async () => {
    const payload = await coachField(field);
    if (isValidCoach(payload)) await db.saveCoach(key, payload, ttl);
    return payload;
  })().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
```

Di server multi-instance gunakan lock Redis atau `INSERT ... ON CONFLICT DO NOTHING`.

### 6.3 Yang boleh dan tidak boleh di-cache bersama

| Boleh | Tidak boleh |
|---|---|
| Penjelasan generik field, skema form, pertanyaan pemandu essay (tanpa isi tulisan user) | Apa pun yang memakai jawaban user, hasil Consistency Checker, umpan balik essay |

### 6.4 Risiko cache bersama

- **Jawaban keliru menyebar ke semua user:** validasi struktur sebelum simpan, tombol "Penjelasan ini kurang tepat" (`flagged`), TTL, audit sampel form populer.
- **Cache poisoning:** judul pertanyaan bisa memuat instruksi tersembunyi. Perlakukan teks form sebagai data dan validasi keluaran.
- **Form privat:** isi pertanyaan form yang dibatasi login bisa bocor ke orang lain. Batasi cache bersama untuk form publik, atau cache per akun/organisasi.
- **Data pribadi di log:** log hanya ID form dan ID field.
- **Hak penyelenggara dan kebijakan privasi** perlu dipertimbangkan jika Savvy.AI dipakai luas.

### 6.5 Privasi cache

| Data | Simpan? |
|---|---|
| Skema form, penjelasan Field Coach tanpa data user | Boleh, termasuk lintas sesi |
| Jawaban user (NIK, alamat, HP) | Sebaiknya tidak persisten; cukup di memori selama sesi |
| Draf non-sensitif untuk melanjutkan nanti | Hanya dengan persetujuan jelas, idealnya terenkripsi, dengan tombol hapus |

`localStorage`, `sessionStorage`, dan IndexedDB tidak terenkripsi. Waspadai komputer bersama.

### 6.6 Prefetch menurut jenis form

- Form statis: prefetch tiga field ke depan.
- Wizard: prefetch hanya field di langkah yang sudah terlihat.
- Cache DB bersama sangat membantu: pengguna berikutnya langsung mendapat penjelasan langkah yang pernah dilalui. Kunci memakai hash isi field dan langkah, bukan hanya URL.

Prefetch Field Coach (n sampai n+3, simpan *promise* bukan hanya hasil, kode `ensureCoach`) dijelaskan di `multi_agents.md` bagian 5.2.

---

## 7. Prompt Template yang Aman

```
System: Kamu Field Coach Savvy.AI. Jangan tebak. Kalau tidak yakin, badge = AI Guidance.
User: Portal={{portalKey}}, Field={{fieldLabel}}, Konteks={{redactedDOM}}

Tools yang boleh dipakai: web_search (untuk cari aturan resmi .go.id), file_search
Dilarang: menyentuh .value asli user, menebak NIK.

Output wajib JSON sesuai schema field_contents.
```

---

## 8. Checklist Supaya Tidak Tercampur Antar User

- [ ] Jangan pernah pakai global var `lastResponseId`
- [ ] Selalu `getCurrentChainId(userId, tabId)` dari Supabase
- [ ] Chain ID simpan per user per tab di `savvy_sessions`
- [ ] Cache bersama (`coach_cache`) pakai Chat Completions stateless, BUKAN Baseten Chat Completions API
- [ ] Single-flight (`inflight`) hanya untuk Chat Completions
- [ ] Redact PII sebelum kirim prompt (NIK, HP, alamat jadi [REDACTED])
- [ ] TTL 48 jam: kalau expired, mulai chain baru; reset chain kalau >50 pesan / 80k token
- [ ] Simpan `source_response_id` di setiap rule untuk audit trail

---

Catatan penyuntingan: beberapa baris di sumber asli terpotong dan dilengkapi secara wajar: akhir kalimat `Badge: ... AI Guidance`, akhir `.eq('tab_id', tabId)` pada penghapusan sesi expired, dan butir `Tools yang boleh dipakai` (dilengkapi `file_search`) serta baris `User:` di template prompt. Mohon dicek ulang.
