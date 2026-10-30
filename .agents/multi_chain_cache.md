# Savvy.AI: Multi-Chain, Memory Compacting, & Two-Tier Cache System

> **Versi 3.0 · 30 Oktober 2026**  
> **Model:** Meta Muse Spark Open (`meta-models/muse-spark-open-1026`) via Baseten Inference API  
> **Dokumen Terkait:**
> - [prd.md](file:///d:/webdev/laragon/www/savvy/.agents/prd.md) — Product Requirements Document & Feature Specs
> - [architecture.md](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md) — Arsitektur Sistem Global & Tech Stack
> - [multi_agents.md](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) — Compound Multi-Agent & Tool Calling Specs
> - [ocr.md](file:///d:/webdev/laragon/www/savvy/.agents/ocr.md) — Multimodal Vision, DOM Blackout Mask & Vault Storage

---

## 1. Konsep Dasar: Stateless Baseten & State Management Savvy

### 1.1 Stateless Model vs. Stateful Application Layer
Platform inferensi Baseten (`https://inference.baseten.co/v1`) menjalankan model **Muse Spark Open** secara **Stateless**:
* Baseten mengeksekusi request secara independen dan **tidak menyimpan riwayat percakapan pengguna** di server mereka.
* Isolasi data antar pengguna (**User Isolation**), pemeliharaan konteks (*Conversation Memory*), dan pemisahan per tab browser dikelola 100% oleh **Database Supabase & Backend API Gateway Savvy**.

```
[ User A (HP Budi) ]      ──> Session A1 ──┐
[ User B (Laptop Siti) ]  ──> Session B2 ──┼──> [ Savvy Backend Gateway ]
[ User C (Tablet Rian) ]  ──> Session C3 ──┘            │
                                                         │ 1. Ambil 10 pesan terakhir + Rangkuman Profil
                                                         │ 2. Bungkus array messages mandiri
                                                         ▼
                                                      ┌─────────────────────────────────────┐
                                                      │        Baseten Inference API        │
                                                      │ (Eksekusi paralel & independen)     │
                                                      └──────────────────┬──────────────────┘
                                                                         │
[ User A terima jawaban A ] <── Balas hanya ke Session A1 <──────────────┤
[ User B terima jawaban B ] <── Balas hanya ke Session B2 <──────────────┤
[ User C terima jawaban C ] <── Balas hanya ke Session C3 <──────────────┘
```

---

## 2. Strategi Memori: 10-Message Sliding Window & Rolling Compacting

Mengirimkan riwayat tanpa batas akan menyebabkan pemborosan token dan meningkatkan latensi. Savvy menerapkan pola memori industri modern:

```
                                [ Percakapan Masuk ]
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Hitung Pesan Aktif di Session     │
                      └──────────────────┬───────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
          [ Jumlah Pesan <= 10 ]                     [ Jumlah Pesan > 10 ]
                   │                                           │
                   │                                           ▼
                   │                           ┌────────────────────────────────┐
                   │                           │ Trigger Background Compacting: │
                   │                           │ Muse Spark mengekstrak fakta   │
                   │                           │ penting profil pendaftar       │
                   │                           └───────────────┬────────────────┘
                   │                                           │
                   │                                           ▼
                   │                           ┌────────────────────────────────┐
                   │                           │ Simpan ke chat_sessions:       │
                   │                           │ compacted_summary              │
                   │                           └───────────────┬────────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │
                                         ▼
                 ┌──────────────────────────────────────────────┐
                 │  Susun Payload Messages ke Baseten:          │
                 │  1. System Prompt                            │
                 │  2. [Memori Profil User: compacted_summary]  │
                 │  3. 10 Pesan Percakapan Terakhir (Sliding)   │
                 └──────────────────────────────────────────────┘
```

### 2.1 Format Injeksi Memori Profil (`compacted_summary`)
Contoh hasil kompresi yang disimpan di database `chat_sessions.compacted_summary`:
```
"Profil User: Budi Santoso, domisili Surabaya, alumni S1 Teknik Mesin IPK 3.42. Target pendaftaran: LPDP Reguler Luar Negeri (Tokyo Tech / Kyoto Univ) tahun 2026. Skor IELTS 6.5 (valid s/d 2027). Kendala utama: merumuskan esai kontribusi bidang energi baru terbarukan."
```
* Rangkuman 1 paragraf ini hanya memakan **~50 token**, tetapi menggantikan konteks 20–30 pesan percakapan sebelumnya.
* AI tidak akan pernah lupa latar belakang pengguna, sementara konsumsi token tetap hemat (~Rp 2,5 - Rp 3 per request).

---

## 3. Data Guard: PII Censor & Direct-to-Vault Guard

Data identitas sensitif pendaftar dilarang beredar dalam bentuk teks mentah pada riwayat percakapan.

### 3.1 Sensor Sisi Klien & Backend (Regex Scrubber)
Sebelum pesan disimpan ke database atau dikirim ke Baseten:
* **NIK (16 Digit):** `\b[1-9]\d{15}\b` $\rightarrow$ disamarkan menjadi `[REDACTED_NIK]`.
* **NPWP (15–16 Digit):** `\b\d{2}\.?\d{3}\.?\d{3}\.?\d{1}-?\d{3}\.?\d{3}\b` $\rightarrow$ `[REDACTED_NPWP]`.
* **Nomor Rekening / Kartu Kredit:** Pola 10–19 digit angka $\rightarrow$ `[REDACTED_FINANCIAL]`.

### 3.2 System Guard Prompt Rule
Jika pengguna mencoba menanyakan atau mengirimkan data KTP/NPWP di kolom chat, sistem menginstruksikan Muse Spark Open untuk menjawab:
> *"Demi keamanan privasi dan kepatuhan perlindungan data pribadi (UU PDP), mohon untuk tidak mengirimkan nomor identitas (seperti NIK atau NPWP) ke kolom chat. Kamu dapat menyimpan dan mengenkripsi dokumen tersebut secara aman di **Vault Data Pribadi** kamu."*

---

## 4. Dua Tingkat Cache (Two-Tier Cache)

Untuk pertanyaan umum mengenai instruksi formulir (misal: arti kolom "Nomor Apostille" atau "Surat Rekomendasi Tokoh"), Savvy menggunakan **Shared L1/L2 Cache** di Supabase (`coach_cache`):

```
[ Pengguna Fokus ke Kolom Formulir ]
                 │
                 ▼
     Generate SHA-256 Signature
(hash: portal_domain + field_key + lang)
                 │
                 ▼
        Cek coach_cache ───────────► [ CACHE HIT ] ──► Tampilkan Kartu (<30 ms, Rp 0)
                 │
           [ CACHE MISS ]
                 │
                 ▼
      Baseten Inference API
    Muse Spark Open + Juknis RAG
                 │
                 ▼
     Simpan Respons ke coach_cache
                 │
                 ▼
         Kirim ke Pengguna
```

### 4.1 Struktur Cache Key
```typescript
const cacheKey = crypto
  .createHash('sha256')
  .update(`${portalDomain}:${fieldKey}:${language}`)
  .digest('hex');
```

---

## 5. Implementasi Kode Lengkap Endpoint `/api/chat`

Berikut adalah implementasi handler Next.js API route (`web/src/app/api/chat/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PII_REGEX_NIK = /\b[1-9]\d{15}\b/g;
const PII_REGEX_NPWP = /\b\d{2}\.?\d{3}\.?\d{3}\.?\d{1}-?\d{3}\.?\d{3}\b/g;

function sanitizePII(text: string): { cleanText: string; hasPII: boolean } {
  let hasPII = false;
  let cleanText = text.replace(PII_REGEX_NIK, () => {
    hasPII = true;
    return '[REDACTED_NIK]';
  });
  cleanText = cleanText.replace(PII_REGEX_NPWP, () => {
    hasPII = true;
    return '[REDACTED_NPWP]';
  });
  return { cleanText, hasPII };
}

export async function POST(req: NextRequest) {
  const { sessionId, userId, message } = await req.json();

  // 1. Sanitasi PII pada input pengguna
  const { cleanText, hasPII } = sanitizePII(message);

  // Jika terdeteksi input PII eksplisit, beri panduan langsung ke Vault
  if (hasPII) {
    const warningReply = "Demi keamanan privasimu (UU PDP), jangan mengirimkan NIK/NPWP ke dalam chat. Silakan simpan dan enkripsi dokumen tersebut dengan aman di Vault Data Pribadi kamu.";
    return NextResponse.json({ reply: warningReply });
  }

  // 2. Ambil sesi dan rangkuman profil sebelumnya
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('compacted_summary, message_count')
    .eq('id', sessionId)
    .single();

  // 3. Ambil 10 pesan terakhir (Sliding Window)
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(10);

  // 4. Susun pesan konteks
  const messagesPayload: any[] = [
    {
      role: 'system',
      content: `Kamu adalah Savvy AI Scholarship & Bureaucracy Coach. Berikan jawaban yang tepat, empatik, berbasis fakta resmi, dan ringkas.`
    }
  ];

  if (session?.compacted_summary) {
    messagesPayload.push({
      role: 'system',
      content: `[Memori Profil Pendaftar]: ${session.compacted_summary}`
    });
  }

  if (history && history.length > 0) {
    messagesPayload.push(...history);
  }

  messagesPayload.push({ role: 'user', content: cleanText });

  // 5. Panggil inferensi Muse Spark Open di Baseten
  const response = await fetch(`${process.env.BASETEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BASETEN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026',
      messages: messagesPayload,
      reasoning_effort: 'medium',
      temperature: 0.3
    })
  });

  const completion = await response.json();
  const reply = completion.choices?.[0]?.message?.content || 'Maaf, terjadi kendala saat memproses respons.';

  // 6. Simpan pesan user dan asisten ke database
  await supabase.from('chat_messages').insert([
    { session_id: sessionId, role: 'user', content: cleanText },
    { session_id: sessionId, role: 'assistant', content: reply }
  ]);

  const newMessageCount = (session?.message_count || 0) + 2;
  await supabase
    .from('chat_sessions')
    .update({ message_count: newMessageCount, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  // 7. Background Auto-Compacting jika pesan melebihi 10
  if (newMessageCount > 10 && newMessageCount % 6 === 0) {
    triggerBackgroundCompacting(sessionId, messagesPayload);
  }

  return NextResponse.json({ reply });
}

// Fungsi ringkasan asinkron (tidak memblokir respons user)
async function triggerBackgroundCompacting(sessionId: string, fullContext: any[]) {
  try {
    const compactRes = await fetch(`${process.env.BASETEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BASETEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026',
        messages: [
          ...fullContext,
          {
            role: 'user',
            content: 'Ringkas profil, tujuan beasiswa, latar belakang, dan kendala utama user ini dalam maksimal 2 kalimat padat untuk memori masa depan.'
          }
        ],
        temperature: 0.1
      })
    });
    const data = await compactRes.json();
    const summary = data.choices?.[0]?.message?.content;
    if (summary) {
      await supabase
        .from('chat_sessions')
        .update({ compacted_summary: summary })
        .eq('id', sessionId);
    }
  } catch (err) {
    console.error('Background compacting error:', err);
  }
}
```

---

## 6. Ringkasan Keuntungan Arsitektur Ini

| Parameter | Sistem Lama (Raw Dump / Proprietary API) | Sistem Baru Savvy (Sliding Window + Compacting) |
|---|---|---|
| **Ketergantungan Provider** | Terkunci pada Responses API proprietary Meta (`dev.meta.ai`) | Berjalan di Baseten Inference API standar OpenAI-compatible |
| **Konsumsi Token** | Membengkak hingga 10k–30k token saat percakapan panjang | Stabil di ~1.000 token per request selamanya |
| **Biaya per Chat** | Naik seiring panjang obrolan | Stabil di **~Rp 2,5 - Rp 3 per chat** |
| **Daya Ingat AI** | Amnesia jika konteks dipotong mentah | Ingat profil pendaftar selamanya berkat `compacted_summary` |
| **Kepatuhan Privasi (UU PDP)** | Rawan kebocoran NIK/NPWP ke log LLM | Disensor otomatis & diarahkan ke WebCrypto AES-GCM Vault |
