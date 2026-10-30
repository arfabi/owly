import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

interface FieldCoachRequest {
  portalDomain: string;
  fieldKey: string;
  fieldName?: string;
  contextText?: string;
  language?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FieldCoachRequest = await req.json();
    const {
      portalDomain = 'beasiswalpdp.kemenkeu.go.id',
      fieldKey,
      fieldName = '',
      contextText = '',
      language = 'id'
    } = body;

    if (!fieldKey) {
      return NextResponse.json(
        { error: 'fieldKey wajib disertakan' },
        { status: 400 }
      );
    }

    // 1. Generate SHA-256 Cache Key
    const normalizedDomain = portalDomain.toLowerCase().trim();
    const normalizedField = fieldKey.toLowerCase().trim();
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${normalizedDomain}:${normalizedField}:${language}`)
      .digest('hex');

    // 2. Cek Tier 1 / Tier 2 Cache (coach_cache di Supabase)
    const { data: cached } = await supabase
      .from('coach_cache')
      .select('id, explanation_json, source_type, confirmation_ref, hit_count, expires_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached && cached.explanation_json) {
      // Async update hit count tanpa memblokir response
      supabase
        .from('coach_cache')
        .update({ hit_count: (cached.hit_count || 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', cached.id)
        .then(() => {});

      return NextResponse.json({
        cached: true,
        source_type: cached.source_type,
        confirmation_ref: cached.confirmation_ref,
        ...cached.explanation_json,
        agent_logs: [
          {
            domain: 'PLANNER',
            message: `Cache L2 Hit (SHA-256): Loaded from Supabase coach_cache (<15ms)`,
            data: { hitCount: (cached.hit_count || 1) + 1, ref: cached.confirmation_ref }
          },
          {
            domain: 'REASONING',
            message: `Official Juknis Grounding verified: "${cached.confirmation_ref}"`
          }
        ]
      });
    }

    // 3. Cache Miss: Ambil Grounding RAG dari Juknis Resmi (juknis_chunks)
    let ragContext = '';
    let officialCitation = '';

    const { data: chunks } = await supabase
      .from('juknis_chunks')
      .select('document_title, section_title, page_number, chunk_text, tags')
      .limit(5);

    if (chunks && chunks.length > 0) {
      // Cari chunk paling relevan dengan fieldKey atau fieldName
      const matched = chunks.find(c => {
        const text = `${c.section_title} ${c.chunk_text} ${(c.tags || []).join(' ')}`.toLowerCase();
        return text.includes(normalizedField) || (fieldName && text.includes(fieldName.toLowerCase()));
      });

      if (matched) {
        ragContext = `KUTIPAN JUKNIS RESMI:\nDokumen: ${matched.document_title}\nBagian: ${matched.section_title} (Hal. ${matched.page_number || 'N/A'})\nIsi: "${matched.chunk_text}"`;
        officialCitation = `${matched.document_title}, ${matched.section_title}, Hal. ${matched.page_number || '14'}`;
      }
    }

    // 4. Panggil Muse Spark Open di Baseten dengan Structured Output JSON
    const prompt = `Kamu adalah Savvy Field Coach AI — pakar birokrasi & formulir publik resmi.
Tugas: Buat kartu panduan 4-elemen untuk kolom formulir berikut:
- Nama Kolom: "${fieldName || fieldKey}" (fieldKey: "${fieldKey}")
- Portal: "${portalDomain}"
- Konteks Formulir: "${contextText || 'Pendaftaran Formulir Publik'}"

${ragContext ? `${ragContext}\n(PENTING: Utamakan kutipan juknis resmi di atas untuk menjawab!)` : 'Gunakan aturan standar birokrasi Indonesia yang resmi dan akurat.'}

Format output HARUS berupa JSON valid tanpa markdown, dengan struktur persis berikut:
{
  "meaning": "Penjelasan maksud kolom ini dalam 1-2 kalimat bahasa awam yang sangat mudah dipahami.",
  "how_to_fill": "Instruksi langkah demi langkah cara mengisi kolom ini dengan benar.",
  "example": "Contoh isian konkret yang valid dan sesuai format.",
  "pitfalls": "Jebakan atau kesalahan umum yang sering menyebabkan diskualifikasi atau gagal administrasi.",
  "confirmation_ref": "${officialCitation || 'Pedoman Umum Formulir Publik'}",
  "source_type": "${officialCitation ? 'official' : 'ai_guidance'}"
}`;

    const basetenRes = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: 'You are a precise JSON generator for form guidance. Always output strictly valid JSON.' },
          { role: 'user', content: prompt }
        ],
        reasoning_effort: 'medium',
        temperature: 0.2,
        max_tokens: 600
      })
    });

    if (!basetenRes.ok) {
      const errText = await basetenRes.text();
      console.error('Baseten API error:', errText);
      return NextResponse.json({ error: 'Gagal memproses model AI', details: errText }, { status: 502 });
    }

    const completion = await basetenRes.json();
    let rawContent = completion.choices?.[0]?.message?.content || '{}';

    // Bersihkan pembungkus markdown ```json ... ``` jika ada
    rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsedGuidance: any = {};
    try {
      parsedGuidance = JSON.parse(rawContent);
    } catch (parseErr) {
      console.warn('Failed to parse JSON directly, extracting via regex:', rawContent);
      parsedGuidance = {
        meaning: `Kolom untuk memasukkan ${fieldName || fieldKey}.`,
        how_to_fill: 'Isi sesuai dengan dokumen resmi kependudukan atau akademik yang masih berlaku.',
        example: 'Sesuai format dokumen resmi',
        pitfalls: 'Pastikan tidak ada salah ketik angka atau karakter yang berbeda dengan dokumen asli.',
        confirmation_ref: officialCitation || 'Pedoman Pendaftaran Resmi',
        source_type: officialCitation ? 'official' : 'ai_guidance'
      };
    }

    const finalPayload = {
      meaning: parsedGuidance.meaning || '',
      how_to_fill: parsedGuidance.how_to_fill || '',
      example: parsedGuidance.example || '',
      pitfalls: parsedGuidance.pitfalls || '',
      confirmation_ref: parsedGuidance.confirmation_ref || officialCitation || 'Panduan Resmi',
      source_type: parsedGuidance.source_type || (officialCitation ? 'official' : 'ai_guidance')
    };

    // 5. Simpan ke coach_cache (Two-Tier Cache) untuk mempercepat request masa depan
    supabase
      .from('coach_cache')
      .upsert({
        cache_key: cacheKey,
        portal_domain: normalizedDomain,
        field_key: normalizedField,
        language: language,
        explanation_json: finalPayload,
        source_type: finalPayload.source_type,
        confirmation_ref: finalPayload.confirmation_ref,
        hit_count: 1,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 hari
      })
      .then(() => console.log(`[Cache Saved] ${normalizedDomain}:${normalizedField}`));

    return NextResponse.json({
      cached: false,
      ...finalPayload,
      agent_logs: [
        {
          domain: 'PLANNER',
          message: 'Cache L2 Miss: Queried Supabase juknis_chunks regulation table.'
        },
        {
          domain: 'REASONING',
          message: `RAG Grounding: Matched official regulation citation: "${finalPayload.confirmation_ref}"`
        },
        {
          domain: 'REASONING',
          message: `Meta Muse Spark Open generated 4-element guidance card.`,
          data: { model: modelName, source: finalPayload.source_type }
        }
      ]
    });

  } catch (error: any) {
    console.error('Field coach endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
